<template>
  <div>
    <div 
      v-if="isMobile && isMobileMenuVisible" 
      class="mobile-overlay"
      @click="toggleMenu"
    ></div>

    <!-- 收缩/展开按钮 -->
    <div 
      class="collapse-toggle" 
      :class="{ 'collapse-toggle-dark': isDarkTheme, 'toggle-collapsed': isCollapsed }" 
      @click="toggleMenu"
    >
      <el-icon size="18">
        <Expand v-if="isCollapsed" />
        <Fold v-else />
      </el-icon>
    </div>
    
    <div 
      class="side-navigation" 
      :class="{ 
        'side-navigation-dark': isDarkTheme, 
        'mobile-visible': isMobileMenuVisible,
        'nav-collapsed': isCollapsed 
      }"
    >

      <div class="nav-header">
        <div class="ascii-brand" role="img" aria-label="AI NAV">
          <pre class="ascii-logo" aria-hidden="true"> ███  ███   █   █  ███  █   █
█   █  █    ██  █ █   █ █   █
█████  █    █ █ █ █████ █   █
█   █  █    █  ██ █   █  █ █ 
█   █ ███   █   █ █   █   █  </pre>
        </div>
        <el-input
          v-model="searchText"
          placeholder="搜索分类"
          clearable
          prefix-icon="Search"
          @input="handleSearchInput"
          class="search-input"
        />
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
          >
            <div 
              v-if="groupName !== 'default_ungrouped'" 
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
                :class="{ 'is-active': activeIndex === category.name }"
                @click="handleSelect(category.name)"
              >
                <span v-if="category.emoji" class="emoji-icon">{{ category.emoji }}</span>
                <span class="category-name">{{ category.name }}</span>
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
                  <span class="sub-category-name">{{ sub.name }}</span>
                  <span class="item-count">{{ sub.links ? sub.links.length : 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 显示更多按钮 -->
          <div v-if="hasMoreCategories && !isExpanded" class="show-more-btn" @click="expandCategories">
            <el-icon><ArrowDownBold /></el-icon>
            <span>显示更多 ({{ remainingCount }}个)</span>
          </div>
          
          <!-- 收起按钮 -->
          <div v-if="isExpanded && totalCategoriesCount > displayLimit" class="show-more-btn" @click="collapseCategories">
            <el-icon><ArrowUpBold /></el-icon>
            <span>收起</span>
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
import { Expand, Fold, ArrowUpBold, ArrowDownBold, ArrowRight } from '@element-plus/icons-vue'
import { navData } from "../nav-data.js"
import { nextTick } from 'vue'
import { matchPinyin } from "../utils/pinyin.js"

export default {
  name: 'SideNavigation',
  components: {
    Expand, Fold, ArrowUpBold, ArrowDownBold, ArrowRight
  },
  props: {
    isDarkTheme: { type: Boolean, default: false },
    isCollapsed: { type: Boolean, default: false },
    isMobileMenuVisible: { type: Boolean, default: false }
  },
  data() {
    return {
      activeIndex: '',
      categories: navData,
      searchText: '',
      filteredCategories: navData,
      isMobile: window.innerWidth <= 768,
      resizeTimer: null,
      searchTimer: null,
      isExpanded: false, // 是否展开显示所有分类
      displayLimit: 15, // 默认显示15个分类
      expandedCategories: {} // 记录哪些分类展开了子分类
    }
  },
  computed: {
    totalLinksCount() {
      return this.filteredCategories.reduce((total, category) => total + this.getCategoryCount(category), 0);
    },
    totalCategoriesCount() {
      return this.filteredCategories.length;
    },
    hasMoreCategories() {
      return this.totalCategoriesCount > this.displayLimit;
    },
    remainingCount() {
      return this.totalCategoriesCount - this.displayLimit;
    },
    displayedCategories() {
      // 搜索时显示全部，否则根据展开状态决定
      if (this.isExpanded || this.searchText) {
        return this.filteredCategories;
      }
      return this.filteredCategories.slice(0, this.displayLimit);
    },
    // 分组后的显示分类
    displayedGroupedCategories() {
      return this.groupCategories(this.displayedCategories);
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  methods: {
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
    },
    expandCategories() {
      this.isExpanded = true; // 展开显示所有分类
    },
    collapseCategories() {
      this.isExpanded = false; // 收起只显示15个分类
      // 收起后滚动到顶部
      this.$nextTick(() => {
        this.$refs.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
      });
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
  position: fixed;
  left: 280px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  width: 16px;
  height: 40px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
}

.collapse-toggle:hover {
  color: #409eff;
}

.collapse-toggle.toggle-collapsed {
  left: 0;
}

.collapse-toggle-dark {
  background: #0a0a0a;
  border-color: rgba(0, 255, 65, 0.2);
}

.collapse-toggle-dark:hover {
  color: #00ff41;
}

.nav-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.ascii-brand {
  display: flex;
  justify-content: center;
  padding: 12px 0 20px;
}

.ascii-logo {
  margin: 0;
  color: #2563b0;
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0;
  white-space: pre;
}

.side-navigation-dark .ascii-logo {
  color: var(--dark-text-primary, #00ff41);
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

.group-title {
  font-size: 12px;
  color: #909399;
  padding: 8px 4px 4px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}
.group-title:hover {
  color: #409eff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.is-active {
  background: #ecf5ff;
  color: #409eff;
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

.sub-menu-item:hover {
  background: #f5f7fa;
}

.sub-menu-item.is-active {
  background: #ecf5ff;
  color: #409eff;
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
  .collapse-toggle { display: none; }
  .side-navigation { 
    top: 60px; 
    left: -100%; 
    width: calc(100% - 20px);
  }
  .side-navigation.mobile-visible { left: 0; }
}

/* 暗黑模式 - 黑客帝国绿 */
.side-navigation-dark {
  background: #0a0a0a;
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

.side-navigation-dark .menu-item:hover {
  background: rgba(0, 255, 65, 0.05);
}

.side-navigation-dark .menu-item.is-active {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
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

.side-navigation-dark .sub-menu-item:hover {
  background: rgba(0, 255, 65, 0.05);
}

.side-navigation-dark .sub-menu-item.is-active {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
}

.side-navigation-dark .sub-category-name {
  color: var(--dark-text-secondary, #00cc33);
}
</style>
