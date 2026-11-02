import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import fetch_x_articles as x
class Tests(unittest.TestCase):
 def html(self):return '''<a class="ac t1" data-zone="cn" data-age="2.5" data-c="ai_code" href="https://x.com/alice/status/123"><span class="ac-pv">Article preview</span><span class="ac-t">Test &amp; article</span><span class="ac-c">AI 编程</span><span class="ac-nm"><b>Alice</b><i>@alice · 1.2万 曝光</i></span><span class="ac-q">1,500</span></a>页面更新于 10-31 21:58'''
 def test_parse(self):
  d=x.parse_page(self.html());r=d['items'][0];self.assertEqual(r['title'],'Test & article');self.assertEqual(r['bookmarks'],1500);self.assertEqual(r['views'],12000);self.assertEqual(r['ageDays'],2.5);self.assertEqual(r['name'],'Alice')
 def test_cover(self):
  h=self.html().replace('<span class="ac-pv">','<span class="ac-cv"><img src="/feed/img/media/test.jpg?format=jpg&amp;name=small"></span><span class="ac-pv">')
  self.assertEqual(x.parse_page(h)['items'][0]['cover'],'https://xbangdan.com/feed/img/media/test.jpg?format=jpg&name=small')
  for bad in ['https://evil.com/test.jpg','javascript:evil']:
   self.assertEqual(x.parse_page(h.replace('/feed/img/media/test.jpg?format=jpg&amp;name=small',bad))['items'][0]['cover'],'')
 def test_dedup(self):self.assertEqual(len(x.parse_page(self.html()*2)['items']),1)
 def test_invalid(self):
  for a,b in [('https://x.com/alice/status/123','javascript:bad'),('2.5','nan'),('data-zone="cn"','data-zone="bad"')]:
   with self.assertRaises(ValueError):x.parse_page(self.html().replace(a,b))
 def test_empty(self):
  with self.assertRaises(ValueError):x.parse_page('verification page')
 def test_counts(self):self.assertEqual(x.number('1.2万'),12000);self.assertEqual(x.number('1,500'),1500)
 def test_fallback(self):
  with patch.object(x.urllib.request,'urlopen',side_effect=OSError('offline')),patch.object(x,'fetch_browser',return_value={'items':[]}) as b:x.fetch();b.assert_called_once()
 def test_cache(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'articles.json';p.write_text(json.dumps(x.parse_page(self.html())),encoding='utf-8');old=p.read_bytes()
   with patch.object(x,'fetch',side_effect=OSError('offline')):self.assertFalse(x.update(p))
   self.assertEqual(old,p.read_bytes())
 def test_no_cache(self):
  with tempfile.TemporaryDirectory() as d,patch.object(x,'fetch',side_effect=OSError('offline')):
   with self.assertRaises(OSError):x.update(Path(d)/'missing.json')
 def test_write(self):
  with tempfile.TemporaryDirectory() as d,patch.object(x,'fetch',return_value=x.parse_page(self.html())):
   p=Path(d)/'articles.json';self.assertTrue(x.update(p));self.assertEqual(len(json.loads(p.read_text(encoding='utf-8'))['items']),1)
if __name__=='__main__':unittest.main()
