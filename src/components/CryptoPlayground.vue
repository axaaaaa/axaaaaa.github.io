<template>
  <section id="crypto-playground" class="crypto-lab">
    <header><div><small>CRYPTO / LOCAL EXPERIMENTS</small><h2>密码学游乐场</h2></div><button :aria-expanded="opened" @click="opened = !opened">{{ opened ? '收起' : '开始实验' }}</button></header>
    <div v-if="opened">
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
.crypto-lab{margin:24px 20px;padding:22px;border:1px solid var(--el-border-color,#d7e4dc);border-radius:14px;background:var(--el-bg-color,#fff);color:var(--el-text-color-primary,#273b30);scroll-margin-top:90px;font-size:13px}.crypto-lab header,.actions,nav{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}h2{margin:5px 0;font-size:20px}small{color:var(--el-text-color-secondary,#748579)}nav,.actions{justify-content:flex-start;margin:16px 0}button,textarea{font:inherit;color:inherit;background:var(--el-bg-color,#fff);border:1px solid var(--el-border-color,#d7e4dc);border-radius:7px;padding:9px}button{cursor:pointer}button[aria-pressed=true]{background:var(--ui-accent-soft,#e9f5ec);color:var(--ui-accent,#347a50)}button:disabled{opacity:.5}label{display:grid;gap:8px;margin:14px 0}.columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}textarea{width:100%;box-sizing:border-box;min-height:90px;resize:vertical}code{display:block;overflow-wrap:anywhere;margin:10px 0;padding:12px;background:var(--ui-accent-soft,#e9f5ec);border-radius:7px}.metric{font:24px Consolas,monospace}.bits{display:grid;grid-template-columns:repeat(32,1fr);gap:3px;margin:16px 0;max-width:650px}.bits i{aspect-ratio:1;background:var(--el-border-color,#d7e4dc);border-radius:2px}.bits .changed{background:var(--ui-accent,#398c5a)}p{line-height:1.8}[role=alert]{color:#c34c45}@media(max-width:600px){.crypto-lab{margin:16px 12px;padding:14px}.columns{grid-template-columns:1fr}.bits{gap:2px}}
</style>
