import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_markets as m
class Tests(unittest.TestCase):
 def test_price_change(self):
  row={'chart':{'result':[{'meta':{'regularMarketPrice':110,'chartPreviousClose':100,'regularMarketTime':1793400000,'currency':'USD'},'indicators':{'quote':[{'close':[100,None,110]}]}}]}}
  q=m.normalize(row,('TEST','Test','美股','stock'));self.assertEqual(q['changePercent'],10);self.assertEqual(q['series'],[100,110]);self.assertEqual(q['currency'],'USD')
 def test_crypto_catalog(self):
  self.assertEqual(len(m.CRYPTO_ASSETS),34);self.assertEqual(len({x[0] for x in m.CRYPTO_ASSETS}),34)
  for symbol,ticker,zh,en in m.CRYPTO_ASSETS:
   self.assertTrue(ticker);self.assertTrue(en);self.assertTrue(any('\u4e00'<=c<='\u9fff' for c in zh));self.assertIn(symbol,m.CRYPTO_NAMES)
  self.assertIn('POL28321-USD',m.CRYPTO_NAMES);self.assertNotIn('POL-USD',m.CRYPTO_NAMES)
 def test_crypto_bilingual(self):
  row={'chart':{'result':[{'meta':{'regularMarketPrice':0.00000497,'previousClose':0.00000490,'regularMarketTime':1793400000,'currency':'USD'}}]}}
  config=next(c for c in m.SYMBOLS if c[0]=='PEPE24478-USD');q=m.normalize(row,config)
  self.assertEqual(q['nameZh'],'佩佩币');self.assertEqual(q['nameEn'],'Pepe');self.assertEqual(q['ticker'],'PEPE');self.assertGreater(q['price'],0);self.assertIn('PEPE24478-USD',q['url'])
 def test_quote_retry(self):
  import io
  row={'chart':{'result':[{'meta':{'regularMarketPrice':1,'previousClose':0.9,'regularMarketTime':1793400000,'currency':'USD'}}]}}
  with patch.object(m.urllib.request,'urlopen',side_effect=[OSError('temporary'),io.BytesIO(json.dumps(row).encode())]) as request:q=m.fetch(next(c for c in m.SYMBOLS if c[0]=='HBAR-USD'))
  self.assertEqual(q['nameEn'],'Hedera');self.assertEqual(request.call_count,2)
 def test_invalid(self):
  for price in [None,float('nan'),-1,True]:
   with self.assertRaises(ValueError):m.normalize({'chart':{'result':[{'meta':{'regularMarketPrice':price}}]}},('X','X','美股','stock'))
 def test_constant(self):
  self.assertFalse(m.number(float('inf')));self.assertFalse(m.number(True));self.assertTrue(m.number(0))
 def test_outage_cache(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'m.json';old={'symbol':m.SYMBOLS[0][0],'price':12,'quoteAt':'2026-10-30T00:00:00Z'};p.write_text(json.dumps({'items':[old]}))
   with patch('sys.argv',['fetch','--output',str(p),'--skip-caps']),patch.object(m,'fetch',side_effect=OSError('offline')):m.main()
   self.assertEqual(json.loads(p.read_text())['items'],[old])
 def test_root_output_enriches_caps(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'markets.json';row={'symbol':'AAPL','kind':'stock','price':100}
   with patch('sys.argv',['fetch','--output',str(p)]),patch.object(m,'fetch',return_value=row),patch.object(m,'enrich_market_caps',return_value=[{**row,'marketCapUsd':500}]) as enrich:
    m.main()
   enrich.assert_called_once();self.assertEqual(enrich.call_args.args[2],p.parent/'exchange-rates.json')
   self.assertEqual(json.loads(p.read_text())['items'][0]['marketCapUsd'],500)
if __name__=='__main__':unittest.main()
