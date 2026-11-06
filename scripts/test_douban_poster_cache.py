import hashlib,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import source_images as images
class DoubanPosterCacheTests(unittest.TestCase):
 def test_cached_without_browser(self):
  with tempfile.TemporaryDirectory() as temp:
   url='https://img9.doubanio.com/view/photo/s_ratio_poster/public/p123.jpg';token=hashlib.sha256(url.encode()).hexdigest()[:24];root=Path(temp)/'source-covers/douban';root.mkdir(parents=True);(root/(token+'.jpg')).write_bytes(b'\xff\xd8\xfftest')
   with patch.object(images,'public_directory',return_value=Path(temp)):
    row=images.cache_douban_posters([{'title':'Film','cover':url}])[0]
   self.assertEqual(row['cover'],'source-covers/douban/'+token+'.jpg');self.assertEqual(row['originalCover'],url)
 def test_bad_cover_no_browser(self):
  rows=[{'title':'Bad','cover':'https://evil.test/a.jpg'}];self.assertEqual(images.cache_douban_posters(rows),rows)
 def test_live_snapshot_files(self):
  import json
  root=Path(__file__).resolve().parents[1];rows=json.loads((root/'public/extra-hotspots.json').read_text(encoding='utf8'))['sources']['douban']['items']
  self.assertEqual(len(rows),24)
  for row in rows:
   self.assertTrue(row['cover'].startswith('source-covers/douban/'));content=(root/'public'/row['cover']).read_bytes();self.assertTrue(content.startswith(b'\xff\xd8\xff'))
if __name__=='__main__':unittest.main()
