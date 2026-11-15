<template>
  <section class="ithome-card" :class="{ 'ithome-dark': dark }" aria-labelledby="ithome-title">
    <header class="ithome-heading"><div><h2 id="ithome-title"><span class="ithome-logo" aria-hidden="true"><img :src="sourceIcon" width="26" height="26" alt="" referrerpolicy="no-referrer" /></span>IT之家</h2><p>科技快讯与数码资讯</p></div></header>
      <div class="ithome-toolbar"><span role="status">{{ status }}</span><a href="https://www.ithome.com/" target="_blank" rel="noopener noreferrer">访问官网 ↗</a></div>
      <ol v-if="visible.length" class="ithome-list"><li v-for="(topic,index) in visible" :key="topic.url"><a :href="topic.url" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(topic.cover)}"><ContentCover :cover="topic.cover" :source-key="'ithome'" /><span class="ithome-rank" :class="{ top:index<3 }">{{ index+1 }}</span><div class="ithome-copy"><h3 :class="{ 'news-recent': isRecent(topic) }">{{ topic.title }}</h3><div class="ithome-meta"><span class="ithome-node">IT之家</span><span>{{ formatDate(topic.publishedAt) }}</span></div></div><span class="ithome-arrow" aria-hidden="true">↗</span></a></li></ol>
      <div v-else class="ithome-empty">{{ loading ? '正在加载 IT之家…' : '资讯暂未更新，请稍后重试。' }}<button v-if="!loading" type="button" @click="load">重试</button></div>
      <footer class="ithome-footer"><span>来自 IT之家官方 RSS · 每3小时更新</span><button v-if="items.length>6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{ showAll ? '收起资讯 ↑' : '更多资讯 ↓' }}</button></footer>
    </section>
</template>
<script>
import { officialSourceIcon } from "../utils/source-icons.mjs";
import { isRecentNews } from "../utils/news-recency.mjs";
import ContentCover from './ContentCover.vue';
export default {
 components:{ContentCover},
  name:'IthomeNews', props:{dark:Boolean},
  data:()=>({sourceIcon:officialSourceIcon('ithome'),items:[],updatedAt:'',loading:false,error:false,showAll:false,controller:null}),
  computed:{
    visible(){return this.items.slice(0,this.showAll?24:6);},
    status(){if(this.error&&this.items.length)return '刷新失败 · 显示缓存';const d=new Date(this.updatedAt);if(!Number.isFinite(d.getTime()))return '等待更新';return `${Date.now()-d.getTime()>21600000?'上次更新':'更新于'} ${d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}`;}
  },
  mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
  methods:{
    formatDate(value){const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'';},
    isRecent(topic){return isRecentNews(topic?.publishedAt || '');},
    accept(data){if(!Array.isArray(data?.items)||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('invalid data');const items=data.items.filter(t=>t.source==='IT之家'&&typeof t.title==='string'&&/^https:\/\/(www\.)?ithome\.com\//.test(t.url)).slice(0,24);if(!items.length)throw Error('empty data');this.items=items;this.updatedAt=data.updatedAt;},
    async load(){this.loading=true;this.error=false;try{const data=JSON.parse(localStorage.getItem('navigation-ithome-v1'));if(data)this.accept(data);}catch{/* optional cache */}this.controller=new AbortController();const timeout=setTimeout(()=>this.controller.abort(),12000);try{const r=await fetch(`${process.env.BASE_URL}news.json`,{cache:'no-cache',signal:this.controller.signal});if(!r.ok)throw Error('request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('navigation-ithome-v1',JSON.stringify(data));}catch{/* optional storage */}}catch{this.error=true;}finally{clearTimeout(timeout);this.loading=false;}}
  }
};
</script>
<style scoped>
.ithome-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.ithome-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.ithome-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.ithome-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.ithome-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.ithome-logo img{display:block}.ithome-heading p{font-size:12px;line-height:1.6;color:var(--v-muted);margin:6px 0 0}.ithome-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.ithome-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.ithome-card a:focus-visible,.ithome-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.ithome-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.ithome-toolbar a{color:inherit;text-decoration:none}.ithome-list{list-style:none;padding:0;margin:0}.ithome-list li{min-width:0}.ithome-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.ithome-list a:hover{background:rgba(127,145,171,.06)}.ithome-rank{font-size:17px;font-weight:700;color:#a3adbb}.ithome-rank.top{color:#ef805a}.ithome-copy{min-width:0;flex:1}.ithome-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ithome-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.ithome-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.ithome-arrow{font-size:14px;color:var(--v-muted)}.ithome-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.ithome-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.ithome-card{padding:16px 16px 0}}

.ithome-list a.has-content-cover{flex-wrap:wrap}
.ithome-copy h3.news-recent{color:#d93a3a}
.ithome-dark .ithome-copy h3.news-recent{color:#ff7b72}

.ithome-card:not(.ithome-dark) {
  --v-text: #172746;
  --v-muted: #465976;
  --v-line: #b1c0d4;
  border: 1px solid #174fa8;
  border-radius: 8px 8px 3px 3px;
  background: #ece9d8;
  box-shadow: 0 2px 6px #0b317640;
}
.ithome-card:not(.ithome-dark) .ithome-heading {
  padding: 7px 10px;
  border-radius: 5px 5px 0 0;
  color: #fff;
  background: linear-gradient(#4b9bff, #256de1 28%, #0a50c8 60%, #0842a7);
}
.ithome-card:not(.ithome-dark) .ithome-heading p { color: #eef5ff; }
.ithome-card:not(.ithome-dark) .ithome-logo { border-radius: 3px; }
.ithome-card:not(.ithome-dark) .ithome-list { background: #fff; border-inline: 1px solid var(--v-line); }
.ithome-card:not(.ithome-dark) .ithome-list a { padding-inline: 8px; border-radius: 0; }
.ithome-card:not(.ithome-dark) .ithome-list a:hover { background: #e1edff; }
.ithome-card:not(.ithome-dark) .ithome-rank { color: #4b658a; }
.ithome-card:not(.ithome-dark) .ithome-rank.top { color: #174c9b; }
.ithome-card:not(.ithome-dark) button {
  color: #172746;
  background: linear-gradient(#fff, #f0f0e8 63%, #deded4);
  border: 1px solid #7193be;
  border-radius: 4px;
}
.ithome-card:not(.ithome-dark) button:hover { color: #123b76; background: #e1edff; }
.ithome-card:not(.ithome-dark) :is(a,button):focus-visible { outline-color: #1754a7; }
</style>
