import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {provinceShapes} from '../src/utils/radio-map.mjs';
import {landPaths} from '../src/utils/submarine-cables.mjs';
const require=createRequire(import.meta.url);const {parse,compileTemplate,compileScript}=require('@vue/compiler-sfc');
const file=process.argv[2]||'src/components/RadioMap.vue';const source=fs.readFileSync(file,'utf8');const baseline=process.argv[3]==='baseline';
const {descriptor,errors}=parse(source);assert.equal(errors.length,0);compileScript(descriptor,{id:'map'});assert.equal(compileTemplate({source:descriptor.template.content,filename:file,id:'map'}).errors.length,0);
if(baseline){assert.equal(source.includes('showCables'),false);console.log('BASELINE PASS: radio-only map; province layer and cable layer absent');process.exit(0);}
assert.ok(source.includes('showCables'));assert.ok(source.includes('showRadio'));assert.ok(source.includes('showProvinces'));assert.ok(source.includes('showNames'));assert.equal((source.match(/<svg /g)||[]).length,1);
const provinces=provinceShapes(JSON.parse(fs.readFileSync('public/maps/china-provinces.geojson')),landPaths);
assert.equal(provinces.filter(p=>p.name).length,34);assert.ok(provinces.every(p=>p.paths.every(d=>!d.includes('NaN'))));assert.ok(provinces.some(p=>p.name==='新疆'));assert.ok(provinces.some(p=>p.name==='广西'));
const nav=fs.readFileSync('src/components/Navigation.vue','utf8');assert.ok(!nav.includes('<SubmarineCableMap'));assert.ok(nav.includes('map.showCables = true'));assert.ok(nav.includes('map.mapView = \'world\''));
const palette=fs.readFileSync('src/components/CommandPalette.vue','utf8');assert.ok(palette.includes('right:88px;bottom:30px'));assert.ok(palette.includes('right:72px;bottom:20px'));
console.log('MODIFIED PASS: one SVG, radio/cable/province/name layers, 34 named regions, shared command target, separated floating controls, Vue compilation');
