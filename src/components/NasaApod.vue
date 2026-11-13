<template>
  <section class="apod" aria-labelledby="apod-title">
    <header>
      <h2 id="apod-title">🔭 每日一张宇宙图</h2>
      <span>NASA APOD<span v-if="entry"> · {{ entry.date }}</span></span>
    </header>
    <template v-if="entry">
      <a v-if="entry.image && !imageFailed" :href="entry.source" target="_blank" rel="noopener noreferrer">
        <img :src="entry.image" :alt="entry.descriptionZh || entry.description || entry.title"
             loading="lazy" decoding="async" @error="imageFailed = true">
      </a>
      <h3>{{ entry.titleZh || entry.title }}</h3>
      <p v-if="entry.description">{{ entry.descriptionZh || entry.description }}<small v-if="entry.descriptionZh"> · 机器翻译</small></p>
      <p v-if="entry.credit">作品署名：{{ entry.credit }}</p>
    </template>
    <p v-else role="status">{{ loading ? '正在读取 NASA 每日天文图…' : '暂未获取到天文图快照' }}</p>
    <a :href="entry?.source || 'https://science.nasa.gov/apod/'" target="_blank" rel="noopener noreferrer">查看 NASA 原图、视频与完整解说 ↗</a>
  </section>
</template>

<script>
export default {
  name: 'NasaApod',
  data: () => ({ entry: null, loading: true, imageFailed: false }),
  async mounted() {
    try {
      const response = await fetch(`${process.env.BASE_URL}nasa-apod.json`, { cache: 'no-cache' });
      if (!response.ok) return;
      const item = await response.json();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || typeof item.title !== 'string' ||
          !/^https:\/\/(science|apod)\.nasa\.gov\//.test(item.source)) return;
      this.entry = { ...item, image: /^https:\/\/assets\.science\.nasa\.gov\//.test(item.image) ? item.image : '' };
    } catch { /* 保留 NASA 原文入口 */ }
    finally { this.loading = false; }
  }
};
</script>

<style scoped>
.apod { padding: 18px 0; color: var(--el-text-color-primary); }
header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
h2 { font-size: 17px; margin: 0; }
h3 { margin: 14px 0 6px; font-size: 15px; }
header span, p, a { font-size: 12px; line-height: 1.7; }
p { margin: 6px 0; }
img { display: block; width: 100%; max-height: 420px; object-fit: contain; background: #101521; border-radius: 12px; }
a { color: inherit; text-underline-offset: 3px; }
</style>
