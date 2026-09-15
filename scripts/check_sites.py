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

def request(url, method, deadline):
    p = urlsplit(url)
    if p.scheme not in ("http", "https") or not p.hostname or p.username or p.password:
        return None, None, "skipped"
    if p.hostname.lower() == "localhost" or p.hostname.lower().endswith((".localhost", ".local")):
        return None, None, "private"
    port = p.port or (443 if p.scheme == "https" else 80)
    if port not in (80, 443):
        return None, None, "skipped"
    ips = list(dict.fromkeys(r[4][0] for r in socket.getaddrinfo(p.hostname, port, type=socket.SOCK_STREAM)))
    if not ips or any(not ipaddress.ip_address(ip).is_global for ip in ips):
        return None, None, "private"
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError()
    raw = socket.create_connection((ips[0], port), timeout=remaining)
    conn = None
    try:
        if p.scheme == "https":
            raw = ssl.create_default_context().wrap_socket(raw, server_hostname=p.hostname)
        conn = http.client.HTTPConnection(p.hostname, port, timeout=remaining)
        conn.sock = raw
        path = (p.path or "/") + ("?" + p.query if p.query else "")
        conn.request(method, path, headers={"User-Agent": "AI-NAV-Link-Checker/1.0", "Connection": "close"})
        response = conn.getresponse()
        return response.status, response.getheader("Location"), None
    finally:
        if conn:
            conn.close()
        else:
            raw.close()

def probe(url):
    deadline = time.monotonic() + 8
    for _ in range(5):
        code, location, special = request(url, "HEAD", deadline)
        if special:
            return special, code
        if code in (405, 501):
            code, location, special = request(url, "GET", deadline)
            if special:
                return special, code
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
    try:
        outcome, code = probe(url)
    except (OSError, ValueError, http.client.HTTPException):
        outcome, code = "failure", None
    state, count = transition(outcome, previous)
    return {"status": state, "httpStatus": code, "failureCount": count,
            "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}

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
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        jobs = {pool.submit(check, u, previous.get(u, {})): u for u in urls}
        for job in concurrent.futures.as_completed(jobs):
            sites[jobs[job]] = job.result()
    result = {"schemaVersion": 1, "node": "GitHub Actions",
              "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "sites": sites}
    for dest in ("status.json", ".status-cache/status.json"):
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False)
    print("Checked", len(sites), "URLs")

if __name__ == "__main__":
    main()

