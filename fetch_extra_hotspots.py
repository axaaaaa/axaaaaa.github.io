"""Independent public source snapshots; FreeBuf uses a rendered Chromium page."""
import argparse,json,os,re,urllib.request,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse
from datetime import datetime,timezone
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from source_images import attach_covers,clean_cover,cache_source_covers,prune_covers
SOURCES={
 'woshipm':{'name':'人人都是产品经理','kind':'产品与运营文章','url':'https://www.woshipm.com/','endpoint':'https://www.woshipm.com/feed','icon':'https://www.woshipm.com/favicon.ico'},
 'csdn':{'name':'CSDN 博客','kind':'最新技术文章','url':'https://blog.csdn.net/','endpoint':'https://blog.csdn.net/nav/newarticles','icon':'https://blog.csdn.net/favicon.ico'},
 'oschina':{'name':'开源中国','kind':'开源资讯','url':'https://www.oschina.net/','endpoint':'https://www.oschina.net/news/rss','icon':'https://www.oschina.net/favicon.ico'},
 'zcool':{'name':'站酷','kind':'设计作品发现','url':'https://www.zcool.com.cn/discover','endpoint':'https://www.zcool.com.cn/discover','icon':'https://www.zcool.com.cn/favicon.ico'},
 'xz':{'name':'先知社区','kind':'安全技术文章','url':'https://xz.aliyun.com/','endpoint':'https://xz.aliyun.com/','icon':'https://xz.aliyun.com/favicon.ico'},
 'anquanke':{'name':'安全客','kind':'安全资讯与研究','url':'https://www.anquanke.com/','endpoint':'https://api.anquanke.com/data/v1/posts?size=24&page=1','icon':'https://www.anquanke.com/favicon.ico'},
 'freebuf':{'name':'FreeBuf','kind':'安全资讯','url':'https://www.freebuf.com/','endpoint':'https://www.freebuf.com/','icon':'https://www.freebuf.com/favicon.ico'},
 'yicai':{'name':'第一财经','kind':'财经资讯','url':'https://www.yicai.com/','endpoint':'https://www.yicai.com/','icon':'https://www.yicai.com/favicon.ico'},
 'sinafinance':{'name':'新浪财经','kind':'财经资讯','url':'https://finance.sina.com.cn/','endpoint':'https://finance.sina.com.cn/','icon':'https://finance.sina.com.cn/favicon.ico'},
 'pojie52':{'name':'吾爱破解热门','kind':'论坛最新热门','url':'https://www.52pojie.cn/forum.php?mod=guide&view=hot','endpoint':'https://www.52pojie.cn/forum.php?mod=guide&view=hot','icon':'https://www.52pojie.cn/favicon.ico'},
 'kanxue':{'name':'看雪论坛热门','kind':'论坛热门榜','url':'https://bbs.kanxue.com/thread-hotlist-all-3.htm','endpoint':'https://bbs.kanxue.com/thread-hotlist-all-3.htm','icon':'https://bbs.kanxue.com/favicon.ico'},
 'ruanyifeng':{'name':'科技爱好者周刊','kind':'阮一峰 · 最新期刊','url':'https://www.ruanyifeng.com/blog/weekly/index.html','endpoint':'https://www.ruanyifeng.com/blog/weekly/index.html','icon':'https://www.ruanyifeng.com/favicon.ico'},
 'uisdc':{'name':'优设网','kind':'设计资讯','url':'https://www.uisdc.com/','endpoint':'https://www.uisdc.com/','icon':'https://www.uisdc.com/favicon.ico'},
 'geekpark':{'name':'极客公园','kind':'科技资讯','url':'https://www.geekpark.net/','endpoint':'https://www.geekpark.net/rss','icon':'https://www.geekpark.net/favicon.ico'},
 'qbitai':{'name':'量子位','kind':'AI 资讯','url':'https://www.qbitai.com/','endpoint':'https://www.qbitai.com/feed','icon':'https://www.qbitai.com/favicon.ico'},
 'sspai':{'name':'少数派','kind':'最新文章','url':'https://sspai.com/','endpoint':'https://sspai.com/feed','icon':'https://sspai.com/favicon.ico'},
 'juejin':{'name':'稀土掘金','kind':'文章热榜','url':'https://juejin.cn/','endpoint':'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot','icon':'https://juejin.cn/favicon.ico'},
 'toutiao':{'name':'今日头条热榜','kind':'热榜','url':'https://www.toutiao.com/','endpoint':'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc','icon':'https://www.toutiao.com/favicon.ico'},
 'qq':{'name':'腾讯新闻','kind':'热点榜','url':'https://news.qq.com/','endpoint':'https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=20','icon':'https://news.qq.com/favicon.ico'},
 'netease':{'name':'网易新闻','kind':'最新资讯','url':'https://news.163.com/','endpoint':'https://news.163.com/special/0001220O/news_json.js','icon':'https://www.163.com/favicon.ico'},
 'hellogithub':{'name':'HelloGitHub','kind':'开源月刊','url':'https://hellogithub.com/','endpoint':'https://hellogithub.com/rss','icon':'https://hellogithub.com/favicon.ico'},
 'gamersky':{'name':'游民星空','kind':'游戏资讯','url':'https://www.gamersky.com/news/','endpoint':'https://www.gamersky.com/news/','icon':'https://www.gamersky.com/favicon.ico'}
}
def clean(s):return re.sub(r'\s+',' ',str(s or '')).strip()
def valid_url(url):
 try:return urlparse(url).scheme in ['http','https'] and bool(urlparse(url).hostname)
 except ValueError:return False
