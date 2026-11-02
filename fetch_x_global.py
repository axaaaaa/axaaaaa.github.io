"""Fetch overseas rankings from the public GLOBAL_D JSON embedded in X榜单."""
import argparse,json,math,re,urllib.request
from datetime import date,datetime,timezone,timedelta
from pathlib import Path
from source_images import clean_cover,cache_source_covers
SOURCE='https://xbangdan.com/global/'

def parse_page(html):
 match=re.search(r'\b(?:var\s+|window\.)GLOBAL_D\s*=\s*',html)
 if not match:raise ValueError('GLOBAL_D missing')
 data,_=json.JSONDecoder().raw_decode(html[match.end():]);return normalize(data)

def normalize(data):
 if not isinstance(data,dict):raise ValueError('Invalid payload')
 day=date.fromisoformat(data.get('date',''));stamp=datetime.fromisoformat(data.get('fetched_at',''))
 if stamp.tzinfo is None:raise ValueError('Source time needs timezone')
 cats=data.get('cats')
 if not isinstance(cats,dict) or not cats:raise ValueError('Missing categories')
 result={'source':'X榜单海外榜','sourceUrl':SOURCE,'dataDate':day.isoformat(),'updatedAt':stamp.astimezone(timezone.utc).isoformat(),'categories':[],'items':[]}
 def number(v):return v if isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) and v>=0 else 0
 def text(v):return v.strip() if isinstance(v,str) else ''
 for key,cat in cats.items():
  if not re.fullmatch(r'[a-z][a-z0-9_-]{0,30}',key) or not isinstance(cat,dict) or not isinstance(cat.get('items'),list):continue
  seen=set();items=[]
  for row in cat['items']:
   if not isinstance(row,dict):continue
   id=str(row.get('id',''));handle=row.get('handle','')
   if not re.fullmatch(r'\d{1,25}',id) or not isinstance(handle,str) or not re.fullmatch(r'[A-Za-z0-9_]{1,15}',handle) or id in seen:continue
   seen.add(id);article=row.get('article') if isinstance(row.get('article'),dict) else {}
   title=text(article.get('title_zh')) or text(article.get('title')) if key=='article' else text(row.get('zh')) or text(row.get('text'))
   items.append({'id':id,'handle':handle,'title':title or '图片或视频推文','original':text(row.get('text')),'url':f'https://x.com/{handle}/status/{id}','category':key,'lang':text(row.get('lang')),'likes':number(row.get('likes')),'views':number(row.get('views')),'bookmarks':number(row.get('bookmarks'))})
   for media in row.get('media',[]) if isinstance(row.get('media'),list) else []:
    cover=clean_cover('xglobal',media.get('url','') if isinstance(media,dict) else '')
    if cover:items[-1]['cover']=cover;break
  if not items:continue
  metric='bookmarks' if key=='article' else 'likes';items.sort(key=lambda r:r[metric],reverse=True)
  result['categories'].append({'key':key,'label':text(cat.get('label')) or key});result['items'].extend(items[:100])
 result['events']=normalize_events(data,result['items'])
 if not result['items'] or not any(x['category']!='article' for x in result['items']):raise ValueError('Empty overseas tweet rankings')
 return result

