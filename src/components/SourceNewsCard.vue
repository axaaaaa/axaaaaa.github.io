<template>
<section class="source-news-card" :class="{'source-news-dark':dark,'source-image-card':imageEnabled,'douban-movie-card':['douban','maoyan'].includes(sourceId),'source-newspaper':!dark && sourceId==='reuters'}" :aria-labelledby="`source-title-${sourceId}`">
 <header class="source-heading"><div><h2 :id="`source-title-${sourceId}`"><img v-if="sourceIcon && !iconFailed" :src="sourceIcon" :class="{ 'cncert-wordmark': sourceId === 'cncert' }" alt="" width="24" height="24" referrerpolicy="no-referrer" @error="iconFailed=true" />{{config.name}}</h2><p>{{config.kind}}</p></div></header>
 <nav v-if="tabs.length" class="source-tabs" :aria-label="`${config.name}内容分类`"><button v-for="tab in tabs" :key="tab.id" type="button" :aria-pressed="activeTab===tab.id" @click="selectTab(tab.id)"><img v-if="tabIcon(tab.id)" class="source-tab-brand-icon" :src="tabIcon(tab.id)" alt="" width="16" height="16" />{{tab.label}}</button></nav>
 <div class="source-toolbar"><span role="status">{{status}}</span><a :href="config.url" target="_blank" rel="noopener noreferrer">访问原站 ↗</a></div>
 <ol v-if="visible.length" class="source-list"><li v-for="(item,index) in visible" :key="item.url"><a :href="item.url" target="_blank" rel="noopener noreferrer"><div v-if="imageEnabled&&item.cover&&!failedCovers[item.url]" class="source-cover"><img :src="coverSrc(item.cover)" alt="" loading="lazy" referrerpolicy="no-referrer" @error="failedCovers[item.url]=true" /></div><div class="source-entry"><span class="source-rank" :class="{top:index<3,'model-rank':sourceId==='aa_models'}"><img v-if="sourceId==='aa_models' && sourceIcon && !iconFailed" :src="sourceIcon" :class="['model-trophy-gold','model-trophy-yellow','model-trophy-copper'][index] || 'model-trophy-neutral'" alt="" width="16" height="16" />{{index+1}}</span><div class="source-copy"><h3 :title="item.originalTitle || item.title">{{item.title}}</h3><p v-if="item.meta" :title="item.meta"><template v-if="sourceId==='aa_models'"><strong class="model-index">{{item.meta.split(' · ')[0]}}</strong>{{item.meta.slice(item.meta.split(' · ')[0].length)}}</template><template v-else>{{item.meta}}</template></p><div v-if="sourceId==='maoyan'" class="maoyan-metrics"><span>累计票房：{{item.boxOffice || "暂无数据"}}</span><span>猫眼评分：{{item.rating ? item.rating + " 分" : "暂无评分"}}</span></div></div></div></a></li></ol>
 <div v-else class="source-empty">{{loading?'正在加载…':'此来源当前未获取到内容，可通过上方入口访问原站。'}}<button v-if="!loading" type="button" @click="load(true)">重试</button></div>
 <footer><span>{{config.kind}} · 每小时获取</span><button v-if="items.length>(sourceId==='pojie52'?10:6)" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{showAll?'精简列表 ↑':'查看更多 ↓'}}</button></footer>
