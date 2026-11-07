<template>
  <section id="computer-fundamentals" class="fundamentals" aria-labelledby="fundamentals-title">
    <header class="heading">
      <h2 id="fundamentals-title"><button type="button" :aria-expanded="opened" aria-controls="fundamentals-content" @click="opened = !opened"><span aria-hidden="true">▦</span> 计算机底层知识 <span aria-hidden="true">{{ opened ? '⌃' : '⌄' }}</span></button></h2>
      <span class="muted">从一个 bit 到程序运行 · {{ entries.length }} 个知识点</span>
    </header>
    <div v-if="opened" id="fundamentals-content">
      <div class="intro"><span class="eyebrow">COMPUTER FUNDAMENTALS</span><h3>理解代码背后的机器</h3><p>沿着「数据表示 → CPU 执行 → 内存管理 → 系统协作 → 编译链接 → I/O」逐层探索。</p></div>
      <nav class="tabs" aria-label="底层知识分类"><button v-for="name in categories" :key="name" type="button" :aria-pressed="category === name" @click="category = name">{{ name || '全部知识' }}</button></nav>
      <label class="search"><span>搜索知识</span><input v-model="query" type="search" placeholder="试试：补码、缓存、进程、ABI…" /></label>
      <p class="muted" role="status">找到 {{ filtered.length }} 个知识点 · 展开卡片操作图解，再看示例和常见误区</p>
      <div class="cards"><details v-for="entry in filtered" :key="entry.id" class="card"><summary><small>{{ entry.category }}</small><h3>{{ entry.title }}</h3><span class="term">{{ entry.term }}</span></summary><ComputerKnowledgeDiagram :entry="entry" /><p>{{ entry.description }}</p><div class="example"><strong>举个例子</strong><p>{{ entry.example }}</p></div><p class="pitfall"><strong>常见误区：</strong>{{ entry.pitfall }}</p></details></div>
      <div v-if="!filtered.length" class="empty">没有匹配的知识点。<button type="button" @click="query = ''; category = ''">重置筛选</button></div>
      <div class="practice-grid">
        <section class="practice" aria-labelledby="byte-title"><span class="eyebrow">BYTE LAB</span><h3 id="byte-title">一个字节，多种解释</h3><label for="byte-value">输入 0–255 的十进制整数</label><input id="byte-value" v-model="byteInput" type="text" inputmode="numeric" maxlength="8" /><template v-if="byte"><dl><dt>二进制</dt><dd>{{ byte.binary }}</dd><dt>十六进制</dt><dd>0x{{ byte.hex }}</dd><dt>8 位补码解释</dt><dd>{{ byte.signed }}</dd><dt>按位取反（无符号）</dt><dd>{{ byte.inverse }}</dd><dt>值为 1 的位数</dt><dd>{{ byte.ones }}</dd></dl><div class="bits" aria-label="点击切换二进制位"><button v-for="(bit, i) in byte.binary" :key="i" type="button" :aria-label="'切换第 ' + (7-i) + ' 位，当前为 ' + bit" :aria-pressed="bit === '1'" @click="toggleBit(7-i)">{{ bit }}</button></div><p class="muted">点击位按钮切换 0 / 1，观察同一位模式的不同解释。</p></template><p v-else role="status">请输入 0–255 之间的整数，不含小数或负号。</p></section>
        <section class="practice" aria-labelledby="quiz-title"><span class="eyebrow">QUICK CHECK</span><h3 id="quiz-title">检验一下理解</h3><fieldset v-for="(item, index) in quiz" :key="item.question"><legend>{{ index + 1 }}. {{ item.question }}</legend><label v-for="(answer, a) in item.answers" :key="answer" class="answer"><input v-model="answers[index]" type="radio" :name="'fundamentals-quiz-' + index" :value="a" />{{ answer }}</label><p v-if="answers[index] !== undefined" role="status" class="explanation">{{ answers[index] === item.correct ? '✓ 回答正确。' : '再想一想。' }}{{ item.explanation }}</p></fieldset><button type="button" @click="answers = {}">重新自测</button></section>
      </div>
    </div>
  </section>
