<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 基础重置 */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden; /* 防止水平滚动条 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* ============================================
   📱 移动端核心修复补丁
============================================ */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;   
    padding-left: 0 !important;  
    width: 100% !important;      
    box-sizing: border-box;      
  }

  .app {
    width: 100%;
    overflow-x: hidden;
  }
}

/* ==================================================
   ★★★ 全局暗黑模式样式 ★★★
   ================================================== */

/* 暗黑模式 CSS 变量 - 黑客帝国绿色主题 */
body.dark,
.dark-theme {
  --dark-text-primary: #00ff41;
  --dark-text-secondary: #00cc33;
  --dark-text-muted: #008822;
  --dark-text-link: #39ff14;
  --dark-text-accent: #66ff66;
  cursor: auto;
}

/* 暗黑模式主文字颜色 */
body.dark .navigation,
body.dark .side-navigation,
.dark-theme {
  color: var(--dark-text-primary);
}

/* 暗黑模式图标颜色 - 黑客帝国绿 */
body.dark .el-icon {
  color: var(--dark-text-secondary) !important;
}

/* ==================================================
   ★★★ 全局暗黑模式滚动条 ★★★
   ================================================== */

/* 标准滚动条属性 - 黑客帝国绿 */
body.dark {
  scrollbar-width: thin;
  scrollbar-color: #00ff41 transparent;
}

/* WebKit滚动条伪元素 - 黑客帝国绿 */
body.dark::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

body.dark::-webkit-scrollbar-track {
  background: transparent;
}

body.dark::-webkit-scrollbar-thumb {
  background-color: #008822;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 65, 0.1);
}

body.dark::-webkit-scrollbar-thumb:hover {
  background-color: #00ff41;
}

/* 暗黑模式图标颜色 */
body.dark .el-icon {
  color: #00cc33 !important;
}

/* 确保所有滚动容器都应用相同样式 - 黑客帝国绿 */
body.dark .navigation,
body.dark .side-nav-content {
  scrollbar-width: thin;
  scrollbar-color: #008822 transparent;
}

body.dark .navigation::-webkit-scrollbar,
body.dark .side-nav-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

body.dark .navigation::-webkit-scrollbar-track,
body.dark .side-nav-content::-webkit-scrollbar-track {
  background: transparent;
}

body.dark .navigation::-webkit-scrollbar-thumb,
body.dark .side-nav-content::-webkit-scrollbar-thumb {
  background-color: #008822;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 65, 0.1);
}

body.dark .navigation::-webkit-scrollbar-thumb:hover,
body.dark .side-nav-content::-webkit-scrollbar-thumb:hover {
  background-color: #00ff41;
}
</style>