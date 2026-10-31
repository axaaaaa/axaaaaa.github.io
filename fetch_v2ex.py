"""Fetch official V2EX hot topics and preserve last successful data."""
import argparse
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from source_images import CoverParser,cache_source_covers

URL = 'https://www.v2ex.com/api/topics/hot.json'

def normalize(rows):
    if not isinstance(rows, list):
        raise ValueError('Invalid topic list')
    items, seen = [], set()
    for row in rows:
        if not isinstance(row, dict):
            continue
        topic_id = row.get('id')
        title = row.get('title')
        if not isinstance(topic_id, int) or isinstance(topic_id, bool) or topic_id <= 0 or topic_id in seen or not isinstance(title, str) or not title.strip():
            continue
        seen.add(topic_id)
        try:
            created = datetime.fromtimestamp(row.get('created', 0), timezone.utc).isoformat()
        except (ValueError, TypeError, OverflowError, OSError):
            created = ''
        node = row.get('node') if isinstance(row.get('node'), dict) else {}
        member = row.get('member') if isinstance(row.get('member'), dict) else {}
        replies = row.get('replies', 0)
        items.append({'id': topic_id, 'title': title.strip(), 'url': f'https://www.v2ex.com/t/{topic_id}', 'node': str(node.get('title', '')), 'author': str(member.get('username', '')), 'replies': replies if isinstance(replies, int) and replies >= 0 else 0, 'createdAt': created})
        parser=CoverParser('v2ex',items[-1]['url']);parser.feed('<article>'+str(row.get('content_rendered') or '')+'</article>')
        if parser.content_cover:items[-1]['cover']=parser.content_cover
    if not items:
        raise ValueError('No valid hot topics')
    return items[:24]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='public/v2ex-hot.json')
    output = Path(parser.parse_args().output)
    try:
        request = urllib.request.Request(URL, headers={'User-Agent': 'NavigationHotTopics/1.0', 'Accept': 'application/json'})
        with urllib.request.urlopen(request, timeout=25) as response:
            items = cache_source_covers('v2ex',normalize(json.loads(response.read(2_000_000))))
        data = {'updatedAt': datetime.now(timezone.utc).isoformat(), 'items': items}
        output.parent.mkdir(parents=True, exist_ok=True)
        temp = output.with_suffix('.tmp')
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        temp.replace(output)
        print(f'V2EX_OK items={len(items)}')
    except Exception as error:
        if output.exists():
            try:
                previous = json.loads(output.read_text(encoding='utf-8-sig'))
                if previous.get('items') and previous.get('updatedAt'):
                    print(f'V2EX_PRESERVED previous data: {error}')
                    return
            except (ValueError, OSError):
                pass
        raise SystemExit(f'V2EX_FETCH_FAILED {error}')

if __name__ == '__main__':
    main()
