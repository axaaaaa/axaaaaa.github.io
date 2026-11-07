<template>
  <el-popover v-model:visible="visible" :popper-style="{ background: dark ? '#14231b' : '#ffffff', color: dark ? '#c0d9c8' : '#354252', borderColor: dark ? '#344e3d' : '#e2e7ef' }" trigger="click" :width="300" :effect="dark ? 'dark' : 'light'" placement="bottom-end">
    <template #reference>
      <button type="button" class="header-weather" :class="{ 'is-dark': dark }" :title="summary" :aria-label="summary" :aria-expanded="visible" @keydown.esc="visible = false">
        <span aria-hidden="true">{{ weather ? weather.icon : '🌡️' }}</span>
        <span class="weather-city">{{ location ? location.name : '选择城市' }}</span>
        <span class="weather-condition">{{ weather ? weather.text : loading ? '查询中…' : '天气' }}</span>
        <span v-if="weather">{{ weather.temperature }}°C</span>
      </button>
    </template>
    <section class="weather-panel" aria-label="天气详情" @keydown.esc="visible = false">
      <div class="weather-title"><strong>{{ location ? location.name : '城市天气' }}</strong><button type="button" :disabled="loading || !location" @click="refresh">{{ loading ? '更新中…' : '刷新' }}</button></div>
      <p v-if="error" class="weather-message" role="status">{{ error }}</p>
      <template v-if="weather">
        <p class="weather-now">{{ weather.icon }} {{ weather.text }} · {{ weather.temperature }}°C</p>
        <div class="weather-metrics"><span>体感 {{ measurement(weather.apparent, '°C') }}</span><span>湿度 {{ measurement(weather.humidity, '%') }}</span><span>风速 {{ measurement(weather.wind, ' km/h') }}</span></div>
        <div class="weather-forecast" aria-label="未来三天天气">
          <div v-for="day in weather.days" :key="day.date"><span>{{ day.date.slice(5) }}</span><span>{{ day.icon }} {{ day.text }}</span><span>{{ measurement(day.low, '°') }} / {{ measurement(day.high, '°') }}</span></div>
        </div>
        <p class="weather-note">数据时间 {{ weather.time }} · {{ weather.timezone }}</p>
      </template>
      <form class="weather-search" @submit.prevent="searchCities">
        <label for="weather-city-input">切换城市</label>
        <div><input id="weather-city-input" v-model="query" maxlength="80" placeholder="输入城市，如北京、上海" autocomplete="off" /><button type="submit" :disabled="searching || query.trim().length < 2">{{ searching ? '搜索中…' : '搜索' }}</button></div>
      </form>
      <p v-if="searchMessage" class="weather-message" role="status">{{ searchMessage }}</p>
      <ul v-if="results.length" class="weather-results"><li v-for="city in results" :key="city.id"><button type="button" @click="chooseCity(city)">{{ city.name }} · {{ city.admin1 }} · {{ city.country }}</button></li></ul>
      <button type="button" class="weather-auto" @click="useAutoLocation">使用 IP 地区</button>
      <p class="weather-note">{{ manualLocation ? '手动城市（已记住）' : 'IP 大致地区' }} · 每 15 分钟刷新</p>
      <p class="weather-note">天气：<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · 城市：GeoNames</p>
    </section>
  </el-popover>
