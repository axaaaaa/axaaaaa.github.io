import assert from 'node:assert/strict';
import { sourceAutoRefreshMixin } from '../src/utils/source-auto-refresh.mjs';
const timers=new Map(),listeners=new Map();let counter=0,clock=0,calls=0;
const original={now:Date.now,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval,document:globalThis.document};
try{
 Date.now=()=>clock;
 globalThis.setInterval=fn=>{timers.set(++counter,fn);return counter;};
 globalThis.clearInterval=id=>timers.delete(id);
 globalThis.document={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}};
 const mixin=sourceAutoRefreshMixin(),vm={$options:{name:'SourceNewsCard'},loading:false,load:force=>{assert.equal(force,true);calls++;}};
 mixin.mounted.call(vm);assert.equal(timers.size,1);
 clock=300000;[...timers.values()][0]();assert.equal(calls,1);
 document.hidden=true;clock=600000;[...timers.values()][0]();assert.equal(calls,1);
 document.hidden=false;listeners.get('visibilitychange')();assert.equal(calls,2);
 mixin.beforeUnmount.call(vm);assert.equal(timers.size,0);assert.equal(listeners.size,0);
 mixin.mounted.call({$options:{name:'OtherComponent'},load:()=>{}});assert.equal(timers.size,0);
 console.log('SOURCE_AUTO_REFRESH_OK interval=5m hidden=skip visibility=refresh teardown=clean');
}finally{Date.now=original.now;globalThis.setInterval=original.setInterval;globalThis.clearInterval=original.clearInterval;globalThis.document=original.document;}
