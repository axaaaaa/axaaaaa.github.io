import argparse,json,urllib.request
from datetime import datetime,timezone,timedelta,date
from pathlib import Path
USER_AGENT='NavigationSite/1.0 (https://github.com/axaaaaa)'
def normalize(data):
 groups={}
 for key in ['events','births','deaths']:
  items=[];seen=set()
  for event in data.get(key,[]):
   if not isinstance(event,dict):continue
   text=event.get('text');year=event.get('year');pages=event.get('pages') or []
   if not isinstance(text,str) or not text.strip() or not isinstance(year,int) or isinstance(year,bool):continue
   url=next((p.get('content_urls',{}).get('desktop',{}).get('page','') for p in pages if isinstance(p,dict) and str(p.get('content_urls',{}).get('desktop',{}).get('page','')).startswith('https://zh.wikipedia.org/wiki/')),'')
   identity=(year,text.strip())
   if not url or identity in seen:continue
   seen.add(identity);items.append({'year':year,'text':text.strip(),'url':url})
  groups[key]=sorted(items,key=lambda r:r['year'],reverse=True)[:30]
 if not groups['events']:raise ValueError('No sourced historical events')
 return groups
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/history-today.json');parser.add_argument('--date');args=parser.parse_args();day=args.date or datetime.now(timezone(timedelta(hours=8))).date().isoformat();date.fromisoformat(day);out=Path(args.output);old=None
 if out.exists():
  try:old=json.loads(out.read_text(encoding='utf-8-sig'))
  except (ValueError,OSError):pass
 if old and old.get('date')==day and old.get('groups',{}).get('events'):
  print('HISTORY_CACHED date='+day);return
 monthday=day[5:].replace('-','/');endpoint='https://zh.wikipedia.org/api/rest_v1/feed/onthisday/all/'+monthday
 try:
  req=urllib.request.Request(endpoint,headers={'User-Agent':USER_AGENT,'Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=30) as r:groups=normalize(json.loads(r.read(6_000_000)))
  data={'date':day,'updatedAt':datetime.now(timezone.utc).isoformat(),'source':'维基百科（中文）','sourceUrl':'https://zh.wikipedia.org/wiki/'+str(int(day[5:7]))+'月'+str(int(day[8:10]))+'日','license':'CC BY-SA 4.0','groups':groups}
  out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print(f'HISTORY_OK date={day} events={len(groups["events"])} births={len(groups["births"])} deaths={len(groups["deaths"])}')
 except Exception as error:
  if old and old.get('groups',{}).get('events'):print(f'HISTORY_PRESERVED date={old.get("date")}: {error}');return
  raise SystemExit(f'HISTORY_FAILED {error}')
if __name__=='__main__':main()
