<template>
  <div class="navigation-container" :class="{ 'dark-theme': currentTheme === 'dark' }">
  
    <SideNavigation 
      :is-dark-theme="currentTheme === 'dark'"
      :isCollapsed="isSidebarCollapsed"
      :isMobileMenuVisible="isMobileMenuVisible"
      @collapse-all="collapseAllContent"
      @category-selected="scrollToCategory"
      @sub-category-selected="scrollToSubCategory"
      @update:isCollapsed="isSidebarCollapsed = $event"
      @update:isMobileMenuVisible="isMobileMenuVisible = $event"
    />
    
    <div 
      class="main-content" 
      ref="scrollContainer"
      :class="{ 'menu-visible': isMenuVisible, 'dark-theme': currentTheme === 'dark' }" 
      :style="{ 'margin-left': isSidebarCollapsed ? '64px' : '280px' }"
    >
      <NavigationHeader
        ref="navHeader"
        class="navigation-header"
        :weather-location="weatherLocation"
        :active-index="activeIndex"
        :current-theme="currentTheme"
      @open-commands="scrollToCommands"
      @open-shortcuts="scrollToShortcuts"
      @open-network="scrollToNetworkReference"
        @open-fundamentals="scrollToComputerFundamentals"
      @open-installation="scrollToSystemInstallation"
      @open-tools="scrollToUtilityTools" @open-image-tools="scrollToToolModule('imageTools','image-tools')" @open-text-tools="scrollToToolModule('textTools','text-tools')"
        @open-system="scrollToSystemTools"
      @open-electricity="scrollToElectricity"
      @open-reverse="scrollToReverseHandbook"
      @open-vulnerability="scrollToVulnerabilityHandbook"
      @open-terminal="scrollToLinuxTerminal"
        @toggle-theme="toggleTheme"
        @toggle-mobile-menu="toggleSidebar"
      />

      <NavigationLinks
        ref="navLinks"
        @located="weatherLocation = $event"
        :categories="categories"
        :current-theme="currentTheme"
      />

      <div class="module-collapse-bar"><button type="button" class="collapse-all-modules" @click="collapseAllContent"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m7 8 5-5 5 5M7 16l5 5 5-5M4 12h16"/></svg>全部收缩</button><span>收起各模块内容，保留输入与收藏</span></div>
      <CryptoPlayground ref="cryptoPlayground" />
      <CommandLibrary ref="commandLibrary" />
      <ShortcutLibrary ref="shortcutLibrary" />
      <NetworkReference ref="networkReference" />
        <ComputerFundamentals ref="computerFundamentals" />
      <SystemInstallation ref="systemInstallation" />
      <UtilityToolbox ref="imageTools" group="image" />
      <UtilityToolbox ref="textTools" group="text" />
      <UtilityToolbox ref="utilityToolbox" />
        <SystemTools ref="systemTools" />
        <ElectricityLibrary ref="electricityLibrary" />
        <ReverseHandbook ref="reverseHandbook" />
        <VulnerabilityHandbook ref="vulnerabilityHandbook" />
        <LinuxTerminal ref="linuxTerminal" />

      <NavigationFooter 
        ref="footer"
        :current-theme="currentTheme"
      />


      <el-dialog
        v-model="randomDialogVisible"
        title="🎲 随机发现"
        width="420px"
        :destroy-on-close="true"
        :class="{ 'dark-dialog': currentTheme === 'dark' }"
        class="random-discover-dialog"
      >
        <div v-if="randomLink" class="random-discover-content" :class="{ 'dark-theme': currentTheme === 'dark' }">
          <div class="random-favicon-row">
            <img
              v-if="randomFavicon"
              :src="randomFavicon"
              class="random-favicon"
              @error="randomFavicon = ''"
            />
            <div v-else class="random-favicon-placeholder">{{ randomLink.name.charAt(0) }}</div>
            <div class="random-info">
              <h3 class="random-name">{{ randomLink.name }}</h3>
              <span class="random-category">{{ randomCategoryName }}</span>
            </div>
          </div>
          <p class="random-desc">{{ randomLink.description || '暂无描述' }}</p>
          <div class="random-tags" v-if="randomLink.tags && randomLink.tags.length">
            <el-tag v-for="tag in randomLink.tags" :key="tag" size="small" :type="getRandomTagType(tag)" effect="plain">{{ tag }}</el-tag>
          </div>
          <div class="random-actions">
            <a :href="randomLink.url" target="_blank" rel="noopener noreferrer" class="random-visit-btn">
              访问网站
            </a>
            <el-button class="random-refresh-btn" @click="pickRandomLink">
              换一个
            </el-button>
          </div>
        </div>
      </el-dialog>


      <div class="floating-tools">
        <CommandPalette @action="handlePaletteAction" />
        <transition name="fade">
          <div
            class="tool-btn"
            :class="{ 'dark-theme': currentTheme === 'dark' }"
            @click="openRandomDiscover"
            title="随机发现"
          >
            🎲
          </div>
        </transition>

        <transition name="fade">
          <div 
            v-show="showBackToTop" 
            class="tool-btn" 
            :class="{ 'dark-theme': currentTheme === 'dark' }"
            @click="scrollToTop"
            title="返回顶部"
          >
            <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
              <path d="M512 320L192 640h640z" />
            </svg>
          </div>
        </transition>

        <transition name="fade">
          <div 
            v-show="showGoToBottom" 
            class="tool-btn" 
            :class="{ 'dark-theme': currentTheme === 'dark' }"
            @click="scrollToBottom"
            title="前往底部"
          >
            <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
              <path d="M512 704L832 384H192z" />
            </svg>
          </div>
        </transition>

      </div>

    </div>
  </div>
