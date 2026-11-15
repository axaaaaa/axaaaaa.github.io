"""Offline coverage for the keyless JSON API sources used by 信息收集."""
import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from fetch_extra_hotspots import SOURCES,parse_source

class FearGreedTests(unittest.TestCase):
 def payload(self,rows,error=None):
  return json.dumps({'name':'Fear and Greed Index','data':rows,'metadata':{'error':error}}).encode()
 def test_parse(self):
  rows=[{'value':'20','value_classification':'Extreme Fear','timestamp':'1794528000'},
        {'value':'28','value_classification':'Fear','timestamp':'1794441600'},
        {'value':'29','value_classification':'Neutral','timestamp':'1794355200'},
        {'value':'bad','value_classification':'Greed','timestamp':'x'}]
  items=parse_source('fng',self.payload(rows))
  self.assertEqual(len(items),3)
  self.assertEqual(items[0]['title'],'恐贪指数 20 · 极度恐惧')
  self.assertIn('2026-11-13',items[0]['meta'])
  self.assertIn('较前日 -8',items[0]['meta'])
  self.assertIn('较前日 -1',items[1]['meta'])
  self.assertNotIn('较前日',items[2]['meta'])
  self.assertIn('#day-1794528000',items[0]['url'])
  self.assertEqual(len({row['url'] for row in items}),3)
 def test_rejects_invalid(self):
  with self.assertRaises(ValueError):parse_source('fng',self.payload([],error='rate limited'))
  with self.assertRaises(ValueError):parse_source('fng',b'{"data":"oops"}')
  with self.assertRaises(ValueError):parse_source('fng',self.payload([]))

class EastmoneyTests(unittest.TestCase):
 def payload(self,diff,rc=0):
  return json.dumps({'rc':rc,'data':{'total':len(diff),'diff':diff}}).encode()
 def test_parse(self):
  diff=[{'f2':17.99,'f3':20.01,'f6':1035916918.27,'f12':'300528','f14':'幸福蓝海'},
        {'f2':9.5,'f3':5.2,'f6':12345678,'f12':'600000','f14':'浦发银行'},
        {'f2':'-','f3':1.0,'f12':'000001','f14':'无效行情'}]
  items=parse_source('eastmoney',self.payload(diff))
  self.assertEqual(len(items),2)
  self.assertEqual(items[0]['title'],'幸福蓝海 300528')
  self.assertIn('+20.01%',items[0]['meta'])
  self.assertIn('成交 10.36 亿',items[0]['meta'])
  self.assertTrue(items[0]['url'].endswith('sz300528.html'))
  self.assertTrue(items[1]['url'].endswith('sh600000.html'))
  self.assertIn('成交 1235 万',items[1]['meta'])
 def test_rejects_invalid(self):
  with self.assertRaises(ValueError):parse_source('eastmoney',self.payload([],rc=100))
  with self.assertRaises(ValueError):parse_source('eastmoney',b'{"rc":0,"data":{"diff":[]}}')
  with self.assertRaises(ValueError):parse_source('eastmoney',self.payload([{'f12':'abc','f14':'无代码'}]))

class WiringTests(unittest.TestCase):
 def setUp(self):
  self.root=Path(__file__).resolve().parents[1]
 def test_sources_registered(self):
  for key in ['fng','eastmoney']:
   self.assertIn(key,SOURCES)
   self.assertTrue(SOURCES[key]['endpoint'].startswith('https://'))
 def test_frontend_wiring(self):
  if not (self.root/'src/components/NavigationLinks.vue').is_file():
   self.skipTest('frontend source files are not part of the published static site')
  nav=(self.root/'src/components/NavigationLinks.vue').read_text(encoding='utf8')
  card=(self.root/'src/components/SourceNewsCard.vue').read_text(encoding='utf8')
  themes=(self.root/'src/utils/source-card-themes.mjs').read_text(encoding='utf8')
  self.assertIn("sources:['yicai','sinafinance','woshipm','fng','eastmoney','xueqiu']",nav)
  self.assertIn("'pojie52','yicai','woshipm'",nav)
  self.assertIn("fng:{name:'恐惧贪婪指数'",card)
  self.assertIn("eastmoney:{name:'东方财富",card)
  self.assertIn("'fng', 'eastmoney'",themes)

if __name__=='__main__':unittest.main()
