<template>
  <div class="personal-greeting" aria-label="个性问候语" :title="greeting.note">
    <span class="greeting-icon" aria-hidden="true">{{ greeting.icon }}</span><span>{{ greeting.text }}</span>
  </div>
</template>
<script>
import { greetingForHour } from '../utils/personal-greeting.mjs';
export default {
  name: 'PersonalGreeting',
  data: () => ({ now: new Date(), greetingTimer: null }),
  computed: { greeting() { return greetingForHour(this.now.getHours()); } },
  mounted() { this.greetingTimer = setInterval(this.refreshTime, 60000); document.addEventListener('visibilitychange', this.refreshTime); },
  beforeUnmount() { clearInterval(this.greetingTimer); document.removeEventListener('visibilitychange', this.refreshTime); },
  methods: { refreshTime() { this.now = new Date(); } }
};
</script>
<style scoped>
.personal-greeting { display: flex; align-items: center; gap: 6px; padding: 0 6px; white-space: nowrap; flex-shrink: 0; color: var(--el-text-color-primary, #273b30); font-size: 12px; }
.greeting-icon { color: var(--ui-accent, #386a50); font-size: 17px; }
@media (max-width: 768px) { .personal-greeting { display: none; } }
</style>
