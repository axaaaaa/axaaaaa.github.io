import unittest
from fetch_extra_hotspots import parse_source,translate_security_titles,parse_maoyan_metrics
from unittest.mock import patch

class NewSourceTests(unittest.TestCase):
 def test_maoyan_rank_and_poster(self):
  def movie(rank,id,host='p0.pipi.cn'):
   return f'<dd><i class="board-index">{rank}</i><p class="name"><a href="/films/{id}">Film {id}</a></p><img class="board-img" data-src="https://{host}/poster.jpg"><p class="releasetime">上映时间：2026-11-01</p></dd>'
  rows=parse_source('maoyan',(movie(2,12,'evil.example')+movie(1,11)).encode())
  self.assertEqual([r['title'] for r in rows],['Film 11','Film 12'])
  self.assertEqual(rows[0]['cover'],'https://p0.pipi.cn/poster.jpg')
  self.assertNotIn('cover',rows[1])
  with self.assertRaises(ValueError):parse_source('maoyan',movie(2,12).encode())

 def test_maoyan_metrics(self):
  body=b'<script>var AppData = {"movie":{"id":12,"sc":9.6},"mbox":{"mbox":{"sumBox":68494}}};</script>'
  self.assertEqual(parse_maoyan_metrics(body,12),{'rating':'9.6','boxOffice':'68,494 万元'})
  with self.assertRaises(ValueError):parse_maoyan_metrics(body,13)
  self.assertEqual(parse_maoyan_metrics(b'var AppData = {"movie":{"id":12,"sc":0}};',12),{})

 def test_international_rss(self):
  for key,domain in [('nytimes','nytimes.com'),('wsj','wsj.com')]:
   rss=f'<rss><channel><item><title>A &amp; B</title><link>https://www.{domain}/world/a</link><pubDate>Sat, 07 Nov 2026 04:00:00 GMT</pubDate></item><item><title>Bad</title><link>https://{domain}.evil.test/a</link></item></channel></rss>'
   rows=parse_source(key,rss.encode())
   self.assertEqual(rows,[{'title':'A & B','url':f'https://www.{domain}/world/a','meta':'2026-11-07'}])

 def test_globaltimes_translation(self):
  html=b'<a href="https://www.globaltimes.cn/page/202611/1373839.shtml">World news</a>'
  rows=parse_source('globaltimes',html)
  with patch('fetch_extra_hotspots.translate_title',return_value='国际新闻'):
   translated=translate_security_titles(rows)
  self.assertEqual(translated[0]['title'],'国际新闻')
  self.assertEqual(translated[0]['originalTitle'],'World news')
  self.assertEqual(translated[0]['url'],rows[0]['url'])
