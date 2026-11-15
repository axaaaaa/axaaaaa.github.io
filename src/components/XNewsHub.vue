<template>
 <section class="weibo-card x-news-hub" :class="{'weibo-dark':dark}" aria-labelledby="x-news-title">
  <header class="weibo-heading"><div><h2 id="x-news-title"><span class="weibo-logo x-logo" aria-hidden="true"><img :src="`${publicPath}source-icons/x-official.png`" alt="" width="26" height="26" /></span>X 新闻</h2></div><div class="weibo-heading-meta"><span role="status">{{ headerStatus() }}</span><a :href="headerLink" target="_blank" rel="noopener noreferrer" title="来源：X榜单" aria-label="来源：X榜单">来源↗</a></div></header>
  <div class="x-tabs" role="tablist" aria-label="X 新闻分类"><button v-for="tab in tabs" :key="tab.key" type="button" role="tab" :class="{active:active===tab.key}" :aria-selected="active===tab.key" @click="active=tab.key">{{tab.label}}</button></div>
  <div v-show="active==='hot'"><XHotTweets ref="hot" :dark="dark" /></div>
  <div v-show="active==='global'"><XGlobalTweets ref="global" :dark="dark" @clear-event="$emit('clear-event')" /></div>
  <div v-show="active==='words'"><XWordsTopics ref="words" :dark="dark" /></div>
  <div v-show="active==='articles'"><XArticles ref="articles" :dark="dark" /></div>
  <footer class="x-hub-footer"><button type="button" class="x-hub-switch" :title="`切换到${nextLabel}`" @click="cycleTab">切换：{{ nextLabel }} →</button></footer>
 </section>
</template>
<script>
import XHotTweets from './XHotTweets.vue';
import XGlobalTweets from './XGlobalTweets.vue';
import XWordsTopics from './XWordsTopics.vue';
import XArticles from './XArticles.vue';
export default {
 name:'XNewsHub',
 components:{XHotTweets,XGlobalTweets,XWordsTopics,XArticles},
 emits:['clear-event'],props:{dark:Boolean},
 data:()=>({publicPath:process.env.BASE_URL,active:'hot',ready:false,tabs:[{key:'hot',label:'热门推文'},{key:'global',label:'海外热榜'},{key:'words',label:'话题榜'},{key:'articles',label:'长文榜'}]}),
 computed:{headerLink(){return 'https://xbangdan.com/'+(this.active==='hot'?'':this.active+'/');},nextLabel(){const index=this.tabs.findIndex(tab=>tab.key===this.active);return this.tabs[(index+1)%this.tabs.length].label;}},
 mounted(){this.ready=true;},
 methods:{headerStatus(){const child=this.$refs[this.active];if(!this.ready||!child)return '等待更新';if(child.dayUnavailable)return '前一天暂无归档数据';return (child.status||'等待更新').replace(/^(上次更新|更新于|已同步)\s*/,'');},cycleTab(){const index=this.tabs.findIndex(tab=>tab.key===this.active);this.active=this.tabs[(index+1)%this.tabs.length].key;},selectEvent(event){this.active='global';this.$nextTick(()=>this.$refs.global?.selectEvent(event));}}
};
</script>

