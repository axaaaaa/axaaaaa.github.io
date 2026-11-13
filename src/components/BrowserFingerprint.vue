<template>
  <section class="browser-fingerprint" :class="{ 'is-dark': dark }" aria-label="浏览器环境信息">
    <div class="fingerprint-heading">
      <span class="fingerprint-heading-label"><CategoryPixelBadge name="科技与数码" /><span>浏览器环境 <small>环境本地检测 · IP 联网查询</small></span></span>
      <div class="fingerprint-actions">
      <button type="button" :aria-expanded="allExpanded" @click="toggleAllGroups">{{ allExpanded ? '全部收起' : '全部展开' }}</button>
      <button type="button" :disabled="loading" @click="inspect"><span class="environment-emoji" aria-hidden="true">🔄</span>{{ loading ? '检测中…' : '重新检测' }}</button>
      </div>
    </div>
    <p v-if="error" role="status">暂未读取到环境信息，请重新检测。</p>
    <article v-if="report" class="environment-story" aria-labelledby="environment-story-title">
      <span class="environment-story-badge">{{report.count}} 项环境信息 · 本地检测概览</span>
      <h3 id="environment-story-title">网站眼中的你</h3>
      <p v-for="(paragraph,index) in environmentStory" :key="index"><template v-for="(part,n) in paragraph" :key="n"><mark v-if="part.highlight">{{part.text}}</mark><template v-else>{{part.text}}</template></template></p>
      <small>这些是浏览器报告的环境线索，不代表你的真实身份或精确位置。IP 地区需联网查询；浏览器指纹也不等于身份识别。</small>
    </article>
    <div class="fingerprint-grid" aria-label="浏览器环境详情">
      <details class="fingerprint-group fingerprint-ip-group" :open="isGroupOpen('ip')" @toggle="syncGroup('ip', $event)">
        <summary class="fingerprint-group-heading"><span class="environment-emoji" aria-hidden="true">🌍</span>IP 检测</summary>
        <IpLocation ref="storyIpLocation" :dark="dark" panel @located="$emit('located', $event)" />
      </details>
      <details v-for="group in standardGroups" :key="group.name" class="fingerprint-group" :open="isGroupOpen(group.name)" @toggle="syncGroup(group.name, $event)">
        <summary class="fingerprint-group-heading"><span class="environment-emoji" aria-hidden="true">{{ group.icon }}</span>{{ group.name }}</summary>
        <dl>
          <div v-for="field in group.fields" :key="field.name" class="fingerprint-field">
            <dt><span class="environment-emoji" aria-hidden="true">{{ field.icon }}</span>{{ field.name }}</dt>
            <dd>
              <details v-if="isLongValue(field.value)" class="fingerprint-long-value">
                <summary>
                  <span class="fingerprint-value-preview">{{ field.value }}</span>
                  <span class="value-expand">展开全文</span><span class="value-collapse">收起</span>
                </summary>
                <div class="fingerprint-value-full">{{ field.value }}</div>
              </details>
              <span v-else>{{ field.value }}</span>
            </dd>
          </div>
        </dl>
      </details>
      <div class="fingerprint-render-egress-pair" :class="{ 'single-panel': !webglGroup }">
      <details v-if="webglGroup" class="fingerprint-group" :open="isGroupOpen(webglGroup.name)" @toggle="syncGroup(webglGroup.name, $event)">
        <summary class="fingerprint-group-heading"><span class="environment-emoji" aria-hidden="true">{{ webglGroup.icon }}</span>{{ webglGroup.name }}</summary>
        <dl>
          <div v-for="field in webglGroup.fields" :key="field.name" class="fingerprint-field">
            <dt><span class="environment-emoji" aria-hidden="true">{{ field.icon }}</span>{{ field.name }}</dt>
            <dd>
              <details v-if="isLongValue(field.value)" class="fingerprint-long-value">
                <summary>
                  <span class="fingerprint-value-preview">{{ field.value }}</span>
                  <span class="value-expand">展开全文</span><span class="value-collapse">收起</span>
                </summary>
                <div class="fingerprint-value-full">{{ field.value }}</div>
              </details>
              <span v-else>{{ field.value }}</span>
            </dd>
          </div>
        </dl>
      </details>
        <details class="fingerprint-group fingerprint-egress-group" :open="isGroupOpen('egress')" @toggle="syncGroup('egress', $event)">
          <summary class="fingerprint-group-heading"><span class="environment-emoji" aria-hidden="true">📤</span>网络出口</summary>
          <NetworkExit :dark="dark" compact />
        </details>
      </div>
    </div>
    <p v-if="!report && loading" role="status">正在读取浏览器、屏幕与图形环境…</p>
  </section>
