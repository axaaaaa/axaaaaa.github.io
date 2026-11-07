export function filterNetworkEntries(entries, { query = '', category = '', favoritesOnly = false, favorites = [] } = {}) {
  const needle = String(query).trim().toLowerCase();
  return entries.filter(entry => (!category || entry.category === category) && (!favoritesOnly || favorites.includes(entry.id)) && (!needle || [entry.code, entry.title, entry.description, entry.category].join(' ').toLowerCase().includes(needle)));
}
const ipv4 = number => [24, 16, 8, 0].map(shift => Math.floor(number / 2 ** shift) % 256).join('.');
export function calculateSubnet(input) {
  const match = String(input).trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(0|[1-9]\d?)$/);
  if (!match) return { error: '请输入 IPv4/CIDR，例如 192.168.1.123/24（前缀 0–32）' };
  const parts = match[1].split('.'); const prefix = Number(match[2]);
  if (prefix > 32 || parts.some(value => Number(value) > 255 || (value.length > 1 && value.startsWith('0')))) return { error: 'IP 各段应为 0–255 且不带前导零，前缀应为 0–32' };
  const address = parts.reduce((value, part) => value * 256 + Number(part), 0);
  const total = 2 ** (32 - prefix), network = Math.floor(address / total) * total, last = network + total - 1;
  const ordinary = prefix <= 30;
  return { input: match[1] + '/' + prefix, prefix, network: ipv4(network), cidr: ipv4(network) + '/' + prefix, mask: ipv4(2 ** 32 - total), wildcard: ipv4(total - 1), last: ipv4(last), broadcast: ordinary ? ipv4(last) : '不适用', firstHost: ipv4(network + (ordinary ? 1 : 0)), lastHost: ipv4(last - (ordinary ? 1 : 0)), total, hosts: ordinary ? total - 2 : total, note: prefix === 31 ? '/31 按 RFC 3021 点对点链路计算，两端地址均计入，不设定向广播。' : prefix === 32 ? '/32 表示单一地址或主机路由，不设子网广播。' : '按普通 IPv4 子网规则扣除网络地址和广播地址；未扣除特殊用途地址段，实际可分配范围取决于网络部署。' };
}
