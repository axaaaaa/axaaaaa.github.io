<template>
  <button type="button" class="interaction-sound-toggle" data-sound-toggle role="switch"
    :aria-checked="enabled" :aria-label="enabled ? '关闭交互音效' : '开启交互音效'"
    :title="enabled ? '交互音效已开启：点击关闭' : '交互音效已关闭：点击开启'"
    @click="toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
      <path d="M11 4 6 8H3v8h3l5 4V4Z" stroke-linejoin="round" />
      <path v-if="enabled" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke-linecap="round" />
      <path v-else d="m16 9 5 6m0-6-5 6" stroke-linecap="round" />
    </svg>
  </button>
</template>
<script>
import { createInteractionSounds } from '../utils/interaction-sounds.mjs';
export default {
  name: 'InteractionSoundToggle',
  data: () => ({ enabled: true }),
  mounted() {
    this.soundController = createInteractionSounds({ onChange: enabled => { this.enabled = enabled; } });
  },
  beforeUnmount() { this.soundController?.dispose(); },
  methods: { toggle() { this.soundController?.setEnabled(!this.enabled); } }
};
</script>
<style scoped>
.interaction-sound-toggle { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 30px; width: 30px; height: 32px; padding: 5px; border: 0; border-radius: 7px; background: transparent; color: var(--ui-accent, #386a50); cursor: pointer; }
.interaction-sound-toggle:hover { background: var(--ui-accent-soft, #edf4ef); }
.interaction-sound-toggle svg { width: 20px; height: 20px; }
.interaction-sound-toggle[aria-checked="false"] { opacity: .65; }
</style>
