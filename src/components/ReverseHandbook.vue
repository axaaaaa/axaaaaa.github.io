<template><section id="reverse-handbook" class="reverse-handbook" aria-labelledby="reverse-handbook-title"><header class="reverse-heading"><h2 id="reverse-handbook-title"><button type="button" class="reverse-title" :aria-expanded="opened" aria-controls="reverse-content" @click="opened=!opened"><ToolEntryIcon name="开发" />🔍 软件逆向分析手册 <span aria-hidden="true">{{opened?'▾':'▸'}}</span></button></h2><div><span>{{ guides.length }} 类手册</span><button type="button" :aria-expanded="opened" aria-controls="reverse-content" @click="opened=!opened">{{opened?'收起 ▴':'展开 ▾'}}</button></div></header><div v-if="opened" id="reverse-content"><template v-if="mode==='guides'"><input v-model="query" type="search" aria-label="搜索逆向手册" placeholder="搜索 PE / ELF / 调试 / Android / 汇编" /><nav class="reverse-tabs" aria-label="逆向手册分类"><button type="button" :aria-pressed="category===''" @click="category=''">🗂️ 全部分类</button><button v-for="guide in guides" :key="guide.id" type="button" :aria-pressed="category===guide.id" @click="category=guide.id">{{guide.title}}</button></nav><p>{{filtered.length}} 类结果</p><div class="reverse-grid"><article v-for="guide in filtered" :key="guide.id+'|'+category+'|'+(filtered.length===1)" :class="['reverse-card',{'reverse-card-wide':guide.behaviors||category||filtered.length===1}]"><h3><ToolEntryIcon name="开发" />{{guide.title}}</h3><p>{{guide.goal}}</p><details :open="category===guide.id||filtered.length===1"><summary>📖 查看步骤与示例</summary><h4>📚 所需基础</h4><p>{{guide.prerequisite}}</p><h4>🔢 操作步骤</h4><ol><li v-for="step in guide.steps" :key="step">{{step}}</li></ol><h4>💡 示例</h4><pre>{{guide.example}}</pre><template v-if="guide.behaviors"><h4>{{guide.title}}对照表</h4><table class="reverse-behavior-table"><thead><tr><th>行为类型</th><th>示例</th><th>{{guide.behaviorLabel||'可能目的'}}</th></tr></thead><tbody><tr v-for="row in guide.behaviors" :key="row.type"><td>{{row.type}}</td><td>{{row.example}}</td><td>{{row.purpose}}</td></tr></tbody></table></template><h4>🧭 结果解释</h4><p>{{guide.interpretation}}</p><h4>⚠️ 常见误判</h4><p>{{guide.pitfall}}</p><h4>✅ 验证方法</h4><p>{{guide.validation}}</p><div v-if="guide.id==='tools'"><section v-for="tool in toolReferences" :key="tool.name"><strong>{{tool.name}}</strong><p>{{tool.actions}}</p><a :href="tool.source" target="_blank" rel="noopener noreferrer">{{tool.name}} 官方文档 ↗</a></section></div></details><a :href="guide.source" target="_blank" rel="noopener noreferrer">官方／标准资料 ↗</a></article></div><p v-if="!filtered.length">没有匹配内容。<button type="button" @click="query='';category=''">清除筛选</button></p></template></div></section></template>
<script>
import ToolEntryIcon from './ToolEntryIcon.vue';
import {reverseGuides,reverseTools,reverseToolReferences} from '../data/reverse-handbook.mjs';
import {MAX_BINARY_BYTES,convertInteger,endianInfo,hexRows,findPattern,inspectBinary,extractStrings,mapAddress,binaryDiff,parseInteger,NOTE_TEMPLATE} from '../utils/reverse-binary-tools.mjs';
const NOTE_KEY='01-reverse-analysis-notes';
export default {name:'ReverseHandbook',components:{ToolEntryIcon},data:()=>({opened:false,mode:'guides',category:'',query:'',guides:reverseGuides,tools:reverseTools,toolReferences:reverseToolReferences,active:'integer',base:'16',integer:'1234ABCD',endian:'78 56 34 12',bytes:null,secondBytes:null,fileName:'',secondName:'',fileHash:'',loadTokens:{primary:0,secondary:0},hexOffset:'0',hexPageOffset:0,pattern:'48 8B ?? ??',minString:4,address:'0',direction:'fileToVA',results:{},feedback:'',notes:NOTE_TEMPLATE}),computed:{filtered(){const words=this.query.trim().toLowerCase().split(/\s+/).filter(Boolean);return this.guides.filter(g=>(!this.category||g.id===this.category)&&words.every(w=>Object.values(g).map(v=>v&&typeof v==='object'?JSON.stringify(v):v).join(' ').toLowerCase().includes(w)));}},methods:{pretty(value){return JSON.stringify(value,null,2);},async loadFile(event,slot){const file=event.target.files?.[0],token=++this.loadTokens[slot];this.feedback='';if(slot==='primary'){this.bytes=null;this.fileName='';this.fileHash='';this.results={};this.hexOffset='0';this.hexPageOffset=0;}else{this.secondBytes=null;this.secondName='';delete this.results.diff;}if(!file)return;try{if(file.size>MAX_BINARY_BYTES)throw Error('请选择不超过 2 MiB 的文件');const data=new Uint8Array(await file.arrayBuffer());if(token!==this.loadTokens[slot])return;if(slot==='primary'){this.bytes=data;this.fileName=file.name;const digest=await crypto.subtle.digest('SHA-256',data);if(token===this.loadTokens[slot])this.fileHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}else{this.secondBytes=data;this.secondName=file.name;}}catch(e){if(token===this.loadTokens[slot])this.feedback=e.message;}},calculate(kind){this.feedback='';delete this.results[kind];try{let result;if(kind==='integer')result=convertInteger(this.integer,this.base);else if(kind==='endian')result=endianInfo(this.endian);else{if(!this.bytes)throw Error('请先选择分析文件');if(kind==='hex'){const offset=parseInteger(this.hexOffset,16);if(offset<0n||offset>window.BigInt(this.bytes.length))throw Error('文件偏移超出范围');this.hexPageOffset=Number(offset);result=hexRows(this.bytes,this.hexPageOffset);}else if(kind==='pattern')result=findPattern(this.bytes,this.pattern);else if(kind==='header')result=inspectBinary(this.bytes);else if(kind==='strings')result=extractStrings(this.bytes,Number(this.minString));else if(kind==='address')result=mapAddress(inspectBinary(this.bytes),this.address,this.direction);else if(kind==='diff'){if(!this.secondBytes)throw Error('请选择对比文件');result=binaryDiff(this.bytes,this.secondBytes);}}this.results[kind]=result;}catch(e){this.feedback=e.message;}},hexPage(delta){this.hexOffset=Math.max(0,this.hexPageOffset+delta*256).toString(16);this.calculate('hex');},saveNotes(){try{localStorage.setItem(NOTE_KEY,this.notes);this.feedback='分析笔记已保存到浏览器';}catch{this.feedback='本地保存未完成，可导出笔记';}},loadNotes(){try{const saved=localStorage.getItem(NOTE_KEY);if(saved===null){this.feedback='暂无保存的笔记';return;}this.notes=saved.slice(0,100000);this.feedback='已读取保存的笔记';}catch{this.feedback='读取本地笔记未完成';}},clearSavedNotes(){try{localStorage.removeItem(NOTE_KEY);this.feedback='已删除保存副本，当前编辑内容保留';}catch{this.feedback='删除保存副本未完成';}},appendTemplate(){if(this.notes.length+NOTE_TEMPLATE.length>100000){this.feedback='笔记长度上限为 100000 字符';return;}this.notes+='\n'+NOTE_TEMPLATE;},downloadNotes(){const url=URL.createObjectURL(new Blob([this.notes],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='reverse-analysis-notes.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.feedback='已导出分析笔记';}}};
</script>
<style scoped>.reverse-handbook{margin:32px 20px;padding:20px;font-size:13px;scroll-margin-top:80px;}.reverse-heading,.reverse-heading>div{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}h2{margin:0;}.reverse-title{border:0!important;background:transparent!important;padding:0;text-align:left;font:inherit;}.reverse-tabs,.reverse-actions{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0;}button,input,select,textarea{font:inherit;color:inherit;border:1px solid var(--el-border-color);background:var(--el-fill-color-blank);padding:8px 10px;box-sizing:border-box;max-width:100%;}button{cursor:pointer;}button:disabled{opacity:.4;cursor:default;}input[type=search],textarea{width:100%;}.reverse-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}.reverse-card{min-width:0;padding:16px;background:var(--el-fill-color-blank);border:1px solid var(--el-border-color-light);border-radius:4px;overflow-wrap:anywhere;}.reverse-card h3{font-size:15px;margin:0 0 10px;}.reverse-card h4{font-size:13px;margin:14px 0 6px;}.reverse-card label{display:flex;flex-direction:column;gap:6px;margin:12px 0;}p,li{line-height:1.8;}p{color:var(--el-text-color-secondary);}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 Consolas,monospace;padding:12px;background:var(--el-fill-color-light);max-height:440px;overflow:auto;}output{display:block;padding:12px;margin-top:12px;background:var(--el-fill-color-light);}summary{cursor:pointer;}a{color:var(--ui-accent);display:inline-block;margin-top:12px;}.reverse-hash{overflow-wrap:anywhere;}@media(max-width:1100px){.reverse-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}@media(max-width:600px){.reverse-handbook{margin:16px 12px;padding:14px;}.reverse-grid{grid-template-columns:minmax(0,1fr);}}
/* Windows 95 window, controls and inset document panes. */
.reverse-handbook {
  --el-border-color: #808080;
  --el-border-color-light: #a0a0a0;
  --el-fill-color-blank: #fff;
  --el-text-color-primary: #151515;
  --el-text-color-secondary: #373737;
  --ui-accent: #000080;
  --field-bg: #fff;
  --field-text: #151515;
  --field-border: #808080;
  --field-placeholder: #565656;
  --field-font: "Microsoft Sans Serif", Tahoma, "Microsoft YaHei", sans-serif;
  --win-raised: inset 1px 1px #fff, inset 2px 2px #dfdfdf, inset -1px -1px #111, inset -2px -2px #808080;
  --win-inset: inset 1px 1px #808080, inset 2px 2px #111, inset -1px -1px #fff, inset -2px -2px #dfdfdf;
  padding: 4px;
  background: #c0c0c0;
  color: #151515;
  box-shadow: var(--win-raised);
  font-family: var(--field-font);
  color-scheme: light;
}
.reverse-heading {
  padding: 4px 8px;
  color: #fff;
  background: #000080;
  gap: 5px 10px;
}
.reverse-heading h2 { font-size: 16px; font-weight: 700; }
.reverse-heading > div { gap: 5px 10px; }
#reverse-content { padding: 0 10px 10px; }
.reverse-handbook button:not(.reverse-title) {
  background: #c0c0c0;
  color: #151515;
  border: 0;
  border-radius: 0;
  box-shadow: var(--win-raised);
  padding: 5px 9px;
}
.reverse-handbook button:not(.reverse-title):hover:not(:disabled) { background: #d8d8d8; }
.reverse-handbook button:not(.reverse-title):active:not(:disabled) { box-shadow: var(--win-inset); }
.reverse-handbook button[aria-pressed="true"],
.reverse-handbook button[aria-pressed="true"]:hover:not(:disabled) {
  color: #fff;
  background: #000080;
  box-shadow: var(--win-inset);
}
.reverse-handbook .reverse-card {
  border: 0;
  border-radius: 0;
  background: #f5f5f5;
  box-shadow: var(--win-raised);
}
.reverse-handbook :is(pre,output) {
  border-radius: 0;
  background: #fff;
  color: #151515;
  box-shadow: var(--win-inset);
  padding: 8px;
}
.reverse-handbook :is(input:not([type="file"]), select, textarea) {
  border-radius: 0 !important;
  box-shadow: var(--win-inset);
  color-scheme: light;
}
.reverse-handbook :is(input,select,textarea):focus-visible { box-shadow: var(--win-inset), 0 0 0 2px #000080; }
.reverse-handbook :is(a,button):focus-visible { outline: 2px solid #000080; outline-offset: 2px; }
.reverse-heading button:focus-visible { outline-color: #fff; }
.reverse-card-wide{grid-column:1/-1;}
.reverse-behavior-table{border-collapse:collapse;width:100%;margin:8px 0 12px;font-size:12px;background:#fff;}
.reverse-behavior-table th,.reverse-behavior-table td{border:1px solid #808080;padding:5px 7px;text-align:left;vertical-align:top;}
.reverse-behavior-table th{background:#000080;color:#fff;font-weight:700;}
.reverse-behavior-table td:first-child{white-space:nowrap;}
@media(max-width:600px){.reverse-behavior-table{display:block;overflow-x:auto;white-space:nowrap;}}
</style>

