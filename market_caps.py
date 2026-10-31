"""Optional market-cap enrichment. No cap is inferred from price or index levels."""
import json,math,urllib.request
from datetime import datetime,timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
CG_IDS=dict(zip(['BTC','ETH','SOL','BNB','XRP','DOGE','ADA','AVAX','TRX','DOT','LINK','LTC','BCH','XLM','TON','HBAR','SUI','NEAR','APT','ICP','UNI','AAVE','FIL','ATOM','ETC','VET','SHIB','PEPE','USDT','USDC','DAI','POL','ARB','OP'],['bitcoin','ethereum','solana','binancecoin','ripple','dogecoin','cardano','avalanche-2','tron','polkadot','chainlink','litecoin','bitcoin-cash','stellar','the-open-network','hedera-hashgraph','sui','near','aptos','internet-computer','uniswap','aave','filecoin','cosmos','ethereum-classic','vechain','shiba-inu','pepe','tether','usd-coin','dai','polygon-ecosystem-token','arbitrum','optimism']))
STOCKS={'600519.SS':('600519',1,'CNY'),'300750.SZ':('300750',0,'CNY'),'AAPL':('AAPL',105,'USD'),'MSFT':('MSFT',105,'USD'),'NVDA':('NVDA',105,'USD')}
FIELDS=['marketCapUsd','marketCap','marketCapCurrency','marketCapSource','marketCapFetchedAt','marketCapQuoteAt','marketCapFxAt']
def positive(value):return isinstance(value,(int,float)) and not isinstance(value,bool) and math.isfinite(value) and value>0
def request_json(url):
 headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'}
 if 'eastmoney.com/' in url:headers['Referer']='https://quote.eastmoney.com/'
 error=None
 for _ in range(2):
  try:
   req=urllib.request.Request(url,headers=headers)
   with urllib.request.urlopen(req,timeout=18) as r:return json.loads(r.read(2_000_000))
  except Exception as exc:error=exc
 raise error
def crypto_caps(rows,tickers):
 if not isinstance(rows,list):raise ValueError('Invalid CoinGecko data')
 expected={CG_IDS[t]:t for t in tickers if t in CG_IDS};caps={};now=datetime.now(timezone.utc).isoformat()
 for row in rows:
  if not isinstance(row,dict):continue
  ticker=expected.get(row.get('id'))
  # Provider renames or symbol collisions must not silently attach another asset's cap.
  if not ticker or str(row.get('symbol','')).upper()!=ticker or not positive(row.get('market_cap')):continue
  entry={'marketCapUsd':row['market_cap'],'marketCap':row['market_cap'],'marketCapCurrency':'USD','marketCapSource':'CoinGecko','marketCapFetchedAt':now}
  try:
   d=datetime.fromisoformat(str(row.get('last_updated','')).replace('Z','+00:00'))
   if d.tzinfo:entry['marketCapQuoteAt']=d.astimezone(timezone.utc).isoformat()
  except ValueError:pass
  caps[ticker]=entry
 return caps
def stock_caps(payload,fx):
 if not isinstance(payload,dict) or payload.get('rc')!=0 or not isinstance((payload.get('data') or {}).get('diff'),list):raise ValueError('Invalid Eastmoney data')
 rates=fx.get('rates',{}) if isinstance(fx,dict) and fx.get('base')=='USD' else {};cny=rates.get('CNY');caps={};now=datetime.now(timezone.utc).isoformat()
 reverse={(code,market):(symbol,currency) for symbol,(code,market,currency) in STOCKS.items()}
 for row in payload['data']['diff']:
  if not isinstance(row,dict):continue
  config=reverse.get((str(row.get('f12')),row.get('f13')));value=row.get('f20')
  if not config or not positive(value):continue
  symbol,currency=config
  if currency=='CNY' and not positive(cny):continue
  cap=value/cny if currency=='CNY' else value
  entry={'marketCapUsd':cap,'marketCap':value,'marketCapCurrency':currency,'marketCapSource':'Eastmoney','marketCapFetchedAt':now}
  if currency=='CNY':entry['marketCapFxAt']=fx.get('date','')
  caps[symbol]=entry
 return caps
def nasdaq_cap(payload,symbol):
 data=payload.get('data') if isinstance(payload,dict) else None
 if not isinstance(data,dict) or data.get('symbol')!=symbol or symbol not in ['AAPL','MSFT','NVDA']:raise ValueError('Invalid Nasdaq identity')
 raw=(data.get('summaryData') or {}).get('MarketCap',{}).get('value','')
 try:value=float(str(raw).replace(',','').replace('$',''))
 except ValueError:raise ValueError('Invalid Nasdaq market cap')
 if not positive(value):raise ValueError('Invalid Nasdaq market cap')
 return {'marketCapUsd':value,'marketCap':value,'marketCapCurrency':'USD','marketCapSource':'Nasdaq','marketCapFetchedAt':datetime.now(timezone.utc).isoformat()}

def enrich_market_caps(items,previous,fx_path):
 tickers=[r.get('ticker') for r in items if r.get('kind')=='crypto'];caps={};errors=[]
 def get_crypto():
  ids=','.join(CG_IDS[t] for t in tickers if t in CG_IDS)
  if not ids:return {}
  return crypto_caps(request_json('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids='+ids+'&per_page=100&page=1&sparkline=false'),tickers)
 def get_stocks():
  try:fx=json.loads(Path(fx_path).read_text(encoding='utf-8-sig'))
  except (OSError,ValueError):fx={}
  ids=','.join(str(STOCKS[r['symbol']][1])+'.'+STOCKS[r['symbol']][0] for r in items if r.get('symbol') in STOCKS)
  if not ids:return {}
  try:result=stock_caps(request_json('https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f12,f14,f20,f13&secids='+ids),fx)
  except Exception as e:print('EASTMONEY_CAP_PRESERVED '+str(e));result={}
  missing=[r['symbol'] for r in items if r.get('symbol') in ['AAPL','MSFT','NVDA'] and r['symbol'] not in result]
  def nasdaq(symbol):
   try:return symbol,nasdaq_cap(request_json('https://api.nasdaq.com/api/quote/'+symbol+'/summary?assetclass=stocks'),symbol)
   except Exception:return symbol,None
  with ThreadPoolExecutor(max_workers=3) as pool:
   for symbol,cap in pool.map(nasdaq,missing):
    if cap:result[symbol]=cap
  return result
 with ThreadPoolExecutor(max_workers=2) as pool:
  futures=[pool.submit(get_crypto),pool.submit(get_stocks)]
  for future in futures:
   try:caps.update(future.result())
   except Exception as e:errors.append(type(e).__name__);print('MARKET_CAP_PRESERVED '+str(e))
 result=[]
 for row in items:
  record=dict(row)
  for field in FIELDS:record.pop(field,None)
  record.pop('marketCapPreserved',None)
  if row.get('kind')=='index':result.append(record);continue
  cap=caps.get(row.get('ticker') if row.get('kind')=='crypto' else row.get('symbol'))
  if cap:record.update(cap)
  else:
   old=previous.get(row.get('symbol'),{})
   if positive(old.get('marketCapUsd')) and old.get('marketCapSource') in ['CoinGecko','Eastmoney','Nasdaq']:
    record.update({k:old[k] for k in FIELDS if k in old});record['marketCapPreserved']=True
  result.append(record)
 return result
