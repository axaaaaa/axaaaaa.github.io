<template>
<section id="system-tools" class="system-tools" aria-labelledby="system-tools-title">
 <header class="system-heading"><h2 id="system-tools-title"><button type="button" class="module-title-toggle" :aria-expanded="opened" aria-controls="system-tools-content" @click="opened=!opened"><span class="bbs-title-mark" aria-hidden="true">[BBS]</span> 装机与系统工具 <span aria-hidden="true">{{opened?'▾':'▸'}}</span></button></h2><div><span class="bbs-node">节点 01 · {{tabs.length}} 个工具</span><button type="button" :aria-expanded="opened" aria-controls="system-tools-content" @click="opened=!opened">{{opened?'[−] 收起':'[+] 展开'}}</button></div></header>
 <div v-if="opened" id="system-tools-content">
 <div class="bbs-banner"><strong>SYSOP / 装机交流站</strong><span>分区目录 · 系统维护 · 硬件排查</span></div>
 <div class="bbs-layout">
 <nav class="system-tabs" aria-label="装机与系统工具分类"><div class="bbs-bar">分区目录 <span aria-hidden="true">BOARDS</span></div><button v-for="(tab, index) in tabs" :key="tab.id" type="button" :aria-pressed="active===tab.id" @click="active=tab.id;query='';feedback=''"><span class="bbs-board-number" aria-hidden="true">[{{String(index+1).padStart(2,'0')}}]</span>{{tab.label}}</button></nav>
 <div class="bbs-workspace">
 <div class="bbs-bar" aria-live="polite"><span>当前分区 / {{tabs.find(tab=>tab.id===active)?.label}}</span><span aria-hidden="true">READ</span></div>
 <div class="bbs-body">
 <section v-if="active==='power'" aria-label="电源功率估算"><p>填写 CPU 最大封装功耗与显卡整卡功耗，不只填写标称 TDP。其余配件使用粗略系数估算，结果是电源额定直流输出功率，不是插座功耗，也不是硬件检测结果。</p><div class="power-fields"><label v-for="field in fields" :key="field.key">{{field.label}}<input v-model="power[field.key]" type="number" :min="0" :max="field.max" :step="field.count?1:'any'" /></label></div><p v-if="estimate.error" role="status">{{estimate.error}}</p><div v-else class="power-result" aria-live="polite"><p>估算负载：<strong>{{estimate.base}} W</strong></p><p>加入余量：{{estimate.target}} W</p><p>参考额定功率：<strong>{{estimate.recommended}} W 起</strong></p></div><p>公式：CPU + GPU + 主板 + 内存条数×5W + SSD×8W + HDD×12W + 风扇×4W + 其他；再乘余量，向上取整到 50W，最低展示 300W。系数为本站估算假设；还需满足显卡厂商建议、瞬时功耗、接口数量与电源质量。电源效率不应再次除进额定输出功率。</p></section>
 <section v-else-if="active==='uefi'||active==='partition'" :aria-label="active==='uefi'?'UEFI／Legacy 对照表':'GPT／MBR 对照'"><div class="system-table-wrap"><table><thead><tr><th>对比项目</th><th>{{active==='uefi'?'UEFI':'GPT'}}</th><th>{{active==='uefi'?'Legacy / BIOS':'MBR'}}</th></tr></thead><tbody><tr v-for="row in active==='uefi'?firmwareRows:partitionRows" :key="row[0]"><th scope="row">{{row[0]}}</th><td>{{row[1]}}</td><td>{{row[2]}}</td></tr></tbody></table></div></section>
 <section v-else-if="active==='keys'" aria-label="主板启动热键速查"><input v-model="query" type="search" aria-label="搜索主板品牌" placeholder="搜索品牌，例如 华硕 / MSI" /><p>以下为常见桌面主板参考，不覆盖同品牌所有笔记本、整机或型号。开机自检时按键，具体型号以手册为准；快速启动或 Fn 设置可能影响按键。</p><article v-for="row in filteredKeys" :key="row[0]" class="system-card"><h3>{{row[0]}}</h3><p>BIOS 设置：<kbd>{{row[1]}}</kbd></p><p>启动菜单：<kbd>{{row[2]}}</kbd></p><a :href="row[3]" target="_blank" rel="noopener noreferrer">厂商资料 ↗</a></article><p v-if="!filteredKeys.length">没有匹配品牌。</p></section>
 <section v-else-if="active==='bios'" aria-label="BIOS 设置术语表"><input v-model="query" type="search" aria-label="搜索 BIOS 术语" placeholder="搜索 XMP / TPM / 启动" /><p class="bios-count">{{filteredTerms.length}} 个术语</p><div class="bios-card-grid"><article v-for="row in filteredTerms" :key="row[0]" class="system-card bios-term-card"><header class="bios-card-header"><span class="bios-icon"><ToolEntryIcon :name="biosIcon(row[0])" /></span><h3>{{row[0]}}</h3></header><strong class="bios-term-name">{{row[1]}}</strong><p>{{row[2]}}</p></article></div><p v-if="!filteredTerms.length">没有匹配术语。</p></section>
 <section v-else-if="active==='led'" aria-label="主板自检灯速查"><p>按主板丝印而非颜色判断。自检时依次短亮通常是流程，持续停留才是排查线索；灯号不等于部件损坏结论。拆装前关机、断开电源，按型号手册操作。</p><article v-for="row in leds" :key="row[0]" class="system-card"><h3>{{row[0]}} · {{row[1]}}</h3><p>{{row[2]}}</p></article></section>
 <BlackScreenDiagnostic v-else-if="active==='black-screen'" />
 <section v-else aria-label="系统修复命令助手"><p>适用于已正常进入的 Windows 10/11，在管理员 CMD 或 PowerShell 中逐条执行并检查结果。/Online 指当前运行系统，不适用于 WinRE / PE 离线系统；网页仅复制命令。先备份重要数据，保持供电，等待任务结束。</p><p>常用顺序：DISM RestoreHealth 成功完成 → sfc /scannow → 按结果决定是否重启。错误代码及日志决定下一步，不自动组合执行。</p><article v-for="entry in repairs" :key="entry.command" class="system-card"><h3>{{entry.title}}</h3><code>{{entry.command}}</code><p>{{entry.effect}}</p><button type="button" :aria-label="'复制：'+entry.title" @click="copy(entry.command)">复制命令</button></article><p role="status">{{feedback}}</p></section>
 <footer v-if="relevantSources.length" class="system-sources"><a v-for="source in relevantSources" :key="source[1]" :href="source[1]" target="_blank" rel="noopener noreferrer">{{source[0]}} ↗</a></footer>
 </div>
 </div>
 </div>
 <footer class="bbs-status"><span>● 本地浏览</span><span>{{tabs.length}} 个分区 · 点击编号切换</span></footer>
 </div>
