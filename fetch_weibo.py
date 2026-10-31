"""Weibo public hot-search JSON; omit ad rows and preserve last successful data."""
import argparse,json,urllib.request
from urllib.parse import quote
from pathlib import Path
from datetime import datetime,timezone
URL='https://weibo.com/ajax/side/hotSearch'
def normalize(data):
    if not isinstance(data,dict) or data.get('ok')!=1:raise ValueError('Invalid hot search response')
    rows=data.get('data',{}).get('realtime',[]);items=[];seen=set()
    for row in rows:
        if not isinstance(row,dict) or row.get('is_ad') or row.get('is_advert'):continue
        title=row.get('word')
        if not isinstance(title,str) or not title.strip() or title in seen:continue
        seen.add(title);rank=row.get('realpos');heat=row.get('num',0)
        if not isinstance(rank,int) or isinstance(rank,bool) or rank<=0:continue
        items.append({'title':title.strip(),'rank':rank,'url':'https://s.weibo.com/weibo?q='+quote(title.strip(),safe=''),'heat':heat if isinstance(heat,int) and heat>=0 else 0,'tag':str(row.get('label_name') or row.get('icon_desc') or '')})
    if not items:raise ValueError('No valid hot searches')
    return sorted(items,key=lambda r:r['rank'])[:30]
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/weibo-hot.json');out=Path(parser.parse_args().output)
    try:
        req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0','Referer':'https://weibo.com/','Accept':'application/json'})
        with urllib.request.urlopen(req,timeout=25) as r:items=normalize(json.loads(r.read(2_000_000)))
        out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print(f'WEIBO_OK items={len(items)}')
    except Exception as error:
        if out.exists():
            try:
                old=json.loads(out.read_text(encoding='utf-8-sig'))
                if old.get('items') and old.get('updatedAt'):print(f'WEIBO_PRESERVED previous data: {error}');return
            except (ValueError,OSError):pass
        raise SystemExit(f'WEIBO_FETCH_FAILED {error}')
if __name__=='__main__':main()
