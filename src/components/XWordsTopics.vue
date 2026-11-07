<template>
 <section class="weibo-card x-words-card" :class="{'weibo-dark':dark}" aria-labelledby="x-words-title">
  <header class="weibo-heading"><div><h2 id="x-words-title"><span class="weibo-logo x-logo" aria-hidden="true"><img :src="`${publicPath}source-icons/x-official.png`" alt="" width="26" height="26" /></span>X 话题榜</h2><p>近 24 小时热门话题</p></div></header>
  <div class="words-controls"><label>分类<select v-model="category" aria-label="话题分类" @change="showAll=false"><option value="all">全部话题</option><option v-for="cat in categories" :key="cat.key" :value="cat.key">{{cat.label}}</option></select></label><label><input v-model="risingOnly" type="checkbox" @change="showAll=false" />只看上升</label></div>
  <div class="weibo-toolbar"><span role="status">{{status}}</span><a href="https://xbangdan.com/words/" target="_blank" rel="noopener noreferrer">来源：X榜单话题 ↗</a></div>
  <ol v-if="visible.length" class="weibo-list"><li v-for="item in visible" :key="item.rank"><a :href="item.url" :title="item.summary" target="_blank" rel="noopener noreferrer"><span class="weibo-rank" :class="{top:item.rank<4}">{{item.rank}}</span><div class="weibo-copy"><h3>{{item.title}}</h3><div class="weibo-meta"><span>{{item.categoryLabel}}</span><span>{{item.viewsText}} 曝光</span><span :class="{'words-rising':item.trend==='up'}">{{trendLabel(item.trend)}}</span></div></div></a></li></ol>
  <div v-else class="weibo-empty">{{loading?'正在加载话题榜…':error?'话题榜暂未更新':'暂无符合筛选条件的话题'}}<button v-if="!loading" type="button" @click="load">刷新</button></div>
  <footer class="weibo-footer"><span>每小时同步 · 点击查看代表推文</span><button v-if="filtered.length>6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{showAll?'收起列表 ↑':'更多话题 ↓'}}</button></footer>
 </section>
</template>
<script>
export default {
 name:'XWordsTopics',props:{dark:Boolean},
 data:()=>({publicPath:process.env.BASE_URL,items:[],categories:[],category:'all',risingOnly:false,showAll:false,sourceUpdatedText:'',fetchedAt:'',error:false,loading:false,controller:null}),
 computed:{filtered(){return this.items.filter(t=>(this.category==='all'||t.category===this.category)&&(!this.risingOnly||t.trend==='up'));},visible(){return this.filtered.slice(0,this.showAll?100:6);},status(){if(this.error&&this.items.length)return '刷新失败 · 显示缓存';if(this.sourceUpdatedText)return `源更新 ${this.sourceUpdatedText}`;return this.fetchedAt?'已同步话题榜':'等待更新';}},
 mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{
  trendLabel(t){return ({up:'↑ 上升',down:'↓ 退烧',flat:'→ 平稳',new:'新话题'})[t]||'观察中';},
  accept(data){
   if(!data||!Array.isArray(data.items)||!Array.isArray(data.categories)||!Number.isFinite(Date.parse(data.fetchedAt)))throw Error('Invalid snapshot');
   const seen=new Set();const items=data.items.filter(t=>t&&Number.isInteger(t.rank)&&t.rank>0&&typeof t.title==='string'&&typeof t.category==='string'&&typeof t.categoryLabel==='string'&&typeof t.viewsText==='string'&&/^https:\/\/x\.com\/(?:i|[A-Za-z0-9_]{1,15})\/status\/\d{1,25}$/.test(t.url)&&!seen.has(t.rank)&&seen.add(t.rank)).slice(0,100);
   if(!items.length)throw Error('Empty snapshot');this.items=items;this.categories=data.categories.filter(c=>c&&typeof c.key==='string'&&typeof c.label==='string');this.fetchedAt=data.fetchedAt;this.sourceUpdatedText=typeof data.sourceUpdatedText==='string'?data.sourceUpdatedText:'';
   if(this.category!=='all'&&!this.categories.some(c=>c.key===this.category))this.category='all';
  },
  async load(){
   if(this.loading)return;this.loading=true;this.error=false;
   try{this.accept(JSON.parse(localStorage.getItem('navigation-x-words-v1')));}catch{/* optional cache */}
   const controller=new AbortController();this.controller=controller;const timer=setTimeout(()=>controller.abort(),12000);
   try{const r=await fetch(`${process.env.BASE_URL}x-words.json`,{cache:'no-cache',signal:controller.signal});if(!r.ok)throw Error('Request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('navigation-x-words-v1',JSON.stringify(data));}catch{/* optional storage */}}
   catch{this.error=true;}finally{clearTimeout(timer);this.loading=false;}
  }
 }
};
</script>

<style scoped>


.weibo-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.weibo-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.weibo-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.weibo-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.weibo-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.weibo-logo img{display:block}.weibo-heading p{font-size:12px;line-height:1.6;color:var(--v-muted);margin:6px 0 0}.weibo-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.weibo-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.weibo-card a:focus-visible,.weibo-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.weibo-toolbar a{color:inherit;text-decoration:none}.weibo-list{list-style:none;padding:0;margin:0}.weibo-list li{min-width:0}.weibo-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.weibo-list a:hover{background:rgba(127,145,171,.06)}.weibo-rank{font-size:17px;font-weight:700;color:#a3adbb}.weibo-rank.top{color:#ef805a}.weibo-copy{min-width:0;flex:1}.weibo-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.weibo-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.weibo-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.weibo-arrow{font-size:14px;color:var(--v-muted)}.weibo-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.weibo-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.weibo-card{padding:16px 16px 0}}

.x-words-card{min-width:0;width:100%}.x-logo{background:#000}.x-logo img{display:block;width:26px;height:26px;object-fit:contain}.x-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.x-tabs button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}

.words-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px;color:var(--v-muted);font-size:11px}.words-controls label{display:flex;align-items:center;gap:5px;min-width:0}.words-controls select{min-width:0;max-width:100%;border:1px solid var(--v-line);border-radius:6px;padding:5px;color:var(--v-text);background:transparent;font:inherit}.words-controls input{accent-color:#e6764f}.words-rising{color:#cb6c37}.weibo-dark select option{background:#181f2d}
</style>
