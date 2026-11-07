<template>
<section class="market-panel" :class="{'market-dark':dark}" aria-labelledby="market-heading">
  <header class="market-header"><div><h2 id="market-heading"><span aria-hidden="true">↗</span> 市场行情 <small>MARKET WATCH</small></h2><p>A 股 · 美股 · 加密货币，一览市场动态</p></div><button type="button" @click="expanded=!expanded" :aria-expanded="expanded">{{expanded?'收起':'展开'}}</button></header>
  <template v-if="expanded">
    <div class="market-toolbar"><div class="market-tabs" aria-label="市场分类"><button v-for="tab in tabs" :key="tab" type="button" :class="{active:tab===selected}" :aria-pressed="tab===selected" @click="selected=tab">{{tab}}{{tab==='加密货币'?` (${cryptoCount})`:''}}</button></div><span role="status">{{error?'刷新失败，保留上次行情':'定时快照 · 非实时行情'}}</span><label><input type="checkbox" v-model="redUp" /> 红涨绿跌</label></div>
    <div class="market-view-switch" role="group" aria-label="行情展示方式"><button type="button" :class="{active:viewMode==='heatmap'}" :aria-pressed="viewMode==='heatmap'" @click="setView('heatmap')">热力图</button><button type="button" :class="{active:viewMode==='cards'}" :aria-pressed="viewMode==='cards'" @click="setView('cards')">卡片</button></div>
    <MarketHeatmap v-if="visible.length&&viewMode==='heatmap'" :items="visible" :red-up="redUp" :dark="dark" />
    <div v-else-if="visible.length" class="market-grid">
      <a v-for="item in visible" :key="item.symbol" :href="item.url" target="_blank" rel="noopener noreferrer" class="quote-card" :class="direction(item)">
        <div class="quote-title"><div><h3>{{item.nameZh||item.name}}</h3><span v-if="item.nameEn" class="quote-english">{{item.nameEn}}</span><span>{{item.kind==='crypto'&&item.ticker?`${item.ticker} / ${item.currency}`:item.symbol}}</span></div><span class="quote-kind">{{item.kind==='index'?'指数':item.kind==='crypto'?'加密货币':'股票'}}</span></div>
        <div class="quote-price">{{item.kind==='crypto'?cryptoNumber(item.price):number(item.price)}} <small>{{item.kind==='index'?'点':item.currency}}</small></div>
        <div class="quote-change">{{item.kind==='crypto'?`${item.change>0?'+':''}${cryptoNumber(item.change)}`:signed(item.change)}} <span>{{signed(item.changePercent)}}%</span></div>
        <svg v-if="item.series?.length>1" class="quote-chart" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true"><polyline :points="points(item.series)" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" /></svg>
        <div class="quote-time">行情时间 {{date(item.quoteAt)}}<span v-if="stale(item)"> · 较早快照</span></div>
      </a>
    </div>
    <div v-else class="market-empty">{{loading?'正在加载市场行情…':'此分类暂无可用行情。'}}<button v-if="!loading" type="button" @click="load">重试</button></div>
    <footer class="market-footer"><span>{{viewMode==='heatmap'?'价格：Yahoo Finance · 市值：CoinGecko / Nasdaq / 东方财富':'来源：Yahoo Finance'}} · 每小时采集 · 时间以设备本地时区显示</span><span>涨跌以数据源前收价为基准，不标注为滚动 24 小时涨跌。休市期间保留最近行情。</span><span>仅展示市场信息，不构成投资建议。</span></footer>
  </template>
