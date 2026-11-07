export function mergeRadioDirectory(presets, catalog) {
  const result = [], seen = new Set();
  const normalize = value => { try { const u = new URL(value); u.hash = ''; return u.href; } catch { return ''; } };
  for (const station of presets) {
    const url = normalize(station.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const detail = catalog.find(row => normalize(row.url) === url);
    result.push({ ...detail, ...station, region: detail?.region || (station.id === 'beijing-music' || station.id === 'beijing-news' ? '北京' : station.id === 'guangdong-music' ? '广东' : station.id === 'handan-happy' ? '河北' : '海外'), categories: detail?.categories || ['音乐台'], availability: detail?.availability || 'unverified' });
  }
  for (const station of catalog) {
    const url = normalize(station.url);
    if (!url || !url.startsWith('https://') || seen.has(url)) continue;
    seen.add(url); result.push({ ...station });
  }
  return result;
}
export function filterRadioDirectory(stations, { query = '', region = '', category = '', availability = '', favoritesOnly = false, favorites = [] } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  const favoriteSet = new Set(favorites);
  return stations.filter(station => (!region || station.region === region) && (!category || station.categories?.includes(category)) && (!availability || station.availability === availability) && (!favoritesOnly || favoriteSet.has(station.id)) && (!needle || [station.name, station.region, station.city, ...(station.categories || [])].join(' ').toLocaleLowerCase().includes(needle)));
}
