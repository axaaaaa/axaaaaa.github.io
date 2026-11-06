import sys,unittest,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
from source_images import clean_cover
class DoubanCoverTests(unittest.TestCase):
 def test_cover_attached(self):
  body=json.dumps({'subjects':[{'id':'123','title':'测试电影','url':'https://movie.douban.com/subject/123/','rate':'8.7','cover':'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p123.webp'}]}).encode()
  self.assertIn('doubanio.com',f.parse_source('douban',body)[0]['cover'])
 def test_invalid_cover(self):
  for url in ['https://evil.test/a.jpg','javascript:alert(1)','https://doubanio.com.evil.test/a.jpg']:
   self.assertEqual(clean_cover('douban',url),'')
 def test_douban_only_override(self):
  root=Path(__file__).resolve().parents[1];s=(root/'src/components/SourceNewsCard.vue').read_text(encoding='utf8')
  self.assertIn("(this.sourceId==='douban'||SHOW_SOURCE_IMAGES)",s)
  self.assertIn('aspect-ratio:2/3',s);self.assertIn('@error="failedCovers[item.url]=true"',s)
  self.assertIn('SHOW_SOURCE_IMAGES = false',(root/'src/utils/source-display.mjs').read_text(encoding='utf8'))
if __name__=='__main__':unittest.main()
