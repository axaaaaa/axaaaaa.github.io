<template>
  <section class="news-panel" :class="{ 'news-dark': dark }" aria-labelledby="news-title">
    <header class="news-heading">
      <div class="news-brand"><span class="news-icon" aria-hidden="true">↗</span><div><h2 id="news-title">今日热点 <span>TECH DAILY</span></h2><p>让值得关注的新鲜事，先被你看见</p></div></div>
      <div class="news-actions"><span class="news-updated" role="status">{{ status }}</span><button type="button" @click="expanded = !expanded" :aria-expanded="expanded">{{ expanded ? '收起' : '展开' }}</button></div>
    </header>
    <template v-if="expanded">
      <div class="news-toolbar"><div class="news-filters" aria-label="资讯分类"><button v-for="filter in filters" :key="filter" type="button" :class="{ active: selected === filter }" :aria-pressed="selected === filter" @click="selected = filter; showAll = false">{{ filter }}</button></div><span>每3小时更新 · 点击阅读原文</span></div>
      <div v-if="loading && !items.length" class="news-empty" role="status">正在加载科技资讯…</div>
      <ol v-else-if="visible.length" class="news-grid">
        <li v-for="(item, index) in visible" :key="item.url"><a :href="item.url" target="_blank" rel="noopener noreferrer" :class="{'has-content-cover':Boolean(item.cover)}"><ContentCover :cover="item.cover" :source-key="item.source==='IT之家'?'ithome':'huggingface'" /><span class="news-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span><div class="news-copy"><h3>{{ item.title }}</h3><div class="news-meta"><span>{{ item.source }}</span><span>{{ formatDate(item.publishedAt) }}</span></div></div><span class="news-arrow" aria-hidden="true">↗</span></a></li>
      </ol>
      <div v-else class="news-empty">{{ error ? '资讯暂未刷新，请稍后重试。' : '此分类暂无资讯。' }} <button v-if="error" type="button" @click="loadNews">重试</button></div>
      <footer class="news-bottom"><span>只聚合标题与链接，内容来自原始发布方</span><button v-if="filtered.length > 6" type="button" @click="showAll = !showAll">{{ showAll ? '收起列表 ↑' : '更多资讯 ↓' }}</button></footer>
    </template>
  </section>
