import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class MicrosoftSeebugTests(unittest.TestCase):
 def test_microsoft_feed(self):
  body=b'<rss><channel><item><title>Security research</title><link>https://www.microsoft.com/en-us/security/blog/2026/11/05/test/</link></item><item><title>Not security</title><link>https://www.microsoft.com/en-us/other/</link></item></channel></rss>'
  self.assertEqual(len(f.parse_source('microsoft',body)),1)
 def test_microsoft_bad_host(self):
  with self.assertRaises(ValueError):f.parse_source('microsoft',b'<rss><item><title>Test</title><link>https://www.microsoft.com.evil.test/en-us/security/blog/2026/11/05/test/</link></item></rss>')
 def test_seebug_latest_only(self):
  body='''<table><tr><td><a href="/vuldb/ssvid-123">SSV-123</a></td><td class="vul-title-wrapper"><a href="/vuldb/ssvid-123">测试漏洞 &amp; 分析</a></td></tr><tr><td class="vul-title-wrapper"><a href="/vuldb/ssvid-123">重复标题</a><a href="https://evil.test/vuldb/ssvid-1">伪造链接</a></td></tr></table><table><td class="vul-title-wrapper"><a href="/vuldb/ssvid-124">其他榜单</a></td></table>'''.encode()
  items=f.parse_source('seebug',body);self.assertEqual(len(items),1);self.assertEqual(items[0]['title'],'测试漏洞 & 分析');self.assertIn('SSV-123',items[0]['meta'])
 def test_missing_table(self):
  for b in [b'',b'<html>verification</html>',b'<table><td class="vul-title-wrapper">']:
   with self.assertRaises(ValueError):f.parse_source('seebug',b)
 def test_ui_configuration(self):
  root=Path(__file__).resolve().parents[1]
  for key in ['microsoft','seebug']:
   self.assertIn(key+':',(root/'src/components/SourceNewsCard.vue').read_text(encoding='utf8'))
   self.assertIn("'"+key+"'",(root/'src/components/NavigationLinks.vue').read_text(encoding='utf8'))
if __name__=='__main__':unittest.main()
