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
        <button v-if="speechReady" type="button" class="ai-digest-speak" :aria-pressed="String(speaking)" @click="toggleSpeech">{{ speaking ? '停止朗读' : '朗读' }}</button>
        <button type="button" :disabled="loading" @click="load(true)">{{ loading ? '更新中…' : '刷新' }}</button>
      </div>
    </header>
    <div class="ai-digest-body">
      <template v-if="digest.sections.length">
        <section v-for="(sec, index) in digest.sections" :key="index" class="ai-digest-sec" :class="{ 'is-speaking': speakingIndex === index }">
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
// 朗读前把 emoji 剥掉，否则语音引擎会把每个表情念成「表情」或直接卡顿。
// 拆成两条正则：变体选择符（U+FE0F）与零宽连接符（U+200D）单独处理，
// 否则 eslint 的 no-misleading-character-class 会判定字符类里藏了组合字符。
const SPEECH_EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
const SPEECH_JOINER = /\uFE0F|\u200D/g;

export default {
  name: 'AiDigestPanel',
  props: { dark: Boolean },
  data: () => ({
    digest: null, loading: false, error: false, controller: null,
    now: Date.now(), ticker: null,
    speechReady: false, speaking: false, speakingIndex: -1, speechToken: 0, speechVoice: null
  }),
  computed: {
    status() {
      if (!this.digest?.generatedAt) return '';
      const date = new Date(this.digest.generatedAt);
      if (!Number.isFinite(date.getTime())) return '';
      const minutes = Math.max(0, Math.round((this.now - date.getTime()) / 60000));
      const relative = minutes < 1 ? '刚刚更新'
        : minutes < 60 ? `${minutes} 分钟前更新`
        : `${Math.floor(minutes / 60)} 小时前更新`;
      // 采集每 6 小时一次，超过 7 小时才算异常（留出一次运行失败的余量）
      return minutes > 420 ? `${relative} · 数据可能未刷新` : relative;
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
    },
    speechChunks() {
      const strip = text => String(text || '')
        .replace(SPEECH_EMOJI, '')
        .replace(SPEECH_JOINER, '')
        .replace(/[\s\u3000]+/g, ' ')
        .trim();
      const sections = this.digest?.sections || [];
      // 每个板块一条 utterance：一是朗读时能跟着高亮，二是避免超长文本被引擎截断
      if (sections.length) return sections.map(sec => `${strip(sec.title)}。${strip(sec.text)}`);
      return this.digest?.text ? [strip(this.digest.text)] : [];
    }
  },
  mounted() {
    this.load();
    this.ticker = setInterval(() => { this.now = Date.now(); }, 60000);
    this.speechReady = typeof window !== 'undefined'
      && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    if (this.speechReady) {
      this.pickVoice();
      // Chrome 的语音列表是异步拿到的，首次调用常是空数组
      window.speechSynthesis.addEventListener?.('voiceschanged', this.pickVoice);
    }
  },
  beforeUnmount() {
    this.controller?.abort();
    clearInterval(this.ticker);
    if (this.speechReady) {
      window.speechSynthesis.removeEventListener?.('voiceschanged', this.pickVoice);
      this.stopSpeech();
    }
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
          // 速览被换掉了，正在念的旧内容要停掉，否则会接着念已经不在页面上的文字
          if (this.speaking) this.stopSpeech();
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
    },
    pickVoice() {
      if (!this.speechReady) return;
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return;
      // 优先 zh-CN，其次任何中文语音；都没有就交给引擎默认（不强行指定，避免念不出来）
      const exact = voices.find(voice => /^zh[-_]?(CN|Hans)?/i.test(voice.lang || ''));
      const anyChinese = voices.find(voice => /^zh/i.test(voice.lang || ''));
      this.speechVoice = exact || anyChinese || null;
    },
    toggleSpeech() {
      if (this.speaking) this.stopSpeech();
      else this.startSpeech();
    },
    startSpeech() {
      const chunks = this.speechChunks;
      if (!chunks.length) return;
      this.stopSpeech();
      this.speaking = true;
      const token = this.speechToken;
      const speakAt = index => {
        // token 变了说明用户点了停止或组件卸载了，直接收尾，不要再排队下一段
        if (token !== this.speechToken) return;
        if (index >= chunks.length) {
          this.speaking = false;
          this.speakingIndex = -1;
          return;
        }
        this.speakingIndex = index;
        const utter = new SpeechSynthesisUtterance(chunks[index]);
        utter.lang = 'zh-CN';
        utter.rate = 1.05;
        utter.pitch = 1;
        if (this.speechVoice) utter.voice = this.speechVoice;
        utter.onend = () => speakAt(index + 1);
        utter.onerror = () => {
          if (token !== this.speechToken) return;
          this.speaking = false;
          this.speakingIndex = -1;
        };
        window.speechSynthesis.speak(utter);
      };
      speakAt(0);
    },
    stopSpeech() {
      // token 自增是唯一可靠的取消信号：speechSynthesis.cancel() 之后 onend 仍可能被触发
      this.speechToken += 1;
      this.speaking = false;
      this.speakingIndex = -1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }
};
</script>
<style scoped>
.ai-digest-panel{--ai-text:#26364c;--ai-muted:#7b8799;--ai-line:rgba(105,128,160,.18);--ai-accent:#e0703f;margin:18px 0 0;padding:18px 20px 16px;border:1px solid var(--ai-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--ai-text);min-width:0;box-sizing:border-box}
.ai-digest-dark{--ai-text:#b0d4ba;--ai-muted:#8ca995;--ai-line:#263c2e;--ai-accent:#b0d4ba;background:linear-gradient(rgba(176,212,186,.015) 1px,transparent 1px),#080f0b;background-size:100% 4px;border:1px solid #3c5946;border-radius:6px;box-shadow:0 8px 28px rgba(0,0,0,.15);font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace;color-scheme:dark}
.ai-digest-dark .ai-digest-mark{background:#183222;color:#d0e7d7;border-radius:6px}
.ai-digest-dark .ai-digest-meta button:hover:not(:disabled){color:#d0e7d7;background:#183222}
.ai-digest-dark .ai-digest-sec h3{color:#d0e7d7}
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
.ai-digest-speak{display:inline-flex;align-items:center;gap:5px}
.ai-digest-speak::before{content:'';width:0;height:0;flex:none;border-style:solid;border-width:4px 0 4px 6px;border-color:transparent transparent transparent currentColor}
.ai-digest-speak[aria-pressed="true"]{color:var(--ai-accent);background:rgba(241,118,77,.1)}
.ai-digest-speak[aria-pressed="true"]::before{width:6px;height:6px;border:0;background:currentColor;border-radius:1px;animation:ai-digest-pulse 1.4s ease-in-out infinite}
.ai-digest-dark .ai-digest-speak[aria-pressed="true"]{color:#d0e7d7;background:#183222}
@keyframes ai-digest-pulse{0%,100%{opacity:1}50%{opacity:.25}}
@media(prefers-reduced-motion:reduce){.ai-digest-speak[aria-pressed="true"]::before{animation:none}}
.ai-digest-panel button:focus-visible{outline:2px solid var(--ai-accent);outline-offset:1px}
.ai-digest-text{margin:0;font-size:14px;line-height:1.95;color:var(--ai-text);white-space:pre-line;text-align:justify}
.ai-digest-empty .ai-digest-text{color:var(--ai-muted);font-size:13px;text-align:left}
.ai-digest-body{min-width:0}
.ai-digest-sec{min-width:0}
.ai-digest-sec+.ai-digest-sec{margin-top:14px}
.ai-digest-sec h3{margin:0 0 5px;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;letter-spacing:.2px;color:var(--ai-accent)}
.ai-digest-sec h3::before{content:'';flex:none;width:3px;height:12px;border-radius:2px;background:var(--ai-accent)}
.ai-digest-sec p{margin:0;font-size:13.5px;line-height:1.85;color:var(--ai-text);white-space:pre-line}
.ai-digest-sec.is-speaking{position:relative;border-radius:4px;box-shadow:0 0 0 6px rgba(241,118,77,.05)}
.ai-digest-sec.is-speaking h3{color:var(--ai-accent)}
.ai-digest-sec.is-speaking h3::before{width:4px}
.ai-digest-sec.is-speaking::after{content:'';position:absolute;left:-9px;top:-4px;bottom:-4px;width:2px;border-radius:2px;background:var(--ai-accent);opacity:.55}
.ai-digest-dark .ai-digest-sec.is-speaking{box-shadow:0 0 0 6px rgba(176,212,186,.07)}
.ai-digest-dark .ai-digest-sec.is-speaking h3{color:#d0e7d7}
@media(min-width:900px){.ai-digest-body{display:grid;grid-template-columns:1fr 1fr;gap:16px 30px;align-items:start}.ai-digest-sec+.ai-digest-sec{margin-top:0}}
.ai-digest-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--ai-line);font-size:10px;color:var(--ai-muted)}
.ai-digest-foot span{min-width:0}
@media(max-width:700px){.ai-digest-panel{padding:14px;border-radius:14px}.ai-digest-text{font-size:13px;line-height:1.85;text-align:left}.ai-digest-sec p{font-size:13px;line-height:1.8}.ai-digest-head{margin-bottom:10px}.ai-digest-mark{width:34px;height:34px;border-radius:10px}.ai-digest-copy h2{font-size:15px}}
</style>
