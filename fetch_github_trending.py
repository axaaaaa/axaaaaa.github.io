"""Collect the three GitHub Trending periods; keep each last successful period."""
import argparse
import concurrent.futures
import json
import re
import urllib.request
from html.parser import HTMLParser
from datetime import datetime, timezone
from pathlib import Path
from source_images import attach_covers,cache_source_covers

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def find(self, predicate):
        for child in self.children:
            if isinstance(child, Node):
                if predicate(child):
                    yield child
                yield from child.find(predicate)
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(node)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break
    def handle_data(self, data):
        self.stack[-1].children.append(data)

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def parse_trending(html):
    tree = Tree()
    tree.feed(html)
    result, seen = [], set()
    for article in tree.root.find(lambda n: n.tag == 'article' and 'Box-row' in n.attrs.get('class', '').split()):
        headings = list(article.find(lambda n: n.tag == 'h2'))
        if not headings:
            continue
        links = list(headings[0].find(lambda n: n.tag == 'a'))
        if not links:
            continue
        href = links[0].attrs.get('href', '')
        if not re.fullmatch(r'/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', href) or href in seen:
            continue
        seen.add(href)
        def first(predicate):
            return next(article.find(predicate), Node())
        description = clean(first(lambda n: n.tag == 'p').text())
        language = clean(first(lambda n: n.attrs.get('itemprop') == 'programmingLanguage').text())
        stars = clean(first(lambda n: n.tag == 'a' and n.attrs.get('href') == href + '/stargazers').text())
        gain = clean(first(lambda n: n.tag == 'span' and 'float-sm-right' in n.attrs.get('class', '').split()).text())
        result.append({'name': href[1:], 'url': 'https://github.com' + href, 'description': description, 'language': language, 'stars': stars, 'growth': gain})
    if not result:
        raise ValueError('Trending page contained no repository rows')
    return result[:24]

def fetch(period):
    req = urllib.request.Request('https://github.com/trending?since=' + period, headers={'User-Agent':'NavigationTrending/1.0', 'Accept':'text/html'})
    with urllib.request.urlopen(req, timeout=30) as response:
        body=response.read(4_000_000)
        return cache_source_covers('github',attach_covers('github',parse_trending(body.decode('utf-8')),body,'https://github.com/'))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='public/github-trending.json')
    args = parser.parse_args()
    output = Path(args.output)
    data = {'periods': {}}
    if output.exists():
        try:
            data = json.loads(output.read_text(encoding='utf-8-sig'))
        except (ValueError, OSError):
            pass
    updated = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(fetch, period): period for period in ['daily','weekly','monthly']}
        for future in concurrent.futures.as_completed(futures):
            period = futures[future]
            try:
                items = future.result()
                data['periods'][period] = {'updatedAt': datetime.now(timezone.utc).isoformat(), 'items': items}
                updated += 1
                print(f'TRENDING_OK {period} items={len(items)}')
            except Exception as error:
                print(f'TRENDING_PRESERVED {period}: {error}')
    if updated:
        output.parent.mkdir(parents=True, exist_ok=True)
        temp = output.with_suffix('.tmp')
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temp.replace(output)
    elif not any(p.get('items') for p in data.get('periods', {}).values()):
        raise SystemExit('No trending data or cached periods available')

if __name__ == '__main__':
    main()
