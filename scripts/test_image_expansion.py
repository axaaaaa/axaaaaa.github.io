import unittest,json,io
from unittest.mock import patch
import fetch_v2ex,fetch_x_global,fetch_news,fetch_extra_hotspots
from source_images import CoverParser
class Tests(unittest.TestCase):
 def test_v2ex_post_not_avatar(self):
  rows=fetch_v2ex.normalize([{'id':1,'title':'Test topic','member':{'avatar_large':'https://v2ex.com/avatar.png'},'content_rendered':'<img src="https://cdn.jsdelivr.net/gh/a/b/screenshot.png">'}]);self.assertEqual(rows[0]['cover'],'https://cdn.jsdelivr.net/gh/a/b/screenshot.png')
 def test_global_media(self):
  d={'date':'2026-10-30','fetched_at':'2026-10-31T08:00:00+08:00','cats':{'ai':{'label':'AI','items':[{'id':'123','handle':'author','text':'Test','likes':1,'media':[{'url':'https://pbs.twimg.com/media/test.jpg'}]}]}}};self.assertEqual(fetch_x_global.normalize(d)['items'][0]['cover'],'https://pbs.twimg.com/media/test.jpg')
 def test_ithome_rss_image(self):
  body=b'<rss><channel><item><title>Test article</title><link>https://www.ithome.com/0/123/456.htm</link><pubDate>Sat, 31 Oct 2026 10:00:00 +0800</pubDate><description>&lt;img src="https://img.ithome.com/a.jpg"&gt;</description></item></channel></rss>'
  with patch.object(fetch_news.urllib.request,'urlopen',return_value=io.BytesIO(body)),patch.object(fetch_news,'cache_source_covers',side_effect=lambda key,items:items):rows=fetch_news.fetch(('IT之家','https://www.ithome.com/rss/','科技动态'))
  self.assertEqual(rows[0]['cover'],'https://img.ithome.com/a.jpg')
 def test_repo_preview(self):
  p=CoverParser('github','https://github.com/org/repo');p.feed('<meta property="og:image" content="https://opengraph.githubassets.com/hash/org/repo">');self.assertEqual(p.meta,'https://opengraph.githubassets.com/hash/org/repo')
 def test_qq_article_not_author_icon(self):
  d={'idlist':[{'newslist':[{'title':'Topic','url':'https://view.inews.qq.com/a/123','bigImage':['https://inews.gtimg.com/article.jpg'],'card':{'icon':'https://inews.gtimg.com/avatar.jpg'}}]}]};rows=fetch_extra_hotspots.parse_source('qq',json.dumps(d).encode());self.assertEqual(rows[0]['cover'],'https://inews.gtimg.com/article.jpg')
if __name__=='__main__':unittest.main()
