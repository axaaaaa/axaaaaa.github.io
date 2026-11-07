import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import fetch_x_hot as x
class Tests(unittest.TestCase):
 def fixture(self):
  rows=[{'id':'123','h':'alice','t':'Hello tweet','r':100,'v':200,'l':4},{'id':'456','h':'bob','t':'','r':300,'v':400}]
  return {'updated':1793453403,'rate':rows,'views':rows}
 def test_normalize(self):
  d=x.normalize(self.fixture());self.assertEqual(d['rate'][0]['id'],'456');self.assertEqual(d['rate'][0]['title'],'图片或视频推文');self.assertEqual(d['views'][1]['url'],'https://x.com/alice/status/123')
 def test_invalid_rows(self):
  d=self.fixture();d['rate'] += [dict(d['rate'][0]),{'id':'999','h':'../evil','r':999}, {'id':'777','h':'valid','r':float('nan')}]
  self.assertEqual(len(x.normalize(d)['rate']),2)
 def test_invalid_timestamp(self):
  for stamp in [None,True,-1,float('inf'),'bad']:
   d=self.fixture();d['updated']=stamp
   with self.assertRaises((ValueError,OverflowError)):x.normalize(d)
 def test_empty(self):
  d=self.fixture();d['views']=[]
  with self.assertRaises(ValueError):x.normalize(d)
 def test_browser_fallback(self):
  with patch.object(x.urllib.request,'urlopen',side_effect=OSError('offline')),patch.object(x,'fetch_browser',return_value=self.fixture()) as browser:
   self.assertEqual(len(x.fetch()['rate']),2);browser.assert_called_once()
 def test_preserve_snapshot(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'x.json';p.write_text(json.dumps(x.normalize(self.fixture())),encoding='utf-8');old=p.read_bytes()
   with patch.object(x,'fetch',side_effect=OSError('offline')):self.assertFalse(x.update(p))
   self.assertEqual(p.read_bytes(),old)
 def test_no_cache_failure(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'fetch',side_effect=OSError('offline')):
   with self.assertRaises(OSError):x.update(Path(tmp)/'missing.json')
 def test_write(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'fetch',return_value=x.normalize(self.fixture())):
   p=Path(tmp)/'x.json';self.assertTrue(x.update(p));self.assertEqual(len(json.loads(p.read_text(encoding='utf-8'))['rate']),2)
if __name__=='__main__':unittest.main()
