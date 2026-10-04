export const devTools = [
  {
    name: '程序开发',
    icon: 'EditPen',
    group: '💻 编程与开发',
    emoji: '💻',
    subCategories: [
      {
        name: '代码与社区',
        emoji: '👨‍💻',
        links: [
          { name: 'GitHub', url: 'https://github.com', description: '全球最大的代码托管平台', tags: ['托管'] },
          { name: 'GitHub Trending', url: 'https://github.com/trending', description: '查看 GitHub 今日热门项目', tags: ['热门'] },
          { name: 'Gitee', url: 'https://gitee.com/', description: '码云，国内领先的代码托管平台', tags: ['国内'] },
          { name: 'GitLab', url: 'https://gitlab.com/', description: '支持 CI/CD 的端到端软件开发平台', tags: ['DevOps'] },
          { name: 'Stack Overflow', url: 'https://stackoverflow.com/', description: '全球最大的程序员问答社区', tags: ['问答'] },
          { name: 'LeetCode', url: 'https://leetcode.cn/', description: '程序员刷题、算法练习平台', tags: ['刷题'] },
          { name: 'CodePen', url: 'https://codepen.io/', description: '前端代码在线编辑与展示社区', tags: ['前端'] },
          { name: 'HackMD', url: 'https://hackmd.io/', description: '实时协作的 Markdown 笔记工具', tags: ['协作'] }
        ]
      },
      {
        name: 'Web框架与 CMS',
        emoji: '🏗️',
        links: [
          { name: 'WordPress', url: 'https://wordpress.org/', description: '全球最流行的开源 CMS 系统', tags: ['PHP'] },
          { name: 'Hexo', url: 'https://hexo.io/', description: '快速、简洁且高效的静态博客框架', tags: ['Node'] },
          { name: 'Hugo', url: 'https://gohugo.io/', description: '基于 Go 语言的极速静态网站生成器', tags: ['Go'] },
          { name: 'Django', url: 'https://www.djangoproject.com/', description: '高水准的 Python Web 框架', tags: ['Python'] },
          { name: 'Laravel', url: 'https://laravel.com/', description: '优雅的 PHP Web 开发框架', tags: ['PHP'] },
          { name: 'Ghost', url: 'https://ghost.org/', description: '专业的现代化内容发布平台', tags: ['Node'] },
          { name: 'Nextcloud', url: 'https://nextcloud.com/', description: '开源的私有云存储与协作平台', tags: ['私有云'] },
          { name: 'Discourse', url: 'https://www.discourse.org/', description: '现代化的开源论坛软件', tags: ['论坛'] }
        ]
      },
      {
        name: '服务端与运维',
        emoji: '⚙️',
        links: [
          { name: '宝塔面板', url: 'https://www.bt.cn/', description: '简单好用的服务器运维面板', tags: ['运维'] },
          { name: 'Nginx', url: 'https://nginx.org/', description: '高性能 HTTP 和反向代理服务器', tags: ['Web'] },
          { name: 'Apache', url: 'https://httpd.apache.org/', description: '经典的 Web 服务器软件', tags: ['Web'] },
          { name: 'Docker', url: 'https://www.docker.com/', description: '应用容器引擎', tags: ['容器'] },
          { name: 'Kubernetes', url: 'https://kubernetes.io/', description: '容器编排与管理系统', tags: ['K8s'] },
          { name: 'Redis', url: 'https://redis.io/', description: '高性能键值对数据库', tags: ['数据库'] },
          { name: 'Elasticsearch', url: 'https://www.elastic.co/', description: '分布式搜索与分析引擎', tags: ['搜索'] },
          { name: 'Kafka', url: 'https://kafka.apache.org/', description: '高吞吐量的分布式消息系统', tags: ['消息'] },
          { name: 'Wampserver', url: 'https://www.wampserver.com/', description: 'PHP 集成开发环境', tags: ['环境'] },
          { name: 'Navicat', url: 'https://www.navicat.com/', description: '数据库管理工具', tags: ['数据库'] },
          { name: 'SqliteStudio', url: 'https://sqlitestudio.pl/', description: 'SQLite 数据库管理工具', tags: ['数据库'] }
        ]
      },
      {
        name: '编辑器与工具',
        emoji: '📝',
        links: [
          { name: 'Typora', url: 'https://typora.io/', description: '所见即所得的 Markdown 编辑器', tags: ['写作'] },
          { name: 'MarkText', url: 'https://github.com/marktext/marktext', description: '开源的 Markdown 编辑器', tags: ['开源'] },
          { name: 'XAMPP', url: 'https://www.apachefriends.org/', description: 'PHP 集成开发环境', tags: ['环境'] },
          { name: 'Cryptomator', url: 'https://cryptomator.org/', description: '云存储客户端加密工具', tags: ['安全'] }
        ]
      }
    ]
  },
  {
  name: '云服务器',
  group: '💻 编程与开发',
  icon: 'Cloudy',
  emoji: '☁️',
  subCategories: [
    /* ------------------ 国内云厂商 ------------------ */
    {
      name: '国内云厂商',
      emoji: '🇨🇳',
      links: [
        { name: '阿里云', url: 'https://www.aliyun.com/', description: '阿里巴巴旗下云计算服务', tags: ['大厂'] },
        { name: '腾讯云', url: 'https://cloud.tencent.com/', description: '腾讯旗下云计算服务', tags: ['大厂'] },
        { name: '华为云', url: 'https://www.huaweicloud.com/', description: '华为云计算服务', tags: ['大厂'] },
        { name: '百度智能云', url: 'https://cloud.baidu.com/', description: '百度云计算服务', tags: ['AI'] },
        { name: '天翼云', url: 'https://www.ctyun.cn/', description: '中国电信旗下云服务', tags: ['国企'] },
        { name: '移动云', url: 'https://ecloud.10086.cn/', description: '中国移动旗下云服务', tags: ['国企'] },
        { name: '京东云', url: 'https://www.jdcloud.com/', description: '京东旗下云服务', tags: ['大厂'] },
        { name: 'UCloud 优刻得', url: 'https://www.ucloud.cn/', description: '国产独立云厂商，价格较稳', tags: ['国产'] },
        { name: '七牛云', url: 'https://www.qiniu.com/', description: '以对象存储和 CDN 见长', tags: ['CDN'] },
        { name: '西部数码', url: 'https://www.west.cn/', description: '老牌互联网基础服务提供商', tags: ['域名'] }
      ]
    },

    /* ------------------ 国际 VPS ------------------ */
    {
      name: '国际 VPS',
      emoji: '🌍',
      links: [
        { name: 'AWS', url: 'https://aws.amazon.com/', description: '亚马逊云计算服务', tags: ['全球'] },
        { name: 'Google Cloud', url: 'https://cloud.google.com/', description: '谷歌云计算平台，性能顶级', tags: ['全球'] },
        { name: 'Oracle Cloud', url: 'https://www.oracle.com/cloud/', description: '甲骨文云，常有免费层羊毛', tags: ['免费层'] },
        { name: 'Hetzner', url: 'https://www.hetzner.com/', description: '欧洲最强性价比云，便宜大碗', tags: ['高性价比'] },
        { name: 'Vultr', url: 'https://www.vultr.com/', description: '性价比高的按小时计费 VPS', tags: ['VPS'] },
        { name: 'DigitalOcean', url: 'https://www.digitalocean.com/', description: '开发者友好的云基础架构', tags: ['VPS'] },
        { name: 'Linode', url: 'https://www.linode.com/', description: '老牌高性能 VPS 服务商', tags: ['VPS'] },
        { name: 'Bandwagon', url: 'https://bandwagonhost.com/', description: '搬瓦工，国内线路优化较好', tags: ['CN2'] },
        { name: 'RackNerd', url: 'https://racknerd.com/', description: '以极低价格闻名的新晋 VPS 商', tags: ['便宜'] },
        { name: 'HostHatch', url: 'https://hosthatch.com/', description: 'SSD/NVMe 高性能机器，促销力度大', tags: ['NVMe'] },
        { name: 'GreenCloud', url: 'https://greencloudvps.com/', description: '支持直连/高性价比 VPS', tags: ['稳定'] }
      ]
    },

    /* ------------------ PaaS 与 部署 ------------------ */
    {
      name: '部署',
      emoji: '🚀',
      links: [
        { name: 'Vercel', url: 'https://vercel.com/', description: '前端开发者首选的部署平台', tags: ['免费'] },
        { name: 'Netlify', url: 'https://www.netlify.com/', description: '现代 Web 项目自动化部署平台', tags: ['免费'] },
        { name: 'Render', url: 'https://render.com/', description: '统一的云应用托管平台', tags: ['PaaS'] },
        { name: 'Railway', url: 'https://railway.app/', description: '轻量、极易用、适合部署小项目', tags: ['Serverless'] },
        { name: 'Cloudflare', url: 'https://www.cloudflare.com/', description: 'CDN、安全、防护、无服务器计算', tags: ['必备'] },
        { name: 'Cloudflare Dashboard', url: 'https://dash.cloudflare.com/', description: 'Cloudflare 管理控制台', tags: ['必备'] },
        { name: 'Fly.io', url: 'https://fly.io/', description: '全球边缘部署，运行 Docker 应用', tags: ['Serverless'] },
        { name: 'GoDaddy', url: 'https://www.godaddy.com/', description: '全球最大的域名注册商', tags: ['域名'] },
        { name: 'Namesilo', url: 'https://www.namesilo.com/', description: '域名注册商，价格便宜', tags: ['域名'] },
      ]
    },

    /* ------------------ 云存储网盘 ------------------ */
    {
      name: '云存储网盘',
      emoji: '☁️',
      links: [
        { name: 'Google Drive', url: 'https://drive.google.com/', description: '谷歌云端硬盘，生态整合好', tags: ['谷歌'] },
        { name: 'OneDrive', url: 'https://onedrive.live.com/', description: '微软云存储，Office 必备', tags: ['微软'] },
        { name: 'Dropbox', url: 'https://www.dropbox.com/', description: '同步体验优秀', tags: ['同步'] },
        { name: 'MEGA', url: 'https://mega.io/', description: '免费空间超大，端到端加密', tags: ['安全'] },
        { name: '阿里云盘', url: 'https://www.aliyundrive.com/', description: '不限速的云盘服务', tags: ['收费'] },
        { name: '夸克网盘', url: 'https://pan.quark.cn/', description: '夸克网盘，支持多设备同步', tags: ['收费'] },
        { name: '百度网盘', url: 'https://pan.baidu.com/', description: '国内资源最丰富', tags: ['收费'] },
        { name: '蓝奏云', url: 'https://up.woozooo.com/', description: '小文件分享首选，不限速', tags: ['收费'] }
      ]
    },

    /* ------------------ 网络与代理 ------------------ */
    {
      name: '网络与代理',
      emoji: '🔒',
      links: [
        /* --- 客户端工具 --- */
        { name: 'Clash Verge', url: 'https://clashverge.net/', description: '流行的 Clash 桌面客户端', tags: ['工具'] },
        { name: 'Clash Verge Rev', url: 'https://github.com/zzzgydi/clash-verge', description: '基于 Mihomo / Meta 的跨平台客户端', tags: ['开源'] },
        { name: 'NekoRay', url: 'https://github.com/MatsuriDayo/nekoray', description: '跨平台代理客户端', tags: ['开源'] },
        { name: 'clashparty', url: 'https://clashparty.org/', description: '跨平台新型代理客户端', tags: ['开源'] },
        { name: 'v2rayN', url: 'https://github.com/2dust/v2rayN', description: 'Windows 用户最常用 V2Ray 客户端', tags: ['开源'] },
        { name: 'Hiddify', url: 'https://github.com/hiddify/hiddify-app', description: '新生代跨平台代理客户端', tags: ['多协议'] },

        /* --- 面板系统 --- */
        { name: 'V2Board', url: 'https://github.com/v2board/v2board', description: '现代化多协议机场面板', tags: ['开源'] },
        { name: 'SSPanel-UIM', url: 'https://github.com/Anankke/SSPanel-Uim', description: '最成熟的机场前端面板', tags: ['开源'] },
        { name: 'x-ui', url: 'https://github.com/vaxilu/x-ui', description: '轻量级 V2Ray/XRay 面板', tags: ['开源'] },
        { name: 'Xray-ui', url: 'https://github.com/alireza0/x-ui', description: 'x-ui 增强版，现代 UI', tags: ['开源'] },
        { name: 'Xboard', url: 'https://github.com/Xboard-dev/Xboard', description: '新 UI、功能完善的机场面板', tags: ['开源'] },
        { name: 'Marzban', url: 'https://github.com/Gozargah/Marzban', description: '基于 Xray 的全节点管理系统', tags: ['开源'] },
        { name: 'VNetPanel', url: 'https://github.com/FunctionClub/VNetPanel', description: '轻量级多协议管理面板', tags: ['开源'] },
        { name: 'Soga', url: 'https://github.com/sprov065/soga', description: '后端程序，支持 V2Board/SSPanel', tags: ['后端'] },

        /* --- 线路与评测 --- */
        { name: '梯子导航', url: 'https://tzdaohang.com/', description: '科学上网服务评测导航', tags: ['导航'] },
        { name: '优云666', url: 'https://youyun520.com/', description: '网络加速服务' },
        { name: '飞机云', url: 'https://feijicloud.com/', description: '网络加速服务' },
        { name: 'GW云洞', url: 'https://hello-yundong.com/', description: '网络加速服务' },

        /* --- 内核 / 其他工具 --- */
        { name: 'mihomo-core', url: 'https://github.com/MetaCubeX/mihomo', description: '最流行的 Clash Meta 内核', tags: ['核心'] },
        { name: 'Xray-core', url: 'https://github.com/XTLS/Xray-core', description: 'XTLS / VLESS 核心实现', tags: ['核心'] },
        { name: 'V2Ray-core', url: 'https://github.com/v2fly/v2ray-core', description: 'VMess 协议核心实现', tags: ['核心'] }
      ]
    }
  ]
}

];