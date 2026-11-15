<template>
 <section class="weibo-card x-hot-card" :class="{'weibo-dark':dark}" aria-labelledby="x-hot-title">
  <header class="weibo-heading"><div><h2 id="x-hot-title"><span class="weibo-logo x-logo" aria-hidden="true"><img :src="`${publicPath}source-icons/x-official.png`" alt="" width="26" height="26" /></span>X 热门推文</h2></div></header>
  <div class="x-tabs" role="group" aria-label="推文榜单类型"><button v-for="tab in tabs" :key="tab.key" type="button" :class="{active:mode===tab.key}" :aria-pressed="mode===tab.key" @click="mode=tab.key;showAll=false">{{tab.label}}</button></div>
  <ol v-if="visible.length" class="weibo-list"><li v-for="(item,index) in visible" :key="item.id"><a :href="item.url" target="_blank" rel="noopener noreferrer"><span class="weibo-rank" :class="{top:index<3}">{{index+1}}</span><div class="weibo-copy"><h3>{{item.title}}</h3><div class="weibo-meta"><span>@{{item.handle}}</span><span>{{formatNumber(item.value)}} {{mode==='rate'?'曝光/时':'曝光'}}</span></div></div></a></li></ol>
  <div v-else class="weibo-empty">{{loading?'正在加载热门推文…':'推文榜暂未更新'}}<button v-if="!loading" type="button" @click="load">重试</button></div>
  <footer class="weibo-footer"><span>每小时同步 · 点击查看 X 原文</span><div class="x-footer-actions"><button type="button" class="x-switch" :title="`切换到${nextLabel()}`" @click="cycleTab">切换：{{ nextLabel() }} →</button><button v-if="items.length>10" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{showAll?'收起列表 ↑':'更多推文 ↓'}}</button></div></footer>
 </section>
</template>
<script>
export default {
 name:'XHotTweets',props:{dark:Boolean},
 data:()=>({publicPath:process.env.BASE_URL,rankings:{rate:[],views:[]},mode:'rate',tabs:[{key:'rate',label:'现在最热'},{key:'views',label:'曝光最高'}],updatedAt:'',loading:false,error:false,showAll:false,controller:null}),
 computed:{items(){return this.rankings[this.mode];},visible(){return this.items.slice(0,this.showAll?50:10);},status(){if(this.error)return this.items.length?'刷新失败 · 显示缓存':'等待更新';const d=new Date(this.updatedAt);if(!Number.isFinite(d.getTime()))return '等待更新';return `${Date.now()-d.getTime()>7200000?'上次更新':'源更新'} ${d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}`;}},
 mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{
  nextLabel(){const index=this.tabs.findIndex(tab=>tab.key===this.mode);return this.tabs[(index+1)%this.tabs.length].label;},
  cycleTab(){const index=this.tabs.findIndex(tab=>tab.key===this.mode);this.mode=this.tabs[(index+1)%this.tabs.length].key;this.showAll=false;},
  formatNumber(n){return n>=100000000?`${(n/100000000).toFixed(1)}亿`:n>=10000?`${(n/10000).toFixed(1)}万`:String(n);},
  accept(data){
   if(!data||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('Invalid timestamp');
   const rankings={};
   for(const key of ['rate','views']){
    if(!Array.isArray(data[key]))throw Error('Missing ranking');
    const seen=new Set();rankings[key]=data[key].filter(t=>{
     if(!t||typeof t.title!=='string'||!/^\d{1,25}$/.test(t.id)||!/^[A-Za-z0-9_]{1,15}$/.test(t.handle)||t.url!==`https://x.com/${t.handle}/status/${t.id}`||!Number.isFinite(t.value)||t.value<0||seen.has(t.id))return false;
     seen.add(t.id);return true;
    }).slice(0,50);
    if(!rankings[key].length)throw Error('Empty ranking');
   }
   this.rankings=rankings;this.updatedAt=data.updatedAt;
  },
  async load(){
   if(this.loading)return;this.loading=true;this.error=false;
   try{this.accept(JSON.parse(localStorage.getItem('navigation-x-hot-v1')));}catch{/* optional cache */}
   const controller=new AbortController();this.controller=controller;const timeout=setTimeout(()=>controller.abort(),12000);
   try{const response=await fetch(`${process.env.BASE_URL}x-hot.json`,{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Request failed');const data=await response.json();this.accept(data);try{localStorage.setItem('navigation-x-hot-v1',JSON.stringify(data));}catch{/* optional storage */}}
   catch{this.error=true;}finally{clearTimeout(timeout);this.loading=false;}
  }
 }
};
</script>

<style scoped>

.weibo-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.weibo-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.weibo-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.weibo-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.weibo-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.weibo-logo img{display:block}.weibo-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.weibo-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.weibo-card a:focus-visible,.weibo-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.weibo-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.weibo-toolbar a{color:inherit;text-decoration:none}.weibo-list{list-style:none;padding:0;margin:0}.weibo-list li{min-width:0}.weibo-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.weibo-list a:hover{background:rgba(127,145,171,.06)}.weibo-rank{font-size:17px;font-weight:700;color:#a3adbb}.weibo-rank.top{color:#ef805a}.weibo-copy{min-width:0;flex:1}.weibo-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.weibo-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.weibo-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.weibo-arrow{font-size:14px;color:var(--v-muted)}.weibo-footer{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.x-footer-actions{display:flex;align-items:center;gap:4px;margin-inline-start:auto;flex-shrink:0}.x-switch{white-space:nowrap}.weibo-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.weibo-card{padding:16px 16px 0}}

.x-hot-card{min-width:0;width:100%}.x-logo{background:#000}.x-logo img{display:block;width:26px;height:26px;object-fit:contain}.x-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.x-tabs button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}
</style>
