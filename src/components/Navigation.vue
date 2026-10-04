<template>
  <div class="navigation-container" :class="{ 'dark-theme': currentTheme === 'dark' }">
  
    <SideNavigation 
      :is-dark-theme="currentTheme === 'dark'"
      :isCollapsed="isSidebarCollapsed"
      :isMobileMenuVisible="isMobileMenuVisible"
      @category-selected="scrollToCategory"
      @sub-category-selected="scrollToSubCategory"
      @clear-top-search="clearTopSearch"
      @update:isCollapsed="isSidebarCollapsed = $event"
      @update:isMobileMenuVisible="isMobileMenuVisible = $event"
    />
    
    <div 
      class="main-content" 
      ref="scrollContainer"
      :class="{ 'menu-visible': isMenuVisible, 'dark-theme': currentTheme === 'dark' }" 
      :style="{ 'margin-left': isSidebarCollapsed ? '0px' : '280px' }"
    >
      <NavigationHeader
        ref="navHeader"
        class="navigation-header"
        :active-index="activeIndex"
        :current-theme="currentTheme"
        @show-donate="donateDialogVisible = true"
        @toggle-theme="toggleTheme"
        @toggle-mobile-menu="toggleSidebar"
      />

 
      
      <NavigationLinks
        ref="navLinks"
        :categories="categories"
        :current-theme="currentTheme"
        :target-category="selectedCategory"
      />

      <NavigationFooter 
        ref="footer"
        :current-theme="currentTheme"
        @show-donate="donateDialogVisible = true"
      />

      <DonateDialog v-model="donateDialogVisible" />

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
import { navData } from "../nav-data.js"
import NavigationHeader from './NavigationHeader.vue'
import NavigationLinks from './NavigationLinks.vue'
import NavigationFooter from './NavigationFooter.vue'
import SideNavigation from './SideNavigation.vue'
import DonateDialog from './DonateDialog.vue'



export default {
  name: 'MainNavigation',
  components: {
    NavigationHeader,
    DonateDialog,
    NavigationLinks,
    NavigationFooter,
    SideNavigation,
   
  },

  data() {
    return {
      activeIndex: 'home',
      isMenuVisible: false,
      donateDialogVisible: false,
      randomDialogVisible: false,
      randomLink: null,
      randomCategoryName: '',
      randomFavicon: '',
      
      isSidebarCollapsed: false,
    isMobileMenuVisible: false,
      currentTheme: localStorage.getItem('theme') || 'light',
      selectedCategory: '',
      categories: navData,
      // 按钮显示状态
      showBackToTop: false, 
      showGoToBottom: true, // 默认显示底部按钮
      scrollTimer: null, // 滚动节流定时器
    }
  },
  methods: {
    scrollToCategory(categoryName) {
      // 清空站内搜索，确保分类可以正常显示
      if (this.$refs.navLinks) {
        this.$refs.navLinks.clearSearch();
        // 直接调用子组件的滚动方法，确保每次都能滚动
        this.$refs.navLinks.scrollToCategory(categoryName);
      }
      this.selectedCategory = categoryName;
      const categoryElement = document.querySelector(`[data-category="${categoryName}"]`);
      const container = this.$refs.scrollContainer;
      
      if (categoryElement && container) {
        const elementTop = categoryElement.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        const currentScroll = container.scrollTop;
        const headerOffset = 80;

        const targetPosition = elementTop - containerTop + currentScroll - headerOffset;

        container.scrollTo({
          top: targetPosition,
          behavior: "auto"
        });
      }
    },
    
    // 滚动到子分类
    scrollToSubCategory({ categoryName, subName }) {
      // 搜索结果和分页会影响目标节点是否存在，先恢复完整列表。
      this.$refs.navLinks?.clearSearch();
      this.selectedCategory = categoryName;
      this.$nextTick(() => {
        if (this.$refs.navLinks) {
          this.$refs.navLinks.expandCategory(categoryName);
          this.$refs.navLinks.scrollToSubCategory(categoryName, subName);
        }
      });
    },
    
    toggleTheme() {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.currentTheme);
      document.body.classList.toggle('dark', this.currentTheme === 'dark');
      document.documentElement.classList.toggle('dark', this.currentTheme === 'dark');
    },

    clearTopSearch() {
      if (this.$refs.navHeader) {
        this.$refs.navHeader.clearSearch();
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
  color: #00ff41;
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

.main-content[style*="margin-left: 0px"] .navigation-header {
    left: 0px !important;
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
  color: #00cc33;
}

.tool-btn.dark-theme:hover {
  color: #00ff41;
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
  color: #00ff41 !important;
}

.dark-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #008822 !important;
}

.dark-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #00ff41 !important;
}

.dark-dialog .el-dialog__body {
  color: #00cc33 !important;
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
  color: #00ff41;
}

.random-discover-content.dark-theme .random-desc {
  color: #00cc33;
}

.random-discover-content.dark-theme .random-category {
  background: rgba(0, 255, 65, 0.1);
  color: #008822;
}

.random-discover-content.dark-theme .random-favicon {
  border-color: rgba(0, 255, 65, 0.2);
}

.random-discover-content.dark-theme .random-visit-btn {
  background: rgba(0, 255, 65, 0.15);
  color: #00ff41;
}

.random-discover-content.dark-theme .random-visit-btn:hover {
  background: rgba(0, 255, 65, 0.25);
  color: #39ff14;
}

.random-discover-content.dark-theme :deep(.el-tag) {
  background-color: transparent !important;
}

.random-discover-content.dark-theme :deep(.el-tag--success) {
  border-color: #00ff41 !important;
  color: #00ff41 !important;
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
  color: #00ff41 !important;
}

@media (max-width: 768px) {
  .random-discover-dialog .el-dialog {
    width: 90% !important;
  }
}
</style>
