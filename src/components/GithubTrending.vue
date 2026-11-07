<template>
  <section class="github-trending" :class="{ 'github-dark': dark }" aria-labelledby="github-card-title">
    <header class="github-heading"><div><h2 id="github-card-title"><span aria-hidden="true"><img class="github-official-icon" :src="sourceIcon" alt="" width="24" height="24" referrerpolicy="no-referrer" /></span> GitHub 热点</h2><p>发现值得关注的开源项目</p></div></header>
    <div class="github-periods" aria-label="GitHub 热门项目周期">
      <button v-for="tab in tabs" :key="tab.value" type="button" :class="{ active: period === tab.value }" :aria-pressed="period === tab.value" @click="period = tab.value; showAll = false">{{ tab.label }}</button>
      <a :href="`https://github.com/trending?since=${period}`" target="_blank" rel="noopener noreferrer">GitHub 原榜 ↗</a>
    </div>
    <p class="github-status" role="status">{{ status }} · 按 GitHub Trending 原榜顺序展示</p>
    <ol v-if="visible.length" class="github-list">
      <li v-for="(repo,index) in visible" :key="repo.url"><a :href="repo.url" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(repo.cover)}"><ContentCover :cover="repo.cover" :source-key="'github'" /><span class="github-rank">{{ index+1 }}</span><div class="github-copy"><h3>{{ repo.name }}</h3><p :title="repo.descriptionZh ? '机器翻译 · 原文：' + repo.description : repo.description">{{ repo.descriptionZh || repo.description || '该项目暂未提供简介' }}</p><div class="github-meta"><span v-if="repo.language">● {{ repo.language }}</span><span v-if="repo.stars">☆ {{ repo.stars }}</span><span v-if="repo.growth" class="github-growth">↗ {{ repo.growthZh || repo.growth }}</span></div></div></a></li>
    </ol>
    <div v-else class="github-empty">{{ loading ? '正在加载 GitHub 热门项目…' : '此周期暂未获取到项目，请稍后重试。' }}<button v-if="!loading" type="button" @click="load">重试</button></div>
    <footer class="github-footer"><span>每日 / 每周 / 本月对应 GitHub 的 today / this week / this month 榜单</span><button v-if="items.length > 6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{ showAll ? '收起项目 ↑' : '更多项目 ↓' }}</button></footer>
    </section>
</template>
<script>
import { officialSourceIcon } from "../utils/source-icons.mjs";
import ContentCover from './ContentCover.vue';
export default {
 components:{ContentCover},
  name: 'GithubTrending',
  props: { dark: Boolean },
  data: () => ({sourceIcon:officialSourceIcon('github'), periods: {}, period: 'daily', showAll: false, loading: false, error: false, controller: null, tabs: [{value:'daily',label:'每日热门项目'},{value:'weekly',label:'每周热门项目'},{value:'monthly',label:'本月热门项目'}] }),
  computed: {
    current() { return this.periods[this.period] || {}; },
    items() { return this.current.items || []; },
    visible() { return this.items.slice(0, this.showAll ? 24 : 6); },
    status() { if (this.error && this.items.length) return '刷新失败，显示缓存'; const time = new Date(this.current.updatedAt); if (!Number.isFinite(time.getTime())) return '等待更新'; return `${Date.now()-time.getTime()>21600000?'上次更新':'更新于'} ${time.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}`; }
  },
  mounted() { this.load(); },
  beforeUnmount() { this.controller?.abort(); },
  methods: {
    accept(data) {
      if (!data?.periods || typeof data.periods !== 'object') throw Error('invalid periods');
      const periods = {};
      for (const period of ['daily','weekly','monthly']) { const entry = data.periods[period]; if (!Array.isArray(entry?.items) || !Number.isFinite(Date.parse(entry.updatedAt))) continue; periods[period] = {updatedAt:entry.updatedAt, items:entry.items.filter(item => typeof item.name === 'string' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(item.url)).slice(0,24)}; }
      if (!Object.keys(periods).length) throw Error('empty periods');
      this.periods = periods;
    },
    async load() {
      this.loading = true; this.error = false;
      try { const data=JSON.parse(localStorage.getItem('github-trending-v1')); if(data) this.accept(data); } catch { /* optional cache */ }
      this.controller = new AbortController(); const timeout=setTimeout(()=>this.controller.abort(),12000);
      try { const r=await fetch(`${process.env.BASE_URL}github-trending.json`,{cache:'no-cache',signal:this.controller.signal}); if(!r.ok) throw Error('request failed'); const data=await r.json(); this.accept(data); try{localStorage.setItem('github-trending-v1',JSON.stringify(data));}catch{/* optional storage */} } catch { this.error=true; } finally {clearTimeout(timeout);this.loading=false;}
    }
  }
};
</script>
<style scoped>
.github-trending{--news-text:#26364c;--news-muted:#7b8799;--news-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--news-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--news-text);box-shadow:0 6px 24px rgba(37,68,109,.04);overflow:hidden}
.github-dark{--news-text:#e2e9f4;--news-muted:#95a3b9;--news-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}
.github-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 0 18px}.github-heading h2{margin:0;font-size:18px;line-height:1.5}.github-official-icon{display:block;width:24px;height:24px}.github-dark .github-official-icon{filter:brightness(0) invert(1)}.github-heading h2 span{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:10px;margin-right:7px;background:rgba(112,97,200,.12);color:#8874cf}.github-heading p{margin:6px 0 0;font-size:12px;color:var(--news-muted)}
.github-trending button{font:inherit;cursor:pointer;border:0;background:transparent;color:var(--news-muted);font-size:12px;padding:6px 9px;border-radius:7px}.github-trending button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.github-trending button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}
.github-trending{padding:14px 24px 0}.github-periods{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.github-periods button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}.github-periods a{margin-left:auto;text-decoration:none;color:var(--news-muted);font-size:11px}.github-status{font-size:10px;color:var(--news-muted);margin:12px 0}.github-list{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin:0;padding:0;list-style:none}.github-list li{min-width:0}.github-list a{display:flex;gap:12px;text-decoration:none;color:var(--news-text);border-bottom:1px solid var(--news-line);padding:15px 5px;border-radius:7px;min-height:118px;box-sizing:border-box}.github-list a:hover{background:rgba(127,145,171,.06)}.github-rank{font-size:17px;font-weight:700;color:#ef805a}.github-copy{min-width:0;flex:1}.github-copy h3{margin:0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}.github-copy p{font-size:12px;color:var(--news-muted);line-height:1.65;margin:6px 0;white-space:normal;overflow-wrap:anywhere}.github-meta{display:flex;gap:10px;flex-wrap:wrap;color:var(--news-muted);font-size:10px}.github-growth{color:#40966c}.github-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;color:var(--news-muted);font-size:10px}.github-footer>span{flex:1}.github-footer button{flex-shrink:0}.github-empty{padding:24px;text-align:center;font-size:12px;color:var(--news-muted)}.github-trending a:focus-visible{outline:2px solid #ec7957;outline-offset:2px}@media(max-width:700px){.github-trending{padding:12px 16px 0}.github-list{grid-template-columns:1fr}.github-periods{gap:3px}.github-periods button{padding:6px!important;font-size:11px!important}.github-periods a{font-size:10px}.github-footer{line-height:1.7}}

.github-list a.has-content-cover{flex-wrap:wrap}
</style>
