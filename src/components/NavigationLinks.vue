<template>
  <div class="navigation" :class="{ 'dark-theme': currentTheme === 'dark' }">
    
    <div class="search-bar-compact">
      <!-- 搜索引擎选择 -->
      <el-select
        v-model="selectedEngine"
        class="engine-select"
        :popper-class="currentTheme === 'dark' ? 'dark-dropdown' : ''"
      >
        <el-option
          v-for="engine in searchEngines"
          :key="engine.value"
          :label="engine.label"
          :value="engine.value"
        />
      </el-select>

      <!-- 统一搜索输入框 -->
      <el-autocomplete
        v-model="searchText"
        :placeholder="searchPlaceholder"
        clearable
        class="search-input"
        :fetch-suggestions="fetchSearchSuggestions"
        :trigger-on-focus="false"
        :popper-class="currentTheme === 'dark' ? 'dark-autocomplete' : ''"
        @select="handleSuggestionSelect"
        @keydown.enter="handleSearch"
        value-key="name"
      >
        <template #default="{ item }">
          <div class="suggestion-item">
            <span class="suggestion-name">{{ item.name }}</span>
            <span class="suggestion-category" v-if="item.categoryName">{{ item.categoryName }}</span>
          </div>
        </template>
      </el-autocomplete>
      
      <!-- 搜索按钮 -->
      <el-button 
        @click="handleSearch" 
        class="search-btn"
        :class="{ 'dark-theme': currentTheme === 'dark' }"
        title="搜索"
      >
        <el-icon><Search /></el-icon>
      </el-button>
      
      <!-- 粘贴按钮 -->
      <el-button 
        @click="pasteFromClipboard" 
        circle
        class="paste-btn"
        :class="{ 'dark-theme': currentTheme === 'dark' }"
        title="粘贴"
      >
        <el-icon><DocumentCopy /></el-icon>
      </el-button>
    </div>

    <div class="pagination-container pagination-top" v-if="filteredCategories.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredCategories.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
      />
    </div>


    <div v-if="localSearchQuery && filteredCategories.length === 0" class="no-result-wrapper">
      <el-empty description="未找到相关内容" :image-size="200"></el-empty>
    </div>

    <div v-for="category in paginatedCategories" :key="category.name" class="category" :data-category="category.name">
      <h2 class="category-title">
        <span style="display: inline-flex; margin-right: 4px;">{{ category.emoji }}</span>
        {{ category.name }}
        <span class="category-count">{{ getCategoryCount(category) }}</span>
      </h2>

      <div class="links-container">
        <template v-if="category.subCategories && category.subCategories.length > 0">
          <div v-for="sub in category.subCategories" :key="sub.name" class="sub-category-group" :data-sub-category="sub.name">
            <h3 class="subcategory-title">
              <span v-if="sub.emoji" class="sub-emoji">{{ sub.emoji }}</span>
              {{ sub.name }}
            </h3>
            <ul>
              <li v-for="link in getSubLinks(sub, category.name)" :key="link.name">
                <article class="website-card">
<a :href="link.url" target="_blank" rel="noopener noreferrer" class="card-main">
                        <span class="link-heading">
                        <img
                          v-if="getFaviconUrl(link.url)"
                          :src="getFaviconUrl(link.url)"
                          class="favicon"
                          loading="lazy"
                          decoding="async"
                          @error="handleImageError($event, link.url)"
                        />
                        <span class="link-text">{{ link.name }}</span>
                        <template v-if="link.tag || (link.tags && link.tags.length)">
                          <el-tag v-for="(t, idx) in normalizeTags(link)" :key="idx" size="small" :type="getTagType(t)" class="link-mini-tag" effect="plain">{{ t }}</el-tag>
                        </template>
                      </span>
                        <span class="link-description">{{ link.description || '暂无简介' }}</span>
                    </a>
<div class="card-domain">{{ formatUrl(link.url) }}</div>
<SiteHealth :url="link.url" :sites="siteStatuses" :now="statusNow" />
<div class="card-actions">
  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'title')" :aria-label="'复制标题：' + link.name">{{ copiedKeys[link.url + ':title'] ? '✓ 已复制' : '复制标题' }}</button>
  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'url')" :aria-label="'复制 URL：' + link.name">{{ copiedKeys[link.url + ':url'] ? '✓ 已复制' : '复制 URL' }}</button>
