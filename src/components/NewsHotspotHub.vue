<template>
  <section class="source-news-card" :class="{ 'source-news-dark': dark }" aria-labelledby="source-title-news-hotspot">
    <header class="source-heading">
      <div>
        <h2 id="source-title-news-hotspot"><img :src="activeIcon" alt="" width="24" height="24" referrerpolicy="no-referrer" />新闻热搜</h2>
      </div>
      <div class="source-heading-meta"><span role="status">{{ status }}</span><a :href="active.url" target="_blank" rel="noopener noreferrer" title="访问原站" aria-label="访问原站">原站↗</a></div>
    </header>
    <nav class="source-tabs" aria-label="新闻热搜来源"><button v-for="tab in tabs" :key="tab.id" type="button" :aria-pressed="activeTab === tab.id" @click="selectTab(tab.id)"><img class="source-tab-brand-icon" :src="tab.icon" alt="" width="16" height="16" />{{ tab.label }}</button></nav>
    <ol v-if="visible.length" class="source-list"><li v-for="(item, index) in visible" :key="item.url"><a :href="item.url" target="_blank" rel="noopener noreferrer"><span class="source-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span><div class="source-copy"><h3 :class="{ 'news-recent': isRecent(item) }" :title="item.title">{{ item.title }}</h3><p v-if="item.meta" :title="item.meta">{{ item.meta }}</p></div></a></li></ol>
    <div v-else class="source-empty">{{ loading ? '正在加载…' : '此来源当前未获取到内容，可通过上方入口访问原站。' }}<button v-if="!loading" type="button" @click="load(true)">重试</button></div>
    <footer><span>{{ active.footer }}</span><div class="source-footer-actions"><button type="button" class="source-switch" :title="`切换到${nextLabel}`" @click="cycleTab">切换：{{ nextLabel }} →</button><button v-if="items.length > 6" type="button" data-source-more :aria-expanded="showAll" @click="showAll = !showAll">{{ showAll ? '收起话题 ↑' : '查看更多 ↓' }}</button></div></footer>
  </section>
