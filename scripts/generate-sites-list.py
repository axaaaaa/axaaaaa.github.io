#!/usr/bin/env python3
"""从 src/nav-data.js 生成 github-status-package/sites-to-check.json。

导航数据改完之后跑一下这个脚本，巡检清单就会自动跟上，
不用再手工维护 1400 多条 URL。

用法：
    python scripts/generate-sites-list.py            # 生成并覆盖
    python scripts/generate-sites-list.py --check    # 只校验是否过期，不写文件
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAV_DATA = os.path.join(ROOT, "src", "nav-data.js")
DATA_DIR = os.path.join(ROOT, "src", "data")
OUTPUT = os.path.join(ROOT, "github-status-package", "sites-to-check.json")

IMPORT_RE = re.compile(r"""import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\./data/([\w.-]+?)(\.js)?['"]""")
URL_RE = re.compile(r"""url['"]?\s*:\s*['"]([^'"]+)['"]""")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def collect():
    """按 nav-data.js 的 import 顺序收集所有 url，保持顺序并去重。"""
    order = IMPORT_RE.findall(read(NAV_DATA))  # [(name, file, ext), ...]
    if not order:
        raise SystemExit("未能从 src/nav-data.js 解析出 import 列表，请检查文件格式")

    urls, seen, files = [], set(), []
    for name, module, ext in order:
        path = os.path.join(DATA_DIR, module + (ext or ".js"))
        if not os.path.exists(path):
            print(f"  ! 跳过缺失的数据文件: {path}", file=sys.stderr)
            continue
        files.append(os.path.basename(path))
        for url in URL_RE.findall(read(path)):
            url = url.strip()
            if url and url not in seen:
                seen.add(url)
                urls.append(url)
    return urls, files


def main():
    urls, files = collect()
    check_only = "--check" in sys.argv

    if check_only:
        if not os.path.exists(OUTPUT):
            print(f"巡检清单不存在: {OUTPUT}")
            return 2
        current = json.loads(read(OUTPUT))
        missing = [u for u in urls if u not in set(current)]
        extra = [u for u in current if u not in set(urls)]
        if missing or extra:
            print(f"巡检清单已过期：待新增 {len(missing)} 条，待移除 {len(extra)} 条")
            for u in missing[:20]:
                print("   + " + u)
            for u in extra[:20]:
                print("   - " + u)
            return 1
        print(f"巡检清单是最新的（{len(urls)} 条）")
        return 0

    payload = "[\n" + ",\n".join("  " + json.dumps(u, ensure_ascii=False) for u in urls) + "\n]\n"
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(payload)
    print(f"已写入 {OUTPUT}")
    print(f"  数据文件: {', '.join(files)}")
    print(f"  URL 总数: {len(urls)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
