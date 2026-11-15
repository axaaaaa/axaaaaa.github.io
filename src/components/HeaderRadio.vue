<template>
  <aside class="header-radio" aria-label="在线电台播放器">
    <button ref="trigger" type="button" class="radio-trigger" :aria-expanded="expanded" aria-controls="header-radio-panel" :aria-label="expanded ? '收起在线电台' : '打开在线电台'" :title="playing ? '在线电台正在播放' : '在线电台'" @click="expanded = !expanded">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2"/></svg>
      <span v-if="playing" class="radio-dot" aria-hidden="true"></span>
    </button>
    <section v-show="expanded" id="header-radio-panel" class="radio-panel" aria-label="在线电台面板">
      <header><button type="button" :aria-pressed="favoritesOnly" @click="favoritesOnly = !favoritesOnly">{{ favoritesOnly ? '显示全部频道' : '只看收藏' }}</button><button type="button" aria-label="关闭电台面板" @click="close">关闭</button></header>
      <OnlineRadio :favorites-only="favoritesOnly" ref="player" @request-play="$emit('request-play')" @playing-change="playing = $event" />
    </section>
  </aside>
</template>
<script>
import OnlineRadio from './OnlineRadio.vue';
export default {
  name: 'HeaderRadio', components: { OnlineRadio }, emits: ['request-play'],
  data: () => ({ expanded: false, playing: false, favoritesOnly: false }),
  mounted() { document.addEventListener('pointerdown', this.onOutside); document.addEventListener('keydown', this.onKey); },
  beforeUnmount() { document.removeEventListener('pointerdown', this.onOutside); document.removeEventListener('keydown', this.onKey); },
  methods: {
    stop() { this.$refs.player?.stop(); },
    close() { this.expanded = false; this.$refs.trigger?.focus(); },
    onOutside(event) { if (this.expanded && !this.$el.contains(event.target)) this.expanded = false; },
    onKey(event) { if (this.expanded && event.key === 'Escape') { event.preventDefault(); this.close(); } }
  }
};
</script>
<style scoped>
.header-radio { position: relative; flex: 0 0 32px; color: var(--el-text-color-primary, #273b30); font-size: 12px; }
button { font: inherit; color: inherit; border: 1px solid var(--el-border-color, #d7e4dc); background: var(--el-bg-color, #fff); border-radius: 8px; padding: 7px 10px; cursor: pointer; }
button:hover { background: var(--ui-accent-soft); }
.radio-trigger { display: flex; align-items: center; justify-content: center; position: relative; width: 32px; height: 32px; padding: 2px; border: 0; background: transparent; color: var(--ui-accent); }
.radio-dot { position: absolute; width: 5px; height: 5px; right: 2px; bottom: 2px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 1px var(--el-bg-color, #fff); }
.radio-panel { position: absolute; top: calc(100% + 12px); right: 0; width: 300px; max-width: calc(100vw - 32px); max-height: min(520px, calc(100dvh - 90px)); overflow-y: auto; padding: 14px; box-sizing: border-box; background: var(--el-bg-color-overlay, #fff); border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 16px; box-shadow: 0 12px 45px #0003; z-index: 10010; }
.radio-panel header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
@media (max-width: 600px) { .radio-panel { position: fixed; top: 72px; left: 12px; right: 12px; width: auto; max-width: none; max-height: calc(100dvh - 90px); } }
</style>
