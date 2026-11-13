<template>
  <span class="category-pixel-badge" aria-hidden="true" :style="{ backgroundPosition: position }"></span>
</template>

<script>
import { categoryBadgePosition } from '../utils/sidebar-category-badges.mjs';

export default {
  name: 'CategoryPixelBadge',
  props: { name: { type: String, required: true } },
  computed: {
    position() { return categoryBadgePosition(this.name); }
  }
};
</script>

<style scoped>
.category-pixel-badge {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background: url("../assets/pixel-badges/sidebar-categories.png") no-repeat;
  background-size: 600% 600%;
  image-rendering: pixelated;
}
</style>
