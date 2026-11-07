<template>
  <button type="button" class="sponsor-button" title="赞助本站" aria-label="赞助本站" @click="visible=true"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>
  <DonateDialog v-model="visible" />
</template>
<script>
import DonateDialog from './DonateDialog.vue';
export default {name:'SponsorButton',components:{DonateDialog},data:()=>({visible:false})};
</script>
<style scoped>
.sponsor-button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 30px;width:30px;height:32px;padding:0;margin:0 6px 0 0;border:0;border-radius:8px;background:transparent;color:#cb7485;cursor:pointer}.sponsor-button:hover{background:rgba(203,116,133,.1)}.sponsor-button:focus-visible{outline:2px solid #cb7485;outline-offset:2px}@media(max-width:768px){.sponsor-button{flex-basis:26px;width:26px;margin-right:0}}
</style>
