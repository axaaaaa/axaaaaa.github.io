import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_x_words as x
class Tests(unittest.TestCase):
 def html(self):return '''<details class="hwe-row" data-c="ai" data-s="up"><summary><span class="hwe-bd">1</span><span class="hwe-wm">AI 科技</span><span class="hwe-t">Test &amp; topic</span><span class="hwe-s">Test description</span><span class="hwe-m">3 帖</span><span class="hwe-r"><b>1.2万</b><i>曝光</i></span></summary><a class="hwe-sam" href="https://x.com/i/status/123">Original</a></details>页面更新于 10-31 21:01'''
 def test_parse(self):
  d=x.parse_page(self.html());self.assertEqual(d['items'][0]['title'],'Test & topic');self.assertEqual(d['items'][0]['viewsText'],'1.2万');self.assertEqual(d['items'][0]['trend'],'up');self.assertEqual(d['sourceUpdatedText'],'10-31 21:01')
 def test_dedup(self):self.assertEqual(len(x.parse_page(self.html()*2)['items']),1)
 def test_bad_link(self):
  with self.assertRaises(ValueError):x.parse_page(self.html().replace('https://x.com/i/status/123','javascript:evil'))
 def test_empty(self):
  with self.assertRaises(ValueError):x.parse_page('<html>verification</html>')
 def test_fallback(self):
  with patch.object(x.urllib.request,'urlopen',side_effect=OSError('offline')),patch.object(x,'fetch_browser',return_value={'items':[]}) as b:x.fetch();b.assert_called_once()
 def test_preserve(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'words.json';p.write_text(json.dumps(x.parse_page(self.html())),encoding='utf-8');old=p.read_bytes()
   with patch.object(x,'fetch',side_effect=OSError('offline')):self.assertFalse(x.update(p))
   self.assertEqual(p.read_bytes(),old)
 def test_no_cache(self):
  with tempfile.TemporaryDirectory() as d,patch.object(x,'fetch',side_effect=OSError('offline')):
   with self.assertRaises(OSError):x.update(Path(d)/'words.json')
 def test_write(self):
  with tempfile.TemporaryDirectory() as d,patch.object(x,'fetch',return_value=x.parse_page(self.html())):
   p=Path(d)/'words.json';self.assertTrue(x.update(p));self.assertEqual(len(json.loads(p.read_text(encoding='utf-8'))['items']),1)
if __name__=='__main__':unittest.main()
