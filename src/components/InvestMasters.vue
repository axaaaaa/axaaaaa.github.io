<template>
<section class="im-panel" :class="{'im-dark':dark}" aria-labelledby="im-title">
  <header class="im-head">
    <div>
      <h3 id="im-title">🎓 投资大师的核心思想</h3>
      <p>{{masters.length || 12}} 位投资人的方法论与代表箴言<span v-if="updatedAt"> · 整理于 {{updatedAt}}</span></p>
    </div>
    <button v-if="masters.length" type="button" class="im-shuffle" @click="pickRandom">换一位 ↗</button>
  </header>

  <div v-if="error" class="im-empty">思想库加载失败。<button type="button" @click="load">重试</button></div>
  <div v-else-if="!masters.length" class="im-empty">正在加载…</div>

  <template v-else>
    <div class="im-body">
    <div class="im-chips" role="tablist" aria-label="选择投资大师">
      <button v-for="m in masters" :key="m.id" type="button" role="tab" class="im-chip" :class="{active:m.id===current.id}" :aria-selected="m.id===current.id" @click="select(m.id)">
        <span class="im-chip-avatar" :style="{background:m.color}">{{m.initial}}</span>
        <span class="im-chip-name">{{m.name}}</span>
      </button>
    </div>

    <article class="im-card" aria-live="polite">
      <div class="im-card-head">
        <span class="im-avatar" :style="{background:current.color}" aria-hidden="true">{{current.initial}}</span>
        <div class="im-identity">
          <h4>{{current.name}}<small>{{current.en}}</small></h4>
          <p>{{current.life}} · {{current.role}}</p>
        </div>
      </div>

      <p class="im-core">{{current.core}}</p>

      <ul class="im-points">
        <li v-for="(point,index) in current.points" :key="point"><span class="im-num">{{index+1}}</span><span>{{point}}</span></li>
      </ul>

      <blockquote class="im-quote">
        <p>「{{current.quote}}」</p>
        <p class="im-quote-en">{{current.quoteEn}}</p>
        <cite>—— {{current.name}}{{current.source?` · ${current.source}`:''}}</cite>
      </blockquote>

      <div class="im-tags">
        <span v-for="tag in current.tags" :key="tag" class="im-tag">{{tag}}</span>
        <span class="im-works">代表作：{{current.works.join('、')}}</span>
      </div>
    </article>
    </div>

    <footer class="im-note">
      <span>{{notice}}</span>
      <span>点击上方任一大师可切换；「换一位」随机浏览。</span>
    </footer>
  </template>
