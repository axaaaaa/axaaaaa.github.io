<template>
  <div class="header-wrapper" :class="{ 'dark-theme': currentTheme === 'dark' }">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      :class="{ 'dark-theme': currentTheme === 'dark' }"
      mode="horizontal"
      :ellipsis="false" 
    >
      <el-menu-item index="toggle-menu" @click="$emit('toggle-mobile-menu')" class="mobile-menu-toggle">
        <el-icon>
          <svg class="toolbar-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </el-icon>
      </el-menu-item>

      <el-menu-item index="home" @click="handleHome" class="home-menu-item" title="主页" aria-label="主页">
        <span class="home-pixel-icon" aria-hidden="true"></span>
      </el-menu-item>
      

    </el-menu>

    <div id="header-site-search" class="header-site-search"></div>




    <a class="header-contact" href="https://t.me/lslkenmq" target="_blank" rel="noopener noreferrer" aria-label="联系我（Telegram，新窗口打开）" title="联系我 · Telegram">
      <svg class="toolbar-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 3-6 18-4-8-8-4L21 3Z"/><path d="m11 13 10-10"/></svg>
    </a>

    <BookmarkSite />
    <el-dropdown class="header-tools" popper-class="site-tools-win95" trigger="click" placement="bottom-start" :max-height="420" @command="$emit($event)">
      <button type="button" class="header-tools-trigger" aria-label="工具菜单">
        <svg class="toolbar-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/></svg>
      </button>
      <template #dropdown><el-dropdown-menu>
        <el-dropdown-item command="open-fundamentals"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/></svg><span>计算机底层知识</span></el-dropdown-item>
        <el-dropdown-item command="open-ai-knowledge"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M9 12v2M15 12v2M12 4v3M8 19v2M16 19v2M2 11v4M22 11v4"/></svg><span>人工智能知识</span></el-dropdown-item>
        <el-dropdown-item command="open-hardware-tiers"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg><span>硬件天梯图</span></el-dropdown-item>
        <el-dropdown-item command="open-installation"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v12H4zM8 20h8M12 16v4M12 7v6M9 10l3 3 3-3"/></svg><span>系统安装</span></el-dropdown-item>
        <el-dropdown-item command="open-commands"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v14H4zM7 9l3 3-3 3M13 15h4"/></svg><span>命令速查</span></el-dropdown-item>
        <el-dropdown-item command="open-shortcuts"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18v12H3zM6 9h1M10 9h1M14 9h1M18 9h0M6 12h1M10 12h1M14 12h1M18 12h0M7 15h10"/></svg><span>快捷键速查</span></el-dropdown-item>
        <el-dropdown-item command="open-network"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6v5H9zM3 16h6v5H3zM15 16h6v5h-6zM12 8v4M6 16v-4h12v4"/></svg><span>网络知识速查</span></el-dropdown-item>
        <el-dropdown-item command="open-image-tools"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3zM3 16l6-6 5 5 3-3 4 4M15 7h1"/></svg><span>图片工具</span></el-dropdown-item>
        <el-dropdown-item command="open-text-tools"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16M12 5v15M8 20h8M4 5v3M20 5v3"/></svg><span>文字工具</span></el-dropdown-item>
        <el-dropdown-item command="open-tools"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 12v3h4v-3"/></svg><span>实用工具箱</span></el-dropdown-item>
        <el-dropdown-item command="open-system"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3h16v18H4zM7 7h10M7 11h10M8 17h1M15 17h1"/></svg><span>装机与系统工具</span></el-dropdown-item>
        <el-dropdown-item command="open-electricity"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 10-13h-8l1-7"/></svg><span>电学知识与用电工具</span></el-dropdown-item>
        <el-dropdown-item command="open-reverse"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4M9 9l-3 3 3 3M15 9l3 3-3 3M13 8l-2 8"/></svg><span>软件逆向分析手册</span></el-dropdown-item>
        <el-dropdown-item command="open-vulnerability"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 4-3 7-8 9-5-2-8-5-8-9V7zM12 8v5m0 3h.01"/></svg><span>漏洞手册大全</span></el-dropdown-item>
        <el-dropdown-item command="open-terminal"><svg class="site-tool-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18v16H3zM6 8l4 4-4 4M13 16h5"/></svg><span>Linux 终端练习室</span></el-dropdown-item>
      </el-dropdown-menu></template>
    </el-dropdown>

    <div v-if="!isMobile" class="header-status">
      <HeaderWeather :dark="currentTheme === 'dark'" :auto-location="weatherLocation" />
      <div class="clock-and-fingerprint">
        <FlipClock :dark="currentTheme === 'dark'" />
      </div>
    </div>
    <PersonalGreeting />
    <LocalMusicPlayer ref="localMusic" @request-play="$refs.headerRadio?.stop()" />
    <HeaderRadio ref="headerRadio" @request-play="$refs.localMusic?.pauseLocal()" />
    <button
      type="button"
      class="header-theme-toggle"
      :class="{ 'is-dark': currentTheme === 'dark' }"
      role="switch"
      :aria-checked="currentTheme === 'dark'"
      :aria-label="currentTheme === 'dark' ? '切换浅色模式' : '切换暗黑模式'"
      :title="currentTheme === 'dark' ? '切换浅色模式' : '切换暗黑模式'"
      @click="$emit('toggle-theme', $event)"
    >
      <span class="theme-toggle-thumb" aria-hidden="true"></span>
      <el-icon class="theme-toggle-icon theme-toggle-sun" aria-hidden="true"><Sunny /></el-icon>
      <el-icon class="theme-toggle-icon theme-toggle-moon" aria-hidden="true"><Moon /></el-icon>
    </button>
  </div>
