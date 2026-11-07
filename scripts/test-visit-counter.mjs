import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canCountVisits,formatVisitCount,createVisitCounter,VISIT_SCRIPT} from '../src/utils/visit-counter.mjs';
if(process.argv[2]){assert.equal(fs.readFileSync(process.argv[2],'utf8').includes('busuanzi_value_site_pv'),false);console.log('BASELINE PASS: public visit counter absent');process.exit(0);}
for(const host of ['localhost','127.0.0.1','192.168.1.2','[::1]','preview.localhost','demo.local','example.test',''])assert.equal(canCountVisits(host),false,host);
assert.equal(canCountVisits('axaaaaa.github.io'),true);assert.equal(canCountVisits('example.com.'),true);
assert.equal(formatVisitCount('12345'),'12,345');assert.equal(formatVisitCount('0'),'0');assert.equal(formatVisitCount('0012'),'12');assert.equal(formatVisitCount('900719925474099312345'),'900,719,925,474,099,312,345');for(const v of ['',null,'NaN','<b>12</b>','-1','12.3'])assert.equal(formatVisitCount(v),null);
function fixture(){let mutation,tick,added=0,disconnects=0,script;const target={textContent:''};const env={document:{getElementById:()=>target,createElement:()=>({}),head:{appendChild(s){script=s;added++;}}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}disconnect(){disconnects++;}},setTimeout(cb){tick=cb;return 1;},clearTimeout(){}};return {env,target,change(v){target.textContent=v;mutation();},timeout(){tick();},error(){script.onerror();},get added(){return added;},get disconnects(){return disconnects;},get script(){return script;}};}
const a=fixture(),load=createVisitCounter(a.env);const one=load();assert.equal(one,load());assert.equal(a.added,1);assert.equal(a.script.src,VISIT_SCRIPT);a.change('12345');assert.equal(await one,'12,345');assert.equal(await load(),'12,345');assert.equal(a.added,1);assert.equal(a.disconnects,1);
const b=fixture();const failed=createVisitCounter(b.env)();b.error();await assert.rejects(failed,/unavailable/);assert.equal(b.disconnects,1);
const c=fixture();const timed=createVisitCounter(c.env)();c.timeout();await assert.rejects(timed,/timed out/);assert.equal(c.disconnects,1);
assert.ok(fs.readFileSync('src/components/NavigationFooter.vue','utf8').includes('本站累计访问'));
console.log('MODIFIED PASS: host gating, exact number formatting, one request, shared result, provider error, timeout, cleanup and footer integration');
