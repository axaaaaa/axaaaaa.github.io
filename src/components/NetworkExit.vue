<template>
  <section class="network-exit" :class="{ 'is-dark': dark, 'is-compact': compact }" aria-label="网络出口观测">
    <div class="exit-toolbar"><span>IPv4 / IPv6 · 多目标对比</span><button type="button" :disabled="running" @click="detect"><span aria-hidden="true">🔄</span> {{ running ? '检测中…' : '重新检测出口' }}</button></div>
    <p class="exit-summary" :class="comparison.kind" role="status">{{ comparison.text }}</p>
    <div class="exit-nodes">
      <component :is="compact ? 'details' : 'article'" v-for="node in nodes" :key="node.id" class="exit-node" :data-exit-node="node.id" :open="compact ? node.id === 'ipv4' : undefined">
        <component :is="compact ? 'summary' : 'h4'" class="exit-node-heading"><span aria-hidden="true">{{ node.icon }}</span> {{ node.label }}<span class="exit-node-status">{{ node.status === 'success' ? '已获取' : node.status === 'error' ? '未连通' : '查询中…' }}</span><small v-if="compact" class="exit-node-preview">{{ node.ip || (node.status === 'error' ? node.error : '查询中…') }}</small></component>
        <dl>
          <div><dt>🎯 检测目标</dt><dd><a :href="node.url" target="_blank" rel="noopener noreferrer">{{ node.host }}</a></dd></div>
          <div><dt>📤 出口 IP</dt><dd class="exit-ip">{{ node.ip || (node.status === 'error' ? '暂未获取' : '查询中…') }}</dd></div>
          <div><dt>🧬 地址版本</dt><dd>{{ node.version || (node.family === 'auto' ? 'IPv4 / IPv6' : node.family) }}</dd></div>
          <template v-if="node.ip">
            <div><dt>📍 出口地区</dt><dd class="exit-region"><img v-if="node.geo && node.geo.countryCode && !node.flagFailed" :src="flagUrl(node.geo.countryCode)" class="exit-flag" :alt="`${node.geo.country || node.geo.countryCode}国旗`" width="20" height="15" @error="node.flagFailed = true" />{{ node.geo ? node.geo.region : node.geoLoading ? '查询中…' : '暂未获取' }}</dd></div>
            <div><dt>🏢 运营商/组织</dt><dd class="exit-operator">{{ node.details.operator }}</dd></div>
            <div><dt>🔢 ASN</dt><dd class="exit-asn">{{ node.details.asn }}<span v-if="node.details.asnName" class="exit-asn-name"> · {{ node.details.asnName }}</span></dd></div>
            <div v-if="node.geo"><dt>🗺️ 归属来源</dt><dd>{{ node.geo.source }}</dd></div>
          </template>
          <div v-if="node.elapsedMs !== null"><dt>⏱️ HTTP 耗时</dt><dd>{{ node.elapsedMs }} ms</dd></div>
          <div v-if="node.error"><dt>ℹ️ 检测状态</dt><dd class="exit-error">{{ node.error }}</dd></div>
          <div v-if="node.geoError"><dt>ℹ️ 地区状态</dt><dd class="exit-error">{{ node.geoError }}（出口 IP 已保留）</dd></div>
        </dl>
      </component>
    </div>
    <component :is="compact ? 'details' : 'div'" class="exit-notes">
      <summary v-if="compact">ℹ️ 观测说明</summary>
    <p class="exit-note">显示的是各检测服务实际看到的公网出口，不代表访问所有网站都走同一出口。地区来自 IP 归属库，不使用 ASN 注册地区代替。</p>
    <p class="exit-note">IPv6 节点未连通也可能是服务或网络访问问题；HTTP 耗时包含请求和服务处理，不是 ICMP Ping。</p>
    </component>
  </section>
</template>
<script>
import { EXIT_NODES, probeExit, compareExits } from '../utils/network-exit.mjs'
import { lookupIpRegion, lookupFailureText } from '../utils/ip-location.mjs'
const freshNodes = () => EXIT_NODES.map(node => ({ ...node, host: new URL(node.url).hostname, status: 'idle', ip: '', version: '', elapsedMs: null,
  geo: null, geoLoading: false, geoError: '', flagFailed: false, error: '', details: { operator: '未提供', asn: '未提供', asnName: '' } }))