class Links(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.current=None;self.links=[]
 def handle_starttag(self,t,a):
  if t=='a':self.current=[dict(a).get('href',''),[]]
 def handle_data(self,d):
  if self.current:self.current[1].append(d)
 def handle_endtag(self,t):
  if t=='a' and self.current:self.links.append((self.current[0],clean(''.join(self.current[1]))));self.current=None

def parse_source(key,body):
 rows=[]
 def add(title,url,meta='',cover=''):
  title=clean(title)
  if len(title)>2 and valid_url(url):
   row={'title':title,'url':url,'meta':clean(meta)};image=clean_cover(key,cover,SOURCES[key]['url'])
   if image:row['cover']=image
   rows.append(row)
 if key in ['sspai','hellogithub','geekpark','qbitai','woshipm','oschina','freebuf']:
  root=ET.fromstring(body)
  for item in root.findall('.//item'):add(item.findtext('title'),item.findtext('link') or '',item.findtext('pubDate') or '')
 elif key=='juejin':
  data=json.loads(body)
  if data.get('err_no')!=0:raise ValueError('Juejin response error')
  for row in data.get('data',[]):
   content=row.get('content',{});counter=row.get('content_counter',{});id=str(content.get('content_id',''))
   if id.isdigit():add(content.get('title'),'https://juejin.cn/post/'+id,f"{counter.get('view',0)} 阅读 · {counter.get('like',0)} 赞")
 elif key=='toutiao':
  for row in json.loads(body).get('data',[]):add(row.get('Title'),str(row.get('Url','')).replace('\\u0026','&'),f"热度 {row.get('HotValue','—')}",(row.get('Image') or {}).get('url',''))
 elif key=='qq':
  for group in json.loads(body).get('idlist',[]):
   for row in group.get('newslist',[]):add(row.get('title'),row.get('url') or '',row.get('time') or '',next(iter(row.get('bigImage') or row.get('tmp3pic') or []),''))
 elif key=='netease':
  text=body.decode('utf-8-sig');data=json.loads(text[text.index('{'):text.rfind('}')+1])
  def walk(value):
   if isinstance(value,list):
    for item in value:walk(item)
   elif isinstance(value,dict):add(value.get('t'),value.get('l') or '',value.get('p') or '')
  walk(data.get('news',[]))
 elif key=='anquanke':
  for row in json.loads(body).get('data',[]):
   id=str(row.get('id',''))
   if id.isdigit():add(row.get('title'),'https://www.anquanke.com/post/id/'+id,row.get('date') or '',row.get('cover',''))
 elif key in ['csdn','zcool','xz']:
  parser=Links();parser.feed(body.decode('utf-8'))
  patterns={
   'csdn':r'https://blog\.csdn\.net/[A-Za-z0-9_-]+/article/details/\d+',
   'zcool':r'https://www\.zcool\.com\.cn/work/[A-Za-z0-9=_%+-]+\.html',
   'xz':r'https://xz\.aliyun\.com/(?:news|t)/\d+/?'
  }
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href).split('?')[0].split('#')[0]
   if key=='csdn' and any(t in title for t in ['版权申诉','账号管理规范']):continue
   if key=='csdn' and '/blogdevteam/article/details/126135357' in url:continue
   if re.fullmatch(patterns[key],url) and len(title)>3:add(title,url)
 elif key in ['yicai','sinafinance']:
  try:text=body.decode('utf-8')
  except UnicodeDecodeError:text=body.decode('gb18030')
  parser=Links();parser.feed(text)
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href)
   pattern=r'https://www\.yicai\.com/news/\d+\.html' if key=='yicai' else r'https://finance\.sina\.com\.cn/[a-zA-Z0-9/_-]+/doc-[a-zA-Z0-9]+\.shtml'
   if re.fullmatch(pattern,url) and len(title)>6:add(title,url)
 elif key in ['pojie52','kanxue']:
  text=body.decode('gb18030' if key=='pojie52' else 'utf-8')
  if key=='pojie52':
   blocks=re.findall(r'<tbody\b[^>]*id=["\']normalthread_\d+["\'][^>]*>(.*?)</tbody>',text,flags=re.S|re.I)
   text='\n'.join(blocks)
  parser=Links();parser.feed(text)
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href)
   pattern=r'https://www\.52pojie\.cn/thread-\d+-\d+-\d+\.html' if key=='pojie52' else r'https://bbs\.kanxue\.com/thread-\d+\.htm'
   if re.fullmatch(pattern,url) and len(title)>4:add(title,url)
 elif key=='ruanyifeng':
  parser=Links();parser.feed(body.decode('utf-8'))
  weekly=[]
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   match=re.fullmatch(r'https?://www\.ruanyifeng\.com/blog/\d{4}/\d{2}/weekly-issue-(\d+)\.html',url)
   if match and '科技爱好者周刊' in title:weekly.append((int(match.group(1)),title,url))
  for issue,title,url in sorted(weekly,reverse=True):add(title,url,f'第 {issue} 期')
 elif key=='uisdc':
  text=body.decode('utf-8');marker=text.find('id="home_list_normal"')
  if marker>=0:text=text[marker:]
  parser=Links();parser.feed(text)
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   if re.fullmatch(r'https://www\.uisdc\.com/[a-zA-Z0-9-]{4,}',url) and url.rsplit('/',1)[-1] not in ['about','group','news','archives','contact','privacy','sitemap'] and len(title)>=10:add(title,url)
 elif key=='gamersky':
  try:text=body.decode('utf-8')
  except UnicodeDecodeError:text=body.decode('gb18030')
  parser=Links();parser.feed(text)
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   if re.fullmatch(r'https?://(?:www\.)?gamersky\.com/news/\d{6}/\d+\.shtml',url):add(title,url)
 seen=set();unique=[]
 for row in rows:
  if row['url'] not in seen:seen.add(row['url']);unique.append(row)
 if not unique:raise ValueError('No valid source entries')
 return unique[:24]

