"""Independent public source snapshots; FreeBuf uses a rendered Chromium page."""
import argparse,json,os,re,urllib.request,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from html import unescape
from email.utils import parsedate_to_datetime
from urllib.parse import urljoin,urlparse,quote
from datetime import datetime,timezone
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from source_images import attach_covers,clean_cover,cache_source_covers,prune_covers,cache_douban_posters,public_directory
SOURCES={
 'github_advisory':{'name': 'GitHub Advisory Database', 'kind': 'GitHub 审核的开源漏洞', 'url': 'https://github.com/advisories', 'endpoint': 'https://api.github.com/advisories?type=reviewed&sort=published&direction=desc&per_page=8', 'icon': 'https://github.githubassets.com/favicons/favicon.svg'},
 'cve_program':{'name': 'CVE Program', 'kind': '官方 CVE 记录', 'url': 'https://www.cve.org/', 'endpoint': 'https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/deltaLog.json', 'icon': 'https://www.cve.org/cvePurpleVFavicon.svg'},
 'crowdstrike':{'name': 'CrowdStrike Blog', 'kind': '威胁研究与安全资讯', 'url': 'https://www.crowdstrike.com/en-us/blog/', 'endpoint': 'https://www.crowdstrike.com/en-us/blog/feed', 'icon': 'https://www.crowdstrike.com/etc.clientlibs/crowdstrike/clientlibs/crowdstrike-common/resources/favicon.ico'},
 'arxiv':{'name': 'arXiv 人工智能论文', 'kind': 'AI 预印本 · 中文机译', 'url': 'https://arxiv.org/list/cs.AI/recent', 'endpoint': 'https://export.arxiv.org/api/query?search_query=cat%3Acs.AI&sortBy=submittedDate&sortOrder=descending&max_results=12', 'icon': 'https://arxiv.org/favicon.ico'},
 'cisa_kev':{'name': 'CISA KEV', 'kind': '已知在野利用漏洞 · 中文机译', 'url': 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', 'endpoint': 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', 'icon': 'https://www.cisa.gov/favicon.ico'},
 'cncert':{'name': '国家互联网应急中心', 'kind': '中文漏洞公告', 'url': 'https://www.cert.org.cn/publish/main/9/index.html', 'endpoint': 'https://www.cert.org.cn/publish/main/9/index.html', 'icon': 'https://www.cert.org.cn/favicon.ico'},
 'dongchedi':{'name': '懂车帝', 'kind': '汽车资讯', 'url': 'https://www.dongchedi.com/', 'endpoint': 'https://www.dongchedi.com/', 'icon': 'https://www.dongchedi.com/favicon.ico'},
 'autohome':{'name': '汽车之家', 'kind': '汽车资讯', 'url': 'https://www.autohome.com.cn/news/', 'endpoint': 'https://www.autohome.com.cn/news/', 'icon': 'https://www.autohome.com.cn/favicon.ico'},
 'pcauto':{'name': '太平洋汽车', 'kind': '汽车资讯', 'url': 'https://www.pcauto.com.cn/news/', 'endpoint': 'https://www.pcauto.com.cn/news/', 'icon': 'https://www.pcauto.com.cn/favicon.ico'},

 'reuters':{'name': '路透社', 'kind': '国际新闻 · Google 新闻索引 · 中文机译', 'url': 'https://www.reuters.com/world/', 'endpoint': 'https://news.google.com/rss/search?q=site:reuters.com/world+when:3d&hl=en-US&gl=US&ceid=US:en', 'icon': 'https://reutersagency.com/hubfs/Favicon-1.png'},
 'ap':{'name': '美联社 AP', 'kind': '国际新闻 · Google 新闻索引 · 中文机译', 'url': 'https://apnews.com/world-news', 'endpoint': 'https://news.google.com/rss/search?q=site:apnews.com/article+world+when:3d&hl=en-US&gl=US&ceid=US:en', 'icon': 'https://apnews.com/favicon.ico'},
 'bbc':{'name': 'BBC 国际新闻', 'kind': '国际新闻 · 中文机译', 'url': 'https://www.bbc.com/news/world', 'endpoint': 'https://feeds.bbci.co.uk/news/world/rss.xml', 'icon': 'https://www.bbc.com/favicon.ico'},
 'aljazeera':{'name': '半岛电视台英文版', 'kind': '国际新闻 · 中文机译', 'url': 'https://www.aljazeera.com/', 'endpoint': 'https://www.aljazeera.com/xml/rss/all.xml', 'icon': 'https://www.aljazeera.com/favicon_aje.ico'},
 'guardian':{'name': '卫报国际版', 'kind': '国际新闻 · 中文机译', 'url': 'https://www.theguardian.com/world', 'endpoint': 'https://www.theguardian.com/world/rss', 'icon': 'https://www.theguardian.com/favicon.ico'},
 'nhk':{'name': 'NHK WORLD-JAPAN', 'kind': '国际新闻 · Google 新闻索引 · 中文机译', 'url': 'https://www3.nhk.or.jp/nhkworld/news/', 'endpoint': 'https://news.google.com/rss/search?q=site:nhk.or.jp/nhkworld+when:3d&hl=en-US&gl=US&ceid=US:en', 'icon': 'https://www3.nhk.or.jp/nhkworld/common/site_images/nw_webapp_news_192x192.png'},

 'globaltimes':{'name':'环球时报（英文版）','kind':'国际资讯 · 中文机译','url':'https://www.globaltimes.cn/','endpoint':'https://www.globaltimes.cn/','icon':'https://www.globaltimes.cn/favicon.ico'},
 'nytimes':{'name':'纽约时报','kind':'国际新闻 · 中文机译','url':'https://www.nytimes.com/section/world','endpoint':'https://rss.nytimes.com/services/xml/rss/nyt/World.xml','icon':'https://www.nytimes.com/favicon.ico'},
 'wsj':{'name':'华尔街日报','kind':'国际新闻 · 中文机译','url':'https://www.wsj.com/world','endpoint':'https://feeds.content.dowjones.io/public/rss/RSSWorldNews','icon':'https://www.wsj.com/favicon.ico'},
 'maoyan':{'name':'猫眼','kind':'国内票房榜','url':'https://www.maoyan.com/board/1','endpoint':'https://www.maoyan.com/board/1','icon':'https://www.maoyan.com/favicon.ico'},
 'douban_book':{'name':'豆瓣读书','kind':'新书速递','url':'https://book.douban.com/latest','endpoint':'https://book.douban.com/','icon':'https://img3.doubanio.com/favicon.ico'},
 'douban':{'name': '豆瓣电影', 'kind': '热门电影 · 豆瓣评分', 'url': 'https://movie.douban.com/explore', 'endpoint': 'https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=24&page_start=0', 'icon': 'https://movie.douban.com/favicon.ico'},
 'microsoft':{'name': '微软安全博客', 'kind': '安全研究与资讯 · 中文机译', 'url': 'https://www.microsoft.com/en-us/security/blog/', 'endpoint': 'https://www.microsoft.com/en-us/security/blog/feed/', 'icon': 'https://www.microsoft.com/favicon.ico'},
 'seebug':{'name': 'Seebug 漏洞库', 'kind': '最新漏洞情报', 'url': 'https://www.seebug.org/', 'endpoint': 'https://www.seebug.org/', 'icon': 'https://www.seebug.org/favicon.ico'},

 'securelist':{'name': 'Securelist · 卡巴斯基', 'kind': '威胁研究 · 中文机译', 'url': 'https://securelist.com/', 'endpoint': 'https://securelist.com/feed/', 'icon': 'https://securelist.com/favicon.ico'},
 'checkpoint':{'name': 'Check Point Research', 'kind': '安全研究 · 中文机译', 'url': 'https://research.checkpoint.com/', 'endpoint': 'https://research.checkpoint.com/feed/', 'icon': 'https://research.checkpoint.com/favicon.ico'},
 'sentinellabs':{'name': 'SentinelLABS', 'kind': '威胁情报 · 中文机译', 'url': 'https://www.sentinelone.com/labs/', 'endpoint': 'https://www.sentinelone.com/labs/feed/', 'icon': 'https://www.sentinelone.com/favicon.ico'},
 'elastic':{'name': 'Elastic Security Labs', 'kind': '检测与研究 · 中文机译', 'url': 'https://www.elastic.co/security-labs', 'endpoint': 'https://www.elastic.co/security-labs/rss/feed.xml', 'icon': 'https://www.elastic.co/favicon.ico'},
 'eset':{'name': 'ESET · WeLiveSecurity', 'kind': '威胁研究与资讯 · 中文机译', 'url': 'https://www.welivesecurity.com/en/', 'endpoint': 'https://www.welivesecurity.com/en/rss/feed/', 'icon': 'https://www.welivesecurity.com/favicon.ico'},

 'thehackernews':{'name':'The Hacker News','kind':'国际安全资讯 · 中文机译','url':'https://thehackernews.com/','endpoint':'https://feeds.feedburner.com/TheHackersNews','icon':'https://thehackernews.com/favicon.ico'},
 'baidu':{'name':'百度热搜','kind':'实时热搜榜','url':'https://top.baidu.com/board?tab=realtime','endpoint':'https://top.baidu.com/board?tab=realtime','icon':'https://www.baidu.com/favicon.ico'},
 'pojie52_new':{'name':'吾爱破解 · 新鲜出炉','kind':'新鲜出炉','url':'https://www.52pojie.cn/forum.php?mod=guide&view=newthread','endpoint':'https://www.52pojie.cn/','icon':'https://www.52pojie.cn/favicon.ico'},
 'pojie52_tech':{'name':'吾爱破解 · 技术分享','kind':'技术分享','url':'https://www.52pojie.cn/forum.php?mod=guide&view=tech','endpoint':'https://www.52pojie.cn/','icon':'https://www.52pojie.cn/favicon.ico'},
 'pojie52_digest':{'name':'吾爱破解 · 精华采撷','kind':'精华采撷','url':'https://www.52pojie.cn/forum.php?mod=guide&view=digest','endpoint':'https://www.52pojie.cn/','icon':'https://www.52pojie.cn/favicon.ico'},

 'ijingyi_new':{'name':'精易论坛 · 最新帖','kind':'最新帖','url':'https://bbs.ijingyi.com/','endpoint':'https://bbs.ijingyi.com/','icon':'https://bbs.ijingyi.com/favicon.ico'},
 'ijingyi_hot':{'name':'精易论坛 · 本周热帖','kind':'本周热帖','url':'https://bbs.ijingyi.com/','endpoint':'https://bbs.ijingyi.com/','icon':'https://bbs.ijingyi.com/favicon.ico'},
 'bilibili':{'name':'哔哩哔哩（B站）','kind':'热门视频 · 非播放量排行','url':'https://www.bilibili.com/v/popular/all','endpoint':'https://api.bilibili.com/x/web-interface/popular?pn=1&ps=24','icon':'https://www.bilibili.com/favicon.ico'},
 'tieba':{'name':'百度贴吧','kind':'热议话题榜','url':'https://tieba.baidu.com/','endpoint':'https://tieba.baidu.com/hottopic/browse/topicList','icon':'https://tieba.baidu.com/favicon.ico'},
 'woshipm':{'name':'人人都是产品经理','kind':'产品与运营文章','url':'https://www.woshipm.com/','endpoint':'https://www.woshipm.com/feed','icon':'https://www.woshipm.com/favicon.ico'},
 'csdn':{'name':'CSDN 博客','kind':'最新技术文章','url':'https://blog.csdn.net/','endpoint':'https://blog.csdn.net/nav/newarticles','icon':'https://blog.csdn.net/favicon.ico'},
 'oschina':{'name':'开源中国','kind':'开源资讯','url':'https://www.oschina.net/','endpoint':'https://www.oschina.net/news/rss','icon':'https://www.oschina.net/favicon.ico'},
 'zcool':{'name':'站酷','kind':'设计作品发现','url':'https://www.zcool.com.cn/discover','endpoint':'https://www.zcool.com.cn/discover','icon':'https://www.zcool.com.cn/favicon.ico'},
 'xz':{'name':'先知社区','kind':'安全技术文章','url':'https://xz.aliyun.com/','endpoint':'https://xz.aliyun.com/','icon':'https://xz.aliyun.com/favicon.ico'},
 'anquanke':{'name':'安全客','kind':'安全资讯与研究','url':'https://www.anquanke.com/','endpoint':'https://api.anquanke.com/data/v1/posts?size=24&page=1','icon':'https://www.anquanke.com/favicon.ico'},
 'freebuf':{'name':'FreeBuf','kind':'安全资讯','url':'https://www.freebuf.com/','endpoint':'https://www.freebuf.com/','icon':'https://www.freebuf.com/favicon.ico'},
 'yicai':{'name':'第一财经','kind':'财经资讯','url':'https://www.yicai.com/','endpoint':'https://www.yicai.com/','icon':'https://www.yicai.com/favicon.ico'},
 'sinafinance':{'name':'新浪财经','kind':'财经资讯','url':'https://finance.sina.com.cn/','endpoint':'https://finance.sina.com.cn/','icon':'https://finance.sina.com.cn/favicon.ico'},
 'pojie52':{'name':'吾爱破解热门','kind':'论坛最新热门','url':'https://www.52pojie.cn/forum.php?mod=guide&view=hot','endpoint':'https://www.52pojie.cn/','icon':'https://www.52pojie.cn/favicon.ico'},
 'kanxue':{'name':'看雪论坛热门','kind':'论坛热门榜','url':'https://bbs.kanxue.com/thread-hotlist-all-3.htm','endpoint':'https://bbs.kanxue.com/thread-hotlist-all-3.htm','icon':'https://bbs.kanxue.com/favicon.ico'},
 'ruanyifeng':{'name':'科技爱好者周刊','kind':'阮一峰 · 最新期刊','url':'https://www.ruanyifeng.com/blog/weekly/index.html','endpoint':'https://www.ruanyifeng.com/blog/weekly/index.html','icon':'https://www.ruanyifeng.com/favicon.ico'},
 'uisdc':{'name':'优设网','kind':'设计资讯','url':'https://www.uisdc.com/','endpoint':'https://www.uisdc.com/','icon':'https://www.uisdc.com/favicon.ico'},
 'geekpark':{'name':'极客公园','kind':'科技资讯','url':'https://www.geekpark.net/','endpoint':'https://www.geekpark.net/rss','icon':'https://www.geekpark.net/favicon.ico'},
 'qbitai':{'name':'量子位','kind':'AI 资讯','url':'https://www.qbitai.com/','endpoint':'https://www.qbitai.com/feed','icon':'https://www.qbitai.com/favicon.ico'},
 'sspai':{'name':'少数派','kind':'最新文章','url':'https://sspai.com/','endpoint':'https://sspai.com/feed','icon':'https://sspai.com/favicon.ico'},
 'juejin':{'name':'稀土掘金','kind':'文章热榜','url':'https://juejin.cn/','endpoint':'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot','icon':'https://juejin.cn/favicon.ico'},
 'toutiao':{'name':'今日头条热榜','kind':'热榜','url':'https://www.toutiao.com/','endpoint':'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc','icon':'https://www.toutiao.com/favicon.ico'},
 'qq':{'name':'腾讯新闻','kind':'热点榜','url':'https://news.qq.com/','endpoint':'https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=20','icon':'https://news.qq.com/favicon.ico'},
 'netease':{'name':'网易新闻','kind':'最新资讯','url':'https://news.163.com/','endpoint':'https://news.163.com/special/0001220O/news_json.js','icon':'https://www.163.com/favicon.ico'},
 'hellogithub':{'name':'HelloGitHub','kind':'开源月刊','url':'https://hellogithub.com/','endpoint':'https://hellogithub.com/rss','icon':'https://hellogithub.com/favicon.ico'},
 'gamersky':{'name':'游民星空','kind':'游戏资讯','url':'https://www.gamersky.com/news/','endpoint':'https://www.gamersky.com/news/','icon':'https://www.gamersky.com/favicon.ico'}
}
SECURITY_RESEARCH_SOURCES={'crowdstrike','microsoft','securelist','checkpoint','sentinellabs','elastic','eset'}
SECURITY_FEED_HOSTS={
 'crowdstrike':{'www.crowdstrike.com','crowdstrike.com'},
 'microsoft':{'www.microsoft.com','microsoft.com'},
 'securelist':{'securelist.com'},'checkpoint':{'research.checkpoint.com'},
 'sentinellabs':{'www.sentinelone.com','sentinelone.com'},'elastic':{'www.elastic.co','elastic.co'},
 'eset':{'www.welivesecurity.com','welivesecurity.com','www.eset.com','eset.com'}
}

