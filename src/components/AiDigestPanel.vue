<template>
  <section v-if="digest" class="ai-digest-panel" :class="{ 'ai-digest-dark': dark }" aria-labelledby="ai-digest-heading">
    <header class="ai-digest-head">
      <div class="ai-digest-title">
        <span class="ai-digest-mark" aria-hidden="true">AI</span>
        <div class="ai-digest-copy">
          <h2 id="ai-digest-heading">今日速览 <span>DAILY DIGEST</span></h2>
          <p>{{ subtitle }}</p>
        </div>
      </div>
      <div class="ai-digest-meta">
        <span role="status">{{ status }}</span>
        <button type="button" :disabled="loading" @click="load(true)">{{ loading ? '更新中…' : '刷新' }}</button>
      </div>
    </header>
    <div class="ai-digest-body">
      <template v-if="digest.sections.length">
        <section v-for="(sec, index) in digest.sections" :key="index" class="ai-digest-sec">
          <h3>{{ sec.title }}</h3>
          <p>{{ sec.text }}</p>
        </section>
      </template>
      <p v-else class="ai-digest-text">{{ digest.text }}</p>
    </div>
    <footer class="ai-digest-foot">
      <span>由 AI 汇总当日头条，仅作导航参考</span>
      <span v-if="modelLabel">{{ modelLabel }}</span>
    </footer>
  </section>
  <section v-else-if="error" class="ai-digest-panel ai-digest-empty" :class="{ 'ai-digest-dark': dark }" aria-live="polite">
    <p class="ai-digest-text">今日速览这会儿没拉到，稍后会自动重试。下面的新闻与工具不受影响。</p>
  </section>
</template>
<script>
const CACHE_KEY = 'navigation-digest-v2';

