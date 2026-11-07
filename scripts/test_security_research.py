import sys,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import fetch_extra_hotspots as f
class SecurityResearchTests(unittest.TestCase):
 def feed(self,url,title='Security report'):
  return f'<rss><channel><item><title>{title}</title><link>{url}</link><pubDate>2026-11-06</pubDate></item></channel></rss>'.encode()
 def test_five_sources(self):
  urls={'securelist':'https://securelist.com/test/123/','checkpoint':'https://research.checkpoint.com/2026/test/','sentinellabs':'https://www.sentinelone.com/labs/test/','elastic':'https://www.elastic.co/security-labs/test','eset':'https://www.welivesecurity.com/en/research/test/'}
  for key,url in urls.items():
   with self.subTest(key=key):self.assertEqual(f.parse_source(key,self.feed(url))[0]['url'],url)
 def test_atom(self):
  body=b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Security report</title><link href="https://www.elastic.co/security-labs/test"/><updated>2026-11-06</updated></entry></feed>'
  self.assertEqual(f.parse_source('elastic',body)[0]['meta'],'2026-11-06')
 def test_bad_domains_and_paths(self):
  for url in ['https://evil.test/security-labs/test','https://www.elastic.co.evil.test/security-labs/test','https://www.elastic.co/products/test','javascript:alert(1)','https://user:pass@www.elastic.co/security-labs/test','https://www.elastic.co:bad/security-labs/test']:
   with self.subTest(url=url),self.assertRaises(ValueError):f.parse_source('elastic',self.feed(url))
 def test_empty(self):
  for b in [b'',b'<rss><channel/></rss>']:
   with self.assertRaises(Exception):f.parse_source('checkpoint',b)
 def test_limit_dedup(self):
  item='<item><title>Security report</title><link>https://securelist.com/test/{}/</link></item>'
  body=('<rss><channel>'+''.join(item.format(i) for i in list(range(30))+[0])+'</channel></rss>').encode()
  self.assertEqual(len(f.parse_source('securelist',body)),24)
 def test_fetch_translation(self):
  with patch.object(f,'request_body',return_value=self.feed('https://securelist.com/test/1/')),patch.object(f,'translate_title',return_value='安全研究报告'):
   row=f.fetch('securelist')['items'][0];self.assertEqual(row['title'],'安全研究报告');self.assertEqual(row['originalTitle'],'Security report')
 def test_preserve_on_empty_response(self):
  with tempfile.TemporaryDirectory() as temp:
   p=Path(temp)/'snapshot.json';old={'items':[{'title':'缓存标题'}],'updatedAt':'2026-11-06T00:00:00Z'};p.write_text(json.dumps({'sources':{'checkpoint':old}}))
   with patch.object(f,'SOURCES',{'checkpoint':f.SOURCES['checkpoint']}),patch.object(f,'request_body',return_value=b''),patch('sys.argv',['fetch','--output',str(p)]):f.main()
   result=json.loads(p.read_text(encoding='utf8'))['sources']['checkpoint'];self.assertEqual(result['items'],old['items']);self.assertEqual(result['collection']['status'],'stale')
if __name__=='__main__':unittest.main()
