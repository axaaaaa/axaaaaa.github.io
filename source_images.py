"""Match article URLs to their own cover images; never borrow unrelated page images."""
import re,urllib.request,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse
from concurrent.futures import ThreadPoolExecutor
DOMAINS={
'sspai':('sspai.com',),'uisdc':('uisdc.com',),'zcool':('zcool.cn','zcool.com.cn'),'gamersky':('gamersky.com',),'freebuf':('3001.net','freebuf.com'),
'woshipm':('woshipm.com','aixq.cc'),'csdn':('csdnimg.cn','csdn.net'),'oschina':('oschina.net','oscimg.net'),'xz':('aliyun.com','aliyuncs.com'),'anquanke':('qhimg.com','anquanke.com'),
'yicai':('yicai.com','yicai.net'),'sinafinance':('sinaimg.cn','sina.com.cn'),'pojie52':('52pojie.cn',),'kanxue':('kanxue.com','kanxue.cn'),'ruanyifeng':('beekka.com','ruanyifeng.com'),
'geekpark':('geekpark.net','geekpark.com'),'qbitai':('qbitai.com',),'juejin':('byteimg.com','juejin.cn','juejin.im'),'toutiao':('toutiaoimg.com','toutiao.com','byteimg.com'),
'qq':('gtimg.com','qq.com'),'netease':('126.net','163.com'),'hellogithub':('cheatsheet.store','hellogithub.com','githubusercontent.com'),
'ithome':('ithome.com','ithome.net','ithomeimg.com','ithome.cn'),'huggingface':('huggingface.co','hf.co'),'github':('githubassets.com','githubusercontent.com','github.com'),
'v2ex':('v2ex.com','v2ex.co','imgur.com','jsdelivr.net'),'xglobal':('twimg.com',)}
IMAGE_SOURCES=set(DOMAINS)

def clean_cover(key,value,base=''):
 if not isinstance(value,str) or not value.strip():return ''
 try:
  u=urlparse(urljoin(base,value.strip()));host=(u.hostname or '').lower()
  if u.scheme not in ['http','https'] or u.username or u.password or u.port not in [None,80,443]:return ''
  if not any(host==d or host.endswith('.'+d) for d in DOMAINS.get(key,())):return ''
  if key=='csdn' and host in ['i-operation.csdnimg.cn','img-bss.csdnimg.cn','kunyu.csdn.net']:return ''
  if re.search(r'/static/image/(?:common|smiley|filetype)/|/view/img/face/',u.path,re.I):return ''
  if key=='csdn' and ('/release/' in u.path or re.search('logo|heart|badge|loading',u.path,re.I)):return ''
  if re.search(r'(?:^|[/_.-])(?:avatar|favicon|logo|icon|spacer|loading|qrcode|emoji|smiley|banner-ad)(?:[/_.-]|$)',u.path,re.I):return ''
  return u._replace(scheme='https').geturl()
 except ValueError:return ''
def canonical(url):
 u=urlparse(url);return u._replace(query='',fragment='').geturl().rstrip('/')
class CoverParser(HTMLParser):
 def __init__(self,key,base):super().__init__(convert_charrefs=True);self.key=key;self.base=base;self.href='';self.images={};self.meta='';self.content_cover='';self.scopes=[]
 def add(self,value):
  image=clean_cover(self.key,value,self.base)
  if image and self.href:self.images.setdefault(canonical(urljoin(self.base,self.href)),image)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  scope=tag=='article' or bool(re.search(r'(?:^|[ _-])(?:entry-content|article-content|post-content|news-content|markdown-body|prose|message|article|post_detail|t_f|blog-content-box|htmledit_views|markdown_views|content_views)(?:$|[ _-])',a.get('class','')+' '+a.get('id','')))
  inside=scope or (self.scopes[-1][1] if self.scopes else False) or (self.key=='hellogithub' and 'cursor-zoom-in' in a.get('class',''))
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','rect','path','circle','line','use'}:self.scopes.append((tag,inside))
  if tag=='a':self.href=a.get('href','')
  if tag=='img' and not re.search(r'avatar|emoji|smiley|icon',a.get('class',''),re.I):
   for k in ['data-src','data-original','data-lazy-src','src']:
    if clean_cover(self.key,a.get(k,''),self.base):
     self.add(a[k])
     small=any(a.get(n,'').isdigit() and int(a[n])<100 for n in ['width','height'])
     if inside and not small and not self.content_cover:self.content_cover=clean_cover(self.key,a[k],self.base)
     break
  style=a.get('style','');m=re.search(r'background-image\s*:\s*url\([\x27\x22]?(.*?)[\x27\x22]?\)',style,re.I)
  if m:self.add(m[1])
  if tag=='meta' and (a.get('property') or a.get('name')) in ['og:image','twitter:image'] and not self.meta:self.meta=clean_cover(self.key,a.get('content',''),self.base)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
 def handle_endtag(self,tag):
  if tag=='a':self.href=''
  for i in range(len(self.scopes)-1,-1,-1):
   if self.scopes[i][0]==tag:self.scopes=self.scopes[:i];break
def detail_cover(key,url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'text/html'})
 with urllib.request.urlopen(req,timeout=12) as r:
  if urlparse(r.url).hostname!=urlparse(url).hostname:return ''
  body=r.read(2_000_000).decode('utf-8','replace')
 parser=CoverParser(key,url);parser.feed(body);return parser.meta or parser.content_cover

