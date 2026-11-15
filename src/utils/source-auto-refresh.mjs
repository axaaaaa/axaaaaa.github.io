// One timer per mounted feed, with teardown and visibility-aware refresh.
export const sourceNames = new Set(['SourceSyncStatus', 'SourceNewsCard', 'GithubTrending', 'V2exHot', 'IthomeNews', 'NewsHotspotHub', 'XHotTweets', 'XGlobalTweets', 'XGlobalEvents', 'XWordsTopics', 'XArticles', 'MarketOverview', 'CurrencyConverter', 'HistoryToday']);
export function sourceAutoRefreshMixin() {
 const active = new WeakMap();
 return {
  mounted() {
   if (!sourceNames.has(this.$options.name) || typeof this.load !== 'function') return;
   let last = Date.now();
   const refresh = () => {
    if (document.hidden || this.loading || Date.now() - last < 60000) return;
    last = Date.now();
    Promise.resolve(this.load(true)).catch(() => {});
   };
   const timer = setInterval(refresh, 5 * 60 * 1000);
   document.addEventListener('visibilitychange', refresh);
   active.set(this, () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); });
  },
  beforeUnmount() { active.get(this)?.(); active.delete(this); }
 };
}
