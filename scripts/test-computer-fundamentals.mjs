import assert from 'node:assert/strict';
import fs from 'node:fs';
import { knowledgeEntries, inspectByte, filterKnowledge, quiz } from '../src/data/computer-fundamentals.mjs';
assert.equal(knowledgeEntries.length, 24);
assert.equal(new Set(knowledgeEntries.map(e => e.id)).size, 24);
assert.equal(new Set(knowledgeEntries.map(e => e.category)).size, 6);
for (const entry of knowledgeEntries) for (const value of Object.values(entry)) assert.ok(value.length);
assert.equal(filterKnowledge(knowledgeEntries, '', 'ABI').length, 4);
assert.equal(filterKnowledge(knowledgeEntries, '操作系统', '').length, 4);
assert.equal(filterKnowledge(knowledgeEntries, '', '不存在的知识').length, 0);
for (let n=0; n<=255; n++) {
  const b=inspectByte(n);
  assert.equal(parseInt(b.binary,2),n); assert.equal(parseInt(b.hex,16),n);
  assert.equal(b.signed, n>127 ? n-256:n); assert.equal(b.inverse,255-n);
}
for (const value of ['', '-1','256','1.5','NaN','1e2','0xFF']) assert.equal(inspectByte(value),null);
assert.equal(inspectByte('128').signed,-128); assert.equal(inspectByte('255').ones,8);
for (const q of quiz) assert.ok(q.correct>=0 && q.correct<q.answers.length);
const navigation=fs.readFileSync('src/components/Navigation.vue','utf8');
for (const snippet of ['@open-fundamentals="scrollToComputerFundamentals"','<ComputerFundamentals ref="computerFundamentals" />',"'computerFundamentals'","action === 'fundamentals'"]) assert.ok(navigation.includes(snippet),snippet);
assert.ok(fs.readFileSync('src/components/SideNavigation.vue','utf8').includes("$emit('open-fundamentals')"));
assert.ok(fs.readFileSync('src/components/CommandPalette.vue','utf8').includes("id: 'fundamentals'"));
console.log('PASS: 24 entries, 6 categories, 256 byte values, validation, filtering, quiz and navigation integration');


const { knowledgeDiagrams } = await import('../src/data/computer-diagrams.mjs');
for (const entry of knowledgeEntries) {
  assert.equal(knowledgeDiagrams[entry.id].length, 3);
  for (const stage of knowledgeDiagrams[entry.id]) assert.ok(stage.length === 3 && stage.every(Boolean));
}
console.log('PASS: all 24 knowledge points include 3 interactive visual stages (72 total)');