<style scoped>
.weibo-card{--v-text:#26364c;--v-muted:#7b8799;--v-line:rgba(105,128,160,.15);border:1px solid var(--v-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--v-text);padding:20px 20px 0;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}.weibo-dark{--v-text:#e2e9f4;--v-muted:#95a3b9;--v-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.weibo-heading{display:flex;flex-wrap:nowrap;align-items:center;justify-content:space-between;gap:4px;padding-bottom:18px}.weibo-heading>div:first-child{min-width:0;flex:1 1 auto}.weibo-heading-meta{flex:0 0 auto;display:flex;align-items:center;gap:4px;font-size:10px;line-height:1.4;color:var(--v-muted);margin-inline-start:auto;white-space:nowrap}.weibo-heading-meta a{color:inherit;text-decoration:none;flex-shrink:0}.weibo-heading h2{display:flex;align-items:center;gap:8px;margin:0;font-size:18px;line-height:1.5;min-width:0;overflow:hidden;white-space:nowrap}.weibo-logo{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0f0f0;overflow:hidden}.weibo-logo img{display:block}.x-logo{background:#000}.x-logo img{display:block;width:26px;height:26px;object-fit:contain}.x-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.x-tabs button{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;flex-shrink:0}.x-tabs button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.x-tabs button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}
.x-news-hub :deep(.weibo-card){border:0;border-radius:0;background:none;box-shadow:none;padding:0;overflow:visible}
.x-news-hub :deep(.weibo-card .weibo-heading){display:none}
.x-hub-footer{display:flex;justify-content:flex-end;padding:0 0 14px}.x-hub-switch{font:inherit;font-size:12px;border:0;background:transparent;color:var(--v-muted);padding:6px 9px;border-radius:7px;cursor:pointer;white-space:nowrap}.x-hub-switch:hover{color:#e6764f;background:rgba(241,118,77,.08)}
.x-news-hub{display:flex;flex-direction:column;min-height:0}
.x-news-hub>div:not(.x-tabs){display:flex;flex-direction:column;flex:1 1 auto!important;min-height:0}
.x-news-hub :deep(.weibo-card){display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.x-news-hub :deep(.weibo-card > :not(ol)){flex-shrink:0}
.x-news-hub :deep(.weibo-list){flex:1 1 auto!important;min-height:0;overflow-y:auto!important;overflow-x:hidden;scrollbar-width:thin}
/* 现代样式：跟随 modern 主题变量，分段胶囊选项卡 + 细分隔线 */
.x-news-hub{--x-line:var(--theme-line,rgba(15,20,25,.08));--x-soft:var(--theme-hover,rgba(15,23,42,.05));--x-accent:var(--theme-accent,#2563eb);--x-accent-soft:rgba(37,99,235,.12);--x-active-fg:#fff}
.x-news-hub.weibo-dark{--x-line:rgba(231,233,234,.14);--x-soft:rgba(255,255,255,.07);--x-accent:#e7e9ea;--x-accent-soft:rgba(231,233,234,.16);--x-active-fg:#0f1419}
.weibo-heading{padding-bottom:12px}

.x-logo{border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.14)}
.x-tabs{gap:2px;padding:3px;background:var(--x-soft);border-radius:999px;margin-bottom:12px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.x-tabs::-webkit-scrollbar{display:none}
.x-tabs button{padding:5px 11px;border-radius:999px;color:var(--v-muted);font-weight:500;white-space:nowrap;transition:background .16s,color .16s}
.x-tabs button:hover{color:var(--v-text);background:rgba(15,23,42,.06)}
.x-tabs button.active{background:var(--x-accent);color:var(--x-active-fg);font-weight:600;box-shadow:0 1px 3px rgba(15,23,42,.18)}
.x-news-hub.weibo-card :deep(.weibo-list){display:block}
.x-news-hub.weibo-card :deep(.weibo-list li){border-bottom:1px solid var(--x-line)}
.x-news-hub.weibo-card :deep(.weibo-list li:last-child){border-bottom:0}
.x-news-hub.weibo-card :deep(.weibo-list a){height:auto;min-height:0;padding:13px 4px;border-bottom:0;border-radius:10px}
.x-news-hub :deep(.weibo-card .x-tabs){background:var(--x-soft);border-radius:999px;padding:3px;border-bottom:0}
.x-news-hub :deep(.weibo-card .x-tabs button){border-radius:999px;padding:5px 11px;color:var(--v-muted)}
.x-news-hub :deep(.weibo-card .x-tabs button[aria-pressed="true"]){background:var(--x-accent-soft);color:var(--x-accent);box-shadow:none}
.x-news-hub :deep(.weibo-list a:hover){background:var(--x-soft)}
.x-news-hub :deep(.weibo-copy h3){font-weight:600}
.x-news-hub :deep(.weibo-rank){font-variant-numeric:tabular-nums;font-size:15px;font-weight:600}
.x-news-hub :deep(.weibo-node){border-radius:999px;padding:2px 7px;background:var(--x-soft)}
.x-news-hub :deep(.weibo-toolbar){border-bottom:0;padding:0 0 10px;letter-spacing:.02em}
.x-news-hub :deep(.weibo-card button:hover){color:var(--v-text);background:var(--x-soft)}
.x-hub-footer{padding:8px 0 12px}
.x-hub-switch{border:1px solid var(--x-line);background:var(--x-soft);padding:5px 12px;border-radius:999px;transition:background .16s,color .16s,border-color .16s}
.x-hub-switch:hover{background:var(--x-accent);color:var(--x-active-fg);border-color:transparent}
@media(max-width:700px){.weibo-card{padding:16px 16px 0}}
</style>
