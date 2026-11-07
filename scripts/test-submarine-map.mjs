import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cables,project,connectionPaths,landPaths,filterCables} from '../src/utils/submarine-cables.mjs';
assert.equal(cables.length,7);assert.equal(filterCables('MAREA','').length,1);assert.ok(filterCables('日本','太平洋').length);assert.equal(filterCables('MAREA','太平洋').length,0);assert.equal(filterCables('zz-no-match','').length,0);assert.deepEqual(project(0,0),[540,270]);
const paths=connectionPaths([{lon:-124,lat:44},{lon:140,lat:35}]);assert.equal(paths.length,2);assert.ok(paths.every(p=>!p.includes('NaN')));
const land=landPaths(JSON.parse(fs.readFileSync('public/maps/land.geojson')));assert.ok(land.length>100);
for(const c of cables){assert.ok(c.points.length>=2);assert.ok(c.source.startsWith('https://'));for(const p of c.points){assert.ok(Math.abs(p.lon)<=180&&Math.abs(p.lat)<=90);}}
console.log('PASS: 7 cables, search, regions, empty state, projection, dateline splitting, land geometry and source links');
