"""Fetch timestamped Yahoo Finance snapshots, retaining failed symbols individually."""
import argparse,json,math,urllib.request
from threading import Lock
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from pathlib import Path
from market_caps import enrich_market_caps
CRYPTO_ASSETS=[('BTC-USD', 'BTC', '比特币', 'Bitcoin'), ('ETH-USD', 'ETH', '以太坊', 'Ethereum'), ('SOL-USD', 'SOL', '索拉纳', 'Solana'), ('BNB-USD', 'BNB', '币安币', 'BNB'), ('XRP-USD', 'XRP', '瑞波币', 'XRP'), ('DOGE-USD', 'DOGE', '狗狗币', 'Dogecoin'), ('ADA-USD', 'ADA', '艾达币', 'Cardano'), ('AVAX-USD', 'AVAX', '雪崩币', 'Avalanche'), ('TRX-USD', 'TRX', '波场币', 'TRON'), ('DOT-USD', 'DOT', '波卡币', 'Polkadot'), ('LINK-USD', 'LINK', '链环币', 'Chainlink'), ('LTC-USD', 'LTC', '莱特币', 'Litecoin'), ('BCH-USD', 'BCH', '比特币现金', 'Bitcoin Cash'), ('XLM-USD', 'XLM', '恒星币', 'Stellar'), ('TON11419-USD', 'GRAM', '开放网络币', 'Gram (原 Toncoin)'), ('HBAR-USD', 'HBAR', '哈希图币', 'Hedera'), ('SUI20947-USD', 'SUI', 'Sui币', 'Sui'), ('NEAR-USD', 'NEAR', '近协议', 'NEAR Protocol'), ('APT21794-USD', 'APT', 'Aptos币', 'Aptos'), ('ICP-USD', 'ICP', '互联网计算机', 'Internet Computer'), ('UNI7083-USD', 'UNI', 'Uniswap币', 'Uniswap'), ('AAVE-USD', 'AAVE', 'Aave币', 'Aave'), ('FIL-USD', 'FIL', '文件币', 'Filecoin'), ('ATOM-USD', 'ATOM', '阿童木', 'Cosmos'), ('ETC-USD', 'ETC', '以太经典', 'Ethereum Classic'), ('VET-USD', 'VET', '唯链币', 'VeChain'), ('SHIB-USD', 'SHIB', '柴犬币', 'Shiba Inu'), ('PEPE24478-USD', 'PEPE', '佩佩币', 'Pepe'), ('USDT-USD', 'USDT', '泰达币', 'Tether USDt'), ('USDC-USD', 'USDC', '美元硬币', 'USD Coin'), ('DAI-USD', 'DAI', '戴币', 'Dai'), ('POL28321-USD', 'POL', 'Polygon生态代币', 'Polygon (prev. MATIC)'), ('ARB11841-USD', 'ARB', 'Arbitrum币', 'Arbitrum'), ('OP-USD', 'OP', 'Optimism币', 'Optimism')]
CRYPTO_NAMES={symbol:{'ticker':ticker,'nameZh':zh,'nameEn':en} for symbol,ticker,zh,en in CRYPTO_ASSETS}
A_SHARE_STOCKS=[('600519.SS','贵州茅台'),('300750.SZ','宁德时代'),('601318.SS','中国平安'),('600036.SS','招商银行'),('000858.SZ','五粮液'),('002594.SZ','比亚迪'),('600900.SS','长江电力'),('601899.SS','紫金矿业'),('000333.SZ','美的集团'),('300059.SZ','东方财富'),('601012.SS','隆基绿能'),('600276.SS','恒瑞医药'),('002415.SZ','海康威视'),('601988.SS','中国银行')]
US_STOCKS=[('GOOGL','Alphabet'),('AMZN','Amazon'),('META','Meta'),('TSLA','Tesla'),('AVGO','Broadcom'),('WMT','Walmart'),('COST','Costco'),('AMD','AMD'),('NFLX','Netflix')]
SYMBOLS=[('000001.SS','上证指数','A 股','index'),('399001.SZ','深证成指','A 股','index'),('399006.SZ','创业板指','A 股','index')]+[(symbol,name,'A 股','stock') for symbol,name in A_SHARE_STOCKS]+[('^GSPC','标普 500','美股','index'),('^IXIC','纳斯达克综合','美股','index'),('^DJI','道琼斯工业','美股','index'),('AAPL','Apple','美股','stock'),('MSFT','Microsoft','美股','stock'),('NVDA','NVIDIA','美股','stock')]+[(symbol,name,'美股','stock') for symbol,name in US_STOCKS]+[(symbol,zh+' '+en,'加密货币','crypto') for symbol,ticker,zh,en in CRYPTO_ASSETS]

def number(n):return isinstance(n,(int,float)) and not isinstance(n,bool) and math.isfinite(n)
def normalize(data,config):
    symbol,name,category,kind=config
    result=data['chart']['result'][0];m=result['meta'];price=m.get('regularMarketPrice');previous=m.get('previousClose',m.get('chartPreviousClose'));timestamp=m.get('regularMarketTime')
    if not number(price) or price<=0 or not number(previous) or previous<=0 or not number(timestamp):raise ValueError('Missing valid price, previous close or quote time')
    values=result.get('indicators',{}).get('quote',[{}])[0].get('close',[])
    change=price-previous
    return {**CRYPTO_NAMES.get(symbol,{}),'symbol':symbol,'name':name,'category':category,'kind':kind,'currency':m.get('currency',''),'price':price,'previousClose':previous,'change':change,'changePercent':change/previous*100,'quoteAt':datetime.fromtimestamp(timestamp,timezone.utc).isoformat(),'fetchedAt':datetime.now(timezone.utc).isoformat(),'series':[n for n in values if number(n)][-48:],'url':'https://finance.yahoo.com/quote/'+quote(symbol,safe='')+'/'}