</template>

<script>
import CryptoPlayground from './CryptoPlayground.vue';
import CommandPalette from './CommandPalette.vue';


import { nextTick, defineAsyncComponent } from 'vue';
import { revealTheme } from '../utils/theme-ripple.mjs';
import { navData } from "../nav-data.js"
import NavigationHeader from './NavigationHeader.vue'
import NavigationLinks from './NavigationLinks.vue'
import NavigationFooter from './NavigationFooter.vue'
import SideNavigation from './SideNavigation.vue'



export default {
  name: 'MainNavigation',
  components: { CryptoPlayground, CommandPalette,
    LinuxTerminal: defineAsyncComponent(() => import('./LinuxTerminal.vue')),
    ReverseHandbook: defineAsyncComponent(() => import('./ReverseHandbook.vue')),
    VulnerabilityHandbook: defineAsyncComponent(() => import('./VulnerabilityHandbook.vue')),
    ElectricityLibrary: defineAsyncComponent(() => import('./ElectricityLibrary.vue')),
    SystemTools: defineAsyncComponent(() => import('./SystemTools.vue')),
    UtilityToolbox: defineAsyncComponent(() => import('./UtilityToolbox.vue')),
    SystemInstallation: defineAsyncComponent(() => import('./SystemInstallation.vue')),
    ComputerFundamentals: defineAsyncComponent(() => import('./ComputerFundamentals.vue')),
      NetworkReference: defineAsyncComponent(() => import('./NetworkReference.vue')),
    ShortcutLibrary: defineAsyncComponent(() => import('./ShortcutLibrary.vue')),
    CommandLibrary: defineAsyncComponent(() => import('./CommandLibrary.vue')),
    NavigationHeader,
    NavigationLinks,
    NavigationFooter,
    SideNavigation,
   
  },

  data() {
    return {
      weatherLocation: null,
      activeIndex: 'home',
      isMenuVisible: false,
      randomDialogVisible: false,
      randomLink: null,
      randomCategoryName: '',
      randomFavicon: '',
      
      isSidebarCollapsed: false,
    isMobileMenuVisible: false,
      currentTheme: localStorage.getItem('theme') || 'light',
      themeTransitioning: false,
      selectedCategory: '',
      categories: navData,
      // 按钮显示状态
      showBackToTop: false, 
      showGoToBottom: true, // 默认显示底部按钮
      scrollTimer: null, // 滚动节流定时器
    }
  },

  methods: {
    async handlePaletteAction(action) {
      if (action === 'crypto') { this.$refs.cryptoPlayground.opened = true; await this.$nextTick(); this.$refs.cryptoPlayground.$el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (action === 'theme') this.toggleTheme();
      else if (action === 'tools') this.scrollToUtilityTools();
      else if (action === 'installation') this.scrollToSystemInstallation();
      else if (action === 'fundamentals') this.scrollToComputerFundamentals();
      else if (action === 'terminal') this.scrollToLinuxTerminal();
      else if (action === 'radio') { const button = document.querySelector('.radio-trigger'); if (button?.getAttribute('aria-expanded') !== 'true') button?.click(); button?.focus(); }
      else if (action === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); this.$refs.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' }); }
    },
    async scrollToLinuxTerminal() { return this.scrollToModule('LinuxTerminal','linuxTerminal','linux-terminal','opened');
    },
    async scrollToReverseHandbook() { return this.scrollToModule('ReverseHandbook','reverseHandbook','reverse-handbook','opened');
    },
    async scrollToVulnerabilityHandbook() { return this.scrollToModule('VulnerabilityHandbook','vulnerabilityHandbook','vulnerability-handbook','opened');
    },
    collapseAllContent() {
      if (this.$refs.navLinks) {
        this.$refs.navLinks.expandedCategories = {};
        this.$refs.navLinks.hotspotsExpanded = false;
        for (const name of ['marketOverview','currencyConverter','chinaCalendar','worldTime','historyToday']) {
          const panel=this.$refs.navLinks.$refs[name];
          if(panel)panel.expanded=false;
        }
      }
      const commands = this.$refs.commandLibrary;
      if (commands) { commands.libraryExpanded = false; commands.expanded = {}; }
      for (const refName of ['cryptoPlayground','shortcutLibrary','computerFundamentals','systemInstallation','networkReference','imageTools','textTools','utilityToolbox','systemTools','electricityLibrary','reverseHandbook','vulnerabilityHandbook','linuxTerminal']) {
        if (this.$refs[refName]) this.$refs[refName].opened = false;
      }
      // Native details can live under v-show panels; close without clearing inputs.
      this.$el.querySelectorAll('.main-content details[open]').forEach(detail => { detail.open = false; });
    },
    async scrollToElectricity() { return this.scrollToModule('ElectricityLibrary','electricityLibrary','electricity-library','opened');
    },
    async scrollToSystemTools() { return this.scrollToModule('SystemTools','systemTools','system-tools','opened');
    },
    async scrollToToolModule(refName,id) { return this.scrollToModule('UtilityToolbox',refName,id,'opened');
    },
    async scrollToUtilityTools() { return this.scrollToModule('UtilityToolbox','utilityToolbox','utility-toolbox','opened');
    },
    async scrollToSystemInstallation() { return this.scrollToModule('SystemInstallation','systemInstallation','system-installation','opened'); },
    async scrollToComputerFundamentals() { return this.scrollToModule('ComputerFundamentals','computerFundamentals','computer-fundamentals','opened'); },
      async scrollToNetworkReference() { return this.scrollToModule('NetworkReference','networkReference','network-reference','opened');
    },
    async scrollToShortcuts() { return this.scrollToModule('ShortcutLibrary','shortcutLibrary','shortcut-library','opened');
    },
    async scrollToModule(componentName, refName, id, field = 'opened') {
      const sequence = this._moduleJumpSequence = (this._moduleJumpSequence || 0) + 1;
      this.isMobileMenuVisible = false;
      const component = this.$options.components[componentName];
      if (component?.__asyncLoader) await component.__asyncLoader();
      for (let attempt = 0; attempt < 60 && !this.$refs[refName]; attempt++) {
        await nextTick();
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (sequence !== this._moduleJumpSequence) return;
      }
      if (sequence !== this._moduleJumpSequence) return;
      const panel = this.$refs[refName];
      if (!panel) return;
      panel[field] = true;
      await nextTick();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (sequence !== this._moduleJumpSequence) return;
      const target = document.getElementById(id);
      const container = this.$refs.scrollContainer;
      if (!target || !container) return;
      const header = this.$refs.navHeader?.$el;
      const offset = header?.getBoundingClientRect().height || 0;
      const top = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - offset - 16;
      container.scrollTo({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      await new Promise(resolve=>setTimeout(resolve,700));
      if(sequence!==this._moduleJumpSequence)return;
      const corrected=container.scrollTop+target.getBoundingClientRect().top-container.getBoundingClientRect().top-offset-16;
      container.scrollTo({top:Math.max(0,corrected),behavior:'instant'});
    },
    async scrollToCommands() { return this.scrollToModule('CommandLibrary','commandLibrary','command-library','libraryExpanded');
    },
    scrollToCategory(categoryName) {
      this.selectedCategory = categoryName;
      return this.$refs.navLinks?.scrollToCategory(categoryName);
    },
    scrollToSubCategory({ categoryName, subName }) {
      this.selectedCategory = categoryName;
      return this.$refs.navLinks?.scrollToSubCategory(categoryName, subName);
    },

    async toggleTheme(event) {
      if (this.themeTransitioning) return;
      this.themeTransitioning = true;
      try {
        await revealTheme(async () => {
          this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
          const dark = this.currentTheme === 'dark';
          document.body.classList.toggle('dark', dark);
          document.documentElement.classList.toggle('dark', dark);
          try { localStorage.setItem('theme', this.currentTheme); } catch { /* Storage may be unavailable. */ }
          await nextTick();
        }, event);
      } finally {
        this.themeTransitioning = false;
      }
    },

// 滚动监听：同时控制两个按钮的显示（添加节流优化）
    handleScroll() {
      // 节流：如果已有定时器在等待，直接返回
      if (this.scrollTimer) return;
      
      this.scrollTimer = setTimeout(() => {
        this.scrollTimer = null; // 清除定时器
        
        const container = this.$refs.scrollContainer;
        if (container) {
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;

          // 超过 300px 显示返回顶部
          this.showBackToTop = scrollTop > 300;

          // 如果距离底部小于 50px，隐藏前往底部按钮
          this.showGoToBottom = scrollTop + clientHeight < scrollHeight - 50;
        }
      }, 100); // 100ms 节流
    },

    // 返回顶部
    scrollToTop() {
      const container = this.$refs.scrollContainer;
      if (container) {
        container.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    
    toggleSidebar() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
      } else {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      }
    },

    // 【新增】前往底部
    scrollToBottom() {
      const container = this.$refs.scrollContainer;
      if (container) {
        container.scrollTo({ 
          top: container.scrollHeight, 
          behavior: 'auto' 
        });
      }
    },

    openRandomDiscover() {
      this.pickRandomLink();
      this.randomDialogVisible = true;
    },

    pickRandomLink() {
      const allLinks = [];
      for (const category of this.categories) {
        if (category.subCategories && category.subCategories.length > 0) {
          for (const sub of category.subCategories) {
            if (sub.links) {
              for (const link of sub.links) {
                allLinks.push({ link, categoryName: `${category.name} / ${sub.name}` });
              }
            }
          }
        }
        if (category.links) {
          for (const link of category.links) {
            allLinks.push({ link, categoryName: category.name });
          }
        }
      }
      if (allLinks.length === 0) return;
      const picked = allLinks[Math.floor(Math.random() * allLinks.length)];
      this.randomLink = picked.link;
      this.randomCategoryName = picked.categoryName;
      try {
        const domain = new URL(picked.link.url).hostname;
        this.randomFavicon = `https://favicon.yandex.net/favicon/${domain}`;
      } catch {
        this.randomFavicon = '';
      }
    },

    getRandomTagType(tag) {
      const t = (tag || '').trim();
      if (['开源', 'Open Source', 'OSS'].includes(t)) return 'success';
      if (['免费', 'Free'].includes(t)) return 'success';
      if (['收费', '付费', 'Pro', '订阅'].includes(t)) return 'danger';
      if (['内测', 'Beta'].includes(t)) return 'warning';
      return null;
    }
  },

  mounted() {
    if (this.currentTheme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
    
    window.addEventListener('error', (e) => {
      if (e.message === 'ResizeObserver loop completed with undelayed notifications.') {
        e.stopImmediatePropagation();
      }
    });

    this.$nextTick(() => {
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.addEventListener('scroll', this.handleScroll);
        // 初始化一次状态
        this.handleScroll();
      }
    });
  },

  beforeUnmount() {
    if (this.$refs.scrollContainer) {
      this.$refs.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
  }
}
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  /* 注意：移除这里的背景色，否则可能挡住 Canvas */
  height: 100%;
  overflow: hidden; 
}

/* 亮色模式默认背景 */
body:not(.dark) {
  background-color: #f5f7fa; /* 或原本的亮色背景变量 */
}

.main-content.dark-theme {
  background-color: #0a0a0a; /* 黑客帝国暗黑模式背景 */
}

</style>

<style scoped>
.navigation-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  height: 100vh; 
  overflow-y: auto; 
  overflow-x: hidden;
  padding-top: 60px;
  box-sizing: border-box; 
  transition: margin-left 0.3s;
  position: relative;
  scroll-behavior: auto;
}

.dark-theme {
  background-color: #0a0a0a !important; /* 黑客帝国暗黑模式背景 */
  color: var(--dark-text-primary);
}

.navigation-header {
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  height: 60px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: left 0.3s;
}

.main-content[style*="margin-left: 64px"] .navigation-header {
    left: 64px !important;
}

/* 悬浮工具栏 */
.floating-tools {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.tool-btn {
  width: 40px;
  height: 40px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
}

.tool-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.tool-btn svg {
  fill: currentColor;
}

.tool-btn.dark-theme {
  background-color: #0f0f0f;
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-secondary);
}

.tool-btn.dark-theme:hover {
  color: var(--dark-text-primary);
  border-color: rgba(0, 255, 65, 0.5);
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }

  .navigation-header {
    left: 0 !important;
  }

  .floating-tools {
    bottom: 20px;
    right: 20px;
  }

  .tool-btn {
    width: 36px;
    height: 36px;
  }
}

</style>

<style>
.dark-dialog .el-dialog {
  background-color: #0f0f0f !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
}

.dark-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(0, 255, 65, 0.2) !important;
}

