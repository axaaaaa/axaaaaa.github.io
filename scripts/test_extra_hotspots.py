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

class AddedSourcesTests(unittest.TestCase):
 def test_arxiv_atom_and_deduplication(self):
  entry='<entry><title> An AI paper </title><id>http://arxiv.org/abs/2611.12345v{}</id><published>2026-11-07T00:00:00Z</published></entry>'
  body=('<feed xmlns="http://www.w3.org/2005/Atom">'+entry.format(2)+entry.format(1)+'</feed>').encode()
  rows=x.parse_source('arxiv',body)
  self.assertEqual(len(rows),1)
  self.assertEqual(rows[0]['url'],'https://arxiv.org/abs/2611.12345')
  with self.assertRaises(ValueError):x.parse_source('arxiv',b'<rss><channel/></rss>')

 def test_kev_sorts_by_date_and_rejects_invalid_ids(self):
  entries=[{'cveID':cve,'vulnerabilityName':'Example','dateAdded':day} for cve,day in
           [('CVE-2026-1000','2026-11-01'),('CVE-2026-2000','2026-11-07'),('bad','2026-11-09')]]
  rows=x.parse_source('cisa_kev',json.dumps({'vulnerabilities':entries}).encode())
  self.assertEqual([row['url'].rsplit('/',1)[-1] for row in rows],['CVE-2026-2000','CVE-2026-1000'])
  self.assertIn('CVE-2026-2000',rows[0]['meta'])

 def test_cncert_publisher_link(self):
  body=('<li><span>[2026-11-07]</span><a href="javascript:void(0)" '
        'onclick=window.open("/publish/main/9/2026/123/123_.html")>中文<b>漏洞</b>公告</a></li>').encode()
  row,=x.parse_source('cncert',body)
  self.assertEqual(row['title'],'中文漏洞公告')
  self.assertEqual(row['url'],'https://www.cert.org.cn/publish/main/9/2026/123/123_.html')

 def test_translation_keeps_original_and_metadata(self):
  items=[{'title':'AI study','meta':'arXiv:2611.12345'}]
  with patch.object(x,'translate_title',return_value='人工智能研究') as translate:
   row,=x.translate_security_titles(items)
  translate.assert_called_once_with('AI study')
  self.assertEqual((row['title'],row['originalTitle']),('人工智能研究','AI study'))
  self.assertEqual(row['meta'],'机器翻译 · arXiv:2611.12345')


class AdditionalSecuritySourcesTests(unittest.TestCase):
 def test_github_advisories_excludes_withdrawn(self):
  first={'ghsa_id':'GHSA-1234-abcd-1234','summary':'A vulnerability','severity':'high'}
  withdrawn={**first,'ghsa_id':'GHSA-abcd-1234-abcd','withdrawn_at':'2026-11-01'}
  row,=x.parse_source('github_advisory',json.dumps([first,withdrawn]).encode())
  self.assertIn('高危',row['meta'])
  self.assertEqual(row['url'],'https://github.com/advisories/GHSA-1234-abcd-1234')

 def test_cve_prefix_and_official_record(self):
  cve='CVE-2026-12345'
  batch={'new':[{'cveId':cve,'githubLink':'https://example.invalid/'}],'updated':[{'cveId':cve}]}
  prefix=('['+json.dumps(batch)+', {"truncated":').encode()
  record={'cveMetadata':{'state':'PUBLISHED','cveId':cve,'dateUpdated':'2026-11-08'},'containers':{'cna':{'title':'Example'}}}
  with patch.object(x,'request_body',return_value=json.dumps(record).encode()) as request:
   row,=x.parse_source('cve_program',prefix)
  request.assert_called_once_with(x.CVE_RECORD_BASE+'2026/12xxx/'+cve+'.json')
  self.assertEqual(row['url'],'https://www.cve.org/CVERecord?id='+cve)
  record['cveMetadata']['state']='REJECTED'
  self.assertIsNone(x.parse_cve_record(cve,json.dumps(record).encode()))

 def test_crowdstrike_rejects_other_hosts_and_localizes_date(self):
  feed=b'<rss><channel><item><title>Blog article</title><link>https://www.crowdstrike.com/en-us/blog/article/</link><pubDate>Nov 05, 2026 00:00:00-0600</pubDate></item><item><title>Other</title><link>https://example.com/en-us/blog/article/</link></item></channel></rss>'
  row,=x.parse_source('crowdstrike',feed)
  self.assertEqual(row['meta'],'发布 2026-11-05')

if __name__=='__main__':unittest.main()
