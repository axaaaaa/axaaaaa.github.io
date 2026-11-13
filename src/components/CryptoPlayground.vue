<template>
  <section id="crypto-playground" class="crypto-lab" aria-labelledby="crypto-window-title">
    <header class="crypto-titlebar">
      <svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#fff" d="M1 6h8v8H1zM3 2h4v1H3zM2 3h1v3H2zM7 3h1v3H7z"/><path fill="#ffd655" d="M2 7h6v6H2z"/><path fill="#000080" d="M4 9h2v3H4z"/></svg>
      <h2 id="crypto-window-title"><button type="button" class="crypto-title" :aria-expanded="opened" aria-controls="crypto-window-body" @click="opened = !opened">密码学游乐场</button></h2>
      <button type="button" :aria-expanded="opened" aria-controls="crypto-window-body" @click="opened = !opened">{{ opened ? '收起' : '开始实验' }}</button>
    </header>
    <div v-if="opened" id="crypto-window-body" class="crypto-window-body">
      <p>所有实验都在浏览器内完成，输入不上传、不保存。需要 HTTPS 或 localhost。</p>
      <nav aria-label="密码学实验"><button v-for="item in tabs" :key="item.id" :aria-pressed="tab === item.id" @click="tab = item.id">{{ item.name }}</button></nav>
      <div v-show="tab === 'hash'">
        <h3>01 / 改一个字，看看 256 位怎样变化</h3><div class="columns"><label>原始文本<textarea v-model="left" /></label><label>对比文本<textarea v-model="right" /></label></div>
        <button :disabled="busy" @click="runHash">比较 SHA-256</button>
        <div v-if="result"><p class="metric">{{ result.changed }} / 256 位不同 · {{ (result.changed / 256 * 100).toFixed(1) }}%</p><div class="bits" aria-label="256 位差异图，亮色代表不同"><i v-for="(bit, index) in result.bits" :key="index" :class="{ changed: bit }" /></div><small>亮色：不同 · 暗色：相同。图中比较的是对应位的差异，不是原始位值。</small><code>{{ result.left }}</code><code>{{ result.right }}</code><p>哈希是摘要，不是加密；细微改动通常会改变约一半输出位，但单次结果并不固定。</p></div>
      </div>
      <div v-show="tab === 'encoding'"><h3>02 / Base64 是编码，不是加密</h3><label>文本或 Base64<textarea v-model="encoding" /></label><div class="actions"><button @click="transform(false)">编码 → Base64</button><button @click="transform(true)">解码 → 文本</button></div><p>不需要密钥，任何人都可以解码。支持中文与 Emoji。</p></div>
      <div v-show="tab === 'signature'"><h3>03 / 签名后改动内容，还能验证吗？</h3><label>待签名 / 待验证内容<textarea v-model="message" @input="verification = ''" /></label><div class="actions"><button :disabled="busy" @click="sign">生成临时密钥并签名</button><button :disabled="busy || !signed" @click="verify">验证当前内容</button></div><code v-if="signatureHex">{{ signatureHex }}</code><p role="status">{{ verification }}</p><p>ECDSA P-256 + SHA-256：私钥签名，公钥验证；签名不隐藏内容。签名后试着改一个字再验证。密钥仅留在本次页面内存中。</p></div>
      <p v-if="error" role="alert">{{ error }}</p>
      <footer class="crypto-status">本地实验 · {{ tabs.find(item => item.id === tab).name }}</footer>
    </div>
  </section>
