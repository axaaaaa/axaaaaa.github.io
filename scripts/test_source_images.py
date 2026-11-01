import unittest,tempfile,io
from pathlib import Path
from unittest.mock import patch
import source_images as x
import fetch_extra_hotspots as sources
class Tests(unittest.TestCase):
 def test_match(self):
  body=b'<a href="/post/1"><img data-src="https://cdn.sspai.com/one.jpg"></a><a href="/post/2"><img src="https://cdn.sspai.com/two.jpg"></a>'
  with patch.object(x,'detail_cover',return_value=''):
   rows=x.attach_covers('sspai',[{'title':'Second','url':'https://sspai.com/post/2'}],body,'https://sspai.com/')
  # RSS parser deliberately does not treat an arbitrary HTML body as a feed.
  p=x.CoverParser('sspai','https://sspai.com/');p.feed(body.decode());self.assertEqual(p.images['https://sspai.com/post/2'],'https://cdn.sspai.com/two.jpg')
 def test_background(self):
  p=x.CoverParser('uisdc','https://www.uisdc.com/');p.feed('<a href="/test"><i style="background-image:url(https://image.uisdc.com/test.jpg)"></i></a>');self.assertEqual(p.images['https://www.uisdc.com/test'],'https://image.uisdc.com/test.jpg')
 def test_bad_cover(self):
  for url in ['javascript:evil','https://evil.com/a.jpg','https://image.uisdc.com/avatar.jpg','https://image.uisdc.com@evil.com/a.jpg','https://127.0.0.1/a.jpg']:
   self.assertEqual(x.clean_cover('uisdc',url),'')
 def test_meta(self):
  p=x.CoverParser('sspai','https://sspai.com/post/1');p.feed('<meta property="og:image" content="https://rssfile.sspai.com/test.jpg?a=1&amp;b=2">');self.assertEqual(p.meta,'https://rssfile.sspai.com/test.jpg?a=1&b=2')
 def test_rss(self):
  body=b'<rss><channel><item><link>https://sspai.com/post/1</link><description>&lt;img src="https://rssfile.sspai.com/a.jpg"&gt;</description></item></channel></rss>'
  with patch.object(x,'detail_cover',side_effect=AssertionError('No detail fetch')):
   rows=x.attach_covers('sspai',[{'title':'One','url':'https://sspai.com/post/1'}],body,'https://sspai.com/')
  self.assertEqual(rows[0]['cover'],'https://rssfile.sspai.com/a.jpg')
 def test_partial_failure(self):
  with patch.object(x,'detail_cover',side_effect=OSError('offline')):r=x.attach_covers('sspai',[{'title':'One','url':'https://sspai.com/post/1'}],b'<rss/>','https://sspai.com/')
  self.assertEqual(r[0]['title'],'One');self.assertNotIn('cover',r[0])
 def test_freebuf(self):
  r=sources.normalize_freebuf_rows([{'title':'Article','url':'/news/123.html','cover':'https://image.3001.net/a.jpg'}]);self.assertEqual(r[0]['cover'],'https://image.3001.net/a.jpg')
 def test_uisdc_excludes_navigation(self):
  html='<a href="https://www.uisdc.com/guide-test">这是导航入口不是新闻文章</a><div id="home_list_normal"><a href="https://www.uisdc.com/article-test">这是真正的设计新闻文章标题</a></div>'
  rows=sources.parse_source('uisdc',html.encode());self.assertEqual(len(rows),1);self.assertTrue(rows[0]['url'].endswith('article-test'))
 def test_local_cache(self):
  url='https://image.uisdc.com/a.jpg';row={'title':'A','url':'https://www.uisdc.com/article','cover':url}
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'__file__',str(Path(tmp)/'scripts/source_images.py')):
   response=io.BytesIO(b'\xff\xd8\xfftest');response.url=url
   with patch.object(x.urllib.request,'urlopen',return_value=response):result=x.cache_source_covers('uisdc',[row])[0]
   self.assertTrue(result['cover'].startswith('source-covers/uisdc/'));self.assertEqual(result['originalCover'],url);self.assertTrue((Path(tmp)/'public'/result['cover']).exists())
   with patch.object(x.urllib.request,'urlopen',side_effect=AssertionError('Cache hit')):self.assertEqual(x.cache_source_covers('uisdc',[row])[0]['cover'],result['cover'])
   x.prune_covers({'uisdc':{'items':[result]}});self.assertTrue((Path(tmp)/'public'/result['cover']).exists());x.prune_covers({'uisdc':{'items':[]}});self.assertFalse((Path(tmp)/'public'/result['cover']).exists())
 def test_invalid_image_body(self):
  url='https://image.uisdc.com/a.jpg';row={'cover':url}
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'__file__',str(Path(tmp)/'scripts/source_images.py')):
   response=io.BytesIO(b'<html>not an image</html>');response.url=url
   with patch.object(x.urllib.request,'urlopen',return_value=response):self.assertEqual(x.cache_source_covers('uisdc',[row]),[row])
 def test_decorative_images_rejected(self):
  self.assertEqual(x.clean_cover('pojie52','https://static.52pojie.cn/static/image/filetype/rar.gif'),'')
  self.assertEqual(x.clean_cover('csdn','https://csdnimg.cn/release/cmsfe/public/img/lazyLogo2.png'),'')
  self.assertEqual(x.clean_cover('kanxue','https://bbs.kanxue.com/view/img/face/005.gif'),'')
 def test_content_image_and_logo(self):
  p=x.CoverParser('qbitai','https://www.qbitai.com/article');p.feed('<meta property="og:image" content="https://www.qbitai.com/qbitai-logo-1.png"><article><img src="https://i.qbitai.com/story.webp"></article>');self.assertFalse(p.meta);self.assertEqual(p.content_cover,'https://i.qbitai.com/story.webp')
 def test_news_and_native_fields(self):
  import json
  data={'data':[{'Title':'Topic','Url':'https://www.toutiao.com/trending/123','HotValue':'123','Image':{'url':'https://p3-sign.toutiaoimg.com/story.jpg'},'LabelUrl':'https://p3-sign.toutiaoimg.com/label.png'}]}
  rows=sources.parse_source('toutiao',json.dumps(data).encode());self.assertEqual(rows[0]['cover'],'https://p3-sign.toutiaoimg.com/story.jpg')
  rows=sources.parse_source('anquanke',json.dumps({'data':[{'id':123,'title':'Story','cover':'https://p0.ssl.qhimg.com/story.jpg'}]}).encode());self.assertTrue(rows[0]['cover'].endswith('story.jpg'))
 def test_prune_other_source_cache(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(x,'__file__',str(Path(tmp)/'scripts/source_images.py')):
   path=Path(tmp)/'public/source-covers/github'/('a'*24+'.png');path.parent.mkdir(parents=True);path.write_bytes(b'test');x.prune_covers({'sspai':{'items':[]}});self.assertTrue(path.exists())
 def test_other_source(self):
  rows=[{'title':'Test','url':'https://example.com/post'}];self.assertIs(x.attach_covers('unknown',rows,b'', ''),rows)
if __name__=='__main__':unittest.main()