</section>
</template>
<script>
export default {
  name: 'InvestMasters',
  props: { dark: Boolean },
  data: () => ({ data: null, error: false, activeId: '' }),
  computed: {
    masters() { return this.data?.masters || []; },
    updatedAt() { return this.data?.updatedAt || ''; },
    notice() { return this.data?.notice || ''; },
    current() { return this.masters.find(m => m.id === this.activeId) || this.masters[0] || {}; }
  },
  mounted() { this.load(); },
  methods: {
    select(id) { this.activeId = id; },
    pickRandom() {
      if (!this.masters.length) return;
      const pool = this.masters.filter(m => m.id !== this.activeId);
      const next = pool[Math.floor(Math.random() * pool.length)];
      if (next) this.activeId = next.id;
    },
    async load() {
      this.error = false;
      try {
        const response = await fetch(`${process.env.BASE_URL}invest-masters.json`, { cache: 'no-cache' });
        if (!response.ok) throw Error('request failed');
        const data = await response.json();
        if (!Array.isArray(data?.masters) || !data.masters.length) throw Error('invalid data');
        this.data = data;
        if (!data.masters.some(m => m.id === this.activeId)) this.activeId = data.masters[0].id;
      } catch { this.error = true; }
    }
  }
};
</script>
<style scoped>
.im-panel{--m-text:#26364c;--m-muted:#7b8799;--m-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--m-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--m-text);padding:20px 22px 15px;box-sizing:border-box;min-width:0}
.im-dark{--m-text:#e2e9f4;--m-muted:#95a3b9;--m-line:rgba(145,164,194,.17);background:linear-gradient(rgba(176,212,186,.015) 1px,transparent 1px),#080f0b;background-size:100% 4px;color:var(--m-text)}
.im-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin:0 0 12px}
.im-head h3{margin:0;font-size:14px;line-height:1.7}
.im-head p{margin:4px 0 0;font-size:11px;color:var(--m-muted,#7b8799);line-height:1.6}
.im-shuffle{border:1px solid var(--m-line,rgba(105,128,160,.15));background:transparent;color:#43898d;font:inherit;font-size:11px;padding:5px 10px;border-radius:999px;cursor:pointer;white-space:nowrap}
.im-shuffle:hover{background:rgba(66,143,143,.1)}
.im-shuffle:focus-visible{outline:2px solid #43898d;outline-offset:2px}
.im-body{display:grid;gap:14px;min-width:0}
.im-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px 0;scrollbar-width:thin}
.im-chip{display:flex;flex-direction:column;align-items:center;gap:4px;flex:none;border:1px solid transparent;background:transparent;border-radius:10px;padding:6px 7px;cursor:pointer;font:inherit;color:var(--m-muted,#7b8799);min-width:60px}
.im-chip:hover{background:rgba(127,145,171,.06)}
.im-chip.active{border-color:rgba(66,143,143,.35);background:rgba(66,143,143,.08);color:var(--m-text,#26364c)}
.im-chip:focus-visible{outline:2px solid #43898d;outline-offset:1px}
.im-chip-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;font-family:"Songti SC","SimSun",system-ui,sans-serif}
.im-chip-name{font-size:10px;white-space:nowrap;line-height:1.4}
.im-card{border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:14px;padding:16px;background:rgba(127,145,171,.04)}
.im-card-head{display:flex;align-items:center;gap:11px}
.im-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:600;flex:none;font-family:"Songti SC","SimSun",system-ui,sans-serif;box-shadow:inset 0 0 0 2px rgba(255,255,255,.28)}
.im-identity{min-width:0}
.im-identity h4{margin:0;font-size:15px;line-height:1.5;display:flex;flex-wrap:wrap;align-items:baseline;gap:7px}
.im-identity h4 small{font-size:10px;font-weight:400;color:var(--m-muted,#7b8799);letter-spacing:.02em}
.im-identity p{margin:2px 0 0;font-size:10px;color:var(--m-muted,#7b8799)}
.im-core{margin:13px 0 0;font-size:14px;line-height:1.75;font-weight:600;color:var(--m-text,#26364c);padding-left:11px;border-left:3px solid #43898d}
.im-points{list-style:none;margin:13px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.im-points li{display:flex;gap:8px;font-size:12px;line-height:1.75;color:var(--m-text,#26364c)}
.im-num{flex:none;width:17px;height:17px;border-radius:50%;background:rgba(66,143,143,.12);color:#43898d;font-size:10px;display:flex;align-items:center;justify-content:center;margin-top:3px;font-variant-numeric:tabular-nums}
.im-quote{margin:14px 0 0;padding:12px 14px;border-radius:10px;background:rgba(66,143,143,.06);border:1px solid rgba(66,143,143,.14)}
.im-quote p{margin:0;font-size:13px;line-height:1.8;color:var(--m-text,#26364c)}
.im-quote .im-quote-en{margin:6px 0 0;font-size:10px;line-height:1.6;color:var(--m-muted,#7b8799);font-style:italic;overflow-wrap:anywhere}
.im-quote cite{display:block;margin-top:8px;font-size:10px;font-style:normal;color:var(--m-muted,#7b8799);text-align:right}
.im-tags{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:12px}
.im-tag{font-size:10px;color:#43898d;background:rgba(66,143,143,.1);border-radius:5px;padding:3px 7px}
.im-works{font-size:10px;color:var(--m-muted,#7b8799);margin-left:auto}
.im-note{display:flex;flex-direction:column;gap:3px;margin:10px 0 0;font-size:10px;color:var(--m-muted,#7b8799);line-height:1.6}
.im-empty{padding:18px;text-align:center;font-size:12px;color:var(--m-muted,#7b8799)}
.im-empty button{margin-left:6px;border:0;background:transparent;color:#43898d;font:inherit;font-size:12px;cursor:pointer;text-decoration:underline}
@media(max-width:700px){.im-chip{min-width:54px;padding:5px}.im-chip-avatar{width:24px;height:24px;font-size:12px}.im-card{padding:13px}.im-avatar{width:38px;height:38px;font-size:17px}.im-core{font-size:13px}.im-works{margin-left:0;flex-basis:100%}}
@media(min-width:880px){
  .im-body{grid-template-columns:296px minmax(0,1fr);gap:20px;align-items:start}
  .im-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;overflow:visible;padding:0;margin:0}
  .im-chip{flex-direction:row;justify-content:flex-start;gap:7px;min-width:0;width:100%;padding:6px 7px;border-radius:9px}
  .im-chip-name{font-size:10.5px;text-align:left;white-space:normal;line-height:1.35;overflow-wrap:anywhere}
  .im-card{padding:18px}
  .im-core{font-size:15px}
}
</style>