_EAST_CACHE=None
_EAST_LOCK=Lock()
def eastmoney_secid(symbol):
    if symbol.endswith('.SS'):return '1.'+symbol[:-3]
    if symbol.endswith('.SZ'):return '0.'+symbol[:-3]
    return '105.'+symbol
def _eastmoney_quotes():
    stocks=[c[0] for c in SYMBOLS if c[3]=='stock']
    url='https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f12,f13,f14,f2,f18,f124&secids='+','.join(eastmoney_secid(s) for s in stocks)
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://quote.eastmoney.com/','Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=20) as r:data=json.loads(r.read(2_000_000))
    if not isinstance(data,dict) or data.get('rc')!=0:raise ValueError('Invalid Eastmoney quote response')
    rows=(data.get('data') or {}).get('diff') or []
    by_secid={str(row.get('f13'))+'.'+str(row.get('f12')):row for row in rows if isinstance(row,dict)}
    return {symbol:by_secid[eastmoney_secid(symbol)] for symbol in stocks if eastmoney_secid(symbol) in by_secid}
def eastmoney_quote(symbol):
    global _EAST_CACHE
    with _EAST_LOCK:
        if _EAST_CACHE is None:
            try:_EAST_CACHE=_eastmoney_quotes()
            except Exception as error:
                print(f'EASTMONEY_FALLBACK_UNAVAILABLE {error}');_EAST_CACHE={}
        return _EAST_CACHE.get(symbol)
def normalize_eastmoney(row,config):
    symbol,name,category,kind=config
    price=row.get('f2');previous=row.get('f18');timestamp=row.get('f124')
    if not number(price) or price<=0 or not number(previous) or previous<=0 or not number(timestamp) or timestamp<=0:raise ValueError('Missing valid Eastmoney quote')
    change=price-previous
    return {**CRYPTO_NAMES.get(symbol,{}),'symbol':symbol,'name':name,'category':category,'kind':kind,'currency':'CNY' if symbol.endswith(('.SS','.SZ')) else 'USD','price':price,'previousClose':previous,'change':change,'changePercent':change/previous*100,'quoteAt':datetime.fromtimestamp(timestamp,timezone.utc).isoformat(),'fetchedAt':datetime.now(timezone.utc).isoformat(),'series':[],'url':'https://finance.yahoo.com/quote/'+quote(symbol,safe='')+'/','quoteSource':'Eastmoney'}
def fetch(config):
    symbol=config[0];url='https://query1.finance.yahoo.com/v8/finance/chart/'+quote(symbol,safe='')+'?interval=30m&range=1d&includePrePost=false'
    error=None
    for host in ['query1.finance.yahoo.com','query2.finance.yahoo.com']:
        req=urllib.request.Request(url.replace('query1.finance.yahoo.com',host),headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=20) as r:return normalize(json.loads(r.read(2_000_000)),config)
        except Exception as exc:error=exc
    if config[3]=='stock':
        row=eastmoney_quote(symbol)
        if row:
            try:return normalize_eastmoney(row,config)
            except Exception as exc:print(f'EASTMONEY_QUOTE_INVALID {symbol}: {exc}')
    raise error
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/markets.json');parser.add_argument('--skip-caps',action='store_true');args=parser.parse_args();out=Path(args.output);previous={}
    if out.exists():
        try:previous={i['symbol']:i for i in json.loads(out.read_text(encoding='utf-8-sig')).get('items',[])}
        except (ValueError,OSError,KeyError,TypeError):pass
    def load(config):
        try:return fetch(config)
        except Exception as e:
            print(f'MARKET_PRESERVED {config[0]}: {e}');old=previous.get(config[0])
            return {**old,**CRYPTO_NAMES[config[0]],'name':config[1]} if old and config[0] in CRYPTO_NAMES else old
    with ThreadPoolExecutor(max_workers=6) as pool:items=[i for i in pool.map(load,SYMBOLS) if i]
    if not items:raise SystemExit('No market snapshots available')
    # Both the source checkout (public/) and the deployed checkout (repository root)
    # collect caps. Offline callers must explicitly request --skip-caps.
    if not args.skip_caps:items=enrich_market_caps(items,previous,out.parent/'exchange-rates.json')
    eligible=[i for i in items if i.get('kind')!='index']
    missing_symbols=[i['symbol'] for i in eligible if not number(i.get('marketCapUsd')) or i.get('marketCapUsd',0)<=0]
    missing=len(missing_symbols)
    print(f'MARKET_CAP_COVERAGE available={len(eligible)-missing} total={len(eligible)}')
    if missing and not args.skip_caps:print(f'MARKET_CAP_PRESERVED missing={missing} symbols={','.join(missing_symbols)}')
    out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'updatedAt':datetime.now(timezone.utc).isoformat(),'source':' + '.join(sorted({i['quoteSource'] for i in items if i.get('quoteSource')}) or ['Yahoo Finance']),'items':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print(f'MARKETS_OK items={len(items)}')
if __name__=='__main__':main()
