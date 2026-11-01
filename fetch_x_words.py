"""Collect the public X榜单 topic ranking without executing upstream scripts."""
import argparse,json,re,urllib.request
from html.parser import HTMLParser
from datetime import datetime,timezone
from pathlib import Path
SOURCE='https://xbangdan.com/words/'
class Node:
 def __init__(self,tag='',attrs=None):self.tag=tag;self.attrs=attrs or {};self.children=[]
 def text(self):return ' '.join(''.join(c.text() if isinstance(c,Node) else c for c in self.children).split())
 def find(self,cls):
  result=[]
  for c in self.children:
   if isinstance(c,Node):
    if cls in c.attrs.get('class','').split():result.append(c)
    result.extend(c.find(cls))
  return result
class Tree(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  node=Node(tag,dict(attrs));self.stack[-1].children.append(node)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','rect','path','circle','line','use'}:self.stack.append(node)
 def handle_startendtag(self,tag,attrs):self.stack[-1].children.append(Node(tag,dict(attrs)))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(data)
def parse_page(html):
 tree=Tree();tree.feed(html);items=[];seen=set()
 for row in tree.root.find('hwe-row'):
  def text(cls):
   nodes=row.find(cls);return nodes[0].text() if nodes else ''
  title=text('hwe-t');rank=text('hwe-bd');links=row.find('hwe-sam');url=links[0].attrs.get('href','') if links else ''
  if not title or title in seen or not rank.isdigit() or not re.fullmatch(r'https://x\.com/(?:i|[A-Za-z0-9_]{1,15})/status/\d{1,25}',url):continue
  seen.add(title);stats=row.find('hwe-r');views=''
  if stats:
   views=next((n.text() for n in stats[0].children if isinstance(n,Node) and n.tag=='b'),'')
  items.append({'rank':int(rank),'title':title,'summary':text('hwe-s'),'category':row.attrs.get('data-c','other'),'categoryLabel':text('hwe-wm') or '其他','trend':row.attrs.get('data-s',''),'viewsText':views,'meta':text('hwe-m'),'url':url})
 if not items:raise ValueError('No valid topic entries')
 items.sort(key=lambda r:r['rank']);categories=list({r['category']:r['categoryLabel'] for r in items}.items());match=re.search(r'页面更新于\s*([\d-]+\s+[\d:]+)',html)
 return {'source':'X榜单话题榜','sourceUrl':SOURCE,'fetchedAt':datetime.now(timezone.utc).isoformat(),'sourceUpdatedText':match.group(1) if match else '', 'categories':[{'key':k,'label':v} for k,v in categories],'items':items[:100]}
def fetch_browser():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as p:
  b=p.chromium.launch(headless=False)
  try:
   page=b.new_page();page.goto(SOURCE,wait_until='domcontentloaded',timeout=45000);return parse_page(page.content())
  finally:b.close()
def fetch():
 try:
  req=urllib.request.Request(SOURCE,headers={'User-Agent':'Mozilla/5.0','Accept':'text/html'})
  with urllib.request.urlopen(req,timeout=25) as r:return parse_page(r.read(8_000_000).decode('utf-8'))
 except Exception as error:print(f'X_WORDS_BROWSER_FALLBACK {type(error).__name__}');return fetch_browser()
def update(out):
 try:data=fetch()
 except Exception as error:
  if out.exists():
   try:
    old=json.loads(out.read_text(encoding='utf-8-sig'))
    if not old.get('items') or not old.get('fetchedAt'):raise ValueError('Invalid cache')
   except (ValueError,OSError):raise RuntimeError('No valid topic cache') from error
   print(f'X_WORDS_PRESERVED {type(error).__name__}: {error}');return False
  raise
 out.parent.mkdir(parents=True,exist_ok=True);tmp=out.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(out);print(f'X_WORDS_OK items={len(data["items"])} categories={len(data["categories"])}');return True
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',default='public/x-words.json');update(Path(p.parse_args().output))
if __name__=='__main__':main()
