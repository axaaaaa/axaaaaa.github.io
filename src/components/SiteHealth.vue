<template>
  <div class="site-health" :class="'health-' + info.state">
    <span class="health-label"><span class="health-dot" aria-hidden="true"></span>{{ info.label }}</span>
    <span class="health-time" :title="info.checkedAt ? 'GitHub 检测节点 · ' + info.checkedAt : info.time">{{ info.time }}</span>
  </div>
</template>

<script>
import { describeStatus } from '../utils/site-status.mjs'
export default {
  name: 'SiteHealth',
  props: {
    url: { type: String, required: true },
    sites: { type: Object, default: () => ({}) },
    now: { type: Number, required: true }
  },
  computed: {
    info() { return describeStatus(this.url, this.sites, this.now) }
  }
}
</script>

<style scoped>
.site-health { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin: 0 16px 10px; font-size: 11px; line-height: 1.5; color: #667085; }
.health-label { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.health-dot { width: 6px; height: 6px; border-radius: 50%; background: #98a2b3; flex-shrink: 0; }
.health-time { color: #8793a5; }
.health-reachable .health-dot { background: #24945a; }
.health-restricted .health-dot, .health-retrying .health-dot { background: #c18515; }
.health-unreachable .health-dot { background: #d24b4b; }
:global(.dark-theme) .site-health { color: #9db7a3; }
:global(.dark-theme) .health-time { color: #7f9f87; }
:global(.dark-theme) .health-reachable .health-dot { background: #00cc66; }
</style>
