"""Official Hacker News top stories, preserving ranked order and last successful JSON."""
import argparse
import concurrent.futures
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
BASE = 'https://hacker-news.firebaseio.com/v0/'
def get_json(endpoint):
    req = urllib.request.Request(BASE+endpoint+'.json', headers={'User-Agent':'NavigationHN/1.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read(2_000_000))
def normalize(row):
    if not isinstance(row,dict) or row.get('deleted') or row.get('dead') or row.get('type')!='story':return None
    id=row.get('id');title=row.get('title')
    if not isinstance(id,int) or isinstance(id,bool) or id<=0 or not isinstance(title,str) or not title.strip():return None
    def count(key):
        n=row.get(key,0)
        return n if isinstance(n,int) and not isinstance(n,bool) and n>=0 else 0
    return {'id':id,'title':title.strip(),'url':f'https://news.ycombinator.com/item?id={id}','author':str(row.get('by','')),'points':count('score'),'replies':count('descendants')}
def fetch():
    ids=get_json('topstories')
    if not isinstance(ids,list):raise ValueError('Invalid topstories')
    ids=list(dict.fromkeys(i for i in ids if isinstance(i,int) and not isinstance(i,bool) and i>0))[:24]
    def load(id):
        try:return normalize(get_json(f'item/{id}'))
        except Exception:return None
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        items=[row for row in pool.map(load,ids) if row]
    if len(items)<min(6,len(ids)) or not items:raise ValueError('Insufficient ranked stories')
    return items
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/hacker-news.json');output=Path(parser.parse_args().output)
    try:
        items=fetch();data={'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items};output.parent.mkdir(parents=True,exist_ok=True);temp=output.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(output);print(f'HN_OK items={len(items)}')
    except Exception as error:
        if output.exists():
            try:
                previous=json.loads(output.read_text(encoding='utf-8-sig'))
                if previous.get('items') and previous.get('updatedAt'):print(f'HN_PRESERVED previous data: {error}');return
            except (ValueError,OSError):pass
        raise SystemExit(f'HN_FETCH_FAILED {error}')
if __name__=='__main__':main()