def parse_security_feed(key,body):
 root=ET.fromstring(body);atom={'a':'http://www.w3.org/2005/Atom'};rows=[];seen=set()
 for entry in root.findall('.//item') or root.findall('a:entry',atom):
  title=clean(entry.findtext('title') or entry.findtext('a:title',namespaces=atom))
  url=clean(entry.findtext('link') or next((link.get('href','') for link in entry.findall('a:link',atom) if link.get('rel','alternate')=='alternate'),''))
  try:
   u=urlparse(url)
   if u.scheme!='https' or u.hostname not in SECURITY_FEED_HOSTS[key] or u.username or u.password or u.port not in [None,443]:continue
  except ValueError:continue
  if key=='microsoft' and not re.fullmatch(r'/[a-z]{2}-[a-z]{2}/security/blog/\d{4}/\d{2}/\d{2}/[^/]+/',u.path):continue
  if key=='crowdstrike' and not re.fullmatch(r'/en-us/blog/[^/]+/?',u.path):continue
  if key=='sentinellabs' and not u.path.startswith('/labs/'):continue
  if key=='elastic' and not u.path.startswith('/security-labs/'):continue
  if key=='eset' and u.hostname.endswith('eset.com') and not u.path.startswith('/blog/'):continue
  if not title or url in seen:continue
  seen.add(url)
  date=clean(entry.findtext('pubDate') or entry.findtext('a:updated',namespaces=atom))
  if key=='crowdstrike':
   try:date='发布 '+datetime.strptime(date,'%b %d, %Y %H:%M:%S%z').date().isoformat()
   except ValueError:pass
  rows.append({'title':title,'url':url,'meta':date})
  if len(rows)==24:break
 if not rows:raise ValueError('No valid security research entries')
 return rows

