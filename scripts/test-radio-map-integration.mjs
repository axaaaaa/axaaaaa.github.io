import fs from 'node:fs';import assert from 'node:assert/strict';
const source=fs.readFileSync(process.argv[2]||'src/components/Navigation.vue','utf8');const expected=process.argv[3]!=='absent';
assert.equal(source.includes('<RadioMap'),expected);assert.equal(source.includes("action === 'radio-map'"),expected);
if(expected){assert.ok(source.includes('stationForPlayer(player.stations, candidate)'));assert.ok(source.includes('player.play(station)'));}
console.log(expected?'MODIFIED PASS: map, command and shared player connected':'BASELINE PASS: radio map and command absent');