</template>
<script>
import { validLocation, forecastUrl, normalizeWeather } from '../utils/weather.mjs'
const storageKey = 'navigation-weather-city-v1'
export default {
  name: 'HeaderWeather',
  props: { dark: { type: Boolean, default: false }, autoLocation: { type: Object, default: null } },
  data() { return { visible: false, manualLocation: null, weather: null, loading: false, error: '', query: '', results: [], searching: false, searchMessage: '', weatherController: null, searchController: null, timer: null, disposed: false } },
  computed: {
    location() { return this.manualLocation || (validLocation(this.autoLocation) ? this.autoLocation : null) },
    summary() { return this.weather ? `${this.location?.name || ''} · ${this.weather.text} · ${this.weather.temperature}°C；点击查看详情和切换城市` : '点击选择城市、查询天气' }
  },
  watch: { autoLocation() { if (!this.manualLocation) { this.weather = null; this.refresh() } } },
  mounted() {
    try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (validLocation(saved)) this.manualLocation = saved } catch { /* Optional local preference. */ }
    this.refresh()
    this.timer = setInterval(() => { if (!document.hidden) this.refresh() }, 15 * 60 * 1000)
  },
  beforeUnmount() { this.disposed = true; clearInterval(this.timer); this.weatherController?.abort(); this.searchController?.abort() },
  methods: {
    measurement(value, unit) { return value === null ? '—' : `${value}${unit}` },
    async refresh() {
      this.weatherController?.abort()
      if (!this.location || this.disposed) { this.loading = false; return }
      const location = { ...this.location }, controller = new AbortController()
      this.weatherController = controller; this.loading = true; this.error = ''
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch(forecastUrl(location), { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
        if (!response.ok) throw new Error('Weather service error')
        const weather = normalizeWeather(await response.json())
        if (!this.disposed && this.weatherController === controller) this.weather = weather
      } catch {
        if (!this.disposed && this.weatherController === controller) this.error = this.weather ? '更新未成功，当前显示上次数据，点击刷新重试。' : '暂未获取天气，请重试或切换城市。'
      } finally {
        clearTimeout(timeout)
        if (!this.disposed && this.weatherController === controller) { this.loading = false; this.weatherController = null }
      }
    },
    async searchCities() {
      if (this.query.trim().length < 2 || this.disposed) return
      this.searchController?.abort()
      const controller = new AbortController(); this.searchController = controller
      this.searching = true; this.results = []; this.searchMessage = ''
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const params = new URLSearchParams({ name: this.query.trim(), count: '5', language: 'zh', format: 'json' })
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
        if (!response.ok) throw new Error('City service error')
        const data = await response.json()
        if (this.disposed || this.searchController !== controller) return
        this.results = (Array.isArray(data.results) ? data.results : []).filter(validLocation)
        if (!this.results.length) this.searchMessage = '未找到城市，请尝试完整名称或英文名称。'
      } catch {
        if (!this.disposed && this.searchController === controller) this.searchMessage = '城市查询暂未成功，请重新搜索。'
      } finally {
        clearTimeout(timeout)
        if (!this.disposed && this.searchController === controller) { this.searching = false; this.searchController = null }
      }
    },
    chooseCity(city) {
      if (!validLocation(city)) return
      this.manualLocation = { name: city.name, latitude: city.latitude, longitude: city.longitude }
      try { localStorage.setItem(storageKey, JSON.stringify(this.manualLocation)) } catch { /* Storage may be unavailable. */ }
      this.results = []; this.searchMessage = ''; this.weather = null; this.refresh()
    },
    useAutoLocation() {
      this.manualLocation = null; this.weather = null; this.error = ''; this.results = []
      try { localStorage.removeItem(storageKey) } catch { /* Storage may be unavailable. */ }
      if (!validLocation(this.autoLocation)) this.error = '等待 IP 地区，或先手动选择城市。'
      this.refresh()
    }
  }
}
</script>
<style scoped>
.header-weather { display: inline-flex; align-items: center; gap: 5px; min-width: 0; max-width: 200px; padding: 3px 0; border: 0; background: transparent; color: #566273; font: 12px/1.5 system-ui, sans-serif; white-space: nowrap; cursor: pointer; }
.header-weather.is-dark { color: #80c69a; }
.weather-city { overflow: hidden; text-overflow: ellipsis; max-width: 70px; }
.header-weather:focus-visible, .weather-panel button:focus-visible { outline: 2px solid #7c9b88; outline-offset: 3px; }
.weather-panel { font-size: 12px; line-height: 1.6; }
.weather-panel button { cursor: pointer; color: inherit; border: 1px solid #89928e66; background: transparent; padding: 3px 7px; border-radius: 5px; font: inherit; }
.weather-panel button:disabled { opacity: .55; cursor: default; }
.weather-title { display: flex; align-items: center; justify-content: space-between; }
.weather-now { font-size: 18px; margin: 9px 0; }
.weather-metrics { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.weather-forecast { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 12px 0; }
.weather-forecast > div { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 2px; background: #89928e12; border-radius: 6px; }
.weather-note { font-size: 10px; opacity: .7; margin: 6px 0; }
.weather-note a { color: inherit; }
.weather-search { margin: 12px 0 6px; }
.weather-search label { display: block; margin-bottom: 5px; }
.weather-search > div { display: flex; gap: 5px; }
.weather-search input { min-width: 0; flex: 1; padding: 5px 7px; border: 1px solid #89928e66; border-radius: 5px; background: transparent; color: inherit; font: inherit; }
.weather-results { list-style: none; margin: 5px 0 10px; padding: 0; max-height: 180px; overflow-y: auto; }
.weather-results button { width: 100%; margin: 2px 0; text-align: left; }
.weather-message { color: #b87837; margin: 6px 0; }
@media (max-width: 768px) { .weather-city, .weather-condition { display: none; } .header-weather { font-size: 11px; gap: 2px; } }
</style>