def clean(s):return re.sub(r'\s+',' ',str(s or '')).strip()
def valid_url(url):
 try:return urlparse(url).scheme in ['http','https'] and bool(urlparse(url).hostname)
 except ValueError:return False
class Links(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.current=None;self.links=[]
 def handle_starttag(self,t,a):
  if t=='a':self.current=[dict(a).get('href',''),[]]
 def handle_data(self,d):
  if self.current:self.current[1].append(d)
 def handle_endtag(self,t):
  if t=='a' and self.current:self.links.append((self.current[0],clean(''.join(self.current[1]))));self.current=None

def parse_pojie_home(key,body):
 text=body.decode('gb18030')
 table=re.search(r'<table\b[^>]*class=["\'][^"\']*\btoplist_7ree\b[^"\']*["\'][^>]*>(.*?)</table>',text,re.S|re.I)
 if not table:raise ValueError('Missing Pojie homepage ranking table')
 trs=re.findall(r'<tr\b[^>]*>(.*?)</tr>',table.group(1),re.S|re.I)
 if len(trs)<2:raise ValueError('Missing Pojie homepage ranking rows')
 headers=re.findall(r'<td\b[^>]*>(.*?)</td>',trs[0],re.S|re.I)
 columns=re.findall(r'<td\b[^>]*>(.*?)</td>',trs[1],re.S|re.I)
 view={'pojie52_new':'newthread','pojie52_tech':'tech','pojie52':'hot','pojie52_digest':'digest'}[key]
 index=None
 for i,header in enumerate(headers):
  links=Links();links.feed(header)
  if any(re.search(r'[?&]view='+view+r'(?:&|$)',href) for href,title in links.links):index=i;break
 if index is None or index>=len(columns):raise ValueError('Missing Pojie homepage category')
 parser=Links();parser.feed(columns[index]);items=[];seen=set()
 for href,title in parser.links:
  url=urljoin('https://www.52pojie.cn/',href)
  if re.fullmatch(r'https://www\.52pojie\.cn/thread-\d+-\d+-\d+\.html',url) and len(title)>2 and url not in seen:
   seen.add(url);items.append({'title':title,'url':url,'meta':{'newthread':'新鲜出炉','tech':'技术分享','hot':'人气热门','digest':'精华采撷'}[view]})
 if len(items)<10:raise ValueError('Incomplete Pojie homepage top 10')
 return items[:10]

def parse_douban_books(body):
 text=body.decode('utf-8');rows=[];seen=set()
 for shelf in re.findall(r'<ul\b[^>]*class=["\'][^"\']*\blist-express\b[^"\']*["\'][^>]*>(.*?)</ul>',text,re.S):
  for block in re.findall(r'<li\b[^>]*>(.*?)</li>',shelf,re.S):
   entry=re.search(r'<div class="title">\s*(<a\b.*?</a>)',block,re.S)
   if not entry:continue
   links=Links();links.feed(entry.group(1))
   if not links.links:continue
   url,title=links.links[0];url=url.split('?',1)[0].split('#',1)[0]
   if not re.fullmatch(r'https://book\.douban\.com/subject/[0-9]+/',url) or not title or url in seen:continue
   seen.add(url);meta=[]
   for field in ('author','year','publisher'):
    match=re.search(r'<span class="'+field+r'">\s*([^<]+?)\s*</span>',block)
    if match:meta.append(clean(unescape(match.group(1))))
   row={'title':title,'url':url,'meta':' · '.join(meta)}
   cover=re.search(r'<img\b[^>]*\bsrc="([^"]+)"',block)
   if cover:
    image=clean_cover('douban_book',unescape(cover.group(1)))
    if image:row['cover']=image
   rows.append(row)
   if len(rows)==24:return rows
 if not rows:raise ValueError('No valid Douban new books')
 return rows

def parse_maoyan_board(body):
 text=body.decode('utf8');rows={};seen=set()
 for block in re.findall(r'<dd\b[^>]*>(.*?)</dd>',text,re.S):
  rank=re.search(r'<i\b[^>]*class="[^"]*\bboard-index\b[^"]*"[^>]*>\s*(\d+)\s*</i>',block)
  name=re.search(r'<p\s+class="name">\s*(<a\b.*?</a>)',block,re.S)
  if not rank or not name:continue
  links=Links();links.feed(name[1])
  if not links.links:continue
  path,title=links.links[0];r=int(rank[1])
  if not re.fullmatch(r'/films/[0-9]+',path) or not title or path in seen or r in rows or not 1<=r<=10:continue
  seen.add(path)
  date=re.search(r'<p class="releasetime">([^<]+)</p>',block)
  row={'title':title,'url':'https://www.maoyan.com'+path,'meta':clean(unescape(date[1])) if date else ''}
  for attrs in re.findall(r'<img\b([^>]+)>',block):
   if not re.search(r'\bclass="[^"]*\bboard-img\b',attrs):continue
   for field in ('data-src','src'):
    img=re.search(r'(?:^|\s)'+field+r'="([^"]+)"',attrs)
    if img:
     cover=clean_cover('maoyan',urljoin(SOURCES['maoyan']['url'],unescape(img[1])))
     if cover:row['cover']=cover;break
   break
  rows[r]=row
 if not rows or sorted(rows)!=list(range(1,len(rows)+1)):raise ValueError('No contiguous Maoyan ranking')
 return [rows[r] for r in sorted(rows)]

def parse_maoyan_metrics(body,movie_id):
 text=body.decode('utf8')
 match=re.search(r'\bvar\s+AppData\s*=\s*',text)
 if not match:raise ValueError('No Maoyan movie details')
 data=json.JSONDecoder().raw_decode(text[match.end():])[0]
 movie=data.get('movie') or {}
 if str(movie.get('id'))!=str(movie_id):raise ValueError('Maoyan movie ID mismatch')
 box=((data.get('mbox') or {}).get('mbox') or {}).get('sumBox')
 rating=movie.get('sc');out={}
 if type(box) in (int,float) and 0<=box<1_000_000_000:
  out['boxOffice']=f'{box:,.2f}'.rstrip('0').rstrip('.')+' 万元'
 if type(rating) in (int,float) and 0<rating<=10:
  out['rating']=f'{rating:.1f}'
 return out

def add_maoyan_metrics(items):
 def enrich(row):
  movie_id=row['url'].rsplit('/',1)[-1]
  if not re.fullmatch(r'[0-9]+',movie_id):return row
  try:return {**row,**parse_maoyan_metrics(request_body('https://m.maoyan.com/movie/'+movie_id),movie_id)}
  except Exception as error:
   print(f'MAOYAN_METRICS_PENDING {movie_id}: {type(error).__name__}')
   return row
 with ThreadPoolExecutor(max_workers=4) as pool:return list(pool.map(enrich,items))

def fetch_maoyan_board():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True,channel=os.environ.get('MAOYAN_BROWSER_CHANNEL') or None)
  try:
   page=browser.new_page()
   page.goto(SOURCES['maoyan']['endpoint'],wait_until='domcontentloaded',timeout=30000)
   page.locator('.board-index').first.wait_for(timeout=15000)
   body=page.content().encode('utf8')
  finally:browser.close()
 return parse_maoyan_board(body)

