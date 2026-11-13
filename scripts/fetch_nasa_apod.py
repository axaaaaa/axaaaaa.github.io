"""Fetch NASA's latest APOD metadata without downloading the image."""
import argparse
import json
import re
from datetime import date
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from fetch_extra_hotspots import translate_title

FEED = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1'


def clean(value):
    return ' '.join(unescape(re.sub(r'<[^>]+>', ' ', str(value or ''))).split())


def nasa_url(value, hosts):
    parts = urlsplit(value or '')
    return value if parts.scheme == 'https' and parts.netloc in hosts else ''


def normalize(entry):
    day = date.fromisoformat(entry['date']).isoformat()
    title = clean(entry['title'])
    source = nasa_url(entry.get('permalink'), {'science.nasa.gov', 'apod.nasa.gov'})
    if not title or not source:
        raise ValueError('missing APOD title or NASA permalink')
    image = ''
    if entry.get('media_type') == 'image':
        for field in ('url', 'hdurl'):
            image = nasa_url(entry.get(field), {'assets.science.nasa.gov'})
            if image:
                break
    return {'date': day, 'title': title, 'description': clean(entry.get('alt')),
            'credit': clean(entry.get('credit') or entry.get('copyright')),
            'source': source, 'image': image}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=Path('public/nasa-apod.json'))
    out = parser.parse_args().output
    previous = {}
    try:
        previous = json.loads(out.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        pass
    try:
        request = Request(FEED, headers={'User-Agent': 'NavigationSite APOD collector', 'Accept': 'application/json'})
        with urlopen(request, timeout=15) as response:
            item = normalize(json.load(response)[0])
        if previous.get('date', '') > item['date']:
            raise ValueError('NASA feed returned an older date')
        for field in ('title', 'description'):
            translated = field + 'Zh'
            if item[field] == previous.get(field) and previous.get(translated):
                item[translated] = previous[translated]
            elif item[field]:
                try:
                    item[translated] = translate_title(item[field])
                except Exception as exc:
                    print(f'APOD_TRANSLATION_PENDING {type(exc).__name__}')
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_suffix('.tmp')
        tmp.write_text(json.dumps(item, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        tmp.replace(out)
        print('APOD_OK ' + item['date'])
        return 0
    except (OSError, ValueError, TypeError, KeyError, IndexError) as exc:
        print(f'APOD_PRESERVED {exc}' if previous else f'APOD_UNAVAILABLE {exc}')
        return 0 if previous else 1


if __name__ == '__main__':
    raise SystemExit(main())
