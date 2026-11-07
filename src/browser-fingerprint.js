/** Local-only environment digest. No network requests or persistent identifiers. */
export async function createBrowserFingerprint(env = window) {
  const nav = env.navigator || {}
  const display = env.screen || {}
  let timezone = ''
  try { timezone = env.Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { /* unavailable */ }
  const payload = JSON.stringify({
    version: 1,
    userAgent: nav.userAgent || '',
    languages: Array.from(nav.languages || [nav.language || '']),
    platform: nav.platform || '',
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    maxTouchPoints: nav.maxTouchPoints || 0,
    screen: [display.width || 0, display.height || 0, display.colorDepth || 0],
    pixelRatio: env.devicePixelRatio || 1,
    timezone
  })
  if (env.crypto?.subtle && env.TextEncoder) {
    const bytes = new env.TextEncoder().encode(payload)
    const hash = await env.crypto.subtle.digest('SHA-256', bytes)
    const id = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
    return { id, algorithm: 'SHA-256' }
  }
  // Non-secure HTTP contexts may not expose Web Crypto. This is a display digest, not a security token.
  let hash = 2166136261
  for (let i = 0; i < payload.length; i++) hash = Math.imul(hash ^ payload.charCodeAt(i), 16777619)
  return { id: (hash >>> 0).toString(16).padStart(8, '0'), algorithm: 'FNV-1a' }
}
