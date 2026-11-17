<template>



  <div class="navigation" :class="{ 'dark-theme': currentTheme === 'dark' }">



    



    <section class="search-cosmic-panel" aria-label="搜索与分页">



      <SearchBackground :dark="currentTheme === 'dark'" />



      <div class="search-bar-compact">
        <Teleport :to="siteSearchTarget || 'body'" :disabled="narrowViewport || !siteSearchTarget">
        <div class="unified-search-control site-search-control">
          <el-autocomplete
            v-model="searchText"
            data-typing-sound
            aria-label="站内搜索"
            placeholder="搜索站内网站…"
            clearable
            class="search-input"
            :class="{ 'has-search-illustration': !searchText }"
            :fetch-suggestions="fetchSearchSuggestions"
            :trigger-on-focus="false"
            :popper-class="currentTheme === 'dark' ? 'dark-autocomplete' : ''"
            @select="handleSuggestionSelect"
            value-key="name"
          >
            <template #prefix><el-icon class="site-search-icon"><Search /></el-icon></template>
            <template #suffix><SearchPlanet /></template>
            <template #default="{ item }">
              <div class="suggestion-item">
                <span class="suggestion-name"><HighlightText :text="item.name" :query="localSearchQuery" /></span>
                <span v-if="item.categoryName" class="suggestion-category"><HighlightText :text="item.categoryName" :query="localSearchQuery" /></span>
              </div>
            </template>
          </el-autocomplete>
          <el-button @click="pasteFromClipboard" class="paste-btn" title="粘贴" aria-label="粘贴到站内搜索">
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
        </div>
        </Teleport>

        <div class="engine-unified-bar">
          <el-select v-model="selectedEngine" class="engine-select" popper-class="homepage-engine-dropdown" aria-label="选择搜索引擎">
            <template #label>
              <span class="engine-selected-content">
                <img v-if="selectedEngineIcon" class="engine-brand-icon engine-selected-icon" :src="selectedEngineIcon" alt="" />
                <span class="engine-selected-label">{{ selectedEngineLabel }}</span>
              </span>
            </template>
            <el-option v-for="engine in searchEngines" :key="engine.value" :label="engine.label" :value="engine.value">
              <span class="engine-option-content"><img class="engine-brand-icon" :src="engine.icon" alt="" /><span class="engine-option-label">{{ engine.label }}</span></span>
            </el-option>
          </el-select>
          <form class="unified-search-control" @submit.prevent="handleSelectedEngineSearch">
            <el-input
              v-model="engineQueries[selectedEngine]"
              data-typing-sound
              class="search-input"
              :aria-label="selectedEngineLabel + ' 搜索关键词'"
              clearable
            />
            <el-button
              native-type="submit"
              class="search-btn"
              :title="'用 ' + selectedEngineLabel + ' 搜索'"
              :aria-label="'用 ' + selectedEngineLabel + ' 搜索'"
            >
              <el-icon><Search /></el-icon>
            </el-button>
          </form>
          <button type="button" class="engine-expand-toggle" :aria-expanded="enginesExpanded" @click="enginesExpanded = !enginesExpanded">{{ enginesExpanded ? '收起全部引擎' : '展开全部引擎' }}</button>
        </div>

        <div v-show="enginesExpanded" class="engine-search-grid" role="group" aria-label="外部搜索引擎">
          <details v-for="engine in searchEngines" :key="engine.value" class="engine-search-item" :open="enginesExpanded">
            <summary>
              <img class="engine-brand-icon" :src="engine.icon" alt="" />
              <span>{{ engine.label }}</span>
            </summary>
            <form class="unified-search-control" @submit.prevent="handleEngineSearch(engine)">
              <el-input
                v-model="engineQueries[engine.value]"
                data-typing-sound
                class="search-input"
                :aria-label="engine.label + ' 搜索关键词'"
                clearable
              />
              <el-button
                native-type="submit"
                class="search-btn"
                :title="'用 ' + engine.label + ' 搜索'"
                :aria-label="'用 ' + engine.label + ' 搜索'"
              >
                <el-icon><Search /></el-icon>
              </el-button>
            </form>
          </details>
        </div>
      </div>
    </section>















    <div v-show="!localSearchQuery.trim()" class="information-sources-controls">



      <h2>信息收集</h2>

      <SourceSyncStatus />



      <button type="button" class="sources-collapse-toggle" :aria-expanded="hotspotsExpanded" aria-controls="information-source-cards" @click="hotspotsExpanded = !hotspotsExpanded"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'sources-is-expanded': hotspotsExpanded }"><path d="m9 5 7 7-7 7"/></svg>{{ hotspotsExpanded ? '全部收缩' : '全部展开' }}</button>



    </div>





    <XGlobalEvents :data-source-theme="sourceCardTheme('x-events', currentTheme === 'dark')" ref="xGlobalEvents" v-show="!localSearchQuery.trim() && hotspotsExpanded" :dark="currentTheme === 'dark'" @select-event="$refs.xNewsHub.selectEvent($event)" />

    <AiDigestPanel v-show="!localSearchQuery.trim() && hotspotsExpanded" :dark="currentTheme === 'dark'" />

    <nav v-show="!localSearchQuery.trim()" class="source-category-tabs" role="tablist" aria-label="信息来源分类">
      <button v-for="tab in sourceCategoryTabs" :key="tab.id" :id="`source-tab-${tab.id}`" type="button" role="tab" :aria-selected="sourceCategory===tab.id" :tabindex="sourceCategory===tab.id?0:-1" aria-controls="information-source-cards" @click="selectSourceCategory(tab.id)" @keydown="onSourceTabKey($event,tab.id)"><span class="source-tab-icon" aria-hidden="true" :style="{ '--source-tab-glyph': 'url(' + tab.icon + ')' }"></span>{{tab.label}}</button>
    </nav>





    <div :aria-labelledby="`source-tab-${sourceCategory}`" role="tabpanel" id="information-source-cards" @click.capture="rememberSourceCardHeight" v-show="!localSearchQuery.trim()" class="hotspots-row" :class="{ 'sources-collapsed': !hotspotsExpanded, 'source-preview-rows': sourceCategory === 'all' && !showAllSourceCards }">



      <XNewsHub ref="xNewsHub" :data-source-theme="sourceCardTheme('x-hot', currentTheme === 'dark')" v-show="sourceVisible('x')" :dark="currentTheme === 'dark'" @clear-event="$refs.xGlobalEvents.clearSelection()" />










      <NewsHotspotHub :data-source-theme="sourceCardTheme('news-hotspot', currentTheme === 'dark')" v-show="sourceVisible('weibo')" :dark="currentTheme === 'dark'" />




      <SourceNewsCard :data-source-theme="sourceCardTheme(sourceId, currentTheme === 'dark')" v-show="sourceVisible(sourceId)" v-for="sourceId in ['short_video','video_hot','tech_news','world_news','ai_official','cn_ai','yicai','design_hub','douban','dongchedi','steam_top','pojie52','sec_forums','vendor_security','threat_research','nvd']" :key="sourceId" :source-id="sourceId" :dark="currentTheme === 'dark'" />

      <GithubTrending v-show="sourceVisible('github')" :dark="currentTheme === 'dark'" />



    </div>

    <div v-if="!localSearchQuery.trim() && sourceCategory === 'all'" class="all-sources-more">
      <button type="button" class="sources-collapse-toggle" :aria-expanded="showAllSourceCards" aria-controls="information-source-cards" @click="showAllSourceCards = !showAllSourceCards">
        {{ showAllSourceCards ? '收起更多' : '展示更多' }}
      </button>
    </div>







    <div v-show="!localSearchQuery.trim()" class="dashboard-hubs-row">
    <section v-show="!localSearchQuery.trim()" class="market-hub" :class="{'market-hub-dark':currentTheme === 'dark'}" aria-label="市场行情与费用换算">
      <nav class="market-hub-tabs" aria-label="市场工具切换">
        <button v-for="tab in [{id:'market',label:'📈 市场行情'},{id:'currency',label:'💱 多币种费用换算'}]" :key="tab.id" type="button" :aria-pressed="marketHubTab===tab.id" :aria-controls="`market-hub-${tab.id}`" @click="marketHubTab=tab.id">{{tab.label}}</button>
      </nav>
      <div id="market-hub-market" v-show="marketHubTab==='market'"><MarketOverview ref="marketOverview" :dark="currentTheme === 'dark'" /></div>
      <div id="market-hub-currency" v-show="marketHubTab==='currency'"><CurrencyConverter ref="currencyConverter" :dark="currentTheme === 'dark'" /></div>
    </section>



    <section v-show="!localSearchQuery.trim()" class="time-hub" :class="{'time-hub-dark': currentTheme === 'dark', 'time-hub-apod-open': timeHubTab === 'apod'}" aria-label="时间与日历">
      <nav class="time-hub-tabs" aria-label="时间与日历功能切换">
        <button v-for="tab in [{id:'world',label:'🌍 世界时间'},{id:'calendar',label:'📅 中国节假日日历'},{id:'history',label:'📜 历史上的今天'},{id:'apod',label:'🔭 每日宇宙图'}]" :key="tab.id" type="button" :aria-pressed="timeHubTab===tab.id" :aria-controls="`time-hub-${tab.id}`" @click="timeHubTab=tab.id">{{tab.label}}</button>
      </nav>
      <div id="time-hub-world" v-show="timeHubTab==='world'"><WorldTime ref="worldTime" :dark="currentTheme === 'dark'" /></div>
      <div id="time-hub-calendar" v-show="timeHubTab==='calendar'"><ChinaCalendar ref="chinaCalendar" :dark="currentTheme === 'dark'" /></div>
      <div id="time-hub-history" v-show="timeHubTab==='history'"><HistoryToday ref="historyToday" :dark="currentTheme === 'dark'" /></div>
      <div id="time-hub-apod" v-show="timeHubTab==='apod'"><NasaApod v-if="timeHubTab==='apod'" /></div>
    </section>
    </div>







    <section v-show="!localSearchQuery.trim()" class="module-quick-entry" aria-label="模块快捷入口">
      <header class="module-quick-head">
        <div><span class="module-quick-eyebrow">KNOWLEDGE &amp; TOOLS</span><h3>模块快捷入口</h3></div>
        <small>点击直接展开并定位到模块</small>
      </header>
      <div class="module-quick-groups">
        <div v-for="group in moduleGroups" :key="group.id" class="module-quick-group">
          <span class="module-quick-label">{{ group.title }}</span>
          <div class="module-quick-grid">
            <button v-for="item in group.items" :key="item.id" type="button" class="module-quick-item" @click="$emit('module-jump', item)">
              <component :is="item.icon" class="module-quick-icon" aria-hidden="true" /><span>{{ item.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <BrowserFingerprint v-show="!localSearchQuery.trim()" class="homepage-fingerprint" :dark="currentTheme === 'dark'" @located="$emit('located', $event)" />







    <div v-if="localSearchQuery && filteredCategories.length === 0" class="no-result-wrapper">



      <el-empty description="未找到相关内容" :image-size="160">
        <template #image>
          <img src="../assets/retro-pc-no-match.svg" alt="" width="160" height="108">
        </template>
      </el-empty>



    </div>







    <div v-for="category in paginatedCategories" :key="category.name" class="category" :data-category="category.name">



      <h2 class="category-title">



        <CategoryPixelBadge :name="category.name" style="margin-right: 4px;" />



        <HighlightText :text="category.name" :query="localSearchQuery" />



        <span class="category-count">{{ getCategoryCount(category) }}</span>



      </h2>







      <div class="links-container">



        <template v-if="category.subCategories && category.subCategories.length > 0">



          <div class="subcategory-tabs" role="tablist" :aria-label="category.name + '子分类'">



            <button v-for="(tab, tabIndex) in category.subCategories" :key="tab.name"



              type="button" role="tab" class="subcategory-tab"



              :class="{ 'is-selected': selectedSubcategory(category) === tab.name }"



              :aria-selected="selectedSubcategory(category) === tab.name"



              :tabindex="selectedSubcategory(category) === tab.name ? 0 : -1"



              @click="activeSubcategories[category.name] = tab.name"



              @keydown="handleSubcategoryKey($event, category, tabIndex)">



              <CategoryIcon :icon="tab.icon" :emoji="tab.emoji" />



              <HighlightText :text="tab.name" :query="localSearchQuery" />



              <span class="subcategory-tab-count">{{ (tab.links || []).length }}</span>



            </button>



          </div>



          <div v-for="sub in visibleSubcategories(category)" :key="sub.name" class="sub-category-group" role="tabpanel" :aria-label="sub.name" :data-sub-category="sub.name">



            <h3 class="subcategory-title">



              <CategoryIcon :icon="sub.icon" :emoji="sub.emoji" class="sub-emoji" />



              <HighlightText :text="sub.name" :query="localSearchQuery" />



            </h3>



            <ul>



              <li v-for="link in getSubLinks(sub, category.name)" :key="link.name">



                <article v-card-scramble="currentTheme === 'dark'" :data-link-url="link.url" :data-link-name="link.name" :tabindex="-1" :class="{ 'is-search-located': locatedLinkKey === locationKey(category.name, sub.name, link) }" class="website-card" @pointerenter="updateCardGlow" @pointermove="updateCardGlow" @pointerleave="clearCardGlow" @pointercancel="clearCardGlow">



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



                        <span class="link-text"><HighlightText :text="link.name" :query="localSearchQuery" /></span>



                        <template v-if="link.tag || (link.tags && link.tags.length)">



                          <el-tag v-for="(t, idx) in normalizeTags(link)" :key="idx" size="small" :type="getTagType(t)" class="link-mini-tag" effect="plain">{{ t }}</el-tag>



                        </template>



                      </span>



                        <span class="link-description"><HighlightText :text="link.description || '暂无简介'" :query="localSearchQuery" /></span>



                    </a>



<div class="card-domain">{{ formatUrl(link.url) }}</div>



<div v-if="localSearchQuery.trim()" class="search-result-location">



  <span class="search-result-path" :title="[category.name, sub.name].filter(Boolean).join(' › ')">{{ [category.name, sub.name].filter(Boolean).join(' › ') }}</span>



  <button type="button" class="locate-result-btn" :aria-label="'定位原位置：' + link.name + '，' + [category.name, sub.name].filter(Boolean).join('，')" @click.stop="locateSearchResult(category.name, sub.name, link)">定位原位置</button>



</div>



<div class="card-actions">



  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'title')" :aria-label="'复制标题：' + link.name" :title="copiedKeys[link.url + ':title'] ? '已复制' : '复制标题'"><el-icon aria-hidden="true"><Check v-if="copiedKeys[link.url + ':title']" /><DocumentCopy v-else /></el-icon></button>



  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'url')" :aria-label="'复制 URL：' + link.name" :title="copiedKeys[link.url + ':url'] ? '已复制' : '复制 URL'"><el-icon aria-hidden="true"><Check v-if="copiedKeys[link.url + ':url']" /><Link v-else /></el-icon></button>



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



               <article v-card-scramble="currentTheme === 'dark'" :data-link-url="link.url" :data-link-name="link.name" :tabindex="-1" :class="{ 'is-search-located': locatedLinkKey === locationKey(category.name, '', link) }" class="website-card" @pointerenter="updateCardGlow" @pointermove="updateCardGlow" @pointerleave="clearCardGlow" @pointercancel="clearCardGlow">



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



                          <span class="link-text"><HighlightText :text="link.name" :query="localSearchQuery" /></span>



                          <template v-if="link.tag || (link.tags && link.tags.length)">



                            <el-tag v-for="(t, idx) in normalizeTags(link)" :key="idx" size="small" :type="getTagType(t)" class="link-mini-tag" effect="plain">{{ t }}</el-tag>



                          </template>



                        </span>



                        <span class="link-description"><HighlightText :text="link.description || '暂无简介'" :query="localSearchQuery" /></span>



                    </a>



