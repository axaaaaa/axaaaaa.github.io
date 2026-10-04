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
          <Expand />
        </el-icon>
      </el-menu-item>

      <el-menu-item index="home" @click="handleHome" class="home-menu-item">
        <el-icon><HomeFilled /></el-icon>
      </el-menu-item>
      
      <el-menu-item index="donate" @click="$emit('show-donate')" title="捐赠" class="hidden-xs-only">
        <el-icon><Coffee /></el-icon>
      </el-menu-item>

      <el-menu-item index="theme" @click="$emit('toggle-theme')" class="theme-switch-item">
        <el-icon>
          <Sunny v-if="currentTheme === 'dark'" />
          <Moon v-else />
        </el-icon>
      </el-menu-item>
    </el-menu>

    <!-- 搜索框移出 el-menu -->
    <div class="search-wrapper">
      <el-select
        v-model="selectedEngine"
        class="search-engine-select"
        :popper-class="currentTheme === 'dark' ? 'dark-dropdown' : ''"
        :style="{ width: isMobile ? 'auto' : '160px', minWidth: isMobile ? '60px' : '160px' }"
      >
        <template #prefix>
          <el-icon class="search-engine-icon">
            <component :is="currentEngineIcon" />
          </el-icon>
        </template>

        <el-option
          v-for="engine in searchEngines"
          :key="engine.value"
          :label="engine.label"
          :value="engine.value"
        >
          <div class="search-engine-option-content">
            <el-icon class="search-engine-icon" style="margin-right: 8px; vertical-align: middle;">
              <component :is="engine.icon" />
            </el-icon>
            <span>{{ engine.label }}</span>
          </div>
        </el-option>
      </el-select>

      <el-input
        ref="searchInput"
        v-model="searchText"
        @keyup.enter="handleSearch"
        class="search-input"
        placeholder="">
        <template #append>
          <el-button @click="handleSearch" class="search-btn-append">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      
      <el-button 
        @click="pasteFromClipboard" 
        circle
        size="small"
        class="paste-button"
        :class="{ 'dark-theme': currentTheme === 'dark' }"
        title="粘贴"
      >
        <el-icon><DocumentCopy /></el-icon>
      </el-button>
      
      <el-button 
        v-if="searchText"
        @click="clearSearch" 
        circle
        size="small"
        class="clear-button"
        :class="{ 'dark-theme': currentTheme === 'dark' }"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
import { HomeFilled, Coffee, Search, Close, Expand, Sunny, Moon, DocumentCopy } from '@element-plus/icons-vue'

export default {
  name: 'NavigationHeader',
  components: { HomeFilled, Coffee, Search, Close, Expand, Sunny, Moon, DocumentCopy },

  props: {
    activeIndex: { type: String, default: '' },
    currentTheme: { type: String, required: true }
  },

  emits: ['show-donate', 'toggle-theme', 'toggle-mobile-menu'],

  data() {
    return {
      searchText: '',
      selectedEngine: 'google',
      searchEngines: [
        { label: 'Google', value: 'google', url: 'https://www.google.com/search?q=%s', icon: 'ChromeFilled' },
        { label: 'Bing', value: 'bing', url: 'https://www.bing.com/search?q=%s', icon: 'Search' },
        { label: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd=%s', icon: 'Search' },
        { label: 'B站', value: 'bilibili', url: 'https://www.bilibili.com/search?keyword=%s', icon: 'VideoPlay' },
        { label: 'GitHub', value: 'github', url: 'https://github.com/search?q=%s', icon: 'Search' },
        { label: 'Youtube', value: 'youtube', url: 'https://www.youtube.com/results?search_query=%s', icon: 'VideoPlay' },
      ],
      isMobile: window.innerWidth <= 768,
      resizeTimer: null
    }
  },

  computed: {
    currentEngineIcon() {
      return this.searchEngines.find(engine => engine.value === this.selectedEngine)?.icon || 'Search'
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
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

    handleSearch() {
      if (!this.searchText) return;
      const searchUrl = this.searchEngines.find(engine => engine.value === this.selectedEngine)?.url;
      if (searchUrl) {
        window.open(searchUrl.replace('%s', encodeURIComponent(this.searchText)), '_blank');
      }
    },

    clearSearch() {
      this.searchText = '';
      this.$nextTick(() => this.$refs.searchInput?.focus());
    },
    
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.searchText = text;
          this.$nextTick(() => this.$refs.searchInput?.focus());
        }
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    }
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
  color: #00cc33 !important; 
  font-family: monospace;
}
.dark-dropdown .el-select-dropdown__item.selected,
.dark-dropdown .el-select-dropdown__item.hover,
.dark-dropdown .el-select-dropdown__item:hover {
  background-color: rgba(0, 255, 65, 0.1) !important;
  color: #00ff41 !important; 
  font-weight: bold;
}
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
  margin-left: auto;
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
  color: #00ff41;
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
  .search-input { width: 120px; }
}
</style>