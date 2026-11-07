import fs from 'node:fs';
import assert from 'node:assert/strict';
import postcss from 'postcss';
const css=fs.readFileSync(process.argv[2] || 'src/styles/reference-console.css','utf8');
const rules=[];postcss.parse(css).walkRules(r=>rules.push(r));
const ids=['#crypto-playground','#computer-fundamentals','#system-installation'];
for(const id of ids) {
 const shared=rules.find(r=>r.selector.startsWith('body :is(#shortcut-library,')&&r.selector.endsWith(')')&&r.selector.includes(id));
 assert.ok(shared,`${id}: shared palette missing`);
 const light=rules.find(r=>r.selector.startsWith('body:not(.dark) :is(#shortcut-library,')&&r.selector.includes(id));assert.ok(light);
 for(const prop of ['--el-bg-color','--el-text-color-primary','--el-border-color','--ui-accent','--console-card'])for(const rule of [shared,light])assert.ok(rule.nodes.some(n=>n.prop===prop),prop);
 for(const tail of [' h2',' :is(button,input,select,textarea)',' :is(button,input,select,textarea):focus-visible'])assert.ok(rules.some(r=>r.selector.includes(id)&&r.selector.endsWith(tail)));
}
assert.ok(rules.some(r=>r.selector.includes('button[aria-current="step"]')));
assert.ok(rules.some(r=>r.selector.includes('.knowledge-diagram')&&r.nodes.some(n=>n.prop==='background')));
console.log('PASS: 3 modules share light/dark palette, typography, controls, focus, step selection and diagram/card surfaces');
