const encoder = new TextEncoder();
export const hex = buffer => Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
export async function avalanche(a, b) {
  const hashes = await Promise.all([a, b].map(text => crypto.subtle.digest('SHA-256', encoder.encode(text))));
  const left = new Uint8Array(hashes[0]), right = new Uint8Array(hashes[1]);
  const bits = Array.from(left, (byte, i) => Array.from({ length: 8 }, (_, bit) => Boolean((byte ^ right[i]) & (1 << (7 - bit))))).flat();
  return { left: hex(left), right: hex(right), bits, changed: bits.filter(Boolean).length };
}
export function encodeText(text) { return btoa(Array.from(encoder.encode(text), b => String.fromCharCode(b)).join('')); }
export function decodeText(text) { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(text), c => c.charCodeAt(0))); }
export async function signText(text) {
  const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, encoder.encode(text));
  return { publicKey: keys.publicKey, signature };
}
export function verifyText(text, record) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, record.publicKey, record.signature, encoder.encode(text)); }