</div>
</article>
                </li>
              <!-- 子分类显示更多按钮 -->
              <li v-if="hasMoreSubLinks(sub, category.name)" class="show-more-item">
                <el-button class="show-more-btn" @click="toggleCategory(category.name)">
                  显示更多 ({{ (sub.links || []).length - linksLimit }}个)
                </el-button>
              </li>
            </ul>
          </div>
          <!-- 子分类收起按钮 -->
          <div v-if="expandedCategories[category.name]" class="show-more-container">
            <el-button class="show-more-btn" @click="toggleCategory(category.name)">
              收起
            </el-button>
          </div>
        </template>

        <template v-else>
          <ul>
            <li v-for="link in getCategoryLinks(category)" :key="link.name">
               <article class="website-card">
<a :href="link.url" target="_blank" rel="noopener noreferrer" class="card-main">
                        <span class="link-heading">
                          <img
                            v-if="getFaviconUrl(link.url)"
                            :src="getFaviconUrl(link.url)"
                            class="favicon"
                            loading="lazy"
                            decoding="async"
                            @error="handleImageError($event, link.url)"
                          />
                          <span class="link-text">{{ link.name }}</span>
                          <template v-if="link.tag || (link.tags && link.tags.length)">
                            <el-tag v-for="(t, idx) in normalizeTags(link)" :key="idx" size="small" :type="getTagType(t)" class="link-mini-tag" effect="plain">{{ t }}</el-tag>
                          </template>
                        </span>
                        <span class="link-description">{{ link.description || '暂无简介' }}</span>
                    </a>
<div class="card-domain">{{ formatUrl(link.url) }}</div>
<SiteHealth :url="link.url" :sites="siteStatuses" :now="statusNow" />
<div class="card-actions">
  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'title')" :aria-label="'复制标题：' + link.name">{{ copiedKeys[link.url + ':title'] ? '✓ 已复制' : '复制标题' }}</button>
  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'url')" :aria-label="'复制 URL：' + link.name">{{ copiedKeys[link.url + ':url'] ? '✓ 已复制' : '复制 URL' }}</button>
</div>
</article>
                  </li>
            <!-- 显示更多按钮 -->
            <li v-if="hasMoreLinks(category)" class="show-more-item">
              <el-button class="show-more-btn" @click="toggleCategory(category.name)">
                显示更多 ({{ getCategoryCount(category) - linksLimit }}个)
              </el-button>
            </li>
            <!-- 收起按钮 -->
            <li v-if="expandedCategories[category.name]" class="show-more-item">
              <el-button class="show-more-btn" @click="toggleCategory(category.name)">
                收起
              </el-button>
            </li>
          </ul>
        </template>
      </div>
    </div>

    <div class="pagination-container" v-if="filteredCategories.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredCategories.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>

<script>
import SiteHealth from "./SiteHealth.vue";
import { loadSiteStatusAny, readCachedStatus } from "../utils/site-status.mjs";

// 巡检结果的候选来源。status.json 由 GitHub Actions 生成，只有 Pages 的 _site 里有；
// 托管在 Cloudflare Pages 等"直接传 dist/"的平台时本地没有这个文件，
// 会自动回退到 GitHub Pages 上的那份（那里带 Access-Control-Allow-Origin: *）。
const STATUS_SOURCES = [
  process.env.BASE_URL + 'status.json',
  process.env.VUE_APP_STATUS_FALLBACK || 'https://axaaaaa.github.io/status.json',
];
// 导入Element Plus的消息提示组件
import { ElMessage } from 'element-plus'; 
// 导入Element Plus图标
import { DocumentCopy, Search } from '@element-plus/icons-vue'; // 导入Element Plus图标
// 导入拼音工具函数，用于支持拼音首字母搜索
import { matchPinyin } from '../utils/pinyin.js'; 

// Favicon URL 缓存（模块级别，所有组件实例共享）
const faviconCache = new Map();


