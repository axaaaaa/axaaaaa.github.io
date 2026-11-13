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
 def test_projectzero_atom_uses_canonical_host_and_publication_date(self):
  url='https://projectzero.google/2026/10/security-report.html'
  body=('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Security report</title>'
        f'<link rel="alternate" href="{url}"/><published>2026-10-06</published>'
        '<updated>2026-10-09</updated></entry></feed>').encode()
  row,=f.parse_source('projectzero',body)
  self.assertEqual((row['url'],row['meta']),(url,'2026-10-06'))
  with self.assertRaises(ValueError):f.parse_source('projectzero',self.feed('https://projectzero.google/2026/10/'))
 def test_unit42_rss_translation_and_host_filter(self):
  url='https://unit42.paloaltonetworks.com/security-report/'
  with patch.object(f,'request_body',return_value=self.feed(url)),patch.object(f,'translate_title',return_value='安全研究报告'):
   row,=f.fetch('unit42')['items']
  self.assertEqual((row['url'],row['title'],row['originalTitle']),(url,'安全研究报告','Security report'))
  for invalid in ('https://unit42.paloaltonetworks.com.evil.test/report/','https://unit42.paloaltonetworks.com/category/research/'):
   with self.assertRaises(ValueError):f.parse_source('unit42',self.feed(invalid))
 def test_msrc_orders_by_publication_and_uses_official_links(self):
  body=json.dumps({'value':[
   {'ID':'2026-Oct','DocumentTitle':'October Security Updates','InitialReleaseDate':'2026-10-01T00:00:00Z','CurrentReleaseDate':'2026-11-12T00:00:00Z'},
   {'ID':'2026-Nov','DocumentTitle':'November Security Updates','InitialReleaseDate':'2026-11-04T08:00:00Z'},
   {'ID':'2026-Dec','DocumentTitle':'Mariner Release Notes','InitialReleaseDate':'2026-12-01T00:00:00Z'}]}).encode()
  rows=f.parse_source('msrc',body)
  self.assertEqual([r['url'].rsplit('/',1)[-1] for r in rows],['2026-Nov','2026-Oct'])
  self.assertIn('修订 2026-11-12',rows[1]['meta'])
 def test_chrome_stable_requires_security_signal_and_official_link(self):
  base='https://chromereleases.googleblog.com/2026/11/'
  def entry(title,url,content):
   return f'<entry><title>{title}</title><link rel="alternate" href="{url}"/><published>2026-11-09T09:00:00Z</published><content>{content}</content></entry>'
  stable='Stable Channel Update for Desktop'
  good=base+'stable-security.html'
  body=('<feed xmlns="http://www.w3.org/2005/Atom">'+entry(stable,good,'CVE-2026-12345')+
        entry(stable,base+'ordinary.html','Routine changes')+entry('Chrome Beta for Desktop Update',base+'beta.html','CVE-2026-12345')+
        entry(stable,'https://evil.test/2026/11/stable.html','2 security fixes')+'</feed>').encode()
  self.assertEqual([r['url'] for r in f.parse_source('chrome_security',body)],[good])
 def test_ubuntu_notices_translate_with_usn_metadata(self):
  url='https://ubuntu.com/security/notices/USN-9022-1'
  body=self.feed(url,'USN-9022-1: Linux kernel vulnerabilities')
  with patch.object(f,'request_body',return_value=body),patch.object(f,'translate_title',return_value='Linux 内核漏洞'):
   row,=f.fetch('ubuntu_security')['items']
  self.assertEqual((row['url'],row['title'],row['originalTitle']),(url,'Linux 内核漏洞','USN-9022-1: Linux kernel vulnerabilities'))
  self.assertIn('USN-9022-1',row['meta'])
 def test_unknowncheats_public_threads_only(self):
  url='https://www.unknowncheats.me/forum/counter-strike-2-a/780609-example-new-post.html'
  good=f'<item><title>Forum question</title><link>{url}</link><category>Counter-Strike 2</category><pubDate>Tue, 10 Nov 2026 11:24:59 GMT</pubDate></item>'
  bad='<item><title>Offsite</title><link>https://example.com/forum/category/780609-test.html</link></item><item><title>Downloads</title><link>https://www.unknowncheats.me/forum/downloads.php</link></item>'
  body=('<rss><channel>'+good+bad+'</channel></rss>').encode()
  with patch.object(f,'request_body',return_value=body),patch.object(f,'translate_title',return_value='论坛问题'):
   row,=f.fetch('unknowncheats')['items']
  self.assertEqual((row['url'],row['title'],row['originalTitle']),(url,'论坛问题','Forum question'))
  self.assertIn('Counter-Strike 2 · 2026-11-10',row['meta'])
 def test_ai_official_rss_domains_and_translation(self):
  for key,url in [('openai_news','https://openai.com/index/model-news/'),('deepmind_news','https://deepmind.google/blog/model-news/')]:
   with self.subTest(key=key),patch.object(f,'request_body',return_value=self.feed(url)),patch.object(f,'translate_title',return_value='模型更新'):
    row,=f.fetch(key)['items']
    self.assertEqual((row['url'],row['title'],row['originalTitle']),(url,'模型更新','Security report'))
   with self.assertRaises(ValueError):f.parse_source(key,self.feed('https://example.com/index/model-news/'))
 def test_anthropic_parses_dated_headline_not_category_link(self):
  body=b'<li data-listing-row="id"><a href="/news/announcements">Announcements</a><a href="/news/model-news"><span><h3>New model &amp; tools</h3></span></a><time>Nov 10, 2026</time></li>'
  row,=f.parse_source('anthropic_news',body)
  self.assertEqual((row['title'],row['url'],row['meta']),('New model & tools','https://www.anthropic.com/news/model-news','发布 2026-11-10'))
 def test_anthropic_hero_absolute_url_and_dedup(self):
  url='https://www.anthropic.com/claude-fable-and-mythos-5-2'
  hero=f'<article><time>Nov 9, 2026</time><a href="{url}"><h2>Introducing Claude Fable 5.2 and Claude Mythos 5.2</h2></a></article>'
  row,=f.parse_source('anthropic_news',(hero+hero).encode())
  self.assertEqual(row['url'],url)
  self.assertIn('Fable 5.2',row['title'])
  with self.assertRaises(ValueError):f.parse_source('anthropic_news',hero.replace('www.anthropic.com','evil.test').encode())
 def test_cn_deepseek_dated_heading(self):
  body='<h2>时间: 2026-10-17</h2><h3 id="search-api">开放自研搜索 API<a href="#">link</a></h3>'
  row,=f.parse_source('deepseek_news',body.encode())
  self.assertEqual(row['title'],'开放自研搜索 API')
  self.assertIn('#search-api',row['url'])
 def test_cn_seed_and_kimi_dated_cards(self):
  seed='<a href="/zh/blog/new-model"><h3>模型发布</h3><span>2026.11.09</span></a>'
  kimi='<div class="menu-card hero"><a href="/en/blog/kimi-k3"></a><h4>Kimi K3</h4><p class="card-date text">2026-10-24</p></div>'
  self.assertEqual(f.parse_source('bytedance_news',seed.encode())[0]['title'],'模型发布')
  self.assertEqual(f.parse_source('kimi_news',kimi.encode())[0]['url'],'https://www.kimi.com/en/blog/kimi-k3')
 def test_tencent_only_public_published_entries(self):
  rows=[{'title':'模型发布','customUrl':'hy4','publicVisible':1,'status':2,'displayPublishTime':1793721600},
        {'title':'Draft','customUrl':'draft','publicVisible':0,'status':1,'displayPublishTime':1793721600}]
  result=f.parse_source('tencent_ai_news',json.dumps({'code':0,'data':{'list':rows}}).encode())
  self.assertEqual([r['url'] for r in result],['https://hunyuan.tencent.com/research/hy4'])
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