<div class="card-domain">{{ formatUrl(link.url) }}</div>



<div v-if="localSearchQuery.trim()" class="search-result-location">



  <span class="search-result-path" :title="[category.name, ''].filter(Boolean).join(' › ')">{{ [category.name, ''].filter(Boolean).join(' › ') }}</span>



  <button type="button" class="locate-result-btn" :aria-label="'定位原位置：' + link.name + '，' + [category.name, ''].filter(Boolean).join('，')" @click.stop="locateSearchResult(category.name, '', link)">定位原位置</button>



</div>



<div class="card-actions">



  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'title')" :aria-label="'复制标题：' + link.name" :title="copiedKeys[link.url + ':title'] ? '已复制' : '复制标题'"><el-icon aria-hidden="true"><Check v-if="copiedKeys[link.url + ':title']" /><DocumentCopy v-else /></el-icon></button>



  <button type="button" class="card-copy-btn" @click.stop="copyCard(link, 'url')" :aria-label="'复制 URL：' + link.name" :title="copiedKeys[link.url + ':url'] ? '已复制' : '复制 URL'"><el-icon aria-hidden="true"><Check v-if="copiedKeys[link.url + ':url']" /><Link v-else /></el-icon></button>



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
import CategoryPixelBadge from './CategoryPixelBadge.vue';
import sourceIcon0 from '../assets/hackernoon-pixels/grid.svg';
import sourceIcon1 from '../assets/hackernoon-pixels/fire.svg';
import sourceIcon2 from '../assets/hackernoon-pixels/laptop-code.svg';
import sourceIcon3 from '../assets/hackernoon-pixels/lock.svg';
import sourceIcon4 from '../assets/hackernoon-pixels/chart-line.svg';
import sourceIcon5 from '../assets/hackernoon-pixels/paint-brush.svg';
import sourceIcon6 from '../assets/hackernoon-pixels/location-pin.svg';
import sourceIcon7 from '../assets/hackernoon-pixels/comments.svg';
import { securitySourceIds, sourceCardTheme } from '../utils/source-card-themes.mjs';
import '../styles/source-card-themes.css';



import SourceSyncStatus from './SourceSyncStatus.vue';

import { cardScramble } from '../utils/card-scramble.mjs';



import HistoryToday from './HistoryToday.vue';
import NasaApod from './NasaApod.vue';



import WorldTime from './WorldTime.vue';



import ChinaCalendar from "./ChinaCalendar.vue";



import CurrencyConverter from "./CurrencyConverter.vue";



import MarketOverview from "./MarketOverview.vue";



import SourceNewsCard from "./SourceNewsCard.vue";



import NewsHotspotHub from "./NewsHotspotHub.vue";



import XNewsHub from "./XNewsHub.vue";

import XGlobalEvents from "./XGlobalEvents.vue";
import AiDigestPanel from "./AiDigestPanel.vue";














import GithubTrending from "./GithubTrending.vue";







import BrowserFingerprint from "./BrowserFingerprint.vue";



import HighlightText from "./HighlightText.vue";



import SearchBackground from "./SearchBackground.vue";



import SearchPlanet from "./SearchPlanet.vue";







// 导入Element Plus的消息提示组件



import { ElMessage } from 'element-plus'; 



// 导入Element Plus图标



import { DocumentCopy, Search, Link, Check } from '@element-plus/icons-vue'; // 导入Element Plus图标



// 导入拼音工具函数，用于支持拼音首字母搜索



import { matchPinyin } from '../utils/pinyin.js'; 
import { moduleGroups } from '../data/module-index.mjs';


















// 导航链接组件定义



// Favicon URL 缓存（模块级别，所有组件实例共享）



const faviconCache = new Map();

