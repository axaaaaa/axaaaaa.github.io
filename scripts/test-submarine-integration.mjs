import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=process.argv[2]||'src/components/Navigation.vue';
const source=fs.readFileSync(file,'utf8');
const expected=process.argv[3]==='absent'?false:true;
const mounted = source.includes('<SubmarineCableMap') || (source.includes('<RadioMap') && source.includes('map.showCables = true'));
assert.equal(mounted,expected);
assert.equal(source.includes("action === 'cables'"),expected);
console.log(expected?'MODIFIED PASS: map mounted and command action connected':'BASELINE PASS: map and command action absent');
