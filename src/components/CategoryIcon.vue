<template>
  <span class="category-icon" aria-hidden="true"><component :is="resolvedIcon" /></span>
</template>

<script>
import { Brush, ChatDotRound, Cloudy, Coin, Connection, Cpu, DataAnalysis, Document, Download, EditPen, Folder, Headset, House, Iphone, Link, Location, Monitor, Mouse, Picture, Promotion, Reading, Search, Service, Setting, ShoppingBag, ShoppingCart, Star, StarFilled, Tools, TrendCharts, Trophy, Van, VideoCamera, VideoPlay } from '@element-plus/icons-vue'
const icons = { Brush, ChatDotRound, Cloudy, Coin, Connection, Cpu, DataAnalysis, Document, Download, EditPen, Folder, Headset, House, Iphone, Link, Location, Monitor, Mouse, Picture, Promotion, Reading, Search, Service, Setting, ShoppingBag, ShoppingCart, Star, StarFilled, Tools, TrendCharts, Trophy, Van, VideoCamera, VideoPlay }

// Keep legacy data intact; explicit icon names take priority over emoji hints.
const aliases = { code: 'Monitor', download: 'Download', 'video-play': 'VideoPlay', cpu: 'Cpu' }
const hints = {
  '🛠': 'Tools', '🔧': 'Tools', '⚙': 'Setting', '💻': 'Monitor', '🖥': 'Monitor',
  '📝': 'EditPen', '📚': 'Reading', '📖': 'Reading', '🎨': 'Brush', '🖌': 'Brush',
  '🖼': 'Picture', '🎬': 'VideoCamera', '🎥': 'VideoCamera', '🎵': 'Headset', '🎧': 'Headset',
  '🌐': 'Connection', '🌍': 'Connection', '🤖': 'Cpu', '🧠': 'Cpu', '💬': 'ChatDotRound',
  '🚀': 'Promotion', '⭐': 'Star', '✨': 'Star', '📈': 'TrendCharts', '📊': 'DataAnalysis',
  '📁': 'Folder', '🗂': 'Folder', '🗄': 'Coin', '🔍': 'Search', '🛒': 'ShoppingCart',
  '🛍': 'ShoppingBag', '🎮': 'Mouse', '📱': 'Iphone', '🔗': 'Link', '☁': 'Cloudy',
  '📥': 'Download', '🔤': 'Document', '🇨🇳': 'Location'
}
export default {
  name: 'CategoryIcon',
  props: {
    icon: { type: String, default: '' },
    emoji: { type: String, default: '' }
  },
  computed: {
    resolvedIcon() {
      const name = aliases[this.icon] || this.icon
      const hint = this.emoji.replace(/\uFE0F/g, '')
      return icons[name] || icons[hints[hint]] || icons.Folder
    }
  }
}
</script>

<style scoped>
.category-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  vertical-align: -0.125em;
  color: inherit;
}
.category-icon > svg { width: 100%; height: 100%; fill: currentColor; }
</style>