</template>
<script>
import { officialSourceIcon } from '../utils/source-icons.mjs';
import { isRecentNews } from '../utils/news-recency.mjs';
import { loadExtraHotspots, cachedExtraHotspots } from '../utils/extra-hotspots.mjs';
const sources = {
  qq: { label: '腾讯新闻', kind: '热点榜', footer: '热点榜 · 每小时获取', url: 'https://news.qq.com/' },
  netease: { label: '网易新闻', kind: '最新资讯 · 非热度排行', footer: '最新资讯 · 每小时获取', url: 'https://news.163.com/' },
  baidu: { label: '百度热搜', kind: '实时热搜榜', footer: '实时热搜榜 · 每小时获取', url: 'https://top.baidu.com/board?tab=realtime' },
  weibo: { label: '微博热搜', kind: '发现正在发生的热门话题', footer: '来自微博热搜榜 · 每3小时更新', url: 'https://s.weibo.com/top/summary' },
  tieba: { label: '百度贴吧', kind: '热议话题榜', footer: '热议话题榜 · 每小时获取', url: 'https://tieba.baidu.com/' },
  toutiao: { label: '今日头条', kind: '热门话题', footer: '热门话题 · 每小时获取', url: 'https://www.toutiao.com/' },
  thepaper: { label: '澎湃热榜', kind: '澎湃新闻热门排行', footer: '澎湃热榜 · 每小时获取', url: 'https://www.thepaper.cn/' }
};
const weiboCacheKey = 'navigation-weibo-v1';
export default {
  name: 'NewsHotspotHub', props: { dark: Boolean },
  data: () => ({ activeTab: 'qq', extra: null, extraError: false, extraLoading: false, weibo: [], weiboUpdatedAt: '', weiboError: false, weiboLoading: false, weiboController: null, showAll: false }),
  computed: {
    tabs() { return Object.entries(sources).map(([id, source]) => ({ id, label: source.label, icon: officialSourceIcon(id) })); },
    active() { return sources[this.activeTab]; },
    nextLabel() { const ids = Object.keys(sources); return sources[ids[(ids.indexOf(this.activeTab) + 1) % ids.length]].label; },
    activeIcon() { return officialSourceIcon(this.activeTab); },
    items() {
      if (this.activeTab === 'weibo') return this.weibo;
      const list = this.extra?.sources?.[this.activeTab]?.items;
      if (!Array.isArray(list)) return [];
      return list.filter(item => typeof item.title === 'string' && /^https?:\/\//i.test(item.url)).map(item => ({ title: item.title, url: item.url, meta: item.meta || '' }));
    },
    visible() { return this.items.slice(0, this.showAll ? 30 : 6); },
    loading() { return this.extraLoading || this.weiboLoading; },
    status() {
      if (this.activeTab === 'weibo') {
        if (this.weiboError) return this.weibo.length ? '刷新失败 · 显示缓存' : '来源暂不可用';
        if (!this.weiboUpdatedAt) return '等待更新';
        return this.formatStamp(this.weiboUpdatedAt);
      }
      const source = this.extra?.sources?.[this.activeTab];
      const updatedAt = source?.updatedAt || '';
      if (source?.collection?.status === 'stale' || source?.collection?.status === 'unavailable') return `采集暂缓 · 保留快照 ${this.formatStamp(updatedAt)}`.trim();
      if (this.extraError) return updatedAt ? '刷新失败 · 显示缓存' : '来源暂不可用';
      if (!updatedAt) return '等待更新';
      return this.formatStamp(updatedAt);
    }
  },
  mounted() { this.load(); }, beforeUnmount() { this.weiboController?.abort(); },
  methods: {
    isRecent(item) { return isRecentNews(item?.meta || ''); },
    formatStamp(value) { const date = new Date(value); if (!Number.isFinite(date.getTime())) return ''; return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); },
    selectTab(id) { this.activeTab = id; this.showAll = false; },
    cycleTab() { const ids = Object.keys(sources); this.selectTab(ids[(ids.indexOf(this.activeTab) + 1) % ids.length]); },
    validWeiboUrl(topic) { try { const url = new URL(topic.url); return url.origin === 'https://s.weibo.com' && url.pathname === '/weibo' && url.searchParams.get('q') === topic.title; } catch { return false; } },
    acceptWeibo(data) {
      if (!Array.isArray(data?.items) || !Number.isFinite(Date.parse(data.updatedAt))) throw Error('invalid data');
      const items = data.items.filter(topic => Number.isInteger(topic.rank) && topic.rank > 0 && typeof topic.title === 'string' && this.validWeiboUrl(topic)).slice(0, 30);
      if (!items.length) throw Error('empty data');
      this.weibo = items.map(topic => ({ title: topic.title, url: topic.url, meta: [topic.tag, `热度 ${Number(topic.heat) >= 10000 ? `${(Number(topic.heat) / 10000).toFixed(1)}万` : String(topic.heat || 0)}`].filter(Boolean).join(' · ') }));
      this.weiboUpdatedAt = data.updatedAt;
    },
    async load(force = false) { await Promise.all([this.loadExtra(force), this.loadWeibo()]); },
    async loadExtra(force = false) {
      this.extraLoading = true;
      this.extraError = false;
      try { this.extra = cachedExtraHotspots() || this.extra; } catch { /* optional cache */ }
      try { this.extra = await loadExtraHotspots(force); } catch { this.extraError = true; } finally { this.extraLoading = false; }
    },
    async loadWeibo() {
      this.weiboLoading = true;
      this.weiboError = false;
      try { const cached = JSON.parse(localStorage.getItem(weiboCacheKey)); if (cached) this.acceptWeibo(cached); } catch { /* optional cache */ }
      this.weiboController?.abort();
      this.weiboController = new AbortController();
      const timeout = setTimeout(() => this.weiboController.abort(), 12000);
      try {
        const response = await fetch(`${process.env.BASE_URL}weibo-hot.json`, { cache: 'no-cache', signal: this.weiboController.signal });
        if (!response.ok) throw Error('request failed');
        const data = await response.json();
        this.acceptWeibo(data);
        try { localStorage.setItem(weiboCacheKey, JSON.stringify(data)); } catch { /* optional storage */ }
      } catch { this.weiboError = true; } finally { clearTimeout(timeout); this.weiboLoading = false; }
    }
  }
};
</script>
<style scoped>
.source-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px}.source-tabs button{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border:1px solid var(--s-line)}.source-tab-brand-icon{flex:none;width:16px;height:16px;object-fit:contain;background:#fff;border-radius:3px;padding:1px;box-sizing:border-box}.source-tabs button[aria-pressed="true"]{color:var(--s-text);background:rgba(127,145,171,.14);font-weight:600}

.source-news-card{--s-text:#26364c;--s-muted:#7b8799;--s-line:rgba(105,128,160,.15);border:1px solid var(--s-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--s-text);padding:16px 16px 0;box-sizing:border-box;overflow:hidden}.source-news-dark{--s-text:#e2e9f4;--s-muted:#95a3b9;--s-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.source-heading{padding-bottom:10px;display:flex;flex-wrap:nowrap;align-items:center;justify-content:space-between;column-gap:4px}.source-heading>div:first-child{min-width:0;flex:1 1 auto}.source-heading-meta{flex:0 0 auto;display:flex;align-items:center;gap:4px;font-size:10px;line-height:1.4;color:var(--s-muted);margin-inline-start:auto;white-space:nowrap}.source-heading-meta a{color:inherit;text-decoration:none;flex-shrink:0}.source-heading h2{display:flex;gap:6px;align-items:center;margin:0;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:16px}.source-heading img{object-fit:contain;flex-shrink:0;border-radius:5px}.source-list{list-style:none;padding:0;margin:0}.source-list li{min-width:0}.source-list a{display:flex;gap:8px;text-decoration:none;color:inherit;padding:12px 2px;border-bottom:1px solid var(--s-line);border-radius:6px;min-height:68px;box-sizing:border-box;align-items:center}.source-list a:hover{background:rgba(127,145,171,.05)}.source-rank{font-size:15px;font-weight:600;color:var(--s-muted);flex-shrink:0}.source-rank.top{color:#ef805a}.source-copy{min-width:0;flex:1}.source-copy h3{font-size:12px;line-height:1.55;font-weight:500;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.source-copy p{font-size:10px;color:var(--s-muted);margin:6px 0 0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;padding:10px 0;font-size:10px;color:var(--s-muted);line-height:1.6}footer span{min-width:0}.source-footer-actions{display:flex;align-items:center;gap:4px;margin-inline-start:auto;flex-shrink:0}.source-switch{white-space:nowrap}button{font:inherit;font-size:11px;cursor:pointer;border:0;border-radius:6px;padding:5px 7px;background:transparent;color:var(--s-muted);flex-shrink:0}button:hover{background:rgba(127,145,171,.06)}a:focus-visible,button:focus-visible{outline:2px solid #43898d;outline-offset:2px}.source-empty{font-size:12px;color:var(--s-muted);text-align:center;padding:25px 0}@media(max-width:768px){.source-copy h3{font-size:13px;line-height:1.65}}.source-news-card .source-copy h3.news-recent{color:#d93a3a}.source-news-dark .source-copy h3.news-recent{color:#ff7b72}
</style>
