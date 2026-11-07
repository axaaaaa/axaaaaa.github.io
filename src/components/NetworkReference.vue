<template>
  <section id="network-reference" class="network-reference" aria-labelledby="network-reference-title">
    <header class="network-heading"><h2 id="network-reference-title"><button type="button" class="module-title-toggle" :aria-expanded="opened" aria-controls="network-reference-content" @click="opened = !opened" style="border:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;padding:0;text-align:left;cursor:pointer"><svg class="module-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:19px;height:19px;vertical-align:-3px;margin-right:7px"><rect x="8" y="2" width="8" height="6" rx="1"/><rect x="2" y="16" width="8" height="6" rx="1"/><rect x="14" y="16" width="8" height="6" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/></svg> 网络知识速查<svg class="module-heading-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :style="{transform: opened ? 'rotate(90deg)' : 'rotate(0deg)'}" style="width:14px;height:14px;vertical-align:-2px;margin-left:8px"><path d="m9 5 7 7-7 7"/></svg></button></h2><div><span>{{ entries.length }} 条知识</span><button type="button" :aria-expanded="opened" aria-controls="network-reference-content" @click="opened = !opened">{{ opened ? '收起 ▴' : '展开 ▾' }}</button></div></header>
    <div v-if="opened" id="network-reference-content">
      <nav class="network-categories" aria-label="网络知识分类"><button v-for="name in categories" :key="name" type="button" :aria-pressed="category === name" @click="category = name"><ToolEntryIcon :name="name" />{{ name || '全部知识' }}</button><button type="button" :aria-pressed="category === 'calculator'" @click="category = 'calculator'"><ToolEntryIcon name="calculator" />IPv4 子网计算器</button><button type="button" :aria-pressed="category === 'protocols'" @click="category = 'protocols'"><ToolEntryIcon name="导航" />协议大全</button><button type="button" :aria-pressed="category === 'whois'" @click="category = 'whois'">WHOIS 信息查询</button></nav>
      <WhoisQuery v-if="category === 'whois'" />
      <section v-else-if="category === 'calculator'" class="subnet-tool" aria-label="IPv4 CIDR 子网计算器">
        <label for="subnet-input">IPv4 地址 / 前缀长度</label><input id="subnet-input" v-model="cidrInput" type="text" maxlength="32" placeholder="192.168.1.123/24" spellcheck="false" autocomplete="off" />
        <p class="network-note">本地实时计算，不发送网络请求。支持 /0–/32，/31 按点对点链路处理。</p>
        <div class="network-examples"><button v-for="sample in examples" :key="sample" type="button" @click="cidrInput = sample">{{ sample }}</button></div>
        <p v-if="subnet.error" class="network-error" role="status">{{ subnet.error }}</p>
        <template v-else><dl class="subnet-results"><template v-for="row in subnetRows" :key="row[0]"><dt>{{ row[0] }}</dt><dd>{{ row[1] }}</dd></template></dl><p class="network-note">{{ subnet.note }}</p><button type="button" @click="copySubnet">复制计算结果</button><a href="https://www.rfc-editor.org/rfc/rfc3021" target="_blank" rel="noopener noreferrer"> /31 规则说明 ↗</a></template>
      </section>
      <ProtocolDirectory v-else-if="category === 'protocols'" />
      <template v-else>
        <div class="network-search"><input v-model="query" type="search" placeholder="搜索 404 / DNS / 443 / 私有地址" aria-label="搜索网络知识" /><button type="button" :aria-pressed="favoritesOnly" @click="favoritesOnly = !favoritesOnly">{{ favoritesOnly ? '★ 只看收藏' : '☆ 我的收藏' }}</button></div>
        <p class="network-note">{{ filtered.length }} 条结果 · 端口表示常见用途，不保证实际服务使用该端口；相同端口的 TCP 与 UDP 是不同传输。</p>
        <div class="network-grid"><article v-for="entry in pageEntries" :key="entry.id" class="network-card"><div class="network-card-heading"><strong>{{ entry.code }}</strong><button type="button" :aria-label="(favorites.includes(entry.id) ? '取消收藏网络知识：' : '收藏网络知识：') + entry.code" :aria-pressed="favorites.includes(entry.id)" @click="favorite(entry.id)">{{ favorites.includes(entry.id) ? '★' : '☆' }}</button></div><h3><ToolEntryIcon :name="entry.category" />{{ entry.title }}</h3><small>{{ entry.category }}</small><p>{{ entry.description }}</p><a :href="entry.source" target="_blank" rel="noopener noreferrer">标准 / 官方资料 ↗</a></article></div>
        <p v-if="!filtered.length">没有匹配内容。<button type="button" @click="query = ''; category = ''; favoritesOnly = false">清除筛选</button></p>
        <nav v-if="pages > 1" class="network-pages" aria-label="网络知识分页"><button type="button" :disabled="page === 1" @click="page--">上一页</button><span>{{ page }} / {{ pages }}</span><button type="button" :disabled="page === pages" @click="page++">下一页</button></nav>
      </template>
      <p v-if="feedback" role="status" class="network-feedback">{{ feedback }}</p>
    </div>
  </section>