FREEBUF_SELECTOR = '.article-list-view .article-item .article-title-link'

def normalize_freebuf_rows(rows):
 items=[];seen=set()
 for row in rows:
  title=clean(row.get('title'));url=urljoin(SOURCES['freebuf']['url'],row.get('url') or '')
  if not re.fullmatch(r'https://www\.freebuf\.com/(?:news|articles)(?:/[A-Za-z0-9_-]+)*/\d+\.html',url):continue
  if len(title)<3 or url in seen:continue
  seen.add(url);item={'title':title,'url':url,'meta':clean(row.get('meta'))};cover=clean_cover('freebuf',row.get('cover'),SOURCES['freebuf']['url'])
  if cover:item['cover']=cover
  items.append(item)
 if not items:raise ValueError('No valid FreeBuf article entries')
 return items[:24]

def fetch_freebuf_items():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=os.environ.get('FREEBUF_HEADLESS') == '1',channel=os.environ.get('FREEBUF_BROWSER_CHANNEL') or None)
  try:
   page=browser.new_page(locale='zh-CN',viewport={'width':1440,'height':1000})
   page.goto(SOURCES['freebuf']['endpoint'],wait_until='domcontentloaded',timeout=60000)
   page.locator(FREEBUF_SELECTOR).first.wait_for(state='visible',timeout=45000)
   rows=page.locator(FREEBUF_SELECTOR).evaluate_all("""links => links.map(a => ({
    title: a.textContent,
    url: a.href,
    cover: a.closest('.article-item')?.querySelector('.img-view img')?.getAttribute('data-src') || a.closest('.article-item')?.querySelector('.img-view img')?.src || '',
    meta: a.closest('.article-item')?.querySelector('.bottom-right')?.innerText || ''
   }))""")
   return normalize_freebuf_rows(rows)
  finally:browser.close()

