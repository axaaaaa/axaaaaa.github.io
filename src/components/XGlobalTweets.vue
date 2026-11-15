<template>
 <section class="weibo-card x-global-card" :class="{'weibo-dark':dark}" aria-labelledby="x-global-title">
  <header class="weibo-heading"><div><h2 id="x-global-title"><span class="weibo-logo x-logo" aria-hidden="true"><img :src="`${publicPath}source-icons/x-official.png`" alt="" width="26" height="26" /></span>X 海外热榜</h2></div></header>
  <div class="global-controls" role="group" aria-label="海外榜日期"><button type="button" :aria-pressed="selectedDay==='latest'" @click="changeDay('latest')">最新一天</button><button type="button" :aria-pressed="selectedDay==='previous'" @click="changeDay('previous')">前一天</button></div>
  <div class="global-controls"><label>分类<select aria-label="分类" v-model="category" @change="mode=category==='article'?'bookmarks':'likes';showAll=false"><option value="all">全部推文</option><option v-for="cat in categories" :key="cat.key" :value="cat.key">{{cat.label}}</option></select></label><label>排序<select aria-label="排序" v-model="mode" @change="showAll=false"><option value="likes">点赞最高</option><option value="views">曝光最高</option><option v-if="category==='article'" value="bookmarks">收藏最多</option></select></label></div>
  <div v-if="selectedEvent" class="event-filter"><span>事件：{{selectedEvent.title}}</span><button type="button" @click="selectEvent(null);$emit('clear-event')">清除筛选</button></div>
  <ol v-if="visible.length" class="weibo-list"><li v-for="(item,index) in visible" :key="item.id"><a :href="item.url" :title="item.original||item.title" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(item.cover)}"><ContentCover :cover="item.cover" :source-key="'xglobal'" /><span class="weibo-rank" :class="{top:index<3}">{{index+1}}</span><div class="weibo-copy"><h3>{{item.title}}</h3><div class="weibo-meta"><span>@{{item.handle}}</span><span>{{formatNumber(item[mode])}} {{units[mode]}}</span></div></div></a></li></ol>
  <div v-else class="weibo-empty">{{dayUnavailable?'前一天暂无归档数据':loading?'正在加载海外热榜…':'该分类暂无推文'}}<button v-if="!loading" type="button" @click="load">重试</button></div>
  <footer class="weibo-footer"><span>每小时同步 · 长文近7天收藏榜</span><button v-if="items.length>6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{showAll?'收起列表 ↑':'更多推文 ↓'}}</button></footer>
 </section>
</template>
<script>
import {globalDayMixin} from '../utils/global-day.mjs';
import ContentCover from './ContentCover.vue';
export default {
 mixins:[globalDayMixin],
 components:{ContentCover},
 name:'XGlobalTweets',emits:['clear-event'],props:{dark:Boolean},
 data:()=>({publicPath:process.env.BASE_URL,selectedEvent:null,allItems:[],categories:[],category:'all',mode:'likes',units:{likes:'赞',views:'曝光',bookmarks:'收藏'},dataDate:'',updatedAt:'',loading:false,error:false,showAll:false,controller:null}),
 computed:{
  items(){const seen=new Set();return this.allItems.filter(item=>{if((this.selectedEvent&&!this.selectedEvent.tweetIds.includes(item.id))||(this.category==='all'?item.category==='article':item.category!==this.category)||seen.has(item.id))return false;seen.add(item.id);return true;}).sort((a,b)=>b[this.mode]-a[this.mode]);},
  visible(){return this.items.slice(0,this.showAll?50:6);},
  status(){const suffix=this.error&&this.allItems.length?' · 缓存':this.selectedDay==='latest'&&Date.now()-Date.parse(this.updatedAt)>172800000?' · 更新暂缓':'';return this.dataDate?`数据 ${this.dataDate.slice(5)}（UTC）${suffix}`:'等待更新';}
 },
 mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{
  selectEvent(event){this.selectedEvent=event;this.category='all';this.mode='likes';this.showAll=false;if(event)this.$nextTick(()=>this.$el.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));},
  formatNumber(n){return n>=100000000?`${(n/100000000).toFixed(1)}亿`:n>=10000?`${(n/10000).toFixed(1)}万`:String(n);},
  accept(data){
   if(!data||!/^\d{4}-\d{2}-\d{2}$/.test(data.dataDate)||!Number.isFinite(Date.parse(data.updatedAt))||!Array.isArray(data.categories)||!Array.isArray(data.items))throw Error('Invalid global snapshot');
   const categories=data.categories.filter(c=>c&&typeof c.key==='string'&&typeof c.label==='string');const keys=new Set(categories.map(c=>c.key));
   const items=data.items.filter(t=>t&&typeof t.title==='string'&&/^\d{1,25}$/.test(t.id)&&/^[A-Za-z0-9_]{1,15}$/.test(t.handle)&&t.url===`https://x.com/${t.handle}/status/${t.id}`&&keys.has(t.category)&&['likes','views','bookmarks'].every(k=>Number.isFinite(t[k])&&t[k]>=0));
   if(!items.length)throw Error('Empty rankings');this.allItems=items;this.categories=categories;this.dataDate=data.dataDate;this.updatedAt=data.updatedAt;
   if(this.category!=='all'&&!keys.has(this.category)){this.category='all';this.mode='likes';}
  },
  async load(){
   if(this.loading)return;this.loading=true;this.error=false;
   try{this.accept(JSON.parse(localStorage.getItem('navigation-x-global-v1')));}catch{/* optional cache */}
   const controller=new AbortController();this.controller=controller;const timeout=setTimeout(()=>controller.abort(),12000);
   try{const response=await fetch(`${process.env.BASE_URL}x-global.json`,{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Request failed');const data=await response.json();this.accept(data);try{localStorage.setItem('navigation-x-global-v1',JSON.stringify(data));}catch{/* optional storage */}}
   catch{this.error=true;}finally{clearTimeout(timeout);this.loading=false;}
  }
 }
};
</script>
<style scoped>

.weibo-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.weibo-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.weibo-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.weibo-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.weibo-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.weibo-logo img{display:block}.weibo-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.weibo-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.weibo-card a:focus-visible,.weibo-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.weibo-toolbar a{color:inherit;text-decoration:none}.weibo-list{list-style:none;padding:0;margin:0}.weibo-list li{min-width:0}.weibo-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.weibo-list a:hover{background:rgba(127,145,171,.06)}.weibo-rank{font-size:17px;font-weight:700;color:#a3adbb}.weibo-rank.top{color:#ef805a}.weibo-copy{min-width:0;flex:1}.weibo-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.weibo-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.weibo-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.weibo-arrow{font-size:14px;color:var(--v-muted)}.weibo-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.weibo-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.weibo-card{padding:16px 16px 0}}

.x-global-card{min-width:0;width:100%}.x-logo{background:#000}.x-logo img{display:block;width:26px;height:26px;object-fit:contain}.x-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.x-tabs button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}
.global-controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px}.global-controls label{display:flex;align-items:center;gap:4px;min-width:0;color:var(--v-muted);font-size:11px}.global-controls select{max-width:100%;min-width:0;padding:5px 4px;border:1px solid var(--v-line);border-radius:6px;color:var(--v-text);background:transparent;font:inherit}.global-controls select:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-dark select option{background:#181f2d}
.event-filter{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:8px 0;color:var(--v-muted);font-size:11px}.event-filter span{min-width:0;overflow-wrap:anywhere}.event-filter button{flex-shrink:0}

.weibo-list a.has-content-cover{flex-wrap:wrap}
.global-controls button[aria-pressed=true]{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}
</style>
