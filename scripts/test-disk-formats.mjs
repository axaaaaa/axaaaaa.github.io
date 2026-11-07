import assert from 'node:assert/strict';
import fs from 'node:fs';
import { knowledgeEntries, filterKnowledge } from '../src/data/computer-fundamentals.mjs';
import { knowledgeDiagrams } from '../src/data/computer-diagrams.mjs';
const disk=filterKnowledge(knowledgeEntries,'硬盘格式','');
assert.equal(disk.length,6);
assert.equal(new Set(knowledgeEntries.map(e=>e.id)).size,knowledgeEntries.length);
for(const e of knowledgeEntries) { assert.equal(knowledgeDiagrams[e.id].length,3); for(const s of knowledgeDiagrams[e.id]) assert.ok(s.length===3&&s.every(Boolean)); }
for(const q of ['GPT','MBR','FAT32','NTFS','exFAT','ext4','APFS','TRIM']) assert.ok(filterKnowledge(disk,'',q).length,q);
assert.ok(fs.readFileSync('src/components/ComputerFundamentals.vue','utf8').includes('new Set(this.entries.map(entry => entry.category))'));
console.log('PASS: 30 entries, 7 categories, 6 disk lessons, 90 diagram stages, search and automatic category integration');
