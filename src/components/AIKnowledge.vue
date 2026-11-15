<template>
  <section id="ai-knowledge" class="ai-knowledge" aria-labelledby="ai-knowledge-title">
    <header class="heading">
      <h2 id="ai-knowledge-title"><button type="button" :aria-expanded="opened" aria-controls="ai-knowledge-content" @click="opened = !opened"><svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M9 12v2M15 12v2M12 4v3M8 19v2M16 19v2M2 11v4M22 11v4"/></svg> 人工智能知识 <span aria-hidden="true">{{ opened ? '⌃' : '⌄' }}</span></button></h2>
      <span class="muted">从概念到落地 · {{ entries.length }} 个知识点</span>
    </header>
    <div v-if="opened" id="ai-knowledge-content">
      <div class="intro"><span class="eyebrow">AI FIELD NOTES</span><h3>看懂人工智能的底层逻辑</h3><p>建议按「基础概念 → 机器学习 → 深度学习 → 大模型 → 应用与安全」的顺序阅读。每条包含定义、例子和常见误区。</p></div>
      <nav class="tabs" aria-label="人工智能知识分类"><button v-for="name in categories" :key="name" type="button" :aria-pressed="category === name" @click="category = name">{{ name || '全部知识' }}</button></nav>
      <label class="search"><span>搜索知识</span><input v-model="query" type="search" placeholder="试试：过拟合、Transformer、RAG、提示注入…" /></label>
      <p class="muted" role="status">找到 {{ filtered.length }} 个知识点 · 点击卡片展开说明</p>
      <div class="cards">
        <details v-for="entry in filtered" :key="entry.id" class="card">
          <summary><small>{{ entry.category }}</small><h3>{{ entry.title }}</h3><span class="term">{{ entry.term }}</span></summary>
          <p>{{ entry.description }}</p>
          <div class="example"><strong>举个例子</strong><p>{{ entry.example }}</p></div>
          <p class="pitfall"><strong>常见误区：</strong>{{ entry.pitfall }}</p>
        </details>
      </div>
      <div v-if="!filtered.length" class="empty">没有匹配的知识点。<button type="button" @click="query = ''; category = ''">重置筛选</button></div>
    </div>
  </section>
</template>
<script>
import { aiKnowledgeEntries, filterAIKnowledge } from '../data/ai-knowledge.mjs';
export default {
  name: 'AIKnowledge',
  data: () => ({ opened: false, entries: aiKnowledgeEntries, category: '', query: '' }),
  computed: {
    categories() { return ['', ...new Set(this.entries.map(entry => entry.category))]; },
    filtered() { return filterAIKnowledge(this.entries, this.category, this.query); },
  },
};
</script>
<style scoped>
.ai-knowledge{margin:24px 20px 32px;padding:20px;border:1px solid var(--el-border-color-light,#d7e4dc);border-radius:14px;background:var(--el-bg-color,#fff);color:var(--el-text-color-primary,#273b30);scroll-margin-top:80px;font-size:13px}
.heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
h2{margin:0;font-size:20px;font-weight:500}
.heading button{display:inline-flex;align-items:center;gap:7px;border:0;background:none;padding:0;font:inherit;color:inherit;text-align:left}
.ai-icon{width:19px;height:19px;flex:none}
button,input{font:inherit;color:inherit;border:1px solid var(--el-border-color,#d7e4dc);background:var(--el-fill-color-blank,#fff);border-radius:7px;padding:8px 11px;box-sizing:border-box}
button{cursor:pointer}
button:hover,button[aria-pressed="true"]{color:var(--ui-accent);background:var(--ui-accent-soft)}
button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--ui-accent,#338866);outline-offset:3px}
.muted,.term{color:var(--el-text-color-secondary,#65746c);line-height:1.8}
.intro{padding:22px;margin:20px 0;background:var(--ui-accent-soft,#eff7f3);border-radius:12px}
.eyebrow{font:11px/1.8 Consolas,monospace;letter-spacing:2px;color:var(--ui-accent,#338866)}
.intro h3{font-size:24px;margin:8px 0}
.intro p{margin:0;line-height:1.9}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
.search{display:flex;align-items:center;gap:12px}
.search input{flex:1;min-width:0}
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
.card{border:1px solid var(--el-border-color-light,#d7e4dc);border-radius:10px;padding:16px;min-width:0;overflow-wrap:anywhere}
.card summary{cursor:pointer;list-style-position:inside}
.card small{color:var(--ui-accent,#338866);font-size:11px}
.card h3{margin:8px 0;font-size:16px}
.term{font:12px/1.7 Consolas,monospace}
.card p{line-height:1.9}
.example{border-left:2px solid var(--ui-accent,#338866);padding:10px;background:var(--ui-accent-soft,#eff7f3);border-radius:0 6px 6px 0}
.example p{margin:5px 0}
.pitfall{color:var(--el-text-color-secondary,#65746c)}
.empty{padding:24px;text-align:center}
@media(max-width:760px){.ai-knowledge{margin:16px 12px;padding:14px}.cards{grid-template-columns:minmax(0,1fr)}.intro{padding:16px}.intro h3{font-size:21px}.heading .muted{font-size:12px}}
</style>
<style scoped>
.ai-knowledge{
  --el-bg-color:#c0c0c0;
  --el-fill-color-blank:#fff;
  --el-border-color:#808080;
  --el-border-color-light:#a4a4a4;
  --el-text-color-primary:#151515;
  --el-text-color-secondary:#414141;
  --ui-accent:#163673;
  --ui-accent-soft:#e7edf8;
  --field-bg:#fff;
  --field-text:#151515;
  --field-border:#808080;
  --field-font:Tahoma,"Microsoft YaHei",sans-serif;
  --win-raised:inset 1px 1px #fff,inset 2px 2px #dfdfdf,inset -1px -1px #111,inset -2px -2px #808080;
  --win-inset:inset 1px 1px #808080,inset 2px 2px #111,inset -1px -1px #fff,inset -2px -2px #dfdfdf;
  padding:4px;border:0;border-radius:0;box-shadow:var(--win-raised);font-family:var(--field-font);color-scheme:light;
}
.heading{padding:6px 9px;color:#fff;background:linear-gradient(90deg,#000080,#2257a2 65%,#3769aa)}
.heading .muted{color:#fff}
.heading h2{font-size:17px;font-weight:700}
#ai-knowledge-content{padding:0 10px 10px}
.ai-knowledge :is(.intro,.card,.example,button,input){border-radius:0}
.intro{background:#fff;box-shadow:var(--win-inset)}
.card{background:#efefef;box-shadow:inset 1px 1px #fff,inset -1px -1px #c0c0c0}
.card small,.eyebrow,.term{font-family:Consolas,"Microsoft YaHei",monospace}
.card small,.eyebrow{display:inline-block;padding:1px 5px;color:#163673;background:#e7edf8;border:1px solid #9aabc4}
.ai-knowledge button:not(.heading button){border:0;background:#c0c0c0;box-shadow:var(--win-raised)}
.ai-knowledge button:not(.heading button):hover{background:#d5d5d5}
.ai-knowledge button[aria-pressed="true"]{color:#fff;background:#244983;box-shadow:var(--win-inset)}
.ai-knowledge button[aria-pressed="true"]:hover{background:#31558e}
.ai-knowledge :is(button,summary):focus-visible{outline:2px solid #163673;outline-offset:2px}
.ai-knowledge .heading button:focus-visible{outline-color:#fff}
.ai-knowledge input{box-shadow:var(--win-inset)}
.ai-knowledge input:focus-visible{box-shadow:0 0 0 2px #31558e}
</style>
