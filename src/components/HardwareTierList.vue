<template>
  <section id="hardware-tiers" class="hardware-tiers" aria-labelledby="hardware-tiers-title">
    <header class="heading">
      <h2 id="hardware-tiers-title">
        <button type="button" :aria-expanded="opened" aria-controls="hardware-tiers-content" @click="opened = !opened">
          <svg class="heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>
          硬件天梯图 <span aria-hidden="true">{{ opened ? '⌃' : '⌄' }}</span>
        </button>
      </h2>
      <span class="muted">手机 · 电脑 · AI 显卡 · {{ total }} 款芯片与显卡</span>
    </header>

    <div v-if="opened" id="hardware-tiers-content" class="content">
      <nav class="tabs" aria-label="硬件分类">
        <button v-for="group in groups" :key="group.id" type="button" :aria-pressed="activeId === group.id" @click="selectGroup(group.id)">
          <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <g v-if="group.id === 'pc-cpu'"><rect x="7" y="7" width="10" height="10" rx="2" /><rect x="10" y="10" width="4" height="4" rx="1" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></g>
            <g v-else-if="group.id === 'pc-gpu'"><rect x="2.5" y="7" width="16" height="10" rx="2" /><circle cx="8" cy="12" r="2.4" /><path d="M18.5 10h3v4h-3M5 17v3h10" /></g>
            <g v-else-if="group.id === 'ai-gpu'"><rect x="6" y="6" width="12" height="12" rx="3" /><circle cx="12" cy="12" r="2.2" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></g>
            <g v-else><rect x="7.5" y="2.5" width="9" height="19" rx="2.5" /><path d="M10.5 5.5h3M10 19.5h4" /></g>
          </svg>
          {{ group.label }}
        </button>
      </nav>

      <div class="toolbar">
        <label class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input v-model="query" type="search" placeholder="搜索型号或品牌，如 5090 / 骁龙 / 9950X" aria-label="搜索硬件型号" />
        </label>
        <span class="count">{{ filtered.length }} 款</span>
      </div>

      <ol class="ladder">
        <li v-for="(item, index) in filtered" :key="item.name" class="row" :class="{ 'top-three': index < 3 }">
          <span class="rank"><span v-if="index < 3" class="trophy" :class="'trophy-' + (index + 1)">🏆</span><template v-else>{{ index + 1 }}</template></span>
          <span class="tier" :class="'tier-' + tierOf(item.score)">{{ tierOf(item.score) }}</span>
          <div class="body">
            <div class="line"><span class="brand-logo" :title="item.brand"><img :src="logoOf(item.brand)" :alt="item.brand" loading="lazy" /></span><strong>{{ item.name }}</strong><span v-if="item.zh" class="name-zh" :title="item.zh">{{ item.zh }}</span><span class="year">{{ item.year }}</span><span class="note" :title="item.note">{{ item.note }}</span><span v-if="item.price" class="price" title="参考价，按 1 美元 ≈ 7.15 元换算">{{ formatUsd(item.price) }} · {{ formatCny(item.price) }}</span></div>
            <div class="bar"><i :style="{ width: barWidth(item.score) }"></i></div>
          </div>
          <span class="score">{{ item.score }}</span>
        </li>
      </ol>

      <div v-if="!filtered.length" class="empty">没有匹配的型号。<button type="button" @click="query = ''">清空搜索</button></div>
      <p class="disclaimer">说明：榜单更新至 2026 年 11 月；分数为同一分类内的相对性能指数，跨分类不可直接比较，2026 年新品为近似估算；笔记本与手机受功耗、散热限制，同名型号的实际表现会有差异。价格为主流渠道参考价（美元），人民币按 1 美元 ≈ 7.15 元换算，会随市场与汇率波动；手机处理器为芯片参考成本，非整机售价。</p>

      <div class="glossary">
        <div class="glossary-head">
          <h4>参数词典</h4>
          <span>看懂 CPU 与显卡规格表</span>
        </div>
        <nav class="glossary-tabs" aria-label="参数分类">
          <button v-for="entry in glossary" :key="entry.id" type="button" :aria-pressed="glossaryId === entry.id" @click="glossaryId = entry.id">{{ entry.label }}</button>
        </nav>
        <dl class="terms">
          <div v-for="item in activeGlossary.items" :key="item.term" class="term">
            <dt>{{ item.term }} <em v-if="item.en">{{ item.en }}</em></dt>
            <dd>{{ item.desc }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script>
import { hardwareGroups, filterHardware, hardwareTier, brandLogos, hardwareGlossary } from '../data/hardware-tiers.mjs';

export default {
  name: 'HardwareTierList',
  data: () => ({
    opened: false,
    groups: hardwareGroups,
    activeId: hardwareGroups[0].id,
    glossaryId: hardwareGlossary[0].id,
    glossary: hardwareGlossary,
    query: '',
    baseUrl: process.env.BASE_URL,
  }),
  computed: {
    total() { return this.groups.reduce((sum, group) => sum + group.items.length, 0); },
    activeGroup() { return this.groups.find(group => group.id === this.activeId) || this.groups[0]; },
    filtered() { return filterHardware(this.activeGroup, this.query); },
    maxScore() { return Math.max(...this.activeGroup.items.map(item => item.score), 1); },
    activeGlossary() { return this.glossary.find(entry => entry.id === this.glossaryId) || this.glossary[0]; },
  },
  methods: {
    tierOf(score) { return hardwareTier(score, this.maxScore); },
    logoOf(brand) { return `${this.baseUrl}brand-logos/${brandLogos[brand] || ''}.svg`; },
    barWidth(score) { return Math.max(4, Math.round(score / this.maxScore * 100)) + '%'; },
    formatUsd(price) { return '$' + price.toLocaleString('en-US'); },
    formatCny(price) { return '¥' + (Math.round(price * 7.15 / 10) * 10).toLocaleString('en-US'); },
    selectGroup(id) { this.activeId = id; this.query = ''; },
  },
};
</script>

<style scoped>
.hardware-tiers {
  margin: 24px 20px 32px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light, #d7e4dc);
  border-radius: 14px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #273b30);
  scroll-margin-top: 80px;
  font-size: 13px;
}
.heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
h2 { margin: 0; font-size: 20px; font-weight: 500; }
.heading button {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 0; border: 0; background: none;
  font: inherit; color: inherit; text-align: left; cursor: pointer;
}
.heading-icon { width: 19px; height: 19px; flex: none; }
.muted { color: var(--el-text-color-secondary, #65746c); line-height: 1.8; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 14px 0; }
.tabs button { display: inline-flex; align-items: center; gap: 6px; }
.tab-icon { width: 15px; height: 15px; flex: none; }
button {
  font: inherit; color: inherit; cursor: pointer;
  padding: 8px 12px; border: 1px solid var(--el-border-color-light, #d7e4dc);
  border-radius: 7px; background: var(--el-fill-color-blank, #fff);
}
button:hover { color: var(--ui-accent, #2f6b4f); background: var(--ui-accent-soft, #eff7f3); }
.tabs button[aria-pressed="true"] { color: #fff; background: var(--ui-accent, #2f6b4f); border-color: transparent; }
button:focus-visible, input:focus-visible { outline: 2px solid var(--ui-accent, #2f6b4f); outline-offset: 2px; }
.toolbar { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; }
.search { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; padding: 0 10px; border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 8px; background: var(--el-fill-color-blank, #fff); }
.search svg { width: 15px; height: 15px; flex: none; color: var(--el-text-color-secondary, #65746c); }
.search input { flex: 1; min-width: 0; padding: 9px 0; border: 0; background: transparent; font: inherit; color: inherit; outline: none; }
.count { flex: none; font-size: 12px; color: var(--el-text-color-secondary, #65746c); }
.ladder { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.row {
  display: grid;
  grid-template-columns: 30px 30px minmax(0, 1fr) 52px;
  align-items: center;
  gap: 10px;
  padding: 4px 7px;
  border: 1px solid var(--el-border-color-light, #e1e8e3);
  border-radius: 9px;
}
.row.top-three { background: var(--ui-accent-soft, #f3f9f6); border-color: transparent; }
.rank { display: flex; align-items: center; justify-content: center; font: 12px/1 Consolas, monospace; color: var(--el-text-color-secondary, #7a8a80); }
.top-three .rank { font-size: 16px; line-height: 1; }
.trophy-1 { filter: drop-shadow(0 0 1px rgba(217, 165, 32, .5)); }
.trophy-2 { filter: grayscale(1) brightness(1.35) contrast(.92); }
.trophy-3 { filter: sepia(1) saturate(3) hue-rotate(-14deg) brightness(.92); }
.tier { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 22px; border-radius: 5px; font-size: 11px; font-weight: 700; }
.tier-S { background: #ffe9dc; color: #c2410c; }
.tier-A { background: #e6eeff; color: #1d4ed8; }
.tier-B { background: #e6f5eb; color: #15803d; }
.tier-C { background: #eef1f4; color: #475569; }
.body { min-width: 0; }
.line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.line strong { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.name-zh { font-size: 12px; color: var(--el-text-color-secondary, #65746c); white-space: nowrap; }
.year { font-size: 11px; color: var(--el-text-color-secondary, #7a8a80); }
.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.brand-logo img { display: block; width: auto; height: 32px; max-width: 86px; object-fit: contain; }
html.dark .brand-logo img[alt="Apple"] { filter: invert(1); }
.bar { height: 3px; margin: 3px 0 2px; border-radius: 3px; background: var(--el-fill-color-light, #edf2ee); overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--ui-accent, #2f6b4f), #6bbf8f); }
.note { flex: 1 1 200px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 11px; color: var(--el-text-color-secondary, #65746c); }
.price { flex: none; white-space: nowrap; font: 11px/1 Consolas, monospace; color: var(--ui-accent, #2f6b4f); }
.score { text-align: right; font: 700 15px/1 Consolas, monospace; color: var(--el-text-color-primary, #273b30); }
.empty { padding: 24px; text-align: center; color: var(--el-text-color-secondary, #65746c); }
.disclaimer { margin: 14px 0 0; font-size: 11px; line-height: 1.8; color: var(--el-text-color-secondary, #7a8a80); }
.glossary { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--el-border-color-light, #e1e8e3); }
.glossary-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.glossary-head h4 { margin: 0; font-size: 16px; font-weight: 600; }
.glossary-head span { font-size: 11px; color: var(--el-text-color-secondary, #7a8a80); }
.glossary-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
.glossary-tabs button[aria-pressed="true"] { color: #fff; background: var(--ui-accent, #2f6b4f); border-color: transparent; }
.terms { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin: 0; }
.term { padding: 10px 12px; border: 1px solid var(--el-border-color-light, #e1e8e3); border-radius: 8px; background: var(--el-fill-color-blank, #fff); }
.term dt { font-size: 13px; font-weight: 600; }
.term dt em { margin-left: 6px; font: 11px/1.2 Consolas, monospace; font-style: normal; color: var(--el-text-color-secondary, #7a8a80); }
.term dd { margin: 5px 0 0; font-size: 12px; line-height: 1.75; color: var(--el-text-color-secondary, #5c6b62); }
@media (max-width: 700px) {
  .hardware-tiers { margin: 16px 12px 24px; padding: 14px; }
  .row { grid-template-columns: 24px 26px minmax(0, 1fr) 44px; gap: 7px; padding: 4px 6px; }
  .line strong { font-size: 13px; }
  .brand-logo img { height: 26px; max-width: 72px; }
  .terms { grid-template-columns: 1fr; }
}
</style>
