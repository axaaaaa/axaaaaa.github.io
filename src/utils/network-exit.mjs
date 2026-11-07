import { canonicalIp, requestJson, normalizeIpMetadata, IpLookupError } from './ip-location.mjs'
export const EXIT_NODES = Object.freeze([
  Object.freeze({ id: 'ipv4', label: 'IPv4 专用观测', icon: '4️⃣', family: 'IPv4', url: 'https://api.ipify.org?format=json' }),
  Object.freeze({ id: 'ipv6', label: 'IPv6 专用观测', icon: '6️⃣', family: 'IPv6', url: 'https://api6.ipify.org?format=json' }),
  Object.freeze({ id: 'independent', label: '独立服务观测', icon: '🌐', family: 'auto', url: 'https://api.ipapi.is/' })
])
export async function probeExit(node, options = {}) {
  const now = options.now || Date.now, started = now()
  try {
    const data = await requestJson(node.url, options), ip = canonicalIp(data.ip)
    if (!ip) throw new IpLookupError('invalid')
    const version = ip.includes(':') ? 'IPv6' : 'IPv4'
    if (node.family !== 'auto' && node.family !== version) throw new IpLookupError('invalid')
    return { ip, version, elapsedMs: Math.max(0, now() - started), seed: data, details: normalizeIpMetadata(data) }
  } catch (error) {
    error.elapsedMs = Math.max(0, now() - started)
    throw error
  }
}
export function compareExits(nodes) {
  const successes = nodes.filter(n => n.status === 'success' && canonicalIp(n.ip))
  if (!nodes.length || nodes.some(n => n.status === 'pending' || n.status === 'idle')) return { kind: 'pending', text: `正在观测出口：已获取 ${successes.length}/${nodes.length} 个检测目标的结果…` }
  if (!successes.length) return { kind: 'empty', text: '暂未获得出口观测结果，可以重新检测。' }
  const addresses = { IPv4: new Set(), IPv6: new Set() }
  for (const node of successes) addresses[node.ip.includes(':') ? 'IPv6' : 'IPv4'].add(canonicalIp(node.ip))
  if (addresses.IPv4.size > 1 || addresses.IPv6.size > 1) return { kind: 'different', text: '同一地址版本出现不同出口 IP，可用于排查分流、代理策略或出口轮换。' }
  if (successes.length < nodes.length) return { kind: 'partial', text: `已获取 ${successes.length}/${nodes.length} 个观测点，未连通的目标可重新检测。` }
  if (addresses.IPv4.size && addresses.IPv6.size) return { kind: 'dual', text: 'IPv4 与 IPv6 出口分别展示；版本不同不作为出口异常。' }
  return { kind: 'matching', text: '本次成功观测点的同版本出口 IP 一致。' }
}