export default {
  name: 'NetworkExit',
  props: { dark: { type: Boolean, default: false }, compact: { type: Boolean, default: false } },
  data() { return { nodes: freshNodes(), running: false, controller: null, disposed: false } },
  computed: { comparison() { return compareExits(this.nodes) } },
  mounted() { this.detect() },
  beforeUnmount() { this.disposed = true; this.controller?.abort() },
  methods: {
    flagUrl(code) { return `${process.env.BASE_URL}country-flags/${code.toLowerCase()}.svg` },
    async detect() {
      if (this.running || this.disposed) return
      const controller = new AbortController(); this.controller = controller; this.running = true
      this.nodes = freshNodes().map(node => ({ ...node, status: 'pending' }))
      const geoRequests = new Map()
      try {
        await Promise.all(this.nodes.map(async node => {
          try {
            const result = await probeExit(node, { signal: controller.signal })
            if (this.disposed || controller.signal.aborted || this.controller !== controller) return
            node.ip = result.ip; node.version = result.version; node.elapsedMs = result.elapsedMs; node.details = result.details; node.status = 'success'; node.geoLoading = true
            try {
              const seed = result.seed || {}, location = seed.location || seed
              const hasRegionSeed = [location.country, location.country_name, location.region, location.state, location.city].some(value => typeof value === 'string' && value.trim())
              let request
              if (hasRegionSeed) {
                // A service that already supplied location data should not depend on another target's lookup.
                request = lookupIpRegion(result.ip, { signal: controller.signal, seed, seedSource: node.label })
              } else {
                if (!geoRequests.has(result.ip)) geoRequests.set(result.ip, lookupIpRegion(result.ip, { signal: controller.signal, seed, seedSource: node.label }))
                request = geoRequests.get(result.ip)
              }
              const geo = await request
              if (this.disposed || controller.signal.aborted || this.controller !== controller) return
              node.geo = geo; node.details = geo.details || node.details
            } catch (error) {
              if (!this.disposed && !controller.signal.aborted && this.controller === controller) node.geoError = lookupFailureText(error)
            } finally {
              if (!this.disposed && this.controller === controller) node.geoLoading = false
            }
          } catch (error) {
            if (!this.disposed && !controller.signal.aborted && this.controller === controller) {
              node.status = 'error'; node.error = lookupFailureText(error); node.elapsedMs = typeof error.elapsedMs === 'number' ? error.elapsedMs : null
            }
          }
        }))
      } finally {
        if (!this.disposed && this.controller === controller) { this.running = false; this.controller = null }
      }
    }
  }
}
</script>
<style scoped>
.network-exit { min-width: 0; color: inherit; }
.exit-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 7px; font-size: 12px; }
.exit-toolbar button { flex-shrink: 0; border: 1px solid var(--fp-line, #e5e9ee); border-radius: 5px; padding: 4px 8px; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.exit-toolbar button:disabled { opacity: .6; cursor: wait; }
.exit-toolbar button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.exit-summary { margin: 6px 0 10px; font-size: 12px; line-height: 1.5; color: var(--fp-muted, #78838f); }
.exit-summary.different { color: #b87837; }
.is-dark .exit-summary.different { color: #e2b77d; }
.exit-nodes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.exit-node { min-width: 0; padding: 8px; border: 1px solid var(--fp-line, #e5e9ee); border-radius: 6px; }
.exit-node-heading { margin: 0 0 7px; font-size: 13px; line-height: 1.5; }
.exit-node-status { display: inline-block; margin-left: 6px; font-size: 11px; font-weight: 400; color: var(--fp-muted, #78838f); }
.exit-node dl { margin: 0; }
.exit-node dl > div { display: grid; grid-template-columns: minmax(88px, 34%) minmax(0, 1fr); gap: 6px; padding: 4px 0; border-top: 1px solid var(--fp-line, #e5e9ee); font-size: 12px; line-height: 1.5; }
.exit-node dt { color: var(--fp-muted, #78838f); }
.exit-node dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.exit-ip { font-family: Consolas, monospace; }
.exit-node a { color: inherit; }
.exit-flag { display: inline-block; width: 20px; height: 15px; margin-right: 5px; vertical-align: -2px; object-fit: cover; border-radius: 2px; }
.exit-note { margin: 7px 0 0; font-size: 11px; line-height: 1.5; color: var(--fp-muted, #78838f); }
.exit-error { color: #b87837; }
@media (max-width: 850px) { .exit-nodes { grid-template-columns: minmax(0, 1fr); } }
</style>

<style scoped>
.is-compact .exit-toolbar { flex-wrap: wrap; gap: 5px; }
.is-compact .exit-toolbar > span { flex-basis: 100%; }
.is-compact .exit-nodes { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.is-compact .exit-node { padding: 6px; }
.is-compact .exit-node-heading { cursor: pointer; font-size: 12px; margin-bottom: 0; }
.is-compact .exit-node[open] > .exit-node-heading { margin-bottom: 6px; }
.exit-node-preview { display: block; margin-top: 3px; font: 11px/1.4 Consolas, monospace; font-weight: 400; overflow-wrap: anywhere; }
.is-compact .exit-node dl > div { grid-template-columns: minmax(62px, 38%) minmax(0, 1fr); }
.is-compact .exit-notes { margin-top: 7px; font-size: 11px; color: var(--fp-muted, #78838f); }
.is-compact .exit-notes > summary { cursor: pointer; }
.is-compact summary:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; border-radius: 2px; }
</style>