.dark-dialog .el-dialog__title {
  color: var(--dark-text-primary) !important;
}

.dark-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--dark-text-muted) !important;
}

.dark-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: var(--dark-text-primary) !important;
}

.dark-dialog .el-dialog__body {
  color: var(--dark-text-secondary) !important;
}
</style>

<style scoped>
.random-discover-content {
  padding: 8px 0;
}

.random-favicon-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.random-favicon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
  border: 1px solid #e4e7ed;
}

.random-favicon-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

.random-info {
  flex: 1;
  min-width: 0;
}

.random-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.random-category {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.random-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.random-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.random-actions {
  display: flex;
  gap: 10px;
}

.random-visit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 36px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.random-visit-btn:hover {
  background: #66b1ff;
}

.random-refresh-btn {
  height: 36px;
}

.random-discover-content.dark-theme .random-name {
  color: var(--dark-text-primary);
}

.random-discover-content.dark-theme .random-desc {
  color: var(--dark-text-secondary);
}

.random-discover-content.dark-theme .random-category {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-muted);
}

.random-discover-content.dark-theme .random-favicon {
  border-color: rgba(0, 255, 65, 0.2);
}

.random-discover-content.dark-theme .random-visit-btn {
  background: rgba(0, 255, 65, 0.15);
  color: var(--dark-text-primary);
}

