<template>
  <div class="clock-with-date">
    <time class="clock-date" :datetime="dateISO"><span>{{ dateText }}</span><span>{{ weekday }} · 农历{{ lunarText }}</span></time>
  <time class="flip-clock" :class="{ 'is-dark': dark }" :datetime="timeText" :aria-label="`当前时间 ${timeText}`" role="timer" aria-live="off">
    <template v-for="(digit, index) in digits" :key="index">
      <span v-if="index === 2 || index === 4" class="clock-colon" :class="{ 'clock-seconds': index === 4 }" aria-hidden="true">:</span>
      <span class="flip-digit" :class="{ 'clock-seconds': index >= 4 }" aria-hidden="true">
        <span class="digit-face digit-top">{{ digit }}</span>
        <span class="digit-face digit-bottom">{{ digit }}</span>
        <span v-if="previous[index] !== digit" :key="`${index}-${revision}`" class="flip-layer">
          <span class="digit-face digit-top flip-out">{{ previous[index] }}</span>
          <span class="digit-face digit-bottom flip-in">{{ digit }}</span>
        </span>
      </span>
    </template>
  </time>
  </div>
</template>

<script>
import { lunarForISO } from '../utils/china-calendar.mjs';
const formatTime = date => [date.getHours(), date.getMinutes(), date.getSeconds()]
  .map(value => String(value).padStart(2, '0')).join(':')

export default {
  name: 'FlipClock',
  props: { dark: { type: Boolean, default: false } },
  data() {
    const currentDate = new Date()
    const timeText = formatTime(currentDate)
    return { currentDate, timeText, previous: timeText.replace(/:/g, '').split(''), revision: 0, timer: null }
  },
  computed: {
    dateISO() { return [this.currentDate.getFullYear(), String(this.currentDate.getMonth() + 1).padStart(2, '0'), String(this.currentDate.getDate()).padStart(2, '0')].join('-') },
    lunarText() { return lunarForISO(this.dateISO).month + lunarForISO(this.dateISO).dayText },
    dateText() { return this.currentDate.getFullYear() + '年' + (this.currentDate.getMonth() + 1) + '月' + this.currentDate.getDate() + '日' },
    weekday() { return '星期' + '日一二三四五六'[this.currentDate.getDay()] },
    digits() { return this.timeText.replace(/:/g, '').split('') }
  },
  mounted() {
    this.tick()
    this.timer = setInterval(this.tick, 200)
    document.addEventListener('visibilitychange', this.tick)
  },
  beforeUnmount() {
    clearInterval(this.timer)
    document.removeEventListener('visibilitychange', this.tick)
  },
  methods: {
    tick() {
      this.currentDate = new Date()
      const next = formatTime(this.currentDate)
      if (next === this.timeText) return
      this.previous = this.timeText.replace(/:/g, '').split('')
      this.timeText = next
      this.revision += 1
    }
  }
}
</script>

<style scoped>
.clock-with-date { display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0; }
.clock-date { display: flex; flex-direction: column; gap: 2px; white-space: nowrap; color: var(--el-text-color-secondary, #748579); font-size: 11px; line-height: 1.25; text-align: right; font-variant-numeric: tabular-nums; }

.flip-clock {
  --clock-card: #eef1f6;
  --clock-ink: #384152;
  --clock-line: rgba(80, 95, 120, .22);
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 3px;
  margin: 0 14px 0 auto;
  padding: 0;
  border: none;
  background: transparent;
  user-select: none;
}
.flip-clock.is-dark {
  --clock-card: #122019;
  --clock-ink: #55ee8b;
  --clock-line: rgba(0, 255, 65, .22);
}
.flip-digit {
  position: relative;
  width: 21px;
  height: 30px;
  perspective: 180px;
  border-radius: 4px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, .15);
  font: 600 23px/30px 'Consolas', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--clock-ink);
}
.digit-face {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  text-align: center;
  background: var(--clock-card);
  backface-visibility: hidden;
}
.digit-top { top: 0; line-height: 30px; border-radius: 4px 4px 0 0; box-shadow: inset 0 -1px var(--clock-line); transform-origin: bottom; }
.digit-bottom { bottom: 0; line-height: 0; border-radius: 0 0 4px 4px; transform-origin: top; }
.flip-layer { position: absolute; inset: 0; }
.flip-out { z-index: 2; animation: clock-fold .26s ease-in forwards; }
.flip-in { z-index: 3; transform: rotateX(90deg); animation: clock-unfold .26s .26s ease-out forwards; }
.clock-colon { color: var(--clock-ink); font: 600 18px/1 monospace; padding: 0 1px; }
@keyframes clock-fold { to { transform: rotateX(-90deg); } }
@keyframes clock-unfold { to { transform: rotateX(0); } }
@media (max-width: 768px) {
  .flip-clock { margin: 0 2px; gap: 2px; }
  .flip-digit { width: 13px; height: 24px; font-size: 17px; line-height: 24px; }
  .digit-top { line-height: 24px; }
  .clock-colon { font-size: 14px; padding: 0; }
  .clock-seconds { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .flip-layer { display: none; }
}
</style>
