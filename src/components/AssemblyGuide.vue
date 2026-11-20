<template>
  <section id="assembly-guide" class="asm" aria-labelledby="asm-title">
    <header class="asm-head">
      <div class="asm-head-main">
        <span class="asm-badge">ASSEMBLY</span>
        <h2 id="asm-title">
          <button type="button" class="asm-title-btn" :aria-expanded="opened" aria-controls="asm-content" @click="opened = !opened">
            汇编语言教程
            <svg class="asm-caret" :style="{ transform: opened ? 'rotate(180deg)' : 'none' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </h2>
        <p class="asm-sub">x86-64 与 ARM64 · 寄存器 · 指令集 · 寻址方式 · 调用约定 · 可跑示例</p>
      </div>
      <button type="button" class="asm-toggle" :aria-expanded="opened" aria-controls="asm-content" @click="opened = !opened">{{ opened ? '收起' : '展开' }}</button>
    </header>

    <div v-if="opened" id="asm-content" class="asm-body">
      <nav class="asm-tabs" aria-label="汇编教程章节">
        <button v-for="t in tabs" :key="t.id" type="button" :aria-pressed="tab === t.id" @click="tab = t.id">{{ t.label }}</button>
      </nav>

      <!-- CPU 架构 -->
      <div v-if="tab === 'arch'" class="asm-pane">
        <div class="asm-cards">
          <article v-for="card in archCards" :key="card.id" class="asm-arch" :style="{ '--card-accent': card.accent }">
            <header>
              <strong>{{ card.title }}</strong>
              <span>{{ card.tag }}</span>
            </header>
            <ul><li v-for="line in card.lines" :key="line">{{ line }}</li></ul>
          </article>
        </div>

        <h4 class="asm-h4">x86-64 与 ARM64 对照</h4>
        <div class="asm-scroll">
          <table class="asm-table">
            <thead><tr><th scope="col">维度</th><th scope="col">x86-64</th><th scope="col">ARM64</th><th scope="col">说明</th></tr></thead>
            <tbody>
              <tr v-for="row in archCompare" :key="row.k">
                <th scope="row">{{ row.k }}</th>
                <td>{{ row.x86 }}</td>
                <td>{{ row.arm }}</td>
                <td class="asm-muted">{{ row.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="asm-h4">一条指令是怎么走完的：五级流水</h4>
        <ol class="asm-pipe">
          <li v-for="(step, index) in pipeline" :key="step.en">
            <span class="asm-pipe-index">{{ index + 1 }}</span>
            <div>
              <strong>{{ step.step }}<em>{{ step.en }}</em></strong>
              <p>{{ step.desc }}</p>
            </div>
          </li>
        </ol>

        <div class="asm-two">
          <section>
            <h4 class="asm-h4">CPU 里这些部件在干什么</h4>
            <ul class="asm-defs"><li v-for="part in cpuParts" :key="part.name"><strong>{{ part.name }}</strong><span>{{ part.desc }}</span></li></ul>
          </section>
          <section>
            <h4 class="asm-h4">数据在内存里的样子</h4>
            <ul class="asm-defs"><li v-for="item in dataRep" :key="item.t"><strong>{{ item.t }}</strong><span>{{ item.d }}</span></li></ul>
          </section>
        </div>
      </div>

      <!-- 寄存器 -->
      <div v-else-if="tab === 'regs'" class="asm-pane">
        <div class="asm-seg" role="group" aria-label="选择指令集">
          <button type="button" :aria-pressed="platform === 'x86'" @click="platform = 'x86'">x86-64</button>
          <button type="button" :aria-pressed="platform === 'arm'" @click="platform = 'arm'">ARM64</button>
        </div>

        <div v-for="group in registerGroups" :key="group.id" class="asm-block">
          <h4 class="asm-h4">{{ group.title }}</h4>
          <p v-if="group.note" class="asm-note">{{ group.note }}</p>
          <div class="asm-scroll">
            <table class="asm-table">
              <thead><tr><th scope="col">寄存器</th><th scope="col">别名 / 视图</th><th scope="col">作用</th><th scope="col">备注</th></tr></thead>
              <tbody>
                <tr v-for="row in group.rows" :key="row.name">
                  <th scope="row"><code class="asm-reg">{{ row.name }}</code></th>
                  <td class="asm-mono">{{ row.alias }}</td>
                  <td>{{ row.role }}</td>
                  <td class="asm-muted">{{ row.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h4 class="asm-h4">调用约定（函数怎么传参、返回值放哪）</h4>
        <article class="asm-abi">
          <header><strong>{{ platform === 'x86' ? 'System V AMD64（Linux / macOS）' : 'AAPCS64（Linux / Android）' }}</strong><span>{{ abi.ret }}</span></header>
          <div class="asm-abi-args">
            <span v-for="(reg, index) in abi.args" :key="reg"><em>{{ index + 1 }}</em>{{ reg }}</span>
          </div>
          <dl>
            <div><dt>调用者保存</dt><dd>{{ abi.callerSaved }}</dd></div>
            <div><dt>被调用者保存</dt><dd>{{ abi.calleeSaved }}</dd></div>
            <div><dt>栈规则</dt><dd>{{ abi.stack }}</dd></div>
            <div><dt>特殊</dt><dd>{{ abi.redZone }}</dd></div>
          </dl>
        </article>
        <article v-if="platform === 'x86'" class="asm-abi is-secondary">
          <header><strong>Windows x64 调用约定</strong><span>{{ winAbi.ret }}</span></header>
          <div class="asm-abi-args">
            <span v-for="(reg, index) in winAbi.args" :key="reg"><em>{{ index + 1 }}</em>{{ reg }}</span>
          </div>
          <dl>
            <div><dt>调用者保存</dt><dd>{{ winAbi.callerSaved }}</dd></div>
            <div><dt>被调用者保存</dt><dd>{{ winAbi.calleeSaved }}</dd></div>
            <div><dt>栈规则</dt><dd>{{ winAbi.stack }}</dd></div>
            <div><dt>特殊</dt><dd>{{ winAbi.redZone }}</dd></div>
          </dl>
        </article>
      </div>

      <!-- 指令速查 -->
      <div v-else-if="tab === 'isa'" class="asm-pane">
        <div class="asm-seg" role="group" aria-label="选择指令集">
          <button type="button" :aria-pressed="platform === 'x86'" @click="platform = 'x86'">x86-64</button>
          <button type="button" :aria-pressed="platform === 'arm'" @click="platform = 'arm'">ARM64</button>
        </div>

        <div class="asm-toolbar">
          <label class="asm-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input v-model="query" type="search" placeholder="搜索：mov / 跳转 / 移位 / syscall" aria-label="搜索汇编指令" />
          </label>
          <span class="asm-count">{{ instructions.length }} 条</span>
        </div>

        <div class="asm-cats" role="group" aria-label="指令分类">
          <button v-for="cat in categories" :key="cat" type="button" :aria-pressed="activeCat === cat" @click="activeCat = cat">{{ cat }}</button>
        </div>

        <div class="asm-scroll">
          <table class="asm-table asm-isa">
            <thead>
              <tr><th scope="col">指令</th><th scope="col">操作数</th><th scope="col">作用</th><th v-if="platform === 'x86'" scope="col">标志位</th><th scope="col">示例</th></tr>
            </thead>
            <tbody>
              <tr v-for="ins in instructions" :key="ins.m">
                <th scope="row"><code class="asm-mn">{{ ins.m }}</code></th>
                <td class="asm-mono">{{ ins.ops }}</td>
                <td>{{ ins.desc }}</td>
                <td v-if="platform === 'x86'" class="asm-flags">{{ ins.flags }}</td>
                <td><pre class="asm-ex">{{ ins.ex }}</pre></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!instructions.length" class="asm-empty">没有匹配的指令，换个关键词试试。</p>
      </div>

      <!-- 寻址方式 -->
      <div v-else-if="tab === 'addr'" class="asm-pane">
        <p class="asm-note">操作数写法的本质是“去哪里取数据”。x86 的寻址模式编码在 ModRM 里，ARM 则把偏移与变址写进指令的位域。</p>
        <div class="asm-scroll">
          <table class="asm-table">
            <thead><tr><th scope="col">寻址方式</th><th scope="col">x86-64 写法</th><th scope="col">ARM64 写法</th><th scope="col">说明</th></tr></thead>
            <tbody>
              <tr v-for="mode in addressingModes" :key="mode.name">
                <th scope="row">{{ mode.name }}</th>
                <td><code class="asm-code-inline">{{ mode.x86 }}</code></td>
                <td><code class="asm-code-inline">{{ mode.arm }}</code></td>
                <td class="asm-muted">{{ mode.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 示例程序 -->
      <div v-else-if="tab === 'demo'" class="asm-pane">
        <article v-for="example in examples" :key="example.id" class="asm-example">
          <header>
            <div>
              <h4>{{ example.title }}</h4>
              <p>{{ example.desc }}</p>
            </div>
            <button type="button" class="asm-copy" @click="copyCode(example.id, example.code)">{{ copied === example.id ? '已复制 ✓' : '复制代码' }}</button>
          </header>
          <pre class="asm-source"><code>{{ example.code }}</code></pre>
          <div class="asm-run">
            <span>编译 / 运行</span>
            <pre>{{ example.run }}</pre>
          </div>
          <ul class="asm-tips"><li v-for="tip in example.tips" :key="tip">{{ tip }}</li></ul>
        </article>
      </div>

      <!-- 工具与坑 -->
      <div v-else class="asm-pane">
        <h4 class="asm-h4">常用工具</h4>
        <div class="asm-scroll">
          <table class="asm-table">
            <thead><tr><th scope="col">工具</th><th scope="col">用途</th><th scope="col">常用命令</th></tr></thead>
            <tbody>
              <tr v-for="tool in asmTools" :key="tool.name">
                <th scope="row">{{ tool.name }}</th>
                <td>{{ tool.use }}</td>
                <td><code class="asm-code-inline">{{ tool.cmd }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="asm-two">
          <section>
            <h4 class="asm-h4">GDB 单步调试速查</h4>
            <ul class="asm-defs">
              <li v-for="item in gdbCheatsheet" :key="item.cmd"><strong><code class="asm-code-inline">{{ item.cmd }}</code></strong><span>{{ item.desc }}</span></li>
            </ul>
          </section>
          <section>
            <h4 class="asm-h4">建议的学习顺序</h4>
            <ol class="asm-roadmap">
              <li v-for="step in asmRoadmap" :key="step.n"><span>{{ step.n }}</span><div><strong>{{ step.title }}</strong><p>{{ step.desc }}</p></div></li>
            </ol>
          </section>
        </div>

        <h4 class="asm-h4">最容易踩的坑</h4>
        <ul class="asm-pitfalls">
          <li v-for="pit in asmPitfalls" :key="pit.t"><strong>{{ pit.t }}</strong><span>{{ pit.d }}</span></li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import {
  asmTabs, archCards, archCompare, pipeline, cpuParts, dataRep,
  x86RegisterGroups, armRegisterGroups, sysvAbi, winAbi, armAbi,
  x86InstructionGroups, armInstructionGroups,
  addressingModes, examples, asmTools, gdbCheatsheet, asmPitfalls, asmRoadmap,
} from '../data/assembly.mjs';

export default {
  name: 'AssemblyGuide',
  data() {
    return {
      opened: false,
      tab: 'arch',
      platform: 'x86',
      query: '',
      activeCat: '全部',
      copied: '',
      tabs: asmTabs,
      archCards,
      archCompare,
      pipeline,
      cpuParts,
      dataRep,
      addressingModes,
      examples,
      asmTools,
      gdbCheatsheet,
      asmPitfalls,
      asmRoadmap,
    };
  },
  computed: {
    registerGroups() {
      return this.platform === 'x86' ? x86RegisterGroups : armRegisterGroups;
    },
    abi() {
      if (this.platform === 'x86') return sysvAbi;
      return armAbi;
    },
    winAbi() { return winAbi; },
    instructionGroups() {
      return this.platform === 'x86' ? x86InstructionGroups : armInstructionGroups;
    },
    categories() {
      return ['全部', ...this.instructionGroups.map(group => group.cat)];
    },
    instructions() {
      const keyword = this.query.trim().toLowerCase();
      return this.instructionGroups
        .filter(group => this.activeCat === '全部' || group.cat === this.activeCat)
        .flatMap(group => group.items)
        .filter(item => {
          if (!keyword) return true;
          return [item.m, item.ops, item.desc, item.ex, item.flags || ''].join(' ').toLowerCase().includes(keyword);
        });
    },
  },
  watch: {
    platform() {
      this.query = '';
      this.activeCat = '全部';
    },
  },
  methods: {
    copyCode(id, text) {
      const done = () => {
        this.copied = id;
        setTimeout(() => { if (this.copied === id) this.copied = ''; }, 1600);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => {});
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); done(); } finally { document.body.removeChild(area); }
      }
    },
  },
};
</script>

<style scoped>
.asm {
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
.asm-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 20px 22px 18px; border-bottom: 1px solid rgba(15, 23, 42, .06); }
.asm-head-main { min-width: 0; }
.asm-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; background: var(--ui-accent-soft, #e8f1ec); color: var(--ui-accent, #386a50); font: 600 10px/1.7 ui-monospace, Consolas, monospace; letter-spacing: .16em; }
h2 { margin: 10px 0 0; font-size: 21px; font-weight: 600; letter-spacing: -.01em; }
.asm-title-btn { display: inline-flex; align-items: center; gap: 8px; border: 0; padding: 0; background: none; font: inherit; color: inherit; cursor: pointer; }
.asm-caret { width: 16px; height: 16px; opacity: .45; transition: transform .22s ease; }
.asm-sub { margin: 6px 0 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.asm-toggle { padding: 8px 15px; border: 1px solid var(--el-border-color, #e5e7eb); border-radius: 999px; background: #fff; font: inherit; font-size: 12px; color: var(--el-text-color-regular, #374151); cursor: pointer; transition: border-color .18s, color .18s, transform .18s; }
.asm-toggle:hover { border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); transform: translateY(-1px); }
.asm-body { padding: 18px 22px 24px; }
.asm-tabs { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 14px; border-bottom: 1px solid rgba(15, 23, 42, .07); }
.asm-tabs button { padding: 7px 13px; border: 1px solid transparent; border-radius: 999px; background: transparent; font: inherit; font-size: 12.5px; color: var(--el-text-color-regular, #4b5563); cursor: pointer; transition: background .16s, color .16s, border-color .16s; }
.asm-tabs button:hover { background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); }
.asm-tabs button[aria-pressed="true"] { background: var(--ui-accent, #386a50); border-color: var(--ui-accent, #386a50); color: #fff; font-weight: 600; }
.asm-pane { padding-top: 16px; }
.asm-h4 { margin: 20px 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--el-text-color-secondary, #6b7280); }
.asm-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
.asm-arch { padding: 14px 16px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-left: 3px solid var(--card-accent, #386a50); border-radius: 12px; background: #fff; }
.asm-arch header { display: flex; align-items: baseline; gap: 8px; }
.asm-arch strong { font-size: 15px; }
.asm-arch header span { padding: 1px 7px; border-radius: 999px; background: var(--el-fill-color-light, #f3f4f6); font-size: 10px; color: var(--el-text-color-secondary, #6b7280); }
.asm-arch ul { margin: 9px 0 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px; }
.asm-arch li { font-size: 12.5px; line-height: 1.65; color: var(--el-text-color-regular, #4b5563); }
.asm-scroll { overflow-x: auto; }
.asm-table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 12px; }
.asm-table thead th { padding: 8px 10px; border-bottom: 1px solid var(--el-border-color-light, #e8ecf1); font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--el-text-color-secondary, #94a3b8); text-align: left; white-space: nowrap; }
.asm-table tbody th, .asm-table tbody td { padding: 9px 10px; border-bottom: 1px solid var(--el-border-color-lighter, #eff2f6); text-align: left; vertical-align: top; line-height: 1.6; }
.asm-table tbody th { font-weight: 600; white-space: nowrap; }
.asm-table tbody tr:last-child th, .asm-table tbody tr:last-child td { border-bottom: 0; }
.asm-table tbody tr:hover { background: var(--ui-accent-soft, #f4f9f6); }
.asm-muted { color: var(--el-text-color-secondary, #6b7280); }
.asm-mono { font: 11.5px/1.6 ui-monospace, Consolas, monospace; color: var(--el-text-color-regular, #4b5563); }
.asm-reg { padding: 1px 6px; border-radius: 5px; background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); font: 700 12px/1.6 ui-monospace, Consolas, monospace; }
.asm-mn { padding: 1px 7px; border-radius: 5px; background: #eef2ff; color: #1d4ed8; font: 700 12px/1.7 ui-monospace, Consolas, monospace; white-space: nowrap; }
.asm-code-inline { padding: 1px 6px; border-radius: 5px; background: #0b1220; color: #cfe0f5; font: 11.5px/1.7 ui-monospace, Consolas, monospace; white-space: pre-wrap; }
.asm-flags { font-size: 11px; color: #b45309; }
.asm-ex { margin: 0; font: 11.5px/1.65 ui-monospace, Consolas, monospace; color: #334155; white-space: pre-wrap; }
.asm-pipe { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.asm-pipe li { display: flex; gap: 9px; padding: 11px 12px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 12px; background: #fff; }
.asm-pipe-index { flex: none; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--ui-accent, #386a50); color: #fff; font: 700 10.5px/1 ui-monospace, Consolas, monospace; }
.asm-pipe strong { display: block; font-size: 12.5px; }
.asm-pipe strong em { margin-left: 6px; font: 11px/1 ui-monospace, Consolas, monospace; font-style: normal; color: var(--el-text-color-secondary, #94a3b8); }
.asm-pipe p { margin: 4px 0 0; font-size: 11.5px; line-height: 1.6; color: var(--el-text-color-secondary, #6b7280); }
.asm-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.asm-defs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.asm-defs li { display: flex; flex-direction: column; gap: 2px; padding: 9px 11px; border: 1px solid var(--el-border-color-light, #eef1f5); border-radius: 10px; background: #fff; }
.asm-defs strong { font-size: 12.5px; font-weight: 600; }
.asm-defs span { font-size: 11.5px; line-height: 1.65; color: var(--el-text-color-secondary, #6b7280); }
.asm-seg { display: inline-flex; gap: 2px; padding: 3px; margin-bottom: 4px; border-radius: 999px; background: var(--el-fill-color, #f1f3f6); }
.asm-seg button { padding: 6px 14px; border: 0; border-radius: 999px; background: transparent; font: inherit; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); cursor: pointer; transition: background .16s, color .16s; }
.asm-seg button[aria-pressed="true"] { background: #fff; color: var(--ui-accent, #386a50); font-weight: 600; box-shadow: 0 1px 3px rgba(15, 23, 42, .12); }
.asm-block { margin-top: 6px; }
.asm-note { margin: 0 0 6px; font-size: 11.5px; line-height: 1.7; color: var(--el-text-color-secondary, #6b7280); }
.asm-abi { margin-top: 10px; padding: 14px 16px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 12px; background: #fff; }
.asm-abi.is-secondary { background: #fcfcfd; }
.asm-abi header { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.asm-abi header strong { font-size: 13px; }
.asm-abi header span { font-size: 11.5px; color: var(--el-text-color-secondary, #6b7280); }
.asm-abi-args { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.asm-abi-args span { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); font: 700 11.5px/1.6 ui-monospace, Consolas, monospace; }
.asm-abi-args em { font-style: normal; opacity: .55; font-size: 10px; }
.asm-abi dl { margin: 0; display: grid; gap: 6px; }
.asm-abi dl div { display: grid; grid-template-columns: 84px minmax(0, 1fr); gap: 8px; }
.asm-abi dt { font-size: 11.5px; color: var(--el-text-color-secondary, #94a3b8); }
.asm-abi dd { margin: 0; font: 11.5px/1.65 ui-monospace, Consolas, monospace; color: var(--el-text-color-regular, #374151); overflow-wrap: anywhere; }
.asm-toolbar { display: flex; align-items: center; gap: 12px; margin: 12px 0 10px; }
.asm-search { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; padding: 0 11px; border: 1px solid var(--el-border-color, #e5e7eb); border-radius: 10px; background: #fff; }
.asm-search svg { width: 14px; height: 14px; flex: none; color: var(--el-text-color-secondary, #94a3b8); }
.asm-search input { flex: 1; min-width: 0; padding: 9px 0; border: 0; background: transparent; font: inherit; font-size: 12.5px; color: inherit; outline: none; }
.asm-count { flex: none; font-size: 11.5px; color: var(--el-text-color-secondary, #94a3b8); }
.asm-cats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.asm-cats button { padding: 5px 11px; border: 1px solid var(--el-border-color-light, #e5e7eb); border-radius: 999px; background: #fff; font: inherit; font-size: 11.5px; color: var(--el-text-color-secondary, #6b7280); cursor: pointer; transition: border-color .16s, color .16s, background .16s; }
.asm-cats button:hover { border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); }
.asm-cats button[aria-pressed="true"] { background: var(--ui-accent-soft, #e8f1ec); border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); font-weight: 600; }
.asm-isa tbody th { width: 108px; }
.asm-empty { margin: 10px 0 0; font-size: 12px; color: var(--el-text-color-secondary, #6b7280); }
.asm-example { margin-top: 14px; border: 1px solid var(--el-border-color-light, #e8ecf1); border-radius: 14px; background: #fff; overflow: hidden; }
.asm-example header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 13px 16px; border-bottom: 1px solid var(--el-border-color-lighter, #eff2f6); }
.asm-example h4 { margin: 0; font-size: 14px; font-weight: 600; }
.asm-example header p { margin: 5px 0 0; font-size: 11.5px; line-height: 1.65; color: var(--el-text-color-secondary, #6b7280); }
.asm-copy { flex: none; padding: 5px 11px; border: 1px solid var(--el-border-color, #e5e7eb); border-radius: 999px; background: #fff; font: inherit; font-size: 11.5px; color: var(--el-text-color-regular, #4b5563); cursor: pointer; transition: border-color .16s, color .16s; }
.asm-copy:hover { border-color: var(--ui-accent, #386a50); color: var(--ui-accent, #386a50); }
.asm-source { margin: 0; padding: 14px 16px; background: #0b1220; color: #d6e4f7; font: 12px/1.75 ui-monospace, Consolas, monospace; overflow-x: auto; tab-size: 2; }
.asm-run { display: flex; align-items: stretch; gap: 10px; padding: 11px 16px; border-top: 1px solid var(--el-border-color-lighter, #eff2f6); background: #fafbfc; }
.asm-run span { flex: none; padding-top: 2px; font-size: 11px; letter-spacing: .06em; color: var(--el-text-color-secondary, #94a3b8); }
.asm-run pre { margin: 0; min-width: 0; font: 11.5px/1.7 ui-monospace, Consolas, monospace; color: #334155; white-space: pre-wrap; overflow-wrap: anywhere; }
.asm-tips { margin: 0; padding: 12px 16px 14px 30px; display: flex; flex-direction: column; gap: 5px; border-top: 1px solid var(--el-border-color-lighter, #eff2f6); }
.asm-tips li { font-size: 11.5px; line-height: 1.7; color: var(--el-text-color-secondary, #6b7280); }
.asm-roadmap { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.asm-roadmap li { display: flex; gap: 10px; padding: 9px 11px; border: 1px solid var(--el-border-color-light, #eef1f5); border-radius: 10px; background: #fff; }
.asm-roadmap li > span { flex: none; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--ui-accent-soft, #eef4f0); color: var(--ui-accent, #386a50); font: 700 10.5px/1 ui-monospace, Consolas, monospace; }
.asm-roadmap strong { font-size: 12.5px; }
.asm-roadmap p { margin: 3px 0 0; font-size: 11.5px; line-height: 1.65; color: var(--el-text-color-secondary, #6b7280); }
.asm-pitfalls { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 10px; }
.asm-pitfalls li { padding: 11px 13px; border: 1px solid #f6e2c8; border-radius: 10px; background: #fffaf3; }
.asm-pitfalls strong { display: block; font-size: 12.5px; color: #b45309; }
.asm-pitfalls span { display: block; margin-top: 4px; font-size: 11.5px; line-height: 1.7; color: #7c5a30; }

/* 暗色主题 */
.dark-theme .asm { background: linear-gradient(180deg, #0e1512 0%, #0a100d 55%); border-color: rgba(120, 207, 155, .16); box-shadow: 0 1px 2px rgba(0, 0, 0, .5), 0 18px 44px -30px rgba(0, 0, 0, .9); }
.dark-theme .asm-head { border-color: rgba(120, 207, 155, .12); }
.dark-theme .asm-tabs { border-color: rgba(120, 207, 155, .12); }
.dark-theme .asm-toggle, .dark-theme .asm-search, .dark-theme .asm-cats button, .dark-theme .asm-copy { background: #0f1713; border-color: rgba(120, 207, 155, .2); color: var(--el-text-color-primary); }
.dark-theme .asm-arch, .dark-theme .asm-pipe li, .dark-theme .asm-defs li, .dark-theme .asm-abi, .dark-theme .asm-example, .dark-theme .asm-roadmap li, .dark-theme .asm-table tbody tr { background: #0f1713; border-color: rgba(120, 207, 155, .14); }
.dark-theme .asm-abi.is-secondary { background: #0d1411; }
.dark-theme .asm-tabs button[aria-pressed="true"] { color: #0b120d; }
.dark-theme .asm-seg { background: rgba(255, 255, 255, .05); }
.dark-theme .asm-seg button[aria-pressed="true"] { background: #16211b; color: var(--ui-accent, #b0d4ba); }
.dark-theme .asm-run { background: #0c1310; border-color: rgba(120, 207, 155, .12); }
.dark-theme .asm-run pre, .dark-theme .asm-ex { color: #b9cbc0; }
.dark-theme .asm-pitfalls li { background: rgba(240, 170, 60, .08); border-color: rgba(240, 170, 60, .28); }
.dark-theme .asm-pitfalls strong { color: #f3c27c; }
.dark-theme .asm-pitfalls span { color: #c9b191; }

@media (max-width: 900px) {
  .asm-two { grid-template-columns: minmax(0, 1fr); }
  .asm-abi dl div { grid-template-columns: 76px minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .asm { margin: 16px 12px; border-radius: 16px; }
  .asm-head, .asm-body { padding-left: 14px; padding-right: 14px; }
  .asm-pitfalls { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .asm-caret, .asm-toggle, .asm-copy { transition: none; }
}
</style>