</template>

<script>
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import 'element-plus/es/components/dropdown/style/css.mjs';
import 'element-plus/es/components/dropdown-menu/style/css.mjs';
import 'element-plus/es/components/dropdown-item/style/css.mjs';
import BookmarkSite from './BookmarkSite.vue';
import PersonalGreeting from './PersonalGreeting.vue';
import HeaderRadio from './HeaderRadio.vue';
import LocalMusicPlayer from './LocalMusicPlayer.vue';
import { createInteractionSounds } from '../utils/interaction-sounds.mjs';
import HeaderWeather from "./HeaderWeather.vue";
import FlipClock from "./FlipClock.vue";
import { Sunny, Moon } from '@element-plus/icons-vue'

export default {
  name: 'NavigationHeader',
  components: { ElDropdown, ElDropdownMenu, ElDropdownItem, BookmarkSite, HeaderRadio, PersonalGreeting, LocalMusicPlayer, HeaderWeather, FlipClock, Sunny, Moon },

  props: {
    activeIndex: { type: String, default: '' },
    currentTheme: { type: String, required: true },
    weatherLocation: { type: Object, default: null }
  },

  emits: ['toggle-theme', 'toggle-mobile-menu', 'open-fundamentals', 'open-ai-knowledge', 'open-hardware-tiers', 'open-installation', 'open-commands', 'open-shortcuts', 'open-network', 'open-image-tools', 'open-text-tools', 'open-tools', 'open-system', 'open-electricity', 'open-reverse', 'open-vulnerability', 'open-terminal'],

  data() {
    return {
      isMobile: window.innerWidth <= 768,
      resizeTimer: null
    }
  },

  mounted() {
    this.soundController = createInteractionSounds();
    this.checkIfMobile();
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    this.soundController?.dispose();
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  },

  methods: {
    handleResize() {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.checkIfMobile();
      }, 100);
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    handleHome() {
      window.location.href = '/';
    },


  }
}
</script>

<style>
/* 暗黑风格下拉菜单 - 黑客帝国绿 */
.dark-dropdown.el-popper {
  background-color: rgba(10, 10, 10, 0.95) !important; 
  border: 1px solid rgba(0, 255, 65, 0.3) !important;             
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.2) !important;
}
.dark-dropdown.el-popper .el-popper__arrow::before {
  background-color: #0a0a0a !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
}
.dark-dropdown .el-select-dropdown__item {
  color: var(--dark-text-secondary) !important; 
  font-family: monospace;
}
.dark-dropdown .el-select-dropdown__item.selected,
.dark-dropdown .el-select-dropdown__item.hover,
.dark-dropdown .el-select-dropdown__item:hover {
  background-color: rgba(0, 255, 65, 0.1) !important;
  color: var(--dark-text-primary) !important; 
  font-weight: bold;
}
.search-engine-brand-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  object-fit: contain;
  vertical-align: middle;
}
.search-engine-option-icon { margin-right: 8px; }
@media (max-width: 768px) {
  .header-theme-toggle { width: 68px; flex-basis: 68px; flex-shrink: 0; }
  .header-theme-toggle.is-dark .theme-toggle-thumb { transform: translateX(32px); }
}
@media (max-width: 768px) { .header-status { display: none; } }
</style>

