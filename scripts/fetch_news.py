"""Fetch RSS/Atom headlines without third-party dependencies. Preserve last good data."""
import argparse
import concurrent.futures
import email.utils
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from source_images import attach_covers,cache_source_covers

SOURCES = [
    ('IT之家', 'https://www.ithome.com/rss/', '科技动态'),
    ('Hugging Face', 'https://huggingface.co/blog/feed.xml', 'AI 前沿'),
]

def parse_feed(xml, source, category):
    root = ET.fromstring(xml)
    atom = {'a': 'http://www.w3.org/2005/Atom'}
    entries = root.findall('.//item') or root.findall('a:entry', atom)
    result = []
    for entry in entries:
        title = entry.findtext('title') or entry.findtext('a:title', namespaces=atom) or ''
        url = entry.findtext('link')
        if not url:
            links = entry.findall('a:link', atom)
            url = next((link.get('href') for link in links if link.get('rel', 'alternate') == 'alternate'), '')
        raw = entry.findtext('pubDate') or entry.findtext('a:published', namespaces=atom) or entry.findtext('a:updated', namespaces=atom)
        try:
            try:
                date = email.utils.parsedate_to_datetime(raw)
            except (ValueError, TypeError):
                date = datetime.fromisoformat(raw.replace('Z', '+00:00'))
            if date.tzinfo is None:
                date = date.replace(tzinfo=timezone.utc)
        except (ValueError, TypeError, AttributeError):
            continue
        if not re.match(r'^https?://', url or '') or not title.strip():
            continue
        result.append({'title': re.sub(r'\s+', ' ', title).strip(), 'url': url, 'source': source, 'category': category, 'publishedAt': date.astimezone(timezone.utc).isoformat()})
    return result[:16]

def fetch(source):
    name, url, category = source
    request = urllib.request.Request(url, headers={'User-Agent': 'NavigationNews/1.0 RSS Reader'})
    with urllib.request.urlopen(request, timeout=20) as response:
        body=response.read(2_000_000)
        key='ithome' if name=='IT之家' else 'huggingface'
        return cache_source_covers(key,attach_covers(key,parse_feed(body,name,category),body,url))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='public/news.json')
    args = parser.parse_args()
    output = Path(args.output)
    previous = {}
    if output.exists():
        try:
            previous = json.loads(output.read_text(encoding='utf-8-sig'))
        except (ValueError, OSError):
            pass
    items, successful = [], set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(fetch, source): source[0] for source in SOURCES}
        for future in concurrent.futures.as_completed(futures):
            try:
                rows = future.result()
                if rows:
                    items.extend(rows)
                    successful.add(futures[future])
            except Exception as error:
                print(f'SOURCE_ERROR {futures[future]}: {error}')
    if not successful:
        if previous.get('items'):
            print('PRESERVED previous news; all sources unavailable')
            return
        raise SystemExit('No feeds available and no previous news')
    # Keep the last successful headlines of sources that temporarily failed.
    items.extend(item for item in previous.get('items', []) if item.get('source') not in successful)
    seen, unique = set(), []
    for item in sorted(items, key=lambda item: item['publishedAt'], reverse=True):
        key = item['url'].split('#')[0]
        title_key = re.sub(r'\W+', '', item['title']).casefold()
        if key not in seen and title_key not in seen:
            seen.update((key, title_key))
            unique.append(item)
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix('.tmp')
    temp.write_text(json.dumps({'updatedAt': datetime.now(timezone.utc).isoformat(), 'items': unique[:24]}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(output)
    print(f'NEWS_OK items={len(unique[:24])} sources={len(successful)}')

if __name__ == '__main__':
    main()