export default {



  name: 'NavigationLinks',



  directives: { cardScramble },



  emits: ['located', 'module-jump'],



  components: { AiDigestPanel, CategoryPixelBadge, NasaApod, SourceSyncStatus, XNewsHub, XGlobalEvents, HistoryToday, WorldTime, SourceNewsCard, ChinaCalendar, CurrencyConverter, MarketOverview, NewsHotspotHub, GithubTrending, BrowserFingerprint, HighlightText, SearchBackground, SearchPlanet, DocumentCopy, Search, Link, Check }, // 注册组件



  // 组件属性定义



  props: {



    categories: { type: Array, required: true }, // 导航分类数据



    currentTheme: { type: String, required: true }, // 当前主题（light/dark）



    targetCategory: { type: String, default: '' }, // 目标分类（用于滚动定位）



  },



  // 组件数据



  data() {



    return {



      marketHubTab: 'market',
      moduleGroups,
      timeHubTab: 'world',
      hotspotsExpanded: true,
      sourceCategory: 'all',
      showAllSourceCards: false,
      sourceCategoryTabs: [
        {id:'all',label:'全部',icon:sourceIcon0},
        {id:'hot',icon:sourceIcon1,label:'热点资讯',sources:['weibo','baidu','tieba','toutiao','qq','netease','world_news']},
        {id:'models',icon:sourceIcon2,label:'模型消息',sources:['ai_official','cn_ai']},
        {id:'tech',icon:sourceIcon2,label:'科技开发',sources:['github','tech_news']},
        {id:'security',icon:sourceIcon3,label:'网络安全',sources:securitySourceIds},
        {id:'business',icon:sourceIcon4,label:'财经商业',sources:['yicai','sinafinance','fng','eastmoney','xueqiu']},
        {id:'design',icon:sourceIcon5,label:'设计文娱',sources:['short_video','video_hot','design_hub','douban','steam_top']},
        {id:'auto',icon:sourceIcon6,label:'汽车资讯',sources:['dongchedi','autohome','pcauto']},
        {id:'social',icon:sourceIcon7,label:'X 动态',sources:['x']}
      ],



      locatedLinkKey: '',



      locationHighlightTimer: null,



      copiedKeys: {},



      copyTimers: {},



      currentPage: 1, // 当前页码



      pageSize: 4, // 每页显示分类数量



      linksLimit: 10, // 每个分类默认显示链接数量



      expandedCategories: {}, // 记录哪些分类已展开



      activeSubcategories: {},



      localSearchQuery: '', // 本地搜索关键词



      searchDebounceTimer: null, // 搜索防抖计时器



      engineQueries: {}, // 各引擎的关键词独立保存



      selectedEngine: 'google', // 合并下拉框当前选中的搜索引擎



      enginesExpanded: false, // 是否展开全部搜索引擎卡片



      searchText: '', // 搜索文本


      narrowViewport: window.innerWidth <= 1299, // 窄屏（站内搜索留在搜索面板内，不传送到顶部导航条）
      siteSearchTarget: null, // 顶部导航条里的站内搜索挂载点（Teleport 目标）







      // 外部搜索引擎配置



      searchEngines: [



        { label: 'Google', value: 'google', url: 'https://www.google.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/google.ico' },



        { label: 'Bing', value: 'bing', url: 'https://www.bing.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/bing.ico' },



        { label: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd=', icon: process.env.BASE_URL + 'engine-icons/baidu.ico' },



        { label: 'GitHub', value: 'github', url: 'https://github.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/github.ico' },



        { label: 'YouTube', value: 'youtube', url: 'https://www.youtube.com/results?search_query=', icon: process.env.BASE_URL + 'engine-icons/youtube.png' },



        { label: 'Bilibili', value: 'bilibili', url: 'https://search.bilibili.com/all?keyword=', icon: process.env.BASE_URL + 'engine-icons/bilibili.ico' },



        { label: '抖音', value: 'douyin', url: 'https://www.douyin.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/douyin.ico' },



        { label: '小红书', value: 'xiaohongshu', url: 'https://www.xiaohongshu.com/search_result?keyword=', icon: process.env.BASE_URL + 'engine-icons/xiaohongshu.ico' },



        { label: 'Stack Overflow', value: 'stackoverflow', url: 'https://stackoverflow.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/stackoverflow.ico' },



        { label: 'Reddit', value: 'reddit', url: 'https://www.reddit.com/search/?q=', icon: process.env.BASE_URL + 'engine-icons/reddit.png' },



        { label: 'Twitter/X', value: 'twitter', url: 'https://twitter.com/search?q=', icon: process.env.BASE_URL + 'engine-icons/twitter.png' },



        { label: 'Wikipedia', value: 'wikipedia', url: 'https://zh.wikipedia.org/w/index.php?search=', icon: process.env.BASE_URL + 'engine-icons/wikipedia.ico' }



      ],



    };



  },



  // 组件卸载前执行



  mounted() {
    // 站内搜索在窄屏下留在搜索面板内，宽屏传送到顶部导航条
    this.siteSearchMedia = window.matchMedia('(max-width: 1299px)');
    this.onSiteSearchMedia = event => { this.narrowViewport = event.matches; };
    this.narrowViewport = this.siteSearchMedia.matches;
    this.siteSearchMedia.addEventListener?.('change', this.onSiteSearchMedia);

    // 顶部导航条的挂载点由 NavigationHeader 渲染，需要等父级 patch 完成后再取
    this.$nextTick(() => {
      this.siteSearchTarget = document.getElementById('header-site-search');
      if (!this.siteSearchTarget) {
        this.siteSearchRetry = setTimeout(() => {
          this.siteSearchTarget = document.getElementById('header-site-search');
        }, 80);
      }
    });

    this.$nextTick(() => {
      const row = this.$el.querySelector('.dashboard-hubs-row');
      if (!row || typeof ResizeObserver === 'undefined') return;
      let frame = 0;
      const measure = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (!row.getClientRects().length || window.innerWidth <= 1000 || this.timeHubTab === 'apod') return;
          const heights = [...row.children].map(card => {
            const panel = [...card.children].find(el => el.tagName === 'DIV' && getComputedStyle(el).display !== 'none');
            const content = panel?.firstElementChild;
            const nav = card.querySelector('nav');
            if (!content || !nav) return 0;
            const style = getComputedStyle(card), ns = getComputedStyle(nav);
            return content.getBoundingClientRect().height + nav.getBoundingClientRect().height + parseFloat(ns.marginBottom) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
          }).filter(height => height > 0);
          if (heights.length === 2) row.style.setProperty('--hub-compact-height', `${Math.ceil(Math.min(...heights))}px`);
        });
      };
      const observer = new ResizeObserver(measure);
      observer.observe(row);
      row.querySelectorAll('nav, .market-panel, .currency-panel, .world-time, .china-calendar, .history-today').forEach(el => observer.observe(el));
      window.addEventListener('resize', measure);
      this.stopHubSizing = () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', measure); };
      measure();
    });



  },



  beforeUnmount() {
    this.stopHubSizing?.();

    this.siteSearchMedia?.removeEventListener?.('change', this.onSiteSearchMedia);

    clearTimeout(this.siteSearchRetry);



    this.navigationScrollRequest = (this.navigationScrollRequest || 0) + 1;



    clearTimeout(this.locationHighlightTimer);



    Object.values(this.copyTimers).forEach(clearTimeout);



    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);



  },



  // 计算属性



  computed: {



    // 当前选中搜索引擎的名称（用于输入框提示与按钮文案）
    selectedEngineLabel() {
      const engine = this.searchEngines.find(item => item.value === this.selectedEngine);
      return engine ? engine.label : '';
    },

    // 当前选中搜索引擎的图标（用于下拉框收起态显示）
    selectedEngineIcon() {
      const engine = this.searchEngines.find(item => item.value === this.selectedEngine);
      return engine ? engine.icon : '';
    },



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
    sourceCardTheme,
    selectSourceCategory(id) {
      this.sourceCategory=id;
    },
    sourceVisible(id) {
      return this.sourceCategory==='all'||Boolean(this.sourceCategoryTabs.find(tab=>tab.id===this.sourceCategory)?.sources?.includes(id));
    },
    onSourceTabKey(event,id) {
      const keys=['ArrowLeft','ArrowRight','Home','End'];
      if(!keys.includes(event.key))return;
      event.preventDefault();
      const tabs=this.sourceCategoryTabs,index=tabs.findIndex(tab=>tab.id===id);
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      this.selectSourceCategory(tabs[next].id);
      this.$nextTick(()=>document.getElementById(`source-tab-${this.sourceCategory}`)?.focus());
    },
    rememberSourceCardHeight(event) {
      const button=event.target.closest('button[data-source-more]');
      if(!button)return;
      const card=button.closest('#information-source-cards > section');
      if(card&&button.getAttribute('aria-expanded')!=='true')card.style.setProperty('--source-expanded-height',card.getBoundingClientRect().height+'px');
    },




    locationKey(categoryName, subName, link) {



      return JSON.stringify([categoryName, subName || '', link.url, link.name]);



    },



    locateSearchResult(categoryName, subName, link) {



      return this.scrollToNavigationTarget(categoryName, subName, link);



    },



    selectedSubcategory(category) {



      const tabs = category.subCategories || [];



      const selected = this.activeSubcategories[category.name];



      return tabs.some(tab => tab.name === selected) ? selected : tabs[0]?.name;



    },



    visibleSubcategories(category) {



      return (category.subCategories || []).filter(tab => tab.name === this.selectedSubcategory(category));



    },



    handleSubcategoryKey(event, category, index) {



      const tabs = category.subCategories || [];



      let next = index;



      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;



      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;



      else if (event.key === 'Home') next = 0;



      else if (event.key === 'End') next = tabs.length - 1;



      else return;



      event.preventDefault();



      this.activeSubcategories[category.name] = tabs[next].name;



      const button = event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next];



      button.focus(); button.scrollIntoView({ block: 'nearest', inline: 'nearest' });



    },



    updateCardGlow(event) {



      if (event.pointerType === 'touch') return;



      const card = event.currentTarget;



      const rect = card.getBoundingClientRect();



      card.style.setProperty('--glow-x', (event.clientX - rect.left) + 'px');



      card.style.setProperty('--glow-y', (event.clientY - rect.top) + 'px');



      card.classList.add('is-glowing');



    },



    clearCardGlow(event) {



      event.currentTarget.classList.remove('is-glowing');



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







    handleEngineSearch(engine) {
      const query = (this.engineQueries[engine.value] || '').trim();
      if (!query) return;

      window.open(engine.url + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
    },

    // 使用合并下拉框中选中的搜索引擎执行搜索
    handleSelectedEngineSearch() {
      const engine = this.searchEngines.find(item => item.value === this.selectedEngine);
      if (engine) this.handleEngineSearch(engine);
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



        // 本地地址和本站导航使用仓库中的默认网站图标。



        const isLocalAddress = domain === 'localhost' || domain.endsWith('.localhost') ||



          domain === '[::1]' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(domain);



        if (isLocalAddress || domain === 'axaaaaa.github.io') {



          const localIcon = `${process.env.BASE_URL || '/'}favicon.ico`;



          faviconCache.set(url, localIcon);



          return localIcon;



        }



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



      return this.scrollToNavigationTarget(categoryName);



    },



    scrollToSubCategory(categoryName, subName) {



      return this.scrollToNavigationTarget(categoryName, subName);



    },



    async scrollToNavigationTarget(categoryName, subName, link) {



      if (!categoryName) return;



      const request = (this.navigationScrollRequest || 0) + 1;



      this.navigationScrollRequest = request;



      this.clearSearch();



      // Flush search watchers before cancelling their delayed page reset.



      await this.$nextTick();



      clearTimeout(this.searchDebounceTimer);



      this.searchDebounceTimer = null;



      if (request !== this.navigationScrollRequest) return;



      const idx = this.filteredCategories.findIndex(c => c.name === categoryName);



      if (idx === -1) return;



      if (subName) {



        this.activeSubcategories[categoryName] = subName;



        this.expandCategory(categoryName);



      }



      if (link) this.expandCategory(categoryName);



      this.currentPage = Math.floor(idx / this.pageSize) + 1;



      await this.$nextTick();



      await new Promise(resolve => requestAnimationFrame(resolve));



      if (request !== this.navigationScrollRequest) return;



      const category = [...this.$el.querySelectorAll('[data-category]')]



        .find(el => el.dataset.category === categoryName);



      const group = subName



        ? [...(category?.querySelectorAll('[data-sub-category]') || [])]



          .find(el => el.dataset.subCategory === subName)



        : category;



      const target = link



        ? [...(group?.querySelectorAll('.website-card') || [])]



          .find(el => el.dataset.linkUrl === link.url && el.dataset.linkName === link.name)



        : group;



      const container = this.$el.closest('.main-content');



      if (!target || !container) return;



      const containerTop = container.getBoundingClientRect().top + container.clientTop;



      const header = container.querySelector('.navigation-header');



      const headerBottom = header?.getBoundingClientRect().bottom || containerTop;



      const offset = Math.max(0, headerBottom - containerTop) + 16;



      const top = target.getBoundingClientRect().top - containerTop + container.scrollTop - offset;



      container.scrollTo({ top: Math.max(0, top), behavior: 'auto' });



      if (link) {



        this.locatedLinkKey = this.locationKey(categoryName, subName, link);



        target.focus({ preventScroll: true });



        this.locationHighlightTimer = setTimeout(() => { this.locatedLinkKey = ''; }, 3500);



      }



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
.homepage-engine-dropdown .engine-option-content { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }
.homepage-engine-dropdown .engine-option-label { display: inline; }
.homepage-engine-dropdown .el-select-dropdown__item { padding: 0 12px; text-align: left; }
.homepage-engine-dropdown .engine-brand-icon { width: 20px; height: 20px; object-fit: contain; }

.search-result-location { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 0 16px 10px; font-size: 12px; }



.search-result-path { flex: 1 1 120px; min-width: 0; overflow-wrap: anywhere; color: #667085; }



.locate-result-btn { flex-shrink: 0; border: 1px solid #c9d9f2; border-radius: 5px; padding: 4px 8px; background: transparent; color: #245da8; cursor: pointer; font: inherit; }



.locate-result-btn:hover { background: #edf4ff; }



.locate-result-btn:focus-visible { outline: 2px solid #245da8; outline-offset: 3px; }



.website-card.is-search-located { outline: 3px solid #409eff; outline-offset: 3px; }



.dark-theme .search-result-path { color: #86b99a; }



.dark-theme .locate-result-btn { color: #8ee7b3; border-color: #2f7050; }



.dark-theme .locate-result-btn:hover { background: #183222; }



.dark-theme .locate-result-btn:focus-visible, .dark-theme .website-card.is-search-located { outline-color: #8ee7b3; }







/* 暗黑风格下拉菜单 - 黑客帝国绿 */



.dark-dropdown.el-popper {



  background-color: rgba(10, 10, 10, 0.95) !important;



  border: 1px solid rgba(120, 207, 155, 0.3) !important;



  box-shadow: 0 0 15px rgba(120, 207, 155, 0.2) !important;



}



.dark-dropdown.el-popper__arrow::before {



  background-color: #0a0a0a !important;



  border: 1px solid rgba(120, 207, 155, 0.3) !important;



}



.dark-dropdown .el-select-dropdown__item {



  color: var(--dark-text-secondary) !important;



  font-family: monospace;



}



.dark-dropdown .el-select-dropdown__item.selected,



.dark-dropdown .el-select-dropdown__item.hover,



.dark-dropdown .el-select-dropdown__item:hover {



  background-color: rgba(120, 207, 155, 0.1) !important;



  color: var(--dark-text-primary) !important;



  font-weight: bold;



}







/* 暗黑 Popover 样式 - 黑客帝国绿 */



.dark-popover.el-popper {



  background-color: rgba(10, 10, 10, 0.96) !important; 



  border: 1px solid rgba(120, 207, 155, 0.3) !important;            



  box-shadow: 0 0 15px rgba(120, 207, 155, 0.2) !important; 



  padding: 0 !important; 



  color: var(--dark-text-secondary) !important;



  min-width: 280px !important;



}



.dark-popover.el-popper .el-popper__arrow::before {



  background-color: #0a0a0a !important;



  border: 1px solid rgba(120, 207, 155, 0.3) !important;



}







/* 暗黑 Message (Toast) 样式 - 黑客帝国绿 */



.dark-message {



  background-color: rgba(10, 10, 10, 0.95) !important;



  border: 1px solid rgba(120, 207, 155, 0.3) !important;



  box-shadow: 0 0 15px rgba(120, 207, 155, 0.2) !important;



  min-width: 300px !important;



}



.dark-message .el-message__content {



  color: var(--dark-text-primary) !important;



  font-family: 'Consolas', monospace !important;



  font-weight: bold;



}



.dark-message .el-icon {



  color: var(--dark-text-secondary) !important;



}



/* Information cards shared by normal and subcategory links. */



.website-card {



  display: flex;



  flex-direction: column;



  gap: 8px;



  box-sizing: border-box;



  width: 100%;



  min-height: 116px;



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



  -webkit-line-clamp: 2;



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



  border-color: rgba(120, 207, 155, .22);



  color: var(--dark-text-primary, #00ff41);



}



.dark-theme .website-card .link-description { color: var(--dark-text-secondary); }



.dark-theme .website-card:hover, .dark-theme .website-card:focus-visible {



  border-color: #83a88f;



  background: #0f0f0f;



  box-shadow: 0 6px 18px rgba(120, 207, 155, .06);



  outline-color: #83a88f;



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



  gap: 8px;



  padding: 18px 18px 12px;



  color: inherit;



  text-decoration: none;



  min-width: 0;



}



.card-actions {



  position: absolute;



  top: 11px;



  right: 12px;



  z-index: 3;



  display: flex;



  align-items: center;



  gap: 2px;



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



.dark-theme .card-copy-btn:hover { color: var(--dark-text-primary); border-color: #83a88f; }







/* Consistent card identity and quieter controls. */



.website-card { position: relative; }



.website-card:hover { transform: none; box-shadow: 0 3px 12px rgba(41,91,148,.07); }



.card-main { padding: 12px 12px 8px; }



.link-heading { padding-right: 54px; box-sizing: border-box; flex-wrap: wrap; row-gap: 6px; }











.card-domain { margin: 0 12px 12px; color: #8793a5; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }



.card-actions { margin: 0; padding: 0; }



.card-copy-btn { border-color: transparent; background: transparent; color: #98a2b3; padding: 0; min-width: 24px; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; border-radius: 6px; }























.dark-theme .card-domain { color: var(--dark-text-secondary); }















.dark-theme .card-copy-btn { color: var(--dark-text-secondary); background: transparent; border-color: transparent; }







.engine-brand-icon {



  display: inline-block;



  width: 20px;



  height: 20px;



  flex: 0 0 20px;



  object-fit: contain;



  vertical-align: middle;



}



.engine-option-content { display: inline-flex; align-items: center; gap: 8px; }

/* 下拉框收起态：图标 + 名称同行显示 */
.engine-selected-content { display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; }
.engine-selected-icon { width: 16px; height: 16px; flex: 0 0 16px; }
.engine-selected-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }







/* A real-time starfield, contained behind search controls. */



.search-cosmic-panel {



  position: relative;



  isolation: isolate;



  padding: 42px 24px 34px;



  margin: 0 0 26px;



  border-radius: 20px;



  background: #090f1d;



  box-shadow: none;



}



.pagination-top { margin-top: 16px; }



.search-cosmic-panel :deep(.el-pagination.is-background .el-pager li:not(.is-active)),



.search-cosmic-panel :deep(.el-pagination.is-background button) {



  background: rgba(255,255,255,.09);



  color: #dce5fa;



}



.search-cosmic-panel :deep(.el-pagination.is-background button:disabled) { color: #66728d; }



@media (max-width: 600px) {



  .search-cosmic-panel { padding: 30px 10px 24px; margin-bottom: 18px; border-radius: 14px; }



}



@media (max-width: 768px) {



  .search-bar-compact { width: 100%; min-width: 0; gap: 6px; }



  .search-bar-compact .engine-select { width: 88px; flex: 0 0 88px; }



  .search-bar-compact .search-input { flex: 1 1 0; min-width: 0; width: 0; }



  .search-bar-compact .search-btn, .search-bar-compact .paste-btn { flex: 0 0 32px; width: 32px; min-width: 32px; padding: 0; margin: 0; }



  .search-bar-compact .search-input :deep(.el-input__wrapper) { min-width: 0; }



  .search-bar-compact .search-input :deep(.el-input__suffix) { display: none; }



  .pagination-top { max-width: 100%; overflow-x: auto; justify-content: flex-start; }



}



/* Local pointer-following glyphs, clipped to the card instead of scrambling its title. */



.card-glitch-layer {



  position: absolute;



  inset: 0;



  z-index: 2;



  overflow: hidden;



  border-radius: inherit;



  pointer-events: none;



  user-select: none;



}



.card-glitch-patch {



  position: absolute;



  display: block;



  width: 156px;



  height: 98px;



  transform: translate(-50%, -50%);



  white-space: pre;



  font: 8px/14px ui-monospace, SFMono-Regular, Consolas, monospace;



  letter-spacing: 4px;



  text-align: center;



  color: var(--dark-text-primary, #b0d4ba);



  opacity: .8;



  text-shadow: 0 0 5px currentColor;



  -webkit-mask-image: radial-gradient(ellipse, #000 10%, transparent 70%);



  mask-image: radial-gradient(ellipse, #000 10%, transparent 70%);



  pointer-events: none;



}



@media (prefers-reduced-motion: reduce) {



  .card-glitch-layer { display: none; }



}







/* Mobile hero: symmetric padding and border-box prevent 100% + padding overflow. */



@media (max-width: 768px) {



  .search-cosmic-panel { box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 24px 10px; }



  .search-cosmic-panel .search-bar-compact { box-sizing: border-box; width: 100%; max-width: 680px; min-width: 0; padding: 0; margin: 0 auto; align-items: center; }



  .search-cosmic-panel .unified-search-control { box-sizing: border-box; min-width: 0; }



}











@media (max-width: 768px) {



 .search-cosmic-panel .search-bar-compact .engine-select { width: 44px !important; min-width: 44px !important; flex: 0 0 44px !important; }



 .search-cosmic-panel .engine-select .el-select__selected-item { font-size: 0 !important; }



 .search-cosmic-panel .engine-select .el-select__selection { display: none; min-width: 0; }



 .search-cosmic-panel .engine-select .el-select__wrapper { gap: 2px !important; padding: 0 4px !important; }



}








.source-category-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0 4px;padding:0 0 10px;border-bottom:1px solid #d4e0d7}.source-category-tabs button{font:inherit;font-size:12px;line-height:1.5;cursor:pointer;border:1px solid transparent;border-radius:5px;background:transparent;color:#5c7164;padding:7px 13px}.source-category-tabs button:hover{background:#edf4ef}.source-category-tabs button[aria-selected="true"]{color:#244d34;background:#e4efe7;border-color:#aec8b6;font-weight:600}.source-category-tabs button:focus-visible{outline:2px solid #527d63;outline-offset:2px}.dark-theme .source-category-tabs{border-color:#344b3d}.dark-theme .source-category-tabs button{color:#86b99a}.dark-theme .source-category-tabs button:hover{background:#183222}.dark-theme .source-category-tabs button[aria-selected="true"]{background:#183222;border-color:#527d63;color:#d0e7d7}
.all-sources-more{display:flex;justify-content:center;margin:12px 0}
@media (max-width:1100px){.hotspots-row.source-preview-rows > :nth-child(n+3){display:none}}
@media (min-width:1101px) and (max-width:1399px){.hotspots-row.source-preview-rows > :nth-child(n+5){display:none}}
@media (min-width:1400px){.hotspots-row.source-preview-rows > :nth-child(n+11){display:none}}
.source-tab-icon{display:inline-block;width:18px;height:18px;flex:none;margin-right:6px;vertical-align:middle;background:currentColor;-webkit-mask:var(--source-tab-glyph) center / contain no-repeat;mask:var(--source-tab-glyph) center / contain no-repeat}
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



  color: var(--dark-text-primary);



}







.dark-content .pop-desc {



  color: var(--dark-text-secondary);



}







.dark-content .pop-url {



  color: rgba(120, 207, 155, 0.6);



}







.dark-content .dark-btn {



  border-color: rgba(120, 207, 155, 0.3);



  color: var(--dark-text-primary);



}







.dark-content .dark-btn:hover {



  background: rgba(120, 207, 155, 0.1);



  color: var(--dark-text-link);



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



  border-color: rgba(120, 207, 155, 0.2);



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



  border-bottom-color: rgba(120, 207, 155, 0.2);



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



.dark-theme .subcategory-title { color: var(--dark-text-secondary, #83a88f); }



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



  border-color: rgba(120, 207, 155, 0.2);



}



.dark-theme .show-more-item .show-more-btn:hover {



  color: var(--dark-text-link, #39ff14);



  border-color: rgba(120, 207, 155, 0.5);



}



ul {



  list-style: none;



  padding: 0;



  margin: 0;



  display: grid;



  grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); 



  gap: 8px;



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



  color: var(--dark-text-primary) !important;



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



  color: var(--dark-text-primary) !important;



}



.dark-theme :deep(.el-tag--small) {



  font-size: 11px !important;



  padding: 0 6px !important;



  height: 20px !important;



}



.dark-theme .el-button.el-button--primary {



  background-color: #0f0f0f;



  border-color: rgba(120, 207, 155, 0.3);



  color: var(--dark-text-primary, #00ff41);



}



.dark-theme .el-button.el-button--primary:hover {



  background-color: #1a2a1a;



  color: var(--dark-text-link, #39ff14);



  border-color: rgba(120, 207, 155, 0.5);



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



  border: 1px solid rgba(120, 207, 155, 0.3);



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



  border-color: rgba(120, 207, 155, 0.3);



  color: var(--dark-text-primary, #00ff41);



}



.dark-theme .search-btn:hover {



  background: rgba(120, 207, 155, 0.1);



  color: var(--dark-text-link, #39ff14);



  border-color: rgba(120, 207, 155, 0.5);



}



.dark-theme .search-bar-compact .search-input :deep(.el-input__wrapper) {



  background-color: #0f0f0f !important;



  border-color: rgba(120, 207, 155, 0.3) !important;



  box-shadow: none !important;



}



.dark-theme .search-bar-compact .search-input :deep(.el-input__inner) {



  color: var(--dark-text-primary, #00ff41) !important;



}



.dark-theme .paste-btn {



  background: rgba(10, 10, 10, 0.8);



  border-color: rgba(120, 207, 155, 0.3);



  color: var(--dark-text-primary, #00ff41);



}



.dark-theme .paste-btn:hover {



  background: rgba(120, 207, 155, 0.1);



  color: var(--dark-text-link, #39ff14);



  border-color: rgba(120, 207, 155, 0.5);



}



.dark-theme :deep(.el-pagination.is-background .el-pager li),



.dark-theme :deep(.el-pagination.is-background .btn-prev),



.dark-theme :deep(.el-pagination.is-background .btn-next) {



  background-color: transparent !important;



  color: var(--dark-text-primary, #00ff41) !important;



  border: 1px solid rgba(120, 207, 155, 0.2) !important;



}



.dark-theme :deep(.el-pagination.is-background .el-pager li.is-active) {



  background-color: rgba(120, 207, 155, 0.15) !important;



  color: var(--dark-text-link, #39ff14) !important;



}



.dark-theme :deep(.el-pagination.is-background button:disabled) {



  color: var(--dark-text-muted, #008822) !important;



  border-color: rgba(120, 207, 155, 0.1) !important;



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



  border: 1px solid rgba(120, 207, 155, 0.3) !important;



}



.dark-autocomplete .el-autocomplete-suggestion__list li {



  background-color: #0f0f0f !important;



  color: var(--dark-text-secondary) !important;



}



.dark-autocomplete .el-autocomplete-suggestion__list li:hover {



  background-color: rgba(120, 207, 155, 0.1) !important;



}



.dark-autocomplete .suggestion-name {



  color: var(--dark-text-primary);



}



.dark-autocomplete .suggestion-category {



  color: var(--dark-text-muted);



  background: rgba(120, 207, 155, 0.1);



}











/* Use autocomplete's input suffix so the artwork has its own layout space. */



.search-input-artwork {



  display: block;



  width: 108px;



  height: 28px;



  object-fit: contain;



  pointer-events: none;



  user-select: none;



}







@media (max-width: 600px) {



  .search-input-artwork { width: 64px; height: 24px; }



}







/* A non-interactive spotlight follows the pointer without moving card content. */



.website-card::after {



  content: '';



  position: absolute;



  inset: 0;



  z-index: 2;



  border-radius: inherit;



  pointer-events: none;



  background: radial-gradient(180px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(110, 210, 150, .14), rgba(165, 230, 185, .045) 42%, transparent 72%);



  opacity: 0;



  transition: opacity 180ms ease;



}



.website-card.is-glowing::after { opacity: 1; }



.dark-theme .website-card::after {



  background: radial-gradient(180px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(85, 255, 145, .19), rgba(120, 207, 155, .06) 42%, transparent 72%);



}



@media (prefers-reduced-motion: reduce) {



  .website-card::after { transition: none; }



}







/* One shared surface for query, search and clipboard actions. */



.unified-search-control {



  display: flex; align-items: center; gap: 0;



  flex: 1 1 0; min-width: 0; height: 40px;



  border: 1px solid #dce2ed; border-radius: 12px;



  background: #fff; padding: 0 4px 0 0;



  box-sizing: border-box; transition: border-color 160ms ease, box-shadow 160ms ease;



}



.unified-search-control:focus-within { border-color: #7b9dea; box-shadow: 0 0 0 3px rgba(106,145,230,.15); }



.search-bar-compact .unified-search-control .search-input { flex: 1 1 0; width: 0; min-width: 0; }



.unified-search-control :deep(.el-input__wrapper) {



  height: 38px; min-width: 0; background: transparent !important; border: 0 !important;



  box-shadow: none !important; border-radius: 12px 0 0 12px;



}



.search-bar-compact .unified-search-control .search-btn,



.search-bar-compact .unified-search-control .paste-btn {



  flex: 0 0 32px; width: 32px; min-width: 32px; height: 30px; margin: 0; padding: 0;



  border: 0 !important; border-radius: 7px !important;



  background: transparent !important; color: #65718a !important;



}



.search-bar-compact .unified-search-control .paste-btn { border-left: 1px solid #e5e9f0 !important; border-radius: 0 7px 7px 0 !important; }



.search-bar-compact .unified-search-control .search-btn:hover,



.search-bar-compact .unified-search-control .paste-btn:hover { background: #edf2ff !important; color: #4979d3 !important; }



.dark-theme .unified-search-control { background: #0b140e; border-color: #344b3d; }



.dark-theme .unified-search-control:focus-within { border-color: #83a88f; box-shadow: 0 0 0 3px rgba(122,154,185,.14); }



.dark-theme .search-bar-compact .unified-search-control .search-btn,



.dark-theme .search-bar-compact .unified-search-control .paste-btn { color: var(--dark-text-secondary) !important; }



.dark-theme .search-bar-compact .unified-search-control .paste-btn { border-left-color: #354451 !important; }



.dark-theme .search-bar-compact .unified-search-control .search-btn:hover,



.dark-theme .search-bar-compact .unified-search-control .paste-btn:hover { background: #14251b !important; }



@media (max-width: 768px) {



  .search-bar-compact { gap: 6px; }



  .unified-search-control { height: 38px; border-radius: 10px; }



  .unified-search-control :deep(.el-input__wrapper) { height: 36px; padding: 1px 8px; }



}







/* Target the nested autocomplete wrapper through its stable native parent. */



.unified-search-control :deep(.el-input__wrapper),



.unified-search-control :deep(.el-input__wrapper:hover),



.unified-search-control :deep(.el-input__wrapper.is-focus) {



  box-shadow: none !important;



  border: none !important;



  outline: none;



  background: transparent !important;



}







/* Shared sizing tokens keep select and query surfaces aligned. */



.search-bar-compact {



  --search-control-height: 40px;



  --search-control-radius: 12px;



  max-width: 680px;



  gap: 10px;



  align-items: stretch;



}



.search-bar-compact :deep(.engine-select) { width: 128px; flex: 0 0 128px; height: var(--search-control-height); }



.search-bar-compact :deep(.engine-select .el-select__wrapper) {



  height: var(--search-control-height);



  min-height: var(--search-control-height);



  box-sizing: border-box;



  border-radius: var(--search-control-radius);



  padding: 0 12px;



  box-shadow: 0 0 0 1px #dce2ed inset;



}



.unified-search-control { height: var(--search-control-height); border-radius: var(--search-control-radius); }



.unified-search-control :deep(.el-input__wrapper) { height: calc(var(--search-control-height) - 2px); box-sizing: border-box; }



.dark-theme .search-bar-compact :deep(.engine-select .el-select__wrapper) { background: #0b140e; box-shadow: 0 0 0 1px #344b3d inset; }



@media (max-width: 768px) {



  .search-bar-compact { --search-control-height: 38px; --search-control-radius: 10px; gap: 6px; }



  .search-bar-compact :deep(.engine-select) { width: 96px; flex-basis: 96px; }



  .search-bar-compact :deep(.engine-select .el-select__wrapper) { padding: 0 8px; }



}







.subcategory-tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; overflow: visible; max-width: 100%; box-sizing: border-box; padding: 4px 2px 12px; margin-bottom: 10px; }



.subcategory-tab { display: inline-flex; align-items: center; gap: 7px; flex: 0 0 auto; max-width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #e2e7ef; border-radius: 9px; background: #f7f9fc; color: #596579; font: inherit; font-size: 13px; cursor: pointer; white-space: normal; overflow-wrap: anywhere; text-align: left; }



.subcategory-tab:hover { background: #edf3ff; color: #326dd2; }



.subcategory-tab.is-selected { background: #eaf1ff; color: #2563c4; border-color: #9bbcf4; font-weight: 600; }



.subcategory-tab:focus-visible { outline: 2px solid #528bf0; outline-offset: 2px; }



.subcategory-tab-count { font-size: 11px; opacity: .65; }



.dark-theme .subcategory-tab { background: #0f0f0f; border-color: #344b3d; color: var(--dark-text-secondary); }



.dark-theme .subcategory-tab.is-selected { background: #243c2d; border-color: #83a88f; color: var(--dark-text-primary); }



@media (max-width: 600px) { .subcategory-tab { padding: 7px 10px; } }



</style>







<style scoped>



.homepage-fingerprint { width: 100%; margin: 0 0 18px; box-sizing: border-box; }



</style>







<style>



@media (max-width: 768px) {



 .homepage-engine-dropdown .engine-option-label { display: inline; }



 .homepage-engine-dropdown .engine-option-content { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }



 .homepage-engine-dropdown .el-select-dropdown__item { padding: 0 12px; text-align: left; }



 .homepage-engine-dropdown .engine-brand-icon { width: 20px; height: 20px; object-fit: contain; }



}



</style>







<style scoped>



.hotspots-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; margin: 18px 0 24px; align-items: stretch; }



.hotspots-row > :deep(.news-panel), .hotspots-row > :deep(.github-trending), .hotspots-row > :deep(.v2ex-card), .hotspots-row > :deep(.ithome-card), .hotspots-row > :deep(.hacker-news-card), .hotspots-row > :deep(.weibo-card) { min-width: 0; margin: 0; box-sizing: border-box; width: 100%; }



.hotspots-row :deep(.news-grid), .hotspots-row :deep(.github-list) { grid-template-columns: minmax(0, 1fr); }



.hotspots-row :deep(.news-toolbar) { flex-wrap: wrap; }



.hotspots-row :deep(.news-heading) { flex-wrap: wrap; }



.hotspots-row :deep(.news-brand h2 span) { display: none; }



@media (max-width: 1100px) { .hotspots-row { grid-template-columns: minmax(0, 1fr); } }



</style>







<style scoped>



@media (min-width: 1101px) and (max-width: 1399px) { .hotspots-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }



</style>







<style scoped>



@media (min-width: 1400px) and (max-width: 1599px) { .hotspots-row { grid-template-columns: repeat(5, minmax(0, 1fr)); } }



</style>







<style scoped>



.hotspots-row :deep(.v2ex-heading), .hotspots-row :deep(.ithome-heading), .hotspots-row :deep(.hacker-news-heading) { flex-wrap: wrap; }



</style>







<style scoped>



/* Compact hotspot typography only; financial widgets keep their own sizing. */



.hotspots-row :deep(h2) { font-size: 16px; }



.hotspots-row :deep(h3) { font-size: 12px; line-height: 1.55; }



@media (min-width: 769px) {



  .hotspots-row :deep(.news-heading) { padding: 16px 18px 12px; }



  .hotspots-row :deep(.news-toolbar) { margin-left: 18px; margin-right: 18px; }



  .hotspots-row :deep(.news-grid) { padding-left: 12px; padding-right: 12px; }



  .hotspots-row :deep(.news-grid a) { padding-top: 12px; padding-bottom: 12px; min-height: 68px; }



  .hotspots-row > :deep(.github-trending), .hotspots-row > :deep(.v2ex-card), .hotspots-row > :deep(.ithome-card), .hotspots-row > :deep(.hacker-news-card), .hotspots-row > :deep(.weibo-card) { padding-left: 16px; padding-right: 16px; padding-top: 16px; }



  .hotspots-row :deep(.github-heading), .hotspots-row :deep(.v2ex-heading), .hotspots-row :deep(.ithome-heading), .hotspots-row :deep(.hacker-news-heading), .hotspots-row :deep(.weibo-heading) { padding-bottom: 12px; }



  .hotspots-row :deep(.github-list a), .hotspots-row :deep(.v2ex-list a), .hotspots-row :deep(.ithome-list a), .hotspots-row :deep(.hacker-news-list a), .hotspots-row :deep(.weibo-list a) { padding-top: 12px; padding-bottom: 12px; }



}



@media (max-width: 768px) { .hotspots-row :deep(h3) { font-size: 13px; line-height: 1.65; } }



</style>







<style scoped>



.hotspots-row > :deep(section) { display: flex; flex-direction: column; }



.hotspots-row > :deep(section > footer) { margin-top: 10px; }



</style>







<style scoped>



/* Taller cards grow with their content; lists never create nested scroll areas. */



@media (min-width: 1101px) {



  .hotspots-row:has(ol) { grid-auto-rows: auto; align-items: stretch; }



  .hotspots-row > :deep(section) { min-height: 0; height: auto; max-height: none; padding: 16px 14px 0; }



  .hotspots-row :deep(section > ol) { flex: 1 0 auto; min-height: 0; max-height: none; overflow: visible; }



  .hotspots-row :deep(section > header), .hotspots-row :deep(section > footer), .hotspots-row :deep(section > div:not(.github-empty)), .hotspots-row :deep(section > p) { flex-shrink: 0; }



  .hotspots-row :deep(section > header) { gap: 6px; padding-bottom: 8px; }



  .hotspots-row :deep(section > header p) { margin-top: 3px; font-size: 11px; line-height: 1.5; }



  .hotspots-row :deep(section > ol a) { min-height: 68px; padding-top: 9px; padding-bottom: 9px; gap: 8px; }



  .hotspots-row :deep(.github-copy p) { font-size: 11px; line-height: 1.45; margin: 4px 0; }



  .hotspots-row :deep(.github-copy h3) { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }



  .hotspots-row :deep(.github-status) { margin: 7px 0; }



  .hotspots-row :deep(.github-periods) { gap: 3px; }



  .hotspots-row :deep(.github-periods button) { padding: 5px; font-size: 11px; }



  .hotspots-row :deep(section > footer) { padding: 8px 0; gap: 6px; line-height: 1.5; }



}



@media (max-width: 1100px) {



  .hotspots-row :deep(section > ol a) { padding-top: 10px; padding-bottom: 10px; }



  .hotspots-row :deep(.github-list a) { min-height: 90px; }



}



</style>







<style scoped>



.hotspots-row > :deep(.source-news-card){width:100%;min-width:0;margin:0;box-sizing:border-box}



</style>







<style scoped>



.search-cosmic-panel{background:linear-gradient(rgba(56,106,80,.025) 1px,transparent 1px),#f7faf8;background-size:100% 4px;border:1px solid #c6d8cd;border-radius:6px;box-shadow:0 8px 24px rgba(40,75,53,.05)}



.dark-theme .search-cosmic-panel{background:linear-gradient(rgba(169,224,189,.015) 1px,transparent 1px),#0a0a0a;background-size:100% 4px;border-color:#2f5a40;box-shadow:0 8px 28px rgba(0,0,0,.15)}



@media(max-width:600px){.search-cosmic-panel{border-radius:6px}}



</style>







<style scoped>



.information-sources-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 0;color:#294c38;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.information-sources-controls h2{font-size:15px;font-weight:500;line-height:1.5;margin:0}.sources-collapse-toggle{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #b9cfc1;border-radius:3px;color:inherit;background:#fff;font:inherit;font-size:12px;cursor:pointer}.sources-collapse-toggle:hover{background:#edf4ef}.sources-collapse-toggle:focus-visible{outline:2px solid #527d63;outline-offset:2px}.sources-collapse-toggle svg{transition:transform .15s}.sources-is-expanded{transform:rotate(90deg)}.dark-theme .information-sources-controls{color:#b0d4ba}.dark-theme .sources-collapse-toggle{background:#0b140e;border-color:#344b3d}.dark-theme .sources-collapse-toggle:hover{background:#183222}.dark-theme .sources-collapse-toggle:focus-visible{outline-color:#95b9a0}@media(prefers-reduced-motion:reduce){.sources-collapse-toggle svg{transition:none}}



</style>







<style scoped>



.hotspots-row.sources-collapsed{grid-auto-rows:auto!important}



.hotspots-row.sources-collapsed > :deep(section){height:auto;min-height:62px;padding:12px!important;justify-content:center}



.hotspots-row.sources-collapsed :deep(section > :not(header)){display:none!important}



.hotspots-row.sources-collapsed :deep(section > header){padding:0!important;margin:0;min-width:0}



.hotspots-row.sources-collapsed :deep(section > header p){display:none}



</style>







<style scoped>



/* Keep hotspot descriptions beside their titles, including on narrow cards. */



.hotspots-row :deep(section > header > div:first-child) {



  display: flex;



  align-items: center;



  gap: 10px;



  min-width: 0;



}



.hotspots-row :deep(section > header h2) {



  min-width: 0;



}



.hotspots-row :deep(section > header p) {



  flex: 1;



  min-width: 0;



  margin: 0;



  overflow: hidden;



  text-overflow: ellipsis;



  white-space: nowrap;



}



</style>




<style scoped>
/* Shared text-card rhythm; grow the list rows, never leave a void below them. */
.hotspots-row > :deep(section){min-height:0;height:auto;display:flex;flex-direction:column}
.hotspots-row :deep(section > ol){display:grid;grid-template-columns:minmax(0,1fr);align-content:stretch;flex:1 1 auto;margin-bottom:0;overflow:visible}
.hotspots-row :deep(section > ol){grid-auto-rows:minmax(56px,auto)}
.hotspots-row :deep(section > ol > li){display:flex;min-width:0}
.hotspots-row :deep(section > ol > li > a){display:flex;align-items:center;flex-wrap:nowrap;width:100%;height:100%;box-sizing:border-box;gap:9px}
.hotspots-row :deep(section > ol > li > a){min-height:56px;padding:6px 3px}
.hotspots-row :deep(h2){font-size:16px!important;line-height:1.5;font-weight:600}
.hotspots-row :deep(section > ol h3){font-size:13px!important;line-height:1.4!important;font-weight:500;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hotspots-row :deep(.source-copy p){font-size:11px;line-height:1.5;margin:2px 0;-webkit-line-clamp:1}
/* 所有信息卡片固定同高（以科技资讯卡片高度为准），避免按行拉伸导致高度参差 */
@media (min-width:701px){
.hotspots-row :deep(> section){height:620px;min-height:620px;max-height:620px;align-self:start;display:flex;flex-direction:column}
.hotspots-row :deep(> section > ol){flex:1 1 auto;min-height:0;align-content:start;overflow-y:auto}
.hotspots-row :deep(> section > footer){margin-top:0!important}
/* 豆瓣 / Steam 保留原图尺寸与原行距，内容超出固定高度时在列表内滚动 */
.hotspots-row :deep(section[aria-labelledby="source-title-douban"] > ol),
.hotspots-row :deep(section[aria-labelledby="source-title-steam_top"] > ol),
.hotspots-row :deep(section[aria-labelledby="source-title-douban"] > ol > li),
.hotspots-row :deep(section[aria-labelledby="source-title-steam_top"] > ol > li){display:block}
.hotspots-row :deep(section[aria-labelledby="source-title-douban"] > ol > li > a),
.hotspots-row :deep(section[aria-labelledby="source-title-steam_top"] > ol > li > a){height:auto;min-height:0}
.hotspots-row :deep(section[aria-labelledby="source-title-douban"] > ol > li > a){padding:10px 2px}
.hotspots-row :deep(section[aria-labelledby="source-title-steam_top"] > ol > li > a){padding:12px 0}

}
.hotspots-row :deep(.github-copy p){font-size:11px;line-height:1.5;margin:2px 0}
.hotspots-row :deep(.weibo-meta),.hotspots-row :deep(.github-meta),.hotspots-row :deep(.v2ex-meta),.hotspots-row :deep(.ithome-meta),.hotspots-row :deep(.hacker-news-meta){font-size:11px;line-height:1.5;gap:6px}
.hotspots-row :deep(section > footer){margin-top:10px!important;padding:10px 0!important;font-size:11px;line-height:1.5}
</style>

<style scoped>
.hotspots-row > :deep(section:has(button[data-source-more][aria-expanded="true"])){height:var(--source-expanded-height,700px);max-height:var(--source-expanded-height,700px);min-height:0}
.hotspots-row :deep(section:has(button[data-source-more][aria-expanded="true"]) > ol){display:block;flex:1 1 0;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;scrollbar-width:thin;scrollbar-gutter:stable}
.hotspots-row :deep(section:has(button[data-source-more][aria-expanded="true"]) > ol > li > a){height:auto;min-height:56px}
</style>

<style scoped>
/* Compact leaderboard rank badges, shared only by information-source cards. */
.hotspots-row { --rank-muted:#718096; --rank-bg:rgba(113,128,150,.09); --rank-first:#d94343; --rank-second:#d97424; --rank-third:#a77916; }
.dark-theme .hotspots-row { --rank-muted:#9caec4; --rank-bg:rgba(156,174,196,.1); --rank-first:#ff8989; --rank-second:#ffb16b; --rank-third:#e9c568; }
.hotspots-row :deep(ol > li :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank,.source-rank,.article-image-rank)) { display:inline-flex;align-items:center;justify-content:center;flex:0 0 24px;width:24px;height:24px;box-sizing:border-box;border:1px solid currentColor;border-radius:6px;margin:0;padding:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums;font-size:12px;font-weight:600;line-height:1;color:var(--rank-muted);background:var(--rank-bg); }
.hotspots-row :deep(ol > li:nth-child(1) :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank,.source-rank,.article-image-rank)) { color:var(--rank-first);background:rgba(231,76,76,.12);font-weight:700; }
.hotspots-row :deep(ol > li:nth-child(2) :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank,.source-rank,.article-image-rank)) { color:var(--rank-second);background:rgba(232,137,56,.12);font-weight:700; }
.hotspots-row :deep(ol > li:nth-child(3) :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank,.source-rank,.article-image-rank)) { color:var(--rank-third);background:rgba(199,161,49,.13);font-weight:700; }
/* Rank aligns with the first title line, not the whole title/metadata block. */
.hotspots-row :deep(ol > li > a:has(> :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank))),
.hotspots-row :deep(.source-entry){align-items:flex-start}
.hotspots-row :deep(ol > li :is(.github-rank,.weibo-rank,.v2ex-rank,.ithome-rank,.hacker-news-rank,.news-rank,.source-rank)){transform:translateY(-3px)}
</style>

<style scoped>
.time-hub{--hub-line:rgba(105,128,160,.15);margin:18px 0 24px;padding:16px 20px 20px;border:1px solid var(--hub-line);border-radius:18px;background:rgba(255,255,255,.86);color:#26364c;min-width:0}
.time-hub-dark{--hub-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92);color:#e2e9f4}
.time-hub-tabs{display:flex;gap:6px;flex-wrap:wrap;padding-bottom:12px;margin-bottom:16px;border-bottom:1px solid var(--hub-line)}
.time-hub-tabs button{font:inherit;font-size:13px;line-height:1.5;padding:7px 12px;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer}
.time-hub-tabs button:hover{background:rgba(127,145,171,.07)}
.time-hub-tabs button[aria-pressed="true"]{background:var(--ui-accent-soft,rgba(67,137,141,.12));border-color:var(--hub-line);color:var(--ui-accent,#43898d);font-weight:600}
.time-hub-tabs button:focus-visible{outline:2px solid var(--ui-accent,#43898d);outline-offset:2px}
.time-hub :deep(.world-time),.time-hub :deep(.china-calendar),.time-hub :deep(.history-today){margin:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
@media(max-width:700px){.time-hub{padding:14px 12px 16px}.time-hub-tabs{gap:4px}.time-hub-tabs button{font-size:12px;padding:7px 8px}}
</style>

<style scoped>
.market-hub{--market-hub-line:rgba(105,128,160,.15);margin:18px 0 24px;padding:16px 20px 20px;border:1px solid var(--market-hub-line);border-radius:18px;background:rgba(255,255,255,.86);color:#26364c;min-width:0}
.market-hub-dark{--market-hub-line:rgba(145,164,194,.17);background:rgba(24,31,45,.92);color:#e2e9f4}
.market-hub-tabs{display:flex;gap:6px;flex-wrap:wrap;padding-bottom:12px;margin-bottom:16px;border-bottom:1px solid var(--market-hub-line)}
.market-hub-tabs button{font:inherit;font-size:13px;line-height:1.5;padding:7px 12px;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer}
.market-hub-tabs button:hover{background:rgba(127,145,171,.07)}
.market-hub-tabs button[aria-pressed="true"]{background:var(--ui-accent-soft,rgba(67,137,141,.12));border-color:var(--market-hub-line);color:var(--ui-accent,#43898d);font-weight:600}
.market-hub-tabs button:focus-visible{outline:2px solid var(--ui-accent,#43898d);outline-offset:2px}
.market-hub :deep(.market-panel),.market-hub :deep(.currency-panel){margin:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
@media(max-width:700px){.market-hub{padding:14px 12px 16px}.market-hub-tabs{gap:4px}.market-hub-tabs button{font-size:12px;padding:7px 8px}}
</style>

<style scoped>
.dashboard-hubs-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:stretch;margin:18px 0 24px}
.dashboard-hubs-row>.market-hub,.dashboard-hubs-row>.time-hub{margin:0;min-width:0;width:100%;box-sizing:border-box;container-type:inline-size}
@container(max-width:680px){
 .dashboard-hubs-row :deep(.calendar-layout){grid-template-columns:minmax(0,1fr)}
 .dashboard-hubs-row :deep(.history-list){grid-template-columns:minmax(0,1fr)}
}
@media(max-width:1000px){.dashboard-hubs-row{grid-template-columns:minmax(0,1fr);gap:16px}}
</style>

<style scoped>
@media(min-width:1001px){
 .dashboard-hubs-row>.market-hub,.dashboard-hubs-row>.time-hub{height:var(--hub-compact-height,520px);display:flex;flex-direction:column;overflow:hidden}
 .dashboard-hubs-row>section>nav{flex-shrink:0}
 /* 不要用 overscroll-behavior:contain：内容没溢出时它仍会拦住滚轮，鼠标停在卡片上页面就滚不动了 */
 .dashboard-hubs-row>section>div{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-gutter:stable;overscroll-behavior:auto}
 .dashboard-hubs-row>.time-hub.time-hub-apod-open{height:auto;align-self:start;overflow:visible}
 .dashboard-hubs-row>.time-hub-apod-open>#time-hub-apod{flex:none;overflow:visible;scrollbar-gutter:auto}
}
/* Independent expandable search forms; keep the site filter above them. */
.search-cosmic-panel .search-bar-compact {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 880px;
}

.search-bar-compact .unified-search-control { flex: none; }

.engine-unified-bar { display: flex; align-items: stretch; gap: 8px; width: 100%; min-width: 0; }
.engine-unified-bar .unified-search-control { flex: 1 1 0; min-width: 0; }
.engine-unified-bar :deep(.engine-select) { width: 132px; flex: 0 0 132px; height: var(--search-control-height, 40px); }
/* 搜索引擎下拉框透明 */
.engine-unified-bar :deep(.engine-select .el-select__wrapper) { background: transparent; }
.dark-theme .engine-unified-bar :deep(.engine-select .el-select__wrapper) { background: transparent; }
.engine-expand-toggle {
  flex: 0 0 auto;
  padding: 0 14px;
  border: 1px solid var(--el-border-color, #d7e4dc);
  border-radius: var(--search-control-radius, 12px);
  background: transparent;
  color: var(--el-text-color-regular, #5a6b60);
  font: inherit;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color .2s, color .2s, background .2s;
}
.engine-expand-toggle:hover { border-color: #7b9dea; color: #4979d3; background: rgba(123, 157, 234, .12); }
.engine-expand-toggle[aria-expanded="true"] { border-color: #7b9dea; color: #4979d3; background: rgba(123, 157, 234, .18); }
.dark-theme .engine-expand-toggle { background: transparent; border-color: #344b3d; color: #9dc4ab; }
.dark-theme .engine-expand-toggle:hover, .dark-theme .engine-expand-toggle[aria-expanded="true"] { background: rgba(120, 207, 155, .18); border-color: #83a88f; color: #d0e7d7; }
@media (max-width: 600px) {
  .engine-unified-bar { flex-wrap: wrap; }
  .engine-unified-bar :deep(.engine-select) { width: 100px; flex: 0 0 100px; }
  .engine-expand-toggle { flex: 1 0 100%; min-height: 34px; }
}

.engine-search-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 8px;
}

.engine-search-item {
  --engine-panel: #f8faf9;
  --engine-field: #ffffff;
  --engine-border: #d4ded8;
  --engine-hover: #edf2ef;
  --engine-text: #26332c;
  --engine-muted: #53635a;
  --engine-accent: #456253;
  --engine-focus-ring: rgb(69 98 83 / 18%);
  min-width: 0;
  border: 1px solid var(--engine-border);
  border-radius: 10px;
  background: var(--engine-panel);
  color: var(--engine-text);
}

.engine-search-item summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 10px;
  cursor: pointer;
  list-style: none;
  font-size: 13px;
  border-radius: 9px;
}

.engine-search-item summary::-webkit-details-marker { display: none; }
.engine-search-item summary::after {
  content: '';
  width: 7px;
  height: 7px;
  margin-left: auto;
  border: solid currentColor;
  border-width: 0 1px 1px 0;
  transform: rotate(45deg);
}

.engine-search-item[open] summary::after { transform: rotate(225deg); }
.dark-theme .engine-search-item {
  --engine-panel: #0f2a1b;
  --engine-field: #0b140e;
  --engine-border: #2f5a40;
  --engine-hover: #243c2d;
  --engine-text: #e8f9ee;
  --engine-muted: #9dc4ab;
  --engine-accent: #b0d4ba;
  --engine-focus-ring: rgb(169 224 189 / 22%);
}

.engine-search-item summary:hover { background: var(--engine-hover); }

.engine-search-item summary:focus-visible,
.search-bar-compact .engine-search-item .search-btn:focus-visible {
  outline: 2px solid var(--engine-accent);
  outline-offset: -2px;
}

.search-bar-compact .engine-search-item .unified-search-control {
  margin: 0 6px 6px;
  background: var(--engine-field);
  border-color: var(--engine-border);
}

.search-bar-compact .engine-search-item .unified-search-control:focus-within {
  border-color: var(--engine-accent);
  box-shadow: 0 0 0 2px var(--engine-focus-ring);
}

.search-bar-compact .engine-search-item .search-input :deep(.el-input__inner) {
  color: var(--engine-text);
}

.search-bar-compact .engine-search-item .search-input :deep(.el-input__inner::placeholder),
.search-bar-compact .engine-search-item .search-input :deep(.el-input__clear) {
  color: var(--engine-muted);
}

.search-bar-compact .engine-search-item .unified-search-control .search-btn {
  color: var(--engine-accent) !important;
}

.search-bar-compact .engine-search-item .unified-search-control .search-btn:hover {
  background: var(--engine-hover) !important;
  color: var(--engine-text) !important;
}

@media (max-width: 700px) {
  .engine-search-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

</style>

<style scoped>
/* 首屏模块快捷入口 */
.module-quick-entry {
  margin: 18px 20px 0;
  padding: 16px 18px;
  border: 1px solid var(--el-border-color-light, #d7e4dc);
  border-radius: 14px;
  background: var(--el-bg-color, #fff);
}
.module-quick-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.module-quick-eyebrow {
  font: 10px/1.6 Consolas, monospace;
  letter-spacing: 2px;
  color: var(--el-text-color-secondary, #7a8a80);
}
.module-quick-head h3 {
  margin: 2px 0 0;
  font-size: 18px;
  color: var(--el-text-color-primary, #26382d);
}
.module-quick-head small { font-size: 11px; color: var(--el-text-color-secondary, #7a8a80); }
.module-quick-groups { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.module-quick-group { display: flex; align-items: flex-start; gap: 10px; }
.module-quick-label {
  flex: none;
  width: 44px;
  padding-top: 7px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary, #7a8a80);
}
.module-quick-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(102px, 1fr));
  gap: 6px;
  min-width: 0;
}
.module-quick-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid var(--el-border-color-light, #dfe8e1);
  border-radius: 8px;
  background: transparent;
  color: var(--el-text-color-regular, #3c4f44);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.module-quick-item:hover {
  color: var(--ui-accent, #2f6b4f);
  background: var(--ui-accent-soft, #eef6f1);
  border-color: transparent;
}
.module-quick-icon { width: 14px; height: 14px; flex: none; }
.module-quick-item:focus-visible { outline: 2px solid var(--ui-accent, #2f6b4f); outline-offset: 2px; }
@media (max-width: 700px) {
  .module-quick-entry { margin: 14px 12px 0; padding: 14px; }
  .module-quick-group { flex-direction: column; gap: 4px; }
  .module-quick-label { padding-top: 0; }
}
</style>
