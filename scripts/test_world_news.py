import unittest
from fetch_extra_hotspots import parse_source

class WorldNewsTests(unittest.TestCase):
 def test_publisher_feeds(self):
  for key,domain in [('bbc','www.bbc.co.uk'),('bbc','www.bbc.com'),('aljazeera','www.aljazeera.com'),('guardian','www.theguardian.com')]:
   body=f'<rss><channel><item><title>World &amp; news</title><link>https://{domain}/world/a</link></item></channel></rss>'.encode()
   self.assertEqual(parse_source(key,body),[{'title':'World & news','url':f'https://{domain}/world/a','meta':''}])

 def test_indexed_publishers(self):
  for key,domain in [('reuters','www.reuters.com'),('ap','apnews.com'),('nhk','www3.nhk.or.jp')]:
   item='<item><title>World news - Publisher</title><link>https://news.google.com/rss/articles/ABC</link><source url="https://'+domain+'">Publisher</source></item>'
   body=('<rss><channel>'+item+item+item.replace(domain,domain+'.example')+'</channel></rss>').encode()
   rows=parse_source(key,body)
   self.assertEqual(len(rows),1)
   self.assertEqual(rows[0]['title'],'World news')
   self.assertIn('Google 新闻',rows[0]['meta'])

 def test_wrong_publisher_rejected(self):
  body=b'<rss><channel><item><title>Wrong</title><link>https://news.google.com/rss/articles/XYZ</link><source url="https://reuters.com.example">Reuters</source></item></channel></rss>'
  with self.assertRaises(ValueError):parse_source('reuters',body)
