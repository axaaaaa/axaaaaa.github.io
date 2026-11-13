<template>
  <section :id="moduleId" class="utility-toolbox" :class="{ 'ansi-board': group === 'text', 'ftp-index': group === 'image' }" :aria-labelledby="moduleId+'-title'">
    <header class="utility-heading"><h2 :id="moduleId+'-title'"><button type="button" class="module-title-toggle" :aria-expanded="opened" :aria-controls="moduleId+'-content'" @click="opened = !opened" style="border:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;padding:0;text-align:left;cursor:pointer"><svg class="module-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:19px;height:19px;vertical-align:-3px;margin-right:7px"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v3h4v-3"/></svg> {{moduleTitle}}<svg class="module-heading-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :style="{transform: opened ? 'rotate(90deg)' : 'rotate(0deg)'}" style="width:14px;height:14px;vertical-align:-2px;margin-left:8px"><path d="m9 5 7 7-7 7"/></svg></button></h2><div><span>{{ tools.length }} 个本地工具</span><button type="button" :aria-expanded="opened" :aria-controls="moduleId+'-content'" @click="opened = !opened">{{ opened ? '收起 ▴' : '展开 ▾' }}</button></div></header>
    <div v-show="opened" :id="moduleId+'-content'"><p class="tool-note">文本、JSON、图片、文件及身份证号码均在当前浏览器内处理，不上传，也不自动保存输入内容。切换工具保留本次页面内容，刷新后清空。</p>
      <div v-if="group === 'text'" class="ansi-masthead">
        <div class="ansi-stripe" aria-hidden="true"></div>
        <div class="ansi-banner"><strong>▌ ANSI / 文字公告板</strong><span>TEXT BOARD · {{ tools.length }} 个分区</span></div>
      </div>
      <nav v-if="group === 'image'" class="ftp-directory" aria-label="图片工具目录">
        <div class="ftp-path"><strong>Index of /pub/image-tools/</strong><span>{{ tools.length }} 个目录</span></div>
        <table>
          <thead><tr><th scope="col">名称 / Name</th><th scope="col">路径 / Path</th></tr></thead>
          <tbody>
            <tr v-for="tool in tools" :key="tool.id" :class="{ 'ftp-active': active === tool.id }">
              <td><button type="button" :aria-pressed="active === tool.id" @click="active = tool.id"><span class="ftp-dir-marker" aria-hidden="true">[DIR]</span> {{ tool.label }}</button></td>
              <td><code>{{ tool.id }}/</code></td>
            </tr>
          </tbody>
        </table>
      </nav>
      <nav v-else class="utility-tabs" :aria-label="moduleTitle+'分类'"><button v-for="(tool, index) in tools" :key="tool.id" type="button" :aria-pressed="active === tool.id" @click="active = tool.id"><span v-if="group === 'text'" class="ansi-board-index" aria-hidden="true">[{{ String(index + 1).padStart(2, '0') }}]</span><ToolEntryIcon v-else :name="tool.id" />{{ tool.label }}</button></nav>
      <div v-if="group === 'image'" class="ftp-current" aria-live="polite"><code>/pub/image-tools/{{ active }}/</code><span>{{ tools.find(tool => tool.id === active)?.label }}</span></div>
      <div v-if="group === 'text'" class="ansi-current" aria-live="polite"><span>► {{ tools.find(tool => tool.id === active)?.label }}</span><span aria-hidden="true">ACTIVE BOARD</span></div>
      <TextDedupTool v-if="tools.some(t=>t.id==='text-dedup')" v-show="active === 'text-dedup'" />
      <ImageCompressionTool v-if="tools.some(t=>t.id==='image-compress')" v-show="active === 'image-compress'" />
      <AsciiArtTool v-if="tools.some(t=>t.id==='ascii-art')" v-show="active === 'ascii-art'" /><CharacterStatisticsTool v-if="tools.some(t=>t.id==='character-stats')" v-show="active === 'character-stats'" />
      <TextTool v-if="tools.some(t=>t.id==='text')" v-show="active === 'text'" /><JsonTool v-if="tools.some(t=>t.id==='json')" v-show="active === 'json'" /><ImageTool v-if="tools.some(t=>t.id==='image')" v-show="active === 'image'" /><UnitTool v-if="tools.some(t=>t.id==='units')" v-show="active === 'units'" /><HashTool v-if="tools.some(t=>t.id==='hash')" v-show="active === 'hash'" /><QrTool v-if="tools.some(t=>t.id==='qr')" v-show="active === 'qr'" /><DiffTool v-if="tools.some(t=>t.id==='diff')" v-show="active === 'diff'" /><EncodingTool v-if="tools.some(t=>t.id==='encoding')" v-show="active === 'encoding'" /><IdentityTool v-if="tools.some(t=>t.id==='identity')" v-show="active === 'identity'" /><RichTextTool v-if="tools.some(t=>t.id==='rich')" v-show="active === 'rich'" /><LanguageTool v-if="tools.some(t=>t.id==='chinese')" v-show="active === 'chinese'" mode="chinese" /><LanguageTool v-if="tools.some(t=>t.id==='pinyin')" v-show="active === 'pinyin'" mode="pinyin" /><LanguageTool v-if="tools.some(t=>t.id==='width')" v-show="active === 'width'" mode="width" /><LanguageTool v-if="tools.some(t=>t.id==='invisible')" v-show="active === 'invisible'" mode="invisible" /><PhotoMetadataTool v-if="tools.some(t=>t.id==='exif-view')" v-show="active === 'exif-view'" mode="view" /><PhotoMetadataTool v-if="tools.some(t=>t.id==='exif-clean')" v-show="active === 'exif-clean'" mode="clean" /><BasicCalculatorTool v-if="tools.some(t=>t.id==='basic-calculator')" v-show="active === 'basic-calculator'" /><CalculatorTool v-if="tools.some(t=>t.id==='calculator')" v-show="active === 'calculator'" /><PasswordTool v-if="tools.some(t=>t.id==='password')" v-show="active === 'password'" />
      <footer v-if="group === 'text'" class="ansi-status"><span>● 本地会话</span><span>切换分区保留输入 · 刷新后清空</span></footer>
      <footer v-if="group === 'image'" class="ftp-status"><span>本地目录索引 · 不连接 FTP 服务器</span><span>{{ tools.length }} entries</span></footer>
    </div>
  </section>
