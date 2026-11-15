<template>
  <div>
    <div 
      v-if="isMobile && isMobileMenuVisible" 
      class="mobile-overlay"
      @click="toggleMenu"
    ></div>

    
    <div 
      class="side-navigation" 
      :class="{ 
        'side-navigation-dark': isDarkTheme, 
        'mobile-visible': isMobileMenuVisible,
        'nav-collapsed': isCollapsed && !isMobile 
      }"
    >

      <button v-if="isCollapsed && !isMobile" class="rail-expand" type="button" title="展开侧栏" aria-label="展开侧栏" @click="toggleMenu">☰</button>
      <div class="nav-header">
        <div class="ascii-brand" role="img" aria-label="0 1">
          <div class="sidebar-retro-computer" aria-hidden="true">
            <img class="sidebar-site-icon" :src="siteIconUrl" width="48" height="48" alt="">
            <svg class="sidebar-retro-keyboard" width="44" height="24" viewBox="0 0 44 24" aria-hidden="true">
              <path d="M6 4h32l5 12v2l-2 2H3l-2-2v-2Z" fill="#2e303b"/>
              <path d="M7 5h30l4 11H3Z" fill="#f3e5bb"/>
              <path d="M3 17h38v1H3Z" fill="#af966e"/>
              <path d="M8 7h27l3 8H5Z" fill="#af966e"/>
              <path d="M10 9h3m2 0h3m2 0h3m2 0h3m2 0h3M8 12h4m2 0h13m2 0h6" fill="none" stroke="#fff4d8" stroke-width="2"/>
            </svg>
          </div>
          <pre class="ascii-logo" aria-hidden="true"><template v-for="(row, rowIndex) in logoRows" :key="rowIndex"><span v-for="(char, column) in row" :key="column" :class="{ 'logo-scan-glyph': isDarkTheme || (logoScanStart !== null && column >= logoScanStart && column < logoScanStart + 4) }">{{ char }}</span><template v-if="rowIndex < logoRows.length - 1">{{ '\n' }}</template></template></pre>
        </div>
        <el-input
          v-model="searchText"
          placeholder="搜索分类"
          clearable
          prefix-icon="Search"
          @input="handleSearchInput"
          class="search-input"
          :class="{ 'has-search-illustration': !searchText }"
        >
          <template #suffix>
            <button
              type="button"
              class="collapse-toggle"
              :class="{ 'collapse-toggle-dark': isDarkTheme }"
              :title="isMobile ? '关闭分类菜单' : '收起侧栏'"
              :aria-label="isMobile ? '关闭分类菜单' : '收起侧栏'"
              @click.stop="toggleMenu"
            >
              <el-icon size="18"><Fold /></el-icon>
            </button>
          </template>
        </el-input>
        <button type="button" class="collapse-all-button" aria-label="全部收缩" title="收起分类、模块和详情，保留输入内容" @click="collapseAll"><el-icon aria-hidden="true"><Fold /></el-icon><span>全部收缩</span></button>
        <p v-if="collapseFeedback" class="collapse-all-feedback" role="status">{{collapseFeedback}}</p>
        <div class="statistics-info">
          <span>分类: {{ filteredCategories.length }}</span>
          <span>链接: {{ totalLinksCount }}</span>
        </div>
      </div>

      <div class="side-nav-content" ref="scrollContainer">
        <div class="groups-container">
          <div 
            v-for="(groupItems, groupName) in displayedGroupedCategories" 
            :key="groupName"
            class="category-group"
            :class="{ 'standalone-category-group': ['💳金融支付', '🎮游戏相关', '🎨 设计资源', '✨ 本地地址'].includes(groupName) }"
          >
            <div 
              v-if="groupName !== 'default_ungrouped' && !['💳金融支付', '🎮游戏相关', '🎨 设计资源', '✨ 本地地址'].includes(groupName)" 
              class="group-title"
              @click="handleGroupClick(groupItems)"
            >
              {{ groupName }}
            </div>
            
              
            
            
            
            
            
            
            
            
            
            
            
            <div 
              v-for="category in groupItems" 
              :key="category.name" 
              class="category-wrapper"
            >
              <div 
                class="menu-item"
                role="button" tabindex="0"
                :title="isCollapsed && !isMobile ? category.name : undefined"
                :aria-label="category.name"
                @keydown.enter.prevent="handleSelect(category.name)"
                @keydown.space.prevent="handleSelect(category.name)"
                :class="{ 'is-active': activeIndex === category.name, 'has-active-child': category.subCategories?.some(sub => sub.name === activeIndex) }"
                @click="handleSelect(category.name)"
              >
                <CategoryPixelBadge :name="category.name" />
                <span class="category-name"><HighlightText :text="category.name" :query="searchText" /></span>
                <span class="item-count">{{ getCategoryCount(category) }}</span>
                <el-icon 
                  v-if="category.subCategories && category.subCategories.length" 
                  class="expand-icon"
                  :class="{ 'is-expanded': expandedCategories[category.name] }"
                  @click.stop="toggleSubCategories(category.name)"
                >
                  <ArrowRight />
                </el-icon>
              </div>
              <!-- 子分类列表 -->
              <Transition name="sidebar-children">
              <div 
                v-if="category.subCategories && category.subCategories.length && expandedCategories[category.name]" 
                class="sub-categories"
              >
                <div 
                  v-for="sub in category.subCategories" 
                  :key="sub.name" 
                  class="sub-menu-item"
                  :class="{ 'is-active': activeIndex === sub.name }"
                  @click="handleSubSelect(category.name, sub.name)"
                >
                  <span v-if="sub.emoji" class="sub-emoji-icon">{{ sub.emoji }}</span>
                  <span class="sub-category-name"><HighlightText :text="sub.name" :query="searchText" /></span>
                  <span class="item-count">{{ sub.links ? sub.links.length : 0 }}</span>
                </div>
              </div>
              </Transition>
            </div>
          </div>

          <div v-if="filteredCategories.length === 0" class="empty-state">
            <p>无结果</p>
          </div>
        </div>
      </div>

      <div class="nav-footer">
        <el-button class="scroll-btn" @click="scrollToTop">
          <el-icon><ArrowUpBold /></el-icon>
        </el-button>
        <el-button class="scroll-btn" @click="scrollToBottom">
          <el-icon><ArrowDownBold /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import HighlightText from "./HighlightText.vue";