INTERNATIONAL_NEWS = {'globaltimes','nytimes','wsj','reuters','ap','bbc','aljazeera','guardian','nhk'}
INDEXED_NEWS = {'reuters':'reuters.com','ap':'apnews.com','nhk':'www3.nhk.or.jp'}
NEWS_DOMAINS = {'globaltimes':('globaltimes.cn',),'nytimes':('nytimes.com',),'wsj':('wsj.com',),
                'bbc':('bbc.co.uk','bbc.com'),'aljazeera':('aljazeera.com',),'guardian':('theguardian.com',)}

def indexed_headlines(key,items):
 domain=INDEXED_NEWS[key]
 for item in items:
  source=item.find('source')
  if source is None or urlparse(source.get('url','')).hostname not in (domain,'www.'+domain):continue
  title=clean(item.findtext('title') or '')
  suffix=' - '+clean(source.text or '')
  if source.text and title.endswith(suffix):title=title[:-len(suffix)]
  yield title,item.findtext('link'),item.findtext('pubDate')


def parse_international_news(key,body):
 if key=='globaltimes':
  links=Links();links.feed(body.decode('utf8'))
  candidates=((title,url,'') for url,title in links.links if re.fullmatch(r'https://www\.globaltimes\.cn/page/\d{6}/\d+\.shtml',url))
 else:
  items=ET.fromstring(body).findall('./channel/item')
  candidates=indexed_headlines(key,items) if key in INDEXED_NEWS else (
   (item.findtext('title'),item.findtext('link'),item.findtext('pubDate')) for item in items)
 rows=[];seen=set()
 domains=NEWS_DOMAINS.get(key,())
 pattern=(r'https://news\.google\.com/rss/articles/[^\s]+' if key in INDEXED_NEWS
          else r'https://(?:www\.)?(?:'+'|'.join(map(re.escape,domains))+r')/[^\s]+')
 for title,url,date in candidates:
  title=clean(title or '');url=clean(url or '')
  if not title or not re.fullmatch(pattern,url):continue
  canonical=url.split('?',1)[0].split('#',1)[0]
  if canonical in seen:continue
  seen.add(canonical);meta=''
  if date:
   try:meta=parsedate_to_datetime(date).date().isoformat()
   except (ValueError,TypeError):pass
  if key in INDEXED_NEWS:meta=' · '.join(filter(None,[meta,'经 Google 新闻跳转']))
  rows.append({'title':title,'url':url,'meta':meta})
  if len(rows)==12:break
 if not rows:raise ValueError(f'No articles for {key}')
 return rows

AUTO_NEWS = {'dongchedi','autohome','pcauto'}

