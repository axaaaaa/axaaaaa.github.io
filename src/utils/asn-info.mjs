import { requestJson, IpLookupError } from './ip-location.mjs'
import { resolveCountryCode } from './country-flags.mjs'
const text = value => typeof value === 'string' ? value.trim().slice(0, 512) : ''
export function canonicalAsn(value) {
  const match = String(value ?? '').trim().match(/^(?:AS)?([0-9]{1,10})$/i)
  const number = match ? Number(match[1]) : 0
  return Number.isInteger(number) && number > 0 && number <= 4294967295 ? `AS${number}` : ''
}
export function countryNameZh(code) {
  const country = resolveCountryCode(code)
  if (!country) return ''
  try { return new Intl.DisplayNames(['zh-CN'], { type: 'region' }).of(country) || country } catch { return country }
}
export function normalizeRdap(data, resource) {
  const asn = canonicalAsn(resource), number = Number(asn.slice(2))
  if (!asn || !data || !Number.isInteger(data.startAutnum) || !Number.isInteger(data.endAutnum) ||
      number < data.startAutnum || number > data.endAutnum) throw new IpLookupError('invalid')
  const entities = Array.isArray(data.entities) ? data.entities : []
  const registrants = entities.filter(e => Array.isArray(e.roles) && e.roles.includes('registrant'))
  const cards = registrants.flatMap(e => Array.isArray(e.vcardArray?.[1]) ? e.vcardArray[1] : [])
  const entry = key => cards.find(v => Array.isArray(v) && v[0] === key)
  const value = key => { const v = entry(key)?.[3]; return text(Array.isArray(v) ? v.join(' ') : v) }
  const holder = value('org') || value('fn')
  const name = text(data.name)
  if (!holder && !name) throw new IpLookupError('invalid')
  return { asn, holder, name, country: resolveCountryCode(data.country || entry('adr')?.[1]?.cc),
    source: 'RDAP 注册资料', sourceUrl: `https://rdap.apnic.net/autnum/${number}` }
}
export function normalizeRipe(data, resource) {
  const asn = canonicalAsn(resource), d = data?.data
  if (!asn || canonicalAsn(d?.resource) !== asn || !text(d?.holder)) throw new IpLookupError('invalid')
  return { asn, holder: text(d.holder), name: '', country: '', source: 'RIPEstat 注册资料',
    sourceUrl: `https://stat.ripe.net/data/as-overview/data.json?resource=${asn}` }
}
function getStorage(options) {
  if ('storage' in options) return options.storage
  try { return sessionStorage } catch { return null }
}
export async function lookupAsnInfo(value, options = {}) {
  const asn = canonicalAsn(value)
  if (!asn) throw new IpLookupError('invalid')
  if (options.signal?.aborted) throw new IpLookupError('aborted')
  const number = Number(asn.slice(2)), storage = getStorage(options), key = `navigation-asn-info-v1:${asn}`
  const sources = [
    { url: `https://rdap.apnic.net/autnum/${number}`, normalize: normalizeRdap },
    { url: `https://stat.ripe.net/data/as-overview/data.json?resource=${asn}`, normalize: normalizeRipe }
  ]
  try {
    const cached = JSON.parse(storage?.getItem(key) || 'null'), info = cached?.info
    if (cached && Number.isFinite(cached.savedAt) && Date.now() >= cached.savedAt && Date.now() - cached.savedAt < 24 * 60 * 60 * 1000 &&
        info?.asn === asn && (text(info.holder) || text(info.name)) && sources.some(s => s.url === info.sourceUrl)) {
      return { asn, holder: text(info.holder), name: text(info.name), country: resolveCountryCode(info.country),
        source: info.sourceUrl === sources[0].url ? 'RDAP 注册资料' : 'RIPEstat 注册资料', sourceUrl: info.sourceUrl }
    }
  } catch { /* Registry lookup works with session storage disabled. */ }
  const attempts = []
  for (const source of sources) {
    try {
      const info = source.normalize(await requestJson(source.url, options), asn)
      if (options.signal?.aborted) throw new IpLookupError('aborted')
      try { storage?.setItem(key, JSON.stringify({ savedAt: Date.now(), info })) } catch { /* Optional cache. */ }
      return info
    } catch (error) {
      if (options.signal?.aborted || error.code === 'aborted') throw new IpLookupError('aborted')
      attempts.push({ source: source.url, code: error.code || 'invalid' })
    }
  }
  throw new IpLookupError('service', attempts)
}
