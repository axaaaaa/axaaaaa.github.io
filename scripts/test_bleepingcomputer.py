import json,sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class BleepingComputerTests(unittest.TestCase):
 def test_security_feed_only(self):
  body=b'<rss><channel><item><title>Security &amp; privacy news</title><link>https://www.bleepingcomputer.com/news/security/test-story/</link><pubDate>Today</pubDate></item><item><title>Deal story</title><link>https://www.bleepingcomputer.com/offer/deals/test/</link></item><item><title>Bad link</title><link>https://example.com/news/security/test/</link></item></channel></rss>'
  items=f.parse_source('bleepingcomputer',body);self.assertEqual(len(items),1);self.assertEqual(items[0]['title'],'Security & privacy news')
 def test_translation(self):
  with patch.object(f,'request_body',return_value=json.dumps([[['安全新闻','Security news']]]).encode()):self.assertEqual(f.translate_title('Security news'),'安全新闻')
 def test_cached_translation(self):
  old={'items':[{'title':'安全新闻','originalTitle':'Security news','translationStatus':'translated'}]}
  with patch.object(f,'translate_title',side_effect=AssertionError('cache miss')):
   row=f.translate_security_titles([{'title':'Security news','url':'https://example.com','meta':''}],old)[0]
  self.assertEqual(row['title'],'安全新闻');self.assertEqual(row['originalTitle'],'Security news');self.assertIn('机器翻译',row['meta'])
 def test_failed_translation_retains_original(self):
  with patch.object(f,'translate_title',side_effect=OSError('offline')):row=f.translate_security_titles([{'title':'Security news','url':'https://example.com'}])[0]
  self.assertEqual(row['title'],'Security news');self.assertEqual(row['translationStatus'],'original');self.assertIn('翻译待更新',row['meta'])
 def test_reject_non_chinese(self):
  with patch.object(f,'request_body',return_value=b'[[["Security news"]]]'):
   with self.assertRaises(ValueError):f.translate_title('Security news')
if __name__=='__main__':unittest.main()