def parse_auto_news(key,body):
 encoding='gb18030' if re.search(rb'charset\s*=\s*["\']?gb(?:2312|k|18030)',body[:4096],re.I) else 'utf8'
 text=body.decode(encoding,errors='replace')
 links=Links();links.feed(text)
 headlines={}
 if key=='autohome':
  for match in re.finditer(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>',text,re.S):
   heading=re.search(r'<h3\b[^>]*>(.*?)</h3>',match[2],re.S)
   if heading:headlines[unescape(match[1])]=clean(unescape(re.sub(r'<[^>]*>','',heading[1])))
 patterns={
  'dongchedi':r'https://www\.dongchedi\.com/article/(\d+)',
  'autohome':r'https://www\.autohome\.com\.cn/news/\d{6}/(\d+)\.html',
  'pcauto':r'https://www\.pcauto\.com\.cn/news/\d+/(\d+)\.html',
 }
 rows={}
 for href,title in links.links:
  title=headlines.get(href,title)
  if not title or len(title)<4 or (key=='autohome' and len(title)>90):continue
  url=urljoin(SOURCES[key]['url'],href).split('#',1)[0].split('?',1)[0]
  match=re.fullmatch(patterns[key],url)
  if match and url not in rows:rows[url]=(int(match[1]),{'title':title,'url':url,'meta':'汽车资讯'})
 if not rows:raise ValueError(f'No auto articles for {key}')
 return [row for _,row in sorted(rows.values(),key=lambda x:x[0],reverse=True)[:12]]


def parse_arxiv(body):
 root=ET.fromstring(body)
 atom='{http://www.w3.org/2005/Atom}'
 candidates=[(e.findtext(atom+'title'),e.findtext(atom+'id'),e.findtext(atom+'published')) for e in root.findall(atom+'entry')]
 candidates.extend((e.findtext('title'),e.findtext('link'),e.findtext('pubDate')) for e in root.findall('./channel/item'))
 rows={}
 for title,link,date in candidates:
  match=re.fullmatch(r'https?://arxiv\.org/abs/(\d{4}\.\d{4,5})(?:v\d+)?',clean(link))
  if not match or not clean(title):continue
  try: published=(datetime.fromisoformat(date.replace('Z','+00:00')) if 'T' in date else parsedate_to_datetime(date)).date().isoformat()
  except (AttributeError,TypeError,ValueError):continue
  paper=match[1]
  rows.setdefault(paper,{'title':clean(title),'url':'https://arxiv.org/abs/'+paper,'meta':f'arXiv:{paper} · 发布 {published}'})
 return list(rows.values())[:12]

def parse_cisa_kev(body):
 rows={}
 for entry in json.loads(body)['vulnerabilities']:
  cve=entry.get('cveID',''); title=clean(entry.get('vulnerabilityName')); added=entry.get('dateAdded','')
  if not re.fullmatch(r'CVE-\d{4}-\d{4,}',cve) or not title or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',added):continue
  rows[cve]=(added,{'title':title,'url':'https://nvd.nist.gov/vuln/detail/'+cve,'meta':f'{cve} · 已知在野利用 · 收录 {added}'})
 return [row for _,row in sorted(rows.values(),key=lambda item:item[0],reverse=True)[:12]]

def parse_cncert(body):
 rows={}
 html=re.sub(r'<!--.*?-->','',body.decode('utf-8-sig'),flags=re.S)
 for date,attrs,title in re.findall(r'<li\b[^>]*>\s*<span>\[(\d{4}-\d{2}-\d{2})\]</span>\s*<a\b([^>]*)>(.*?)</a>',html,re.S|re.I):
  link=re.search(r'''["'](/publish/main/9/\d{4}/[\d_]+/[\d_]+\.html)["']''',attrs)
  title=clean(unescape(re.sub(r'<[^>]+>','',title)))
  if link and title:
   url=urljoin(SOURCES['cncert']['url'],link[1]);rows[url]=(date,{'title':title,'url':url,'meta':'发布 '+date})
 return [row for _,row in sorted(rows.values(),key=lambda item:item[0],reverse=True)[:12]]


CVE_RECORD_BASE='https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/'

def parse_github_advisories(body):
 rows={}
 for entry in json.loads(body):
  ghsa=entry.get('ghsa_id','')
  title=clean(entry.get('summary'))
  if not re.fullmatch(r'GHSA-[a-z0-9]{4}(?:-[a-z0-9]{4}){2}',ghsa) or not title or entry.get('withdrawn_at'):continue
  cve=entry.get('cve_id') or ''
  severity={'critical':'严重','high':'高危','medium':'中危','low':'低危'}.get(entry.get('severity'),'')
  ecosystems=list(dict.fromkeys(v.get('package',{}).get('ecosystem','') for v in (entry.get('vulnerabilities') or [])))
  meta=' · '.join(filter(None,[ghsa,cve,severity,', '.join(filter(None,ecosystems))]))
  rows[ghsa]={'title':title,'url':'https://github.com/advisories/'+ghsa,'meta':meta}
 return list(rows.values())[:8]

def cve_record_urls(body):
 # The official delta log is a newest-first JSON array. Decode only the
 # complete batches in the downloaded prefix; older history is unnecessary.
 text=body.decode('utf-8-sig',errors='ignore').lstrip()
 if not text.startswith('['):raise ValueError('Invalid CVE delta log')
 decoder=json.JSONDecoder();pos=1;seen=set();rows=[]
 while len(rows)<12:
  pos=re.match(r'\s*,?\s*',text[pos:]).end()+pos
  if pos>=len(text) or text[pos]==']':break
  try:batch,pos=decoder.raw_decode(text,pos)
  except json.JSONDecodeError:break
  for entry in sorted(batch.get('new',[])+batch.get('updated',[]),key=lambda item:item.get('dateUpdated',''),reverse=True):
   cve=entry.get('cveId','')
   match=re.fullmatch(r'CVE-(\d{4})-(\d{4,})',cve)
   if not match or cve in seen:continue
   year,number=match.groups()
   bucket=number[:-3]+'xxx'
   seen.add(cve);rows.append((cve,f'{CVE_RECORD_BASE}{year}/{bucket}/{cve}.json'))
   if len(rows)==12:break
 return rows

def parse_cve_record(cve,body):
 data=json.loads(body)
 meta=data['cveMetadata'];cna=data['containers']['cna']
 if meta.get('state')!='PUBLISHED' or meta.get('cveId')!=cve:return None
 title=clean(cna.get('title')) or clean(next((x.get('value') for x in cna.get('descriptions',[]) if x.get('lang','').lower().startswith('en')), ''))
 if not title:return None
 date=meta.get('dateUpdated','')[:10]
 return {'title':title[:240],'url':'https://www.cve.org/CVERecord?id='+cve,'meta':f'{cve} · 更新 {date}'}

def fetch_cve_records(body):
 def load(pair):
  try:return parse_cve_record(pair[0],request_body(pair[1]))
  except (OSError,ValueError,KeyError,TypeError):return None
 with ThreadPoolExecutor(max_workers=4) as pool:
  return [row for row in pool.map(load,cve_record_urls(body)) if row][:8]

def parse_source(key,body):
 if key in NEW_SOURCE_PARSERS:
  rows=NEW_SOURCE_PARSERS[key](body)
  if not rows:raise ValueError("No valid source entries")
  return rows
 if key in AUTO_NEWS:return parse_auto_news(key,body)
 if key in INTERNATIONAL_NEWS:return parse_international_news(key,body)
 if key=='maoyan':return parse_maoyan_board(body)
 if key=='douban_book':return parse_douban_books(body)
 if key=='douban':
  data=json.loads(body)
  if not isinstance(data,dict) or not isinstance(data.get('subjects'),list):raise ValueError('Invalid Douban movie response')
  rows=[];seen=set()
  for movie in data['subjects']:
   if not isinstance(movie,dict):continue
   id=str(movie.get('id',''));title=movie.get('title');url=movie.get('url','')
   if not id.isdigit() or not isinstance(title,str) or not clean(title) or not isinstance(url,str):continue
   if url!='https://movie.douban.com/subject/'+id+'/':continue
   if id in seen:continue
   seen.add(id)
   try:rating=float(movie.get('rate'))
   except (TypeError,ValueError):rating=0
   meta=f'豆瓣 {rating:.1f} 分' if 0<rating<=10 else '暂无评分'
   if movie.get('is_new') is True:meta+=' · 新上榜'
   row={'title':clean(title),'url':url,'meta':meta}
   cover=clean_cover('douban',movie.get('cover'))
   if cover:row['cover']=cover
   rows.append(row)
   if len(rows)==24:break
  if not rows:raise ValueError('No valid Douban movies')
  return rows

 if key=='seebug':
  text=body.decode('utf-8')
  # Only the latest-vulnerabilities table; never mix the PoC/popular lists.
  table=re.search(r'<td\b[^>]*class=["\'][^"\']*vul-title-wrapper[^"\']*["\']',text)
  if not table:raise ValueError('Missing Seebug latest vulnerability table')
  start=text.rfind('<table',0,table.start());end=text.find('</table>',table.end())
  if start<0 or end<0:raise ValueError('Incomplete Seebug latest vulnerability table')
  links=Links();links.feed(text[start:end]);items=[];seen=set()
  for href,title in links.links:
   url=urljoin(SOURCES[key]['url'],href)
   match=re.fullmatch(r'https://www\.seebug\.org/vuldb/ssvid-(\d+)/?',url)
   if not match or len(title)<3 or re.fullmatch(r'SSV-\d+',title) or url in seen:continue
   seen.add(url);items.append({'title':title,'url':url,'meta':'SSV-'+match.group(1)+' · 最新漏洞'})
  if not items:raise ValueError('No valid Seebug vulnerabilities')
  return items[:24]

 if key in SECURITY_RESEARCH_SOURCES:return parse_security_feed(key,body)
 if key in ['pojie52','pojie52_new','pojie52_tech','pojie52_digest']:return parse_pojie_home(key,body)
 rows=[]
 def add(title,url,meta='',cover=''):
  title=clean(title)
  if len(title)>2 and valid_url(url):
   row={'title':title,'url':url,'meta':clean(meta)};image=clean_cover(key,cover,SOURCES[key]['url'])
   if image:row['cover']=image
   rows.append(row)
 if key=='baidu':
  match=re.search(r'<!--s-data:(.*?)-->',body.decode('utf-8'),re.S)
  if not match:raise ValueError('Missing Baidu ranking data')
  cards=json.loads(match.group(1))['data']['cards']
  for card in cards:
   if card.get('component')!='hotList':continue
   for row in card.get('content',[]):
    if not isinstance(row,dict) or row.get('isTop'):continue
    title=clean(row.get('word'))
    if not title:continue
    heat=str(row.get('hotScore',''))
    add(title,'https://www.baidu.com/s?wd='+quote(title),'热度 '+heat if heat.isdigit() else '')
 elif key=='bilibili':
  data=json.loads(body)
  if not isinstance(data,dict) or type(data.get('code')) is not int or data['code']!=0:raise ValueError('Invalid Bilibili response')
  payload=data.get('data')
  videos=payload.get('list') if isinstance(payload,dict) else None
  if not isinstance(videos,list):raise ValueError('Invalid Bilibili video list')
  for row in videos:
   if not isinstance(row,dict):continue
   bvid=row.get('bvid');title=row.get('title')
   if not isinstance(bvid,str) or not re.fullmatch(r'BV[1-9A-HJ-NP-Za-km-z]{10}',bvid) or not isinstance(title,str):continue
   owner=row.get('owner') if isinstance(row.get('owner'),dict) else {}
   stat=row.get('stat') if isinstance(row.get('stat'),dict) else {}
   meta=[]
   if isinstance(owner.get('name'),str) and clean(owner['name']):meta.append('UP主 '+clean(owner['name']))
   for field,label in [('view','播放'),('like','点赞')]:
    value=stat.get(field)
    if type(value) is int and value>=0:meta.append(f'{value:,} {label}')
   add(title,'https://www.bilibili.com/video/'+bvid,' · '.join(meta))
 elif key in ['ijingyi_new','ijingyi_hot']:
  text=body.decode('utf-8')
  marker=text.find('lay-id="newthread"')
  if marker<0:raise ValueError('Missing Jingyi thread tabs')
  text=text[text.rfind('<li',0,marker):]
  tabs=re.findall(r'<li\b[^>]*lay-id=["\']([^"\']+)',text.split('<div class="layui-tab-content">',1)[0])
  target='newthread' if key=='ijingyi_new' else 'hot'
  if target not in tabs:raise ValueError('Missing Jingyi requested tab')
  panels=re.findall(r'<ul\b[^>]*class=["\']thread["\'][^>]*>(.*?)</ul>',text,flags=re.S|re.I)
  index=tabs.index(target)
  if index>=len(panels):raise ValueError('Missing Jingyi thread panel')
  parser=Links();parser.feed(panels[index])
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href)
   if re.fullmatch(r'https://bbs\.ijingyi\.com/thread-\d+-\d+-\d+\.html',url):add(title,url,SOURCES[key]['kind'])
 elif key=='tieba':
  data=json.loads(body)
  if not isinstance(data,dict) or data.get('errno')!=0:raise ValueError('Invalid Tieba response')
  topics=data.get('data',{}).get('bang_topic',{}).get('topic_list',[])
  if not isinstance(topics,list):raise ValueError('Invalid Tieba topic list')
  for row in topics:
   if not isinstance(row,dict) or row.get('is_ad'):continue
   id=row.get('topic_id');title=row.get('topic_name');heat=row.get('discuss_num')
   if isinstance(id,bool) or not str(id).isdigit() or int(id)<=0 or not isinstance(title,str):continue
   meta='热议话题'
   if isinstance(heat,int) and not isinstance(heat,bool) and heat>=0:meta+=f' · 热度 {heat:,}'
   add(title,'https://tieba.baidu.com/hottopic/browse/hottopic?topic_id='+str(int(id)),meta)
 elif key=='thehackernews':
  root=ET.fromstring(body)
  for item in root.findall('.//item'):
   url=clean(item.findtext('link'))
   if not re.fullmatch(r'https://thehackernews\.com/\d{4}/\d{2}/[a-zA-Z0-9_%-]+\.html',url):continue
   add(item.findtext('title'),url,item.findtext('pubDate') or '')
 elif key in ['sspai' ,'hellogithub','geekpark','qbitai','woshipm','oschina','freebuf']:
  root=ET.fromstring(body)
  for item in root.findall('.//item'):add(item.findtext('title'),item.findtext('link') or '',item.findtext('pubDate') or '')
 elif key=='juejin':
  data=json.loads(body)
  if data.get('err_no')!=0:raise ValueError('Juejin response error')
  for row in data.get('data',[]):
   content=row.get('content',{});counter=row.get('content_counter',{});id=str(content.get('content_id',''))
   if id.isdigit():add(content.get('title'),'https://juejin.cn/post/'+id,f"{counter.get('view',0)} 阅读 · {counter.get('like',0)} 赞")
 elif key=='toutiao':
  for row in json.loads(body).get('data',[]):add(row.get('Title'),str(row.get('Url','')).replace('\\u0026','&'),f"热度 {row.get('HotValue','—')}",(row.get('Image') or {}).get('url',''))
 elif key=='qq':
  for group in json.loads(body).get('idlist',[]):
   for row in group.get('newslist',[]):add(row.get('title'),row.get('url') or '',row.get('time') or '',next(iter(row.get('bigImage') or row.get('tmp3pic') or []),''))
 elif key=='netease':
  text=body.decode('utf-8-sig');data=json.loads(text[text.index('{'):text.rfind('}')+1])
  def walk(value):
   if isinstance(value,list):
    for item in value:walk(item)
   elif isinstance(value,dict):add(value.get('t'),value.get('l') or '',value.get('p') or '')
  walk(data.get('news',[]))
 elif key=='anquanke':
  for row in json.loads(body).get('data',[]):
   id=str(row.get('id',''))
   if id.isdigit():add(row.get('title'),'https://www.anquanke.com/post/id/'+id,row.get('date') or '',row.get('cover',''))
 elif key in ['csdn','zcool','xz']:
  parser=Links();parser.feed(body.decode('utf-8'))
  patterns={
   'csdn':r'https://blog\.csdn\.net/[A-Za-z0-9_-]+/article/details/\d+',
   'zcool':r'https://www\.zcool\.com\.cn/work/[A-Za-z0-9=_%+-]+\.html',
   'xz':r'https://xz\.aliyun\.com/(?:news|t)/\d+/?'
  }
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href).split('?')[0].split('#')[0]
   if key=='csdn' and any(t in title for t in ['版权申诉','账号管理规范']):continue
   if key=='csdn' and '/blogdevteam/article/details/126135357' in url:continue
   if re.fullmatch(patterns[key],url) and len(title)>3:add(title,url)
 elif key in ['yicai','sinafinance']:
  try:text=body.decode('utf-8')
  except UnicodeDecodeError:text=body.decode('gb18030')
  parser=Links();parser.feed(text)
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href)
   pattern=r'https://www\.yicai\.com/news/\d+\.html' if key=='yicai' else r'https://finance\.sina\.com\.cn/[a-zA-Z0-9/_-]+/doc-[a-zA-Z0-9]+\.shtml'
   if re.fullmatch(pattern,url) and len(title)>6:add(title,url)
 elif key in ['pojie52','pojie52_new','pojie52_tech','pojie52_digest','kanxue']:
  text=body.decode('gb18030' if key.startswith('pojie52') else 'utf-8')
  if key.startswith('pojie52'):
   blocks=re.findall(r'<tbody\b[^>]*id=["\']normalthread_\d+["\'][^>]*>(.*?)</tbody>',text,flags=re.S|re.I)
   text='\n'.join(blocks)
  parser=Links();parser.feed(text)
  for href,title in parser.links:
   url=urljoin(SOURCES[key]['url'],href)
   pattern=r'https://www\.52pojie\.cn/thread-\d+-\d+-\d+\.html' if key.startswith('pojie52') else r'https://bbs\.kanxue\.com/thread-\d+\.htm'
   if re.fullmatch(pattern,url) and len(title)>4:add(title,url)
 elif key=='ruanyifeng':
  parser=Links();parser.feed(body.decode('utf-8'))
  weekly=[]
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   match=re.fullmatch(r'https?://www\.ruanyifeng\.com/blog/\d{4}/\d{2}/weekly-issue-(\d+)\.html',url)
   if match and '科技爱好者周刊' in title:weekly.append((int(match.group(1)),title,url))
  for issue,title,url in sorted(weekly,reverse=True):add(title,url,f'第 {issue} 期')
 elif key=='uisdc':
  text=body.decode('utf-8');marker=text.find('id="home_list_normal"')
  if marker>=0:text=text[marker:]
  parser=Links();parser.feed(text)
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   if re.fullmatch(r'https://www\.uisdc\.com/[a-zA-Z0-9-]{4,}',url) and url.rsplit('/',1)[-1] not in ['about','group','news','archives','contact','privacy','sitemap'] and len(title)>=10:add(title,url)
 elif key=='gamersky':
  try:text=body.decode('utf-8')
  except UnicodeDecodeError:text=body.decode('gb18030')
  parser=Links();parser.feed(text)
  for url,title in parser.links:
   url=urljoin(SOURCES[key]['url'],url)
   if re.fullmatch(r'https?://(?:www\.)?gamersky\.com/news/\d{6}/\d+\.shtml',url):add(title,url)
 seen=set();unique=[]
 for row in rows:
  if row['url'] not in seen:seen.add(row['url']);unique.append(row)
 if not unique:raise ValueError('No valid source entries')
 return unique[:24]

