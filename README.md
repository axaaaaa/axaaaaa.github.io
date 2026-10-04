# navigation-site

🚀 一个优雅且功能强大的导航网站，专注于提供高效的网络资源访问体验。本项目集成了AI工具、开发资源、学习平台等多个领域的精选网站，并提供智能搜索、个性化定制等功能。

## ✨ 核心特性

- 🎯 **智能导航**: 多维度分类系统，快速定位目标资源
- 🎨 **主题切换**: 支持亮暗主题，提供舒适的视觉体验
- 🔍 **聚合搜索**: 集成多个搜索引擎，一站式搜索
- 📱 **全端适配**: 响应式设计，完美支持移动设备
- ⚙️ **个性定制**: 自定义设置，打造专属导航页

## 🛠️ 技术栈

- Vue.js 3
- Element Plus UI
- JavaScript ES6+
- CSS3
- HTML5

## 📁 项目结构

```
navigation-site/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/            # 图片等资源
│   ├── components/        # Vue组件
│   │   └── Navigation.vue # 主导航组件
│   ├── nav-data.js        # 导航数据配置
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json           # 项目依赖
└── README.md             # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 14.x
- npm >= 6.x

```bash
# 安装依赖
npm install

# 开发环境运行
npm run serve

# 生产环境构建
npm run build

# 代码检查
npm run lint
```

## 📝 数据配置

导航数据在 `src/nav-data.js` 中配置，格式如下：

```javascript
export const navData = [
  {
    name: '分类名称',
    icon: '图标名称',
    links: [
      {
        name: '网站名称',
        url: '网站地址',
        description: '网站描述'
      }
    ]
  }
];
```

## 🚀 部署说明

1. 执行构建命令：`npm run build`
2. 将 `dist` 目录下的文件部署到静态文件服务器
3. 配置服务器支持 HTML5 History 模式（可选）

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 提交 Pull Request

## 📄 开源协议

[MIT License](LICENSE)

## 💬 联系方式

- 项目问题请提交 [Issue](https://github.com/yourusername/navigation-site/issues)
- 功能建议请使用网站内的反馈建议功能