import { Fold, ArrowUpBold, ArrowDownBold, ArrowRight } from '@element-plus/icons-vue'
import { navData } from "../nav-data.js"
import CategoryPixelBadge from './CategoryPixelBadge.vue';
import { nextTick } from 'vue'
import { matchPinyin } from "../utils/pinyin.js"

const ORIGINAL_LOGO = " ████        ██    \n██  ██      ███    \n██  ██       ██    \n██  ██       ██    \n██  ██       ██    \n ████      ██████  ";

export default {
  name: 'SideNavigation',
  components: { HighlightText, CategoryPixelBadge,
    Fold, ArrowUpBold, ArrowDownBold, ArrowRight
  },
  props: {
    isDarkTheme: { type: Boolean, default: false },
    isCollapsed: { type: Boolean, default: false },
    isMobileMenuVisible: { type: Boolean, default: false }
  },
  data() {
    return {
      siteIconUrl: process.env.BASE_URL + "favicon.ico?v=retro-pc",
      logoDisplay: ORIGINAL_LOGO,
      logoScanStart: null,
      logoDecodeTimer: null,
      logoMotionQuery: null,
      logoEnvironmentChange: null,
      collapseFeedback: '',
      activeIndex: '',
      categories: navData,
      searchText: '',
      filteredCategories: navData,
      isMobile: window.innerWidth <= 768,
      resizeTimer: null,
      searchTimer: null,
      expandedCategories: {}
    }
  },
  computed: {
    logoRows() {
      return this.logoDisplay.split('\n').map(row => Array.from(row));
    },
    totalLinksCount() {
      return this.filteredCategories.reduce((total, category) => total + this.getCategoryCount(category), 0);
    },
    displayedCategories() {
      return this.filteredCategories;
    },
    // 分组后的显示分类
    displayedGroupedCategories() {
      return this.groupCategories(this.displayedCategories);
    }
  },
  watch: {
    isDarkTheme() { this.startLogoCycle(); },
    isCollapsed() { this.startLogoCycle(); },
    isMobile() { this.startLogoCycle(); }
  },
  beforeUnmount() {
    this.stopLogoCycle();
    this.logoMotionQuery?.removeEventListener?.('change', this.logoEnvironmentChange);
    document.removeEventListener('visibilitychange', this.logoEnvironmentChange);
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.logoMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.logoEnvironmentChange = () => this.startLogoCycle();
    this.logoMotionQuery.addEventListener?.('change', this.logoEnvironmentChange);
    document.addEventListener('visibilitychange', this.logoEnvironmentChange);
    this.startLogoCycle();
  },
  methods: {
    collapseAll() {
      this.expandedCategories = {};
      this.$emit('collapse-all');
      this.collapseFeedback = '已收起全部展开内容';
    },
    stopLogoCycle() {
      if (this.logoDecodeTimer !== null) clearTimeout(this.logoDecodeTimer);
      this.logoDecodeTimer = null;
      this.logoDisplay = ORIGINAL_LOGO;
      this.logoScanStart = null;
    },
    startLogoCycle() {
      this.stopLogoCycle();
      if (this.logoMotionQuery?.matches || document.hidden || (this.isCollapsed && !this.isMobile)) return;
      const rows = ORIGINAL_LOGO.split('\n');
      const columns = Math.max(...rows.map(row => row.length));
      const bandWidth = 4;
      const stepMs = 110;
      let bandLeft = 1 - bandWidth;
      let direction = 1;
      const symbols = '01<>/+#%*░▒▓';
      const tick = () => {
        if (this.logoMotionQuery?.matches || document.hidden || (this.isCollapsed && !this.isMobile)) {
          this.stopLogoCycle();
          return;
        }
        // Keep at least one band column inside the logo, reversing without a blank frame.
        this.logoScanStart = this.isDarkTheme ? null : bandLeft;
        this.logoDisplay = rows.map(row => Array.from(row).map((char, col) =>
          char !== ' ' && (this.isDarkTheme || (col >= bandLeft && col < bandLeft + bandWidth))
            ? symbols[Math.floor(Math.random() * symbols.length)] : char
        ).join('')).join('\n');
        if (bandLeft >= columns - 1) direction = -1;
        else if (bandLeft <= 1 - bandWidth) direction = 1;
        bandLeft += direction;
        this.logoDecodeTimer = setTimeout(tick, stepMs);
      };
      tick();
    },
    handleResize() {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        if (!this.isMobile && this.isMobileMenuVisible) {
          this.$emit('update:isMobileMenuVisible', false);
        }
      }, 100);
    },
    // 公共分组方法（避免重复代码）
    groupCategories(categories) {
      const groups = {};
      const otherCategory = [];
      
      categories.forEach(cat => {
        const groupName = cat.group || '其他分类';
        if (groupName === '其他分类') {
          otherCategory.push(cat);
        } else {
          if (!groups[groupName]) groups[groupName] = [];
          groups[groupName].push(cat);
        }
      });
      
      const result = {};
      Object.keys(groups).forEach(name => result[name] = groups[name]);
      if (otherCategory.length) result['其他分类'] = otherCategory;
      return result;
    },
    getCategoryCount(category) {
      if (category.subCategories && category.subCategories.length) {
        return category.subCategories.reduce((acc, sub) => acc + (sub.links ? sub.links.length : 0), 0);
      }
      return category.links ? category.links.length : 0;
    },
    
    handleSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.filterCategories(), 300);
    },
    filterCategories() {
      if (!this.searchText) {
        this.filteredCategories = this.categories;
        return;
      }
      const searchLower = this.searchText.trim().toLowerCase();
      const isPinyinQuery = /^[a-zA-Z]+$/.test(searchLower);
      this.filteredCategories = this.categories.filter(category => {
        const name = category.name.toLowerCase();
        const grp = (category.group || '').toLowerCase();
        const matchSub = category.subCategories ? category.subCategories.some(s => s.name.toLowerCase().includes(searchLower)) : false;
        
        // 名称或分组匹配
        if (name.includes(searchLower) || grp.includes(searchLower) || matchSub) {
          return true;
        }
        
        // 拼音匹配（支持首字母和完整拼音）
        if (isPinyinQuery) {
          if (matchPinyin(category.name, searchLower)) {
            return true;
          }
          // 检查子分类名称拼音
          if (category.subCategories && category.subCategories.some(s => matchPinyin(s.name, searchLower))) {
            return true;
          }
        }
        
        return false;
      });
    },
    handleSelect(index) {
      this.activeIndex = index;
      this.$emit('category-selected', index);
      this.$emit('clear-top-search');
      if (this.isMobile) this.$emit('update:isMobileMenuVisible', false);
    },
    // 点击分组标题跳转到该分组第一个分类
    handleGroupClick(groupItems) {
      if (groupItems && groupItems.length > 0) {
        const firstCategory = groupItems[0];
        this.handleSelect(firstCategory.name);
      }
    },
    // 切换子分类展开/收起
    toggleSubCategories(categoryName) {
      this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
    },
    // 选择子分类
    handleSubSelect(categoryName, subName) {
      this.activeIndex = subName;
      this.$emit('sub-category-selected', { categoryName, subName });
      if (this.isMobile) this.$emit('update:isMobileMenuVisible', false);
    },
    toggleMenu() {
      if (this.isMobile) {
        this.$emit('update:isMobileMenuVisible', !this.isMobileMenuVisible);
        nextTick(() => window.dispatchEvent(new Event('resize')));
      } else {
        this.$emit('update:isCollapsed', !this.isCollapsed);
      }
    },
    scrollToTop() {
      this.$refs.scrollContainer?.scrollTo({ top: 0, behavior: 'auto' });
    },
    scrollToBottom() {
      this.$refs.scrollContainer?.scrollTo({ top: this.$refs.scrollContainer.scrollHeight, behavior: 'auto' });
    }
  }
}
</script>

