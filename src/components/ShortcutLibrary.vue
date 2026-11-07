<template>
  <section id="shortcut-library" class="shortcut-library" aria-labelledby="shortcut-title">
    <header class="shortcut-heading"><h2 id="shortcut-title"><button type="button" class="module-title-toggle" :aria-expanded="opened" aria-controls="shortcut-content" @click="opened = !opened" style="border:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;padding:0;text-align:left;cursor:pointer"><svg class="module-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:19px;height:19px;vertical-align:-3px;margin-right:7px"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m3 0h1m3 0h1m3 0h1M7 15h10"/></svg> 快捷键速查<svg class="module-heading-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :style="{transform: opened ? 'rotate(90deg)' : 'rotate(0deg)'}" style="width:14px;height:14px;vertical-align:-2px;margin-left:8px"><path d="m9 5 7 7-7 7"/></svg></button></h2><div><span>{{ entries.length }} 条快捷键</span><button type="button" :aria-expanded="opened" aria-controls="shortcut-content" @click="opened = !opened">{{ opened ? '收起 ▴' : '展开 ▾' }}</button></div></header>
    <div v-if="opened" id="shortcut-content">
      <p class="shortcut-intro">Win 为 Windows 键，Cmd 为 Command，Alt 在 Mac 上对应 Option；“然后”表示依次按下两组键。自定义键位或系统版本可能影响结果。</p>
      <div class="shortcut-search"><input v-model="query" type="search" placeholder="搜索用途、按键，例如 截图 / Ctrl Shift T" aria-label="搜索快捷键" /><button type="button" :aria-pressed="favoritesOnly" @click="favoritesOnly = !favoritesOnly">{{ favoritesOnly ? '★ 只看收藏' : '☆ 我的收藏' }}</button></div>
      <nav class="shortcut-categories shortcut-groups" aria-label="快捷键大类"><button v-for="name in groups" :key="name" type="button" :aria-pressed="group === name" @click="selectGroup(name)"><ToolEntryIcon :name="name === '系统' ? '系统' : '开发'" />{{ name }}</button></nav>
      <nav class="shortcut-categories" :aria-label="group + '快捷键分类'"><button v-for="name in categories" :key="name" type="button" :aria-pressed="category === name" @click="selectCategory(name)"><ToolEntryIcon :name="name" />{{ name }}</button></nav>
      <nav v-if="['Photoshop','Illustrator','浏览器开发者工具'].includes(category)" class="shortcut-categories" :aria-label="category + ' 平台'"><button v-for="os in (category === '浏览器开发者工具' ? ['Windows / Linux','macOS'] : ['Windows','macOS'])" :key="os" type="button" :aria-pressed="photoshopOS === os" @click="photoshopOS=os;topic=topics[0] || ''">{{os}}</button></nav>
      <div class="shortcut-purpose"><div class="shortcut-topic-tabs" role="tablist" aria-label="快捷键用途"><button v-for="(name, index) in topicTabs" :id="'shortcut-topic-' + index" :key="name" type="button" role="tab" :aria-selected="topic === name" aria-controls="shortcut-topic-panel" :tabindex="topic === name ? 0 : -1" @click="topic = name" @keydown="onTopicKey($event, index)"><ToolEntryIcon :name="name" />{{ name }} <small>{{ topicCounts[name] || 0 }}</small></button></div></div>
      <div class="shortcut-summary"><span>{{ filtered.length }} 条结果 · 收藏仅保存在当前浏览器</span></div>
      <p v-if="feedback" role="status" class="shortcut-feedback">{{ feedback }}</p>
      <ShortcutKeyboard :entry="keyboardEntry" @focusout="onPreviewFocusOut" @mouseenter="hoveredId=lastHoveredId" @mouseleave="hoveredId=''" />
      <div id="shortcut-topic-panel" class="shortcut-grid" role="tabpanel" :aria-labelledby="'shortcut-topic-' + topicTabs.indexOf(topic)" tabindex="0"><article v-for="entry in pageEntries" :key="entry.id" class="shortcut-card" tabindex="0" @mouseenter="hoveredId=entry.id;lastHoveredId=entry.id" @mouseleave="hoveredId=''" @focusin="focusedId=entry.id" @focusout="onCardFocusOut" @click="focusedId=entry.id">
        <div class="shortcut-card-heading"><h3><ToolEntryIcon :name="entry.topic" />{{ entry.title }}</h3><button type="button" :aria-label="(favorites.includes(entry.id) ? '取消收藏快捷键：' : '收藏快捷键：') + entry.title + '（' + entry.category + '）'" :aria-pressed="favorites.includes(entry.id)" @click="toggleFavorite(entry.id)">{{ favorites.includes(entry.id) ? '★' : '☆' }}</button></div>
        <small>{{ entry.platform }} · {{ entry.topic }}</small>
        <div class="shortcut-keys" :aria-label="keyText(entry)"><template v-for="(stroke, index) in entry.strokes" :key="index"><span v-if="index" class="shortcut-then">然后</span><span class="shortcut-stroke"><template v-for="(key, keyIndex) in stroke" :key="keyIndex"><span v-if="keyIndex" aria-hidden="true">+</span><kbd>{{ key }}</kbd></template></span></template></div>
        <p v-if="entry.note">{{ entry.note }}</p>
        <div class="shortcut-actions"><a :href="entry.source" target="_blank" rel="noopener noreferrer">官方说明 ↗</a></div>
      </article></div>
      <p v-if="!filtered.length">没有匹配的快捷键。<button type="button" @click="reset">清除筛选</button></p>
      <nav v-if="pageCount > 1" class="shortcut-pages" aria-label="快捷键分页"><button type="button" :disabled="page === 1" @click="page--">上一页</button><span>{{ page }} / {{ pageCount }}</span><button type="button" :disabled="page === pageCount" @click="page++">下一页</button></nav>
    </div>
  </section>
