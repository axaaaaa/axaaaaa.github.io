import json,sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class TheHackerNewsTests(unittest.TestCase):
 def test_feed_link_filter(self):
  body=b'<rss><channel><item><title>Claude Code security alert</title><link>https://thehackernews.com/2026/11/claude-code-security-alert.html</link><pubDate>Today</pubDate></item><item><title>Second story</title><link>https://thehackernews.com/2026/11/second-story.html</link><pubDate>Today</pubDate></item><item><title>Bad link</title><link>https://example.com/2026/11/test.html</link></item></channel></rss>'
  items=f.parse_source('thehackernews',body);self.assertEqual(len(items),2);self.assertEqual(items[0]['title'],'Claude Code security alert')
 def test_translation(self):
  with patch.object(f,'request_body',return_value=json.dumps([[['安全新闻','Security news']]]).encode()):self.assertEqual(f.translate_title('Security news'),'安全新闻')
 def test_fresh_translation_on_each_run(self):
  items=[{'title':'Security news'}]
  with patch.object(f,'translate_title',side_effect=['安全资讯','安全新闻']) as translate:
   self.assertEqual(f.translate_security_titles(items)[0]['title'],'安全资讯')
   self.assertEqual(f.translate_security_titles(items)[0]['title'],'安全新闻')
  self.assertEqual(translate.call_count,2)
 def setUp(self):
  state=patch.object(f,'_translation_state',{'next':0,'stopped':False})
  clock=patch.object(f.time,'monotonic',return_value=100)
  sleep=patch.object(f.time,'sleep')
  path=patch.object(f,'_translation_state_file',return_value=None)
  for p in (state,clock,sleep,path):
   p.start();self.addCleanup(p.stop)
 def test_global_interval_between_titles(self):
  with patch.object(f,'_google_title_request',return_value='安全新闻') as request:
   f.translate_title('first')
   f.translate_title('second')
  self.assertEqual(request.call_count,2)
  f.time.sleep.assert_called_once_with(1)
 def test_google_429_honors_retry_after(self):
  from urllib.error import HTTPError
  limited=HTTPError('https://translate.google.com',429,'Too Many Requests',{'Retry-After':'12'},None)
  translated=json.dumps([[['安全新闻','Security news']]]).encode()
  with patch.object(f,'request_body',side_effect=[limited,translated]) as request:
   self.assertEqual(f.translate_title('Security news'),'安全新闻')
  self.assertEqual(request.call_count,2)
  f.time.sleep.assert_called_once_with(12)
 def test_repeated_429_stops_subsequent_process(self):
  from tempfile import TemporaryDirectory
  from urllib.error import HTTPError
  limited=HTTPError('https://translate.google.com',429,'Too Many Requests',None,None)
  with TemporaryDirectory() as temp,patch.object(f,'_translation_state_file',return_value=Path(temp)/'state.json'),patch.object(f,'request_body',side_effect=limited) as request:
   with self.assertRaises(HTTPError):f.translate_title('first')
   with patch.object(f,'_translation_state',{'next':0,'stopped':False}):
    with self.assertRaisesRegex(ValueError,'paused'):f.translate_title('second')
   self.assertEqual(request.call_count,2)
  f.time.sleep.assert_called_once_with(60)
 def test_failed_translation_retains_original(self):
  with patch.object(f,'translate_title',side_effect=OSError('offline')):row=f.translate_security_titles([{'title':'Security news','url':'https://example.com'}])[0]
  self.assertEqual(row['title'],'Security news');self.assertEqual(row['translationStatus'],'original');self.assertIn('翻译待更新',row['meta'])
 def test_reject_non_chinese(self):
  with patch.object(f,'request_body',return_value=b'[[["Security news"]]]'):
   with self.assertRaises(ValueError):f.translate_title('Security news')
if __name__=='__main__':unittest.main()
