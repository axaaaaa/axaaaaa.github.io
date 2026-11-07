<template>
  <button type="button" class="bookmark-site-button" title="收藏本站" aria-label="收藏本站" @click="visible=true"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.55 4.45L17.6 20.3 12 17.35 6.4 20.3l1.05-6.25L2.9 9.6l6.3-.9L12 3Z" /></svg></button>
  <el-dialog v-model="visible" title="收藏本站" width="min(420px, calc(100vw - 32px))" append-to-body :close-on-click-modal="true" class="bookmark-site-dialog">
    <div class="bookmark-site-guide">
      <template v-if="mobile"><p>请打开浏览器的 <strong>分享</strong> 或 <strong>更多（⋯）</strong> 菜单，选择 <strong>添加书签 / 收藏</strong>。</p><p>iPhone / iPad Safari：分享 → 添加书签，或添加到个人收藏。</p></template>
      <template v-else><p>按 <kbd>{{mac?'⌘ + D':'Ctrl + D'}}</kbd>，即可打开浏览器的收藏窗口。</p><p>也可以点击浏览器地址栏旁的星标，选择收藏夹后保存。</p></template>
      <p class="bookmark-site-note">此按钮仅显示操作指引，不会自动写入浏览器书签。</p>
    </div>
    <template #footer><el-button type="primary" @click="visible=false">知道了</el-button></template>
  </el-dialog>
</template>
<script>
export default {name:'BookmarkSite',data:()=>({visible:false,mobile:false,mac:false}),mounted(){this.mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);this.mac=/Mac/i.test(navigator.platform);}};
</script>
<style scoped>
.bookmark-site-button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 30px;width:30px;height:32px;padding:0;margin:0 6px 0 0;border:0;border-radius:8px;background:transparent;color:#ba8b32;cursor:pointer}.bookmark-site-button:hover{background:rgba(186,139,50,.1)}.bookmark-site-button:focus-visible{outline:2px solid #ba8b32;outline-offset:2px}.bookmark-site-guide{line-height:1.9;font-size:14px;overflow-wrap:anywhere}.bookmark-site-guide p{margin:0 0 14px}.bookmark-site-guide kbd{display:inline-block;padding:3px 9px;border:1px solid var(--el-border-color);border-radius:6px;background:var(--el-fill-color-light);font:inherit;font-weight:600}.bookmark-site-note{font-size:12px;color:var(--el-text-color-secondary)}@media(max-width:768px){.bookmark-site-button{flex-basis:26px;width:26px;margin-right:0}}
</style>
