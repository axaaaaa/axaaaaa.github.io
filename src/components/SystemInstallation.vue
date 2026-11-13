<template>
  <section id="system-installation" class="installation" aria-labelledby="installation-title">
    <header class="installation-heading"><h2 id="installation-title"><button type="button" :aria-expanded="opened" aria-controls="installation-content" @click="opened = !opened"><span aria-hidden="true">[{{ opened ? '−' : '+' }}]</span> 系统安装</button></h2><span class="installation-screen-id">SETUP · WINDOWS / LINUX</span></header>
    <div v-if="opened" id="installation-content">
      <div class="installation-intro"><span class="eyebrow">SYSTEM INSTALLATION</span><h3>从准备镜像，到第一次成功启动。</h3><p>先在虚拟机走一遍，再理解实体机的启动、分区与安装。教程中的勾选只记录本次页面学习进度。</p></div>
      <nav class="installation-tabs" aria-label="安装系统"><button v-for="item in tracks" :key="item.id" type="button" :aria-pressed="trackId === item.id" @click="chooseTrack(item.id)">{{ item.name }}</button></nav>
      <nav class="installation-tabs modes" aria-label="安装场景"><button v-for="item in modes" :key="item.id" type="button" :aria-pressed="mode === item.id" @click="chooseMode(item.id)">{{ item.name }}</button></nav>
      <div class="installation-notice"><strong>{{ mode === 'vm' ? '练习路线：独立虚拟磁盘' : '实体机路线：先备份，再确认磁盘' }}</strong><p>{{ mode === 'vm' ? '使用新建的虚拟磁盘，不映射宿主机物理磁盘。以下教程不会操作你的磁盘。' : '制作启动盘会清空目标 U 盘；删除、格式化或擦除分区会移除数据。先验证备份，再核对磁盘型号与容量。' }}</p></div>
      <section class="installation-prep" aria-labelledby="installation-prep-title"><h3 id="installation-prep-title">安装前准备</h3><div class="prep-grid"><label v-for="(item,index) in track.checklist" :key="track.id + index"><input type="checkbox" :checked="!!checks[trackId + ':' + index]" @change="checks[trackId + ':' + index] = $event.target.checked" />{{ item }}</label></div><div class="installation-links"><a :href="track.download" target="_blank" rel="noopener noreferrer">官方镜像下载 ↗</a><a :href="track.source" target="_blank" rel="noopener noreferrer">官方安装文档 ↗</a></div></section>
      <div class="installation-progress"><span>{{ track.subtitle }}</span><span role="status">已完成 {{ completedCount }} / {{ track.steps.length }} 步</span><progress :value="completedCount" :max="track.steps.length" :aria-label="track.name + '学习进度'"></progress></div>
      <div class="installation-layout"><nav class="installation-steps" aria-label="安装步骤"><button v-for="(item,index) in track.steps" :key="track.id + index" type="button" :aria-current="step === index ? 'step' : null" :aria-controls="'installation-step-content'" @click="step = index"><span class="step-number">{{ done[progressKey(index)] ? '✓' : String(index + 1).padStart(2, '0') }}</span>{{ item.title }}</button></nav>
        <article id="installation-step-content" class="installation-lesson" aria-live="polite"><span class="eyebrow">STEP {{ String(step + 1).padStart(2, '0') }} / {{ track.steps.length }}</span><h3>{{ lesson.title }}</h3><p class="lesson-goal">{{ lesson.goal }}</p><ol><li v-for="action in lesson.actions" :key="action">{{ action }}</li></ol><div class="scene-tip"><strong>{{ mode === 'vm' ? '虚拟机练习' : '实体机操作' }}</strong><p>{{ lesson[mode] }}</p></div><div v-if="lesson.code" class="installation-code"><small>命令示例 · 在对应系统终端使用</small><pre><code>{{ lesson.code }}</code></pre></div><label class="lesson-check"><input type="checkbox" :checked="!!done[progressKey(step)]" @change="done[progressKey(step)] = $event.target.checked" />{{ lesson.check }}</label><footer><button type="button" :disabled="step === 0" @click="step--">上一步</button><span>{{ step + 1 }} / {{ track.steps.length }}</span><button type="button" :disabled="step === track.steps.length - 1" @click="step++">下一步</button></footer></article>
      </div>
      <section class="installation-faq"><h3>常见问题</h3><details v-for="item in track.faqs" :key="item.question"><summary>{{ item.question }}</summary><p>{{ item.answer }}</p></details></section>
      <div class="installation-status"><span>{{ track.name }} / {{ mode === 'vm' ? '虚拟机练习' : '实体机安装' }}</span><span>STEP {{ String(step + 1).padStart(2, '0') }} / {{ track.steps.length }}</span></div>
    </div>
  </section>
