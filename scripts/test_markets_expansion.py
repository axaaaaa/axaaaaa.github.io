"""Coverage for the expanded A-share/US stock catalog and the Eastmoney quote fallback."""
import sys,unittest
from collections import Counter
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_markets as m
import market_caps as mc

class CatalogTests(unittest.TestCase):
 def test_catalog(self):
  counts=Counter((row[2],row[3]) for row in m.SYMBOLS)
  self.assertEqual(counts[('A 股','index')],3)
  self.assertEqual(counts[('A 股','stock')],14)
  self.assertEqual(counts[('美股','index')],3)
  self.assertEqual(counts[('美股','stock')],12)
  self.assertEqual(counts[('加密货币','crypto')],34)
  self.assertEqual(len({row[0] for row in m.SYMBOLS}),len(m.SYMBOLS))
 def test_original_and_new_symbols(self):
  symbols={row[0] for row in m.SYMBOLS}
  for symbol in ['600519.SS','300750.SZ','AAPL','MSFT','NVDA','601318.SS','GOOGL','NFLX']:
   self.assertIn(symbol,symbols)
 def test_secid(self):
  self.assertEqual(m.eastmoney_secid('601318.SS'),'1.601318')
  self.assertEqual(m.eastmoney_secid('002594.SZ'),'0.002594')
  self.assertEqual(m.eastmoney_secid('GOOGL'),'105.GOOGL')

class FallbackTests(unittest.TestCase):
 def test_normalize(self):
  q=m.normalize_eastmoney({'f2':11,'f18':10,'f124':1794557495},('AAPL','Apple','美股','stock'))
  self.assertEqual(q['price'],11);self.assertEqual(q['changePercent'],10)
  self.assertEqual(q['currency'],'USD');self.assertEqual(q['series'],[])
  self.assertEqual(q['quoteSource'],'Eastmoney')
  with self.assertRaises(ValueError):m.normalize_eastmoney({'f2':'-','f18':10,'f124':1},('X','X','美股','stock'))
 def test_yahoo_outage_uses_eastmoney(self):
  config=next(c for c in m.SYMBOLS if c[0]=='601318.SS')
  with patch.object(m.urllib.request,'urlopen',side_effect=OSError('yahoo blocked')),patch.object(m,'eastmoney_quote',return_value={'f2':10.5,'f18':10.0,'f124':1794557495}) as fallback:
   q=m.fetch(config)
  self.assertEqual(q['price'],10.5);self.assertEqual(q['currency'],'CNY')
  self.assertAlmostEqual(q['changePercent'],5.0)
  fallback.assert_called_once_with('601318.SS')
 def test_index_never_uses_stock_fallback(self):
  config=next(c for c in m.SYMBOLS if c[0]=='^GSPC')
  with patch.object(m.urllib.request,'urlopen',side_effect=OSError('offline')),patch.object(m,'eastmoney_quote') as fallback:
   with self.assertRaises(OSError):m.fetch(config)
  fallback.assert_not_called()

class CapTests(unittest.TestCase):
 def test_identity(self):
  self.assertEqual(mc.stock_identity('002594.SZ'),('002594',0,'CNY'))
  self.assertEqual(mc.stock_identity('601318.SS'),('601318',1,'CNY'))
  self.assertEqual(mc.stock_identity('GOOGL'),('GOOGL',105,'USD'))
 def test_dynamic_stock_caps(self):
  stocks={'002594.SZ':mc.stock_identity('002594.SZ'),'GOOGL':mc.stock_identity('GOOGL')}
  payload={'rc':0,'data':{'diff':[{'f12':'002594','f13':0,'f20':700},{'f12':'GOOGL','f13':105,'f20':500}]}}
  caps=mc.stock_caps(payload,{'base':'USD','rates':{'CNY':7},'date':'2026-11-13'},stocks)
  self.assertEqual(caps['002594.SZ']['marketCapUsd'],100)
  self.assertEqual(caps['GOOGL']['marketCapUsd'],500)
 def test_nasdaq_accepts_new_tickers(self):
  data={'data':{'symbol':'GOOGL','summaryData':{'MarketCap':{'value':'3,000'}}}}
  self.assertEqual(mc.nasdaq_cap(data,'GOOGL')['marketCapUsd'],3000)
  with self.assertRaises(ValueError):mc.nasdaq_cap(data,'AAPL')

if __name__=='__main__':unittest.main()
