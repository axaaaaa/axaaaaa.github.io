"""Xueqiu public timeline JSON; warm up a session cookie and preserve last successful data."""
import argparse,http.cookiejar,json,re,urllib.request
from pathlib import Path
from datetime import datetime,timezone
HOME='https://xueqiu.com/about'
API='https://xueqiu.com/v4/statuses/public_timeline_by_category.json?since_id=-1&max_id=-1&count=20&category=-1'
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
def clean_text(value):
    """去掉 HTML 标签并压缩空白，保留一行可读文本。"""
    if not isinstance(value,str):return ''
    return ' '.join(re.sub(r'<[^>]+>',' ',value).split())
def normalize(data):
    """把雪球时间线转换为卡片使用的条目列表。"""
    rows=data.get('list') if isinstance(data,dict) else None
    if not isinstance(rows,list):raise ValueError('Invalid timeline response')
    items=[];seen=set()
    for row in rows:
        payload=row.get('data') if isinstance(row,dict) else None
        if isinstance(payload,str):
            try:payload=json.loads(payload)
            except ValueError:continue
        if not isinstance(payload,dict):continue
        target=payload.get('target')
        if not isinstance(target,str) or not target.startswith('/'):continue
        title=clean_text(payload.get('title')) or clean_text(payload.get('description'))
        if not title or title in seen:continue
        seen.add(title)
        user=payload.get('user') if isinstance(payload.get('user'),dict) else {}
        replies=payload.get('reply_count');likes=payload.get('like_count')
        items.append({'rank':len(items)+1,'title':title[:120],'url':'https://xueqiu.com'+target,'author':clean_text(user.get('screen_name')),'replies':replies if isinstance(replies,int) and replies>=0 else 0,'likes':likes if isinstance(likes,int) and likes>=0 else 0})
        if len(items)>=30:break
    if not items:raise ValueError('No valid posts')
    return items
def fetch():
    """先访问公开页获取会话 Cookie，再请求时间线接口。"""
    jar=http.cookiejar.CookieJar();opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    with opener.open(urllib.request.Request(HOME,headers={'User-Agent':UA}),timeout=25) as response:response.read(1)
    request=urllib.request.Request(API,headers={'User-Agent':UA,'Referer':'https://xueqiu.com/','Accept':'application/json, text/plain, */*'})
    with opener.open(request,timeout=25) as response:return json.loads(response.read(2_000_000))
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/xueqiu-hot.json');out=Path(parser.parse_args().output)
    try:
        items=normalize(fetch())
        out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print(f'XUEQIU_OK items={len(items)}')
    except Exception as error:
        if out.exists():
            try:
                old=json.loads(out.read_text(encoding='utf-8-sig'))
                if old.get('items') and old.get('updatedAt'):print(f'XUEQIU_PRESERVED previous data: {error}');return
            except (ValueError,OSError):pass
        raise SystemExit(f'XUEQIU_FETCH_FAILED {error}')
if __name__=='__main__':main()