def attach_covers(key,items,body,base):
 if key not in IMAGE_SOURCES:return items
 parser=CoverParser(key,base)
 if body.lstrip().startswith((b'<?xml',b'<rss',b'<feed')):
  try:
   root=ET.fromstring(body)
   for item in root.findall('.//item') or root.findall('{http://www.w3.org/2005/Atom}entry'):
    link=item.findtext('link') or next((n.get('href','') for n in item if n.tag.rsplit('}',1)[-1]=='link'),'');p=CoverParser(key,link);p.href=link
    for node in item.iter():
     if node.tag.rsplit('}',1)[-1] in ['thumbnail','content','enclosure'] and node.attrib.get('url'):p.add(node.attrib['url'])
    content=''.join(n.text or '' for n in item if n.tag.rsplit('}',1)[-1] in ['description','encoded','content'])
    p.feed('<article>'+content+'</article>')
    parser.images.update(p.images)
    if p.content_cover:parser.images.setdefault(canonical(link),p.content_cover)
  except ET.ParseError:pass
 else:
  try:text=body.decode('utf-8')
  except UnicodeDecodeError:text=body.decode('gb18030','replace')
  parser.feed(text)
 result=[dict(row) for row in items]
 for row in result:
  cover=clean_cover(key,row.get('cover'),base) or parser.images.get(canonical(row['url']),'')
  if cover:row['cover']=cover
 # RSS has no covers on this source. Fetch each corresponding page's og:image.
 pending=[row for row in result[:24 if key in ['sspai','github'] else 6] if not row.get('cover') and urlparse(row['url']).hostname==urlparse(base).hostname]
 def enrich(row):
  try:
   image=detail_cover(key,row['url'])
   if image:row['cover']=image
  except Exception:pass
 with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(enrich,pending))
 return result

def cache_source_covers(key,items):
 import hashlib
 from pathlib import Path
 if key not in IMAGE_SOURCES:return items
 root=Path(__file__).resolve().parents[1]/'public'/'source-covers'/key
 def cache(row):
  image=clean_cover(key,row.get('cover'))
  if not image:return row
  token=hashlib.sha256(image.encode()).hexdigest()[:24]
  existing=list(root.glob(token+'.*')) if root.exists() else []
  if existing:
   return {**row,'originalCover':image,'cover':'source-covers/'+key+'/'+existing[0].name}
  try:
   headers={'User-Agent':'Mozilla/5.0','Accept':'image/webp,image/*;q=0.9,*/*;q=0.8'}
   referers={'qbitai':'https://www.qbitai.com/','xz':'https://xz.aliyun.com/','anquanke':'https://www.anquanke.com/'}
   if key in referers:headers['Referer']=referers[key]
   req=urllib.request.Request(image,headers=headers)
   with urllib.request.urlopen(req,timeout=15) as response:
    if not clean_cover(key,response.url) or '/403.' in response.url:raise ValueError('Unexpected image redirect')
    content=response.read(2_000_001)
   if len(content)>2_000_000:raise ValueError('Image size limit')
   ext='jpg' if content.startswith(b'\xff\xd8\xff') else 'png' if content.startswith(b'\x89PNG\r\n\x1a\n') else 'webp' if content[:4]==b'RIFF' and content[8:12]==b'WEBP' else 'gif' if content[:6] in [b'GIF87a',b'GIF89a'] else ''
   if not ext:raise ValueError('Unexpected image body')
   root.mkdir(parents=True,exist_ok=True);path=root/(token+'.'+ext);temp=path.with_suffix('.tmp');temp.write_bytes(content);temp.replace(path)
   return {**row,'originalCover':image,'cover':'source-covers/'+key+'/'+path.name}
  except Exception:return row
 with ThreadPoolExecutor(max_workers=4) as pool:return list(pool.map(cache,items))

def prune_covers(sources):
 from pathlib import Path
 root=Path(__file__).resolve().parents[1]/'public'/'source-covers'
 used={row.get('cover','') for data in sources.values() for row in data.get('items',[])}
 for key in set(sources)&IMAGE_SOURCES:
  folder=root/key
  if not folder.is_dir():continue
  for path in folder.iterdir():
   if path.is_file() and re.fullmatch(r'[a-f0-9]{24}\.(?:jpg|png|webp|gif)',path.name) and 'source-covers/'+key+'/'+path.name not in used:path.unlink()

def prune_all_covers():
 import json
 from pathlib import Path
 public=Path(__file__).resolve().parents[1]/'public';sources={}
 def load(name):
  try:return json.loads((public/name).read_text(encoding='utf-8-sig'))
  except (OSError,ValueError):return {}
 extra=load('extra-hotspots.json')
 if isinstance(extra.get('sources'),dict):sources.update(extra['sources'])
 news=load('news.json')
 if isinstance(news.get('items'),list):
  for key,name in [('ithome','IT之家'),('huggingface','Hugging Face')]:sources[key]={'items':[r for r in news['items'] if r.get('source')==name]}
 for key,name in [('github','github-trending.json'),('v2ex','v2ex-hot.json'),('xglobal','x-global.json')]:
  data=load(name)
  if key=='github' and isinstance(data.get('periods'),dict):sources[key]={'items':[r for period in data['periods'].values() for r in period.get('items',[])]}
  elif isinstance(data.get('items'),list):sources[key]={'items':data['items']}
 prune_covers(sources)
 print('SOURCE_COVERS_PRUNED referenced snapshots retained')
