<template>
  <figure class="knowledge-diagram">
    <figcaption>可交互图解 · {{ entry.title }}</figcaption>
    <svg viewBox="0 0 540 144" role="img" :aria-label="entry.title + '概念关系示意：' + stages.map(s => s[0]).join('，')">
      <path d="M170 64H194L187 58M194 64L187 70M346 64H370L363 58M370 64L363 70" fill="none" stroke="currentColor" stroke-width="2" class="arrows" />
      <g v-for="(stage, index) in stages" :key="index" :transform="'translate(' + (index * 176 + 8) + ', 16)'" :class="{ active: step === index }">
        <rect width="164" height="106" rx="14" />
        <circle cx="24" cy="24" r="12" /><text x="24" y="28" text-anchor="middle" class="number">{{ index + 1 }}</text>
        <text x="82" y="61" text-anchor="middle" class="node-title">{{ stage[0] }}</text>
        <text x="82" y="84" text-anchor="middle" class="node-subtitle">{{ stage[1] }}</text>
      </g>
    </svg>
    <div class="step-buttons" role="group" :aria-label="entry.title + '图解步骤'"><button v-for="(stage, index) in stages" :key="index" type="button" :aria-pressed="step === index" @click="step = index">{{ index + 1 }} · {{ stage[0] }}</button></div>
    <div class="explain" aria-live="polite"><strong>{{ stages[step][0] }}</strong><p>{{ stages[step][2] }}</p></div>
    <button type="button" class="next" @click="step = (step + 1) % stages.length">{{ step === stages.length - 1 ? '重新查看 ↺' : '下一步 →' }}</button>
    <small>概念关系示意，箭头用于引导阅读；对照项不代表时间先后或实际硬件布局。</small>
  </figure>
</template>
<script>
import { knowledgeDiagrams } from '../data/computer-diagrams.mjs';
export default {
  name: 'ComputerKnowledgeDiagram',
  props: { entry: { type: Object, required: true } },
  data: () => ({ step: 0 }),
  computed: { stages() { return knowledgeDiagrams[this.entry.id]; } },
  watch: { 'entry.id'() { this.step = 0; } }
};
</script>
<style scoped>
.knowledge-diagram{margin:16px 0;padding:12px;background:var(--ui-accent-soft,#eff7f3);border-radius:10px;color:var(--el-text-color-primary,#273b30)}figcaption{font-size:12px;color:var(--ui-accent,#338866);margin-bottom:8px}svg{display:block;width:100%;height:auto;overflow:visible}rect{fill:var(--el-bg-color,#fff);stroke:var(--el-border-color,#cfdfd6);stroke-width:1.5}.active rect{stroke:var(--ui-accent,#338866);stroke-width:3}circle{fill:var(--ui-accent-soft,#eff7f3)}.active circle{fill:var(--ui-accent,#338866)}text{fill:currentColor;font-family:inherit}.active .number{fill:#fff}.number{font-size:12px}.node-title{font-size:15px;font-weight:600}.node-subtitle{font-size:12px}.arrows{color:var(--ui-accent,#338866)}.step-buttons{display:flex;gap:6px;flex-wrap:wrap}button{font:inherit;border:1px solid var(--el-border-color,#cfdfd6);border-radius:7px;padding:7px 9px;background:var(--el-bg-color,#fff);color:inherit;cursor:pointer}button[aria-pressed="true"]{color:var(--ui-accent,#338866);border-color:var(--ui-accent,#338866)}button:focus-visible{outline:2px solid var(--ui-accent,#338866);outline-offset:2px}.explain{padding:12px 0;min-height:80px;line-height:1.8}.explain p{margin:4px 0}.next{margin-bottom:12px}small{display:block;font-size:11px;line-height:1.7;color:var(--el-text-color-secondary,#65746c)}@media(max-width:480px){.knowledge-diagram{padding:8px}.step-buttons button{font-size:11px}.explain{min-height:100px}}
</style>
