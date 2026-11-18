<template>



 <section v-if="events.length||selectedDay==='previous'" class="x-global-events" :class="{'events-dark':dark}" aria-labelledby="global-events-heading">



  <header class="events-header"><div class="events-title-line"><h2 id="global-events-heading">{{selectedDay==='previous'?'前一天海外在聊什么':'昨天海外在聊什么'}}</h2></div><div class="events-actions"><div class="events-day-tabs" role="group" aria-label="海外热点日期"><button type="button" :aria-pressed="selectedDay==='latest'" @click="changeDay('latest')">最新一天</button><button type="button" :aria-pressed="selectedDay==='previous'" @click="changeDay('previous')">前一天</button></div><span>数据 {{dataDate.slice(5)}}（UTC）{{error?' · 缓存':''}}</span><button type="button" :aria-pressed="paused" @click="paused=!paused">{{paused?'继续轮播':'暂停轮播'}}</button><a href="https://xbangdan.com/global/" target="_blank" rel="noopener noreferrer">来源：X榜单海外 ↗</a></div></header>



  <p v-if="dayUnavailable" class="events-day-empty" role="status">前一天暂无归档数据，请切换到最新一天。</p>
  <div v-if="events.length" class="events-layout">



   <a class="event-tile event-hero" :href="hero.url" target="_blank" rel="noopener noreferrer">



    <img v-if="hero.image&&!failedImages[hero.id]" :src="hero.image" alt="" referrerpolicy="no-referrer" @error="failImage(hero.id)" />



    <span class="event-shade"></span><span class="event-top"><b>头条</b><span>{{hero.category}}</span></span><span class="event-copy"><strong>{{hero.title}}</strong><span class="event-summary">{{hero.summary}}</span><span class="event-stats">{{hero.count}} 条推文 · {{formatNumber(hero.likes)}} 赞 · {{formatNumber(hero.views)}} 曝光</span></span>



   </a>



   <div ref="viewport" class="events-viewport" tabindex="0" aria-label="海外热点轮播，可左右滑动或滚动" @mouseenter="canHover&&(hovered=true)" @mouseleave="hovered=false" @focusin="focused=true" @focusout="focused=false" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)" @pointerdown="hold" @pointerup="release" @pointercancel="release" @pointerleave="release" @touchstart.passive="hold" @touchmove.passive="hold" @touchend="release" @touchcancel="release" @wheel.passive="onWheel">



    <div ref="track" class="events-track">



     <div v-for="copy in (secondary.length>1?2:1)" :key="copy" class="events-group" :aria-hidden="copy===2?'true':undefined">



      <a v-for="event in secondary" :key="event.id" class="event-tile event-small" :href="event.url" target="_blank" rel="noopener noreferrer" :tabindex="copy===2?-1:0">



       <img v-if="event.image&&!failedImages[event.id]" :src="event.image" alt="" loading="lazy" referrerpolicy="no-referrer" @error="failImage(event.id)" />



       <span class="event-shade"></span><span class="event-top"><b>{{event.id.padStart(2,'0')}}</b><span>{{event.category}}</span></span><span class="event-copy"><strong>{{event.title}}</strong><span class="event-stats">{{event.count}} 条推文 · {{formatNumber(event.likes)}} 赞</span></span>



      </a>



     </div>



    </div>



   </div>



  </div>



 </section>



</template>



<script>
import {globalDayMixin} from '../utils/global-day.mjs';