FREEBUF_SELECTOR = 'a[href*="/articles/"][href*=".html"], a[href*="/news/"][href*=".html"]'
FREEBUF_FEED = 'https://www.freebuf.com/rss'
WEEKLY_BACKUP = 'https://raw.githubusercontent.com/ruanyf/weekly/master/README.md'

def request_body(url):
 req=urllib.request.Request(url,headers={**({'Referer':'https://www.bilibili.com/'} if urlparse(url).hostname=='api.bilibili.com' else {'Referer':'https://movie.douban.com/'} if urlparse(url).hostname=='movie.douban.com' else {}),'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36','Accept':'application/atom+xml,application/rss+xml,application/json,text/html;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.8'})
 with urllib.request.urlopen(req,timeout=25) as r:body=r.read(512_000 if url==CVE_RECORD_BASE+'deltaLog.json' else 12_000_000 if urlparse(url).hostname in ['www.elastic.co','elastic.co'] else 4_000_000)
 if b'aliyun_waf_aa' in body[:2000]:raise ValueError('Source returned an access verification page')
 return body

def parse_freebuf_feed(body):
 root=ET.fromstring(body);rows=[]
 atom={'a':'http://www.w3.org/2005/Atom'}
 for item in root.findall('.//item'):
  rows.append({'title':item.findtext('title'),'url':item.findtext('link'),'meta':item.findtext('pubDate')})
 for item in root.findall('a:entry',atom):
  link=next((a.get('href') for a in item.findall('a:link',atom) if a.get('rel','alternate')=='alternate'),'')
  rows.append({'title':item.findtext('a:title',namespaces=atom),'url':link,'meta':item.findtext('a:updated',namespaces=atom)})
 return normalize_freebuf_rows(rows)

