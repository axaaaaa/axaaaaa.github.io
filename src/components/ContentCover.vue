<template><div v-if="image&&!failed" class="content-cover"><img :src="image" alt="" loading="lazy" referrerpolicy="no-referrer" @error="failed=true" /></div></template>
<script>
import {SHOW_SOURCE_IMAGES} from '../utils/source-display.mjs';
import {resolveCover} from '../utils/source-covers.mjs';
export default {name:'ContentCover',props:{cover:String,sourceKey:{type:String,required:true}},data:()=>({failed:false}),computed:{image(){return SHOW_SOURCE_IMAGES?resolveCover(this.cover,this.sourceKey):'';}},watch:{image(){this.failed=false;}}};
</script>
<style scoped>.content-cover{flex:0 0 100%;width:100%;min-width:0;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:rgba(127,145,171,.08)}.content-cover img{display:block;width:100%;height:100%;object-fit:cover}</style>