export default {
 mixins:[globalDayMixin],



 name:'XGlobalEvents',props:{dark:Boolean},emits:['select-event'],



 data:()=>({events:[],dataDate:'',error:false,paused:false,hovered:false,focused:false,selectedId:'',failedImages:{},controller:null,frame:0,lastFrame:0,scrollPosition:0,reduced:false,mediaQuery:null,canHover:true,holding:false,idleTimer:0}),



 computed:{hero(){return this.events[0];},secondary(){return this.events.slice(1);}},



 async mounted(){this.mediaQuery=window.matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.mediaQuery.matches;this.mediaQuery.addEventListener?.('change',this.motionChanged);this.canHover=window.matchMedia('(hover:hover) and (pointer:fine)').matches;await this.load();this.$nextTick(()=>this.start());},



 beforeUnmount(){this.controller?.abort();cancelAnimationFrame(this.frame);clearTimeout(this.idleTimer);this.mediaQuery?.removeEventListener?.('change',this.motionChanged);},



 methods:{



  formatNumber(n){return n>=100000000?`${(n/100000000).toFixed(1)}亿`:n>=10000?`${(n/10000).toFixed(1)}万`:String(n);},



  failImage(id){this.failedImages={...this.failedImages,[id]:true};},



  motionChanged(e){this.reduced=e.matches;},



  clearSelection(){this.selectedId='';this.$emit('select-event',null);},



  move(direction){this.$refs.viewport?.scrollBy({left:direction*240,behavior:this.reduced?'auto':'smooth'});},



 hold(){clearTimeout(this.idleTimer);this.holding=true;},



 onWheel(){this.hold();this.release();},



 release(){clearTimeout(this.idleTimer);this.idleTimer=setTimeout(()=>{this.settle();this.holding=false;},1800);},



 settle(){const viewport=this.$refs.viewport;const track=this.$refs.track;if(!viewport||!track)return;const loop=track.scrollWidth/2;if(loop>0&&viewport.scrollLeft>=loop)viewport.scrollLeft-=loop;this.scrollPosition=viewport.scrollLeft;},



  start(){



   const tick=(now)=>{const delta=this.lastFrame?Math.min(now-this.lastFrame,64):0;this.lastFrame=now;const viewport=this.$refs.viewport;const track=this.$refs.track;



    if(viewport&&track&&this.secondary.length>1&&!this.paused&&!this.hovered&&!this.focused&&!this.reduced&&!this.holding&&!document.hidden&&this.$el.getBoundingClientRect().height>0){



     const loop=track.scrollWidth/2;this.scrollPosition=(this.scrollPosition+delta*0.026)%loop;viewport.scrollLeft=this.scrollPosition;



    }else if(viewport){this.scrollPosition=viewport.scrollLeft;}



    this.frame=requestAnimationFrame(tick);



   };cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(tick);



  },



  accept(data){



   if(!data||!Array.isArray(data.events)||typeof data.dataDate!=='string')throw Error('Missing events');



   const validUrl=url=>typeof url==='string'&&/^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}\/status\/\d{1,25}$/.test(url);



   const seen=new Set();const events=data.events.filter(e=>e&&/^\d{1,6}$/.test(e.id)&&typeof e.title==='string'&&e.title.trim()&&typeof e.summary==='string'&&typeof e.category==='string'&&Array.isArray(e.tweetIds)&&e.tweetIds.length&&e.tweetIds.every(id=>/^\d{1,25}$/.test(id))&&['count','likes','views'].every(k=>Number.isFinite(e[k])&&e[k]>=0)&&!seen.has(e.id)&&seen.add(e.id)).map(e=>({...e,url:validUrl(e.url)?e.url:(data.items||[]).filter(t=>e.tweetIds.includes(t.id)&&validUrl(t.url)).sort((a,b)=>b.likes-a.likes)[0]?.url,image:typeof e.image==='string'&&/^https:\/\/pbs\.twimg\.com\/media\//.test(e.image)?e.image:''})).filter(e=>validUrl(e.url)).slice(0,30);



   if(!events.length)throw Error('No events');this.events=events;this.dataDate=data.dataDate;



  },



  async load(){



   try{this.accept(JSON.parse(localStorage.getItem('navigation-x-global-v1')));}catch{/* optional cache */}



   this.controller=new AbortController();const timer=setTimeout(()=>this.controller.abort(),12000);



   try{const r=await fetch(`${process.env.BASE_URL}x-global.json`,{cache:'no-cache',signal:this.controller.signal});if(!r.ok)throw Error('Request failed');const data=await r.json();this.accept(data);try{localStorage.setItem('navigation-x-global-v1',JSON.stringify(data));}catch{/* optional storage */}}



   catch{this.error=true;}finally{clearTimeout(timer);}



  }



 }



};



</script>



<style scoped>



.x-global-events{--ev-text:#26364c;--ev-muted:#7b8799;--ev-line:rgba(105,128,160,.18);margin:18px 0 0;padding:18px;border:1px solid var(--ev-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--ev-text);min-width:0;box-sizing:border-box}



.events-dark{--ev-text:#b0d4ba;--ev-muted:#8ca995;--ev-line:#263c2e;background:linear-gradient(rgba(176,212,186,.015) 1px,transparent 1px),#080f0b;background-size:100% 4px}



.events-header{position:relative;inset-block-start:-9px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.events-header h2{margin:0;font-size:17px;font-weight:700}.events-header p{margin:5px 0 0;font-size:12px;color:var(--ev-muted)}.events-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:var(--ev-muted);font-size:11px}.events-actions a{color:inherit;text-decoration:none}



.x-global-events button{font:inherit;cursor:pointer}.events-actions button,footer button{border:1px solid var(--ev-line);border-radius:7px;padding:6px 9px;background:transparent;color:var(--ev-text);font-size:11px}



.events-layout{display:grid;grid-template-columns:minmax(260px,.9fr) minmax(0,1.6fr);gap:14px;min-width:0}.event-tile{display:block;box-sizing:border-box;text-decoration:none;font:inherit;position:relative;isolation:isolate;overflow:hidden;text-align:left;border:0;border-radius:13px;background:linear-gradient(145deg,#223d71,#186b79 70%,#243650);color:white;padding:0;min-width:0}.event-tile img,.event-shade{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}.event-shade{background:linear-gradient(180deg,rgba(4,12,28,.18),rgba(4,12,28,.32) 30%,rgba(4,12,28,.95));z-index:1}.event-hero{height:280px;width:100%}.event-top{position:absolute;top:15px;left:16px;right:16px;display:flex;align-items:center;justify-content:space-between;z-index:2;font-size:11px}.event-top b{font-size:13px}.event-top>span{padding:4px 7px;border:1px solid rgba(255,255,255,.28);border-radius:20px;background:rgba(5,16,30,.35)}.event-copy{position:absolute;z-index:2;left:16px;right:16px;bottom:18px;display:flex;flex-direction:column;gap:9px}.event-copy strong{font-size:22px;line-height:1.4;font-weight:700;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.event-summary{font-size:12px;line-height:1.7;color:#e5edf6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.event-stats{font-size:11px;color:#d1dcec;line-height:1.6}.event-tile:hover .event-shade{background:linear-gradient(180deg,rgba(4,12,28,.05),rgba(4,12,28,.24) 30%,rgba(4,12,28,.93))}.event-tile.selected{box-shadow:inset 0 0 0 3px #f7ad55}.event-tile.selected:after{content:'✓ 已选择';position:absolute;top:50px;right:16px;z-index:3;color:#ffe1af;font-size:11px;background:#172d43;padding:4px 7px;border-radius:5px}



.events-viewport{overflow-x:auto;overflow-y:hidden;min-width:0;border-radius:13px;scrollbar-width:thin;scrollbar-color:#a0b2c5 transparent;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}.events-track{display:flex;width:max-content;min-height:280px}.events-group{display:grid;grid-template-rows:repeat(2,133px);grid-auto-flow:column;grid-auto-columns:230px;gap:14px;padding-right:14px}.event-small{width:230px;height:133px}.event-small:nth-child(3n){background:linear-gradient(135deg,#412b72,#794673)}.event-small:nth-child(3n+1){background:linear-gradient(135deg,#124552,#246e76)}.event-small .event-top{top:10px;font-size:10px}.event-small .event-top b{font-size:11px}.event-small .event-copy{bottom:12px;gap:5px}.event-small .event-copy strong{font-size:14px;line-height:1.5}.event-small .event-stats{font-size:10px}.event-small .event-top>span{padding:2px 6px}footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;color:var(--ev-muted);font-size:11px}.x-global-events button:focus-visible,.event-tile:focus-visible,.events-viewport:focus-visible,.events-actions a:focus-visible{outline:2px solid #e99c46;outline-offset:3px}



@media(max-width:700px){.x-global-events{padding:14px;border-radius:14px}.events-header{align-items:flex-start;flex-direction:column;gap:9px}.events-actions{gap:10px}.events-layout{grid-template-columns:minmax(0,1fr);gap:12px}.event-hero{height:230px}.event-copy strong{font-size:20px}.events-group{grid-template-rows:repeat(2,125px);grid-auto-columns:205px;gap:10px;padding-right:10px}.events-track{min-height:260px}.event-small{width:205px;height:125px}.event-small .event-copy strong{font-size:13px}footer{line-height:1.6}}



@media(prefers-reduced-motion:reduce){.events-viewport{scroll-behavior:auto}}





/* Shared header layout; colors follow the active theme. */

.events-header{align-items:center;flex-wrap:wrap;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--ev-line)}

.events-title-line{display:flex;align-items:center;gap:14px;flex:1 1 620px;min-width:0}.events-title-line h2{flex-shrink:0;color:var(--ev-text);font-size:16px;line-height:1.5;font-weight:600}

.events-notes{display:flex;align-items:center;flex-wrap:wrap;column-gap:16px;row-gap:4px;min-width:0;color:var(--ev-muted);font-size:10px;line-height:1.65}.events-notes span{overflow-wrap:anywhere}.events-actions{gap:10px;font-size:10px}

@media(max-width:700px){.events-header{align-items:stretch;flex-direction:column;gap:10px}.events-title-line{flex:initial;align-items:flex-start;gap:10px}.events-title-line h2{font-size:14px;line-height:1.65}.events-notes{font-size:9px;line-height:1.6;gap:4px}.events-actions{gap:8px;justify-content:space-between}}

/* Dark-green terminal treatment, matching the navigation site's terminal panels. */

.x-global-events.events-dark{--ev-text:#c9f0d8;--ev-muted:#78cf9b;--ev-line:#265038;background:linear-gradient(rgba(169,224,189,.018) 1px,transparent 1px),#06120b;background-size:100% 4px;border:1px solid #265038;border-radius:5px;box-shadow:none;color:var(--ev-text);font-family:ui-monospace,SFMono-Regular,Consolas,'Microsoft YaHei',monospace}

.events-dark .events-header{align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--ev-line)}

.events-dark .events-title-line{display:flex;align-items:center;gap:14px;flex:1 1 620px;min-width:0}

.events-dark .events-title-line h2{flex-shrink:0;color:#c9f0d8;font-size:16px;line-height:1.5;font-weight:600}

.events-dark .events-title-line h2:before{content:'> ';color:#78cf9b}

.events-dark .events-notes{display:flex;align-items:center;flex-wrap:wrap;column-gap:16px;row-gap:4px;min-width:0;color:#78cf9b;font-size:10px;line-height:1.65}

.events-dark .events-notes span{overflow-wrap:anywhere}

.events-dark .events-notes span+span{color:#6e9c81}

.events-dark .events-actions{gap:10px;font-size:10px;color:#78cf9b}

.events-dark .events-actions button{border:1px solid #265038;border-radius:3px;color:#a9e0bd;background:#09190f;font-size:10px}

.events-dark .events-actions button:hover{background:#0f2a1b;border-color:#78cf9b}

.events-dark .events-actions a:hover{color:#d6f5e2}

.events-dark .event-tile,.events-dark .event-small:nth-child(3n),.events-dark .event-small:nth-child(3n+1){border:1px solid #265038;border-radius:4px;background:linear-gradient(135deg,#0f2a1b,#153a24);color:#e3f9ea}

.events-dark .event-tile img{filter:saturate(.8) brightness(.88)}

.events-dark .event-shade{background:linear-gradient(180deg,rgba(4,16,9,.12),rgba(4,16,9,.3) 28%,rgba(4,16,9,.96))}

.events-dark .event-tile:hover{border-color:#78cf9b}

.events-dark .event-tile:hover .event-shade{background:linear-gradient(180deg,rgba(4,16,9,.05),rgba(4,16,9,.15) 28%,rgba(4,16,9,.94))}

.events-dark .event-top{color:#c9f0d8}

.events-dark .event-top>span{border:1px solid #38624a;border-radius:3px;background:rgba(6,18,11,.78);color:#cdeed7}

.events-dark .event-summary{color:#b7dcc2}

.events-dark .event-stats{color:#9dc4ab}

.events-dark .event-copy strong{color:#e6f7ec;font-weight:600}

.events-dark .events-viewport{border-radius:4px;scrollbar-color:#3d6a50 #0b1b12}

.x-global-events.events-dark button:focus-visible,.events-dark .event-tile:focus-visible,.events-dark .events-viewport:focus-visible,.events-dark .events-actions a:focus-visible{outline-color:#78cf9b}

@media(max-width:700px){

.x-global-events.events-dark{border-radius:4px;padding:13px}

.events-dark .events-header{align-items:stretch;flex-direction:column;gap:10px}

.events-dark .events-title-line{flex:initial;align-items:flex-start;gap:10px}

.events-dark .events-title-line h2{font-size:14px;line-height:1.65}

.events-dark .events-notes{font-size:9px;line-height:1.6;gap:4px}

.events-dark .events-actions{gap:8px;justify-content:space-between}

.events-dark .event-copy strong{font-size:19px}

.events-dark .event-small .event-copy strong{font-size:13px}}



</style>




<style scoped>
.events-day-tabs{display:flex;gap:4px}.events-day-tabs button[aria-pressed="true"]{color:#b7682d;background:rgba(233,156,70,.14);border-color:rgba(233,156,70,.4);font-weight:600}.events-day-empty{padding:24px 0;margin:0;color:var(--ev-muted);font-size:13px}
</style>
