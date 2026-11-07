<template>
  <div class="online-radio" aria-label="在线电台">
    <p class="radio-caption">公开网络电台 · 点击频道开始收听</p>
    <div class="radio-current"><strong>{{ current.name }}</strong><span class="radio-state" role="status">{{ statusText }}</span></div>
    <p>{{ current.description }}</p>
    <audio ref="radioAudio" preload="none" @playing="onPlaying" @waiting="onWaiting" @pause="onPause" @error="fail" @ended="fail"></audio>
    <div class="radio-controls"><button type="button" @click="playing ? stop() : play(current)">{{ playing ? '停止' : status === 'loading' ? '重新连接' : '播放 / 重试' }}</button><label>音量<input v-model.number="volume" type="range" min="0" max="1" step="0.01" aria-label="电台音量" @input="setVolume" /></label></div>
    <div class="radio-sleep-timer">
      <label>定时关闭<select v-model.number="sleepMinutes" aria-label="定时关闭时长" @change="setSleepTimer">
        <option :value="0">不定时</option><option v-for="minutes in [15, 30, 45, 60, 90, 120]" :key="minutes" :value="minutes">{{ minutes }} 分钟后</option>
      </select></label>
      <button v-if="sleepDeadline" type="button" @click="cancelSleepTimer">取消定时</button>
      <span v-if="sleepDeadline" class="radio-caption">剩余 {{ sleepRemainingText }} 后停止播放</span>
      <span class="radio-caption" role="status">{{ sleepMessage }}</span>
    </div>
    <p v-if="error" role="alert" class="radio-error">{{ error }}</p>
    <div class="radio-directory-filters">
      <label>搜索电台<input v-model="query" type="search" placeholder="名称 / 省市 / 类型" aria-label="搜索电台" /></label>
      <div class="radio-selects"><select v-model="region" aria-label="电台地区"><option value="">全部地区</option><option v-for="item in regions" :key="item" :value="item">{{ item }}</option></select>
      <select v-model="category" aria-label="电台类型"><option value="">全部类型</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select>
      <select v-model="availability" aria-label="电台源状态"><option value="">全部状态</option><option value="reachable">源可访问</option><option value="unavailable">暂不可用</option><option value="unverified">未检测</option></select></div>
      <p class="radio-caption">目录 {{ stations.length }} 个频道 · 匹配 {{ visibleStations.length }} 个<br />更新 {{ catalogDate }} · 源可访问不代表每个浏览器均可播放</p>
    </div>
    <button type="button" class="radio-filter" :aria-pressed="favoritesOnly" @click="favoritesOnly = !favoritesOnly">{{ favoritesOnly ? '显示全部频道' : '只看收藏' }}</button>
    <ul class="radio-list"><li v-for="station in pagedStations" :key="station.id"><button type="button" class="radio-station" :aria-current="current.id === station.id ? 'true' : undefined" @click="play(station)"><strong>{{ station.name }}</strong><small>{{ station.region }} {{ station.city }} · {{ (station.categories || []).join(' / ') }}</small><small>{{ station.availability === 'reachable' ? '音频源可访问' : station.availability === 'unavailable' ? '本次检测暂不可用' : '未检测' }}</small></button><button type="button" :aria-label="(favorites.includes(station.id) ? '取消收藏 ' : '收藏 ') + station.name" :aria-pressed="favorites.includes(station.id)" @click="toggleFavorite(station.id)">{{ favorites.includes(station.id) ? '★' : '☆' }}</button></li></ul>
    <p v-if="!visibleStations.length">没有匹配的电台，请调整搜索或筛选条件。</p>
    <nav v-if="visibleStations.length > pageSize" class="radio-pagination" aria-label="电台分页"><button type="button" :disabled="page <= 1" @click="page--">上一页</button><span>{{ page }} / {{ pageCount }}</span><button type="button" :disabled="page >= pageCount" @click="page++">下一页</button></nav>
    <p class="radio-caption">收录蜻蜓FM公开广播目录及现有预设；不代表全国所有在播电台。失效源保留，供检索及前往来源页面。</p>
    <p class="radio-caption">直播没有播放进度，网络或地区可能影响连接。频道由 <a :href="current.homepage" target="_blank" rel="noopener noreferrer">{{ current.provider }}</a> 提供。</p>
  </div>
