import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from fetch_extra_hotspots import parse_source,SOURCES
class BaiduTests(unittest.TestCase):
 def board(self,rows):
  return json.dumps({'success':True,'data':{'cards':[{'component':'tabTextList','content':[{'content':rows}]}]}}).encode()
 def test_parse(self):
  rows=[{'word':'置顶新闻','isTop':True},
   {'word':'测试热搜','index':1,'newHotName':'新','url':'https://m.baidu.com/s?word=%E6%B5%8B%E8%AF%95&sa=fyb_news'},
   {'word':'另一条热搜','index':2,'url':'https://m.baidu.com/s?word=%E5%8F%A6&sa=fyb_news'},
   {'word':'缺链接条目','index':3}]
  items=parse_source('baidu',self.board(rows))
  self.assertEqual(len(items),3)
  self.assertEqual(items[0]['meta'],'热搜第 1 位 · 新')
  self.assertTrue(items[0]['url'].startswith('https://www.baidu.com/s?wd='))
  self.assertIn('sa=fyb_news',items[0]['url'])
  self.assertEqual(items[1]['meta'],'热搜第 2 位')
  self.assertIn('wd=%E7%BC%BA',items[2]['url'])
 def test_endpoint_is_json_api(self):
  self.assertIn('/api/board?platform=wise&tab=realtime',SOURCES['baidu']['endpoint'])
 def test_invalid(self):
  with self.assertRaises(ValueError):parse_source('baidu',b'{"success":false}')
  with self.assertRaises(ValueError):parse_source('baidu',self.board([{'word':'唯一置顶','isTop':True}]))
  with self.assertRaises(ValueError):parse_source('baidu',b'<html>empty</html>')
 @unittest.skipUnless((Path(__file__).resolve().parents[1]/'src/components/SourceNewsCard.vue').is_file(),'Vue integration requires source checkout')
 def test_integration(self):
  root=Path(__file__).resolve().parents[1]
  self.assertIn("'bilibili','baidu','tieba'",(root/'src/components/NavigationLinks.vue').read_text(encoding='utf8'))
  self.assertIn("baidu:{name:'百度热搜'",(root/'src/components/SourceNewsCard.vue').read_text(encoding='utf8'))
if __name__=='__main__':unittest.main()