</template>
<script>
import { avalanche, encodeText, decodeText, signText, verifyText, hex } from '../utils/crypto-playground.mjs';
export default {
  name: 'CryptoPlayground',
  data: () => ({ opened: false, tab: 'hash', tabs: [{ id: 'hash', name: '哈希雪崩' }, { id: 'encoding', name: '编码实验' }, { id: 'signature', name: '数字签名' }], left: 'Hello, hacker!', right: 'Hello, Hacker!', result: null, busy: false, error: '', encoding: '你好，世界 🌍', message: '这是一条完整的消息。', signed: null, signatureHex: '', verification: '' }),
  methods: {
    async runHash() { this.busy = true; this.error = ''; try { this.result = await avalanche(this.left, this.right); } catch { this.error = '实验未完成，请在 HTTPS 或 localhost 中重试。'; } finally { this.busy = false; } },
    transform(decode) { this.error = ''; try { this.encoding = decode ? decodeText(this.encoding) : encodeText(this.encoding); } catch { this.error = '请输入有效的 UTF-8 Base64 内容。'; } },
    async sign() { this.busy = true; this.error = ''; this.verification = ''; const text = this.message; try { this.signed = await signText(text); this.signatureHex = hex(this.signed.signature); this.verification = '签名已生成，请验证当前内容。'; } catch { this.error = '签名未完成，请检查浏览器 Web Crypto 支持及 HTTPS 环境。'; } finally { this.busy = false; } },
    async verify() { this.busy = true; this.error = ''; const text = this.message; try { const valid = await verifyText(text, this.signed); this.verification = text !== this.message ? '内容已变化，请重新验证。' : valid ? '验证通过：内容与签名匹配。' : '验证失败：内容已更改。'; } catch { this.error = '验证未完成，请重新签名后重试。'; } finally { this.busy = false; } }
  }
};
</script>
<style scoped>
.crypto-lab {
  --win-face: #c0c0c0;
  --win-raised: inset 1px 1px #fff, inset 2px 2px #dfdfdf, inset -1px -1px #0a0a0a, inset -2px -2px #808080;
  --win-inset: inset 1px 1px #808080, inset 2px 2px #0a0a0a, inset -1px -1px #fff, inset -2px -2px #dfdfdf;
  margin: 24px 20px;
  padding: 3px;
  background: var(--win-face);
  color: #101010;
  box-shadow: var(--win-raised);
  font: 13px/1.5 Tahoma, "Microsoft Sans Serif", "Microsoft YaHei", sans-serif;
  color-scheme: light;
  scroll-margin-top: 90px;
}
.crypto-titlebar { display: flex; align-items: center; gap: 6px; padding: 3px 4px; background: #000080; color: #fff; }
.crypto-titlebar svg { flex: none; }
.crypto-titlebar h2 { flex: 1; margin: 0; font-size: 15px; color: inherit; } .crypto-titlebar h2 .crypto-title { background: transparent; box-shadow: none; color: inherit; font: inherit; font-size: 15px; padding: 0; min-height: 0; text-align: left; cursor: pointer; }
.crypto-window-body { padding: 0 8px 4px; }
nav, .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
nav { gap: 3px; margin-top: 12px; }
button, textarea { font: inherit; color: #101010; border: 0; border-radius: 0; }
button { min-height: 26px; padding: 3px 10px; background: var(--win-face); box-shadow: var(--win-raised); cursor: pointer; }
button:active:not(:disabled) { box-shadow: var(--win-inset); }
button:focus-visible, textarea:focus-visible { outline: 2px solid #000080; outline-offset: 2px; }
.crypto-titlebar button:focus-visible { outline-color: #fff; }
button:disabled { color: #555; cursor: default; }
nav button { position: relative; padding-inline: 12px; background: #b9b9b9; }
nav button[aria-pressed="true"] { z-index: 1; font-weight: 700; background: #e6e6e6; box-shadow: inset 1px 1px #fff, inset -1px 0 #555; }
.crypto-window-body > div:not(.crypto-status) { background: #e6e6e6; box-shadow: var(--win-raised); padding: 12px; }
h3 { margin: 0 0 8px; font-size: 15px; }
label { display: grid; gap: 4px; margin: 8px 0; }
.columns { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
textarea { color-scheme: light !important; box-sizing: border-box; width: 100%; min-height: 86px; padding: 7px; resize: vertical; background: #fff; box-shadow: var(--win-inset); }
code { display: block; overflow-wrap: anywhere; margin: 8px 0; padding: 8px; background: #fff; box-shadow: var(--win-inset); }
.metric { font: 20px Consolas, monospace; }
.bits { display: grid; grid-template-columns: repeat(32,minmax(0,1fr)); gap: 2px; margin: 10px 0; max-width: 550px; }
.bits i { aspect-ratio: 1; background: #5c5c5c; }
.bits .changed { background: #b6e2ff; }
[role="alert"] { color: #8b0000; }
.crypto-status { margin-top: 6px; padding: 3px 6px; box-shadow: var(--win-inset); }
@media (max-width: 600px) {
  .crypto-lab { margin: 16px 12px; }
  .columns { grid-template-columns: 1fr; gap: 0; }
}
</style>
