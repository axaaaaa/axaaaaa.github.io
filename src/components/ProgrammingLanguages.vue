<template>
  <section
    id="programming-languages"
    class="pl"
    aria-labelledby="pl-title"
    :style="themeVars"
  >
    <header class="pl-head">
      <div class="pl-head-main">
        <span class="pl-badge">LANGUAGES</span>
        <h2 id="pl-title">
          <button type="button" class="pl-title-btn" :aria-expanded="opened" aria-controls="pl-content" @click="opened = !opened">
            编程语言
            <svg class="pl-caret" :style="{ transform: opened ? 'rotate(180deg)' : 'none' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </h2>
      </div>
      <button type="button" class="pl-toggle" :aria-expanded="opened" aria-controls="pl-content" @click="opened = !opened">{{ opened ? '收起' : '展开' }}</button>
    </header>

    <div v-if="opened" id="pl-content" class="pl-body">
      <div class="pl-picker" role="group" aria-label="选择编程语言">
        <button
          v-for="lang in languages"
          :key="lang.id"
          type="button"
          class="pl-pick"
          :class="{ 'is-active': lang.id === activeId }"
          :aria-pressed="lang.id === activeId"
          :style="{ '--pick': lang.accent, '--pick-soft': lang.accentSoft }"
          @click="activeId = lang.id"
        >
          <span class="pl-mono" :style="{ background: lang.accent, color: readableOn(lang.accent) }">{{ lang.monogram }}</span>
          <span class="pl-pick-text">
            <strong>{{ lang.name }}</strong>
            <small>{{ lang.year }} · {{ lang.tagline }}</small>
          </span>
        </button>
      </div>

      <article class="pl-detail" aria-live="polite">
        <div class="pl-detail-main">
          <header class="pl-detail-head">
            <div>
              <h3>{{ active.name }}<span>{{ active.creator }}</span></h3>
              <p class="pl-summary">{{ active.summary }}</p>
            </div>
            <span class="pl-year">{{ active.year }}</span>
          </header>

          <dl class="pl-specs">
            <div><dt>类型系统</dt><dd>{{ active.specs.type }}</dd></div>
            <div><dt>内存管理</dt><dd>{{ active.specs.memory }}</dd></div>
            <div><dt>执行方式</dt><dd>{{ active.specs.exec }}</dd></div>
            <div><dt>当前标准</dt><dd>{{ active.specs.std }}</dd></div>
            <div><dt>包管理</dt><dd>{{ active.specs.pkg }}</dd></div>
            <div><dt>性能量级</dt><dd>{{ active.specs.perf }}</dd></div>
          </dl>
        </div>

        <figure class="pl-code">
          <figcaption>
            <span>{{ active.name }} · 示例</span>
            <button type="button" @click="copyCode">{{ copied ? '已复制 ✓' : '复制代码' }}</button>
          </figcaption>
          <pre><code>{{ active.code }}</code></pre>
        </figure>
      </article>

      <div class="pl-three">
        <section>
          <h4>典型用途</h4>
          <ul class="pl-uses"><li v-for="use in active.uses" :key="use">{{ use }}</li></ul>
        </section>
        <section>
          <h4>常见坑</h4>
          <ul class="pl-pitfalls"><li v-for="pit in active.pitfalls" :key="pit">{{ pit }}</li></ul>
        </section>
        <section>
          <h4>生态关键词</h4>
          <ul class="pl-eco"><li v-for="item in active.eco" :key="item">{{ item }}</li></ul>
        </section>
      </div>

      <section class="pl-table-wrap" aria-labelledby="pl-table-title">
        <header>
          <h3 id="pl-table-title">四种语言横向对比</h3>
          <p>性能量级以 C 为基准，实际差距取决于场景与编译器优化。</p>
        </header>
        <div class="pl-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">维度</th>
                <th v-for="lang in languages" :key="lang.id" scope="col" :class="{ 'is-active': lang.id === activeId }">{{ lang.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row[0]">
                <th scope="row">{{ row[0] }}</th>
                <td v-for="(cell, index) in row.slice(1)" :key="index">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="pl-picking" aria-labelledby="pl-picking-title">
        <h3 id="pl-picking-title">怎么选</h3>
        <div class="pl-tips">
          <article v-for="tip in pickingTips" :key="tip.lead" class="pl-tip">
            <span class="pl-tip-lead">{{ tip.lead }}</span>
            <h4>{{ tip.title }}</h4>
            <p>{{ tip.body }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { languages, comparisonRows, pickingTips } from '../data/programming-languages.mjs';

// 在强调色上选可读的前景色（深色底配白字，浅色底配深字）
function readableOn(hex) {
  const value = String(hex).replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1b1b1b' : '#ffffff';
}

function tint(hex, alpha) {
  const value = String(hex).replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default {
  name: 'ProgrammingLanguages',
  data() {
    return {
      opened: true,
      languages,
      comparisonRows,
      pickingTips,
      activeId: languages[0].id,
      copied: false,
      copyTimer: null,
    };
  },
  computed: {
    active() {
      return this.languages.find((lang) => lang.id === this.activeId) || this.languages[0];
    },
    themeVars() {
      return {
        '--pl-accent': this.active.accent,
        '--pl-tint': tint(this.active.accent, 0.12),
        '--pl-tint-soft': tint(this.active.accent, 0.06),
      };
    },
  },
  watch: {
    activeId() {
      this.copied = false;
    },
  },
  beforeUnmount() {
    clearTimeout(this.copyTimer);
  },
  methods: {
    readableOn,
    async copyCode() {
      const text = this.active.code;
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch {
        ok = false;
      }
      if (!ok) {
        // http 环境或权限被拒时，退回 textarea + execCommand
        try {
          const area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.top = '-1000px';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          ok = document.execCommand('copy');
          document.body.removeChild(area);
        } catch {
          ok = false;
        }
      }
      if (!ok) return;
      this.copied = true;
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => { this.copied = false; }, 1800);
    },
  },
};
</script>

<style scoped>
.pl {
  margin: 24px 20px 32px;
  border: 1px solid var(--el-border-color-light, #e3e8ef);
  border-radius: 20px;
  background: linear-gradient(180deg, #fcfdff 0%, #fff 40%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 18px 44px -30px rgba(15, 23, 42, .45);
  color: var(--el-text-color-primary, #1f2937);
  font-size: 13px;
  scroll-margin-top: 80px;
  overflow: hidden;
}
.pl-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, .06);
}
.pl-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--ui-accent-soft, #e8f1ec);
  color: var(--ui-accent, #386a50);
  font: 600 10px/1.7 ui-monospace, Consolas, monospace;
  letter-spacing: .16em;
}
h2 { margin: 10px 0 0; font-size: 21px; font-weight: 600; letter-spacing: -.01em; }
.pl-title-btn { display: inline-flex; align-items: center; gap: 8px; border: 0; padding: 0; background: none; font: inherit; color: inherit; cursor: pointer; }
.pl-caret { width: 16px; height: 16px; opacity: .45; transition: transform .22s ease; }
.pl-toggle {
  padding: 8px 15px;
  border: 1px solid var(--el-border-color, #e5e7eb);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  color: var(--el-text-color-regular, #374151);
  cursor: pointer;
  transition: border-color .18s, color .18s, transform .18s;
}
.pl-toggle:hover { border-color: var(--pl-accent, #386a50); color: var(--pl-accent, #386a50); transform: translateY(-1px); }
.pl-body { padding: 18px 22px 24px; }
.pl-picker { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.pl-pick {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light, #e8ecf1);
  border-radius: 14px;
  background: #fff;
  font: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: border-color .18s, box-shadow .18s, transform .18s, background .18s;
}
.pl-pick:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -18px rgba(15, 23, 42, .9); }
.pl-pick.is-active { border-color: var(--pick); box-shadow: inset 0 0 0 1px var(--pick), 0 12px 26px -22px rgba(15, 23, 42, .9); }
.pl-mono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  font: 700 13px/1 ui-monospace, Consolas, monospace;
  letter-spacing: -.02em;
}
.pl-pick-text { min-width: 0; }
.pl-pick-text strong { display: block; font-size: 13.5px; font-weight: 600; }
.pl-pick-text small { display: block; margin-top: 3px; font-size: 11px; line-height: 1.45; color: var(--el-text-color-secondary, #6b7280); }
.pl-detail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr); gap: 16px; margin-top: 16px; align-items: start; }
.pl-detail-main { min-width: 0; padding: 18px 20px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 16px; background: #fff; box-shadow: 0 12px 30px -28px rgba(15, 23, 42, .8); }
.pl-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
h3 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.01em; }
.pl-detail h3 span { display: block; margin-top: 4px; font: 11.5px/1.5 ui-monospace, Consolas, monospace; color: var(--el-text-color-secondary, #94a3b8); }
.pl-year { flex: 0 0 auto; padding: 4px 10px; border-radius: 999px; background: var(--pl-tint); color: var(--pl-accent); font: 600 11px/1.6 ui-monospace, Consolas, monospace; }
.pl-summary { margin: 12px 0 0; line-height: 1.85; color: var(--el-text-color-regular, #4b5563); }
.pl-specs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 16px 0 0; border: 1px solid var(--el-border-color-lighter, #eef1f5); border-radius: 12px; overflow: hidden; background: var(--el-border-color-lighter, #eef1f5); }
.pl-specs > div { padding: 10px 12px; background: #fff; }
.pl-specs dt { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--el-text-color-secondary, #94a3b8); }
.pl-specs dd { margin: 4px 0 0; font-size: 12.5px; line-height: 1.55; color: var(--el-text-color-regular, #374151); }
.pl-code { margin: 0; border: 1px solid #1b2531; border-radius: 16px; background: #0b1220; overflow: hidden; }
.pl-code figcaption { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 14px; border-bottom: 1px solid rgba(255, 255, 255, .07); background: rgba(255, 255, 255, .03); font: 11px/1.4 ui-monospace, Consolas, monospace; color: #9fb3cc; }
.pl-code figcaption button { padding: 4px 10px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 999px; background: transparent; font: inherit; font-size: 10.5px; color: #cfe0f5; cursor: pointer; transition: background .16s, border-color .16s; }
.pl-code figcaption button:hover { background: rgba(255, 255, 255, .08); border-color: rgba(255, 255, 255, .3); }
.pl-code pre { margin: 0; padding: 14px 16px; overflow-x: auto; font: 12px/1.8 ui-monospace, Consolas, monospace; color: #d6e4f7; tab-size: 4; }
.pl-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
.pl-three h4 { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--el-text-color-secondary, #94a3b8); }
.pl-uses, .pl-pitfalls, .pl-eco { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }
.pl-uses li, .pl-pitfalls li { position: relative; padding-left: 16px; font-size: 12.5px; line-height: 1.7; color: var(--el-text-color-regular, #4b5563); }
.pl-uses li::before { content: ''; position: absolute; left: 1px; top: 8px; width: 6px; height: 6px; border-radius: 2px; background: var(--pl-accent); }
.pl-pitfalls li::before { content: ''; position: absolute; left: 2px; top: 8px; width: 6px; height: 6px; background: #d97706; transform: rotate(45deg); }
.pl-eco { flex-direction: row; flex-wrap: wrap; gap: 6px; }
.pl-eco li { padding: 4px 10px; border-radius: 999px; background: var(--pl-tint-soft); color: var(--el-text-color-regular, #374151); font-size: 11.5px; }
.pl-table-wrap { margin-top: 22px; padding: 18px 20px 8px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 16px; background: #fff; }
.pl-table-wrap header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.pl-table-wrap h3 { font-size: 16px; }
.pl-table-wrap p { margin: 0; font-size: 11.5px; color: var(--el-text-color-secondary, #94a3b8); }
.pl-table-scroll { margin-top: 10px; overflow-x: auto; }
table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 12px; }
thead th { padding: 8px 10px; border-bottom: 1px solid var(--el-border-color-light, #e8ecf1); font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary, #6b7280); text-align: left; }
thead th.is-active { color: var(--pl-accent); }
tbody th, tbody td { padding: 9px 10px; border-bottom: 1px solid var(--el-border-color-lighter, #eff2f6); text-align: left; color: var(--el-text-color-regular, #374151); }
tbody th { font-weight: 600; white-space: nowrap; color: var(--el-text-color-secondary, #6b7280); }
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
.pl-picking { margin-top: 22px; }
.pl-picking h3 { font-size: 16px; }
.pl-tips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
.pl-tip { padding: 14px 16px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 14px; background: #fff; }
.pl-tip-lead { display: inline-block; padding: 2px 9px; border-radius: 999px; background: var(--el-fill-color-light, #f3f4f6); font: 600 11px/1.7 ui-monospace, Consolas, monospace; color: var(--el-text-color-secondary, #6b7280); }
.pl-tip h4 { margin: 8px 0 6px; font-size: 13.5px; }
.pl-tip p { margin: 0; font-size: 12.5px; line-height: 1.75; color: var(--el-text-color-regular, #4b5563); }

/* 暗色主题 */
.dark-theme .pl { background: linear-gradient(180deg, #0e1512 0%, #0a100d 55%); border-color: rgba(120, 207, 155, .16); box-shadow: 0 1px 2px rgba(0, 0, 0, .5), 0 18px 44px -30px rgba(0, 0, 0, .9); }
.dark-theme .pl-head { border-color: rgba(120, 207, 155, .12); }
.dark-theme .pl-toggle, .dark-theme .pl-pick, .dark-theme .pl-detail-main, .dark-theme .pl-table-wrap, .dark-theme .pl-tip { background: #0f1713; border-color: rgba(120, 207, 155, .16); }
.dark-theme .pl-pick.is-active { border-color: var(--pick); }
.dark-theme .pl-specs { background: rgba(120, 207, 155, .12); border-color: rgba(120, 207, 155, .12); }
.dark-theme .pl-specs > div { background: #0f1713; }
.dark-theme .pl-year { color: #e6f0e9; }
.dark-theme .pl-eco li { background: var(--pl-tint); color: #dbe9df; }
.dark-theme thead th.is-active { color: #e6f0e9; }

@media (max-width: 1000px) {
  .pl-picker { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pl-tips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .pl-detail { grid-template-columns: minmax(0, 1fr); }
  .pl-three { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .pl { margin: 16px 12px; border-radius: 16px; }
  .pl-head, .pl-body { padding-left: 14px; padding-right: 14px; }
  .pl-specs { grid-template-columns: minmax(0, 1fr); }
  .pl-tips { grid-template-columns: minmax(0, 1fr); }
}
</style>