.random-discover-content.dark-theme .random-visit-btn:hover {
  background: rgba(0, 255, 65, 0.25);
  color: var(--dark-text-link);
}

.random-discover-content.dark-theme :deep(.el-tag) {
  background-color: transparent !important;
}

.random-discover-content.dark-theme :deep(.el-tag--success) {
  border-color: #00ff41 !important;
  color: var(--dark-text-primary) !important;
}

.random-discover-content.dark-theme :deep(.el-tag--warning) {
  border-color: #ffcc00 !important;
  color: #ffcc00 !important;
}

.random-discover-content.dark-theme :deep(.el-tag--danger) {
  border-color: #ff4444 !important;
  color: #ff4444 !important;
}

.random-discover-content.dark-theme :deep(.el-tag:not([class*='el-tag--'])) {
  border-color: #00ff41 !important;
  color: var(--dark-text-primary) !important;
}

@media (max-width: 768px) {
  .random-discover-dialog .el-dialog {
    width: 90% !important;
  }
}
</style>





<style scoped>
.module-collapse-bar{display:flex;align-items:center;gap:12px;margin:18px 20px 10px;flex-wrap:wrap}.collapse-all-modules{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12px;border:1px solid var(--el-border-color-light);border-radius:7px;background:var(--el-bg-color);color:var(--ui-accent,var(--el-text-color-primary));padding:8px 12px;cursor:pointer}.collapse-all-modules:focus-visible{outline:2px solid var(--ui-accent);outline-offset:2px}.module-collapse-bar>span{font-size:11px;color:var(--el-text-color-secondary)}
.main-content :deep(section > header h2),.main-content :deep(.category-title){font-size:15px!important;line-height:1.5}
</style>

<style scoped>
/* Keep the original single-column flow; tighten only outer module spacing. */
.main-content > .module-collapse-bar ~ section {
  margin-top: 6px !important;
  margin-bottom: 6px !important;
}
</style>
