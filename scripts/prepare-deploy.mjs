/**
 * 把采集相关的脚本合进 dist/。
 *
 * 为什么要这一步：`vue-cli-service build` 会清空 dist 目录，
 * 而 scripts/（采集脚本）并不由 webpack 产出。
 * 直接 build 完就上传，这些脚本会一起消失，线上定时采集就断了。
 *
 * 用法：npm run build:deploy
 */
import { cp, rm, mkdir, stat, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const items = [
  ...['hot','global','words','articles'].map(name => ({ from: path.join(root, 'scripts', `fetch_x_${name}.py`), to: path.join(dist, `fetch_x_${name}.py`), label: `X ${name} 采集脚本` })),
  { from: path.join(root, 'scripts', 'refresh_sources.py'), to: path.join(dist, 'scripts', 'refresh_sources.py'), label: '采集执行与健康状态' },
  ...(await readdir(path.join(root, 'scripts'))).filter(name => /^test_.*\.py$/.test(name)).map(name => ({ from: path.join(root, 'scripts', name), to: path.join(dist, 'scripts', name), label: `采集测试 ${name}` })),
  { from: path.join(root, 'scripts', 'fetch_history_today.py'), to: path.join(dist, 'fetch_history_today.py'), label: '历史上的今天脚本' },
  { from: path.join(root, 'scripts', 'fetch_nasa_apod.py'), to: path.join(dist, 'fetch_nasa_apod.py'), label: 'NASA 每日天文图脚本' },
  { from: path.join(root, 'scripts', 'fetch_extra_hotspots.py'), to: path.join(dist, 'fetch_extra_hotspots.py'), label: '扩展热点来源脚本' },
  { from: path.join(root, 'scripts', 'source_images.py'), to: path.join(dist, 'source_images.py'), label: '来源封面采集模块' },
  { from: path.join(root, 'scripts', 'fetch_exchange_rates.py'), to: path.join(dist, 'fetch_exchange_rates.py'), label: '多币种汇率脚本' },
  { from: path.join(root, 'scripts', 'fetch_markets.py'), to: path.join(dist, 'fetch_markets.py'), label: '市场行情脚本' },
  { from: path.join(root, 'scripts', 'market_caps.py'), to: path.join(dist, 'market_caps.py'), label: '市值采集模块' },
  { from: path.join(root, 'scripts', 'fetch_weibo.py'), to: path.join(dist, 'fetch_weibo.py'), label: '微博热搜脚本' },
  { from: path.join(root, 'scripts', 'fetch_v2ex.py'), to: path.join(dist, 'fetch_v2ex.py'), label: 'V2EX 热门脚本' },
  { from: path.join(root, 'scripts', 'fetch_github_trending.py'), to: path.join(dist, 'fetch_github_trending.py'), label: 'GitHub 热点脚本' },
  { from: path.join(root, 'scripts', 'fetch_hacker_news.py'), to: path.join(dist, 'fetch_hacker_news.py'), label: 'Hacker News 采集脚本' },
  { from: path.join(root, 'scripts', 'fetch_xueqiu.py'), to: path.join(dist, 'fetch_xueqiu.py'), label: '雪球热帖脚本' },
  { from: path.join(root, 'scripts', 'fetch_news.py'), to: path.join(dist, 'fetch_news.py'), label: '热点采集脚本' },
  { from: path.join(root, 'scripts', 'generate_digest.py'), to: path.join(dist, 'generate_digest.py'), label: 'AI 速览脚本' },
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

const usageFile = path.join(dist, 'pages-usage.json');
async function countBytes(dir) {
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (file === usageFile || file === path.join(dist, '.git')) continue;
    if (entry.isDirectory()) bytes += await countBytes(file);
    else if (entry.isFile()) bytes += (await stat(file)).size;
  }
  return bytes;
}

const fileBytes = await countBytes(dist);
let deployedBytes = fileBytes;
let manifest;
while (true) {
  manifest = JSON.stringify({ deployedBytes }) + '\n';
  const total = fileBytes + Buffer.byteLength(manifest);
  if (total === deployedBytes) break;
  deployedBytes = total;
}
await writeFile(usageFile, manifest);
console.log(`  + 发布文件总大小：${deployedBytes} bytes`);
console.log('\ndist 已就绪，可以直接同步到 Pages 仓库。');
