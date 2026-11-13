import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class DoubanTests(unittest.TestCase):
 def parse(self,rows):return f.parse_source('douban',json.dumps({'subjects':rows}).encode())
 def movie(self,**kw):return {'id':'123','title':'测试电影','url':'https://movie.douban.com/subject/123/','rate':'8.7',**kw}
 def test_ratings(self):
  row=self.parse([self.movie(is_new=True)])[0];self.assertEqual(row['title'],'测试电影');self.assertEqual(row['meta'],'豆瓣 8.7 分 · 新上榜')
 def test_unrated(self):
  for rate in ['',None,'NaN','inf','-1','99','0']:
   self.assertEqual(self.parse([self.movie(rate=rate)])[0]['meta'],'暂无评分')
 def test_invalid_links(self):
  for url in ['https://evil.test/subject/123/','javascript:alert(1)','https://movie.douban.com/subject/999/']:
   with self.assertRaises(ValueError):self.parse([self.movie(url=url)])
 def test_empty(self):
  for value in [{},[],{'subjects':[]},{'subjects':[None,{'id':'bad'}]}]:
   with self.assertRaises(ValueError):f.parse_source('douban',json.dumps(value).encode())
 def test_dedup_and_limit(self):
  self.assertEqual(len(self.parse([self.movie(),self.movie()])),1)
  self.assertEqual(len(self.parse([self.movie(id=str(i),url=f'https://movie.douban.com/subject/{i}/') for i in range(30)])),24)
if __name__=='__main__':unittest.main()