</template>
<script>
import ImageCompressionTool from './tools/ImageCompressionTool.vue';
import AsciiArtTool from './tools/AsciiArtTool.vue';
import CharacterStatisticsTool from './tools/CharacterStatisticsTool.vue';
import TextDedupTool from './tools/TextDedupTool.vue';
import ToolEntryIcon from './ToolEntryIcon.vue';
import TextTool from './tools/TextTool.vue';
import JsonTool from './tools/JsonTool.vue';
import ImageTool from './tools/ImageTool.vue';
import UnitTool from './tools/UnitTool.vue';
import QrTool from './tools/QrTool.vue';
import DiffTool from './tools/DiffTool.vue';
import EncodingTool from './tools/EncodingTool.vue';
import IdentityTool from './tools/IdentityTool.vue';
import RichTextTool from './tools/RichTextTool.vue';
import LanguageTool from './tools/LanguageTool.vue';
import PhotoMetadataTool from './tools/PhotoMetadataTool.vue';
import BasicCalculatorTool from './tools/BasicCalculatorTool.vue';
import CalculatorTool from './tools/CalculatorTool.vue';
import PasswordTool from './tools/PasswordTool.vue';
import HashTool from './tools/HashTool.vue';
export default { name: 'UtilityToolbox', props:{group:{type:String,default:'general'}}, computed:{moduleId(){return {image:'image-tools',text:'text-tools',general:'utility-toolbox'}[this.group]||'utility-toolbox';},moduleTitle(){return {image:'图片工具',text:'文字工具',general:'实用工具箱'}[this.group]||'实用工具箱';}}, created(){const images=['image','image-compress','exif-view','exif-clean','qr'];const texts=['text','text-dedup','ascii-art','character-stats','diff','rich','chinese','pinyin','width','invisible','encoding'];this.tools=this.tools.filter(t=>this.group==='image'?images.includes(t.id):this.group==='text'?texts.includes(t.id):!images.includes(t.id)&&!texts.includes(t.id));this.active=this.tools[0]?.id||'';}, components: { TextDedupTool, ImageCompressionTool, AsciiArtTool, CharacterStatisticsTool, ToolEntryIcon, TextTool, JsonTool, ImageTool, UnitTool, HashTool, QrTool, DiffTool, EncodingTool, IdentityTool, RichTextTool, LanguageTool, PhotoMetadataTool, BasicCalculatorTool, CalculatorTool, PasswordTool }, data: () => ({ opened: false, active: 'text', tools: [{id:'text',label:'文本处理'},{id:'text-dedup',label:'文本去重'},{id:'ascii-art',label:'ASCII 艺术字'},{id:'character-stats',label:'字符统计'},{id:'json',label:'JSON 工具箱'},{id:'image',label:'图片小工具'},{id:'image-compress',label:'图片压缩'},{id:'units',label:'单位换算'},{id:'hash',label:'文件校验'},{id:'qr',label:'二维码工具'},{id:'diff',label:'文本差异对比'},{id:'encoding',label:'编码转换'},{id:'identity',label:'身份证验证'},{id:'rich',label:'富文本转纯文本'},{id:'chinese',label:'简繁体转换'},{id:'pinyin',label:'汉字转拼音'},{id:'width',label:'全角半角转换'},{id:'invisible',label:'不可见字符检查'},{id:'exif-view',label:'图片 EXIF 信息查看'},{id:'exif-clean',label:'图片 EXIF 信息清理'},{id:'basic-calculator',label:'普通计算器'},{id:'calculator',label:'科学计算器'},{id:'password',label:'随机密码生成'}] }) };
</script>
<style scoped>
.utility-toolbox { margin: 24px 20px 32px; padding: 20px; border: 1px solid var(--el-border-color-light, #d7e4dc); border-radius: 14px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #273b30); scroll-margin-top: 80px; font-size: 13px; }
.utility-heading,.utility-heading>div { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }.utility-heading h2 { margin: 0; font-size: 20px; font-weight: 500; }.utility-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 20px; }
.utility-toolbox :deep(button),.utility-toolbox :deep(input:not([type="checkbox"]):not([type="range"])),.utility-toolbox :deep(select),.utility-toolbox :deep(textarea) { box-sizing: border-box; font: inherit; color: inherit; background: var(--el-fill-color-blank, #fff); border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 7px; padding: 8px 10px; max-width: 100%; }
.utility-toolbox :deep(button) { cursor: pointer; }.utility-toolbox :deep(button:hover:not(:disabled)),.utility-tabs button[aria-pressed="true"] { background: var(--ui-accent-soft); color: var(--ui-accent); }.utility-toolbox :deep(button:disabled) { opacity: .4; cursor: default; }
.utility-toolbox :deep(.tool-actions) { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 14px 0; }.utility-toolbox :deep(.tool-actions label) { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }.utility-toolbox :deep(.tool-actions input:not([type="range"]):not([type="checkbox"])) { width: 150px; }.utility-toolbox :deep(.tool-two-column) { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }.utility-toolbox :deep(.tool-label) { display: flex; flex-direction: column; gap: 8px; min-width: 0; margin: 12px 0; }.utility-toolbox :deep(textarea) { resize: vertical; width: 100%; min-height: 220px; font-family: Consolas,monospace; overflow-wrap: anywhere; }.utility-toolbox :deep(.hash-result) { min-height: 80px; }.utility-toolbox :deep(.tool-note),.utility-toolbox :deep(small) { color: var(--el-text-color-secondary, #748579); line-height: 1.8; }.utility-toolbox :deep(.tool-error) { color: var(--el-color-danger, #bf4343); }.utility-toolbox :deep(.tool-success) { color: var(--el-color-success, #3c955d); }.utility-toolbox :deep(.unit-inputs) { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }.utility-toolbox :deep(.unit-result) { display: block; font-size: 23px; overflow-wrap: anywhere; padding: 18px; border-radius: 12px; background: var(--ui-accent-soft); }.utility-toolbox :deep(.image-preview) { overflow: hidden; padding: 8px; background: repeating-conic-gradient(#dddddd 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px; border-radius: 10px; text-align: center; }.utility-toolbox :deep(canvas) { display: inline-block; max-width: 100%; max-height: 380px; width: auto; height: auto; cursor: crosshair; }.utility-toolbox :deep(.color-sample) { display: inline-block; width: 24px; height: 24px; border: 1px solid var(--el-border-color); border-radius: 4px; }.utility-toolbox :deep(progress) { width: 100%; }.utility-toolbox :deep(input[type="file"]) { width: 100%; }
@media(max-width:760px) { .utility-toolbox { margin: 16px 12px; padding: 14px; }.utility-toolbox :deep(.tool-two-column) { grid-template-columns: minmax(0,1fr); }.utility-toolbox :deep(textarea) { min-height: 160px; } }
.utility-toolbox.ansi-board {
  --el-bg-color: #101024;
  --el-fill-color-blank: #181832;
  --el-fill-color-light: #252448;
  --el-text-color-primary: #f1efff;
  --el-text-color-regular: #e5dfff;
  --el-text-color-secondary: #bfb9dc;
  --el-border-color: #605b93;
  --el-border-color-light: #4a4575;
  --el-color-danger: #ff9cae;
  --el-color-success: #93efa8;
  --ui-accent: #89f3ff;
  --ui-accent-soft: #24365a;
  --ui-focus: #fff18b;
  background: var(--el-bg-color);
  border: 2px solid #7869ad;
  border-radius: 0;
  color-scheme: dark;
  font-family: "Cascadia Mono", Consolas, "Microsoft YaHei", monospace;
}
.ansi-board .utility-heading { padding-bottom: 8px; border-bottom: 1px dashed var(--el-border-color); }
.ansi-masthead { margin-block: 10px; border: 1px solid var(--el-border-color); }
.ansi-stripe { height: 5px; background: linear-gradient(90deg, #79f4ff 0 20%, #ff95e0 20% 40%, #ffeb86 40% 60%, #92f9ac 60% 80%, #9cb5ff 80%); }
.ansi-banner, .ansi-current, .ansi-status { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; padding: 7px 10px; }
.ansi-banner { background: #242348; color: #f4b6ff; }
.ansi-banner span, .ansi-current span:last-child, .ansi-status { color: var(--el-text-color-secondary); font-size: .9em; }
.ansi-board .utility-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); }
.ansi-board .utility-tabs button { display: flex; align-items: baseline; gap: 7px; text-align: start; }
.ansi-board-index { flex: none; color: #ffeb86; }
.ansi-board .utility-tabs button:nth-child(3n + 2) .ansi-board-index { color: #ff95e0; }
.ansi-board .utility-tabs button:nth-child(3n) .ansi-board-index { color: #89f3ff; }
.ansi-board .utility-tabs button[aria-pressed="true"] { background: #89f3ff; border-color: #89f3ff; color: #101024; font-weight: 700; }
.ansi-board .utility-tabs button[aria-pressed="true"] .ansi-board-index { color: inherit; }
.ansi-current { background: #252448; color: var(--ui-accent); border-inline-start: 3px solid #ff95e0; margin-bottom: 8px; }
.ansi-status { margin-top: 12px; border-top: 1px dashed var(--el-border-color); }
.ansi-status span:first-child { color: #92f9ac; }
.ansi-board :deep(:is(button, input, select, textarea)) { border-radius: 0; }
.ansi-board :deep(:is(button, input, select, textarea, a):focus-visible) { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
.utility-toolbox.ftp-index {
  --el-bg-color: #f7f8fa;
  --el-fill-color-blank: #fff;
  --el-fill-color-light: #eef2f7;
  --el-text-color-primary: #202b3a;
  --el-text-color-regular: #303d4e;
  --el-text-color-secondary: #526070;
  --el-border-color: #aebbc9;
  --el-border-color-light: #c9d2dc;
  --ui-accent: #154b96;
  --ui-accent-soft: #e0ebfa;
  --ui-focus: #154b96;
  border-radius: 0;
  color-scheme: light;
  font-family: Consolas, "Microsoft YaHei", monospace;
}
.ftp-index .utility-heading { padding-bottom: 8px; border-bottom: 1px solid var(--el-border-color); }
.ftp-directory { margin-block: 12px; border: 1px solid var(--el-border-color); background: var(--el-fill-color-blank); }
.ftp-path, .ftp-current, .ftp-status { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; padding: 7px 10px; overflow-wrap: anywhere; }
.ftp-path, .ftp-current { background: var(--el-fill-color-light); }
.ftp-directory table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.ftp-directory th, .ftp-directory td { padding: 5px 10px; text-align: start; border-top: 1px solid var(--el-border-color-light); overflow-wrap: anywhere; }
.ftp-directory th:last-child { width: 36%; }
.ftp-directory tbody tr:nth-child(even) { background: #f4f6fa; }
.ftp-directory tbody tr.ftp-active { background: var(--ui-accent-soft); }
.ftp-index .ftp-directory button, .ftp-index .ftp-directory button:hover:not(:disabled) { padding: 2px 0; border: 0; background: transparent; color: var(--ui-accent); text-align: start; text-decoration: underline; }
.ftp-directory button[aria-pressed="true"] { font-weight: 700; }
.ftp-dir-marker, .ftp-status { color: var(--el-text-color-secondary); }
.ftp-current { border-inline-start: 3px solid var(--ui-accent); margin-bottom: 8px; color: var(--ui-accent); }
.ftp-status { margin-top: 12px; border-top: 1px solid var(--el-border-color); font-size: .9em; }
.ftp-index :deep(:is(button, input, select, textarea)) { border-radius: 0; }
.ftp-index :deep(:is(button, input, select, textarea, a):focus-visible) { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
@media (max-width: 480px) {
  .ftp-directory th, .ftp-directory td { padding-inline: 6px; }
}
</style>