def normalize_events(data,items):
 from urllib.parse import urlparse
 index={row['id']:row for row in items if row['category']!='article'};images={}
 for category in data['cats'].values():
  if not isinstance(category,dict):continue
  for row in category.get('items',[]):
   if not isinstance(row,dict):continue
   for media in row.get('media',[]) if isinstance(row.get('media'),list) else []:
    url=media.get('url','') if isinstance(media,dict) else ''
    if not isinstance(url,str):continue
    parsed=urlparse(url)
    if parsed.scheme=='https' and parsed.hostname=='pbs.twimg.com' and not parsed.username and not parsed.password and parsed.path.startswith('/media/'):
     images.setdefault(str(row.get('id','')),url);break
 events=[];seen=set()
 raw=data.get('events',[])
 if not isinstance(raw,list):return events
 def count(v):return v if isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) and v>=0 else 0
 for event in raw[:30]:
  if not isinstance(event,dict):continue
  title=event.get('title');id=str(event.get('i',''))
  if not re.fullmatch(r'\d{1,6}',id) or id in seen or not isinstance(title,str) or not title.strip() or not isinstance(event.get('ids'),list):continue
  ids=list(dict.fromkeys(str(i) for i in event['ids'] if str(i) in index))
  if not ids:continue
  seen.add(id);rows=sorted((index[i] for i in ids),key=lambda r:r['likes'],reverse=True)
  categories=event.get('cats',[]) if isinstance(event.get('cats'),list) else []
  labels={c['key']:c['label'] for c in [{'key':k,'label':v.get('label',k)} for k,v in data['cats'].items() if isinstance(v,dict)]}
  events.append({'id':id,'title':title.strip(),'summary':rows[0]['title'],'url':rows[0]['url'],'image':next((images[r['id']] for r in rows if r['id'] in images),''),'category':next((labels[c] for c in categories if c in labels),'海外热点'),'tweetIds':ids,'count':len(ids),'likes':count(event.get('likes')),'views':count(event.get('views'))})
 return events

def fetch_browser():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as p:
  b=p.chromium.launch(headless=False)
  try:
   page=b.new_page();page.goto(SOURCE,wait_until='domcontentloaded',timeout=45000)
   return parse_page(page.content())
  finally:b.close()

def fetch():
 try:
  req=urllib.request.Request(SOURCE,headers={'User-Agent':'Mozilla/5.0','Accept':'text/html'})
  with urllib.request.urlopen(req,timeout=25) as r:body=r.read(8_000_000).decode('utf-8')
  return parse_page(body)
 except Exception as error:
  print(f'X_GLOBAL_BROWSER_FALLBACK {type(error).__name__}');return fetch_browser()

def fetch_previous(latest_date):
 req=urllib.request.Request(SOURCE+'r-prev.json',headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=25) as response:data=normalize(json.loads(response.read(8_000_000)))
 if date.fromisoformat(data['dataDate'])!=date.fromisoformat(latest_date)-timedelta(days=1):raise ValueError('Previous date mismatch')
 return data

def update(out,include_previous=False):
 try:
  data=fetch()
  top=sorted((r for r in data['items'] if r.get('cover')),key=lambda r:r['likes'],reverse=True)[:100]
  cached={r['id']:r for r in cache_source_covers('xglobal',top)}
  data['items']=[cached.get(r['id'],r) for r in data['items']]
 except Exception as error:
  if out.exists():
   try:
    old=json.loads(out.read_text(encoding='utf-8-sig'))
    if not old.get('items') or not old.get('categories') or not old.get('dataDate'):raise ValueError('Empty cache')
   except (ValueError,OSError):raise RuntimeError('No valid overseas snapshot') from error
   print(f'X_GLOBAL_PRESERVED {type(error).__name__}: {error}');return False
  raise
 if include_previous:
  try:data['previousDay']=fetch_previous(data['dataDate'])
  except Exception as error:
   data['previousDay']=None;print(f'X_GLOBAL_PREVIOUS_PRESERVED {type(error).__name__}: {error}')
   if out.exists():
    try:
     old=json.loads(out.read_text(encoding='utf-8-sig'));candidate=old if old.get('dataDate')!=data['dataDate'] else old.get('previousDay')
     if candidate and date.fromisoformat(candidate['dataDate'])==date.fromisoformat(data['dataDate'])-timedelta(days=1):data['previousDay']=candidate
    except (ValueError,OSError,KeyError,TypeError):pass
 out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out)
 print(f'X_GLOBAL_OK categories={len(data["categories"])} items={len(data["items"])} date={data["dataDate"]}');return True

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/x-global.json');update(Path(parser.parse_args().output),include_previous=True)
if __name__=='__main__':main()
