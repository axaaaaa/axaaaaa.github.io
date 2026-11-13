"""Snapshot X榜单 long-form article rankings, with source region/age metadata."""
import argparse,json,math,re,urllib.request
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urljoin,urlparse
from fetch_x_words import Tree,Node
SOURCE='https://xbangdan.com/articles/'
def number(text):
 m=re.fullmatch(r'([\d,.]+)\s*([万亿]?)',text.strip())
 if not m:raise ValueError('Invalid count')
 value=float(m[1].replace(',',''))*{'':1,'万':10000,'亿':100000000}[m[2]]
 if not math.isfinite(value) or value<0:raise ValueError('Invalid count')
 return round(value)
def parse_page(html):
 tree=Tree();tree.feed(html);items=[];seen=set()
 for row in tree.root.find('ac'):
  def text(cls):
   nodes=row.find(cls);return nodes[0].text() if nodes else ''
  url=row.attrs.get('href','');match=re.fullmatch(r'https://x\.com/([A-Za-z0-9_]{1,15})/status/(\d{1,25})',url);title=text('ac-t');zone=row.attrs.get('data-zone','cn');category=row.attrs.get('data-c','other')
  if not match or not title or url in seen or zone not in ['cn','gl']:continue
  try:age=float(row.attrs.get('data-age',''));bookmarks=number(text('ac-q'))
  except ValueError:continue
  if not math.isfinite(age) or age<0:continue
  authors=row.find('ac-nm');name='';views=0
  if authors:
   for n in authors[0].children:
    if isinstance(n,Node) and n.tag=='b':name=n.text()
    if isinstance(n,Node) and n.tag=='i':
     v=re.search(r'([\d,.]+[万亿]?)\s*曝光',n.text())
     if v:
      try:views=number(v[1])
      except ValueError:pass
  cover='';covers=row.find('ac-cv')
  if covers:
   image=next((n for n in covers[0].children if isinstance(n,Node) and n.tag=='img'),None)
   if image:
    candidate=urljoin(SOURCE,image.attrs.get('src',''));parsed=urlparse(candidate)
    if parsed.scheme=='https' and not parsed.username and not parsed.password and ((parsed.hostname=='xbangdan.com' and parsed.path.startswith('/feed/img/')) or (parsed.hostname=='pbs.twimg.com' and parsed.path.startswith('/media/'))):cover=candidate
  seen.add(url);items.append({'id':match[2],'handle':match[1],'name':name or match[1],'title':title,'summary':text('ac-pv'),'cover':cover,'category':category,'categoryLabel':text('ac-c') or '其他','zone':zone,'ageDays':age,'bookmarks':bookmarks,'views':views,'url':url})
 if not items:raise ValueError('No valid long-form articles')
 items.sort(key=lambda x:x['bookmarks'],reverse=True);match=re.search(r'页面更新于\s*([\d-]+\s+[\d:]+)',html)
 return {'source':'X榜单长文榜','sourceUrl':SOURCE,'fetchedAt':datetime.now(timezone.utc).isoformat(),'sourceUpdatedText':match[1] if match else '', 'categories':[{'key':k,'label':v} for k,v in dict((i['category'],i['categoryLabel']) for i in items).items()],'items':items}
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
  with urllib.request.urlopen(req,timeout=30) as r:return parse_page(r.read(16_000_000).decode('utf-8'))
 except Exception as error:print(f'X_ARTICLES_BROWSER_FALLBACK {type(error).__name__}');return fetch_browser()
def update(out):
 try:data=fetch()
 except Exception as error:
  if out.exists():
   try:
    old=json.loads(out.read_text(encoding='utf-8-sig'))
    if not old.get('items') or not old.get('fetchedAt'):raise ValueError('Empty cache')
   except (ValueError,OSError):raise RuntimeError('No valid article snapshot') from error
   print(f'X_ARTICLES_PRESERVED {type(error).__name__}: {error}');return False
  raise
 out.parent.mkdir(parents=True,exist_ok=True);tmp=out.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(out);print(f'X_ARTICLES_OK items={len(data["items"])} categories={len(data["categories"])}');return True
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',default='public/x-articles.json');update(Path(p.parse_args().output))
if __name__=='__main__':main()