</section>
</template>
<script>
import BlackScreenDiagnostic from './BlackScreenDiagnostic.vue';
import ToolEntryIcon from './ToolEntryIcon.vue';
import {estimatePower,firmwareRows,partitionRows,bootKeys,terms,leds,repairs,systemSources} from '../data/system-tools.mjs';
export default {name:'SystemTools',components:{ToolEntryIcon,BlackScreenDiagnostic},data:()=>({opened:false,active:'power',query:'',feedback:'',firmwareRows,partitionRows,bootKeys,terms,leds,repairs,systemSources,power:{cpu:125,gpu:250,board:50,ram:2,ssd:1,hdd:0,fans:3,other:0,margin:30},fields:[{key:'cpu',label:'CPU 最大功耗（W）',max:1000},{key:'gpu',label:'GPU 整卡功耗（W）',max:1500},{key:'board',label:'主板及基础设备（W）',max:300},{key:'ram',label:'内存条数',max:16,count:true},{key:'ssd',label:'SSD 数量',max:24,count:true},{key:'hdd',label:'HDD 数量',max:24,count:true},{key:'fans',label:'风扇数量',max:32,count:true},{key:'other',label:'其他设备功耗（W）',max:1000},{key:'margin',label:'预留余量（%）',max:100}],tabs:[{id:'black-screen',label:'综合故障排查树',icon:'Windows'},{id:'power',label:'电源功率估算',icon:'power'},{id:'uefi',label:'UEFI／Legacy 对照表',icon:'Windows'},{id:'partition',label:'GPT／MBR 对照',icon:'hash'},{id:'keys',label:'主板启动热键速查',icon:'系统'},{id:'bios',label:'BIOS 设置术语表',icon:'系统'},{id:'led',label:'主板自检灯速查',icon:'invisible'},{id:'repair',label:'系统修复命令助手',icon:'开发'}]}),computed:{estimate(){return estimatePower(this.power);},filteredKeys(){const q=this.query.trim().toLowerCase();return this.bootKeys.filter(row=>row.join(' ').toLowerCase().includes(q));},filteredTerms(){const q=this.query.trim().toLowerCase();return this.terms.filter(row=>row.join(' ').toLowerCase().includes(q));},relevantSources(){return this.active==='uefi'?[this.systemSources[0]]:this.active==='partition'?[this.systemSources[1]]:this.active==='led'?[this.systemSources[2]]:this.active==='repair'?[this.systemSources[3]]:[];}},methods:{biosIcon(term){return /TPM|Secure/.test(term)?'password':/XMP/.test(term)?'开发':/AHCI|RAID/.test(term)?'hash':/Fan/.test(term)?'系统':/VT-|SVM|IOMMU/.test(term)?'开发':/BAR/.test(term)?'image':/Defaults/.test(term)?'encoding':'Windows';},async copy(command){try{await navigator.clipboard.writeText(command);this.feedback='已复制：'+command;}catch{this.feedback='请选中命令文字手动复制';}}}};
</script>
<style scoped>
.system-tools {
  --el-text-color-primary: #e5edff;
  --el-text-color-secondary: #baccec;
  --el-border-color: #5069a8;
  --el-border-color-light: #40578e;
  --el-fill-color-blank: #101d3e;
  --el-fill-color-light: #192c58;
  --ui-accent: #91ebf3;
  --ui-focus: #ffe597;
  color-scheme: dark;
  color: var(--el-text-color-primary);
  background: #101b3a;
  border: 3px double var(--el-border-color);
  margin: 32px 20px;
  padding: 12px;
  scroll-margin-top: 80px;
  font: 14px/1.6 Consolas, "Microsoft YaHei", monospace;
}
.system-heading, .system-heading > div, .bbs-banner, .bbs-bar, .bbs-status {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px 12px;
}
.system-heading { background: #243d80; padding: 8px 10px; border: 1px solid var(--el-border-color); }
h2 { margin: 0; font-size: 17px; }
h3 { font-size: 15px; margin: 0 0 8px; color: var(--ui-accent); }
.bbs-title-mark, .bbs-board-number, .bbs-node { color: #ffe597; }
.bbs-node { font-size: .9em; }
.bbs-banner { margin-top: 10px; padding: 8px 10px; color: var(--ui-accent); border-block: 1px dashed var(--el-border-color); }
.bbs-banner span, .bbs-status { color: var(--el-text-color-secondary); }
.bbs-layout { display: grid; grid-template-columns: minmax(185px, 24%) minmax(0, 1fr); gap: 10px; margin-top: 10px; }
.system-tabs, .bbs-workspace { min-width: 0; border: 1px solid var(--el-border-color); background: var(--el-fill-color-blank); }
.bbs-bar { padding: 6px 9px; background: #1d3161; border-bottom: 1px solid var(--el-border-color); color: var(--ui-accent); font-weight: 700; }
.bbs-bar span[aria-hidden] { font-size: .8em; color: var(--el-text-color-secondary); }
.bbs-body { padding: 10px 12px; }
.bbs-body section > p:first-child { margin-top: 0; }
.bbs-status { margin-top: 10px; padding: 4px 0; border-top: 1px solid var(--el-border-color); font-size: .85em; }
.bbs-status span:first-child { color: var(--ui-accent); }
button, input { font: inherit; color: inherit; border: 1px solid var(--el-border-color); border-radius: 0; background: var(--el-fill-color-blank); padding: 7px 9px; box-sizing: border-box; max-width: 100%; }
button { cursor: pointer; }
button:hover:not(:disabled), button[aria-pressed="true"] { color: #101b3a; background: var(--ui-accent); }
:is(button, input, a):focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
.module-title-toggle { border: 0; background: transparent; padding: 0; font: inherit; text-align: left; }
.module-title-toggle:hover:not(:disabled) { background: transparent; color: var(--ui-accent); }
.system-tabs button { display: flex; align-items: baseline; gap: 8px; text-align: start; width: 100%; border: 0; border-bottom: 1px solid var(--el-border-color-light); }
.bbs-board-number { flex: none; }
.system-tabs button:is(:hover, [aria-pressed="true"]) .bbs-board-number { color: inherit; }
.power-fields { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px; }
.power-fields label { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.power-fields input, input[type="search"] { width: 100%; }
input::placeholder { color: var(--el-text-color-secondary); opacity: 1; }
.power-result, .system-card { padding: 10px 0; border-bottom: 1px dashed var(--el-border-color); margin: 8px 0; overflow-wrap: anywhere; }
.power-result { padding-inline: 12px; border: 1px solid var(--el-border-color); background: var(--el-fill-color-light); }
.power-result p { margin: 3px 0; }
p { color: var(--el-text-color-secondary); }
strong, code { color: var(--el-text-color-primary); }
code { display: block; overflow-wrap: anywhere; white-space: pre-wrap; background: var(--el-fill-color-light); padding: 6px 8px; }
kbd { border: 1px solid var(--el-border-color); padding: 1px 4px; color: #ffe597; font: inherit; }
a { color: var(--ui-accent); }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { text-align: left; border: 1px solid var(--el-border-color); padding: 8px; overflow-wrap: anywhere; }
thead, tbody th { background: var(--el-fill-color-light); }
th:first-child { width: 22%; }
.system-sources { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.bios-card-header { display: flex; align-items: center; gap: 8px; }
.bios-card-header h3 { margin: 0; }
.bios-icon { display: inline-flex; color: var(--ui-accent); }
.bios-icon :deep(.tool-entry-icon) { margin: 0; width: 16px; height: 16px; }
.bios-term-card p { margin: 4px 0 0; }
.bios-count { font-size: .85em; }
.bbs-body :deep(:is(.diagnostic-result, .diagnostic-node)) { border-radius: 0; }
@media (max-width: 760px) {
  .system-tools { margin: 16px 12px; padding: 8px; }
  .bbs-layout { grid-template-columns: minmax(0, 1fr); }
  .power-fields { grid-template-columns: repeat(2,minmax(0,1fr)); }
  th, td { padding: 6px; }
}
</style>
