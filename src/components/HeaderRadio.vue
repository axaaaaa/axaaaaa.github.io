<template>
  <aside class="header-radio" aria-label="在线电台播放器">
    <button ref="trigger" type="button" class="radio-trigger" :aria-expanded="expanded" aria-controls="header-radio-panel" :aria-label="expanded ? '收起在线电台' : '打开在线电台'" :title="playing ? '在线电台正在播放' : '在线电台'" @click="expanded = !expanded">
      <img class="radio-badge" src="../assets/pixel-badges/radio-toolbar.png" width="28" height="28" alt="">
      <span v-if="playing" class="radio-dot" aria-hidden="true"></span>
    </button>
    <section v-show="expanded" id="header-radio-panel" class="radio-panel" aria-label="在线电台面板">
      <header><strong>在线电台</strong><button type="button" aria-label="关闭电台面板" @click="close">关闭</button></header>
      <OnlineRadio ref="player" @request-play="$emit('request-play')" @playing-change="playing = $event" />
    </section>
  </aside>
</template>
<script>
import OnlineRadio from './OnlineRadio.vue';
export default {
  name: 'HeaderRadio', components: { OnlineRadio }, emits: ['request-play'],
  data: () => ({ expanded: false, playing: false }),
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
.radio-badge { display: block; width: 28px; height: 28px; image-rendering: pixelated; }
.radio-dot { position: absolute; width: 5px; height: 5px; right: 2px; bottom: 2px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 1px var(--el-bg-color, #fff); }
.radio-panel { position: absolute; top: calc(100% + 15px); right: 0; width: 370px; max-width: calc(100vw - 32px); max-height: min(650px, calc(100dvh - 100px)); overflow-y: auto; padding: 18px; box-sizing: border-box; background: var(--el-bg-color-overlay, #fff); border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 16px; box-shadow: 0 12px 45px #0003; z-index: 10010; }
.radio-panel header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.radio-panel header strong { font-size: 16px; }
@media (max-width: 600px) { .radio-panel { position: fixed; top: 72px; left: 12px; right: 12px; width: auto; max-width: none; max-height: calc(100dvh - 90px); } }
</style>
