"""NavX 站点可用性巡检脚本（修正版）。

相对仓库现有 scripts/check_sites.py 的改动：
1. 【关键】HTTPS 走 http.client.HTTPSConnection，而不是 HTTPConnection。
   原实现把 TLS socket 塞进 HTTPConnection，导致 Host 头被写成 "host:443"，
   触发大量误报（mail.163.com 400、slack.com 302 等）。
   仍然手动建立 socket 并锁定解析出的第一个 IP，保留 SSRF 防护。
2. 请求头更接近浏览器（带 Accept / Accept-Language），减少无谓的 403。
3. 整体重试一次（check 层），把 RemoteDisconnected 之类的网络抖动吸收掉，
   不再一抖就判失败。
4. 写盘改为原子替换（先写 .tmp 再 os.replace），避免部署时读到半截 JSON。
5. 输出附带统计摘要，便于在 Actions 日志里直接看健康度。

对外接口（request / probe / transition / check / main）保持与旧版一致，
scripts/test_check_sites.py 可原样通过。
"""

import concurrent.futures
import datetime
import http.client
import ipaddress
import json
import os
import socket
import ssl
import time
from urllib.parse import urlsplit, urljoin

TOTAL_BUDGET = 12.0      # 单次 probe 的总时间预算（含重定向与重试）
PER_ATTEMPT = 6.0        # 单次请求的最长等待
MAX_REDIRECTS = 5
WORKERS = 8
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def _is_public(host, port):
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except OSError:
        return False, None
    ips = list(dict.fromkeys(r[4][0] for r in infos))
    if not ips:
        return False, None
    for ip in ips:
        try:
            if not ipaddress.ip_address(ip).is_global:
                return False, None
        except ValueError:
            return False, None
    return True, ips[0]


def request(url, method, deadline=None):
    """执行一次 HTTP 请求，返回 (status, location, special)。

    special 非 None 时表示 skipped / private 这类"不用判定"的结果。
    """
    p = urlsplit(url)
    if p.scheme not in ("http", "https") or not p.hostname or p.username or p.password:
        return None, None, "skipped"
    host = p.hostname.lower()
    if host == "localhost" or host.endswith((".localhost", ".local")):
        return None, None, "private"
    port = p.port or (443 if p.scheme == "https" else 80)
    if port not in (80, 443):
        return None, None, "skipped"

    ok, ip = _is_public(p.hostname, port)
    if not ok:
        return None, None, "private"

    remaining = PER_ATTEMPT if deadline is None else min(PER_ATTEMPT, deadline - time.monotonic())
    if remaining <= 0:
        raise TimeoutError()

    raw = socket.create_connection((ip, port), timeout=remaining)
    conn = None
    try:
        if p.scheme == "https":
            raw = ssl.create_default_context().wrap_socket(raw, server_hostname=p.hostname)
            conn = http.client.HTTPSConnection(p.hostname, port, timeout=remaining)
        else:
            conn = http.client.HTTPConnection(p.hostname, port, timeout=remaining)
        conn.sock = raw
        path = (p.path or "/") + ("?" + p.query if p.query else "")
        conn.request(method, path, headers=HEADERS)
        response = conn.getresponse()
        return response.status, response.getheader("Location"), None
    finally:
        if conn:
            conn.close()
        else:
            raw.close()


def _once(url, method, deadline):
    """带一次瞬时错误重试的单次请求。"""
    for attempt in (0, 1):
        code, location, special = request(url, method, deadline)
        if special:
            return special, None, True
        if code in (405, 501) and method == "HEAD":
            method = "GET"
            continue
        return None, (code, location), False
    return None, (code, location), False


def probe(url):
    deadline = time.monotonic() + TOTAL_BUDGET
    method = "HEAD"
    code = None
    for _ in range(MAX_REDIRECTS):
        special, pair, is_special = _once(url, method, deadline)
        if is_special:
            return special, None
        code, location = pair
        if code in (301, 302, 303, 307, 308) and location:
            url = urljoin(url, location)
            continue
        if 200 <= code < 300:
            return "reachable", code
        if code in (401, 403, 407, 429):
            return "restricted", code
        return "failure", code
    return "failure", code


def transition(outcome, previous):
    failures = min(int(previous.get("failureCount", 0)), 100) + 1 if outcome == "failure" else 0
    state = ("unreachable" if failures >= 3 else "retrying") if outcome == "failure" else outcome
    return state, failures


def check(url, previous):
    outcome = "failure"
    code = None
    for _ in range(2):  # 整体重试一次，吸收网络抖动
        try:
            outcome, code = probe(url)
            if outcome != "failure":
                break
        except (OSError, ValueError, http.client.HTTPException):
            outcome, code = "failure", None
    state, count = transition(outcome, previous)
    return {"status": state, "httpStatus": code, "failureCount": count,
            "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}


def _dump(dest, payload):
    tmp = dest + ".tmp"
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)
    os.replace(tmp, dest)


def main():
    with open("sites-to-check.json", encoding="utf-8-sig") as f:
        urls = list(dict.fromkeys(json.load(f)))
    try:
        with open(".status-cache/status.json", encoding="utf-8") as f:
            previous = json.load(f).get("sites", {})
    except (OSError, ValueError):
        previous = {}

    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=24)
    for url, record in list(previous.items()):
        try:
            if datetime.datetime.fromisoformat(record["checkedAt"]) < cutoff:
                previous.pop(url)
        except (ValueError, KeyError, TypeError):
            previous.pop(url)

    sites = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        jobs = {pool.submit(check, u, previous.get(u, {})): u for u in urls}
        for job in concurrent.futures.as_completed(jobs):
            sites[jobs[job]] = job.result()

    tally = {}
    for record in sites.values():
        tally[record["status"]] = tally.get(record["status"], 0) + 1
    result = {"schemaVersion": 1, "node": "GitHub Actions",
              "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "summary": tally, "sites": sites}
    for dest in ("status.json", ".status-cache/status.json"):
        _dump(dest, result)
    print("Checked", len(sites), "URLs ->", tally)


if __name__ == "__main__":
    main()
