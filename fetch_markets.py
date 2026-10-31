"""Fetch timestamped Yahoo Finance snapshots, retaining failed symbols individually."""
import argparse,json,math,urllib.request
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from pathlib import Path
SYMBOLS=[('000001.SS','上证指数','A 股','index'),('399001.SZ','深证成指','A 股','index'),('399006.SZ','创业板指','A 股','index'),('600519.SS','贵州茅台','A 股','stock'),('300750.SZ','宁德时代','A 股','stock'),('^GSPC','标普 500','美股','index'),('^IXIC','纳斯达克综合','美股','index'),('^DJI','道琼斯工业','美股','index'),('AAPL','Apple','美股','stock'),('MSFT','Microsoft','美股','stock'),('NVDA','NVIDIA','美股','stock'),('BTC-USD','Bitcoin','加密货币','crypto'),('ETH-USD','Ethereum','加密货币','crypto'),('SOL-USD','Solana','加密货币','crypto')]
def number(n):return isinstance(n,(int,float)) and not isinstance(n,bool) and math.isfinite(n)
def normalize(data,config):
    symbol,name,category,kind=config
    result=data['chart']['result'][0];m=result['meta'];price=m.get('regularMarketPrice');previous=m.get('previousClose',m.get('chartPreviousClose'));timestamp=m.get('regularMarketTime')
    if not number(price) or price<=0 or not number(previous) or previous<=0 or not number(timestamp):raise ValueError('Missing valid price, previous close or quote time')
    values=result.get('indicators',{}).get('quote',[{}])[0].get('close',[])
    change=price-previous
    return {'symbol':symbol,'name':name,'category':category,'kind':kind,'currency':m.get('currency',''),'price':price,'previousClose':previous,'change':change,'changePercent':change/previous*100,'quoteAt':datetime.fromtimestamp(timestamp,timezone.utc).isoformat(),'fetchedAt':datetime.now(timezone.utc).isoformat(),'series':[n for n in values if number(n)][-48:],'url':'https://finance.yahoo.com/quote/'+quote(symbol,safe='')+'/'}
def fetch(config):
    symbol=config[0];url='https://query1.finance.yahoo.com/v8/finance/chart/'+quote(symbol,safe='')+'?interval=30m&range=1d&includePrePost=false'
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=20) as r:return normalize(json.loads(r.read(2_000_000)),config)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/markets.json');out=Path(parser.parse_args().output);previous={}
    if out.exists():
        try:previous={i['symbol']:i for i in json.loads(out.read_text(encoding='utf-8-sig')).get('items',[])}
        except (ValueError,OSError,KeyError,TypeError):pass
    def load(config):
        try:return fetch(config)
        except Exception as e:
            print(f'MARKET_PRESERVED {config[0]}: {e}');return previous.get(config[0])
    with ThreadPoolExecutor(max_workers=6) as pool:items=[i for i in pool.map(load,SYMBOLS) if i]
    if not items:raise SystemExit('No market snapshots available')
    out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'updatedAt':datetime.now(timezone.utc).isoformat(),'source':'Yahoo Finance','items':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print(f'MARKETS_OK items={len(items)}')
if __name__=='__main__':main()