</template>
<script>
import ContentCover from './ContentCover.vue';
export default {
 components:{ContentCover},
  name: 'NewsHotspots',
  props: { dark: Boolean },
  data: () => ({ items: [], updatedAt: '', loading: false, error: false, expanded: true, selected: '全部', filters: ['全部', 'AI 前沿', '科技动态'], showAll: false, controller: null }),
  computed: {
    filtered() { return this.items.filter(item => this.selected === '全部' || item.category === this.selected); },
    visible() { return this.filtered.slice(0, this.showAll ? 24 : 6); },
    status() {
      if (this.error && this.items.length) return '刷新失败 · 显示上次资讯';
      if (!this.updatedAt) return '科技资讯';
      const stale = Date.now() - new Date(this.updatedAt).getTime() > 6 * 3600000;
      return `${stale ? '上次更新' : '更新于'} ${this.formatDate(this.updatedAt)}`;
    }
  },
  mounted() { this.loadNews(); },
  beforeUnmount() { this.controller?.abort(); },
  methods: {
    formatDate(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); },
    async loadNews() {
      this.loading = true; this.error = false;
      try { const cached = JSON.parse(localStorage.getItem('navigation-news-v1')); if (cached?.items?.length) this.accept(cached); } catch { /* 缓存可选 */ }
      this.controller = new AbortController();
      const timeout = setTimeout(() => this.controller.abort(), 12000);
      try {
        const response = await fetch(`${process.env.BASE_URL}news.json`, { cache: 'no-cache', signal: this.controller.signal });
        if (!response.ok) throw new Error('news request failed');
        const data = await response.json();
        this.accept(data);
        try { localStorage.setItem('navigation-news-v1', JSON.stringify(data)); } catch { /* 存储不可用不影响阅读 */ }
      } catch { this.error = true; } finally { clearTimeout(timeout); this.loading = false; }
    },
    accept(data) {
      if (!Array.isArray(data.items) || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('invalid news');
      this.items = data.items.filter(item => typeof item.title === 'string' && typeof item.source === 'string' && /^https?:\/\//i.test(item.url)).slice(0, 24);
      this.updatedAt = data.updatedAt;
    }
  }
};
</script>
<style scoped>
.news-panel{--news-bg:rgba(255,255,255,.86);--news-text:#26364c;--news-muted:#7b8799;--news-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--news-line);border-radius:18px;background:var(--news-bg);color:var(--news-text);overflow:hidden;box-shadow:0 6px 24px rgba(37,68,109,.04)}
.news-dark{--news-bg:rgba(24,31,45,.92);--news-text:#e2e9f4;--news-muted:#95a3b9;--news-line:rgba(145,164,194,.17)}
.news-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px 16px}.news-brand{display:flex;align-items:center;gap:12px}.news-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#ff915b,#f15f53);color:white;font-size:27px}.news-brand h2{margin:0;font-size:18px;font-weight:700;letter-spacing:.5px}.news-brand h2 span{margin-left:8px;font-size:10px;letter-spacing:1.8px;color:var(--news-muted);font-weight:500}.news-brand p{margin:5px 0 0;font-size:12px;color:var(--news-muted)}.news-actions{display:flex;gap:12px;align-items:center}.news-updated{font-size:11px;color:var(--news-muted)}.news-panel button{font:inherit;cursor:pointer;border:0;background:transparent;color:var(--news-muted);font-size:12px;padding:6px 9px;border-radius:7px}.news-panel button:hover{color:#ec7957;background:rgba(241,118,77,.08)}.news-panel button:focus-visible,.news-panel a:focus-visible{outline:2px solid #ec7957;outline-offset:-2px}.news-toolbar{display:flex;justify-content:space-between;align-items:center;margin:0 24px;padding-bottom:12px;border-bottom:1px solid var(--news-line);gap:12px}.news-toolbar>span{font-size:11px;color:var(--news-muted)}.news-filters{display:flex;gap:5px;flex-wrap:wrap}.news-filters button.active{color:#e6764f;background:rgba(241,118,77,.11);font-weight:600}.news-grid{display:grid;grid-template-columns:1fr 1fr;list-style:none;padding:4px 18px;margin:0;gap:0 26px}.news-grid li{min-width:0}.news-grid a{display:flex;align-items:center;gap:12px;padding:15px 7px;border-bottom:1px solid var(--news-line);text-decoration:none;color:inherit;border-radius:7px;min-height:75px;box-sizing:border-box}.news-grid a:hover{background:rgba(127,145,171,.06)}.news-rank{font-size:17px;color:#a3adbb;font-weight:700;font-variant-numeric:tabular-nums}.news-rank.top{color:#ef805a}.news-copy{flex:1;min-width:0}.news-copy h3{font-size:13px;line-height:1.65;font-weight:500;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.news-meta{display:flex;gap:12px;margin-top:6px;color:var(--news-muted);font-size:10px}.news-arrow{color:var(--news-muted);font-size:15px}.news-bottom{display:flex;justify-content:space-between;align-items:center;padding:10px 24px 13px;min-height:22px}.news-bottom>span{font-size:10px;color:var(--news-muted)}.news-empty{padding:30px 24px;text-align:center;color:var(--news-muted);font-size:13px}
@media(max-width:700px){.news-heading{padding:16px;align-items:flex-start}.news-brand h2 span{display:none}.news-actions{flex-direction:column;align-items:flex-end;gap:2px}.news-updated{font-size:10px}.news-toolbar{margin:0 16px}.news-toolbar>span{display:none}.news-grid{grid-template-columns:1fr;padding:0 10px;gap:0}.news-grid a{min-height:72px}.news-bottom{padding:12px 16px}.news-bottom>span{max-width:70%;line-height:1.6}}

.news-grid a.has-content-cover{flex-wrap:wrap}
</style>