<style scoped>
/* =================== 基础样式 =================== */
.header-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  height: 50px;
  padding: 0 10px;
}

.el-menu-demo {
  background: transparent !important;
  border-bottom: none !important;
  height: 50px;
  flex-shrink: 0;
  margin-left: 0;
}

.el-menu-item {
  border-bottom: none !important;
  height: 50px;
  line-height: 50px;
}

/* ================== 搜索组件样式 ================== */
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0;
  order: 0;
}

.search-engine-select {
  width: 120px !important;
}

.search-input {
  width: 200px;
}

.paste-button {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.paste-button:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.paste-button.dark-theme {
  background: rgba(10, 10, 10, 0.8);
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41);
}

.paste-button.dark-theme:hover {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
}

.clear-button {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #909399;
}

.clear-button:hover {
  background: #f56c6c;
  color: #fff;
  border-color: #f56c6c;
}

.clear-button.dark-theme {
  background: rgba(10, 10, 10, 0.8);
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41);
}

.clear-button.dark-theme:hover {
  background: rgba(0, 255, 65, 0.2);
  color: var(--dark-text-primary);
  border-color: #00ff41;
}

/* 放大清除按钮图标 */
.clear-button {
  font-size: 18px;
}
.clear-button .el-icon {
  font-size: 18px;
}

