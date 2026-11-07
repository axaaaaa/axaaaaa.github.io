"""Run independent collectors and publish truthful, machine-readable health."""
import argparse,json,os,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path

COLLECTORS=[
 ('news','资讯 RSS','fetch_news.py','news.json'),
 ('github','GitHub Trending','fetch_github_trending.py','github-trending.json'),
 ('v2ex','V2EX','fetch_v2ex.py','v2ex-hot.json'),
 ('weibo','微博','fetch_weibo.py','weibo-hot.json'),
 ('exchange-rates','汇率','fetch_exchange_rates.py','exchange-rates.json'),
 ('markets','市场行情与市值','fetch_markets.py','markets.json'),
 ('extra','扩展资讯','fetch_extra_hotspots.py','extra-hotspots.json'),
 ('history','历史上的今天','fetch_history_today.py','history-today.json'),
 ('x-hot','X 热门','fetch_x_hot.py','x-hot.json'),
 ('x-global','X 海外','fetch_x_global.py','x-global.json'),
 ('x-words','X 热词','fetch_x_words.py','x-words.json'),
 ('x-articles','X 长文','fetch_x_articles.py','x-articles.json'),
 ('hacker-news','Hacker News','fetch_hacker_news.py','hacker-news.json'),
]

FRESH_LIMIT=4*60*60

def parse_stamp(value):
 if not isinstance(value,str):return None
 try:return datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()
 except ValueError:return None

def extract_stamp(key,data):
 """按采集器差异从输出 JSON 中提取最新时间戳（epoch 秒）。"""
 if not isinstance(data,dict):return None
 if key in ('exchange-rates','x-words','x-articles'):return parse_stamp(data.get('fetchedAt'))
 if key=='github':
  stamps=[extract_stamp(k,p) for k,p in (data.get('periods') or {}).items() if isinstance(p,dict)]
  return max((s for s in stamps if s is not None),default=None)
 if key=='extra':
  stamps=[parse_stamp(s.get('updatedAt')) for s in (data.get('sources') or {}).values() if isinstance(s,dict)]
  return max((s for s in stamps if s is not None),default=None)
 return parse_stamp(data.get('updatedAt'))

def write_health(root,results,out=None):
 health={'generatedAt':datetime.now(timezone.utc).isoformat(),'sources':results}
 path=out or (root/'collection-health.json');path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.tmp');temp.write_text(json.dumps(health,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(path)
 summary=os.environ.get('GITHUB_STEP_SUMMARY')
 if summary:
  with open(summary,'a',encoding='utf-8') as f:
   f.write('## Collection health\n\n| Source | Status |\n|---|---|\n'+''.join(f'| {r["name"]} | {r["status"]} |\n' for r in results))

def summarize(root):
 """不重新采集，只汇总 public/ 下已有输出，生成采集健康报告。"""
 results=[]
 for key,name,script,output in COLLECTORS:
  row={'key':key,'name':name,'file':output,'status':'error','lastAttemptAt':None}
  data={}
  try:data=json.loads((root/'public'/output).read_text(encoding='utf-8-sig'))
  except (OSError,ValueError):data={}
  stamp=extract_stamp(key,data)
  if stamp is None:row['errors']=['missing or unreadable output']
  else:
   row['lastAttemptAt']=datetime.fromtimestamp(stamp,timezone.utc).isoformat()
   if datetime.now(timezone.utc).timestamp()-stamp>FRESH_LIMIT:row['status']='degraded';row['errors']=['snapshot older than 4 hours']
   else:row['status']='ok'
  if key=='extra':row['sources']={k:v.get('collection',{}) for k,v in (data.get('sources') or {}).items() if isinstance(v,dict)}
  if key=='markets':
   assets=[r for r in data.get('items',[]) if isinstance(r,dict) and r.get('kind')!='index']
   row['marketCapCoverage']={'available':sum(isinstance(r.get('marketCapUsd'),(int,float)) and r['marketCapUsd']>0 for r in assets),'total':len(assets)}
  if row['status']!='ok':print(f'::warning title={name} collection::{row["status"]}',flush=True)
  results.append(row)
 write_health(root,results,root/'public'/'collection-health.json')
 print('COLLECTION_HEALTH_SUMMARY sources='+str(len(results)),flush=True)
 return 0

def classify(code,lines,exists):
 if not exists:return 'error'
 if code or any('_PRESERVED' in line or 'SOURCE_UNAVAILABLE' in line for line in lines):return 'degraded'
 return 'ok'

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--root',default='.');parser.add_argument('--summarize',action='store_true',help='只汇总 public/ 下已有输出，不重新采集');args=parser.parse_args()
 root=Path(args.root).resolve()
 if args.summarize:return summarize(root)
 results=[];fatal=False
 for key,name,script,output in COLLECTORS:
  attempted=datetime.now(timezone.utc).isoformat();lines=[]
  command=[sys.executable,script,'--output',output]
  print('COLLECTOR_START '+key,flush=True)
  try:
   proc=subprocess.Popen(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace',env={**os.environ,'PYTHONUNBUFFERED':'1','PYTHONIOENCODING':'utf-8'})
   for line in proc.stdout:lines.append(line.rstrip());print(line,end='',flush=True)
   code=proc.wait()
  except OSError as error:code=1;lines.append(str(error))
  try:data=json.loads((root/output).read_text(encoding='utf-8-sig'));exists=bool(data)
  except (OSError,ValueError):data={};exists=False
  status=classify(code,lines,exists);fatal=fatal or status=='error'
  errors=[line[:500] for line in lines if '_PRESERVED' in line or 'SOURCE_UNAVAILABLE' in line][-30:]
  if code and not errors:errors=lines[-5:]
  row={'key':key,'name':name,'file':output,'status':status,'lastAttemptAt':attempted,'exitCode':code,'errors':errors}
  if key=='extra':row['sources']={k:v.get('collection',{}) for k,v in data.get('sources',{}).items()}
  if key=='markets':
   assets=[r for r in data.get('items',[]) if r.get('kind')!='index']
   row['marketCapCoverage']={'available':sum(isinstance(r.get('marketCapUsd'),(int,float)) and r['marketCapUsd']>0 for r in assets),'total':len(assets)}
  results.append(row)
  if status!='ok':print(f'::warning title={name} collection::{status}; see collection-health.json and source logs',flush=True)
 write_health(root,results)
 print('COLLECTION_HEALTH_OK sources='+str(len(results)),flush=True)
 return int(fatal)

if __name__=='__main__':raise SystemExit(main())
