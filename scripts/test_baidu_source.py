import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from fetch_extra_hotspots import parse_source
class BaiduTests(unittest.TestCase):
 def test_parse(self):
  rows=[{'word':'置顶新闻','isTop':True},{'word':'测试热搜','hotScore':'12345'},{'word':'测试热搜','hotScore':'12345'},{'word':'另一条热搜','hotScore':'9876'}]
  body=('<!--s-data:'+json.dumps({'data':{'cards':[{'component':'hotList','content':rows}]}})+'-->').encode()
  items=parse_source('baidu',body)
  self.assertEqual(len(items),2);self.assertEqual(items[0]['meta'],'热度 12345');self.assertIn('wd=%',items[0]['url'])
 def test_invalid(self):
  with self.assertRaises(ValueError):parse_source('baidu',b'<html>empty</html>')
 def test_integration(self):
  root=Path(__file__).resolve().parents[1]
  self.assertIn("'bilibili','baidu','tieba'",(root/'src/components/NavigationLinks.vue').read_text(encoding='utf8'))
  self.assertIn("baidu:{name:'百度热搜'",(root/'src/components/SourceNewsCard.vue').read_text(encoding='utf8'))
if __name__=='__main__':unittest.main()