</template>
<script>
import { installTracks } from '../data/system-installation.mjs';
export default {
  name: 'SystemInstallation',
  data: () => ({ opened: false, tracks: installTracks, trackId: 'windows', mode: 'vm', step: 0, checks: {}, done: {}, modes: [{ id: 'vm', name: '虚拟机练习' }, { id: 'physical', name: '实体机安装' }] }),
  computed: {
    track() { return this.tracks.find(item => item.id === this.trackId); },
    lesson() { return this.track.steps[this.step]; },
    completedCount() { return this.track.steps.filter((_, index) => this.done[this.progressKey(index)]).length; }
  },
  methods: {
    chooseTrack(id) { this.trackId = id; this.step = 0; },
    chooseMode(id) { this.mode = id; this.step = 0; },
    progressKey(index) { return this.trackId + ':' + this.mode + ':' + index; }
  }
};
</script>
<style scoped>
.installation{margin:24px 20px 32px;padding:20px;border:1px solid var(--el-border-color-light,#d7e4dc);border-radius:14px;color:var(--el-text-color-primary,#273b30);background:var(--el-bg-color,#fff);scroll-margin-top:80px;font-size:13px}.installation-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.installation h2{margin:0;font-size:20px;font-weight:500}.installation-heading h2 button{border:0;padding:0;background:transparent;font:inherit}.installation button{font:inherit;color:inherit;cursor:pointer;border:1px solid var(--el-border-color,#d7e4dc);border-radius:8px;padding:8px 13px;background:var(--el-fill-color-blank,#fff)}.installation button:disabled{opacity:.4;cursor:default}.installation button:focus-visible,.installation a:focus-visible,.installation summary:focus-visible{outline:2px solid var(--ui-accent,#386a50);outline-offset:3px}.installation button[aria-pressed=true],.installation button[aria-current=step]{color:var(--ui-accent,#386a50);background:var(--ui-accent-soft,#edf4ef);border-color:var(--ui-accent,#386a50)}.muted,.installation-progress,.installation-code small{color:var(--el-text-color-secondary,#748579)}.installation-intro{margin:20px 0;padding:22px;background:var(--ui-accent-soft,#edf4ef);border-radius:12px}.eyebrow{font:11px/1.5 Consolas,monospace;letter-spacing:2px;color:var(--ui-accent,#386a50)}.installation-intro h3{font-size:24px;font-weight:500;margin:8px 0}.installation p{line-height:1.8;margin:8px 0}.installation-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.installation-tabs:not(.modes) button{font-weight:600;padding:10px 24px}.installation-notice{margin:16px 0;padding:14px 16px;border-left:3px solid var(--ui-accent,#386a50);background:var(--el-fill-color-light,#f5f7f6);border-radius:0 8px 8px 0}.installation-prep{padding:16px;border:1px solid var(--el-border-color-light);border-radius:10px}.installation h3{margin-top:0}.prep-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.prep-grid label,.lesson-check{display:flex;align-items:flex-start;gap:8px;line-height:1.7}.installation input{accent-color:var(--ui-accent,#386a50);margin-top:4px;flex-shrink:0}.installation-links{display:flex;gap:20px;flex-wrap:wrap;margin-top:16px}.installation a{color:var(--ui-accent,#386a50);text-decoration:none}.installation-progress{margin:20px 0 12px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.installation progress{width:100%;height:6px;accent-color:var(--ui-accent,#386a50)}.installation-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px}.installation-steps{display:flex;flex-direction:column;gap:7px}.installation-steps button{text-align:left;display:flex;align-items:center;gap:12px;padding:12px}.step-number{font:12px Consolas,monospace;opacity:.7}.installation-lesson{padding:24px;border:1px solid var(--el-border-color-light);border-radius:12px;min-width:0}.installation-lesson h3{font-size:22px;margin:10px 0}.lesson-goal{color:var(--el-text-color-secondary)}.installation ol{padding-left:22px;line-height:1.9}.installation li+li{margin-top:10px}.scene-tip{padding:14px;background:var(--ui-accent-soft,#edf4ef);border-radius:8px;margin:18px 0}.installation-code pre{overflow:auto;padding:12px;background:var(--el-fill-color-light);border-radius:8px;font:12px/1.8 Consolas,monospace}.lesson-check{padding:14px 0;border-top:1px solid var(--el-border-color-light)}.installation footer{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px}.installation-faq{margin-top:22px}.installation details{padding:13px 0;border-bottom:1px solid var(--el-border-color-light)}.installation summary{cursor:pointer;font-weight:500}.installation details p{color:var(--el-text-color-secondary)}
@media(max-width:760px){.installation{margin:16px 12px;padding:14px}.installation-layout,.prep-grid{grid-template-columns:minmax(0,1fr)}.installation-steps{display:grid;grid-template-columns:1fr 1fr;gap:6px}.installation-steps button{padding:9px;font-size:12px;gap:7px}.installation-lesson{padding:16px}.installation-intro h3{font-size:20px}.installation-intro{padding:16px}}
.installation {
  --el-text-color-primary: #f5f7ff;
  --el-text-color-secondary: #c5d1ff;
  --el-border-color: #718ee9;
  --el-border-color-light: #5775cb;
  --el-bg-color: #101f76;
  --el-fill-color-blank: #172e93;
  --el-fill-color-light: #101d66;
  --ui-accent: #98f2ff;
  --ui-accent-soft: #142b88;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid #96adff;
  border-radius: 0;
  font-family: Consolas, "Courier New", "Microsoft YaHei", monospace;
  color-scheme: dark;
}
.installation-heading {
  background: #becdff;
  color: #101f76;
  padding: 5px 10px;
  gap: 4px 12px;
}
.installation h2 { font-size: 16px; font-weight: 700; }
.installation .installation-heading h2 button { padding: 0; color: inherit; background: transparent; border: 0; }
.installation-screen-id { font-size: 11px; letter-spacing: .08em; }
.installation .installation-heading button:focus-visible { outline-color: #101f76; }
.installation :is(button,.installation-intro,.installation-notice,.installation-prep,.installation-lesson,.scene-tip,pre) { border-radius: 0; }
.installation :is(.installation-intro,.scene-tip) { border: 1px dashed var(--el-border-color-light); }
.installation button:not(:disabled):hover { border-color: var(--ui-accent); }
.installation button[aria-pressed="true"], .installation button[aria-current="step"] {
  color: #0b195a;
  background: #9df0ff;
  border-color: #9df0ff;
}
.installation button[aria-current="step"] .step-number { opacity: 1; font-weight: 700; }
.installation a { text-decoration: underline; text-underline-offset: 3px; }
.installation-notice { border-left-color: #ffd782; }
.installation-notice strong { color: #ffd782; }
.installation progress { height: 9px; }
.installation-status {
  margin-top: 18px;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
  background: #becdff;
  color: #101f76;
}
</style>
