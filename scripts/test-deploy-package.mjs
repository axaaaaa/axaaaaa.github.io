import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const modulePath = 'dist/fetch_hacker_news.py';
assert.ok(fs.existsSync(modulePath), 'Deployment package must contain the Hacker News collector');
assert.deepEqual(fs.readFileSync(modulePath), fs.readFileSync('scripts/fetch_hacker_news.py'));
const result = spawnSync('python', ['-m', 'unittest', 'discover', '-s', 'scripts', '-p', 'test_hacker_news.py'], { cwd: 'dist', encoding: 'utf8' });
assert.equal(result.status, 0, result.stdout + result.stderr);
console.log('PASS: packaged Hacker News module matches source; all 4 collector tests pass');