</template>
<script>
import directory from '../data/china-radio-directory.json';
import { mergeRadioDirectory, filterRadioDirectory } from '../utils/radio-directory.mjs';
const PRESET_STATIONS = [
  { id: 'beijing-music', name: '北京音乐广播', description: '中国 · 北京 · FM97.4 · 音乐', url: 'https://lhttp.qtfm.cn/live/332/64k.mp3', homepage: 'https://m.qingting.fm/channels/332/', provider: '蜻蜓FM · 北京音乐广播' },
  { id: 'beijing-news', name: '北京新闻广播', description: '中国 · 北京 · FM94.5 · 新闻', url: 'https://lhttp.qtfm.cn/live/339/64k.mp3', homepage: 'https://m.qingting.fm/channels/339/', provider: '蜻蜓FM · 北京新闻广播' },
  { id: 'guangdong-music', name: '广东音乐之声', description: '中国 · 广东 · 音乐与娱乐', url: 'https://lhttp.qtfm.cn/live/1260/64k.mp3', homepage: 'https://m.qingting.fm/channels/1260/', provider: '蜻蜓FM · 广东音乐之声' },
  { id: 'handan-happy', name: '欢乐调频', description: '中国 · 邯郸 · 综艺与生活', url: 'https://lhttp.qtfm.cn/live/15318317/64k.mp3', homepage: 'https://m.qingting.fm/channels/15318317/', provider: '蜻蜓FM · 欢乐调频' },
  { id: 'radioparadise', name: 'Radio Paradise', description: '摇滚 · 电子 · 世界音乐', url: 'https://stream.radioparadise.com/mp3-128', homepage: 'https://radioparadise.com/', provider: 'Radio Paradise' },
  { id: 'groovesalad', name: 'Groove Salad', description: '舒缓电子 · Downtempo', url: 'https://ice6.somafm.com/groovesalad-128-mp3', provider: 'SomaFM', homepage: 'https://somafm.com/groovesalad/' },
  { id: 'dronezone', name: 'Drone Zone', description: '氛围音乐 · 放松与专注', url: 'https://ice6.somafm.com/dronezone-128-mp3', provider: 'SomaFM', homepage: 'https://somafm.com/dronezone/' },
  { id: 'deepspaceone', name: 'Deep Space One', description: '深空氛围 · 实验电子', url: 'https://ice6.somafm.com/deepspaceone-128-mp3', provider: 'SomaFM', homepage: 'https://somafm.com/deepspaceone/' }
];
const STATIONS = mergeRadioDirectory(PRESET_STATIONS, directory.stations);
export default {
  name: 'OnlineRadio',
  emits: ['request-play', 'playing-change'],
  data: () => ({ stations: STATIONS, current: STATIONS[0], status: 'idle', playing: false, error: '', favorites: [], favoritesOnly: false, query: '', region: '', category: '', availability: '', page: 1, pageSize: 20, volume: 0.5, timeout: null, request: 0, sleepMinutes: 0, sleepDeadline: 0, sleepRemaining: 0, sleepInterval: null, sleepMessage: '' }),
  computed: {
    sleepRemainingText() { const seconds = this.sleepRemaining; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; },
    visibleStations() { return filterRadioDirectory(this.stations, this); },
    pagedStations() { return this.visibleStations.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); },
    pageCount() { return Math.max(1, Math.ceil(this.visibleStations.length / this.pageSize)); },
    regions() { return [...new Set(this.stations.map(s => s.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')); },
    categories() { return [...new Set(this.stations.flatMap(s => s.categories || []))].sort((a, b) => a.localeCompare(b, 'zh-CN')); },
    catalogDate() { return new Date(directory.generatedAt).toLocaleDateString('zh-CN'); },
    statusText() { return { idle: '未播放', loading: '连接中…', playing: '● 直播中', stopped: '已停止', error: '连接失败' }[this.status]; }
  },
  watch: {
    query() { this.page = 1; }, region() { this.page = 1; }, category() { this.page = 1; }, availability() { this.page = 1; }, favoritesOnly() { this.page = 1; },
    pageCount(value) { if (this.page > value) this.page = value; }
  },
  mounted() {
    try {
      const state = JSON.parse(localStorage.getItem('navx-radio') || '{}');
      this.current = this.stations.find(s => s.id === state.last) || this.stations[0];
      this.favorites = Array.isArray(state.favorites) ? state.favorites.filter(id => this.stations.some(s => s.id === id)) : [];
      if (typeof state.volume === 'number' && Number.isFinite(state.volume)) this.volume = Math.min(1, Math.max(0, state.volume));
    } catch { /* Defaults work without stored preferences. */ }
    document.addEventListener('visibilitychange', this.updateSleepTimer);
    this.$refs.radioAudio.volume = this.volume;
  },
  beforeUnmount() { document.removeEventListener('visibilitychange', this.updateSleepTimer); this.stop(); },
  methods: {
    cancelSleepTimer() {
      clearInterval(this.sleepInterval); this.sleepInterval = null;
      this.sleepDeadline = 0; this.sleepRemaining = 0; this.sleepMinutes = 0; this.sleepMessage = '';
    },
    setSleepTimer() {
      const minutes = Number(this.sleepMinutes);
      this.cancelSleepTimer();
      if (![15, 30, 45, 60, 90, 120].includes(minutes)) return;
      this.sleepMinutes = minutes; this.sleepDeadline = Date.now() + minutes * 60000;
      this.updateSleepTimer(); this.sleepInterval = setInterval(this.updateSleepTimer, 1000);
    },
    updateSleepTimer() {
      if (!this.sleepDeadline) return;
      this.sleepRemaining = Math.max(0, Math.ceil((this.sleepDeadline - Date.now()) / 1000));
      if (this.sleepRemaining === 0) { this.stop(); this.error = ''; this.sleepMessage = '定时时间已到，电台已关闭'; }
    },
    save() { try { localStorage.setItem('navx-radio', JSON.stringify({ last: this.current.id, favorites: this.favorites, volume: this.volume })); } catch { /* Optional. */ } },
    setVolume() { this.$refs.radioAudio.volume = this.volume; this.save(); },
    toggleFavorite(id) { this.favorites = this.favorites.includes(id) ? this.favorites.filter(v => v !== id) : [...this.favorites, id]; this.save(); },
    async play(station) {
      this.stop(false); const request = ++this.request;
      this.current = station; this.error = ''; this.status = 'loading'; this.save();
      this.$emit('request-play');
      const audio = this.$refs.radioAudio;
      audio.volume = this.volume; audio.src = station.url; audio.load();
      this.timeout = setTimeout(() => { if (request === this.request) this.fail(); }, 15000);
      try { await audio.play(); } catch (error) { if (request === this.request && error.name !== 'AbortError') this.fail(); }
    },
    onPlaying() { if (!this.$refs.radioAudio.getAttribute('src') || this.$refs.radioAudio.paused) return; clearTimeout(this.timeout); this.status = 'playing'; this.playing = true; this.$emit('playing-change', true); },
    onWaiting() { if (!this.$refs.radioAudio.getAttribute('src')) return; if (this.status !== 'loading') { this.status = 'loading'; clearTimeout(this.timeout); this.timeout = setTimeout(() => this.fail(), 15000); } },
    onPause() { this.playing = false; this.$emit('playing-change', false); if (this.status === 'playing') this.status = 'stopped'; },
    stop(clearSleep = true) { if (clearSleep) this.cancelSleepTimer(); ++this.request; clearTimeout(this.timeout); this.playing = false; this.status = 'stopped'; const audio = this.$refs.radioAudio; if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); } this.$emit('playing-change', false); },
    fail() { this.stop(); this.status = 'error'; this.error = '电台连接失败或等待超时，请重试、换个频道，或前往官方页面收听。'; }
  }
};
</script>
<style scoped>
.radio-sleep-timer, .radio-sleep-timer label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.radio-sleep-timer { margin-top: 12px; }
.radio-sleep-timer select { padding: 6px; max-width: 100%; font: inherit; color: inherit; background: var(--el-bg-color, #fff); border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 6px; }
.radio-directory-filters { margin: 12px 0; }.radio-directory-filters label { display: flex; align-items: center; gap: 8px; }.radio-directory-filters input { flex: 1; min-width: 0; width: auto; padding: 7px; border: 1px solid var(--el-border-color); border-radius: 6px; background: var(--el-bg-color); color: inherit; }.radio-selects { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }.radio-selects select { min-width: 0; flex: 1 1 85px; max-width: 100%; padding: 6px 3px; background: var(--el-bg-color); color: inherit; border: 1px solid var(--el-border-color); border-radius: 6px; font: inherit; }.radio-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.radio-pagination button:disabled { opacity: .4; cursor: default; }.radio-list { max-height: 280px; overflow-y: auto; }.radio-station strong { display: block; overflow-wrap: anywhere; }

.online-radio { font-size: 12px; line-height: 1.6; }
.radio-caption { color: var(--el-text-color-secondary, #748579); font-size: 11px; }
.radio-current, .radio-controls, .radio-controls label { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.radio-current { justify-content: space-between; }.radio-state { color: var(--ui-accent); }.radio-current strong { font-size: 16px; }
button { font: inherit; color: inherit; border: 1px solid var(--el-border-color, #d7e4dc); background: var(--el-bg-color, #fff); border-radius: 8px; padding: 7px 10px; cursor: pointer; }button:hover { background: var(--ui-accent-soft); }
.radio-list { list-style: none; padding: 0; margin: 12px 0; }.radio-list li { display: flex; align-items: center; gap: 6px; margin: 6px 0; }.radio-station { flex: 1; text-align: left; min-width: 0; }.radio-station small { display: block; color: var(--el-text-color-secondary); }.radio-station[aria-current="true"] { background: var(--ui-accent-soft); border-color: var(--ui-accent); }.radio-filter { margin-top: 12px; }.radio-error { color: var(--el-color-danger, #bd4343); }input { width: 110px; }a { color: var(--ui-accent); }
</style>
