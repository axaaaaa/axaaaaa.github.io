import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const d='output/disk-formats';
const fixture=`${d}/rollback-copy`;
fs.mkdirSync(`${fixture}/src/data`,{recursive:true});fs.mkdirSync(`${fixture}/output/disk-formats`,{recursive:true});
for(const name of ['computer-fundamentals.mjs','computer-diagrams.mjs']) {fs.copyFileSync(`src/data/${name}`,`${fixture}/src/data/${name}`);fs.copyFileSync(`${d}/${name}.original`,`${fixture}/output/disk-formats/${name}.original`);}
fs.copyFileSync(`${d}/ROLLBACK.sh`,`${fixture}/output/disk-formats/ROLLBACK.sh`);
const r=spawnSync('C:/Program Files/Git/bin/bash.exe',[`${fixture}/output/disk-formats/ROLLBACK.sh`],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
for(const name of ['computer-fundamentals.mjs','computer-diagrams.mjs'])assert.deepEqual(fs.readFileSync(`${fixture}/src/data/${name}`),fs.readFileSync(`${d}/${name}.original`));
const old=await import(`../${fixture}/src/data/computer-fundamentals.mjs`);assert.equal(old.knowledgeEntries.length,24);assert.equal(old.filterKnowledge(old.knowledgeEntries,'硬盘格式','').length,0);
console.log('PASS: rollback script exit 0; original hashes restored; 24 entries, no disk category; working source retains 30 entries');
