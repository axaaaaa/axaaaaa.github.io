<template>
  <section class="github-trending" :class="{ 'github-dark': dark }" aria-labelledby="github-card-title">
    <header class="github-heading"><div><h2 id="github-card-title"><span aria-hidden="true"><img class="github-official-icon" :src="sourceIcon" alt="" width="24" height="24" referrerpolicy="no-referrer" /></span> GitHub 热点</h2></div><div class="github-heading-meta"><span role="status">{{ status }}</span><a :href="originalUrl" target="_blank" rel="noopener noreferrer">{{ originalLabel }}</a></div></header>
    <div class="github-periods" aria-label="GitHub 热门项目周期">
      <button v-for="tab in tabs" :key="tab.value" type="button" :class="{ active: period === tab.value }" :aria-pressed="period === tab.value" @click="period = tab.value; showAll = false">{{ tab.label }}</button>
    </div>
    <ol v-if="visible.length" class="github-list">
      <li v-for="(repo,index) in visible" :key="repo.url"><a :href="repo.url" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(repo.cover)}"><ContentCover :cover="repo.cover" :source-key="'github'" /><span class="github-rank">{{ index+1 }}</span><div class="github-copy"><h3>{{ repo.name }}</h3><p v-if="repo.descriptionZh || repo.description" :title="repo.descriptionZh ? '机器翻译 · 原文：' + repo.description : repo.description">{{ repo.descriptionZh || repo.description }}</p><div class="github-meta"><span v-if="repo.language">● {{ repo.language }}</span><span v-if="repo.stars">☆ {{ repo.stars }}</span><span v-if="repo.growth" class="github-growth">↗ {{ repo.growthZh || repo.growth }}</span><span v-if="repo.metaText">{{ repo.metaText }}</span></div></div></a></li>
    </ol>
    <div v-else class="github-empty">{{ loading ? '正在加载 GitHub 热门项目…' : '此周期暂未获取到项目，请稍后重试。' }}<button v-if="!loading" type="button" @click="load">重试</button></div>
    <footer class="github-footer"><div class="github-footer-actions"><button type="button" class="github-switch" :title="`切换到${nextLabel}`" @click="cycleTab">切换：{{ nextLabel }} →</button><button v-if="items.length > 6" type="button" data-source-more :aria-expanded="showAll" @click="showAll=!showAll">{{ showAll ? '收起项目 ↑' : '更多项目 ↓' }}</button></div></footer>
    </section>
