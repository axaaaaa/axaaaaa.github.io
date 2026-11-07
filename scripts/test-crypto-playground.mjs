import assert from 'node:assert/strict';
import { avalanche, encodeText, decodeText, signText, verifyText } from '../src/utils/crypto-playground.mjs';
const result = await avalanche('abc', 'abc');
assert.equal(result.left,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); assert.equal(result.changed,0);
const changed = await avalanche('hello', 'Hello'); assert.equal(changed.bits.length,256); assert.ok(changed.changed > 0);
assert.equal(decodeText(encodeText('你好 🌍')), '你好 🌍'); assert.throws(() => decodeText('%%%'));
const signed = await signText('original'); assert.equal(await verifyText('original', signed),true); assert.equal(await verifyText('tampered', signed),false);
console.log('PASS: SHA-256 vector, avalanche, Unicode Base64, invalid input, ECDSA match and tamper');
