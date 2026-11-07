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

/* 暗黑模式文字色：与浏览器环境面板共用柔和绿色 */
body.dark,
.dark-theme {
  --dark-text-primary: #b0d4ba;
  --dark-text-secondary: #8ca995;
  --dark-text-muted: #8ca995;
  --dark-text-link: #b0d4ba;
  --dark-text-accent: #b0d4ba;
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

/* 暗黑模式滚动条与浏览器环境主文字共用颜色，覆盖页面和内部滚动区域。 */
html.dark,
body.dark,
body.dark * {
  scrollbar-width: thin;
  scrollbar-color: var(--dark-text-primary, #b0d4ba) transparent;
}

html.dark::-webkit-scrollbar,
body.dark::-webkit-scrollbar,
body.dark *::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.dark::-webkit-scrollbar-track,
body.dark::-webkit-scrollbar-track,
body.dark *::-webkit-scrollbar-track {
  background: transparent;
}

html.dark::-webkit-scrollbar-thumb,
body.dark::-webkit-scrollbar-thumb,
body.dark *::-webkit-scrollbar-thumb,
html.dark::-webkit-scrollbar-thumb:hover,
body.dark::-webkit-scrollbar-thumb:hover,
body.dark *::-webkit-scrollbar-thumb:hover {
  background-color: var(--dark-text-primary, #b0d4ba);
  border-radius: 4px;
}
/* The new theme grows outward from the switch in both directions. */
:root.theme-ripple-active::view-transition-old(root),
:root.theme-ripple-active::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
:root.theme-ripple-active::view-transition-group(root) { animation: none; }
:root.theme-ripple-active::view-transition-old(root) { z-index: 1; }
:root.theme-ripple-active::view-transition-new(root) { z-index: 2; }
:root.theme-ripple-active::view-transition-image-pair(root) { isolation: isolate; }
/* Capture fully updated colors, rather than an in-progress component fade. */
:root.theme-ripple-active,
:root.theme-ripple-active * { transition: none !important; }
/* Keep the switch above the page reveal and interpolate its thumb independently. */
:root.theme-ripple-active::view-transition-group(theme-switch) {
  z-index: 3;
  animation-duration: 450ms;
}
:root.theme-ripple-active::view-transition-group(theme-thumb) {
  z-index: 4;
  animation-duration: 450ms;
  animation-timing-function: cubic-bezier(.22,.8,.25,1);
}
:root.theme-ripple-active::view-transition-old(theme-switch),
:root.theme-ripple-active::view-transition-old(theme-thumb) { display: none; }
:root.theme-ripple-active::view-transition-new(theme-switch),
:root.theme-ripple-active::view-transition-new(theme-thumb) {
  animation: none;
  mix-blend-mode: normal;
}
@media (prefers-reduced-motion: reduce) {
  :root.theme-ripple-active::view-transition-group(theme-switch),
  :root.theme-ripple-active::view-transition-group(theme-thumb) { animation: none; }
}

/* Shared UI tokens live on html so teleported overlays inherit the theme. */
:root {
  --ui-accent: #386a50; --ui-accent-soft: #edf4ef; --ui-focus: #527d63;
  --el-color-primary: #386a50; --el-color-primary-light-3: #739782;
  --el-color-primary-light-5: #9bb5a5; --el-color-primary-light-7: #c3d3c9;
  --el-color-primary-light-8: #d7e2db; --el-color-primary-light-9: #edf4ef;
  --el-color-primary-dark-2: #2d5540;
}
html.dark {
  color-scheme: dark;
  --ui-accent: #b0d4ba; --ui-accent-soft: #1b2921; --ui-focus: #8ca995;
  --el-color-primary: #b0d4ba; --el-color-primary-light-3: #829d8a;
  --el-color-primary-light-5: #5d7565; --el-color-primary-light-7: #394c40;
  --el-color-primary-light-8: #293a30; --el-color-primary-light-9: #1b2921;
  --el-color-primary-dark-2: #c0dec8;
  --el-bg-color: #101612; --el-bg-color-page: #0a0e0b; --el-bg-color-overlay: #151d18;
  --el-fill-color-blank: #101612; --el-fill-color-light: #1b2921; --el-fill-color: #233128;
  --el-text-color-primary: #b0d4ba; --el-text-color-regular: #b0d4ba;
  --el-text-color-secondary: #8ca995; --el-text-color-placeholder: #81968a;
  --el-border-color: #34473b; --el-border-color-light: #293a30;
  --el-border-color-lighter: #233128; --el-border-color-extra-light: #1b2921;
  --el-mask-color: rgba(0,0,0,.62);
}
body ::selection { background: var(--ui-accent-soft); color: var(--ui-accent); }
body :is(button, a, [role="button"], input, textarea):focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 3px; }
body :is(.el-input__wrapper, .el-select__wrapper):is(.is-focus, .is-focused) { box-shadow: 0 0 0 1px var(--ui-accent) inset !important; }
body.dark :is(.el-input__wrapper, .el-select__wrapper, .el-textarea__inner) { background: var(--el-fill-color-blank) !important; color: var(--el-text-color-primary) !important; box-shadow: 0 0 0 1px var(--el-border-color) inset !important; }
body.dark :is(.el-input__wrapper, .el-select__wrapper):hover { box-shadow: 0 0 0 1px var(--ui-focus) inset !important; }
body.dark :is(.el-input__wrapper, .el-select__wrapper):is(.is-focus, .is-focused) { box-shadow: 0 0 0 1px var(--ui-accent) inset !important; }
body.dark :is(.el-input__inner, .el-select__selected-item, .el-textarea__inner) { color: var(--el-text-color-primary) !important; }
body.dark :is(.el-select-dropdown, .el-dropdown-menu, .el-dialog, .el-message-box, .el-popover.el-popper) { background: var(--el-bg-color-overlay) !important; color: var(--el-text-color-primary) !important; border-color: var(--el-border-color) !important; }
body.dark :is(.el-select-dropdown__item, .el-dropdown-menu__item) { color: var(--el-text-color-primary) !important; }
body.dark :is(.el-select-dropdown__item, .el-dropdown-menu__item):is(:hover, .hover, .is-hovering, .is-selected, .selected) { color: var(--ui-accent) !important; background: var(--ui-accent-soft) !important; }
body.dark .el-popper.is-dark { background: #1b2921; border-color: #34473b; color: #b0d4ba; }
body.dark .el-popper.is-dark .el-popper__arrow::before { background: #1b2921; border-color: #34473b; }
body.dark .el-button--primary { color: #101612; }
body.dark .el-button--primary.is-plain { color: var(--ui-accent); }
body.dark .el-message--info { --el-message-bg-color: #151d18; --el-message-border-color: #34473b; --el-message-text-color: #b0d4ba; }
body.dark .el-message--info .el-message__content { color: #b0d4ba !important; }
/* Keep semantic success/warning/error palettes intact. */
body.dark :is(.group-title:hover, .collapse-toggle:hover, .scroll-btn:hover) { color: var(--ui-accent); }


/* Inputs keep their resting border; no additional focus rectangle. */
body :is(input, textarea):is(:focus, :focus-visible) { outline: none !important; outline-offset: 0 !important; }
body .el-input__wrapper.is-focus, body.dark .el-input__wrapper.is-focus { box-shadow: 0 0 0 1px var(--el-border-color) inset !important; }
body .unified-search-control .el-input__wrapper.is-focus, body.dark .unified-search-control .el-input__wrapper.is-focus { box-shadow: none !important; }
body .unified-search-control:focus-within, body.dark .unified-search-control:focus-within { box-shadow: none !important; border-color: var(--el-border-color) !important; }
body .el-textarea__inner:focus { box-shadow: 0 0 0 1px var(--el-border-color) inset !important; }

</style>
