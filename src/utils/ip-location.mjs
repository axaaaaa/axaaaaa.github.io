import { resolveCountryCode } from './country-flags.mjs'

const labels = { timeout: '查询超时', blocked: '服务拦截', rate: '请求限流', format: '返回格式异常', network: '网络或跨域异常', service: '服务异常', invalid: '数据异常', aborted: '查询已取消' }
export class IpLookupError extends Error {
  constructor(code, attempts = []) { super(labels[code] || '查询失败'); this.name = 'IpLookupError'; this.code = code; this.attempts = attempts }
}
export function canonicalIp(value) {
  if (typeof value !== 'string' || value.length > 45) return ''
  const ip = value.trim()
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return ip.split('.').every(v => Number(v) <= 255 && String(Number(v)) === v) ? ip : ''
  if (!ip.includes(':') || !/^[\da-f:.]+$/i.test(ip)) return ''
  try { return new URL(`https://[${ip}]/`).hostname.slice(1, -1) } catch { return '' }
}

export function normalizeIpMetadata(data = {}) {
  data = data && typeof data === 'object' ? data : {}
  const raw = data.metadata && typeof data.metadata === 'object' ? data.metadata : data
  const text = value => typeof value === 'string' ? value.trim().slice(0, 256) : ''
  const company = raw.company && typeof raw.company === 'object' ? raw.company : {}
  const as = raw.asn && typeof raw.asn === 'object' ? raw.asn : {}
  const connection = raw.connection && typeof raw.connection === 'object' ? raw.connection : {}
  const flag = value => typeof value === 'boolean' ? value : null
  const vpn = flag(raw.is_vpn), proxy = flag(raw.is_proxy), tor = flag(raw.is_tor)
  const operator = text(raw.isp) || text(connection.isp) || text(as.org) || text(raw.org) || text(company.name) || text(raw.company)
  const asnValue = as.asn ?? raw.asn
  const match = (typeof asnValue === 'number' && Number.isInteger(asnValue) ? String(asnValue) : text(asnValue)).match(/^(?:AS)?(\d{1,10})(?:\s|$)/i)
  const asn = match && Number(match[1]) > 0 && Number(match[1]) <= 4294967295 ? `AS${Number(match[1])}` : ''
  const asnName = text(as.org) || text(raw.asn_name) || text(raw.asn_org) || (asn && typeof asnValue === 'string' ? text(asnValue.replace(/^(?:AS)?\d+\s*/i, '')) : '')
  const asnDescription = text(as.descr) || text(as.description) || text(raw.asn_description)
  const asnCountry = resolveCountryCode(as.country || raw.asn_country)
  const categories = { residential: '住宅宽带', mobile: '移动网络', cellular: '移动网络', satellite: '卫星网络',
    datacenter: '机房/数据中心', data_center: '机房/数据中心', hosting: '托管/云服务网络',
    isp: '运营商网络（未细分）', business: '商业/其他组织网络', corporate: '企业网络',
    education: '教育机构网络', government: '政务机构网络', banking: '金融机构网络' }
  const declared = text(raw.network_type) || text(raw.connection_type) || text(connection.type)
  const organization = text(as.type) || text(company.type)
  const kind = value => value.toLowerCase().replace(/[ -]+/g, '_')
  const labels = []
  if (raw.is_residential === true) labels.push('住宅宽带')
  if (raw.is_mobile === true) labels.push('移动网络')
  if (raw.is_satellite === true) labels.push('卫星网络')
  if (raw.is_datacenter === true) labels.push('机房/数据中心')
  const lookup = key => Object.prototype.hasOwnProperty.call(categories, key) ? categories[key] : ''
  const networkType = labels.length ? labels.join(' · ') : lookup(kind(declared)) || lookup(kind(organization)) || '未提供'
  // Cache only the fields needed by this panel, not the full provider response.
  const cache = { isp: operator, company: { name: operator, type: organization },
    asn: { asn: asn ? Number(asn.slice(2)) : null, org: asnName, descr: asnDescription, country: asnCountry }, network_type: declared, connection_type: '',
    is_vpn: vpn, is_proxy: proxy, is_tor: tor, is_mobile: flag(raw.is_mobile),
    is_satellite: flag(raw.is_satellite), is_datacenter: flag(raw.is_datacenter), is_residential: flag(raw.is_residential),
    connection: {} }
  return { networkType, operator: operator || '未提供', asn: asn || '未提供', asnName, asnDescription, asnCountry, vpn, proxy, tor, cache }
}