</section>
</template>
<script>
import { officialSourceIcon } from "../utils/source-icons.mjs";
import {SHOW_SOURCE_IMAGES} from '../utils/source-display.mjs';
import {resolveCover} from '../utils/source-covers.mjs';
import {loadExtraHotspots,cachedExtraHotspots} from '../utils/extra-hotspots.mjs';
const configs={
aa_models:{"name":"模型能力排行榜","kind":"Artificial Analysis · 按智能指数排名","url":"https://artificialanalysis.ai/leaderboards/models"},
ai_api_updates:{"name":"API 更新","kind":"厂商官方变更日志","url":"https://docs.mistral.ai/resources/changelogs"},
hf_trending:{name:"Hugging Face Trending",kind:"首页趋势 · 最近 7 天",url:"https://huggingface.co/"},
cn_ai:{"name":"国内大模型","kind":"DeepSeek · 字节 Seed · Kimi · 腾讯混元 · 阿里通义","url":"https://api-docs.deepseek.com/zh-cn/updates"},
ai_official:{"name":"AI 官方发布","kind":"OpenAI · Anthropic · Google DeepMind","url":"https://openai.com/news/"},
unknowncheats:{"name":"UC 论坛 · UnknownCheats","kind":"论坛最新帖 · 中文机译","url":"https://www.unknowncheats.me/forum/index.php"},
vendor_security:{"name":"厂商安全更新","kind":"微软 · Chrome · Ubuntu","url":"https://msrc.microsoft.com/update-guide/"},
projectzero:{"name": "Google Project Zero", "kind": "漏洞研究 · 中文机译", "url": "https://projectzero.google/", "icon": "https://projectzero.google/images/project-zero.svg"},
unit42:{"name": "Palo Alto Unit 42", "kind": "威胁研究与事件响应 · 中文机译", "url": "https://unit42.paloaltonetworks.com/", "icon": "https://unit42.paloaltonetworks.com/wp-content/uploads/2024/06/icon-Unit42-180x180-1.png"},
github_advisory:{"name": "GitHub Advisory Database", "kind": "GitHub 审核的开源漏洞", "url": "https://github.com/advisories", "icon": "https://github.githubassets.com/favicons/favicon.svg"},
cve_program:{"name": "CVE Program", "kind": "官方 CVE 记录", "url": "https://www.cve.org/", "icon": "https://www.cve.org/cvePurpleVFavicon.svg"},
crowdstrike:{"name": "CrowdStrike Blog", "kind": "威胁研究与安全资讯", "url": "https://www.crowdstrike.com/en-us/blog/", "icon": "https://www.crowdstrike.com/etc.clientlibs/crowdstrike/clientlibs/crowdstrike-common/resources/favicon.ico"},
arxiv:{"name": "arXiv 人工智能论文", "kind": "AI 预印本 · 中文机译", "url": "https://arxiv.org/list/cs.AI/recent", "icon": "https://arxiv.org/favicon.ico"},
cisa_kev:{"name": "CISA KEV", "kind": "已知在野利用漏洞 · 中文机译", "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "icon": "https://www.cisa.gov/favicon.ico"},
cncert:{"name": "国家互联网应急中心", "kind": "中文漏洞公告", "url": "https://www.cert.org.cn/publish/main/9/index.html", "icon": "https://www.cert.org.cn/favicon.ico"},
dongchedi:{"name": "懂车帝", "kind": "汽车资讯", "url": "https://www.dongchedi.com/", "icon": "https://www.dongchedi.com/favicon.ico"},
autohome:{"name": "汽车之家", "kind": "汽车资讯", "url": "https://www.autohome.com.cn/news/", "icon": "https://www.autohome.com.cn/favicon.ico"},
pcauto:{"name": "太平洋汽车", "kind": "汽车资讯", "url": "https://www.pcauto.com.cn/news/", "icon": "https://www.pcauto.com.cn/favicon.ico"},

reuters:{"name": "路透社", "kind": "国际新闻 · Google 新闻索引 · 中文机译", "url": "https://www.reuters.com/world/", "icon": "https://reutersagency.com/hubfs/Favicon-1.png"},
ap:{"name": "美联社 AP", "kind": "国际新闻 · Google 新闻索引 · 中文机译", "url": "https://apnews.com/world-news", "icon": "https://apnews.com/favicon.ico"},
bbc:{"name": "BBC 国际新闻", "kind": "国际新闻 · 中文机译", "url": "https://www.bbc.com/news/world", "icon": "https://www.bbc.com/favicon.ico"},
aljazeera:{"name": "半岛电视台英文版", "kind": "国际新闻 · 中文机译", "url": "https://www.aljazeera.com/", "icon": "https://www.aljazeera.com/favicon_aje.ico"},
guardian:{"name": "卫报国际版", "kind": "国际新闻 · 中文机译", "url": "https://www.theguardian.com/world", "icon": "https://www.theguardian.com/favicon.ico"},
nhk:{"name": "NHK WORLD-JAPAN", "kind": "国际新闻 · Google 新闻索引 · 中文机译", "url": "https://www3.nhk.or.jp/nhkworld/news/", "icon": "https://www3.nhk.or.jp/nhkworld/common/site_images/nw_webapp_news_192x192.png"},

globaltimes:{name:'环球时报（英文版）',kind:'国际资讯 · 中文机译',url:'https://www.globaltimes.cn/',icon:'https://www.globaltimes.cn/favicon.ico'},
nytimes:{name:'纽约时报',kind:'国际新闻 · 中文机译',url:'https://www.nytimes.com/section/world',icon:'https://www.nytimes.com/favicon.ico'},
wsj:{name:'华尔街日报',kind:'国际新闻 · 中文机译',url:'https://www.wsj.com/world',icon:'https://www.wsj.com/favicon.ico'},
maoyan:{name:'猫眼',kind:'国内票房榜',url:'https://www.maoyan.com/board/1',icon:'https://www.maoyan.com/favicon.ico'},
douban_book:{name:'豆瓣读书',kind:'新书速递',url:'https://book.douban.com/latest',icon:'https://img3.doubanio.com/favicon.ico'},
douban:{'name': '豆瓣电影', 'kind': '热门电影 · 豆瓣评分', 'url': 'https://movie.douban.com/explore', 'icon': 'https://movie.douban.com/favicon.ico'},
microsoft:{"name": "微软安全博客", "kind": "安全研究与资讯 · 中文机译", "url": "https://www.microsoft.com/en-us/security/blog/", "icon": "https://www.microsoft.com/favicon.ico"},
seebug:{"name": "Seebug 漏洞库", "kind": "最新漏洞情报", "url": "https://www.seebug.org/", "icon": "https://www.seebug.org/favicon.ico"},

securelist:{"name": "Securelist · 卡巴斯基", "kind": "威胁研究 · 中文机译", "url": "https://securelist.com/", "icon": "https://securelist.com/favicon.ico"},
checkpoint:{"name": "Check Point Research", "kind": "安全研究 · 中文机译", "url": "https://research.checkpoint.com/", "icon": "https://research.checkpoint.com/favicon.ico"},
sentinellabs:{"name": "SentinelLABS", "kind": "威胁情报 · 中文机译", "url": "https://www.sentinelone.com/labs/", "icon": "https://www.sentinelone.com/favicon.ico"},
elastic:{"name": "Elastic Security Labs", "kind": "检测与研究 · 中文机译", "url": "https://www.elastic.co/security-labs", "icon": "https://www.elastic.co/favicon.ico"},
eset:{"name": "ESET · WeLiveSecurity", "kind": "威胁研究与资讯 · 中文机译", "url": "https://www.welivesecurity.com/en/", "icon": "https://www.welivesecurity.com/favicon.ico"},

thehackernews:{name:'The Hacker News',kind:'国际安全资讯 · 中文机译',url:'https://thehackernews.com/',icon:'https://thehackernews.com/favicon.ico'},
baidu:{name:'百度热搜',kind:'实时热搜榜',url:'https://top.baidu.com/board?tab=realtime',icon:'https://www.baidu.com/favicon.ico'},
ijingyi_new:{name:'精易论坛',kind:'最新帖 / 本周热帖',url:'https://bbs.ijingyi.com/',icon:'https://bbs.ijingyi.com/favicon.ico'},
ijingyi_hot:{name:'精易论坛 · 本周热帖',kind:'本周热帖',url:'https://bbs.ijingyi.com/',icon:'https://bbs.ijingyi.com/favicon.ico'},
bilibili:{name:'哔哩哔哩（B站）',kind:'热门视频 · 非播放量排行',url:'https://www.bilibili.com/v/popular/all',icon:'https://www.bilibili.com/favicon.ico'},
tieba:{name:'百度贴吧',kind:'热议话题榜',url:'https://tieba.baidu.com/',icon:'https://tieba.baidu.com/favicon.ico'},
woshipm:{name:'人人都是产品经理',kind:'产品与运营文章 · 非热度排行',url:'https://www.woshipm.com/',icon:'https://www.woshipm.com/favicon.ico'},
csdn:{name:'CSDN 博客',kind:'最新技术文章 · 非热度排行',url:'https://blog.csdn.net/',icon:'https://blog.csdn.net/favicon.ico'},
oschina:{name:'开源中国',kind:'开源资讯 · 非热度排行',url:'https://www.oschina.net/',icon:'https://www.oschina.net/favicon.ico'},
zcool:{name:'站酷',kind:'设计作品发现',url:'https://www.zcool.com.cn/discover',icon:'https://www.zcool.com.cn/favicon.ico'},
xz:{name:'先知社区',kind:'安全技术文章 · 非热度排行',url:'https://xz.aliyun.com/',icon:'https://xz.aliyun.com/favicon.ico'},
anquanke:{name:'安全客',kind:'安全资讯与研究 · 非热度排行',url:'https://www.anquanke.com/',icon:'https://www.anquanke.com/favicon.ico'},
freebuf:{name:'FreeBuf',kind:'安全资讯',url:'https://www.freebuf.com/',icon:'https://www.freebuf.com/favicon.ico'},
yicai:{name:'第一财经',kind:'财经资讯 · 非热度排行',url:'https://www.yicai.com/',icon:'https://www.yicai.com/favicon.ico'},
sinafinance:{name:'新浪财经',kind:'财经资讯 · 非热度排行',url:'https://finance.sina.com.cn/',icon:'https://finance.sina.com.cn/favicon.ico'},
pojie52:{name:'吾爱破解',kind:'新鲜出炉 / 技术分享 / 人气热门 / 精华采撷',url:'https://www.52pojie.cn/',icon:'https://www.52pojie.cn/favicon.ico'},
kanxue:{name:'看雪论坛热门',kind:'论坛热门榜',url:'https://bbs.kanxue.com/thread-hotlist-all-3.htm',icon:'https://bbs.kanxue.com/favicon.ico'},
ruanyifeng:{name:'科技爱好者周刊',kind:'阮一峰 · 最新期刊',url:'https://www.ruanyifeng.com/blog/weekly/index.html',icon:'https://www.ruanyifeng.com/favicon.ico'},
uisdc:{name:'优设网',kind:'设计资讯 · 非热度排行',url:'https://www.uisdc.com/',icon:'https://www.uisdc.com/favicon.ico'},
geekpark:{name:'极客公园',kind:'科技资讯 · 非热度排行',url:'https://www.geekpark.net/',icon:'https://www.geekpark.net/favicon.ico'},
qbitai:{name:'量子位',kind:'AI 资讯 · 非热度排行',url:'https://www.qbitai.com/',icon:'https://www.qbitai.com/favicon.ico'},
sspai:{name:'少数派',kind:'最新文章 · 非热度排行',url:'https://sspai.com/',icon:'https://sspai.com/favicon.ico'},
juejin:{name:'稀土掘金',kind:'文章热榜',url:'https://juejin.cn/',icon:'https://juejin.cn/favicon.ico'},
toutiao:{name:'今日头条热榜',kind:'热门话题',url:'https://www.toutiao.com/',icon:'https://www.toutiao.com/favicon.ico'},
qq:{name:'腾讯新闻',kind:'热点榜',url:'https://news.qq.com/',icon:'https://news.qq.com/favicon.ico'},
netease:{name:'网易新闻',kind:'最新资讯 · 非热度排行',url:'https://news.163.com/',icon:'https://www.163.com/favicon.ico'},
hellogithub:{name:'HelloGitHub',kind:'开源月刊 · 非热度排行',url:'https://hellogithub.com/',icon:'https://hellogithub.com/favicon.ico'},
gamersky:{name:'游民星空',kind:'游戏资讯 · 非热度排行',url:'https://www.gamersky.com/news/',icon:'https://www.gamersky.com/favicon.ico'},
fng:{name:'恐惧贪婪指数',kind:'加密市场情绪 · Alternative.me',url:'https://alternative.me/crypto/fear-and-greed-index/',icon:'https://alternative.me/favicon.ico'},
eastmoney:{name:'东方财富 · A股涨幅榜',kind:'A 股涨幅榜 · 实时快照',url:'https://quote.eastmoney.com/center/gridlist.html',icon:'https://www.eastmoney.com/favicon.ico'}
};
export default {name:'SourceNewsCard',props:{sourceId:{type:String,required:true,validator:v=>v in configs},dark:Boolean},data(){return {activeTab:this.sourceId==='ai_api_updates'?'mistral_api':this.sourceId==='hf_trending'?'model':this.sourceId==='cn_ai'?'deepseek_news':this.sourceId==='ai_official'?'openai_news':this.sourceId==='vendor_security'?'msrc':this.sourceId==='pojie52'?'pojie52_new':this.sourceId,sourceData:null,items:[],updatedAt:'',collection:null,error:false,loading:false,showAll:false,iconFailed:false,failedCovers:{}}},computed:{sourceIcon(){return officialSourceIcon(this.sourceId);},tabs(){if(this.sourceId==='ai_api_updates')return [{id:'mistral_api',label:'Mistral'},{id:'minimax_api',label:'MiniMax'}];if(this.sourceId==='hf_trending')return [{id:'model',label:'热门模型'},{id:'space',label:'热门 Spaces'},{id:'dataset',label:'热门数据集'}];if(this.sourceId==='cn_ai')return [{"id":"deepseek_news","label":"DeepSeek"},{"id":"bytedance_news","label":"字节跳动 Seed"},{"id":"kimi_news","label":"Kimi · 月之暗面"},{"id":"tencent_ai_news","label":"腾讯混元"},{"id":"qwen_news","label":"阿里通义千问"},{"id":"glm_news","label":"智谱 GLM"},{"id":"minimax_news","label":"MiniMax"}];if(this.sourceId==='ai_official')return [{"id":"openai_news","label":"OpenAI"},{"id":"anthropic_news","label":"Anthropic"},{"id":"deepmind_news","label":"DeepMind"},{"id":"mistral_news","label":"Mistral"},{"id":"meta_ai_news","label":"Meta AI"}];if(this.sourceId==='vendor_security')return [{"id":"msrc","label":"微软 MSRC"},{"id":"chrome_security","label":"Chrome"},{"id":"ubuntu_security","label":"Ubuntu"}];if(this.sourceId==='douban')return [{id:'douban',label:'电影'},{id:'douban_book',label:'读书'}];if(this.sourceId==='ijingyi_new')return [{id:'ijingyi_new',label:'最新帖'},{id:'ijingyi_hot',label:'本周热帖'}];if(this.sourceId==='pojie52')return [{id:'pojie52_new',label:'新鲜出炉'},{id:'pojie52_tech',label:'技术分享'},{id:'pojie52',label:'人气热门'},{id:'pojie52_digest',label:'精华采撷'}];return [];},imageEnabled(){return ((this.sourceId==='douban'||SHOW_SOURCE_IMAGES)||this.sourceId==='maoyan')&&this.items.some(item=>item.cover);},sourceKey(){if(this.sourceId==='hf_trending')return this.sourceId;return this.tabs.length?this.activeTab:this.sourceId;},config(){if(this.sourceId==='ai_api_updates')return {...configs.ai_api_updates,url:this.activeTab==='minimax_api'?'https://platform.minimax.io/docs/release-notes/apis':configs.ai_api_updates.url};if(this.sourceId==='cn_ai')return {...configs.cn_ai,url:{"deepseek_news":"https://api-docs.deepseek.com/zh-cn/updates","bytedance_news":"https://seed.bytedance.com/zh/","kimi_news":"https://www.kimi.com/blog/","tencent_ai_news":"https://hunyuan.tencent.com/research","qwen_news":"https://qwenlm.github.io/zh/blog/","glm_news":"https://docs.bigmodel.cn/cn/update/new-releases","minimax_news":"https://platform.minimax.io/docs/release-notes/models"}[this.sourceKey]||configs.cn_ai.url};if(this.sourceId==='ai_official')return {...configs.ai_official,url:{"openai_news":"https://openai.com/news/","anthropic_news":"https://www.anthropic.com/news","deepmind_news":"https://deepmind.google/blog/","mistral_news":"https://mistral.ai/news/","meta_ai_news":"https://ai.meta.com/blog/"}[this.sourceKey]||configs.ai_official.url};if(this.sourceId==='vendor_security')return {...configs.vendor_security,url:{"msrc":"https://msrc.microsoft.com/update-guide/","chrome_security":"https://chromereleases.googleblog.com/","ubuntu_security":"https://ubuntu.com/security/notices"}[this.sourceKey]||configs.vendor_security.url};return this.sourceId==='douban'?{...configs[this.sourceKey],name:'豆瓣',icon:'https://img3.doubanio.com/favicon.ico'}:configs[this.sourceId];},visible(){return this.items.slice(0,this.showAll?(this.sourceId==='hf_trending'?30:24):this.sourceId==='pojie52'?10:6);},status(){if(this.collection?.status==='stale'||this.collection?.status==='unavailable')return `采集暂缓 · 保留快照 ${this.updatedAt?new Date(this.updatedAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):''}`;if(this.error&&!this.items.length)return '来源暂不可用';if(this.error&&this.items.length)return '刷新失败 · 显示缓存';if(!this.updatedAt)return '等待更新';const d=new Date(this.updatedAt);return `${Date.now()-d.getTime()>21600000?'上次更新':'获取于'} ${d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}`;}},mounted(){this.load();},methods:{tabIcon(id){return officialSourceIcon(id);},selectTab(id){this.activeTab=id;this.showAll=false;this.failedCovers={};this.items=[];this.updatedAt='';this.collection=null;this.error=false;try{this.accept(this.sourceData);}catch{this.error=true;}},coverSrc(value){return resolveCover(value,this.sourceKey);},validCover(value){return Boolean(resolveCover(value,this.sourceKey));},accept(data){this.sourceData=data;const source=data?.sources?.[this.sourceKey];if(!source||!Array.isArray(source.items)||!Number.isFinite(Date.parse(source.updatedAt)))throw Error('missing source');const items=source.items.filter(i=>(this.sourceId!=='hf_trending'||i.repoType===this.activeTab)&&typeof i.title==='string'&&/^https?:\/\//i.test(i.url)).slice(0,this.sourceId==='hf_trending'?30:24).map(i=>({...i,cover:this.validCover(i.cover)?i.cover:''}));if(!items.length)throw Error('empty source');for(const item of items){if(this.items.find(old=>old.url===item.url)?.cover!==item.cover)delete this.failedCovers[item.url];}this.items=items;this.updatedAt=source.updatedAt;this.collection=source.collection||null;},async load(force=false){this.loading=true;this.error=false;try{this.accept(cachedExtraHotspots());}catch{/* optional cache */}try{this.accept(await loadExtraHotspots(force));}catch{this.error=true;}finally{this.loading=false;}}}};
</script>
<style scoped>
.source-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px}.source-tabs button{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border:1px solid var(--s-line)}.source-tab-brand-icon{flex:none;width:16px;height:16px;object-fit:contain;background:#fff;border-radius:3px;padding:1px;box-sizing:border-box}.source-tabs button[aria-pressed="true"]{color:var(--s-text);background:rgba(127,145,171,.14);font-weight:600}

.source-news-card{--s-text:#26364c;--s-muted:#7b8799;--s-line:rgba(105,128,160,.15);border:1px solid var(--s-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--s-text);padding:16px 16px 0;box-sizing:border-box;overflow:hidden}.source-news-dark{--s-text:#e2e9f4;--s-muted:#95a3b9;--s-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.source-heading{padding-bottom:10px}.source-heading h2{display:flex;gap:8px;align-items:center;margin:0;overflow-wrap:anywhere;font-size:16px}.source-heading img{object-fit:contain;flex-shrink:0;border-radius:5px}.source-heading .cncert-wordmark{width:56px;border-radius:0}.source-icon-fallback{display:inline-grid;place-items:center;width:24px;height:24px;background:rgba(127,145,171,.1);border-radius:5px;font-size:12px}.source-heading p{font-size:10px;color:var(--s-muted);line-height:1.5;margin:6px 0 0}.source-toolbar{display:flex;align-items:center;justify-content:space-between;gap:5px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--s-line);font-size:10px;color:var(--s-muted)}.source-toolbar a{color:inherit;text-decoration:none}.source-list{list-style:none;padding:0;margin:0}.source-list li{min-width:0}.source-list a{display:flex;gap:8px;text-decoration:none;color:inherit;padding:12px 2px;border-bottom:1px solid var(--s-line);border-radius:6px;min-height:68px;box-sizing:border-box;align-items:center}.source-list a:hover{background:rgba(127,145,171,.05)}.source-rank{font-size:15px;font-weight:600;color:var(--s-muted);flex-shrink:0}.source-rank.top{color:#ef805a}.source-copy{min-width:0;flex:1}.source-copy h3{font-size:12px;line-height:1.55;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.source-copy p{font-size:10px;color:var(--s-muted);margin:6px 0 0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}footer{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:10px 0;font-size:10px;color:var(--s-muted);line-height:1.6}footer span{min-width:0}button{font:inherit;font-size:11px;cursor:pointer;border:0;border-radius:6px;padding:5px 7px;background:transparent;color:var(--s-muted);flex-shrink:0}button:hover{background:rgba(127,145,171,.06)}a:focus-visible,button:focus-visible{outline:2px solid #43898d;outline-offset:2px}.source-empty{font-size:12px;color:var(--s-muted);text-align:center;padding:25px 0}@media(max-width:768px){.source-copy h3{font-size:13px;line-height:1.65}}

.source-entry{display:flex;align-items:center;gap:8px;min-width:0;width:100%}.source-image-card .source-list a{display:block;padding:12px 0}.source-cover{aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:rgba(127,145,171,.08);margin-bottom:9px}.source-cover img{display:block;width:100%;height:100%;object-fit:cover}.source-image-card .source-copy h3{font-size:13px;line-height:1.6}

.douban-movie-card.source-image-card .source-list a{display:flex;align-items:center;gap:16px;padding:10px 2px;min-height:164px}.douban-movie-card .source-cover{width:96px;flex:0 0 96px;aspect-ratio:2/3;border-radius:5px;margin:0}.douban-movie-card .source-cover img{object-fit:cover;width:100%;height:100%}.douban-movie-card .source-entry{flex:1;min-width:0;width:auto}.douban-movie-card .source-copy h3{font-size:12px;line-height:1.6}
.maoyan-metrics{display:flex;flex-wrap:wrap;gap:2px 10px;margin-top:6px;font-size:11px;line-height:1.5;color:var(--s-muted)}

.source-news-card.source-newspaper {
  --s-text: #29251f;
  --s-muted: #65594a;
  --s-line: #c8bdac;
  background: #fbf6eb;
  color: var(--s-text);
  border: 1px solid var(--s-line);
  border-top: 3px solid #352d23;
  border-radius: 0;
  box-shadow: none;
}
.source-newspaper .source-heading { padding-bottom: 8px; border-bottom: 3px double #6e5d48; }
.source-newspaper .source-heading h2, .source-newspaper .source-copy h3 {
  font-family: Georgia, "Songti SC", SimSun, serif;
}
.source-newspaper .source-heading h2 { font-size: 20px; letter-spacing: .06em; }
.source-newspaper .source-list a { border-radius: 0; }
.source-newspaper .source-list a:hover { background: #f2e8d7; }
.source-newspaper .source-rank { font-family: Georgia, serif; }
.source-newspaper .source-rank.top { color: #954220; }
.source-newspaper :is(a,button):focus-visible { outline-color: #954220; }
.model-rank { display: inline-flex; align-items: center; gap: 4px; min-width: 38px; font-variant-numeric: tabular-nums; }
.model-rank img { display: block; }
.model-trophy-yellow { filter: hue-rotate(15deg) saturate(1.35) brightness(1.14); }
.model-trophy-copper { filter: hue-rotate(-20deg) saturate(.85) brightness(.79); }
.model-trophy-neutral { filter: grayscale(1); }
.model-index { color: var(--s-text); font-weight: 700; }
</style>