</template>
<script>
import ShortcutKeyboard from './ShortcutKeyboard.vue';
import ToolEntryIcon from './ToolEntryIcon.vue';
import { shortcuts } from '../data/shortcuts.mjs';
import { filterShortcuts, readShortcutFavorites, SHORTCUT_FAVORITES_KEY } from '../utils/shortcut-library.mjs';
export default {
  components: { ToolEntryIcon, ShortcutKeyboard },
  name: 'ShortcutLibrary',
  data: () => ({ opened: false, hoveredId: '', lastHoveredId: '', focusedId: '', entries: shortcuts, query: '', group: '系统', groups: ['系统', '软件'], category: shortcuts[0]?.category || '', photoshopOS: '', topic: shortcuts[0]?.topic || '', favoritesOnly: false, favorites: [], feedback: '', page: 1, pageSize: 24 }),
  computed: {
    keyboardEntry() { return this.pageEntries.find(e => e.id === (this.hoveredId || this.focusedId)) || null; },
    categories() { const system = ['Windows', 'macOS', 'Windows Terminal', 'PowerShell 命令行编辑', 'Linux Bash']; return [...new Set(this.entries.map(e => e.category))].filter(name => (system.includes(name) ? '系统' : '软件') === this.group); },
    platformEntries() { return this.entries.filter(e => !['Photoshop','Illustrator','浏览器开发者工具'].includes(this.category) || !this.photoshopOS || e.category !== this.category || e.os === this.photoshopOS); },
    topics() { return [...new Set(this.platformEntries.filter(e => !this.category || e.category === this.category).map(e => e.topic))]; },
    topicTabs() { return this.topics; },
    topicCounts() { const counts = { '': 0 }; for (const entry of this.platformEntries) if (!this.category || entry.category === this.category) { counts['']++; counts[entry.topic] = (counts[entry.topic] || 0) + 1; } return counts; },
    filtered() { return filterShortcuts(this.platformEntries, this); },
    pageCount() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); },
    pageEntries() { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  },
  watch: { pageEntries() { this.hoveredId=''; this.lastHoveredId=''; this.focusedId=''; }, opened(value) { if(!value){this.hoveredId='';this.lastHoveredId='';this.focusedId='';} }, photoshopOS() { this.page = 1; }, query() { this.page = 1; }, category() { this.page = 1; }, topic() { this.page = 1; }, favoritesOnly() { this.page = 1; }, pageCount(n) { if (this.page > n) this.page = n; } },
  mounted() { this.loadFavorites(); window.addEventListener('storage', this.onStorage); },
  beforeUnmount() { window.removeEventListener('storage', this.onStorage); },
  methods: {
    selectCategory(name) { this.category = name; this.photoshopOS = name === '浏览器开发者工具' ? 'Windows / Linux' : ['Photoshop', 'Illustrator'].includes(name) ? 'Windows' : ''; this.topic = this.topics[0] || ''; this.page = 1; },
    selectGroup(name) { this.group = name; this.category = this.categories[0] || ''; this.photoshopOS = ''; this.topic = this.topics[0] || ''; this.page = 1; },
    onCardFocusOut(event) { if (!event.currentTarget.contains(event.relatedTarget) && !event.relatedTarget?.closest('.keyboard-preview')) this.focusedId = ''; },
    onPreviewFocusOut(event) { if (!event.currentTarget.contains(event.relatedTarget) && !event.relatedTarget?.closest('.shortcut-card')) this.focusedId = ''; },
    onTopicKey(event, index) {
      const count = this.topicTabs.length;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : event.key === 'ArrowRight' ? (index + 1) % count : event.key === 'ArrowLeft' ? (index + count - 1) % count : null;
      if (next === null) return;
      event.preventDefault(); this.topic = this.topicTabs[next];
      this.$nextTick(() => this.$el.querySelector('#shortcut-topic-' + next)?.focus());
    },
    loadFavorites() { try { this.favorites = readShortcutFavorites(localStorage, this.entries); } catch { this.favorites = []; } },
    onStorage(event) { if (event.key === SHORTCUT_FAVORITES_KEY || event.key === null) this.loadFavorites(); },
    keyText(entry) { return entry.strokes.map(stroke => stroke.join(' + ')).join(' → '); },
    reset() { this.query = ''; this.group = '系统'; this.category = this.categories[0] || ''; this.photoshopOS = ''; this.topic = this.topics[0] || ''; this.favoritesOnly = false; },
    toggleFavorite(id) {
      this.favorites = this.favorites.includes(id) ? this.favorites.filter(v => v !== id) : [...this.favorites, id];
      try { localStorage.setItem(SHORTCUT_FAVORITES_KEY, JSON.stringify(this.favorites)); this.feedback = '快捷键收藏已更新'; }
      catch { this.feedback = '本次页面收藏已更新，浏览器未保存'; }
    },

  }
};
</script>
<style scoped>
.shortcut-library { margin: 24px 20px 32px; padding: 20px; border: 1px solid var(--el-border-color-light, #d7e4dc); border-radius: 14px; color: var(--el-text-color-primary, #273b30); background: var(--el-bg-color, #fff); scroll-margin-top: 80px; font-size: 13px; }
.shortcut-heading, .shortcut-heading>div, .shortcut-card-heading, .shortcut-summary, .shortcut-actions, .shortcut-pages { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
h2 { margin: 0; font-size: 20px; font-weight: 500; }h3 { margin: 0; font-size: 14px; }button,input,select { font: inherit; color: inherit; border: 1px solid var(--el-border-color, #d7e4dc); background: var(--el-fill-color-blank, #fff); border-radius: 7px; padding: 7px 10px; box-sizing: border-box; }button { cursor: pointer; }button:hover:not(:disabled),button[aria-pressed="true"] { background: var(--ui-accent-soft, #edf4ef); color: var(--ui-accent, #386a50); }button:disabled { opacity: .4; cursor: default; }
.shortcut-intro { color: var(--el-text-color-secondary, #748579); line-height: 1.8; margin: 16px 0; }.shortcut-search { display: flex; flex-wrap: wrap; gap: 10px; }.shortcut-search input { flex: 1 1 220px; min-width: 0; }.shortcut-categories { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }.shortcut-summary { color: var(--el-text-color-secondary); margin: 12px 0; }.shortcut-summary label { display: flex; align-items: center; gap: 8px; }.shortcut-grid { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 8px; }.shortcut-card { min-width: 0; padding: 10px; border: 1px solid var(--el-border-color-light); border-radius: 10px; }.shortcut-card small { display: block; margin-top: 4px; color: var(--el-text-color-secondary); }.shortcut-card p { font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.7; }.shortcut-keys,.shortcut-stroke { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }.shortcut-keys { margin: 8px 0; }.shortcut-then { color: var(--el-text-color-secondary); font-size: 11px; }kbd { padding: 2px 6px; border: 1px solid var(--el-border-color); border-bottom-width: 3px; border-radius: 5px; background: var(--ui-accent-soft); font: 600 12px/1.5 Consolas,monospace; }a { color: var(--ui-accent); text-decoration: none; font-size: 12px; }.shortcut-feedback { color: var(--ui-accent); }.shortcut-pages { justify-content: center; margin-top: 16px; }
.shortcut-groups { padding-bottom: 10px; border-bottom: 1px solid var(--el-border-color-light); }.shortcut-groups button { padding: 8px 20px; font-weight: 600; }
.shortcut-purpose { margin: 14px 0; }.shortcut-topic-tabs { display: flex; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid var(--el-border-color-light); padding-bottom: 8px; }.shortcut-topic-tabs button { border-color: transparent; border-radius: 7px 7px 0 0; border-bottom: 2px solid transparent; }.shortcut-topic-tabs button[aria-selected="true"] { background: var(--ui-accent-soft, #edf4ef); color: var(--ui-accent, #386a50); border-bottom-color: var(--ui-accent, #386a50); font-weight: 600; }.shortcut-topic-tabs small { margin-left: 4px; opacity: .7; font-weight: 400; }.shortcut-topic-tabs button:focus-visible, #shortcut-topic-panel:focus-visible { outline: 2px solid var(--ui-accent, #386a50); outline-offset: 2px; }
.shortcut-card-heading { gap: 6px; }.shortcut-card h3 { font-size: 13px; }.shortcut-card p { margin: 6px 0; line-height: 1.6; }.shortcut-card-heading button { padding: 4px 7px; min-height: 28px; }.shortcut-actions { gap: 6px; }
@media(min-width:761px) and (max-width:1100px) { .shortcut-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media(max-width:760px) { .shortcut-library { margin: 16px 12px; padding: 14px; }.shortcut-grid { grid-template-columns: minmax(0,1fr); } }
.shortcut-card:focus-visible{outline:2px solid var(--ui-focus);outline-offset:2px;}
</style>