export async function requestJson(url, options) {
  if (options.signal?.aborted) throw new IpLookupError('aborted')
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort()
  options.signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, options.timeoutMs ?? 4000)
  try {
    const response = await (options.fetchImpl || fetch)(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' })
    if ([401, 403].includes(response.status)) throw new IpLookupError('blocked')
    if (response.status === 429) throw new IpLookupError('rate')
    if (!response.ok) throw new IpLookupError('service')
    let data
    try { data = await response.json() } catch (error) {
      if (controller.signal.aborted) throw error
      throw new IpLookupError('format')
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new IpLookupError('format')
    if (data.error || data.success === false) throw new IpLookupError('service')
    return data
  } catch (error) {
    if (options.signal?.aborted) throw new IpLookupError('aborted')
    if (timedOut) throw new IpLookupError('timeout')
    if (error instanceof IpLookupError) throw error
    throw new IpLookupError('network')
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
  }
}
async function trySources(sources, options, normalize) {
  const attempts = []
  for (const source of sources) {
    try { return { ...normalize(await requestJson(source.url, options)), source: source.name } }
    catch (error) {
      if (options.signal?.aborted || error.code === 'aborted') throw new IpLookupError('aborted')
      attempts.push({ source: source.name, code: error.code || 'invalid' })
    }
  }
  const code = attempts.every(v => v.code === attempts[0].code) ? attempts[0].code : 'service'
  throw new IpLookupError(code, attempts)
}
export async function lookupPublicIp(options = {}) {
  return trySources([
    { name: 'ipify（IPv4/IPv6）', url: 'https://api64.ipify.org?format=json' },
    { name: 'ipapi.is', url: 'https://api.ipapi.is/' },
    { name: 'ipify（IPv4）', url: 'https://api.ipify.org?format=json' }
  ], options, data => {
    const ip = canonicalIp(data.ip)
    if (!ip) throw new IpLookupError('invalid')
    return { ip, seed: data, details: normalizeIpMetadata(data) }
  })
}
function normalizedRegion(data, ip) {
  if (data.error || data.success === false || canonicalIp(data.ip) !== ip) throw new IpLookupError('invalid')
  const loc = data.location && typeof data.location === 'object' ? data.location : data
  const clean = value => typeof value === 'string' ? value.trim() : ''
  const country = clean(loc.country_name || loc.country), state = clean(loc.state || loc.region), city = clean(loc.city)
  const countryCode = resolveCountryCode(loc.country_code || loc.country_code_iso2 || loc.countryCode || data.country_code, country)
  const fields = [country, state, city].filter(Boolean)
  if (!fields.length) throw new IpLookupError('invalid')
  const latitude = loc.latitude ?? loc.lat, longitude = loc.longitude ?? loc.lon
  const hasCoordinates = typeof latitude === 'number' && Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && Math.abs(longitude) <= 180
  return { ip, country, countryCode, state, city, details: normalizeIpMetadata(data), region: [...new Set(fields)].join(' · '), name: clean(loc.city || loc.state || loc.region || loc.country) || 'IP 地区',
    latitude: hasCoordinates ? latitude : null, longitude: hasCoordinates ? longitude : null }
}
function storageFor(options) {
  if ('storage' in options) return options.storage
  try { return sessionStorage } catch { return null }
}
export async function lookupIpRegion(value, options = {}) {
  const ip = canonicalIp(value)
  if (!ip) throw new IpLookupError('invalid')
  if (options.signal?.aborted) throw new IpLookupError('aborted')
  const storage = storageFor(options), key = `navigation-ip-region-v1:${ip}`
  let legacyCache = null
  try {
    const cached = JSON.parse(storage?.getItem(key) || 'null')
    if (cached && Number.isFinite(cached.savedAt) && Date.now() >= cached.savedAt && Date.now() - cached.savedAt < 6 * 60 * 60 * 1000) {
      const checked = normalizedRegion(cached.value, ip)
      const value = { ...checked, source: `${cached.source || '地区服务'}（会话缓存）` }
      if (cached.value.metadata && cached.value.metadata.asn && typeof cached.value.metadata.asn === 'object') return value
      legacyCache = value
    }
  } catch { /* Optional session cache may be unavailable or stale. */ }
  let result
  if (options.seed) {
    try { result = { ...normalizedRegion(options.seed, ip), source: options.seedSource || 'IP 服务' } } catch { /* IP-only providers have no region. */ }
  }
  if (!result) {
    try {
      result = await trySources([
        { name: 'ipapi.is', url: `https://api.ipapi.is/?q=${encodeURIComponent(ip)}` },
        { name: 'ipapi.co', url: `https://ipapi.co/${encodeURIComponent(ip)}/json/` }
      ], options, data => normalizedRegion(data, ip))
    } catch (error) {
      if (legacyCache && error.code !== 'aborted' && !options.signal?.aborted) return legacyCache
      throw error
    }
  }
  try {
    storage?.setItem(key, JSON.stringify({ savedAt: Date.now(), source: result.source,
      value: { ip, country: result.country, country_code: result.countryCode, metadata: result.details.cache, region: result.state, city: result.city, latitude: result.latitude, longitude: result.longitude } }))
  } catch { /* IP querying remains available when storage is disabled. */ }
  return result
}
export function lookupFailureText(error) {
  if (error?.attempts?.length) return [...new Set(error.attempts.map(v => labels[v.code] || '查询失败'))].join(' / ')
  return labels[error?.code] || '查询失败'
}
export function lookupDiagnostics(error) {
  return error?.attempts?.map(v => `${v.source}：${labels[v.code] || '查询失败'}`).join('；') || lookupFailureText(error)
}
