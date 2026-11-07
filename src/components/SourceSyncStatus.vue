<template><span v-if="health" class="source-sync-status" :class="{degraded:issues.length||overdue}" role="status" :title="details">{{ overdue ? '采集超过4小时未更新' : issues.length ? `部分来源更新异常（${issues.length}项）` : '本轮采集完成' }} · {{ time }}</span></template>
<script>
export default {
 name:'SourceSyncStatus',data:()=>({health:null,loading:false,controller:null}),
 computed:{
  overdue(){return Date.now()-Date.parse(this.health?.generatedAt)>4*60*60*1000;},
  issues(){return (this.health?.sources||[]).filter(s=>s.status!=='ok');},
  time(){return new Date(this.health.generatedAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});},
  details(){return this.issues.map(s=>`${s.name}：${s.errors?.join('；')||s.status}`).join('\n')||'此时间表示后台本轮采集结束，不代表各源内容发布时间；页面每5分钟检查更新。';}
 },
 mounted(){this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{async load(){if(this.loading)return;this.loading=true;this.controller=new AbortController();const timeout=setTimeout(()=>this.controller.abort(),12000);try{const r=await fetch(`${process.env.BASE_URL}collection-health.json`,{cache:'no-cache',signal:this.controller.signal});if(!r.ok)throw Error('health request');const d=await r.json();if(!Array.isArray(d.sources)||!Number.isFinite(Date.parse(d.generatedAt)))throw Error('invalid health');this.health=d;}catch{/* Existing deployments may not have health yet. */}finally{clearTimeout(timeout);this.loading=false;}}}
};
</script>
<style scoped>.source-sync-status{font-size:11px;color:var(--ui-text-secondary,#7b8799);margin-left:auto;padding:5px 8px;line-height:1.5}.source-sync-status.degraded{color:#c57c25}@media(max-width:768px){.source-sync-status{margin-left:0;flex-basis:100%;order:3}}</style>
