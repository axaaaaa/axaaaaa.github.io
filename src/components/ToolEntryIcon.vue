<template><component :is="icon" class="tool-entry-icon" aria-hidden="true" /></template>
<script>
import {Document,Refresh,Picture,Sort,Key,Connection,Files,Link,User,Tickets,View,Delete,Cpu,Lock,Grid,Monitor,Collection,Folder,Setting,DataAnalysis} from '@element-plus/icons-vue';
const icons={'image-compress':Picture,'ascii-art':Tickets,'character-stats':DataAnalysis,'text-dedup':Files,text:Document,json:Tickets,image:Picture,units:Sort,hash:Key,qr:Grid,diff:Files,encoding:Refresh,identity:User,rich:Document,chinese:Refresh,pinyin:Document,width:Sort,invisible:View,'exif-view':Picture,'exif-clean':Delete,'basic-calculator':Grid,calculator:Cpu,password:Lock,Windows:Monitor,macOS:Monitor,Chrome:Link,'VS Code':Tickets,Excel:DataAnalysis,Word:Document,'单元格':Grid,'公式与计算':Cpu,'数据与筛选':DataAnalysis,'视图与窗口':Monitor,'排版':Sort,'插入':Collection,'审阅':View,'格式':Tickets,'编辑':Document,'窗口':Monitor,'系统':Setting,'文件':Folder,'标签页':Collection,'导航':Connection,'书签':Tickets,'开发':Cpu,'HTTP 状态码':Link,'常见端口':Connection,'DNS 记录':Tickets,'基础概念':DataAnalysis};
export default {name:'ToolEntryIcon',props:{name:{type:String,default:''}},computed:{icon(){return icons[this.name]||Grid;}}};
</script>
<style scoped>.tool-entry-icon{display:inline-block;width:15px;height:15px;flex:0 0 15px;vertical-align:-2px;margin-right:6px;color:inherit;pointer-events:none;}</style>

