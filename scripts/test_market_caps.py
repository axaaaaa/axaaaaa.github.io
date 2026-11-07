import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import market_caps as m
class Tests(unittest.TestCase):
 def test_crypto_cap_and_identity(self):
  data=[{'id':'bitcoin','symbol':'btc','market_cap':100,'last_updated':'2026-10-31T12:00:00Z'},{'id':'ethereum','symbol':'fake','market_cap':300},{'id':'solana','symbol':'sol','market_cap':True}];caps=m.crypto_caps(data,['BTC','ETH','SOL']);self.assertEqual(caps['BTC']['marketCapUsd'],100);self.assertEqual(set(caps),{'BTC'})
 def test_currency_conversion(self):
  p={'rc':0,'data':{'diff':[{'f12':'600519','f13':1,'f20':700},{'f12':'AAPL','f13':105,'f20':500}]}};r=m.stock_caps(p,{'base':'USD','rates':{'CNY':7},'date':'2026-10-30'});self.assertEqual(r['600519.SS']['marketCapUsd'],100);self.assertEqual(r['AAPL']['marketCapUsd'],500);self.assertEqual(r['600519.SS']['marketCapFxAt'],'2026-10-30')
 def test_fx_missing(self):
  p={'rc':0,'data':{'diff':[{'f12':'600519','f13':1,'f20':700}]}};self.assertEqual(m.stock_caps(p,{}),{})
 def test_outage_preserves_original_cap_time(self):
  old={'AAPL':{'marketCapUsd':500,'marketCapSource':'Eastmoney','marketCapFetchedAt':'2026-10-30T00:00:00Z'}}
  with tempfile.TemporaryDirectory() as t,patch.object(m,'request_json',side_effect=OSError('offline')):r=m.enrich_market_caps([{'symbol':'AAPL','kind':'stock','price':1}],old,Path(t)/'missing.json')
  self.assertEqual(r[0]['marketCapUsd'],500);self.assertTrue(r[0]['marketCapPreserved']);self.assertEqual(r[0]['marketCapFetchedAt'],'2026-10-30T00:00:00Z')
 def test_indices_and_missing_not_fabricated(self):
  with tempfile.TemporaryDirectory() as t,patch.object(m,'request_json',return_value={'rc':0,'data':{'diff':[]}}):r=m.enrich_market_caps([{'symbol':'IDX','kind':'index','price':100,'marketCapUsd':999},{'symbol':'AAPL','kind':'stock','price':100}],{},Path(t)/'missing.json')
  self.assertTrue(all('marketCapUsd' not in row for row in r))
 def test_nasdaq_identity(self):
  data={'data':{'symbol':'AAPL','summaryData':{'MarketCap':{'value':'5,000'}}}};self.assertEqual(m.nasdaq_cap(data,'AAPL')['marketCapUsd'],5000)
  with self.assertRaises(ValueError):m.nasdaq_cap(data,'NVDA')
 def test_symbol_collision_rejected(self):
  self.assertEqual(m.crypto_caps([{'id':'the-open-network','symbol':'gram','name':'Gram (prev. Toncoin)','market_cap':100}],['TON']),{})
if __name__=='__main__':unittest.main()
