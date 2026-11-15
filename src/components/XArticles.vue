<template>
 <section class="weibo-card x-articles-card" :class="{'weibo-dark':dark,'text-only':!showSourceImages}" aria-labelledby="x-articles-title">
  <header class="weibo-heading"><div><h2 id="x-articles-title"><span class="weibo-logo x-logo" aria-hidden="true"><img :src="`${publicPath}source-icons/x-official.png`" alt="" width="26" height="26" /></span>X 长文榜</h2></div></header>
  <div class="article-controls"><label>区域<select v-model="zone" aria-label="长文区域" @change="reset"><option value="cn">中文区</option><option value="gl">海外区</option></select></label><label>时间<select v-model="range" aria-label="长文时间" @change="reset"><option value="1">24 小时</option><option value="7">7 天</option><option value="30">1 个月</option><option value="all">历史</option></select></label><label>分类<select v-model="category" aria-label="长文分类" @change="showAll=false"><option value="all">全部分类</option><option v-for="cat in categories" :key="cat.key" :value="cat.key">{{cat.label}}</option></select></label></div>
  <ol v-if="visible.length" class="weibo-list"><li v-for="(item,index) in visible" :key="item.id"><a :href="item.url" :title="item.summary" target="_blank" rel="noopener noreferrer"><div v-if="showSourceImages" class="article-cover"><img v-if="item.cover&&!failedCovers[item.id]" :src="item.cover" alt="" loading="lazy" referrerpolicy="no-referrer" @error="failedCovers[item.id]=true" /><span v-else class="article-cover-placeholder">{{item.summary||item.title}}</span><span class="article-image-rank">{{index+1}}</span></div><span v-if="!showSourceImages" class="weibo-rank" :class="{top:index<3}">{{index+1}}</span><div class="weibo-copy"><h3>{{item.title}}</h3><div class="weibo-meta"><span>@{{item.handle}}</span><span>{{formatNumber(item.bookmarks)}} 收藏</span><span>{{item.categoryLabel}}</span></div></div></a></li></ol>
  <div v-else class="weibo-empty">{{loading?'正在加载长文榜…':error?'长文榜暂未更新':'当前筛选暂无长文'}}<button v-if="!loading" type="button" @click="load">刷新</button></div>
  <footer class="weibo-footer"><span>每小时同步 · 点击阅读 X 原文</span><button v-if="filtered.length>6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{showAll?'收起列表 ↑':'更多长文 ↓'}}</button></footer>
 </section>