// 导航链接组件定义
export default {
  name: 'NavigationLinks',
  components: { DocumentCopy, Search, SiteHealth }, // 注册组件
  // 组件属性定义
  props: {
    categories: { type: Array, required: true }, // 导航分类数据
    currentTheme: { type: String, required: true }, // 当前主题（light/dark）
    targetCategory: { type: String, default: '' }, // 目标分类（用于滚动定位）
  },
  // 组件数据
  data() {
    return {
      siteStatuses: {},
      statusNow: Date.now(),
      statusController: null,
      statusTimeout: null,
      statusClock: null,
      statusRefresh: null,
      statusLoading: false,
      copiedKeys: {},
      copyTimers: {},
      currentPage: 1, // 当前页码
      pageSize: 4, // 每页显示分类数量
      linksLimit: 10, // 每个分类默认显示链接数量
      expandedCategories: {}, // 记录哪些分类已展开
      localSearchQuery: '', // 本地搜索关键词
      searchDebounceTimer: null, // 搜索防抖计时器
      selectedEngine: 'google', // 当前选择的外部搜索引擎
      searchText: '', // 搜索文本

      // 外部搜索引擎配置；输入框始终同步站内实时搜索
      searchEngines: [
        { label: 'Google', value: 'google', url: 'https://www.google.com/search?q=' },
        { label: 'Bing', value: 'bing', url: 'https://www.bing.com/search?q=' },
        { label: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd=' },
        { label: 'GitHub', value: 'github', url: 'https://github.com/search?q=' },
        { label: 'YouTube', value: 'youtube', url: 'https://www.youtube.com/results?search_query=' },
        { label: 'Bilibili', value: 'bilibili', url: 'https://search.bilibili.com/all?keyword=' },
        { label: '抖音', value: 'douyin', url: 'https://www.douyin.com/search?q=' },
        { label: '小红书', value: 'xiaohongshu', url: 'https://www.xiaohongshu.com/search_result?keyword=' },
        { label: 'Stack Overflow', value: 'stackoverflow', url: 'https://stackoverflow.com/search?q=' },
        { label: 'Reddit', value: 'reddit', url: 'https://www.reddit.com/search/?q=' },
        { label: 'Twitter/X', value: 'twitter', url: 'https://twitter.com/search?q=' },
        { label: 'Wikipedia', value: 'wikipedia', url: 'https://zh.wikipedia.org/w/index.php?search=' }
      ],
    };
  },
  // 组件卸载前执行
  mounted() {
    this.statusController = new AbortController();
    // 先用本地缓存顶上，避免首屏一片「未检测」
    this.siteStatuses = readCachedStatus();
    this.loadStatus();
    this.statusNow = Date.now();
    this.statusClock = setInterval(() => { this.statusNow = Date.now(); }, 60000);
    // 每 10 分钟重新拉一次，页面开久了也能跟上最新巡检
    this.statusRefresh = setInterval(() => this.loadStatus(), 600000);
  },
  beforeUnmount() {
    this.statusController?.abort();
    clearTimeout(this.statusTimeout);
    clearInterval(this.statusClock);
    clearInterval(this.statusRefresh);
    Object.values(this.copyTimers).forEach(clearTimeout);
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
  },
  // 计算属性
  computed: {
      // 过滤后的分类数据：根据搜索关键词筛选分类和链接
      filteredCategories() {
        const source = this.categories;
        const query = this.localSearchQuery.trim().toLowerCase();
        // 如果没有搜索关键词，返回所有分类
        if (!query) return source;
        
        // 判断是否为URL搜索
        const isUrl = query.startsWith('http') || query.startsWith('www.') || query.includes('.');
        const filtered = [];
        
        // 预计算拼音搜索条件
        const isPinyinQuery = /^[a-zA-Z]+$/.test(query);
        
        // 构建搜索函数，避免重复计算
        const shouldIncludeLink = (link) => {
          // URL搜索模式
          if (isUrl) {
            return link.url.toLowerCase().includes(query);
          }
          
          // 普通文本搜索：名称、描述、URL
          const linkName = link.name.toLowerCase();
          const linkDesc = (link.description || '').toLowerCase();
          const linkUrl = link.url.toLowerCase();
          
          // 完全匹配优先
          if (linkName.includes(query) || linkDesc.includes(query) || linkUrl.includes(query)) {
            return true;
          }
          
          // 拼音搜索（支持首字母和完整拼音）
          if (isPinyinQuery && link.name) {
            return matchPinyin(link.name, query);
          }
          
          return false;
        };
        
        // 使用for循环代替map和filter，减少中间对象创建
        for (let i = 0; i < source.length; i++) {
          const category = source[i];
          let hasMatchingLinks = false;
          let processedCategory = null;
          
          if (category.subCategories && category.subCategories.length > 0) {
            const filteredSubs = [];
            
            for (let j = 0; j < category.subCategories.length; j++) {
              const sub = category.subCategories[j];
              const links = sub.links || [];
              const filteredLinks = [];
              
              for (let k = 0; k < links.length; k++) {
                const link = links[k];
                if (shouldIncludeLink(link)) {
                  filteredLinks.push(link);
                }
              }
              
              if (filteredLinks.length > 0) {
                filteredSubs.push({ ...sub, links: filteredLinks });
                hasMatchingLinks = true;
              }
            }
            
            if (hasMatchingLinks) {
              processedCategory = { ...category, subCategories: filteredSubs };
            }
          } else if (category.links && category.links.length > 0) {
            const filteredLinks = [];
            
            for (let k = 0; k < category.links.length; k++) {
              const link = category.links[k];
              if (shouldIncludeLink(link)) {
                filteredLinks.push(link);
              }
            }
            
            if (filteredLinks.length > 0) {
              processedCategory = { ...category, links: filteredLinks };
              hasMatchingLinks = true;
            }
          }
          
          if (hasMatchingLinks) {
            filtered.push(processedCategory);
          }
        }
        
        return filtered;
      },
    // 搜索占位符
    searchPlaceholder() {
      const engine = this.searchEngines.find(e => e.value === this.selectedEngine);
      return `输入关键词：实时搜索站内，回车用 ${engine?.label || 'Google'} 搜索...`;
    },
    // 分页后的分类数据：根据当前页码和每页大小切片过滤后的数据
    paginatedCategories() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredCategories.slice(start, start + this.pageSize);
    }
  },
  // 监听器
  watch: {
    // 监听搜索关键词变化：添加防抖处理
    localSearchQuery: {
      handler() {
        // 清除旧的防抖计时器
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
        }
        // 设置新的防抖计时器
        this.searchDebounceTimer = setTimeout(() => {
          // 搜索时重置到第一页
          this.currentPage = 1;
        }, 200); // 200ms防抖延迟，减少不必要的计算
      },
      immediate: true // 立即执行
    },
    // 监听搜索文本变化：实时同步到站内搜索
    searchText(newVal) {
      this.localSearchQuery = newVal;
    },
    // 监听目标分类变化：滚动到指定分类
    targetCategory: {
      handler(newVal) { this.scrollToCategory(newVal); },
      immediate: true
    }
  },
  // 方法
  methods: {
    // 拉取巡检结果。失败时保留已有数据，不把页面打回「未检测」。
    loadStatus() {
      if (this.statusLoading) return;
      this.statusLoading = true;
      loadSiteStatusAny(STATUS_SOURCES, {
        signal: this.statusController?.signal,
        timeout: 25000,
      })
        .then(({ sites }) => {
          if (sites && Object.keys(sites).length) {
            this.siteStatuses = sites;
            this.statusNow = Date.now();
          }
        })
        .finally(() => { this.statusLoading = false; });
    },
    async copyCard(link, kind) {
      const key = link.url + ':' + kind;
      try {
        await navigator.clipboard.writeText(kind === 'title' ? link.name : link.url);
        this.copiedKeys[key] = true;
        clearTimeout(this.copyTimers[key]);
        this.copyTimers[key] = setTimeout(() => {
          delete this.copiedKeys[key];
          delete this.copyTimers[key];
        }, 1800);
      } catch { ElMessage.error('复制失败，请重试'); }
    },

    // 统一搜索处理
    handleSearch() {
      const query = this.searchText.trim();
      if (!query) return;
      const engine = this.searchEngines.find(e => e.value === this.selectedEngine);
      const searchUrl = engine?.url || 'https://www.google.com/search?q=';
      window.open(searchUrl + encodeURIComponent(query), '_blank');
    },
    // 搜索建议获取方法
    fetchSearchSuggestions(queryString, cb) {
      const results = [];
      if (!queryString.trim()) {
        cb(results);
        return;
      }
      
      const query = queryString.trim().toLowerCase();
      const isPinyinQuery = /^[a-zA-Z]+$/.test(query);
      const addedNames = new Set(); // 防止重复
      
      // 遍历所有分类和链接
      for (const category of this.categories) {
        // 检查分类下的直接链接
        if (category.links) {
          for (const link of category.links) {
            if (addedNames.has(link.name)) continue;
            
            const linkName = link.name.toLowerCase();
            const linkDesc = (link.description || '').toLowerCase();
            let matched = false;
            
            // 名称匹配
            if (linkName.includes(query)) {
              matched = true;
            }
            // 描述匹配
            else if (linkDesc.includes(query)) {
              matched = true;
            }
            // 拼音匹配（支持首字母和完整拼音）
            else if (isPinyinQuery) {
              matched = matchPinyin(link.name, query);
            }
            
            if (matched) {
              results.push({
                name: link.name,
                url: link.url,
                description: link.description,
                categoryName: category.name,
                value: link.name // 用于 el-autocomplete 的 value-key
              });
              addedNames.add(link.name);
            }
            
            if (results.length >= 10) break; // 最多10条建议
          }
        }
        
        // 检查子分类下的链接
        if (category.subCategories) {
          for (const sub of category.subCategories) {
            if (sub.links) {
              for (const link of sub.links) {
                if (addedNames.has(link.name)) continue;
                
                const linkName = link.name.toLowerCase();
                const linkDesc = (link.description || '').toLowerCase();
                let matched = false;
                
                if (linkName.includes(query)) {
                  matched = true;
                } else if (linkDesc.includes(query)) {
                  matched = true;
                } else if (isPinyinQuery) {
                  matched = matchPinyin(link.name, query);
                }
                
                if (matched) {
                  results.push({
                    name: link.name,
                    url: link.url,
                    description: link.description,
                    categoryName: `${category.name} > ${sub.name}`,
                    value: link.name
                  });
                  addedNames.add(link.name);
                }
                
                if (results.length >= 10) break;
              }
            }
            if (results.length >= 10) break;
          }
        }
        
        if (results.length >= 10) break;
      }
      
      cb(results);
    },
    // 选择建议项处理
    handleSuggestionSelect(item) {
      this.searchText = item.name;
      this.localSearchQuery = item.name;
    },
    // 粘贴剪贴板内容
    async pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.searchText = text;
        }
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    },
    // 复制链接功能
    async copyLink(url) {
      try {
        // 使用Clipboard API复制链接
        await navigator.clipboard.writeText(url);
        // 显示复制成功消息
        ElMessage({
          message: this.currentTheme === 'dark' ? '>> SYSTEM: URL COPIED TO CLIPBOARD.' : '链接已复制到剪贴板',
          type: 'success',
          customClass: this.currentTheme === 'dark' ? 'dark-message' : '',
          duration: 2000,
        });
      } catch (err) {
        // 复制失败处理
        ElMessage.error('Copy Failed');
      }
    },
    // 复制标题功能
    async copyTitle(title) {
      try {
        await navigator.clipboard.writeText(title);
        ElMessage({
          message: this.currentTheme === 'dark' ? '>> SYSTEM: TITLE COPIED TO CLIPBOARD.' : '标题已复制到剪贴板',
          type: 'success',
          customClass: this.currentTheme === 'dark' ? 'dark-message' : '',
          duration: 2000,
        });
      } catch (err) {
        ElMessage.error('Copy Failed');
      }
    },

    formatUrl(url) {
      try {
        return new URL(url).hostname;
      } catch {
        return 'UNKNOWN HOST';
      }
    },

    getCategoryCount(category) {
      if (category.subCategories && category.subCategories.length > 0) {
        return category.subCategories.reduce((acc, sub) => acc + (sub.links ? sub.links.length : 0), 0);
      }
      return category.links ? category.links.length : 0;
    },
    normalizeTags(link) {
      if (Array.isArray(link.tags)) return link.tags;
      if (typeof link.tag === 'string' && link.tag.trim()) return [link.tag.trim()];
      return [];
    },
    getTagType(tag) {
      const t = (tag || '').trim();
      if (['开源', 'Open Source', 'OSS'].includes(t)) return 'success';
      if (['免费', 'Free'].includes(t)) return 'success'; // 免费也用绿色
      if (['收费', '付费', 'Pro', '订阅'].includes(t)) return 'danger'; // 收费用红色
      if (['内测', 'Beta'].includes(t)) return 'warning';
      return null;
    },
    // 获取网站图标URL（带缓存）
    getFaviconUrl(url) {
      // 检查缓存
      if (faviconCache.has(url)) {
        return faviconCache.get(url);
      }
      
      try {
        const domain = new URL(url).hostname;
        const faviconUrl = `https://favicon.yandex.net/favicon/${domain}`;
        // 存入缓存
        faviconCache.set(url, faviconUrl);
        return faviconUrl;
      } catch {
        const defaultUrl = '/default-favicon.ico';
        faviconCache.set(url, defaultUrl);
        return defaultUrl;
      }
    },
    handleImageError(event, url) {
      const img = event.target;
      try {
        const domain = new URL(url).hostname;
        if (img.src.includes('yandex.net')) {
          img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } else { img.src = '/default-favicon.ico'; }
      } catch (e) { img.style.display = 'none'; }
    },
    handlePageChange(page) { this.currentPage = page; },
    // 获取分类的链接列表（考虑展开状态）
    getCategoryLinks(category) {
      const links = category.links || [];
      const isExpanded = this.expandedCategories[category.name];
      if (isExpanded || links.length <= this.linksLimit) {
        return links;
      }
      return links.slice(0, this.linksLimit);
    },
    // 获取子分类的链接列表（考虑展开状态）
    getSubLinks(sub, categoryName) {
      const links = sub.links || [];
      const isExpanded = this.expandedCategories[categoryName];
      if (isExpanded || links.length <= this.linksLimit) {
        return links;
      }
      return links.slice(0, this.linksLimit);
    },
    // 判断子分类是否需要显示"更多"按钮
    hasMoreSubLinks(sub, categoryName) {
      const total = (sub.links || []).length;
      return total > this.linksLimit && !this.expandedCategories[categoryName];
    },
    // 判断是否需要显示"更多"按钮
    hasMoreLinks(category) {
      const total = this.getCategoryCount(category);
      return total > this.linksLimit && !this.expandedCategories[category.name];
    },
    // 展开/收起分类
    toggleCategory(categoryName) {
      this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
    },
    scrollToCategory(categoryName) {
      if (!categoryName) return;
      const idx = this.filteredCategories.findIndex(c => c.name === categoryName);
      if (idx === -1) return;
      const targetPage = Math.floor(idx / this.pageSize) + 1;
      if (this.currentPage !== targetPage) this.currentPage = targetPage;
      this.$nextTick(() => {
        const el = document.querySelector(`[data-category="${categoryName}"]`);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    },
    scrollToSubCategory(categoryName, subName) {
      const idx = this.filteredCategories.findIndex(c => c.name === categoryName);
      if (idx === -1) return;
      this.currentPage = Math.floor(idx / this.pageSize) + 1;
      this.$nextTick(() => {
        const category = [...document.querySelectorAll('[data-category]')]
          .find(el => el.dataset.category === categoryName);
        const sub = [...(category?.querySelectorAll('[data-sub-category]') || [])]
          .find(el => el.dataset.subCategory === subName);
        if (sub) sub.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    },
    // 清空站内搜索框
    clearSearch() {
      this.localSearchQuery = '';
      this.searchText = '';
    },
    // 展开指定分类
    expandCategory(categoryName) {
      this.expandedCategories[categoryName] = true;
    }
  }
}
</script>

<style>
/* 暗黑风格下拉菜单 - 黑客帝国绿 */
.dark-dropdown.el-popper {
  background-color: rgba(10, 10, 10, 0.95) !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.2) !important;
}
.dark-dropdown.el-popper__arrow::before {
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

/* 暗黑 Popover 样式 - 黑客帝国绿 */
.dark-popover.el-popper {
  background-color: rgba(10, 10, 10, 0.96) !important; 
  border: 1px solid rgba(0, 255, 65, 0.3) !important;            
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.2) !important; 
  padding: 0 !important; 
  color: #00cc33 !important;
  min-width: 280px !important;
}
.dark-popover.el-popper .el-popper__arrow::before {
  background-color: #0a0a0a !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
}

/* 暗黑 Message (Toast) 样式 - 黑客帝国绿 */
.dark-message {
  background-color: rgba(10, 10, 10, 0.95) !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.2) !important;
  min-width: 300px !important;
}
.dark-message .el-message__content {
  color: #00ff41 !important;
  font-family: 'Consolas', monospace !important;
  font-weight: bold;
}
.dark-message .el-icon {
  color: #00cc33 !important;
}
/* Information cards shared by normal and subcategory links. */
.website-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  min-height: 132px;
  padding: 18px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: #fff;
  color: #303133;
  text-decoration: none;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.website-card:hover, .website-card:focus-visible {
  border-color: #409eff;
  box-shadow: 0 6px 18px rgba(41, 91, 148, .1);
  transform: translateY(-2px);
}
.website-card:focus-visible { outline: 2px solid #409eff; outline-offset: 3px; }
.link-heading { display: flex; align-items: center; min-width: 0; width: 100%; }
.website-card .link-text { font-size: 15px; font-weight: 600; line-height: 22px; }
.link-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  color: #737d8c;
  font-size: 13px;
  line-height: 1.65;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: left;
}
.dark-theme .website-card {
  background: #0f0f0f;
  border-color: rgba(0, 255, 65, .22);
  color: var(--dark-text-primary, #00ff41);
}
.dark-theme .website-card .link-description { color: #80b98c; }
.dark-theme .website-card:hover, .dark-theme .website-card:focus-visible {
  border-color: #00cc33;
  background: #142017;
  box-shadow: 0 6px 18px rgba(0, 255, 65, .06);
  outline-color: #00cc33;
}
@media (prefers-reduced-motion: reduce) {
  .website-card { transition: none; }
  .website-card:hover, .website-card:focus-visible { transform: none; }
}

/* Card navigation and copy controls are separate interactive elements. */
.website-card { padding: 0; gap: 0; height: 100%; }
.card-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding: 18px 18px 12px;
  color: inherit;
  text-decoration: none;
  min-width: 0;
}
.card-actions {
  display: flex;
  gap: 8px;
  margin: 0 18px;
  padding: 10px 0 14px;
  border-top: 1px solid #eef1f5;
}
.card-copy-btn {
  border: 1px solid #e4e7ed;
  border-radius: 5px;
  padding: 5px 9px;
  background: #f7f9fc;
  color: #606b7b;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.card-copy-btn:hover { color: #2563b0; border-color: #9ac5f3; background: #edf5ff; }
.card-main:focus-visible, .card-copy-btn:focus-visible { outline: 2px solid #409eff; outline-offset: 2px; border-radius: 5px; }
.dark-theme .card-actions { border-color: rgba(0,255,65,.15); }
.dark-theme .card-copy-btn { color: #80b98c; background: #142017; border-color: rgba(0,255,65,.22); }
.dark-theme .card-copy-btn:hover { color: #00ff41; border-color: #00cc33; }

/* Consistent card identity and quieter controls. */
.website-card { position: relative; }
.website-card:hover { transform: none; box-shadow: 0 3px 12px rgba(41,91,148,.07); }
.card-main { padding: 16px 16px 10px; }
.link-heading { padding-right: 0; box-sizing: border-box; flex-wrap: wrap; row-gap: 6px; }


.card-domain { margin: 0 16px 8px; color: #8793a5; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-actions { margin: 0 16px; padding: 8px 0 10px; }
.card-copy-btn { border-color: transparent; background: transparent; padding: 4px 6px; min-width: 64px; }





.dark-theme .card-domain { color: #7f9f87; }



.dark-theme .card-copy-btn { background: transparent; border-color: transparent; }

</style>

<style scoped>
/* Popover 样式 */
.popover-content {
  padding: 10px 12px;
  font-size: 13px;
}

.pop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pop-title {
  font-weight: bold;
}

.pop-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pop-desc {
  color: #666;
  margin-bottom: 8px;
}

.pop-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pop-url {
  font-size: 11px;
  color: #999;
}

.dark-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #409eff;
  font-size: 11px;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 3px;
}

.dark-btn:hover {
  background: #f5f5f5;
  color: #66b1ff;
}

/* 暗黑模式 - 黑客帝国绿 */
.dark-content {
  color: #00ff41;
}

.dark-content .pop-desc {
  color: #00cc33;
}

.dark-content .pop-url {
  color: rgba(0, 255, 65, 0.6);
}

.dark-content .dark-btn {
  border-color: rgba(0, 255, 65, 0.3);
  color: #00ff41;
}

.dark-content .dark-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  color: #39ff14;
}

/* 导航容器样式 */
.navigation {
  padding: 16px;
  margin-top: 20px;
}
.category { 
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  scroll-margin-top: 80px;
}

.dark-theme .category {
  background: #0f0f0f;
  border-color: rgba(0, 255, 65, 0.2);
}

.category-title {
  margin: 0;
  padding: 12px 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.dark-theme .category-title {
  border-bottom-color: rgba(0, 255, 65, 0.2);
  color: var(--dark-text-primary, #00ff41);
}

.sub-category-group { margin-bottom: 15px; }
.sub-category-group:last-child { margin-bottom: 0; }
.subcategory-title {
  font-size: 14px;
  color: #606266;
  margin: 12px 0 8px 0;
  padding-left: 5px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.dark-theme .subcategory-title { color: var(--dark-text-secondary, #00cc33); }
.sub-emoji {
  margin-right: 4px;
  font-size: 16px;
}
.links-container { padding: 15px; }
.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
.show-more-item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.show-more-item .show-more-btn {
  width: 100%;
  height: 45px;
  font-size: 12px;
  padding: 0 12px;
  color: #909399;
  border: 1px dashed #dcdfe6;
  background: transparent;
  border-radius: 4px;
  justify-content: center;
}
.show-more-item .show-more-btn:hover {
  color: #409EFF;
  border-color: #409EFF;
}
.dark-theme .show-more-item .show-more-btn {
  color: var(--dark-text-muted, #008822);
  border-color: rgba(0, 255, 65, 0.2);
}
.dark-theme .show-more-item .show-more-btn:hover {
  color: var(--dark-text-link, #39ff14);
  border-color: rgba(0, 255, 65, 0.5);
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); 
  gap: 12px;
}
.el-button {
  width: 100%;
  height: 45px;
  font-size: 14px;
  justify-content: flex-start;
  padding: 0 12px;
}
.el-button :deep(> span) {
  display: flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
}
.link-text { 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  flex: 1;
  min-width: 0;
  text-align: left;
}
.link-mini-tag {
  height: 20px !important;       
  padding: 0 6px !important;    
  margin-left: 4px !important;  
  border-radius: 3px !important; 
  font-size: 11px !important;    
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1 !important;
  flex-shrink: 0;
}
.favicon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 4px;
  flex-shrink: 0; 
}
.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 30px;
}
.pagination-top { margin-bottom: 40px; }
/* 暗黑模式下标签 - 黑客帝国绿 */
.dark-theme :deep(.el-tag) {
  background-color: transparent !important;
}
.dark-theme :deep(.el-tag--success) {
  border-color: #00ff41 !important;
  color: #00ff41 !important;
}
.dark-theme :deep(.el-tag--warning) {
  border-color: #ffcc00 !important;
  color: #ffcc00 !important;
}
.dark-theme :deep(.el-tag--danger) {
  border-color: #ff4444 !important;
  color: #ff4444 !important;
}
.dark-theme :deep(.el-tag:not([class*='el-tag--']) ) {
  border-color: #00ff41 !important;
  color: #00ff41 !important;
}
.dark-theme :deep(.el-tag--small) {
  font-size: 11px !important;
  padding: 0 6px !important;
  height: 20px !important;
}
.dark-theme .el-button.el-button--primary {
  background-color: #0f0f0f;
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41);
}
.dark-theme .el-button.el-button--primary:hover {
  background-color: #1a2a1a;
  color: var(--dark-text-link, #39ff14);
  border-color: rgba(0, 255, 65, 0.5);
}
.category-count {
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 10px;
  background-color: #e4e7ed;
  color: #909399;
}
.dark-theme .category-count {
  background-color: transparent;
  border: 1px solid rgba(0, 255, 65, 0.3);
  color: var(--dark-text-muted, #008822);
}
.search-bar-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}
.engine-select {
  width: 120px;
  flex-shrink: 0;
}
.engine-select :deep(.el-input__wrapper) {
  height: 32px;
}
.search-bar-compact .search-input {
  flex: 1;
}
.search-bar-compact .search-input :deep(.el-input__wrapper) {
  height: 32px;
}
/* 放大清除按钮图标 */
.search-bar-compact :deep(.el-input__clear) {
  font-size: 18px;
}
.paste-btn {
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  padding: 0;
  border-radius: 4px !important;  /* 矩形圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-btn {
  flex-shrink: 0;
  height: 32px;
  width: 65px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-btn .el-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-theme .search-btn {
  background: rgba(10, 10, 10, 0.8);
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41);
}
.dark-theme .search-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
  border-color: rgba(0, 255, 65, 0.5);
}
.dark-theme .search-bar-compact .search-input :deep(.el-input__wrapper) {
  background-color: #0f0f0f !important;
  border-color: rgba(0, 255, 65, 0.3) !important;
  box-shadow: none !important;
}
.dark-theme .search-bar-compact .search-input :deep(.el-input__inner) {
  color: var(--dark-text-primary, #00ff41) !important;
}
.dark-theme .paste-btn {
  background: rgba(10, 10, 10, 0.8);
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--dark-text-primary, #00ff41);
}
.dark-theme .paste-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  color: var(--dark-text-link, #39ff14);
  border-color: rgba(0, 255, 65, 0.5);
}
.dark-theme :deep(.el-pagination.is-background .el-pager li),
.dark-theme :deep(.el-pagination.is-background .btn-prev),
.dark-theme :deep(.el-pagination.is-background .btn-next) {
  background-color: transparent !important;
  color: var(--dark-text-primary, #00ff41) !important;
  border: 1px solid rgba(0, 255, 65, 0.2) !important;
}
.dark-theme :deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: rgba(0, 255, 65, 0.15) !important;
  color: var(--dark-text-link, #39ff14) !important;
}
.dark-theme :deep(.el-pagination.is-background button:disabled) {
  color: var(--dark-text-muted, #008822) !important;
  border-color: rgba(0, 255, 65, 0.1) !important;
}

/* 暗黑主题导航容器样式 - 黑客帝国绿 */
.navigation.dark-theme {
  background-color: #0a0a0a !important;
}
@media (max-width: 768px) {
  .navigation { padding: 10px; }
  ul { 
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)) !important;
    gap: 6px; 
  }
  .el-button { height: auto; min-height: 35px; padding: 6px; }
  .search-bar-compact {
    padding: 10px;
  }
  .dark-theme .category { background: transparent !important; }
  .dark-theme .el-button.el-button--primary { background-color: rgba(0,0,0,0.2) !important; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .no-result-wrapper {
    width: 90%;
    margin: 0 auto;
  }
}

/* 搜索建议样式 */
.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}
.suggestion-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.suggestion-category {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
  flex-shrink: 0;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 暗色主题搜索建议样式 - 黑客帝国绿 */
.dark-autocomplete {
  background-color: #0f0f0f !important;
  border: 1px solid rgba(0, 255, 65, 0.3) !important;
}
.dark-autocomplete .el-autocomplete-suggestion__list li {
  background-color: #0f0f0f !important;
  color: #00cc33 !important;
}
.dark-autocomplete .el-autocomplete-suggestion__list li:hover {
  background-color: rgba(0, 255, 65, 0.1) !important;
}
.dark-autocomplete .suggestion-name {
  color: #00ff41;
}
.dark-autocomplete .suggestion-category {
  color: #008822;
  background: rgba(0, 255, 65, 0.1);
}

</style>