</template>
<script>
import { officialSourceIcon } from "../utils/source-icons.mjs";
import ContentCover from './ContentCover.vue';
export default {
 components:{ContentCover},
  name: 'GithubTrending',
  props: { dark: Boolean },
  data: () => ({sourceIcon:officialSourceIcon('github'), periods: {}, period: 'daily', showAll: false, loading: false, error: false, controller: null, tabs: [{value:'daily',label:'每日热门项目'},{value:'weekly',label:'每周热门项目'},{value:'monthly',label:'本月热门项目'},{value:'hellogithub',label:'HelloGitHub'},{value:'oschina',label:'开源中国'}] }),
  computed: {
    current() { return this.periods[this.period] || {}; },
    items() { return this.current.items || []; },
    visible() { return this.items.slice(0, this.showAll ? 24 : 6); },
    status() { if (this.error && this.items.length) return '刷新失败，显示缓存'; const time = new Date(this.current.updatedAt); if (!Number.isFinite(time.getTime())) return '等待更新'; return time.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}); },
    originalUrl() { if (this.period === 'hellogithub') return 'https://hellogithub.com/'; if (this.period === 'oschina') return 'https://www.oschina.net/'; return `https://github.com/trending?since=${this.period}`; },
    originalLabel() { return ['hellogithub','oschina'].includes(this.period) ? '访问原站 ↗' : 'GitHub 原榜 ↗'; },
    nextLabel() { const index = this.tabs.findIndex(tab => tab.value === this.period); return this.tabs[(index + 1) % this.tabs.length].label; }
  },
  mounted() { this.load(); },
  beforeUnmount() { this.controller?.abort(); },
  methods: {
    cycleTab() { const index = this.tabs.findIndex(tab => tab.value === this.period); this.period = this.tabs[(index + 1) % this.tabs.length].value; this.showAll = false; },
    accept(data) {
      if (!data?.periods || typeof data.periods !== 'object') throw Error('invalid periods');
      const periods = {};
      for (const period of ['daily','weekly','monthly']) { const entry = data.periods[period]; if (!Array.isArray(entry?.items) || !Number.isFinite(Date.parse(entry.updatedAt))) continue; periods[period] = {updatedAt:entry.updatedAt, items:entry.items.filter(item => typeof item.name === 'string' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(item.url)).slice(0,24)}; }
      if (!Object.keys(periods).length) throw Error('empty periods');
      this.periods = periods;
    },
    acceptExtra(data) {
      const sources = data?.sources;
      if (!sources || typeof sources !== 'object') throw Error('invalid extra');
      const mapped = {};
      for (const key of ['hellogithub','oschina']) {
        const entry = sources[key];
        if (!Array.isArray(entry?.items) || !Number.isFinite(Date.parse(entry.updatedAt))) continue;
        const items = entry.items.filter(item => typeof item.title === 'string' && /^https?:\/\//i.test(item.url)).slice(0,24).map(item => ({name:item.title, url:item.url, metaText:this.fmtMeta(item.meta)}));
        if (items.length) mapped[key] = {updatedAt:entry.updatedAt, items};
      }
      if (!Object.keys(mapped).length) throw Error('empty extra');
      this.periods = {...this.periods, ...mapped};
    },
    fmtMeta(value) { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}) : ''; },
    async load() {
      this.loading = true; this.error = false;
      try { const data=JSON.parse(localStorage.getItem('github-trending-v1')); if(data) this.accept(data); } catch { /* optional cache */ }
      this.controller = new AbortController(); const timeout=setTimeout(()=>this.controller.abort(),12000);
      try {
        const [trending, extra] = await Promise.all([
          fetch(`${process.env.BASE_URL}github-trending.json`,{cache:'no-cache',signal:this.controller.signal}),
          fetch(`${process.env.BASE_URL}extra-hotspots.json`,{cache:'no-cache',signal:this.controller.signal})
        ]);
        let ok = false;
        if (trending.ok) { try { const data = await trending.json(); this.accept(data); localStorage.setItem('github-trending-v1', JSON.stringify(data)); ok = true; } catch { /* optional */ } }
        if (extra.ok) { try { this.acceptExtra(await extra.json()); ok = true; } catch { /* optional */ } }
        if (!ok) throw Error('request failed');
      } catch { this.error=true; } finally {clearTimeout(timeout);this.loading=false;}
    }
  }
};
</script>
<style scoped>
.github-trending{--news-text:#26364c;--news-muted:#7b8799;--news-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--news-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--news-text);box-shadow:0 6px 24px rgba(37,68,109,.04);overflow:hidden}
.github-dark{--news-text:#e2e9f4;--news-muted:#95a3b9;--news-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}
.github-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2px 8px;padding:6px 0 18px}.github-heading>div:first-child{min-width:0;flex:0 1 auto}.github-heading h2{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.github-heading-meta{flex:0 0 auto;display:flex;align-items:center;gap:6px;font-size:10px;line-height:1.4;color:inherit;opacity:.72;margin-inline-start:auto;white-space:nowrap}.github-heading-meta a{color:inherit;text-decoration:none;flex-shrink:0}.github-heading h2{margin:0;font-size:18px;line-height:1.5;display:flex;align-items:center;gap:7px}.github-official-icon{display:block;width:24px;height:24px}.github-dark .github-official-icon{filter:brightness(0) invert(1)}.github-heading h2 span{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:10px;background:rgba(112,97,200,.12);color:#8874cf}.github-heading p{margin:6px 0 0;font-size:12px;color:var(--news-muted)}
.github-trending button{font:inherit;cursor:pointer;border:0;background:transparent;color:var(--news-muted);font-size:12px;padding:6px 9px;border-radius:7px}.github-trending button:hover{color:#e6764f;background:rgba(241,118,77,.08)}.github-trending button:focus-visible{outline:2px solid #ec7957;outline-offset:2px}
.github-trending{padding:14px 24px 0}.github-periods{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.github-periods button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}.github-list{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin:0;padding:0;list-style:none}.github-list li{min-width:0}.github-list a{display:flex;gap:12px;text-decoration:none;color:var(--news-text);border-bottom:1px solid var(--news-line);padding:15px 5px;border-radius:7px;min-height:118px;box-sizing:border-box}.github-list a:hover{background:rgba(127,145,171,.06)}.github-rank{font-size:17px;font-weight:700;color:#ef805a}.github-copy{min-width:0;flex:1}.github-copy h3{margin:0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}.github-copy p{font-size:12px;color:var(--news-muted);line-height:1.65;margin:6px 0;white-space:normal;overflow-wrap:anywhere}.github-meta{display:flex;gap:10px;flex-wrap:wrap;color:var(--news-muted);font-size:10px}.github-growth{color:#40966c}.github-footer{display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:12px;padding:12px 0;color:var(--news-muted);font-size:10px}.github-footer-actions{display:flex;align-items:center;gap:6px;margin-inline-start:auto;flex-shrink:0}.github-switch{white-space:nowrap}.github-footer button{flex-shrink:0}.github-empty{padding:24px;text-align:center;font-size:12px;color:var(--news-muted)}.github-trending a:focus-visible{outline:2px solid #ec7957;outline-offset:2px}@media(max-width:700px){.github-trending{padding:12px 16px 0}.github-list{grid-template-columns:1fr}.github-periods{gap:3px}.github-periods button{padding:6px!important;font-size:11px!important}.github-periods a{font-size:10px}.github-footer{line-height:1.7}}

.github-list a.has-content-cover{flex-wrap:wrap}

.github-trending:not(.github-dark) {
  --news-text: #f3f6ff;
  --news-muted: #c9d6ff;
  --news-line: #5577c9;
  border: 1px solid #7897ee;
  border-radius: 0;
  background: #101e76;
  box-shadow: none;
}
.github-trending:not(.github-dark) .github-heading {
  margin-bottom: 10px;
  padding: 6px 9px;
  color: #101e76;
  background: #bfceff;
}
.github-trending:not(.github-dark) .github-heading h2, .github-trending:not(.github-dark) .github-copy h3, .github-trending:not(.github-dark) .github-rank, .github-trending:not(.github-dark) .github-meta, .github-trending:not(.github-dark) .github-periods button {
  font-family: Consolas, "Courier New", "Microsoft YaHei", monospace;
}
.github-trending:not(.github-dark) .github-heading p { color: #283e7c; }
.github-trending:not(.github-dark) .github-heading h2 span { border-radius: 0; background: transparent; }
.github-trending:not(.github-dark) .github-dark .github-official-icon { filter: none; }
.github-trending:not(.github-dark) .github-periods button, .github-trending:not(.github-dark) .github-footer button, .github-trending:not(.github-dark) .github-empty button {
  border: 1px solid #7897ee;
  border-radius: 0;
}
.github-trending:not(.github-dark) button:hover, .github-trending:not(.github-dark) .github-periods button.active {
  color: #0b195a;
  background: #9df0ff;
}
.github-trending:not(.github-dark) .github-list a { border-radius: 0; }
.github-trending:not(.github-dark) .github-list a:hover { background: #172e93; }
.github-trending:not(.github-dark) .github-rank, .github-trending:not(.github-dark) .github-growth { color: #9df0ff; }
.github-trending:not(.github-dark) .github-footer { border-top: 0; }
.github-trending:not(.github-dark) :is(a,button):focus-visible { outline-color: #9df0ff; }

.github-list li:last-child a { border-bottom: 0; }
/* 固定列表行高，避免切换选项卡时卡片高度变化连带同排卡片一起伸缩 */
.github-list { grid-auto-rows: 64px !important; }
.github-list a { height: 100%; min-height: 0 !important; overflow: hidden; padding: 5px 4px; flex-wrap: nowrap !important; }
.github-list :deep(.content-cover) { display: none; }
.github-copy h3 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.github-copy p { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; margin: 2px 0; }
</style>