<style scoped>
.side-navigation {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
  width: 280px;
  background: #fff;
  transition: width 0.3s ease;
}

.side-navigation.nav-collapsed {
  width: 0;
  overflow: hidden;
}

/* 收缩按钮 */
.collapse-toggle {
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
}

.collapse-toggle:hover {
  color: #409eff;
}

.collapse-toggle-dark {
  background: #06120b;
  border-color: rgba(0, 255, 65, 0.2);
}

.collapse-toggle-dark:hover {
  color: var(--dark-text-primary);
}

.nav-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.ascii-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 12px 0 20px;
}

.sidebar-retro-computer {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-retro-keyboard {
  flex-shrink: 0;
}

.sidebar-site-icon {
  flex-shrink: 0;
  object-fit: contain;
}

.ascii-logo {
  margin: 0;
  color: #727ce8;
  --logo-colors: linear-gradient(110deg, #25b9cd 0%, #6689ed 30%, #ac70da 56%, #e47dac 78%, #e8b35d 100%);
  background-image: var(--logo-colors);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 2px 2px rgba(104, 106, 192, 0.16));
  font-family: Consolas, "Courier New", monospace;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0;
  white-space: pre;
}

.side-navigation-dark .ascii-logo {
  color: #a69cf6;
  --logo-colors: linear-gradient(110deg, #65dce7 0%, #8faaff 30%, #c69af2 56%, #f2a4cb 78%, #f3cf88 100%);
  text-shadow: none;
  filter: drop-shadow(0 2px 3px rgba(123, 112, 216, 0.24));
}

/* Light: moving glyph band. Dark: continuously changing glyphs across the full logo. */
.ascii-logo .logo-scan-glyph {
  color: var(--dark-text-primary, #355c46);
  -webkit-text-fill-color: currentColor;
  text-shadow: none;
}

.nav-footer {
  padding: 8px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
}

.side-nav-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
}

.search-input {
  margin-bottom: 8px;
}

.search-input :deep(.el-input__wrapper) {
  width: 100%;
}

/* 放大清除按钮图标 */
.search-input :deep(.el-input__clear) {
  font-size: 18px;
}

.statistics-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.standalone-category-group {
  margin-top: 14px;
  padding-top: 12px;
}
.standalone-category-group > .category-wrapper > .menu-item {
  padding-left: 4px;
}

.group-title {
  font-size: 12px;
  color: #909399;
  padding: 8px 4px 4px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}



.category-wrapper {
  display: flex;
  flex-direction: column;
}

.expand-icon {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.sub-categories {
  margin-left: 20px;
  padding-left: 8px;
  border-left: 2px solid #e4e7ed;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 12px;
}



.sub-category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-emoji-icon {
  margin-right: 4px;
  font-size: 13px;
  flex-shrink: 0;
}

.emoji-icon {
  margin-right: 8px;
  font-size: 16px;
}

.category-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-count {
  font-size: 11px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 13px;
}

.show-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  margin-top: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: #d9ecff;
}

.scroll-btn {
  flex: 1;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .side-navigation { 
    top: 60px; 
    left: -100%; 
    width: calc(100% - 20px);
  }
  .side-navigation.mobile-visible { left: 0; }
}

/* 暗黑模式 - 黑客帝国绿 */
.side-navigation-dark {
  background: #06120b;
  border-right-color: rgba(0, 255, 65, 0.2);
}

.side-navigation-dark .nav-header,
.side-navigation-dark .nav-footer {
  border-color: rgba(0, 255, 65, 0.2);
}

.side-navigation-dark .statistics-info,
.side-navigation-dark .group-title,
.side-navigation-dark .item-count,
.side-navigation-dark .empty-state {
  color: var(--dark-text-muted, #008822);
}



.side-navigation-dark .category-name {
  color: var(--dark-text-primary, #00ff41);
}

.side-navigation-dark .show-more-btn {
  background: rgba(0, 255, 65, 0.05);
  color: var(--dark-text-muted, #008822);
}

.side-navigation-dark .show-more-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
}

/* 暗黑模式子分类样式 - 黑客帝国绿 */
.side-navigation-dark .expand-icon {
  color: var(--dark-text-muted, #008822);
}

.side-navigation-dark .sub-categories {
  border-left-color: rgba(0, 255, 65, 0.2);
}



.side-navigation-dark .sub-category-name {
  color: var(--dark-text-secondary, #00cc33);
}

/* Match the main search artwork, scaled for the narrower category input. */
.search-input.has-search-illustration :deep(.el-input__wrapper) {
  background-image: url('../assets/search-orbit.svg');
  background-repeat: no-repeat;
  background-position: right 44px center;
  background-size: 76px 24px;
}
.search-input.has-search-illustration :deep(.el-input__wrapper:focus-within) {
  background-image: none;
}

/* Unified sidebar hierarchy and quiet green interaction states. */
.side-navigation { --nav-accent: #386a50; --nav-hover: rgba(56,106,80,.055); --nav-selected: rgba(56,106,80,.10); }
.side-navigation-dark { --nav-accent: var(--dark-text-primary, #a9e0bd); --nav-hover: rgba(169,224,189,.055); --nav-selected: rgba(169,224,189,.10); }
.groups-container { gap: 12px; }
.group-title { padding: 12px 10px 5px; font-size: 11px; font-weight: 400; letter-spacing: .04em; }
.group-title:hover { color: var(--nav-accent); }
.menu-item, .standalone-category-group > .category-wrapper > .menu-item { position: relative; min-height: 38px; box-sizing: border-box; padding: 8px 10px; border-radius: 8px; gap: 8px; font-size: 13px; font-weight: 400; transition: background-color 160ms ease, color 160ms ease; }
.emoji-icon { width: 20px; margin-right: 0; text-align: center; font-size: 15px; flex-shrink: 0; }
.category-name { flex: 1; min-width: 0; }
.item-count { margin-left: auto; min-width: 24px; text-align: right; font-size: 10px; font-weight: 400; font-variant-numeric: tabular-nums; opacity: .55; }
.expand-icon { margin-left: 2px; width: 14px; flex-shrink: 0; transition: transform 180ms ease; }
.menu-item:not(:has(.expand-icon)) { padding-right: 26px; }
.sub-categories { margin: 3px 0 3px 20px; padding-left: 8px; border-left: none; }
.sub-menu-item { position: relative; min-height: 32px; padding: 7px 10px; gap: 6px; border-radius: 7px; font-size: 12px; font-weight: 400; }
.sub-emoji-icon { width: 16px; margin-right: 0; text-align: center; flex-shrink: 0; }
.menu-item:hover, .sub-menu-item:hover, .side-navigation-dark .menu-item:hover, .side-navigation-dark .sub-menu-item:hover { background: var(--nav-hover); }
.menu-item.is-active, .sub-menu-item.is-active, .side-navigation-dark .menu-item.is-active, .side-navigation-dark .sub-menu-item.is-active { background: var(--nav-selected); color: var(--nav-accent); }
.menu-item.is-active::before, .sub-menu-item.is-active::before { content: ''; position: absolute; left: 0; top: 28%; bottom: 28%; width: 2px; border-radius: 2px; background: var(--nav-accent); }
.menu-item.has-active-child { background: var(--nav-hover); }
.sidebar-children-enter-active, .sidebar-children-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.sidebar-children-enter-from, .sidebar-children-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) { .sidebar-children-enter-active, .sidebar-children-leave-active, .expand-icon, .menu-item, .sub-menu-item { transition: none; } }


/* Desktop icon rail; mobile keeps its drawer navigation. */
.rail-expand { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; margin: 14px auto; flex-shrink: 0; border: 0; border-radius: 8px; background: transparent; color: var(--nav-accent); font-size: 20px; cursor: pointer; }
.rail-expand:hover { background: var(--nav-hover); }
.rail-expand:focus-visible, .menu-item:focus-visible { outline: 2px solid var(--nav-accent); outline-offset: -2px; }
@media screen and (min-width: 769px) {
  .side-navigation.nav-collapsed { width: 64px; overflow: hidden; }
  .nav-collapsed .nav-header, .nav-collapsed .group-title, .nav-collapsed .category-name, .nav-collapsed .item-count, .nav-collapsed .expand-icon, .nav-collapsed .sub-categories, .nav-collapsed .nav-footer { display: none; }
  .nav-collapsed .side-nav-content { padding: 0 8px 12px; }
  .nav-collapsed .groups-container { gap: 8px; }
  .nav-collapsed .standalone-category-group { margin-top: 4px; padding-top: 0; }
  .nav-collapsed .menu-item, .nav-collapsed .standalone-category-group > .category-wrapper > .menu-item, .nav-collapsed .menu-item:not(:has(.expand-icon)) { justify-content: center; width: 46px; min-height: 42px; padding: 8px; gap: 0; }
  .nav-collapsed .emoji-icon { width: 24px; font-size: 18px; }
}
.command-library-entry { border: 0; background: transparent; color: inherit; width: 100%; text-align: left; font: inherit; }
.collapse-all-button {display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:10px;padding:7px 10px;border:1px solid #d7e4dc;border-radius:5px;background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer;}.collapse-all-button:hover {background:rgba(90,140,110,.1);}.collapse-all-button:focus-visible{outline:2px solid var(--ui-accent,#386a50);outline-offset:2px;}.side-navigation-dark .collapse-all-button {border-color:#344b3d;color:#a9e0bd;}.collapse-all-feedback{font-size:11px;line-height:1.5;margin:5px 0;color:var(--ui-accent,#386a50);}
</style>