export default {
  name: 'AiDigestPanel',
  props: { dark: Boolean },
  data: () => ({ digest: null, loading: false, error: false, controller: null, now: Date.now(), ticker: null }),
  computed: {
    status() {
      if (!this.digest?.generatedAt) return '';
      const date = new Date(this.digest.generatedAt);
      if (!Number.isFinite(date.getTime())) return '';
      const minutes = Math.max(0, Math.round((this.now - date.getTime()) / 60000));
      const relative = minutes < 1 ? '刚刚更新'
        : minutes < 60 ? `${minutes} 分钟前更新`
        : `${Math.floor(minutes / 60)} 小时前更新`;
      return minutes > 180 ? `${relative} · 数据可能未刷新` : relative;
    },
    subtitle() {
      const basedOn = this.digest?.basedOn;
      const count = this.digest?.sections?.length || 0;
      if (basedOn && count > 1) return `基于 ${basedOn} 条头条，按 ${count} 个板块汇总`;
      if (basedOn) return `基于 ${basedOn} 条头条自动汇总`;
      return '自动汇总今日头条';
    },
    modelLabel() {
      const model = this.digest?.model || '';
      if (!model) return '';
      const short = model.split('/').pop() || '';
      return short.replace(/-instruct.*$/, '').replace(/^@?cf-/, '');
    }
  },
  mounted() {
    this.load();
    this.ticker = setInterval(() => { this.now = Date.now(); }, 60000);
  },
  beforeUnmount() {
    this.controller?.abort();
    clearInterval(this.ticker);
  },
  methods: {
    normalize(value) {
      if (!value) return null;
      const sections = Array.isArray(value.sections)
        ? value.sections
            .filter(item => item && typeof item.title === 'string' && typeof item.text === 'string')
            .map(item => ({ title: item.title.trim(), text: item.text.trim() }))
            .filter(item => item.title && item.text.length >= 10)
            .slice(0, 20)
        : [];
      const text = typeof value.text === 'string' ? value.text.trim() : '';
      if (!sections.length && text.length < 12) return null;
      return {
        sections,
        text,
        basedOn: Number(value.basedOn) || 0,
        model: typeof value.model === 'string' ? value.model : '',
        generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : ''
      };
    },
    async load(force = false) {
      if (!force) {
        try {
          const cached = this.normalize(JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'));
          if (cached) this.digest = cached;
        } catch { /* 缓存可选 */ }
      }
      this.loading = true;
      this.error = false;
      this.controller?.abort();
      this.controller = new AbortController();
      const timeout = setTimeout(() => this.controller.abort(), 12000);
      try {
        const response = await fetch(`${process.env.BASE_URL}news.json`, { cache: 'no-cache', signal: this.controller.signal });
        if (!response.ok) throw new Error('digest request failed');
        const data = await response.json();
        const next = this.normalize(data.digest);
        if (next) {
          this.digest = next;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* 存储不可用不影响阅读 */ }
        } else if (force) {
          this.error = true;
        }
      } catch {
        this.error = true;
      } finally {
        clearTimeout(timeout);
        this.loading = false;
      }
    }
  }
};
</script>
<style scoped>
.ai-digest-panel{--ai-text:#26364c;--ai-muted:#7b8799;--ai-line:rgba(105,128,160,.18);--ai-accent:#e0703f;margin:18px 0 0;padding:18px 20px 16px;border:1px solid var(--ai-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--ai-text);min-width:0;box-sizing:border-box}
.ai-digest-dark{--ai-text:#e2e9f4;--ai-muted:#95a3b9;--ai-line:rgba(145,164,194,.2);--ai-accent:#f0906a;background:rgba(24,31,45,.92)}
.ai-digest-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:12px}
.ai-digest-title{display:flex;align-items:center;gap:11px;min-width:0}
.ai-digest-mark{display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:12px;background:rgba(241,118,77,.14);color:var(--ai-accent);font-size:12px;font-weight:700;letter-spacing:1px}
.ai-digest-copy{min-width:0}
.ai-digest-copy h2{margin:0;font-size:17px;font-weight:700;letter-spacing:.3px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.ai-digest-copy h2 span{font-size:10px;font-weight:500;letter-spacing:1.6px;color:var(--ai-muted)}
.ai-digest-copy p{margin:4px 0 0;font-size:11px;color:var(--ai-muted)}
.ai-digest-meta{display:flex;align-items:center;gap:10px;flex:none;font-size:11px;color:var(--ai-muted)}
.ai-digest-meta button{font:inherit;font-size:11px;cursor:pointer;border:0;border-radius:7px;padding:5px 9px;background:transparent;color:var(--ai-muted)}
.ai-digest-meta button:hover:not(:disabled){color:var(--ai-accent);background:rgba(241,118,77,.1)}
.ai-digest-meta button:disabled{cursor:default;opacity:.6}
.ai-digest-panel button:focus-visible{outline:2px solid var(--ai-accent);outline-offset:1px}
.ai-digest-text{margin:0;font-size:14px;line-height:1.95;color:var(--ai-text);white-space:pre-line;text-align:justify}
.ai-digest-empty .ai-digest-text{color:var(--ai-muted);font-size:13px;text-align:left}
.ai-digest-body{min-width:0}
.ai-digest-sec{min-width:0}
.ai-digest-sec+.ai-digest-sec{margin-top:14px}
.ai-digest-sec h3{margin:0 0 5px;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;letter-spacing:.2px;color:var(--ai-accent)}
.ai-digest-sec h3::before{content:'';flex:none;width:3px;height:12px;border-radius:2px;background:var(--ai-accent)}
.ai-digest-sec p{margin:0;font-size:13.5px;line-height:1.85;color:var(--ai-text);white-space:pre-line}
@media(min-width:900px){.ai-digest-body{display:grid;grid-template-columns:1fr 1fr;gap:16px 30px;align-items:start}.ai-digest-sec+.ai-digest-sec{margin-top:0}}
.ai-digest-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--ai-line);font-size:10px;color:var(--ai-muted)}
.ai-digest-foot span{min-width:0}
@media(max-width:700px){.ai-digest-panel{padding:14px;border-radius:14px}.ai-digest-text{font-size:13px;line-height:1.85;text-align:left}.ai-digest-sec p{font-size:13px;line-height:1.8}.ai-digest-head{margin-bottom:10px}.ai-digest-mark{width:34px;height:34px;border-radius:10px}.ai-digest-copy h2{font-size:15px}}
</style>