def parse_weekly_backup(body):
 text=body.decode('utf-8');rows=[]
 for issue,title,path in re.findall(r'-\s*第\s*(\d+)\s*期[：:]\s*\[([^\n]+?)\]\((docs/issue-\d+\.md)\)',text):
  if path!=f'docs/issue-{issue}.md':continue
  rows.append((int(issue),{'title':f'科技爱好者周刊（第 {issue} 期）：{title}','url':'https://github.com/ruanyf/weekly/blob/master/'+path,'meta':f'第 {issue} 期 · 作者官方仓库'}))
 if not rows:raise ValueError('No weekly issues in official repository')
 return [row for _,row in sorted(rows,key=lambda pair:pair[0],reverse=True)[:24]]


def normalize_freebuf_rows(rows):
 items=[];seen=set()
 for row in rows:
  title=clean(row.get('title'));url=urljoin(SOURCES['freebuf']['url'],row.get('url') or '')
  if not re.fullmatch(r'https://www\.freebuf\.com/(?:news|articles)(?:/[A-Za-z0-9_-]+)*/\d+\.html',url):continue
  if len(title)<3 or url in seen:continue
  seen.add(url);item={'title':title,'url':url,'meta':clean(row.get('meta'))};cover=clean_cover('freebuf',row.get('cover'),SOURCES['freebuf']['url'])
  if cover:item['cover']=cover
  items.append(item)
 if not items:raise ValueError('No valid FreeBuf article entries')
 return items[:24]