</section>
</template>
<script>
import MarketHeatmap from './MarketHeatmap.vue';
export default {
 components:{MarketHeatmap},
 name:'MarketOverview',props:{dark:Boolean},
 data:()=>({expanded:true,viewMode:'heatmap',items:[],selected:'全部',tabs:['全部','A 股','美股','加密货币'],redUp:true,loading:false,error:false,controller:null}),
 computed:{cryptoCount(){return this.items.filter(i=>i.kind==='crypto').length;},visible(){return this.items.filter(i=>this.selected==='全部'||i.category===this.selected);}},
 mounted(){try{const v=localStorage.getItem('market-view-v1');if(['heatmap','cards'].includes(v))this.viewMode=v;}catch{/* optional preference */}this.load();},beforeUnmount(){this.controller?.abort();},
 methods:{
 setView(view){this.viewMode=view;try{localStorage.setItem('market-view-v1',view);}catch{/* optional preference */}},
 cryptoNumber(value){const n=Math.abs(Number(value));const digits=n>0&&n<1?Math.min(12,Math.max(4,2-Math.floor(Math.log10(n)))):n<10?4:2;return Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:digits});},
 number(n){return Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});},signed(n){return `${n>0?'+':''}${this.number(n)}`;},
 date(t){const d=new Date(t);return Number.isFinite(d.getTime())?d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'未知';},
 stale(i){return Date.now()-Date.parse(i.quoteAt)>6*3600000;},
 direction(i){if(i.change===0)return 'quote-flat';return (i.change>0)===this.redUp?'quote-red':'quote-green';},
 points(series){const min=Math.min(...series),max=Math.max(...series);return series.map((n,i)=>`${i/(series.length-1)*240},${max===min?20:37-(n-min)/(max-min)*34}`).join(' ');},
 accept(data){if(!Array.isArray(data?.items))throw Error('invalid markets');const items=data.items.filter(i=>typeof i.symbol==='string'&&typeof i.name==='string'&&['A 股','美股','加密货币'].includes(i.category)&&Number.isFinite(i.price)&&i.price>0&&Number.isFinite(i.change)&&Number.isFinite(i.changePercent)&&Number.isFinite(Date.parse(i.quoteAt))&&i.url===`https://finance.yahoo.com/quote/${encodeURIComponent(i.symbol)}/`).map(i=>({...i,series:Array.isArray(i.series)?i.series.filter(Number.isFinite).slice(-48):[]}));if(!items.length)throw Error('empty quotes');this.items=items;},
 async load(){this.loading=true;this.error=false;try{const data=JSON.parse(localStorage.getItem('market-watch-v1'));if(data)this.accept(data);}catch{/* optional cache */}this.controller=new AbortController();const timeout=setTimeout(()=>this.controller.abort(),12000);try{const r=await fetch(`${process.env.BASE_URL}markets.json`,{cache:'no-cache',signal:this.controller.signal});if(!r.ok)throw Error('request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('market-watch-v1',JSON.stringify(data));}catch{/* optional storage */}}catch{this.error=true;}finally{clearTimeout(timeout);this.loading=false;}}
 }
};
</script>
<style scoped>
.market-panel{--m-text:#26364c;--m-muted:#7b8799;--m-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--m-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--m-text);padding:22px 24px 16px;box-sizing:border-box;overflow:hidden}.market-dark{--m-text:#e2e9f4;--m-muted:#95a3b9;--m-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92)}.market-header{display:flex;justify-content:space-between;align-items:center;gap:12px}.market-header h2{font-size:18px;margin:0}.market-header h2>span{color:#43898d;margin-right:7px}.market-header small{font-size:10px;letter-spacing:1.5px;font-weight:400;color:var(--m-muted);margin-left:8px}.market-header p{font-size:12px;color:var(--m-muted);margin:8px 0 0}.market-panel button{border:0;background:transparent;color:var(--m-muted);font:inherit;font-size:12px;padding:7px 10px;border-radius:7px;cursor:pointer}.market-panel button:hover,.market-tabs button.active{background:rgba(66,143,143,.1);color:#43898d}.market-panel button:focus-visible,.quote-card:focus-visible{outline:2px solid #43898d;outline-offset:2px}.market-toolbar{display:flex;gap:15px;align-items:center;flex-wrap:wrap;margin:18px 0 14px}.market-toolbar>span{font-size:11px;color:var(--m-muted);margin-left:auto}.market-toolbar label{font-size:11px;color:var(--m-muted);display:flex;align-items:center;gap:4px}.market-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.quote-card{border:1px solid var(--m-line);border-radius:12px;padding:16px;text-decoration:none;min-width:0;transition:background .15s}.quote-card:hover{background:rgba(127,145,171,.05)}.quote-title{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;color:var(--m-text)}.quote-title h3{font-size:13px;margin:0;line-height:1.6}.quote-title div>span{font-size:10px;color:var(--m-muted)}.quote-kind{font-size:9px;padding:3px 5px;background:rgba(127,145,171,.08);border-radius:4px;white-space:nowrap}.quote-price{font-size:25px;font-weight:650;margin:14px 0 5px;font-variant-numeric:tabular-nums}.quote-price small{font-size:10px;font-weight:400}.quote-change{display:flex;gap:12px;font-size:12px;font-variant-numeric:tabular-nums}.quote-red{color:#d75c60}.quote-green{color:#30916b}.quote-flat{color:var(--m-muted)}.quote-chart{display:block;width:100%;height:40px;margin:14px 0 10px;opacity:.8}.quote-time{font-size:9px;color:var(--m-muted);margin-top:12px;line-height:1.6}.market-footer{display:flex;flex-direction:column;gap:5px;color:var(--m-muted);font-size:10px;margin-top:16px;line-height:1.7}.market-empty{padding:25px;text-align:center;font-size:12px;color:var(--m-muted)}@media(max-width:700px){.market-panel{padding:18px 16px 14px}.market-header small{display:none}.market-toolbar{gap:10px}.market-toolbar>span{margin-left:0}.market-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.quote-card{padding:12px}.quote-price{font-size:20px}.quote-title{flex-wrap:wrap}.quote-change{gap:6px;font-size:11px}}@media(max-width:360px){.market-grid{grid-template-columns:minmax(0,1fr)}}

.quote-title .quote-english{display:block;font-size:11px;line-height:1.6;overflow-wrap:anywhere;color:var(--m-muted)}.quote-title>div{min-width:0}.quote-title h3{overflow-wrap:anywhere}

.market-view-switch{display:flex;gap:5px;margin:0 0 12px}.market-view-switch button.active{background:rgba(66,143,143,.12);color:#43898d;font-weight:600}
</style>

<style scoped>
.market-grid{grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:9px}.quote-card{padding:12px;border-radius:10px}.quote-price{font-size:21px;margin:9px 0 4px}.quote-chart{height:26px;margin:9px 0 6px}.quote-time{margin-top:7px}.quote-title h3{font-size:12px}.quote-change{font-size:11px;gap:8px}.quote-kind{font-size:9px}@media(max-width:700px){.market-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.quote-card{padding:10px}.quote-price{font-size:18px}.quote-chart{height:22px}}
</style>