def fetch(key):
 source=SOURCES[key]
 if key=='freebuf':
  return {**{k:v for k,v in source.items() if k!='endpoint'},'updatedAt':datetime.now(timezone.utc).isoformat(),'items':cache_source_covers(key,fetch_freebuf_items())}
 req=urllib.request.Request(source['endpoint'],headers={'User-Agent':'Mozilla/5.0','Referer':source['url'],'Accept':'application/json,application/xml,text/html;q=0.9,*/*;q=0.8'})
 with urllib.request.urlopen(req,timeout=25) as r:body=r.read(4_000_000)
 if b'aliyun_waf_aa' in body[:2000]:raise ValueError('Source returned an access verification page')
 items=cache_source_covers(key,attach_covers(key,parse_source(key,body),body,source['url']))
 return {**{k:v for k,v in source.items() if k!='endpoint'},'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/extra-hotspots.json');out=Path(parser.parse_args().output);previous={}
 if out.exists():
  try:previous=json.loads(out.read_text(encoding='utf-8-sig')).get('sources',{})
  except (OSError,ValueError):pass
 def load(key):
  try:
   data=fetch(key);print(f'SOURCE_OK {key} items={len(data["items"])}');return key,data
  except Exception as error:
   print(f'SOURCE_PRESERVED {key}: {error}')
   old=previous.get(key)
   if old and old.get('items'):
    try:return key,{**old,'items':cache_source_covers(key,attach_covers(key,old['items'],b'<html></html>',SOURCES[key]['url']))}
    except Exception:return key,old
   config=SOURCES[key]
   return key,{**{k:v for k,v in config.items() if k!='endpoint'},'updatedAt':None,'items':[],'unavailable':True}
 with ThreadPoolExecutor(max_workers=7) as pool:sources={k:v for k,v in pool.map(load,SOURCES) if v}
 if not sources:raise SystemExit('No current or cached sources available')
 out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'sources':sources},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out)
 if out.resolve()==(Path(__file__).resolve().parents[1]/'public'/'extra-hotspots.json').resolve():prune_covers(sources)
 print(f'EXTRA_SOURCES_OK count={len(sources)}')
if __name__=='__main__':main()
