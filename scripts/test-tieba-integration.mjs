import fs from 'node:fs';import assert from 'node:assert/strict';
const file=process.argv[2]||'scripts/fetch_extra_hotspots.py';const source=fs.readFileSync(file,'utf8');const baseline=process.argv[3]==='baseline';
assert.equal(source.includes("'tieba':"),!baseline);
if(baseline){console.log('BASELINE PASS: Tieba source absent');process.exit(0);}
assert.ok(fs.readFileSync('src/components/SourceNewsCard.vue','utf8').includes("tieba:{name:'百度贴吧'"));assert.ok(fs.readFileSync('src/components/NavigationLinks.vue','utf8').includes("sourceId in ['tieba'"));
const snapshot=JSON.parse(fs.readFileSync('public/extra-hotspots.json','utf8')).sources.tieba;
assert.equal(snapshot.items.length,24);assert.equal(snapshot.collection.status,'ok');assert.ok(snapshot.items.every(r=>/^https:\/\/tieba\.baidu\.com\/hottopic\/browse\/hottopic\?topic_id=\d+$/.test(r.url)));
console.log('MODIFIED PASS: collector, source card, navigation and 24 validated live topic links connected');
