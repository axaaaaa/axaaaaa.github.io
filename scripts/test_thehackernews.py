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
 def test_microsoft_after_google_http_error(self):
  from urllib.error import HTTPError
  from io import BytesIO
  limited=HTTPError('https://translate.googleapis.com',429,'Too Many Requests',None,None)
  translated=json.dumps([{'translations':[{'text':'安全新闻'}]}]).encode()
  with patch.dict(f.os.environ,{'AZURE_TRANSLATOR_KEY':'test-key','AZURE_TRANSLATOR_REGION':'westus'}):
   with patch.object(f,'request_body',side_effect=limited),patch.object(f.urllib.request,'urlopen',return_value=BytesIO(translated)) as open_url:
    self.assertEqual(f.translate_title('Security news'),'安全新闻')
   req=open_url.call_args.args[0]
   self.assertEqual(req.get_method(),'POST')
   self.assertEqual(req.get_header('Ocp-apim-subscription-key'),'test-key')
   self.assertEqual(req.get_header('Ocp-apim-subscription-region'),'westus')
   self.assertEqual(json.loads(req.data),[{'Text':'Security news'}])
   self.assertIn('to=zh-Hans',req.full_url)
 def test_failed_translation_retains_original(self):
  with patch.object(f,'translate_title',side_effect=OSError('offline')):row=f.translate_security_titles([{'title':'Security news','url':'https://example.com'}])[0]
  self.assertEqual(row['title'],'Security news');self.assertEqual(row['translationStatus'],'original');self.assertIn('翻译待更新',row['meta'])
 def test_reject_non_chinese(self):
  with patch.object(f,'request_body',return_value=b'[[["Security news"]]]'):
   with self.assertRaises(ValueError):f.translate_title('Security news')
if __name__=='__main__':unittest.main()
