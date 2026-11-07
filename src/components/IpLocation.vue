<template>
  <div class="network-info" :class="{ 'is-dark': dark, 'is-panel': panel }">
    <template v-if="panel">
      <dl class="ip-details">
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🌐</span>公网 IP</dt><dd class="ip-address">{{ ip || (ipLoading ? '查询中…' : '暂未获取') }}</dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">📍</span>归属地区</dt><dd class="ip-region" role="status"><img v-if="flagSrc" class="country-flag" :src="flagSrc" :alt="flagAlt" :title="countryCode" width="20" height="15" @error="flagFailed = true" />{{ regionLoading ? '正在查询地区…' : region || error || '等待查询' }}</dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🧬</span>地址版本</dt><dd class="ip-version">{{ ipVersion }}</dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🌐</span>网络类型</dt><dd class="ip-network-type">{{ metadataLoading ? '查询中…' : ipDetails.networkType }}</dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🛡️</span>代理标记</dt><dd class="ip-proxy-status"><span>VPN：{{ statusText(ipDetails.vpn) }}</span><span>代理：{{ statusText(ipDetails.proxy) }}</span><span>Tor：{{ statusText(ipDetails.tor) }}</span></dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🏢</span>运营商/组织</dt><dd class="ip-operator">{{ metadataLoading ? '查询中…' : ipDetails.operator }}</dd></div>
        <div><dt><span class="ip-label-emoji" aria-hidden="true">🔢</span>ASN</dt><dd>
          <span class="ip-asn">{{ metadataLoading ? '查询中…' : ipDetails.asn }}</span>
          <div v-if="asnSummary" class="asn-description" role="status">
            <p class="asn-summary">{{ asnSummary }}</p>
            <p v-if="asnInfo && asnInfo.name && asnInfo.name !== asnInfo.holder">网络标识：{{ asnInfo.name }}</p>
            <p v-if="asnCountryLabel" class="asn-country">注册地区：{{ asnCountryLabel }}</p>
            <p v-if="!asnInfo && ipDetails.asnDescription && ipDetails.asnDescription !== ipDetails.asnName">原始说明：{{ ipDetails.asnDescription }}</p>
            <p v-if="asnInfo" class="asn-source">来源：<a :href="asnInfo.sourceUrl" target="_blank" rel="noopener noreferrer">{{ asnInfo.source }}</a></p>
            <p v-else-if="ipDetails.asnName" class="asn-source">来源：IP 查询接口</p>
            <p v-if="asnLoading && ipDetails.asnName" class="asn-source">正在补充注册资料…</p>
            <p v-else-if="asnError" class="asn-source">注册资料暂未更新，可重新检测。</p>
          </div>
        </dd></div>
        <div v-if="ipSource"><dt><span class="ip-label-emoji" aria-hidden="true">📡</span>IP 来源</dt><dd>{{ ipSource }}</dd></div>
        <div v-if="regionSource"><dt><span class="ip-label-emoji" aria-hidden="true">🗺️</span>地区来源</dt><dd>{{ regionSource }}</dd></div>
      </dl>
      <button type="button" class="ip-refresh" :disabled="loading" :title="tooltip" @click="loadLocation"><span class="ip-label-emoji" aria-hidden="true">🔄</span>{{ loading ? '检测中…' : '重新检测 IP' }}</button>
    </template>
    <button v-else type="button" class="ip-location" :class="{ 'is-dark': dark }" :disabled="loading" :title="tooltip" :aria-label="tooltip" @click="loadLocation">
      <span class="ip-address">{{ ip || (ipLoading ? '查询 IP…' : 'IP 查询重试') }}</span>
      <span class="ip-region" role="status"><img v-if="flagSrc" class="country-flag" :src="flagSrc" :alt="flagAlt" :title="countryCode" width="20" height="15" @error="flagFailed = true" />{{ regionLoading ? '正在查询地区…' : region || error || '点击查询地区' }}</span>
    </button>
  </div>
