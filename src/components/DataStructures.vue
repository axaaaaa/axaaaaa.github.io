<template>
  <section id="data-structures" class="ds" aria-labelledby="ds-title">
    <header class="ds-head">
      <div class="ds-head-main">
        <span class="ds-badge">DATA STRUCTURES</span>
        <h2 id="ds-title">
          <button type="button" class="ds-title-btn" :aria-expanded="opened" aria-controls="ds-content" @click="opened = !opened">
            数据结构知识
            <svg class="ds-caret" :style="{ transform: opened ? 'rotate(180deg)' : 'none' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </h2>
        <p class="ds-sub">{{ dataStructures.length }} 种结构 · 复杂度速查 · 典型场景 · 可直接跑的例子</p>
      </div>
      <div class="ds-head-actions">
        <label class="ds-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="query" type="search" class="ds-search" placeholder="搜索：链表 / 缓存 / O(log n)" aria-label="搜索数据结构" />
        </label>
        <button type="button" class="ds-toggle" :aria-expanded="opened" aria-controls="ds-content" @click="opened = !opened">{{ opened ? '收起' : '展开' }}</button>
      </div>
    </header>

    <div v-if="opened" id="ds-content" class="ds-body">
      <nav class="ds-groups" aria-label="数据结构分组">
        <button v-for="g in dsGroups" :key="g.id" type="button" :aria-pressed="group === g.id" @click="group = g.id">
          {{ g.name }}<span>{{ countOf(g.id) }}</span>
        </button>
      </nav>

      <div class="ds-layout">
        <aside class="ds-list" aria-label="数据结构列表">
          <button
            v-for="item in filtered"
            :key="item.id"
            type="button"
            class="ds-item"
            :class="{ 'is-active': item.id === active.id }"
            :aria-pressed="item.id === active.id"
            @click="activeId = item.id"
          >
            <span class="ds-item-name">{{ item.name }}</span>
            <span class="ds-item-en">{{ item.en }}</span>
          </button>
          <p v-if="!filtered.length" class="ds-empty">没有匹配的结构。<button type="button" @click="query = ''; group = 'all'">重置筛选</button></p>
        </aside>

        <article class="ds-detail" aria-live="polite">
          <header class="ds-detail-head">
            <div class="ds-detail-title">
              <h3>{{ active.name }}<span>{{ active.en }}</span></h3>
              <p class="ds-summary">{{ active.summary }}</p>
            </div>
            <span class="ds-space">空间 {{ active.space }}</span>
          </header>

          <ul class="ds-props">
            <li v-for="prop in active.props" :key="prop">{{ prop }}</li>
          </ul>

          <div class="ds-ops">
            <div v-for="op in active.ops" :key="op[0]" class="ds-op" :data-tone="tone(op[1])">
              <span class="ds-op-label">{{ op[0] }}</span>
              <strong>{{ op[1] }}</strong>
              <small>{{ op[2] }}</small>
            </div>
          </div>

          <figure class="ds-code">
            <figcaption><span>示例</span> JavaScript</figcaption>
            <pre><code>{{ active.code }}</code></pre>
          </figure>

          <div class="ds-two">
            <section>
              <h4>典型场景</h4>
              <ul class="ds-uses"><li v-for="use in active.uses" :key="use">{{ use }}</li></ul>
            </section>
            <section>
              <h4>容易踩的坑</h4>
              <ul class="ds-pitfalls"><li v-for="pit in active.pitfalls" :key="pit">{{ pit }}</li></ul>
            </section>
          </div>
        </article>
      </div>

      <section class="ds-demo" aria-labelledby="ds-demo-title">
        <header class="ds-demo-head">
          <div>
            <h3 id="ds-demo-title">动手感受：栈与队列</h3>
            <p>{{ demo.mode === 'stack' ? '栈是 LIFO —— 最后进来的，最先出去。' : '队列是 FIFO —— 最先进来的，最先出去。' }}</p>
          </div>
          <div class="ds-seg" role="group" aria-label="切换演示结构">
            <button type="button" :aria-pressed="demo.mode === 'stack'" @click="switchMode('stack')">栈 LIFO</button>
            <button type="button" :aria-pressed="demo.mode === 'queue'" @click="switchMode('queue')">队列 FIFO</button>
          </div>
        </header>

        <div class="ds-demo-controls">
          <input v-model="demo.value" type="text" maxlength="6" :placeholder="demo.mode === 'stack' ? '输入一个值，回车入栈' : '输入一个值，回车入队'" aria-label="要放入的值" @keyup.enter="push" />
          <button type="button" class="ds-primary" @click="push">{{ demo.mode === 'stack' ? '入栈 push' : '入队 enqueue' }}</button>
          <button type="button" @click="pop">{{ demo.mode === 'stack' ? '出栈 pop' : '出队 dequeue' }}</button>
          <button type="button" class="ds-ghost" @click="resetDemo">清空</button>
        </div>

        <div class="ds-stage">
          <transition-group v-if="demo.items.length" name="ds-cell" tag="div" class="ds-cells" :class="demo.mode === 'stack' ? 'is-stack' : 'is-queue'">
            <span
              v-for="(cell, index) in demo.items"
              :key="cell.key"
              class="ds-cell"
              :class="{
                'is-top': demo.mode === 'stack' && index === demo.items.length - 1,
                'is-front': demo.mode === 'queue' && index === 0,
              }"
            >
              {{ cell.value }}
              <em v-if="edgeTag(index)" class="ds-cell-tag" :class="{ 'is-edge-primary': isPrimaryEdge(index) }">{{ edgeTag(index) }}</em>
            </span>
          </transition-group>
          <p v-else class="ds-stage-empty">还没有元素。随便输入一个值，点「{{ demo.mode === 'stack' ? '入栈' : '入队' }}」试试。</p>
          <p class="ds-stage-note">{{ demo.note }}</p>
        </div>
      </section>

      <section class="ds-table-wrap" aria-labelledby="ds-table-title">
        <header class="ds-table-head">
          <h3 id="ds-table-title">复杂度总览</h3>
          <p>{{ dsComplexityNote }}</p>
        </header>
        <div class="ds-table-scroll">
          <table>
            <thead>
              <tr><th scope="col">结构</th><th scope="col">访问</th><th scope="col">查找</th><th scope="col">插入</th><th scope="col">删除</th><th scope="col">空间</th></tr>
            </thead>
            <tbody>
              <tr
                v-for="item in dataStructures"
                :key="item.id"
                :class="{ 'is-active': item.id === activeId }"
                @click="activeId = item.id"
              >
                <th scope="row">{{ item.name }}</th>
                <td v-for="op in item.ops" :key="op[0]"><span class="ds-o" :data-tone="tone(op[1])">{{ op[1] }}</span></td>
                <td><span class="ds-o" :data-tone="tone(item.space)">{{ item.space }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { dataStructures, dsGroups, dsComplexityNote } from '../data/data-structures.mjs';

const nextKey = () => (nextKey.seed = (nextKey.seed || 0) + 1);

export default {
  name: 'DataStructures',
  data() {
    return {
      opened: true,
      dataStructures,
      dsGroups,
      dsComplexityNote,
      group: 'all',
      query: '',
      activeId: dataStructures[0].id,
      demo: {
        mode: 'stack',
        value: '',
        items: [],
        note: '试试连续入栈三个值，再点两次出栈 —— 最后进来的会最先出去。',
      },
    };
  },
  computed: {
    filtered() {
      const kw = this.query.trim().toLowerCase();
      return this.dataStructures.filter((item) => {
        if (this.group !== 'all' && item.group !== this.group) return false;
        if (!kw) return true;
        return [item.name, item.en, item.summary, ...item.props, ...item.uses, ...item.ops.map((op) => op[1])]
          .join(' ')
          .toLowerCase()
          .includes(kw);
      });
    },
    active() {
      const hit = this.filtered.find((item) => item.id === this.activeId);
      return hit || this.filtered[0] || this.dataStructures.find((item) => item.id === this.activeId) || this.dataStructures[0];
    },
  },
  watch: {
    group() {
      if (!this.filtered.some((item) => item.id === this.activeId) && this.filtered.length) this.activeId = this.filtered[0].id;
    },
    query() {
      if (!this.filtered.some((item) => item.id === this.activeId) && this.filtered.length) this.activeId = this.filtered[0].id;
    },
  },
  methods: {
    countOf(groupId) {
      return groupId === 'all' ? this.dataStructures.length : this.dataStructures.filter((item) => item.group === groupId).length;
    },
    // 把复杂度映射成颜色档位：越接近常数越「绿」
    tone(value) {
      if (!value || value === '—') return 'none';
      if (value.includes('α')) return 'great';
      if (value === 'O(1)') return 'great';
      if (value.includes('log n') && value.includes('n log')) return 'mid';
      if (value.includes('log')) return 'good';
      if (value === 'O(m)') return 'good';
      if (value.includes('V+E')) return 'warn';
      if (value.includes('n log')) return 'mid';
      if (value.includes('n')) return 'warn';
      return 'none';
    },
    // 给首尾元素打标：栈 → 栈顶 / 栈底；队列 → 队头 / 队尾
    edgeTag(index) {
      const total = this.demo.items.length;
      const stack = this.demo.mode === 'stack';
      const head = stack ? '栈顶' : '队头';
      const tail = stack ? '栈底' : '队尾';
      const isHead = stack ? index === total - 1 : index === 0;
      const isTail = stack ? index === 0 : index === total - 1;
      if (total === 1) return `${head} · ${tail}`;
      if (isHead) return head;
      if (isTail) return tail;
      return '';
    },
    // 栈顶 / 队头用主色强调，另一端用弱化色
    isPrimaryEdge(index) {
      const total = this.demo.items.length;
      return this.demo.mode === 'stack' ? index === total - 1 : index === 0;
    },
    switchMode(mode) {
      if (this.demo.mode === mode) return;
      this.demo.mode = mode;
      this.demo.items = [];
      this.demo.note = mode === 'stack'
        ? '栈顶就是数组末尾，显示在最上方：入栈往上叠，出栈也从上面拿走。'
        : '队头在上、队尾在下：入队往下方追加，出队从上方移除。';
    },
    push() {
      const items = this.demo.items;
      if (items.length >= 9) {
        this.demo.note = '演示区最多放 9 个元素，先出几个再继续。';
        return;
      }
      const value = (this.demo.value || '').trim() || String.fromCharCode(65 + ((nextKey.seed || 0) % 26));
      items.push({ key: nextKey(), value });
      this.demo.value = '';
      this.demo.note = this.demo.mode === 'stack'
        ? `「${value}」压入栈顶，现在栈顶是它。`
        : `「${value}」排到队尾，队头仍是「${items[0].value}」。`;
    },
    pop() {
      const items = this.demo.items;
      if (!items.length) {
        this.demo.note = '里面是空的，先放一个元素进来。';
        return;
      }
      const cell = this.demo.mode === 'stack' ? items.pop() : items.shift();
      this.demo.note = this.demo.mode === 'stack'
        ? `取走栈顶「${cell.value}」—— 它是最晚进来的。`
        : `取走队头「${cell.value}」—— 它是最早进来的。`;
    },
    resetDemo() {
      this.demo.items = [];
      this.demo.note = '已清空，重新开始。';
    },
  },
};
</script>

<style scoped>
.ds {
  margin: 24px 20px 32px;
  border: 1px solid var(--el-border-color-light, #e3e8ef);
  border-radius: 20px;
  background: linear-gradient(180deg, #fbfcff 0%, #fff 44%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 18px 44px -30px rgba(15, 23, 42, .45);
  color: var(--el-text-color-primary, #1f2937);
  font-size: 13px;
  scroll-margin-top: 80px;
  overflow: hidden;
}
.ds-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, .06);
}
.ds-head-main { min-width: 0; }
.ds-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--ui-accent-soft, #e8f1ec);
  color: var(--ui-accent, #386a50);
  font: 600 10px/1.7 ui-monospace, Consolas, monospace;
  letter-spacing: .16em;
}
h2 { margin: 10px 0 0; font-size: 21px; font-weight: 600; letter-spacing: -.01em; }
.ds-title-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.ds-caret { width: 16px; height: 16px; opacity: .45; transition: transform .22s ease; }
.ds-sub { margin: 6px 0 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.ds-head-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ds-search-wrap { position: relative; display: inline-flex; align-items: center; }
.ds-search-wrap svg { position: absolute; left: 11px; width: 14px; height: 14px; color: var(--el-text-color-secondary, #94a3b8); pointer-events: none; }
.ds-search {
  width: 232px;
  padding: 8px 12px 8px 32px;
  border: 1px solid var(--el-border-color, #e5e7eb);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  color: inherit;
  transition: border-color .18s, box-shadow .18s;
}
.ds-search:focus { border-color: var(--ui-accent, #386a50); box-shadow: 0 0 0 3px var(--ui-accent-soft, #e8f1ec); }
.ds-toggle {
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
.ds-toggle:hover { border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); transform: translateY(-1px); }
.ds-body { padding: 18px 22px 24px; }
.ds-groups { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.ds-groups button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--el-border-color-light, #e5e7eb);
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 12px;
  color: var(--el-text-color-regular, #4b5563);
  cursor: pointer;
  transition: background .16s, border-color .16s, color .16s;
}
.ds-groups button span { padding: 1px 6px; border-radius: 999px; background: var(--el-fill-color-light, #f3f4f6); font-size: 10px; color: var(--el-text-color-secondary, #6b7280); }
.ds-groups button:hover { border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); }
.ds-groups button[aria-pressed="true"] { background: var(--ui-accent, #386a50); border-color: var(--ui-accent, #386a50); color: #fff; }
.ds-groups button[aria-pressed="true"] span { background: rgba(255, 255, 255, .22); color: #fff; }
.ds-layout { display: grid; grid-template-columns: 208px minmax(0, 1fr); gap: 16px; align-items: start; }
.ds-list { display: flex; flex-direction: column; gap: 4px; min-width: 0; max-height: 548px; overflow-y: auto; padding-right: 2px; scrollbar-width: thin; scrollbar-color: var(--el-border-color, #d7dde5) transparent; -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 22px), transparent 100%); mask-image: linear-gradient(to bottom, #000 calc(100% - 22px), transparent 100%); }
.ds-list::-webkit-scrollbar { width: 6px; }
.ds-list::-webkit-scrollbar-thumb { background: var(--el-border-color, #d7dde5); border-radius: 999px; }
.ds-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  font: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: background .16s, border-color .16s, box-shadow .16s;
}
.ds-item:hover { background: var(--ui-accent-soft, #eef4f0); }
.ds-item.is-active {
  background: #fff;
  border-color: var(--ui-accent, #386a50);
  box-shadow: 0 8px 20px -18px rgba(15, 23, 42, .9);
}
.ds-item-name { font-size: 13px; font-weight: 600; }
.ds-item.is-active .ds-item-name { color: var(--ui-accent, #386a50); }
.ds-item-en { font: 11px/1.4 ui-monospace, Consolas, monospace; color: var(--el-text-color-secondary, #94a3b8); }
.ds-empty { margin: 8px 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.ds-empty button { margin-left: 6px; border: 0; background: none; color: var(--ui-accent, #386a50); font: inherit; text-decoration: underline; cursor: pointer; }
.ds-detail {
  min-width: 0;
  padding: 18px 20px 20px;
  border: 1px solid var(--el-border-color-light, #e8ecf1);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 30px -28px rgba(15, 23, 42, .8);
}
.ds-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.ds-detail-title { min-width: 0; }
h3 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.01em; }
h3 span { margin-left: 8px; font: 12px/1 ui-monospace, Consolas, monospace; color: var(--el-text-color-secondary, #94a3b8); letter-spacing: .01em; }
.ds-space { flex: 0 0 auto; padding: 4px 10px; border-radius: 999px; background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); font: 11px/1.6 ui-monospace, Consolas, monospace; white-space: nowrap; }
.ds-summary { margin: 10px 0 0; line-height: 1.85; color: var(--el-text-color-regular, #4b5563); }
.ds-props { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; padding: 0; list-style: none; }
.ds-props li { padding: 4px 10px; border-radius: 999px; background: var(--el-fill-color-light, #f4f6f8); color: var(--el-text-color-regular, #4b5563); font-size: 11.5px; }
.ds-ops { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.ds-op { display: flex; flex-direction: column; gap: 3px; padding: 11px 12px; border-radius: 12px; background: var(--el-fill-color-light, #f7f8fa); }
.ds-op-label { font-size: 11px; color: var(--el-text-color-secondary, #6b7280); }
.ds-op strong { font: 600 16px/1.25 ui-monospace, Consolas, monospace; color: #0f172a; }
.ds-op small { font-size: 10.5px; line-height: 1.45; color: var(--el-text-color-secondary, #6b7280); }
.ds-code { margin: 16px 0 0; border: 1px solid #1b2531; border-radius: 14px; background: #0b1220; overflow: hidden; }
.ds-code figcaption { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid rgba(255, 255, 255, .07); background: rgba(255, 255, 255, .03); font: 11px/1.4 ui-monospace, Consolas, monospace; color: #8ea2bd; }
.ds-code figcaption span { color: #cfe0f5; }
.ds-code pre { margin: 0; padding: 12px 14px; overflow-x: auto; font: 12px/1.8 ui-monospace, Consolas, monospace; color: #d6e4f7; tab-size: 2; }
.ds-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 16px; }
.ds-two h4 { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--el-text-color-secondary, #94a3b8); }
.ds-uses, .ds-pitfalls { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }
.ds-uses li, .ds-pitfalls li { position: relative; padding-left: 16px; font-size: 12.5px; line-height: 1.7; color: var(--el-text-color-regular, #4b5563); }
.ds-uses li::before { content: ''; position: absolute; left: 1px; top: 8px; width: 6px; height: 6px; border-radius: 2px; background: var(--ui-accent, #386a50); }
.ds-pitfalls li::before { content: ''; position: absolute; left: 2px; top: 8px; width: 6px; height: 6px; background: #d97706; transform: rotate(45deg); }
.ds-demo { margin-top: 22px; padding: 18px 20px 20px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 16px; background: linear-gradient(180deg, #f8fbff, #fff); }
.ds-demo-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.ds-demo-head h3 { font-size: 16px; }
.ds-demo-head p { margin: 6px 0 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.ds-seg { display: inline-flex; gap: 2px; padding: 3px; border-radius: 999px; background: var(--el-fill-color, #f1f3f6); }
.ds-seg button { padding: 6px 13px; border: 0; border-radius: 999px; background: transparent; font: inherit; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); cursor: pointer; transition: background .16s, color .16s; }
.ds-seg button[aria-pressed="true"] { background: #fff; color: var(--ui-accent, #386a50); font-weight: 600; box-shadow: 0 1px 3px rgba(15, 23, 42, .12); }
.ds-demo-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.ds-demo-controls input { flex: 1 1 180px; min-width: 0; padding: 9px 12px; border: 1px solid var(--el-border-color, #e5e7eb); border-radius: 10px; background: #fff; font: inherit; font-size: 12.5px; color: inherit; }
.ds-demo-controls button { padding: 9px 14px; border: 1px solid var(--el-border-color, #e5e7eb); border-radius: 10px; background: #fff; font: inherit; font-size: 12.5px; color: inherit; cursor: pointer; transition: border-color .16s, transform .16s, background .16s; }
.ds-demo-controls button:hover { border-color: var(--ui-accent, #386a50); transform: translateY(-1px); }
.ds-demo-controls .ds-primary { background: var(--ui-accent, #386a50); border-color: var(--ui-accent, #386a50); color: #fff; }
.ds-demo-controls .ds-ghost { color: var(--el-text-color-secondary, #6b7280); }
.ds-stage { display: flex; flex-direction: column; justify-content: center; gap: 10px; min-height: 104px; margin-top: 12px; padding: 14px; border: 1px dashed var(--el-border-color, #dbe2ea); border-radius: 12px; background: #fff; }
.ds-cells { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.ds-cells.is-stack { flex-direction: column-reverse; }
.ds-cell { position: relative; min-width: 96px; padding: 7px 12px; border: 1px solid transparent; border-radius: 10px; background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); font: 600 13px/1.3 ui-monospace, Consolas, monospace; text-align: center; }
.ds-cell-tag {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--el-fill-color-light, #f3f4f6);
  color: var(--el-text-color-secondary, #6b7280);
  font: 500 10.5px/1.6 ui-monospace, Consolas, monospace;
  font-style: normal;
  white-space: nowrap;
}
.ds-cell-tag.is-edge-primary { background: var(--ui-accent, #386a50); color: #fff; }
.ds-cell.is-top, .ds-cell.is-front { border-color: var(--ui-accent, #386a50); box-shadow: 0 0 0 3px rgba(56, 106, 80, .12); }
.ds-stage-empty { margin: 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.ds-stage-note { margin: 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.ds-cell-enter-from, .ds-cell-leave-to { opacity: 0; transform: translateY(8px) scale(.94); }
.is-stack .ds-cell-enter-from, .is-stack .ds-cell-leave-to { transform: translateY(-8px) scale(.94); }
.ds-cell-enter-active, .ds-cell-leave-active { transition: opacity .2s ease, transform .2s ease; }
.ds-cell-move { transition: transform .2s ease; }
.ds-table-wrap { margin-top: 22px; padding: 18px 20px 8px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 16px; background: #fff; }
.ds-table-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ds-table-head h3 { font-size: 16px; }
.ds-table-head p { margin: 0; font-size: 11.5px; color: var(--el-text-color-secondary, #94a3b8); }
.ds-table-scroll { margin-top: 10px; overflow-x: auto; }
table { width: 100%; min-width: 580px; border-collapse: collapse; font-size: 12px; }
thead th { padding: 8px 10px; border-bottom: 1px solid var(--el-border-color-light, #e8ecf1); font-size: 10.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--el-text-color-secondary, #94a3b8); text-align: left; }
tbody th, tbody td { padding: 9px 10px; border-bottom: 1px solid var(--el-border-color-lighter, #eff2f6); text-align: left; }
tbody th { font-weight: 600; white-space: nowrap; }
tbody tr { cursor: pointer; transition: background .15s; }
tbody tr:hover, tbody tr.is-active { background: var(--ui-accent-soft, #f2f7f4); }
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
.ds-o { display: inline-block; padding: 2px 8px; border-radius: 999px; font: 600 11.5px/1.65 ui-monospace, Consolas, monospace; }
.ds-op[data-tone="great"] { background: #eef9f3; }
.ds-op[data-tone="great"] strong { color: #0f7f57; }
.ds-op[data-tone="good"] { background: #edf3fd; }
.ds-op[data-tone="good"] strong { color: #2563b0; }
.ds-op[data-tone="mid"] { background: #f3eeff; }
.ds-op[data-tone="mid"] strong { color: #6d43d8; }
.ds-op[data-tone="warn"] { background: #fff5e8; }
.ds-op[data-tone="warn"] strong { color: #b45309; }
.ds-o[data-tone="great"] { background: #e6f7ee; color: #0f7f57; }
.ds-o[data-tone="good"] { background: #e9f1fd; color: #2563b0; }
.ds-o[data-tone="mid"] { background: #f1ecff; color: #6d43d8; }
.ds-o[data-tone="warn"] { background: #fff3e3; color: #b45309; }
.ds-o[data-tone="none"] { background: var(--el-fill-color-light, #f3f4f6); color: var(--el-text-color-secondary, #94a3b8); }

/* 暗色主题 */
.dark-theme .ds { background: linear-gradient(180deg, #0e1512 0%, #0a100d 55%); border-color: rgba(120, 207, 155, .16); box-shadow: 0 1px 2px rgba(0, 0, 0, .5), 0 18px 44px -30px rgba(0, 0, 0, .9); }
.dark-theme .ds-head { border-color: rgba(120, 207, 155, .12); }
.dark-theme .ds-search, .dark-theme .ds-toggle, .dark-theme .ds-demo-controls input, .dark-theme .ds-demo-controls button { background: #0f1713; border-color: rgba(120, 207, 155, .2); color: var(--el-text-color-primary); }
.dark-theme .ds-groups button[aria-pressed="true"] { color: #0b120d; }
.dark-theme .ds-groups button[aria-pressed="true"] span { background: rgba(0, 0, 0, .18); color: #0b120d; }
.dark-theme .ds-item.is-active { background: #121b16; border-color: rgba(140, 220, 175, .45); }
.dark-theme .ds-detail, .dark-theme .ds-stage, .dark-theme .ds-table-wrap { background: #0f1713; border-color: rgba(120, 207, 155, .14); }
.dark-theme .ds-demo { background: linear-gradient(180deg, #0d1512, #0b110e); border-color: rgba(120, 207, 155, .14); }
.dark-theme .ds-seg { background: rgba(255, 255, 255, .05); }
.dark-theme .ds-seg button[aria-pressed="true"] { background: #16211b; color: var(--ui-accent, #b0d4ba); }
.dark-theme .ds-op strong, .dark-theme .ds-detail h3 { color: #dbe9df; }
.dark-theme .ds-op[data-tone="great"] { background: rgba(60, 200, 130, .12); }
.dark-theme .ds-op[data-tone="great"] strong { color: #8fe6b8; }
.dark-theme .ds-op[data-tone="good"] { background: rgba(90, 150, 240, .13); }
.dark-theme .ds-op[data-tone="good"] strong { color: #9cc2ff; }
.dark-theme .ds-op[data-tone="mid"] { background: rgba(150, 120, 250, .14); }
.dark-theme .ds-op[data-tone="mid"] strong { color: #c6b0ff; }
.dark-theme .ds-op[data-tone="warn"] { background: rgba(240, 170, 60, .13); }
.dark-theme .ds-op[data-tone="warn"] strong { color: #f3c27c; }
.dark-theme .ds-o[data-tone="great"] { background: rgba(60, 200, 130, .14); color: #8fe6b8; }
.dark-theme .ds-o[data-tone="good"] { background: rgba(90, 150, 240, .15); color: #9cc2ff; }
.dark-theme .ds-o[data-tone="mid"] { background: rgba(150, 120, 250, .16); color: #c6b0ff; }
.dark-theme .ds-o[data-tone="warn"] { background: rgba(240, 170, 60, .15); color: #f3c27c; }
.dark-theme .ds-code { border-color: rgba(120, 207, 155, .18); }
.dark-theme .ds-cell-tag { background: rgba(255, 255, 255, .07); color: #9fb2a7; }
.dark-theme .ds-cell-tag.is-edge-primary { background: var(--ui-accent, #386a50); color: #0b120d; }

@media (max-width: 900px) {
  .ds-layout { grid-template-columns: minmax(0, 1fr); }
  .ds-list { flex-direction: row; gap: 6px; max-height: none; overflow-x: auto; overflow-y: hidden; padding: 0 0 4px; }
  .ds-item { flex: 0 0 auto; border-color: var(--el-border-color-light, #e5e7eb); background: #fff; }
  .dark-theme .ds-item { background: #0f1713; }
  .ds-ops { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ds-two { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .ds { margin: 16px 12px; border-radius: 16px; }
  .ds-head, .ds-body { padding-left: 14px; padding-right: 14px; }
  .ds-search { width: 100%; }
  .ds-head-actions { width: 100%; }
  .ds-search-wrap { flex: 1 1 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-cell-enter-active, .ds-cell-leave-active, .ds-cell-move { transition: none; }
  .ds-caret, .ds-toggle, .ds-demo-controls button { transition: none; }
}
</style>
