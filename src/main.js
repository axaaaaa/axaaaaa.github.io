// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';  // 引入暗黑模式样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // 引入所有ElementPlus的图标


const app = createApp(App);

app.use(router);
app.use(ElementPlus);

// 全局注册所有图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');