</template>
<script>
import { lookupAsnInfo, countryNameZh } from '../utils/asn-info.mjs'
import { lookupPublicIp, lookupIpRegion, lookupFailureText, lookupDiagnostics } from '../utils/ip-location.mjs'
const emptyDetails = () => ({ networkType: '未提供', operator: '未提供', asn: '未提供', asnName: '', asnDescription: '', asnCountry: '', vpn: null, proxy: null, tor: null })
export default {
  name: 'IpLocation',
  emits: ['located'],
  props: { dark: { type: Boolean, default: false }, panel: { type: Boolean, default: false } },
  data() { return { asnInfo: null, asnResource: '', asnLoading: false, asnError: '', asnController: null, ipDetails: emptyDetails(), countryCode: '', countryName: '', flagFailed: false, ip: '', region: '', loading: false, ipLoading: false, regionLoading: false, error: '', diagnostics: '', ipSource: '', regionSource: '', controller: null, disposed: false } },
  computed: {
    asnSummary() {
      const asn = this.ipDetails.asn
      if (!/^AS[0-9]+$/.test(asn)) return ''
      const holder = this.asnInfo?.holder || this.ipDetails.asnName
      if (holder) return `${asn} 对应的网络组织：${holder}。`
      if (this.asnInfo?.name) return `${asn} 对应的注册网络标识：${this.asnInfo.name}。`
      return this.asnLoading ? '正在查询该 AS 编号对应的网络组织…' : '该 AS 编号的网络组织说明暂未获取。'
    },
    asnCountryLabel() { return countryNameZh(this.asnInfo?.country || this.ipDetails.asnCountry) },
    ipVersion() { return this.ip ? (this.ip.includes(':') ? 'IPv6' : 'IPv4') : this.ipLoading ? '查询中…' : '暂未获取' },
    metadataLoading() { return this.ipLoading || this.regionLoading },
    flagSrc() { return this.region && !this.regionLoading && this.countryCode && !this.flagFailed ? `${process.env.BASE_URL}country-flags/${this.countryCode.toLowerCase()}.svg` : '' },
    flagAlt() { return `${this.countryName || this.countryCode}国旗` },
    tooltip() {
      return [this.ip ? `公网 IP：${this.ip}` : '查询公网 IP',
        this.ip ? `地址版本：${this.ipVersion}；网络类型：${this.ipDetails.networkType}；运营商/组织：${this.ipDetails.operator}；ASN：${this.ipDetails.asn}` : '',
        this.region ? `大致地区：${this.region}` : this.error,
        this.countryCode ? `国家/地区代码：${this.countryCode}` : '',
        this.ipSource ? `IP 来源：${this.ipSource}` : '', this.regionSource ? `地区来源：${this.regionSource}` : '',
        this.diagnostics, '地区由公网 IP 推测，并非精确定位；点击重新查询。第三方服务：ipify、ipapi.is、ipapi.co。'].filter(Boolean).join('\n')
    }
  },
  mounted() { this.loadLocation() },
  beforeUnmount() { this.disposed = true; this.controller?.abort(); this.asnController?.abort() },
  methods: {
    async loadAsnDetails() {
      const asn = this.ipDetails.asn
      if (this.disposed) return
      if (this.asnResource === asn && (this.asnInfo || this.asnLoading)) return
      this.asnController?.abort()
      this.asnInfo = null; this.asnError = ''; this.asnLoading = false; this.asnResource = asn
      if (!/^AS[0-9]+$/.test(asn)) { this.asnController = null; return }
      const controller = new AbortController(); this.asnController = controller; this.asnLoading = true
      try {
        const info = await lookupAsnInfo(asn, { signal: controller.signal })
        if (!this.disposed && this.asnController === controller && this.ipDetails.asn === asn) this.asnInfo = info
      } catch {
        if (!this.disposed && this.asnController === controller && !controller.signal.aborted) this.asnError = '注册资料暂未获取'
      } finally {
        if (!this.disposed && this.asnController === controller) { this.asnLoading = false; this.asnController = null }
      }
    },
    statusText(value) { return value === true ? '已标记' : value === false ? '未标记' : '未提供' },
    async loadLocation() {
      if (this.loading || this.disposed) return
      const controller = new AbortController()
      this.controller = controller
      this.asnController?.abort(); this.asnController = null; this.asnInfo = null; this.asnResource = ''; this.asnLoading = false; this.asnError = ''
      this.loading = true; this.ipLoading = true; this.regionLoading = false
      this.ipDetails = emptyDetails()
      this.countryCode = ''; this.countryName = ''; this.flagFailed = false
      this.ip = ''; this.region = ''; this.error = ''; this.diagnostics = ''; this.ipSource = ''; this.regionSource = ''
      this.$emit('located', null)
      try {
        const identity = await lookupPublicIp({ signal: controller.signal })
        if (this.disposed || controller.signal.aborted) return
        this.ipDetails = { ...emptyDetails(), ...(identity.details || {}) }
        this.loadAsnDetails()
        this.ip = identity.ip; this.ipSource = identity.source; this.ipLoading = false; this.regionLoading = true
        try {
          const location = await lookupIpRegion(identity.ip, { signal: controller.signal, seed: identity.seed, seedSource: identity.source })
          if (this.disposed || controller.signal.aborted) return
          this.ipDetails = { ...this.ipDetails, ...(location.details || {}) }
          this.loadAsnDetails()
          this.countryCode = location.countryCode || ''; this.countryName = location.country || ''
          this.region = location.region; this.regionSource = location.source
          if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            this.$emit('located', { name: location.name, latitude: location.latitude, longitude: location.longitude })
          }
        } catch (error) {
          if (!this.disposed && !controller.signal.aborted) {
            this.error = `地区${lookupFailureText(error)}，点击重试`; this.diagnostics = lookupDiagnostics(error)
          }
        }
      } catch (error) {
        if (!this.disposed && !controller.signal.aborted) {
          this.error = `IP ${lookupFailureText(error)}，点击重试`; this.diagnostics = lookupDiagnostics(error)
        }
      } finally {
        if (!this.disposed) { this.loading = false; this.ipLoading = false; this.regionLoading = false; this.controller = null }
      }
    }
  }
}
</script>
<style scoped>
.ip-location {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-end;
  flex: 0 1 auto; min-width: 0; max-width: 240px; padding: 0; border: 0;
  background: transparent; color: #566273; cursor: pointer; font: inherit; text-align: right;
}
.ip-location:disabled { cursor: wait; }
.ip-location:focus-visible { outline: 2px solid #7c9b88; outline-offset: 4px; border-radius: 3px; }
.network-info { display: flex; flex-direction: column; align-items: flex-end; min-width: 0; }
.fingerprint-entry { border: 0; padding: 0; background: transparent; color: #566273; font: 10px/1.25 system-ui, sans-serif; }
.is-dark .fingerprint-entry { color: #80c69a; }
.fingerprint-entry:hover { text-decoration: underline; }
.fingerprint-entry:focus-visible { outline: 2px solid #7c9b88; outline-offset: 2px; }
.fingerprint-frame { display: block; width: 100%; height: min(72vh, 850px); border: 0; border-radius: 8px; }
.ip-address { font: 12px/1.5 Consolas, monospace; }
.ip-region { font-size: 11px; line-height: 1.25; opacity: .72; }
.ip-address, .ip-region { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.is-dark { color: #80c69a; }
@media (max-width: 1100px) { .ip-location { max-width: 150px; } }
@media (max-width: 768px) { .ip-location { max-width: 90px; } .ip-address { font-size: 10px; } .ip-region { font-size: 10px; } }
@media (max-width: 420px) { .ip-location { max-width: 70px; } }
</style>

<style scoped>
.network-info.is-panel { align-items: stretch; color: inherit; }
.ip-details { margin: 0; min-width: 0; }
.ip-details > div { display: grid; grid-template-columns: minmax(60px, 34%) minmax(0, 1fr); gap: 6px; padding: 4px 0; border-top: 1px solid var(--fp-line, #e5e9ee); font-size: 13px; line-height: 1.5; }
.ip-details dt { color: var(--fp-muted, #78838f); }
.ip-details dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.is-panel .ip-address { font: 13px/1.5 Consolas, monospace; }
.is-panel .ip-address, .is-panel .ip-region { max-width: none; white-space: normal; overflow: visible; text-overflow: clip; }
.is-panel .ip-region { font-size: 13px; line-height: 1.5; opacity: 1; }
.ip-refresh { align-self: flex-start; margin-top: 7px; padding: 3px 7px; border: 1px solid var(--fp-line, #e5e9ee); border-radius: 5px; color: inherit; background: transparent; font: inherit; font-size: 12px; cursor: pointer; }
.ip-refresh:disabled { cursor: wait; opacity: .6; }
.ip-refresh:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>

<style scoped>
.country-flag { display: inline-block; width: 20px; height: 15px; margin-right: 5px; vertical-align: -2px; object-fit: cover; border-radius: 2px; box-shadow: 0 0 0 1px rgba(128, 128, 128, .18); }
</style>

<style scoped>
.ip-label-emoji { display: inline-block; margin-right: 4px; font-size: .95em; line-height: 1; }
</style>

<style scoped>
.ip-proxy-status { display: flex; flex-wrap: wrap; gap: 2px 8px; }
.ip-proxy-status > span { white-space: nowrap; }
</style>



<style scoped>
.asn-description { margin-top: 4px; }
.asn-description p { margin: 4px 0; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; color: inherit; }
.asn-description .asn-source { font-size: 10px; color: var(--fp-muted, #78838f); }
.asn-source a { color: inherit; text-decoration: underline; }
</style>