/* ================== 暗黑模式 - 黑客帝国绿 ================== */
.dark-theme .el-menu-item {
  color: var(--dark-text-primary, #00ff41) !important;
}

.dark-theme .el-menu-item:hover,
.dark-theme .el-menu-item.is-active {
  background-color: rgba(0, 255, 65, 0.1) !important;
  color: var(--dark-text-link, #39ff14) !important;
}

/* Home stays an unfilled icon, including selected and hovered states. */
.header-wrapper .el-menu-demo .home-menu-item,
.header-wrapper .el-menu-demo .home-menu-item:hover,
.header-wrapper .el-menu-demo .home-menu-item:focus,
.header-wrapper .el-menu-demo .home-menu-item.is-active {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
.header-wrapper .el-menu-demo .home-menu-item:focus-visible {
  outline: 2px solid #7c9b88;
  outline-offset: -8px;
  border-radius: 50%;
}

.dark-theme.header-wrapper {
  background: #0a0a0a;
  border-bottom-color: rgba(0, 255, 65, 0.2);
}

.dark-theme .search-wrapper :deep(.el-input__wrapper),
.dark-theme .search-wrapper :deep(.el-select__wrapper) {
  background-color: rgba(10, 10, 10, 0.8) !important;
  box-shadow: none !important;
  border: 1px solid rgba(0, 255, 65, 0.3);
}

.dark-theme .search-wrapper :deep(.el-input__inner) {
  color: var(--dark-text-primary, #00ff41) !important;
}

.dark-theme .search-wrapper :deep(.el-input-group__append) {
  background-color: rgba(20, 20, 20, 0.8) !important;
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41) !important;
}

/* ================== 移动端菜单按钮 ================== */
.mobile-menu-toggle {
  display: block;
  cursor: pointer;
}

/* ================== 响应式适配 ================== */
@media (max-width: 768px) {
  .hidden-xs-only { display: none !important; }
  .mobile-menu-toggle { display: block; }
  .search-engine-select { width: 80px !important; }
  .header-wrapper { padding: 0 6px; gap: 4px; }
  .search-engine-select :deep(.el-select__selected-item:not(.el-select__placeholder)) { font-size: 0; }
  .el-menu-demo { width: 36px; flex: 0 0 36px; overflow: hidden; }
  .home-menu-item { display: none !important; }
  .el-menu-item { padding: 0 8px; }
  .search-wrapper { flex: 1 1 0; min-width: 0; gap: 4px; }
  .search-engine-select { flex: 0 0 44px; width: 44px !important; min-width: 44px !important; }
  .search-input { flex: 1 1 0; min-width: 0; width: 0; }
  .search-input :deep(.el-input__wrapper) { flex: 1 1 0; width: 0; min-width: 0; padding: 1px 6px; box-sizing: border-box; }
  .search-input :deep(.el-input__inner) { min-width: 0; }
  .search-input :deep(.el-input__suffix) { display: none; }
  .search-input :deep(.el-input-group__append) { flex: 0 0 30px; width: 30px; padding: 0; box-sizing: border-box; }
  .search-input :deep(.search-btn-append) { width: 30px; margin: 0; padding: 0; }
  .clear-button { flex: 0 0 26px; width: 26px; height: 26px; margin: 0; }
  .header-theme-toggle { margin-left: 0; }
}
</style>
<style scoped>
.header-theme-toggle {
  view-transition-name: theme-switch;
  position: relative;
  margin-left: 0;
  flex: 0 0 68px;
  width: 68px;
  height: 36px;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 999px;
  background: #e8ece9;
  color: #89928e;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 200ms ease;
}
.theme-toggle-thumb {
  view-transition-name: theme-thumb;
  position: absolute;
  top: 4px;
  left: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(36, 49, 42, 0.14);
  transition: transform 450ms cubic-bezier(.22,.8,.25,1), background-color 450ms ease;
}
.theme-toggle-icon {
  flex: 0 0 28px;
  z-index: 1;
  width: 28px;
  height: 28px;
  font-size: 18px;
  transition: color 200ms ease;
}
.theme-toggle-sun { color: #47544d; }
.header-theme-toggle.is-dark .theme-toggle-thumb { transform: translateX(32px); background: #48534d; }
.header-theme-toggle.is-dark { background: #29332d; color: #8b9890; }
.header-theme-toggle.is-dark .theme-toggle-sun { color: #8b9890; }
.header-theme-toggle.is-dark .theme-toggle-moon { color: #f0f4f1; }
.header-theme-toggle:hover { background: #dfe5e1; }
.header-theme-toggle.is-dark:hover { background: #344139; }
.header-theme-toggle:focus-visible { outline: 2px solid #7c9b88; outline-offset: 3px; }
@media (max-width: 768px) {
  .header-theme-toggle { width: 68px; flex-basis: 68px; flex-shrink: 0; }
  .header-theme-toggle.is-dark .theme-toggle-thumb { transform: translateX(32px); }
}
@media (prefers-reduced-motion: reduce) {
  .header-theme-toggle, .theme-toggle-thumb, .theme-toggle-icon { transition: none; }
}

</style>

<style scoped>
.header-status { display: flex; align-items: center; gap: 12px; margin-left: auto; min-width: 0; }
.header-status :deep(.flip-clock) { margin-left: 0; }
@media (max-width: 768px) { .header-status { gap: 5px; margin-left: 0; flex-shrink: 0; } }
</style>

<style scoped>
.clock-and-fingerprint { display: flex; flex-direction: column; align-items: center; flex: 0 0 auto; gap: 1px; margin-right: 10px; }
.clock-and-fingerprint :deep(.flip-clock) { margin: 0; }
@media (max-width: 768px) { .clock-and-fingerprint { margin-right: 0; } }
</style>

<style scoped>
.header-contact { display: inline-flex; align-items: center; justify-content: center; gap: 0; flex: 0 0 auto; width: 32px; margin-right: 12px; min-height: 32px; padding: 0; border-radius: 8px; color: #2588b9; text-decoration: none; white-space: nowrap; font-size: 12px; }
.header-contact:hover { background: rgba(37,136,185,.1); }
.header-contact:focus-visible { outline: 2px solid #2588b9; outline-offset: 2px; }
.dark-theme .header-contact { color: #79c8ed; }
@media (max-width: 768px) { .header-contact { width: 28px; margin-right: 6px; padding: 0; } .header-contact span { display: none; } }
</style>

<style scoped>
/* Shared toolbar tokens override the individual widget trigger styles, never their panels. */
.header-wrapper { --toolbar-icon-color: var(--ui-accent, #386a50); --toolbar-icon-hover: var(--ui-accent-soft, #edf4ef); }
.header-wrapper.dark-theme { --toolbar-icon-color: #94bca4; --toolbar-icon-hover: rgba(148,188,164,.12); }
.header-wrapper :deep(.header-contact), .header-wrapper :deep(.bookmark-site-button), .header-wrapper :deep(.header-music-button), .header-wrapper :deep(.radio-trigger) {
  display: inline-flex; align-items: center; justify-content: center; flex: 0 0 32px; width: 32px; height: 32px; min-height: 32px; padding: 6px; box-sizing: border-box; border: 0; border-radius: 8px; background: transparent; color: var(--toolbar-icon-color); cursor: pointer; line-height: 1;
}
.header-wrapper :deep(.header-contact:hover), .header-wrapper :deep(.bookmark-site-button:hover), .header-wrapper :deep(.header-music-button:hover), .header-wrapper :deep(.radio-trigger:hover) { background: var(--toolbar-icon-hover); }
.header-wrapper :deep(.header-contact:focus-visible), .header-wrapper :deep(.bookmark-site-button:focus-visible), .header-wrapper :deep(.header-music-button:focus-visible), .header-wrapper :deep(.radio-trigger:focus-visible) { outline: 2px solid var(--toolbar-icon-color); outline-offset: 2px; }
.toolbar-line-icon, .header-wrapper :deep(.header-contact > svg), .header-wrapper :deep(.bookmark-site-button > svg), .header-wrapper :deep(.header-music-button > svg), .header-wrapper :deep(.radio-trigger > svg) { display: block; width: 20px; height: 20px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.header-wrapper :deep(.home-menu-item), .header-wrapper :deep(.mobile-menu-toggle) { color: var(--toolbar-icon-color); }
.home-pixel-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex: none;
  background: currentColor;
  -webkit-mask: url("../assets/hackernoon-pixels/home.svg") center / contain no-repeat;
  mask: url("../assets/hackernoon-pixels/home.svg") center / contain no-repeat;
}
.header-wrapper :deep(.home-menu-item:hover), .header-wrapper :deep(.mobile-menu-toggle:hover) { background: var(--toolbar-icon-hover); }
@media(max-width:768px) {
 .header-wrapper :deep(.header-contact), .header-wrapper :deep(.bookmark-site-button), .header-wrapper :deep(.header-music-button), .header-wrapper :deep(.radio-trigger) { flex-basis: 26px; width: 26px; height: 30px; min-height: 30px; padding: 4px; }
 .toolbar-line-icon, .header-wrapper :deep(.header-contact > svg), .header-wrapper :deep(.bookmark-site-button > svg), .header-wrapper :deep(.header-music-button > svg), .header-wrapper :deep(.radio-trigger > svg) { width: 18px; height: 18px; }
}
</style>

<style scoped>
@media(max-width:768px){.header-theme-toggle{margin-left:auto}}
</style>

<style scoped>
.header-tools{flex-shrink:0;margin:0 6px}
.header-tools-trigger{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:var(--toolbar-icon-color,#386a50);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}
.header-tools-trigger:hover{background:var(--toolbar-icon-hover,#edf4ef)}
.header-tools-trigger:focus-visible{outline:2px solid var(--toolbar-icon-color,#386a50);outline-offset:2px}
.header-tools-trigger svg{width:17px;height:17px}
@media(max-width:768px){.header-tools{margin:0 2px}.header-tools-trigger{gap:3px;padding:0 5px;font-size:11px}.header-tools-trigger svg{width:15px;height:15px}}
</style>
<style>
.site-tools-win95.el-popper {
  --el-bg-color-overlay: #c0c0c0;
  --el-text-color-primary: #151515;
  --el-border-color: #c0c0c0;
  --ui-accent: #fff;
  --ui-accent-soft: #000080;
  padding: 2px;
  border: 0;
  border-radius: 0;
  background: #c0c0c0;
  box-shadow: inset 1px 1px #fff, inset 2px 2px #dfdfdf, inset -1px -1px #111, inset -2px -2px #808080;
}
.site-tools-win95 .el-popper__arrow { display: none; }
.site-tools-win95 .el-dropdown-menu {
  margin: 0;
  padding: 2px;
  border: 0;
  border-radius: 0;
  background: #c0c0c0;
  font-family: "Microsoft Sans Serif", Tahoma, "Microsoft YaHei", sans-serif;
}
.site-tools-win95 .el-dropdown-menu__item {
  min-height: 28px;
  padding: 4px 14px 4px 8px;
  color: #151515;
  font-size: 13px;
  line-height: 20px;
  border-radius: 0;
}
.site-tools-win95 .el-dropdown-menu__item:not(.is-disabled):is(:hover,:focus,.is-hovering) {
  color: #fff;
  background: #000080;
}
body.dark .site-tools-win95 .el-dropdown-menu__item:not(.is-disabled):is(:focus-visible,.is-hovering) {
  color: #fff !important;
  background: #000080 !important;
}
.site-tools-win95 .el-dropdown-menu__item:focus-visible { outline: 1px dotted #fff; outline-offset: -2px; }
</style>

<style>
/* ===== 站内搜索：由 NavigationLinks 通过 Teleport 传送到顶部导航条 ===== */
.header-wrapper .header-site-search { display: flex; align-items: center; flex: 0 1 260px; min-width: 150px; margin: 0 10px; }
.header-wrapper .header-site-search:empty { display: none; }
.header-wrapper .header-site-search .unified-search-control { flex: 1 1 auto; min-width: 0; height: 34px; padding: 0 2px 0 0; border-radius: 9px; }
.header-wrapper .header-site-search .search-input { flex: 1 1 0; width: 0; min-width: 0; }
.header-wrapper .header-site-search .search-input .el-input__wrapper { height: 32px; padding: 0 6px; border-radius: 9px 0 0 9px; background: transparent !important; box-shadow: none !important; }
#app .navigation-container .header-wrapper .header-site-search .search-input .el-input__wrapper { padding: 0 6px !important; border-radius: 9px 0 0 9px !important; box-shadow: none !important; background: transparent !important; }
.header-wrapper .header-site-search .search-input .el-input__inner { font-size: 12px; }
.header-wrapper .header-site-search .site-search-icon { font-size: 14px; color: #8a94a6; }
.header-wrapper .header-site-search .search-planet-motion { display: none; }
.header-wrapper .header-site-search .paste-btn { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 26px; width: 26px; min-width: 26px; height: 28px; margin: 0; padding: 0; border: 0; border-left: 1px solid #e5e9f0; border-radius: 0 7px 7px 0; background: transparent; color: #65718a; }
#app .navigation-container .header-wrapper .header-site-search .paste-btn { border-radius: 0 7px 7px 0 !important; background: transparent !important; border-left: 1px solid #e5e9f0 !important; }
#app .navigation-container .header-wrapper .header-site-search .paste-btn:hover { background: #edf2ff !important; color: #4979d3; }
.header-wrapper.dark-theme .header-site-search .unified-search-control { background: #0b140e; border-color: #344b3d; }
.header-wrapper.dark-theme .header-site-search .search-input .el-input__inner { color: var(--dark-text-primary, #d7e6dc); }
.header-wrapper.dark-theme .header-site-search .site-search-icon { color: #8aa895; }
.header-wrapper.dark-theme .header-site-search .paste-btn { color: var(--dark-text-secondary, #9db8a7); border-left-color: #354451; }
#app .navigation-container .header-wrapper.dark-theme .header-site-search .paste-btn { background: transparent !important; border-left: 1px solid #354451 !important; border-radius: 0 7px 7px 0 !important; }
#app .navigation-container .header-wrapper.dark-theme .header-site-search .paste-btn:hover { background: #14251b !important; color: #d7e6dc; }
@media (max-width: 1299px) { .header-wrapper .header-site-search { display: none; } }
/* 导航条横向紧张时先收起日期文字（时间仍由翻页时钟给出），给站内搜索让出空间 */
@media (min-width: 1300px) and (max-width: 1499px) { .header-wrapper .header-status .clock-date { display: none; } }</style>

<style>
.site-tool-item-icon{display:block;flex:0 0 18px;width:18px;height:18px;margin-right:9px;color:inherit;opacity:.85}
</style>

