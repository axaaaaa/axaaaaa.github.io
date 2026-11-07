import assert from 'node:assert/strict';
import {marketTreemap,heatColor} from '../src/utils/market-heatmap.mjs';
const rows=[{symbol:'A',kind:'stock',marketCapUsd:6},{symbol:'B',kind:'crypto',marketCapUsd:3},{symbol:'C',kind:'crypto',marketCapUsd:1},{symbol:'IDX',kind:'index',marketCapUsd:100}];
for(const [w,h] of [[1000,480],[330,500],[1,1]]){
 const tiles=marketTreemap(rows,w,h);assert.equal(tiles.length,3);assert.ok(Math.abs(tiles.reduce((s,t)=>s+t.width*t.height,0)-w*h)<1e-6);
 for(const t of tiles){assert.ok(t.width>0&&t.height>0);assert.ok(t.x>=0&&t.y>=0&&t.x+t.width<=w+1e-8&&t.y+t.height<=h+1e-8);assert.ok(Math.abs(t.width*t.height/(w*h)-t.item.marketCapUsd/10)<1e-8);}
 for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){const a=tiles[i],b=tiles[j];assert.ok(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)<1e-8||Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)<1e-8);}
}
assert.equal(marketTreemap([{symbol:'X',kind:'stock'}],100,100).length,0);
assert.equal(marketTreemap([{symbol:'X',kind:'stock'}],100,100,'equal').length,1);
const equal=marketTreemap(rows,100,100,'equal');assert.ok(equal.every(t=>Math.abs(t.width*t.height-10000/3)<1e-8));
assert.deepEqual(marketTreemap(rows,0,500),[]);assert.deepEqual(marketTreemap([],100,100),[]);
assert.notEqual(heatColor(2,true),heatColor(-2,true));assert.equal(heatColor(2,true),heatColor(-2,false));assert.equal(heatColor(0,true),heatColor(0,false));
console.log('HEATMAP_TESTS_OK area ratios, no overlap, bounds, indices excluded, missing caps, equal weights, color inversion, mobile dimensions');