</template>
<script>
import ComputerKnowledgeDiagram from './ComputerKnowledgeDiagram.vue';
import { knowledgeEntries, inspectByte, filterKnowledge, quiz } from '../data/computer-fundamentals.mjs';
export default {
  name: 'ComputerFundamentals',
  components: { ComputerKnowledgeDiagram },
  data: () => ({ opened: false, entries: knowledgeEntries, category: '', query: '', byteInput: '255', quiz, answers: {} }),
  computed: {
    categories() { return ['', ...new Set(this.entries.map(entry => entry.category))]; },
    filtered() { return filterKnowledge(this.entries, this.category, this.query); },
    byte() { return inspectByte(this.byteInput); }
  },
  methods: { toggleBit(bit) { if (this.byte) this.byteInput = String(Number(this.byteInput) ^ (1 << bit)); } }
};
</script>
<style scoped>
.fundamentals{margin:24px 20px 32px;padding:20px;border:1px solid var(--el-border-color-light,#d7e4dc);border-radius:14px;background:var(--el-bg-color,#fff);color:var(--el-text-color-primary,#273b30);scroll-margin-top:80px;font-size:13px}.heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}h2{margin:0;font-size:20px;font-weight:500}.heading button{border:0;background:none;padding:0;font:inherit;color:inherit;text-align:left}button,input{font:inherit;color:inherit;border:1px solid var(--el-border-color,#d7e4dc);background:var(--el-fill-color-blank,#fff);border-radius:7px;padding:8px 11px;box-sizing:border-box}button{cursor:pointer}button:hover,button[aria-pressed="true"]{color:var(--ui-accent);background:var(--ui-accent-soft)}button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--ui-accent,#338866);outline-offset:3px}.muted,.term{color:var(--el-text-color-secondary,#65746c);line-height:1.8}.intro{padding:22px;margin:20px 0;background:var(--ui-accent-soft,#eff7f3);border-radius:12px}.eyebrow{font:11px/1.8 Consolas,monospace;letter-spacing:2px;color:var(--ui-accent,#338866)}.intro h3{font-size:24px;margin:8px 0}.intro p{margin:0;line-height:1.9}.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.search{display:flex;align-items:center;gap:12px}.search input{flex:1;min-width:0}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}.card,.practice{border:1px solid var(--el-border-color-light,#d7e4dc);border-radius:10px;padding:16px;min-width:0;overflow-wrap:anywhere}.card summary{cursor:pointer;list-style-position:inside}.card small{color:var(--ui-accent,#338866);font-size:11px}.card h3{margin:8px 0;font-size:16px}.term{font:12px/1.7 Consolas,monospace}.card p{line-height:1.9}.example{border-left:2px solid var(--ui-accent,#338866);padding:10px;background:var(--ui-accent-soft,#eff7f3);border-radius:0 6px 6px 0}.example p{margin:5px 0}.pitfall{color:var(--el-text-color-secondary,#65746c)}.practice-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}.practice h3{font-size:18px;margin:8px 0 18px}.practice>input{display:block;width:100%;margin:8px 0}.practice dl{display:grid;grid-template-columns:1fr 1fr;gap:12px}.practice dd{margin:0;font-family:Consolas,monospace}.bits{display:flex;gap:5px;flex-wrap:wrap}.bits button{font-family:Consolas,monospace}.practice fieldset{border:0;border-top:1px solid var(--el-border-color-light,#d7e4dc);margin:14px 0;padding:12px 0}.practice legend{line-height:1.8}.answer{display:inline-flex;align-items:center;gap:5px;margin:6px 14px 6px 0}.explanation{line-height:1.8;color:var(--ui-accent,#338866)}.empty{padding:24px;text-align:center}@media(max-width:1100px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.fundamentals{margin:16px 12px;padding:14px}.cards,.practice-grid{grid-template-columns:minmax(0,1fr)}.intro{padding:16px}.intro h3{font-size:21px}.heading .muted{font-size:12px}}
</style>
