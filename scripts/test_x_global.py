import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import fetch_x_global as x
class Tests(unittest.TestCase):
 def data(self):return {'date':'2026-10-30','fetched_at':'2026-10-31T08:54:10+08:00','cats':{'ai':{'label':'AI','items':[{'id':'123','handle':'alice','zh':'中文译文','text':'original','likes':4,'views':20}]},'article':{'label':'长文','items':[{'id':'456','handle':'bob','article':{'title_zh':'中文长文标题'},'bookmarks':9}]}}}
 def test_embedded_json(self):
  d=x.parse_page('<script>var GLOBAL_D='+json.dumps(self.data())+';window.x=1;</script>');self.assertEqual(len(d['items']),2);self.assertEqual(d['items'][0]['title'],'中文译文');self.assertEqual(d['items'][1]['title'],'中文长文标题');self.assertEqual(d['updatedAt'],'2026-10-31T00:54:10+00:00')
 def test_dedup_and_urls(self):
  d=self.data();rows=d['cats']['ai']['items'];rows.extend([dict(rows[0]),{'id':'999','handle':'../evil'},{'id':'777','handle':'valid','likes':float('nan'),'url':'javascript:evil'}]);r=x.normalize(d);self.assertEqual(len(r['items']),3);self.assertEqual(r['items'][1]['likes'],0);self.assertEqual(r['items'][1]['url'],'https://x.com/valid/status/777')
 def test_empty(self):
  d=self.data();d['cats']={}
  with self.assertRaises(ValueError):x.normalize(d)
 def test_missing_payload(self):
  with self.assertRaises(ValueError):x.parse_page('<html>verification page</html>')
 def test_bad_dates(self):
  d=self.data();d['date']='bad'
  with self.assertRaises(ValueError):x.normalize(d)
  d=self.data();d['fetched_at']='2026-10-31T08:54:10'
  with self.assertRaises(ValueError):x.normalize(d)
 def test_fallback(self):
  with patch.object(x.urllib.request,'urlopen',side_effect=OSError('offline')),patch.object(x,'fetch_browser',return_value=x.normalize(self.data())) as browser:self.assertTrue(x.fetch()['items']);browser.assert_called_once()
 def test_cache(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'x.json';p.write_text(json.dumps(x.normalize(self.data())),encoding='utf-8');old=p.read_bytes()
   with patch.object(x,'fetch',side_effect=OSError('offline')):self.assertFalse(x.update(p))
   self.assertEqual(old,p.read_bytes())
 def test_no_cache(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'fetch',side_effect=OSError('offline')):
   with self.assertRaises(OSError):x.update(Path(tmp)/'x.json')
 def test_events(self):
  d=self.data();d['cats']['ai']['items'][0]['media']=[{'url':'https://pbs.twimg.com/media/test.jpg'}];d['events']=[{'i':1,'title':'测试热点','ids':['123','123','invalid'],'cats':['ai'],'likes':8,'views':99}]
  e=x.normalize(d)['events'][0];self.assertEqual(e['tweetIds'],['123']);self.assertEqual(e['count'],1);self.assertEqual(e['image'],'https://pbs.twimg.com/media/test.jpg');self.assertEqual(e['category'],'AI');self.assertEqual(e['url'],'https://x.com/alice/status/123')
 def test_invalid_events_and_images(self):
  d=self.data();d['cats']['ai']['items'][0]['media']=[{'url':'javascript:evil'},{'url':'https://evil.com/test.jpg'}];d['events']=[{'i':1,'title':'Test event','ids':['123']},{'i':1,'title':'Duplicate','ids':['123']},{'i':2,'title':'No rows','ids':['999']},None]
  events=x.normalize(d)['events'];self.assertEqual(len(events),1);self.assertEqual(events[0]['image'],'')
  d['events']=None;self.assertEqual(x.normalize(d)['events'],[])
 def test_write(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'fetch',return_value=x.normalize(self.data())):
   p=Path(tmp)/'x.json';self.assertTrue(x.update(p));self.assertEqual(json.loads(p.read_text(encoding='utf-8'))['dataDate'],'2026-10-30')
if __name__=='__main__':unittest.main()
