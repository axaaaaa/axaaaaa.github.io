import unittest
from fetch_extra_hotspots import parse_source

class AutoNewsTests(unittest.TestCase):
 def test_autohome_gbk_dedup_and_order(self):
  html='<meta charset="gb2312"><a href="//www.autohome.com.cn/news/202611/11.html#track">汽车旧闻</a><a href="//www.autohome.com.cn/news/202611/12.html"><h3>汽车新讯</h3><p>不应混入标题的正文</p></a><a href="//www.autohome.com.cn/news/202611/12.html?x=2">重复标题</a>'
  rows=parse_source('autohome',html.encode('gb18030'))
  self.assertEqual([x['title'] for x in rows],['汽车新讯','汽车旧闻'])
  self.assertTrue(rows[1]['url'].endswith('/11.html'))

 def test_dongchedi_and_pcauto(self):
  for key,path in [('dongchedi','/article/123'),('pcauto','/news/12/123.html')]:
   self.assertEqual(len(parse_source(key,f'<a href="{path}">汽车新闻测试</a>'.encode())),1)
   with self.assertRaises(ValueError):parse_source(key,f'<a href="https://evil.test{path}">汽车新闻测试</a>'.encode())
