import fs from 'node:fs/promises';
const output = new URL('../src/data/china-radio-directory.json', import.meta.url);
const api = 'https://rapi.qingting.fm';
async function get(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const response = await fetch(url, { signal: AbortSignal.timeout(12000) }); if (!response.ok) throw Error('HTTP ' + response.status); const json = await response.json(); if (json.Success !== 'ok' || !Array.isArray(json.Data)) throw Error('Invalid catalog'); return json.Data; } catch (error) { last = error; }
  }
  throw last;
}
const categories = await get(api + '/categories?type=channel');
const records = new Map();
const pages = [];
for (const category of categories) {
  const seen = new Set();
  for (let page = 1; ; page++) {
    if (page > 100) throw Error('Unexpected catalog page limit');
    const data = await get(`${api}/categories/${category.id}/channels?page=${page}&pagesize=100`);
    pages.push({ category: category.title, page, count: data.length });
    let added = 0;
    for (const row of data) {
      const id = String(row.content_id);
      if (!/^\d+$/.test(id) || !row.title) continue;
      if (!seen.has(id)) { seen.add(id); added++; }
      let station = records.get(id);
      if (!station) {
        station = { id: 'qtfm-' + id, name: row.title.trim(), region: row.region?.title || '其他', city: row.city?.title || '', categories: [], description: String(row.description || '').replace(/<[^>]*>/g, '').slice(0, 180), url: `https://lhttp.qtfm.cn/live/${id}/64k.mp3`, homepage: `https://m.qingting.fm/channels/${id}/`, provider: '蜻蜓FM', availability: 'unverified' };
        records.set(id, station);
      }
      if (!station.categories.includes(category.title)) station.categories.push(category.title);
    }
    console.log(`${category.title} page=${page} count=${data.length} unique=${records.size}`);
    if (data.length < 100) break;
    if (!added) throw Error('Catalog repeated page for ' + category.title);
  }
}
const stations = [...records.values()];
if (process.argv.includes('--probe')) {
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < stations.length) {
      const station = stations[cursor++];
      try {
        const response = await fetch(station.url, { signal: AbortSignal.timeout(5000) });
        station.availability = response.ok && /audio\//i.test(response.headers.get('content-type') || '') ? 'reachable' : 'unavailable';
        station.httpStatus = response.status;
        await response.body?.cancel();
      } catch { station.availability = 'unavailable'; }
    }
  }));
}
const directory = { generatedAt: new Date().toISOString(), source: api, scope: '蜻蜓FM公开广播分类目录，不等同于全国所有在播电台', categories: categories.map(c => c.title), pages, total: stations.length, reachable: stations.filter(s => s.availability === 'reachable').length, stations };
const temp = new URL(output.href + '.tmp');
await fs.writeFile(temp, JSON.stringify(directory, null, 2) + '\n');
await fs.rename(temp, output);
console.log(`DONE catalog=${directory.total} reachable=${directory.reachable} categories=${categories.length}`);