</template>
<script>
import NetworkExit from './NetworkExit.vue'
import IpLocation from './IpLocation.vue'
import CategoryPixelBadge from './CategoryPixelBadge.vue'
import { inspectFingerprint } from '../fingerprint-inspector'
const groupEmojis = {"浏览器与系统": "🌐", "浏览器详细版本": "🏷️", "屏幕与显示": "🖥️", "硬件与能力": "⚙️", "区域与网络提示": "📡", "Canvas 指纹": "🎨", "WebGL 渲染": "🎮"}
const fieldEmojis = {"User Agent": "🪪", "平台": "💻", "语言": "🗣️", "语言列表": "🌐", "Cookie": "🍪", "在线状态": "📶", "自动化标记": "🤖", "Do Not Track": "🛡️", "品牌": "🏷️", "移动设备": "📱", "平台提示": "💻", "浏览器名称": "🌐", "浏览器版本": "🔢", "版本来源": "📋", "系统名称": "💻", "系统版本（平台报告值）": "🔢", "CPU架构": "🧩", "架构位数": "🔢", "设备型号": "📱", "32位浏览器运行于64位Windows": "🔄", "完整版本列表": "📚", "屏幕尺寸": "🖥️", "可用区域": "📐", "窗口视口": "🪟", "像素比": "🔍", "色深": "🎨", "像素深度": "🎨", "屏幕方向": "🔄", "配色偏好": "🌓", "减少动画": "🧘", "HDR 查询": "✨", "逻辑处理器": "⚙️", "设备内存（近似 GB）": "💾", "最大触摸点": "👆", "触摸事件": "👆", "PDF查看器": "📄", "WebAssembly": "🧩", "WebRTC": "📹", "安全上下文": "🔒", "时区": "🌍", "UTC 偏移（分钟）": "🕒", "数字格式示例": "🔢", "连接类型": "📡", "下行估计 Mbps": "⬇️", "往返估计 ms": "⏱️", "节省流量": "🍃", "绘制检测": "🖌️", "绘制样本": "🖼️", "Canvas SHA-256": "🖌️", "厂商": "🏢", "渲染器": "🎮", "版本": "🔢", "着色语言": "🎨", "最大纹理尺寸": "📐", "扩展列表": "🧩", "状态": "📋"}
export default {
  name: 'BrowserFingerprint',
  components: { IpLocation, NetworkExit, CategoryPixelBadge },
  emits: ['located'],
  props: { dark: { type: Boolean, default: false } },
  data() { return { loading: false, report: null, disposed: false, error: false, defaultExpanded: false, groupExpanded: {} } },
  computed: {
    environmentStory() {
      const data = this.report?.data || {};
      const browser = data['浏览器与系统'] || {}, version = data['浏览器详细版本'] || {};
      const screen = data['屏幕与显示'] || {}, region = data['区域与网络提示'] || {}, gpu = data['WebGL 渲染'] || {};
      const ip = this.$refs.storyIpLocation;
      const value = v => v === undefined || v === null || v === '' ? '暂未读取' : String(v);
      const text = text => ({text,highlight:false}), mark = v => ({text:value(v),highlight:true});
      const language = browser['语言'];
      const zone = region['时区'];
      const simplified = /^zh(?:-(?:CN|SG|Hans)(?:-|$))/i.test(language || '');
      const traditional = /^zh(?:-(?:TW|HK|MO|Hant)(?:-|$))/i.test(language || '');
      let languageLabel = language;
      if (simplified) languageLabel = '简体中文';
      else if (traditional) languageLabel = '繁体中文';
      else if (language) { try { languageLabel = new Intl.DisplayNames(['zh-CN'], {type:'language'}).of(language); } catch { /* retain reported locale */ } }
      const beijingTime = ['Asia/Shanghai','Asia/Chongqing','Asia/Harbin','Asia/Chungking','PRC'].includes(zone);
      const habit = language && zone ? [text('你大概是一位'),mark(`习惯使用${languageLabel}、按${beijingTime ? '北京时间' : zone+'时区'}生活的用户`),text('。')] : [text('你的语言与时区信息还不完整，暂时先展示已读取到的环境线索。')];
      if (ip?.region) {
        habit.push(text('你的网络出口位于 '),mark(ip.region),text('。'));
        if (simplified && beijingTime) habit.push(text('你的语言和时区设置体现出'),mark('中国大陆地区常见的使用习惯'),text('。'));
      } else habit.push(text('网络出口地区正在查询或暂未获取。'));
      return [
        habit,
        [text('你正通过 '),mark([version['浏览器名称'],version['浏览器版本']].filter(Boolean).join(' ')),text(' 浏览网页，系统报告为 '),mark(version['系统名称'] || browser['平台']),text('。'),...(version['设备型号'] && version['设备型号'] !== '未提供' ? [text('设备型号提示为 '),mark(version['设备型号']),text('。')] : [])],
        [text('屏幕尺寸是 '),mark(screen['屏幕尺寸']),text('，当前窗口为 '),mark(screen['窗口视口']),text('，像素比为 '),mark(screen['像素比']),text('。图形渲染器报告为 '),mark(gpu['渲染器'] || gpu['状态']),text('。')],
        [text('当前查询到的 IP 地区为 '),mark(ip?.region || '查询中或暂未获取'),text('，网络组织信息为 '),mark(ip?.ipDetails?.operator || '暂未获取'),text('。IP 地区是网络出口的参考位置，不等于你所在的位置。')],
        [text('你偏好 '),mark(screen['配色偏好'] ? screen['配色偏好']+'模式' : undefined),text('，浏览器 '),mark(browser['Cookie'] === true ? '允许 Cookie' : browser['Cookie'] === false ? '禁用 Cookie' : '未报告 Cookie 状态'),text('。即使清除 Cookie 或使用无痕模式，部分环境特征仍可被读取；这不意味着网站一定能认出你。')]
      ];
    },
    groupKeys() { return ['ip', 'egress', ...this.visibleGroups.map(group => group.name)] },
    allExpanded() { return this.groupKeys.every(key => this.isGroupOpen(key)) },
    standardGroups() { return this.visibleGroups.filter(group => group.name !== 'WebGL 渲染') },
    webglGroup() { return this.visibleGroups.find(group => group.name === 'WebGL 渲染') || null },
    visibleGroups() {
      if (!this.report) return []
      return Object.entries(this.report.data).map(([name, fields]) => ({
        name, icon: groupEmojis[name] || '🧩',
        fields: Object.entries(fields).map(([key, value]) => {
          if (key === 'Canvas SHA-256') {
            return { name: '绘制检测', icon: fieldEmojis[key], value: /^[a-f0-9]{64}$/.test(value) ? '已完成 Canvas 绘制检测' : String(value) }
          }
          return { name: key, icon: fieldEmojis[key] || '🔹', value: typeof value === 'boolean' ? (value ? '是' : '否') : String(value ?? '未提供') }
        })
      }))
    }
  },
  mounted() { this.inspect() },
  beforeUnmount() { this.disposed = true },
  methods: {
    isGroupOpen(key) { return this.groupExpanded[key] ?? this.defaultExpanded },
    syncGroup(key, event) { const open = event.target.open; if (this.isGroupOpen(key) !== open) this.groupExpanded[key] = open },
    toggleAllGroups() { this.defaultExpanded = !this.allExpanded; this.groupExpanded = {} },
    isLongValue(value) { return String(value).length > 60 || String(value).includes('\n') },
    async inspect() {
      if (this.loading || this.disposed) return
      this.loading = true
      this.error = false
      try {
        const report = await inspectFingerprint()
        if (!this.disposed) this.report = report
      } catch {
        if (!this.disposed) this.error = true
      } finally {
        if (!this.disposed) this.loading = false
      }
    }
  }
}
</script>
<style scoped>
.browser-fingerprint { --fp-line: #e5e9ee; --fp-muted: #78838f; --fp-bg: #f7f9fb; color: #354252; width: 100%; min-width: 0; padding: 12px 0; text-align: left; }
.browser-fingerprint.is-dark { --fp-line: #253b2d; --fp-muted: var(--dark-text-muted, #8ca995); --fp-bg: #101b14; color: var(--dark-text-primary, #b0d4ba); }
.fingerprint-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
.fingerprint-heading-label { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.fingerprint-heading small { font-size: 11px; font-weight: 400; color: var(--fp-muted); margin-left: 8px; }
.fingerprint-heading button { border: 1px solid var(--fp-line); border-radius: 5px; background: var(--fp-bg); color: inherit; padding: 4px 10px; cursor: pointer; font-size: 11px; }
.fingerprint-heading button:disabled { cursor: wait; opacity: .6; }
.fingerprint-heading button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.fingerprint-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: start; }
.fingerprint-group { min-width: 0; background: var(--fp-bg); border: 1px solid var(--fp-line); border-radius: 8px; padding: 10px 12px; }
.fingerprint-group-heading { cursor: pointer; font-weight: 600; font-size: 14px; }
.fingerprint-group[open] > .fingerprint-group-heading { margin-bottom: 6px; }
dl { margin: 0; }
.fingerprint-field { display: grid; grid-template-columns: minmax(70px, 34%) minmax(0, 1fr); gap: 8px; padding: 4px 0; border-top: 1px solid var(--fp-line); font-size: 11px; line-height: 1.5; }
dt { color: var(--fp-muted); overflow-wrap: anywhere; }
dd { margin: 0; overflow-wrap: anywhere; white-space: normal; }
p { color: var(--fp-muted); font-size: 12px; }
@media (max-width: 1100px) { .fingerprint-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .fingerprint-grid { grid-template-columns: minmax(0, 1fr); } }
.fingerprint-actions { display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
@media (max-width: 600px) { .fingerprint-heading { flex-wrap: wrap; } }
</style>

<style scoped>
.browser-fingerprint { padding: 0; }
.fingerprint-heading { gap: 5px; margin-bottom: 4px; font-size: 16px; }
.fingerprint-heading small { font-size: 12px; margin-left: 6px; }
.fingerprint-heading button { padding: 4px 8px; font-size: 12px; }
.fingerprint-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 8px; align-items: stretch; max-height: none; overflow: visible; }
.fingerprint-group { padding: 5px 6px; border-radius: 5px; }
summary:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.fingerprint-long-value > summary { cursor: pointer; list-style: none; }
.fingerprint-long-value > summary::-webkit-details-marker { display: none; }
.fingerprint-value-preview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.value-expand, .value-collapse { display: block; color: inherit; font-size: 12px; text-decoration: underline; margin-top: 2px; }
.value-collapse { display: none; }
.fingerprint-long-value[open] .fingerprint-value-preview, .fingerprint-long-value[open] .value-expand { display: none; }
.fingerprint-long-value[open] .value-collapse { display: block; }
.fingerprint-value-full { margin-top: 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
.fingerprint-field { grid-template-columns: minmax(45px, 38%) minmax(0, 1fr); gap: 6px; padding: 4px 0; font-size: 13px; line-height: 1.5; }
p { margin: 4px 0; font-size: 13px; }
</style>

<style scoped>
.environment-emoji { display: inline-block; margin-right: 4px; font-size: .95em; line-height: 1; }
</style>

<style scoped>
.fingerprint-render-egress-pair { grid-column: span 2; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; min-width: 0; align-items: stretch; }
.fingerprint-render-egress-pair.single-panel { grid-column: auto; grid-template-columns: minmax(0, 1fr); }
@media (max-width: 600px) { .fingerprint-render-egress-pair { grid-column: 1 / -1; grid-template-columns: minmax(0, 1fr); } }
</style>

<style scoped>
.environment-story{margin:0 0 14px;padding:20px 24px;border:1px solid var(--fp-line);border-radius:12px;background:var(--fp-bg);max-width:100%;box-sizing:border-box}
.environment-story-badge{display:inline-block;padding:4px 9px;border-radius:20px;background:rgba(124,166,49,.13);color:#557c20;font-size:11px}
.environment-story h3{font-size:21px;line-height:1.4;margin:12px 0 14px;color:inherit}
.environment-story p{font-size:14px;line-height:2;margin:0 0 12px;color:var(--fp-muted);overflow-wrap:anywhere}
.environment-story mark{padding:0 3px;border-radius:3px;background:rgba(132,168,59,.18);color:inherit;font-weight:600;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.environment-story small{display:block;font-size:11px;line-height:1.8;color:var(--fp-muted)}
.is-dark .environment-story-badge{color:#a8ce61}.is-dark .environment-story mark{color:#d3e5be;background:rgba(132,168,59,.24)}
@media(max-width:700px){.environment-story{padding:16px}.environment-story p{font-size:13px}}
</style>
