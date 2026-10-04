/**
 * 把巡检相关的文件合进 dist/。
 *
 * 为什么要这一步：`vue-cli-service build` 会清空 dist 目录，
 * 而 scripts/（巡检脚本）、sites-to-check.json（待检清单）、
 * .github/（Actions 定时任务）并不由 webpack 产出。
 * 直接 build 完就上传，这三个会一起消失，线上巡检就断了。
 *
 * 用法：npm run build:deploy
 */
import { cp, rm, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'github-status-package');
const dist = path.join(root, 'dist');

const items = [
  { from: path.join(src, 'scripts'), to: path.join(dist, 'scripts'), label: '巡检脚本' },
  { from: path.join(src, 'sites-to-check.json'), to: path.join(dist, 'sites-to-check.json'), label: '待检清单' },
  { from: path.join(src, '.github'), to: path.join(dist, '.github'), label: 'Actions 工作流' },
];

if (!existsSync(dist)) {
  console.error('dist 不存在，请先执行 npm run build');
  process.exit(1);
}

for (const item of items) {
  if (!existsSync(item.from)) {
    console.warn(`  ! 跳过（源不存在）: ${path.relative(root, item.from)}`);
    continue;
  }
  // 清掉构建残留的同名目录，避免新旧文件混在一起
  if (existsSync(item.to)) await rm(item.to, { recursive: true, force: true });
  await mkdir(path.dirname(item.to), { recursive: true });
  await cp(item.from, item.to, { recursive: true });
  const info = await stat(item.to);
  console.log(`  + ${item.label} -> ${path.relative(root, item.to)}`);
  if (!info.isDirectory()) console.log(`      ${info.size} bytes`);
}

console.log('\ndist 已就绪，可以直接同步到 Pages 仓库。');
