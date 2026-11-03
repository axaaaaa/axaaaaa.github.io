import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_extra_hotspots as x
class Tests(unittest.TestCase):
 def test_rss_dedup(self):
  row='<item><title>A &amp; B</title><link>https://sspai.com/post/1</link></item>'
  self.assertEqual(len(x.parse_source('sspai',('<rss><channel>'+row+row+'</channel></rss>').encode())),1)
 def test_juejin(self):
  d={'err_no':0,'data':[{'content':{'title':'Test topic','content_id':'123'},'content_counter':{'view':10,'like':2}}]}
  self.assertEqual(x.parse_source('juejin',json.dumps(d).encode())[0]['url'],'https://juejin.cn/post/123')
 def test_html(self):
  d='<a href="https://www.gamersky.com/news/202610/123.shtml">测试文章标题</a><a href="javascript:bad">bad</a>'
  self.assertEqual(len(x.parse_source('gamersky',d.encode())),1)
 def test_ruanyifeng(self):
  html='<a href="/blog/2026/10/weekly-issue-416.html">科技爱好者周刊（第416期）：Test</a><a href="https://www.ruanyifeng.com/blog/2026/10/weekly-issue-417.html">科技爱好者周刊（第417期）：New</a><a href="/blog/other.html">普通文章</a>'
  rows=x.parse_source('ruanyifeng',html.encode())
  self.assertEqual(len(rows),2)
  self.assertTrue(rows[0]['url'].endswith('weekly-issue-417.html'))
  self.assertEqual(rows[0]['meta'],'第 417 期')
 def test_forums(self):
  headers=''.join(f'<td><a href="forum.php?mod=guide&amp;view={v}">榜单</a></td>' for v in ['newthread','tech','hot','digest'])
  columns=''.join('<td>'+''.join(f'<a href="thread-{c*100+i}-1-1.html">首页帖子{c}-{i}</a>' for i in range(1,11))+'</td>' for c in range(4))
  html=f'<table class="toplist_7ree"><tr>{headers}</tr><tr>{columns}</tr></table>'
  for c,key in enumerate(['pojie52_new','pojie52_tech','pojie52','pojie52_digest']):
   rows=x.parse_source(key,html.encode('gb18030'))
   self.assertEqual(len(rows),10)
   self.assertTrue(rows[0]['url'].endswith(f'thread-{c*100+1}-1-1.html'))
   self.assertTrue(rows[-1]['url'].endswith(f'thread-{c*100+10}-1-1.html'))
  with self.assertRaises(ValueError):x.parse_source('pojie52',b'<html>missing homepage table</html>')
  rows=x.parse_source('kanxue','<a href="thread-123.htm">公开技术热门帖子</a><a href="user-1.htm">作者个人页排除</a>'.encode())
  self.assertEqual(len(rows),1)
 def test_finance(self):
  a='<a href="/news/123.html">第一财经测试新闻标题</a><a href="/about">网站介绍入口</a>'
  self.assertEqual(len(x.parse_source('yicai',a.encode())),1)
  b='<a href="https://finance.sina.com.cn/roll/2026-10-31/doc-abc123.shtml">新浪财经测试新闻标题</a>'
  self.assertEqual(len(x.parse_source('sinafinance',b.encode())),1)
 def test_new_communities(self):
  cases={
   'csdn':'<a href="https://blog.csdn.net/user_1/article/details/123">测试技术文章</a><a href="https://blog.csdn.net/blogdevteam/article/details/126135357">账号管理规范</a>',
   'zcool':'<a href="https://www.zcool.com.cn/work/ZNzQzMDE3MzI=.html?utm_source=test">设计作品测试</a>',
   'xz':'<a href="/news/123">公开安全技术文章</a>'
  }
  for key,html in cases.items():self.assertEqual(len(x.parse_source(key,html.encode())),1)
  rows=x.parse_source('anquanke',json.dumps({'data':[{'id':123,'title':'安全研究文章'}]}).encode())
  self.assertEqual(rows[0]['url'],'https://www.anquanke.com/post/id/123')
 def test_new_rss_sources(self):
  body=b'<rss><channel><item><title>Public article</title><link>https://example.com/post/1</link></item></channel></rss>'
  for key in ['woshipm','oschina','freebuf']:self.assertEqual(len(x.parse_source(key,body)),1)
 def test_freebuf_rendered_rows(self):
  rows=[{'title':' Test article ', 'url':'/news/123.html'},
        {'title':'Duplicate article','url':'https://www.freebuf.com/news/123.html'},
        {'title':'Technical article','url':'/articles/web/456.html'},
        {'title':'Author profile','url':'/author/test'},
        {'title':'Wrong domain','url':'https://example.com/news/999.html'}]
  result=x.normalize_freebuf_rows(rows)
  self.assertEqual(len(result),2)
  self.assertEqual(result[0]['title'],'Test article')
  self.assertEqual(result[1]['url'],'https://www.freebuf.com/articles/web/456.html')
 def test_freebuf_empty(self):
  with self.assertRaises(ValueError):x.normalize_freebuf_rows([])
 def test_freebuf_browser_route(self):
  rows=[{'title':'Test article','url':'https://www.freebuf.com/news/123.html','meta':''}]
  with patch.object(x,'fetch_freebuf_items',return_value=rows),patch.object(x.urllib.request,'urlopen',side_effect=AssertionError('RSS should not be used')):
   result=x.fetch('freebuf')
  self.assertEqual(result['items'],rows)
  self.assertTrue(result['updatedAt'])
  self.assertNotIn('unavailable',result)
 def test_empty(self):
  with self.assertRaises(ValueError):x.parse_source('toutiao',b'{"data":[]}')
 def test_partial_outage(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'sources.json';old={'items':[{'title':'old'}],'updatedAt':'2026-10-30T00:00:00Z'};p.write_text(json.dumps({'sources':{'sspai':old}}))
   def fetch(key):
    if key=='sspai':raise OSError('offline')
    return {'items':[{'title':'new'}],'updatedAt':'2026-10-31T00:00:00Z'}
   with patch('sys.argv',['fetch','--output',str(p)]),patch.object(x,'fetch',side_effect=fetch):x.main()
   result=json.loads(p.read_text())['sources']['sspai'];self.assertEqual(result['items'],old['items']);self.assertEqual(result['updatedAt'],old['updatedAt']);self.assertEqual(result['collection']['status'],'stale');self.assertIn('offline',result['collection']['error'])
 def test_freebuf_atom(self):
  body=b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Test article</title><link href="https://www.freebuf.com/news/123.html"/><updated>2026-11-01</updated></entry></feed>'
  self.assertEqual(x.parse_freebuf_feed(body)[0]['url'],'https://www.freebuf.com/news/123.html')
 def test_weekly_official_backup(self):
  body='- 第 417 期：[New issue](docs/issue-417.md)\n- 第 416 期：[Old issue](docs/issue-416.md)'.encode()
  self.assertTrue(x.parse_weekly_backup(body)[0]['url'].endswith('issue-417.md'))
  with patch.object(x,'request_body',side_effect=[OSError('403'),body]),patch.object(x,'attach_covers',side_effect=lambda k,items,*a:items),patch.object(x,'cache_source_covers',side_effect=lambda k,items:items):
   data=x.fetch('ruanyifeng')
  self.assertEqual(data['sourceUrlUsed'],x.WEEKLY_BACKUP)
 def test_weekly_backup_rejects_empty(self):
  with self.assertRaises(ValueError):x.parse_weekly_backup(b'error page')
if __name__=='__main__':unittest.main()
