"""Snapshot X榜单's public 24-hour tweet rankings. Preserve cache on outages."""
import argparse,json,math,re,urllib.request
from datetime import datetime,timezone
from pathlib import Path

SOURCE='https://xbangdan.com/'
ENDPOINT=SOURCE+'hot.json'

def normalize(data):
 stamp=data.get('updated')
 if isinstance(stamp,bool) or not isinstance(stamp,(int,float)) or not math.isfinite(stamp) or stamp<=0:raise ValueError('Invalid source timestamp')
 updated=datetime.fromtimestamp(stamp,timezone.utc).isoformat()
 result={'source':'X榜单','sourceUrl':SOURCE,'updatedAt':updated}
 for key,metric in [('rate','r'),('views','v')]:
  rows=data.get(key)
  if not isinstance(rows,list):raise ValueError('Missing ranking: '+key)
  items=[];seen=set()
  for row in rows:
   if not isinstance(row,dict):continue
   id=str(row.get('id',''));handle=row.get('h','');value=row.get(metric)
   if not re.fullmatch(r'\d{1,25}',id) or not isinstance(handle,str) or not re.fullmatch(r'[A-Za-z0-9_]{1,15}',handle):continue
   if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or value<0 or id in seen:continue
   seen.add(id)
   title=row.get('t');name=row.get('n');likes=row.get('l',0)
   items.append({'id':id,'handle':handle,'name':name if isinstance(name,str) else handle,'title':title.strip() if isinstance(title,str) and title.strip() else '图片或视频推文','url':f'https://x.com/{handle}/status/{id}','value':value,'likes':likes if isinstance(likes,(int,float)) and not isinstance(likes,bool) and math.isfinite(likes) and likes>=0 else 0})
  if not items:raise ValueError('Empty ranking: '+key)
  result[key]=sorted(items,key=lambda x:x['value'],reverse=True)[:50]
 return result

def fetch_browser():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=False)
  try:
   page=browser.new_page();captured=[]
   def capture(response):
    if response.url.split('?')[0]==ENDPOINT and response.ok:
     try:captured.append(response.json())
     except ValueError:pass
   page.on('response',capture)
   page.goto(SOURCE,wait_until='domcontentloaded',timeout=45000)
   for _ in range(30):
    if captured:return captured[-1]
    page.wait_for_timeout(500)
   response=page.request.get(ENDPOINT,timeout=20000)
   if not response.ok:raise ValueError(f'Browser source HTTP {response.status}')
   return response.json()
  finally:browser.close()

def fetch():
 try:
  req=urllib.request.Request(ENDPOINT,headers={'User-Agent':'Mozilla/5.0','Referer':SOURCE,'Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=20) as r:data=json.loads(r.read(2_000_000))
  return normalize(data)
 except Exception as error:
  print(f'X_HOT_BROWSER_FALLBACK {type(error).__name__}')
  return normalize(fetch_browser())

def update(out):
 try:data=fetch()
 except Exception as error:
  if out.exists():
   try:
    old=json.loads(out.read_text(encoding='utf-8-sig'))
    if not old.get('rate') or not old.get('views') or not old.get('updatedAt'):raise ValueError('Empty cache')
   except (ValueError,OSError):raise RuntimeError('No valid X hot snapshot') from error
   print(f'X_HOT_PRESERVED {type(error).__name__}: {error}');return False
  raise
 out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out)
 print(f'X_HOT_OK rate={len(data["rate"])} views={len(data["views"])}');return True

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/x-hot.json');update(Path(parser.parse_args().output))
if __name__=='__main__':main()