</template>
<script>
import {SHOW_SOURCE_IMAGES} from '../utils/source-display.mjs';
export default {
 name:'XArticles',props:{dark:Boolean},
 data:()=>({showSourceImages:SHOW_SOURCE_IMAGES,publicPath:process.env.BASE_URL,failedCovers:{},items:[],categories:[],zone:'cn',range:'7',category:'all',showAll:false,sourceUpdatedText:'',fetchedAt:'',error:false,loading:false,controller:null}),
 computed:{filtered(){const limit=this.range==='all'?Infinity:Number(this.range);return this.items.filter(t=>t.zone===this.zone&&t.ageDays<=limit&&(this.category==='all'||t.category===this.category)).sort((a,b)=>b.bookmarks-a.bookmarks);},visible(){return this.filtered.slice(0,this.showAll?50:6);},status(){if(this.error&&this.items.length)return '刷新失败 · 显示缓存';return this.sourceUpdatedText?`源更新 ${this.sourceUpdatedText}`:this.fetchedAt?'已同步长文榜':'等待更新';}},
 mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{
  validCover(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&((u.hostname==='xbangdan.com'&&u.pathname.startsWith('/feed/img/'))||(u.hostname==='pbs.twimg.com'&&u.pathname.startsWith('/media/')));}catch{return false;}},
  reset(){this.category='all';this.showAll=false;},
  formatNumber(n){return n>=100000000?`${(n/100000000).toFixed(1)}亿`:n>=10000?`${(n/10000).toFixed(1)}万`:String(n);},
  accept(data){
   if(!data||!Array.isArray(data.items)||!Array.isArray(data.categories)||!Number.isFinite(Date.parse(data.fetchedAt)))throw Error('Invalid snapshot');
   const seen=new Set();const items=data.items.filter(t=>t&&typeof t.title==='string'&&typeof t.handle==='string'&&/^[A-Za-z0-9_]{1,15}$/.test(t.handle)&&/^\d{1,25}$/.test(t.id)&&t.url===`https://x.com/${t.handle}/status/${t.id}`&&['cn','gl'].includes(t.zone)&&typeof t.category==='string'&&typeof t.categoryLabel==='string'&&['ageDays','bookmarks','views'].every(k=>Number.isFinite(t[k])&&t[k]>=0)&&!seen.has(t.id)&&seen.add(t.id)).map(t=>({...t,cover:this.validCover(t.cover)?t.cover:''}));
   if(!items.length)throw Error('Empty snapshot');this.items=items;this.categories=data.categories.filter(c=>c&&typeof c.key==='string'&&typeof c.label==='string');this.fetchedAt=data.fetchedAt;this.sourceUpdatedText=typeof data.sourceUpdatedText==='string'?data.sourceUpdatedText:'';
  },
  async load(){
   if(this.loading)return;this.loading=true;this.error=false;
   try{this.accept(JSON.parse(localStorage.getItem('navigation-x-articles-v1')));}catch{/* optional cache */}
   const controller=new AbortController();this.controller=controller;const timer=setTimeout(()=>controller.abort(),15000);
   try{const r=await fetch(`${process.env.BASE_URL}x-articles.json`,{cache:'no-cache',signal:controller.signal});if(!r.ok)throw Error('Request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('navigation-x-articles-v1',JSON.stringify(data));}catch{/* optional storage */}}
   catch{this.error=true;}finally{clearTimeout(timer);this.loading=false;}
  }
 }
};
</script>

<style scoped>


.weibo-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.weibo-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.weibo-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.weibo-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.weibo-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.weibo-logo img{display:block}.weibo-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.weibo-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.weibo-card a:focus-visible,.weibo-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.weibo-toolbar a{color:inherit;text-decoration:none}.weibo-list{list-style:none;padding:0;margin:0}.weibo-list li{min-width:0}.weibo-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.weibo-list a:hover{background:rgba(127,145,171,.06)}.weibo-rank{font-size:17px;font-weight:700;color:#a3adbb}.weibo-rank.top{color:#ef805a}.weibo-copy{min-width:0;flex:1}.weibo-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.weibo-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.weibo-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.weibo-arrow{font-size:14px;color:var(--v-muted)}.weibo-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.weibo-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.weibo-card{padding:16px 16px 0}}

.x-articles-card{min-width:0;width:100%}.x-logo{background:#000}.x-logo img{display:block;width:26px;height:26px;object-fit:contain}.x-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.x-tabs button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}

.article-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px;color:var(--v-muted);font-size:11px}.article-controls label{display:flex;align-items:center;gap:4px;min-width:0}.article-controls select{min-width:0;max-width:100%;border:1px solid var(--v-line);border-radius:6px;padding:5px 3px;color:var(--v-text);background:transparent;font:inherit}.article-controls select:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-dark select option{background:#181f2d}

.x-articles-card .weibo-list a{display:block;padding:12px 0;min-height:0}.article-cover{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:9px;background:linear-gradient(135deg,#1d4254,#345487);margin-bottom:10px}.article-cover img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .2s}.x-articles-card .weibo-list a:hover .article-cover img{transform:scale(1.035)}.article-cover-placeholder{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;margin:28px 16px 12px;color:#e0eaf7;font-size:12px;line-height:1.8}.article-image-rank{position:absolute;top:8px;left:8px;padding:3px 7px;border-radius:5px;color:white;background:rgba(10,20,35,.75);font-size:12px;font-weight:700}.x-articles-card .weibo-copy h3{font-size:13px;line-height:1.6}.x-articles-card .weibo-meta{margin-top:6px}@media(prefers-reduced-motion:reduce){.article-cover img{transition:none}}
.x-articles-card.text-only .weibo-list a{display:flex;align-items:center;gap:10px;min-height:88px;padding:12px 3px}
</style>