def fetch_freebuf_items():
 from playwright.sync_api import sync_playwright
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=os.environ.get('FREEBUF_HEADLESS') == '1',channel=os.environ.get('FREEBUF_BROWSER_CHANNEL') or None)
  try:
   page=browser.new_page(locale='zh-CN',viewport={'width':1440,'height':1000})
   page.goto(SOURCES['freebuf']['endpoint'],wait_until='domcontentloaded',timeout=60000)
   if '验证' in page.title():raise RuntimeError('FreeBuf returned a verification page')
   page.locator(FREEBUF_SELECTOR).first.wait_for(state='visible',timeout=15000)
   rows=page.locator(FREEBUF_SELECTOR).evaluate_all("""links => links.map(a => ({
    title: a.textContent,
    url: a.href,
    cover: a.closest('.article-item')?.querySelector('.img-view img')?.getAttribute('data-src') || a.closest('.article-item')?.querySelector('.img-view img')?.src || '',
    meta: a.closest('.article-item')?.querySelector('.bottom-right')?.innerText || ''
   }))""")
   return normalize_freebuf_rows(rows)
  finally:browser.close()

def translate_title(title):
 url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='+quote(title)
 data=json.loads(request_body(url))
 translated=clean(''.join(segment[0] for segment in data[0] if isinstance(segment,list) and segment and isinstance(segment[0],str)))
 if not translated or not re.search(r'[\u4e00-\u9fff]',translated):raise ValueError('Translation did not return Chinese')
 return translated

def translate_security_titles(items,previous=None):
 cached={row.get('originalTitle'):row for row in (previous or {}).get('items',[]) if row.get('translationStatus')=='translated' and row.get('title')}
 def translate(row):
  original=row['title'];result={**row,'originalTitle':original,'translationStatus':'original'}
  try:
   result['title']=cached[original]['title'] if original in cached else translate_title(original)
   result['translationStatus']='translated'
   if original in cached and cached[original].get('translationMethod')=='editor':result['translationMethod']='editor'
  except Exception as error:
   print(f'TRANSLATION_PENDING {type(error).__name__}')
  result['meta']=(('中文译名' if result.get('translationMethod')=='editor' else '机器翻译') if result['translationStatus']=='translated' else '英文原题 · 翻译待更新')+(' · '+row['meta'] if row.get('meta') else '')
  return result
 with ThreadPoolExecutor(max_workers=4) as pool:return list(pool.map(translate,items))

NEW_SOURCE_PARSERS={'github_advisory':parse_github_advisories,'cve_program':fetch_cve_records,'arxiv':parse_arxiv,'cisa_kev':parse_cisa_kev,'cncert':parse_cncert}
NEW_SOURCE_BACKUPS={
 'arxiv':'https://rss.arxiv.org/rss/cs.AI',
 'cisa_kev':'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json',
}

def fetch(key):
 if key=='maoyan':
  config=SOURCES[key]
  items=cache_source_covers(key,add_maoyan_metrics(fetch_maoyan_board()))
  return {**{k:v for k,v in config.items() if k!='endpoint'},'sourceUrlUsed':config['endpoint'],'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items}
 source=SOURCES[key]
 if key=='freebuf':
  try:items=parse_freebuf_feed(request_body(FREEBUF_FEED));used=FREEBUF_FEED
  except Exception as error:
   print(f'FREEBUF_FEED_FALLBACK {type(error).__name__}: {error}')
   items=fetch_freebuf_items();used=source['endpoint']
  return {**{k:v for k,v in source.items() if k!='endpoint'},'sourceUrlUsed':used,'updatedAt':datetime.now(timezone.utc).isoformat(),'items':cache_source_covers(key,items)}
 try:
  body=request_body(source['endpoint']);items=parse_source(key,body);used=source['endpoint']
 except Exception:
  if key in NEW_SOURCE_BACKUPS:
   used=NEW_SOURCE_BACKUPS[key];items=parse_source(key,request_body(used))
  elif key=='ruanyifeng':
   body=request_body(WEEKLY_BACKUP);items=parse_weekly_backup(body);used=WEEKLY_BACKUP
  else:raise
 if key in ('thehackernews','arxiv','cisa_kev','github_advisory','cve_program') or key in SECURITY_RESEARCH_SOURCES or key in INTERNATIONAL_NEWS:
  previous={}
  try:previous=json.loads((public_directory()/'extra-hotspots.json').read_text(encoding='utf-8-sig')).get('sources',{}).get(key,{})
  except (OSError,ValueError):pass
  return {**{k:v for k,v in source.items() if k!='endpoint'},'sourceUrlUsed':used,'updatedAt':datetime.now(timezone.utc).isoformat(),'items':translate_security_titles(items,previous)}
 if key in ('douban','douban_book'):return {**{k:v for k,v in source.items() if k!='endpoint'},'sourceUrlUsed':used,'updatedAt':datetime.now(timezone.utc).isoformat(),'items':cache_douban_posters(items,key)}
 if key in NEW_SOURCE_PARSERS or key in AUTO_NEWS or key in ['seebug','baidu','bilibili','ijingyi_new','ijingyi_hot','pojie52','pojie52_new','pojie52_tech','pojie52_digest']:return {**{k:v for k,v in source.items() if k!='endpoint'},'sourceUrlUsed':used,'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items}
 items=cache_source_covers(key,attach_covers(key,items,body,source['url']))
 return {**{k:v for k,v in source.items() if k!='endpoint'},'sourceUrlUsed':used,'updatedAt':datetime.now(timezone.utc).isoformat(),'items':items}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/extra-hotspots.json');parser.add_argument('--source',action='append',choices=SOURCES);args=parser.parse_args();out=Path(args.output);previous={}
 if out.exists():
  try:previous=json.loads(out.read_text(encoding='utf-8-sig')).get('sources',{})
  except (OSError,ValueError):pass
 def load(key):
  attempted=datetime.now(timezone.utc).isoformat()
  try:
   data=fetch(key);data['collection']={'status':'ok','lastAttemptAt':attempted,'lastSuccessAt':data['updatedAt'],'error':''}
   print(f'SOURCE_OK {key} items={len(data["items"])}');return key,data
  except Exception as error:
   print(f'SOURCE_PRESERVED {key}: {error}')
   old=previous.get(key)
   health={'status':'stale' if old and old.get('items') else 'unavailable','lastAttemptAt':attempted,'lastSuccessAt':old.get('updatedAt') if old else None,'error':str(error)[:500]}
   if old and old.get('items'):
    return key,{**old,'collection':health}
   config=SOURCES[key]
   return key,{**{k:v for k,v in config.items() if k!='endpoint'},'updatedAt':None,'items':[],'unavailable':True,'collection':health}
 with ThreadPoolExecutor(max_workers=7) as pool:
  updates=dict(pool.map(load,dict.fromkeys(args.source or SOURCES)))
 sources={**previous,**updates} if args.source else updates
 if not sources:raise SystemExit('No current or cached sources available')
 out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps({'sources':sources},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out)
 if out.resolve()==(Path(__file__).resolve().parents[1]/'public'/'extra-hotspots.json').resolve():prune_covers(sources)
 print(f'EXTRA_SOURCES_OK count={len(sources)}')
if __name__=='__main__':main()
