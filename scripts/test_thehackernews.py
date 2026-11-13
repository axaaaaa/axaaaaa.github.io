import sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class TheHackerNewsTests(unittest.TestCase):
 def test_feed_link_filter(self):
  body=b'<rss><channel><item><title>Claude Code security alert</title><link>https://thehackernews.com/2026/11/claude-code-security-alert.html</link><pubDate>Today</pubDate></item><item><title>Second story</title><link>https://thehackernews.com/2026/11/second-story.html</link><pubDate>Today</pubDate></item><item><title>Bad link</title><link>https://example.com/2026/11/test.html</link></item></channel></rss>'
  items=f.parse_source('thehackernews',body);self.assertEqual(len(items),2);self.assertEqual(items[0]['title'],'Claude Code security alert')
 def test_translation(self):
  from unittest.mock import Mock
  translator=Mock()
  translator.translate.side_effect=['安全资讯','安全新闻']
  with patch.object(f,'_offline_translator',None),patch.object(f,'_load_offline_translator',return_value=translator) as load:
   self.assertEqual(f.translate_title('Security news'),'安全资讯')
   self.assertEqual(f.translate_title('Security news'),'安全新闻')
  load.assert_called_once_with()
  self.assertEqual(translator.translate.call_count,2)
 def test_fresh_translation_on_each_run(self):
  items=[{'title':'Security news'}]
  with patch.object(f,'translate_title',side_effect=['安全资讯','安全新闻']) as translate:
   self.assertEqual(f.translate_security_titles(items)[0]['title'],'安全资讯')
   self.assertEqual(f.translate_security_titles(items)[0]['title'],'安全新闻')
  self.assertEqual(translate.call_count,2)
 def test_failed_translation_retains_original(self):
  with patch.object(f,'translate_title',side_effect=OSError('offline')):row=f.translate_security_titles([{'title':'Security news','url':'https://example.com'}])[0]
  self.assertEqual(row['title'],'Security news');self.assertEqual(row['translationStatus'],'original');self.assertIn('翻译待更新',row['meta'])
 def test_reject_non_chinese(self):
  from unittest.mock import Mock
  with patch.object(f,'_offline_translator',Mock(**{'translate.return_value':'Security news'})):
   with self.assertRaises(ValueError):f.translate_title('Security news')
if __name__=='__main__':unittest.main()
