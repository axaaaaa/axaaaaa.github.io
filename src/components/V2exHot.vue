<template>
  <section class="v2ex-card" :class="{ 'v2ex-dark': dark }" aria-labelledby="v2ex-title">
    <header class="v2ex-heading"><div><h2 id="v2ex-title"><span class="v2ex-logo" aria-hidden="true"><img :src="sourceIcon" width="26" height="26" alt="" referrerpolicy="no-referrer" /></span>V2EX 热门</h2><p>技术与生活，看看大家正在聊什么</p></div></header>
      <div class="v2ex-toolbar"><span role="status">{{ status }}</span><a href="https://www.v2ex.com/?tab=hot" target="_blank" rel="noopener noreferrer">查看原榜 ↗</a></div>
      <ol v-if="visible.length" class="v2ex-list"><li v-for="(topic,index) in visible" :key="topic.id"><a :href="topic.url" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(topic.cover)}"><ContentCover :cover="topic.cover" :source-key="'v2ex'" /><span class="v2ex-rank" :class="{ top:index<3 }">{{ index+1 }}</span><div class="v2ex-copy"><h3>{{ topic.title }}</h3><div class="v2ex-meta"><span v-if="topic.node" class="v2ex-node">{{ topic.node }}</span><span v-if="topic.author">{{ topic.author }}</span><span>{{ topic.replies }} 回复</span></div></div><span class="v2ex-arrow" aria-hidden="true">↗</span></a></li></ol>
      <div v-else class="v2ex-empty">{{ loading ? '正在加载 V2EX 热门…' : '热门话题暂未更新，请稍后重试。' }}<button v-if="!loading" type="button" @click="load">重试</button></div>
      <footer class="v2ex-footer"><span>来自 V2EX 官方热门接口 · 每3小时更新</span><button v-if="items.length>6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{ showAll ? '收起话题 ↑' : '更多话题 ↓' }}</button></footer>
  </section>
</template>
<script>
import { officialSourceIcon } from "../utils/source-icons.mjs";
import ContentCover from './ContentCover.vue';
export default {
 components:{ContentCover},
  name:'V2exHot', props:{dark:Boolean},
  data:()=>({sourceIcon:officialSourceIcon('v2ex'),items:[],updatedAt:'',loading:false,error:false,showAll:false,controller:null}),
  computed:{
    visible(){return this.items.slice(0,this.showAll?24:6);},
    status(){if(this.error&&this.items.length)return '刷新失败 · 显示缓存';const d=new Date(this.updatedAt);if(!Number.isFinite(d.getTime()))return '等待更新';return `${Date.now()-d.getTime()>21600000?'上次更新':'更新于'} ${d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}`;}
  },
  mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
  methods:{
    accept(data){if(!Array.isArray(data?.items)||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('invalid data');const items=data.items.filter(t=>Number.isInteger(t.id)&&t.id>0&&typeof t.title==='string'&&t.url===`https://www.v2ex.com/t/${t.id}`).slice(0,24);if(!items.length)throw Error('empty data');this.items=items;this.updatedAt=data.updatedAt;},
    async load(){this.loading=true;this.error=false;try{const data=JSON.parse(localStorage.getItem('navigation-v2ex-v1'));if(data)this.accept(data);}catch{/* optional cache */}this.controller=new AbortController();const timeout=setTimeout(()=>this.controller.abort(),12000);try{const r=await fetch(`${process.env.BASE_URL}v2ex-hot.json`,{cache:'no-cache',signal:this.controller.signal});if(!r.ok)throw Error('request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('navigation-v2ex-v1',JSON.stringify(data));}catch{/* optional storage */}}catch{this.error=true;}finally{clearTimeout(timeout);this.loading=false;}}
  }
};
</script>
<style scoped>
.v2ex-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.v2ex-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.v2ex-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:18px}.v2ex-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5}.v2ex-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.v2ex-logo img{display:block}.v2ex-heading p{font-size:12px;line-height:1.6;color:var(--v-muted);margin:6px 0 0}.v2ex-card button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.v2ex-card button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.v2ex-card a:focus-visible,.v2ex-card button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}.v2ex-toolbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--v-line);font-size:10px;color:var(--v-muted)}.v2ex-toolbar a{color:inherit;text-decoration:none}.v2ex-list{list-style:none;padding:0;margin:0}.v2ex-list li{min-width:0}.v2ex-list a{display:flex;align-items:center;gap:10px;padding:16px 3px;text-decoration:none;color:inherit;border-bottom:1px solid var(--v-line);border-radius:7px;min-height:88px;box-sizing:border-box}.v2ex-list a:hover{background:rgba(127,145,171,.06)}.v2ex-rank{font-size:17px;font-weight:700;color:#a3adbb}.v2ex-rank.top{color:#ef805a}.v2ex-copy{min-width:0;flex:1}.v2ex-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.v2ex-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--v-muted);margin-top:8px;align-items:center;overflow-wrap:anywhere}.v2ex-node{padding:2px 5px;background:rgba(127,145,171,.09);border-radius:4px}.v2ex-arrow{font-size:14px;color:var(--v-muted)}.v2ex-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;font-size:10px;color:var(--v-muted);line-height:1.7}.v2ex-empty{text-align:center;color:var(--v-muted);padding:24px 0;font-size:12px}@media(max-width:700px){.v2ex-card{padding:16px 16px 0}}

.v2ex-list a.has-content-cover{flex-wrap:wrap}
</style>

