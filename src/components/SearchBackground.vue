<template>
  <InteractiveStarfield v-if="!wave" :dark="dark" />
  <canvas v-else ref="canvas" class="search-wave" aria-hidden="true"></canvas>
  <button type="button" class="effect-toggle" aria-label="蓝色粒子波" :aria-pressed="wave"
    :title="wave ? '切换到浮动 01' : '切换到蓝色粒子波'" @click="toggle">
    背景：{{ wave ? '蓝色粒子波' : '浮动 01' }}
  </button>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import InteractiveStarfield from './InteractiveStarfield.vue';

/* global defineProps */
defineProps({ dark: Boolean });
const key = 'nav-search-background';
const canvas = ref(null);
const wave = ref(false);
try { wave.value = localStorage.getItem(key) === 'wave'; } catch { /* Storage is optional. */ }

const cycleDelay = 12000;
let cycleTimer;
let reduceMotion;

function scheduleCycle() {
  clearTimeout(cycleTimer);
  if (document.hidden || reduceMotion?.matches) return;
  cycleTimer = setTimeout(() => {
    wave.value = !wave.value;
    scheduleCycle();
  }, cycleDelay);
}

onMounted(() => {
  reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion.addEventListener('change', scheduleCycle);
  document.addEventListener('visibilitychange', scheduleCycle);
  scheduleCycle();
});

onBeforeUnmount(() => {
  clearTimeout(cycleTimer);
  reduceMotion?.removeEventListener('change', scheduleCycle);
  document.removeEventListener('visibilitychange', scheduleCycle);
});

function toggle() {
  scheduleCycle();
  wave.value = !wave.value;
  try { localStorage.setItem(key, wave.value ? 'wave' : 'binary'); } catch { /* Keep the in-memory selection. */ }
}

watch(canvas, (el, previous, cleanup) => {
  if (!el) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#102c9e', '#1745dc', '#205cff', '#3478ff', '#548fff'];
  let width = 0, height = 0, frame = 0, last = null, time = 0, visible = false, points = [];
  const ripples = [];
  const rippleDuration = 1.1;
  const panel = el.closest('.search-cosmic-panel');
  function rippleAtClick(event) {
    if (event.button !== 0 || event.detail === 0 || motion.matches ||
        event.target.closest('button, input, textarea, select, summary, a, label, [role="button"]')) return;
    const box = el.getBoundingClientRect();
    ripples.push({ x: event.clientX - box.left, y: event.clientY - box.top, time });
    if (ripples.length > 4) ripples.shift();
  }
  function draw() {
    while (ripples.length && time - ripples[0].time >= rippleDuration) ripples.shift();
    ctx.clearRect(0, 0, width, height);
    const paths = colors.map(() => new Path2D());
    const amplitude = Math.min(28, height * .22);
    const wavelength = Math.max(135, Math.min(245, width * .28));
    const frequency = Math.PI * 2 / wavelength;
    for (const { x, y, radius, outward, noise } of points) {
      // A broad, curved swell advances outward; particles follow small orbits.
      const bend = 10 * Math.sin(y * .027 + time * .65);
      const phase = time * 3.05 - (radius + bend) * frequency;
      const swell = .77 + .23 * Math.sin(radius * .018 - time * 1.15 + y * .015);
      const lift = (Math.cos(phase) + .25 * Math.cos(2 * phase - .8)) * amplitude * swell;
      // Horizontal compression gathers particles at the crest before they roll down.
      const surge = Math.sin(phase) * amplitude * .72 * swell * outward;
      const crest = (.5 + .5 * Math.cos(phase - .18)) ** 3;
      const size = .75 + noise * .64 + crest * 1.42;
      const color = Math.min(4, Math.floor(noise * 1.35 + crest * 3.9));
      let rippleX = 0, rippleY = 0;
      for (const ripple of ripples) {
        const age = time - ripple.time;
        const dx = x - ripple.x, dy = y - ripple.y;
        const distance = Math.hypot(dx, dy);
        const offset = distance - age * 360;
        if (Math.abs(offset) > 68) continue;
        const push = Math.cos(offset / 12) * (1 - Math.abs(offset) / 68) *
          (1 - age / rippleDuration) * 19 / Math.max(12, distance);
        rippleX += dx * push;
        rippleY += dy * push;
      }
      const dotRadius = size / 2;
      const dotX = x + surge + rippleX + dotRadius;
      const dotY = y - lift + rippleY + dotRadius;
      paths[color].moveTo(dotX + dotRadius, dotY);
      paths[color].arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
    }
    paths.forEach((path, index) => {
      ctx.fillStyle = colors[index];
      ctx.fill(path);
    });
  }
  function resize() {
    const box = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = box.width;
    height = box.height;
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points = [];
    const step = Math.max(6, Math.sqrt(width * height / 6500));
    for (let row = -Math.ceil(40 / step); row * step < height + 40; row++) {
      for (let col = -Math.ceil(25 / step); col * step < width + 25; col++) {
        const noise = (Math.sin(row * 127.1 + col * 311.7) * 43758.5453) % 1;
        const x = (col + .5 + noise * .35) * step;
        const y = (row + .5 + noise * .22) * step;
        const dx = x - width / 2;
        const radius = Math.hypot(dx, (y - height * .63) * 1.25);
        points.push({ x, y, radius, outward: dx / Math.max(22, radius), noise: Math.abs(noise) });
      }
    }
    draw();
  }
  function tick(now) {
    if (last !== null) time += Math.min((now - last) / 1000, .05);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    last = null;
    if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const size = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  panel?.addEventListener('click', rippleAtClick);
  size.observe(el);
  intersection.observe(el);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  cleanup(() => {
    cancelAnimationFrame(frame);
    panel?.removeEventListener('click', rippleAtClick);
    size.disconnect();
    intersection.disconnect();
    motion.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  });
}, { flush: 'post' });
</script>

<style scoped>
.search-wave {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  background: radial-gradient(ellipse at center, #122b67 0%, #08142e 58%, #040812 100%);
}
.effect-toggle {
  position: absolute;
  top: 5px;
  right: 8px;
  z-index: 1;
  border: 1px solid #526c92;
  border-radius: 99px;
  padding: 1px 8px;
  background: #101e34;
  color: #e3eeff;
  font: 11px/17px system-ui, sans-serif;
  white-space: nowrap;
  cursor: pointer;
}
.effect-toggle:hover { background: #23416b; }
.effect-toggle:focus-visible { outline: 2px solid #65b9ff; outline-offset: 1px; }
</style>