</template>
<script>
import WhoisQuery from './WhoisQuery.vue';
import ProtocolDirectory from './ProtocolDirectory.vue';
import ToolEntryIcon from './ToolEntryIcon.vue';
import { networkEntries } from '../data/network-reference.mjs';
import { filterNetworkEntries, calculateSubnet } from '../utils/network-reference.mjs';
const FAVORITES = '01-network-reference-favorites';
export default {
  components: { WhoisQuery, ToolEntryIcon, ProtocolDirectory },
  name: 'NetworkReference',
  data: () => ({ opened: false, entries: networkEntries, category: '', query: '', favoritesOnly: false, favorites: [], feedback: '', page: 1, pageSize: 20, cidrInput: '192.168.1.123/24', examples: ['192.168.1.123/24', '10.0.0.0/31', '127.0.0.1/32', '0.0.0.0/0'] }),
  computed: {
    categories() { return ['', ...new Set(this.entries.map(e => e.category))]; },
    filtered() { return filterNetworkEntries(this.entries, this); },
    pages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); },
    pageEntries() { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); },
    subnet() { return calculateSubnet(this.cidrInput); },
    subnetRows() { const n = this.subnet; return n.error ? [] : [['网络 CIDR', n.cidr], ['子网掩码', n.mask], ['通配掩码', n.wildcard], ['广播地址', n.broadcast], ['地址段末地址', n.last], ['主机范围', n.firstHost + ' — ' + n.lastHost], ['总地址数', n.total.toLocaleString('zh-CN')], ['规则内主机数', n.hosts.toLocaleString('zh-CN')]]; }
  },
  watch: { query() { this.page = 1; }, category() { this.page = 1; }, favoritesOnly() { this.page = 1; }, pages(n) { if (this.page > n) this.page = n; } },
  mounted() { this.loadFavorites(); window.addEventListener('storage', this.onStorage); },
  beforeUnmount() { window.removeEventListener('storage', this.onStorage); },
  methods: {
    loadFavorites() { try { const list = JSON.parse(localStorage.getItem(FAVORITES) || '[]'); this.favorites = Array.isArray(list) ? [...new Set(list.filter(id => this.entries.some(e => e.id === id)))] : []; } catch { this.favorites = []; } },
    onStorage(event) { if (event.key === FAVORITES || event.key === null) this.loadFavorites(); },
    favorite(id) { this.favorites = this.favorites.includes(id) ? this.favorites.filter(v => v !== id) : [...this.favorites, id]; try { localStorage.setItem(FAVORITES, JSON.stringify(this.favorites)); this.feedback = '网络知识收藏已更新'; } catch { this.feedback = '本次页面收藏已更新，浏览器未保存'; } },
    async copySubnet() { if (this.subnet.error) return; try { await navigator.clipboard.writeText(this.subnetRows.map(row => row.join('：')).join('\n') + '\n' + this.subnet.note); this.feedback = '已复制子网计算结果'; } catch { this.feedback = '复制未完成，可选中结果文字手动复制'; } }
  }
};
</script>
<style scoped>
.network-reference { margin: 24px 20px 32px; padding: 20px; border: 1px solid var(--el-border-color-light, #d7e4dc); border-radius: 14px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #273b30); scroll-margin-top: 80px; font-size: 13px; }
.network-heading,.network-heading>div,.network-card-heading,.network-pages { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }h2 { margin: 0; font-size: 20px; font-weight: 500; }h3 { margin: 8px 0; font-size: 15px; }button,input { font: inherit; color: inherit; background: var(--el-fill-color-blank, #fff); border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 7px; padding: 7px 10px; box-sizing: border-box; }button { cursor: pointer; }button:hover:not(:disabled),button[aria-pressed="true"] { background: var(--ui-accent-soft); color: var(--ui-accent); }button:disabled { opacity: .4; cursor: default; }.network-categories,.network-examples { display: flex; gap: 8px; flex-wrap: wrap; margin: 14px 0; }.network-search { display: flex; flex-wrap: wrap; gap: 10px; }.network-search input { flex: 1 1 220px; min-width: 0; }.network-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }.network-card { min-width: 0; padding: 14px; border: 1px solid var(--el-border-color-light); border-radius: 10px; }.network-card strong { font: 600 16px/1.5 Consolas,monospace; overflow-wrap: anywhere; }.network-card p,.network-note { line-height: 1.8; color: var(--el-text-color-secondary); }.network-card small { color: var(--el-text-color-secondary); }a { color: var(--ui-accent); font-size: 12px; }.network-pages { justify-content: center; margin-top: 16px; }.network-feedback { color: var(--ui-accent); }.subnet-tool label { display: block; margin: 12px 0 8px; }.subnet-tool input { width: 100%; max-width: 450px; }.subnet-results { display: grid; grid-template-columns: minmax(110px,auto) minmax(0,1fr); border: 1px solid var(--el-border-color-light); border-radius: 10px; overflow: hidden; }.subnet-results dt,.subnet-results dd { margin: 0; padding: 10px; border-bottom: 1px solid var(--el-border-color-light); overflow-wrap: anywhere; }.subnet-results dt { background: var(--ui-accent-soft); }.subnet-results dd { font-family: Consolas,monospace; }.network-error { color: var(--el-color-danger, #bf4343); }
@media(max-width:760px) { .network-reference { margin: 16px 12px; padding: 14px; }.network-grid { grid-template-columns: minmax(0,1fr); }.subnet-results { grid-template-columns: 105px minmax(0,1fr); } }
</style>
