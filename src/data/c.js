export const c = [
  {
    name: '系统工具',
    icon: 'Tools',
    group: '🛠️系统工具',
    emoji: '🛠️',
    subCategories: [
      {
        name: '网络与连接',
        emoji: '🌐',
        links: [
          { name: 'V2Ray', url: 'https://www.v2ray.com/', description: 'Project V 核心工具', tags: ['代理'] },
          { name: 'Shadowsocks', url: 'https://shadowsocks.org/', description: '一种高性能安全的 Socks5 代理', tags: ['代理'] },
          { name: 'ClashMeta', url: 'https://github.com/MetaCubeX/ClashMetaForAndroid', description: '基于 Clash 的 Android 代理客户端', tags: ['安卓'] },
          { name: 'V2RayNG', url: 'https://github.com/2dust/v2rayNG/', description: 'Android 平台的 V2Ray 客户端', tags: ['安卓'] },
          { name: 'Hiddify', url: 'https://hiddify.com/', description: '多平台通用代理客户端', tags: ['全平台'] },
          { name: 'OpenVPN', url: 'https://openvpn.net/', description: '开源 VPN 解决方案' },
          { name: 'Xshell', url: 'https://www.xshell.com/', description: '强大的 SSH 远程终端连接工具', tags: ['收费'] },
          { name: 'PuTTY', url: 'https://www.putty.org/', description: '经典的开源 SSH 和 Telnet 客户端', tags: ['开源'] },
          { name: 'curl', url: 'https://curl.se/', description: '命令行数据传输工具，接口测试必备', tags: ['命令行'] },
          { name: 'TigerVNC', url: 'https://tigervnc.org/', description: '跨平台 VNC 客户端，支持远程桌面控制', tags: ['VNC'] },
        ]
      },
      {
        name: '系统增强与监控',
        links: [
          { name: 'PowerToys', url: 'https://github.com/microsoft/PowerToys', description: '微软官方系统增强工具集（取色、分屏等）', tags: ['必备'] },
          { name: 'Everything', url: 'https://www.voidtools.com/', description: '本地文件瞬间搜索神器', tags: ['必备'] },
          { name: 'IrfanView', url: 'https://www.irfanview.com/', description: '免费的图片查看器，支持批量处理', tags: ['必备'] },
          { name: 'Quicker', url: 'https://getquicker.net/', description: 'Windows 效率神器，指尖上的工具箱', tags: ['效率'] },
          { name: 'AutoHotkey', url: 'https://www.autohotkey.com/', description: '强大的桌面自动化脚本语言', tags: ['自动化'] },
          { name: 'Process Hacker', url: 'https://processhacker.sourceforge.io/', description: '高级任务管理器，可查看内核句柄', tags: ['监控'] },
          { name: 'Sysinternals', url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/', description: '微软官方系统排错工具合集', tags: ['专业'] },
          { name: 'Glances', url: 'https://github.com/nicolargo/glances', description: '跨平台系统监控工具，支持 Web 界面', tags: ['监控'] },
          { name: '图吧工具箱', url: 'https://www.tbtool.cn/', description: '集成大量硬件检测、评分工具', tags: ['硬件'] },
          { name: '鲁大师', url: 'https://www.ludashi.com/', description: '硬件检测与跑分软件' },
          { name: 'DiskTool', url: 'https://www.disktool.cn/', description: '磁盘工具箱，包含磁盘分析、磁盘清理等功能', tags: ['磁盘'] },
          { name: 'DiskGenius', url: 'https://www.diskgenius.cn/', description: '磁盘清理工具，释放磁盘空间', tags: ['磁盘'] },
          { name: 'UltraISO', url: 'https://www.ultraiso.com/', description: 'ISO 文件处理工具，支持挂载、转换、提取等功能', tags: ['ISO'] },
        ]
      },
      {
        name: '文件与传输',
        emoji: '📁',
        links: [
          { name: '7-Zip', url: 'https://www.7-zip.org/', description: '极高压缩比的开源压缩软件', tags: ['开源'] },
          { name: 'rclone', url: 'https://rclone.org/', description: '命令行云存储同步神器，支持挂载网盘', tags: ['同步'] },
          { name: 'aria2', url: 'https://github.com/aria2/aria2', description: '轻量级多协议命令行下载工具', tags: ['下载'] },
          { name: 'yt-dlp', url: 'https://github.com/yt-dlp/yt-dlp', description: '最强的视频下载命令行工具', tags: ['下载'] },
          { name: 'BleachBit', url: 'https://www.bleachbit.org/', description: '开源系统清理工具，释放磁盘空间', tags: ['清理'] },
          { name: 'ncdu', url: 'https://dev.yorhel.nl/ncdu', description: '命令行磁盘占用分析工具', tags: ['磁盘'] },
          { name: 'NeatDownloadManager', url: 'https://www.neatdownloadmanager.com/', description: '功能强大的下载管理工具', tags: ['下载'] }
        ]
      },
      {
        name: '开发与终端',
        links: [
          { name: 'pyinstaller', url: 'https://github.com/pyinstaller/pyinstaller', description: '将 Python 程序打包为可执行文件', tags: ['打包'] },
          { name: 'fzf', url: 'https://github.com/junegunn/fzf', description: '命令行模糊搜索神器', tags: ['效率'] },
          { name: 'ripgrep', url: 'https://github.com/BurntSushi/ripgrep', description: '极速文本搜索工具，性能远超 grep', tags: ['Rust'] },
          { name: 'bat', url: 'https://github.com/sharkdp/bat', description: '带语法高亮的 cat 命令增强版' },
          { name: 'Neofetch', url: 'https://github.com/dylanaraps/neofetch', description: '展示系统信息的命令行工具', tags: ['美化'] },
          { name: 'htop', url: 'https://htop.dev/', description: '交互式进程查看器', tags: ['监控'] }
        ]
      }
    ]
  },
  {
    name: '电脑信息',
    icon: 'Computer',
    emoji: '💻',
    links: [
      { name: '中关村在线', url: 'https://www.zol.com.cn/', description: '老牌科技门户，查报价必备' },
      { name: 'IT之家', url: 'https://www.ithome.com/', description: '科技媒体，新闻更新快' },
      { name: '太平洋电脑网', url: 'https://www.pconline.com.cn/', description: '专业的数码科技资讯' },
      { name: '泡泡网', url: 'https://www.pcpop.com/', description: '领先的数码互动媒体' },
      { name: '天极网', url: 'https://www.yesky.com/', description: 'IT 门户网站' }
    ]
  },
  {
    name: '手机信息',
    icon: 'Iphone',
    emoji: '📱',
    links: [
      { name: 'CNMO', url: 'https://www.cnmo.com/', description: '手机中国' },
      { name: '小米云服务', url: 'https://i.mi.com/', description: '小米手机云端管理' },
      { name: '酷安', url: 'https://www.coolapk.com/', description: '数码爱好者社区' },
      { name: 'GSMArena', url: 'https://www.gsmarena.com/', description: '全球最权威的手机参数数据库' }
    ]
  },
  {
    name: '汽车信息',
    icon: 'Van',
    emoji: '🚗',
    links: [
      { name: '懂车帝', url: 'https://www.dongchedi.com/', description: '看车选车买车' },
      { name: '汽车之家', url: 'https://www.autohome.com.cn/', description: '看车买车用车' },
      { name: '太平洋汽车', url: 'https://www.pcauto.com.cn/', description: '专业的汽车资讯' },
      { name: '易车', url: 'https://www.yiche.com/', description: '汽车报价大全' },
      { name: '交管12123', url: 'https://hb.122.gov.cn/', description: '交管12123' }
    ]
  },
  {
    name: '房屋信息',
    icon: 'House',
    group: '🗺️工作旅游',
    emoji: '🏠',
    links: [
      { name: '贝壳找房', url: 'https://www.beike.com/', description: '真房源交易平台' },
      { name: '链家', url: 'https://www.lianjia.com/', description: '二手房新房租房' },
      { name: '安居客', url: 'https://www.anjuke.com/', description: '房产信息平台' },
      { name: '58同城', url: 'https://www.58.com/', description: '分类信息网站' }
    ]
  },
  {
    name: '工作信息',
    icon: 'Work',
    group: '🗺️工作旅游',
    emoji: '💼',
    links: [
      { name: 'BOSS直聘', url: 'https://www.zhipin.com/', description: '直接跟老板谈' },
      { name: '智联招聘', url: 'https://www.zhaopin.com/', description: '人才招聘网' },
      { name: '前程无忧', url: 'https://www.51job.com/', description: '好工作上无忧' },
      { name: '拉勾网', url: 'https://www.lagou.com/', description: '互联网招聘' },
      { name: '猎聘', url: 'https://www.liepin.com/', description: '中高端人才招聘' },
      { name: '牛客网', url: 'https://www.nowcoder.com/', description: '程序员求职刷题社区' }
    ]
  },
  {
    name: '地图信息',
    group: '🗺️工作旅游',
    icon: 'Map',
    emoji: '🗺️',
    links: [
      { name: '高德地图', url: 'https://www.amap.com/', description: '专业的手机地图' },
      { name: '百度地图', url: 'https://map.baidu.com/', description: '智能导航' },
      { name: '腾讯地图', url: 'https://map.qq.com/', description: '精准导航' },
      { name: '谷歌地图', url: 'https://www.google.com/maps', description: '全球地图数据' },
      { name: '谷歌地球', url: 'https://earth.google.com/', description: '3D 地球仪' },
      { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', description: '全球志愿者共建的开源地图', tags: ['开源'] },
      { name: '天地图', url: 'https://www.tianditu.gov.cn/', description: '国家地理信息公共服务平台', tags: ['官方'] }
      
    ]
  },
  {
    name: '旅游信息',
    group: '🗺️工作旅游',
    icon: 'Travel',
    emoji: '🌴',
    links: [
      { name: '携程旅行', url: 'https://www.ctrip.com/', description: '机票酒店火车票' },
      { name: '去哪儿', url: 'https://www.qunar.com/', description: '特价机票酒店' },
      { name: '马蜂窝', url: 'https://www.mafengwo.cn/', description: '旅游攻略自由行' },
      { name: '飞猪', url: 'https://www.fliggy.com/', description: '阿里旗下旅行平台' }
    ]
  },
  {
    name: '学习资源',
    icon: 'Book',
    emoji: '📚',
    subCategories: [
      {
        name: '在线课程',
        emoji: '🎓',
        links: [
          { name: 'Coursera', url: 'https://www.coursera.org/', description: '全球顶级大学在线课程', tags: ['免费'] },
          { name: 'edX', url: 'https://www.edx.org/', description: '哈佛麻省理工创办的慕课平台', tags: ['免费'] },
          { name: 'Khan Academy', url: 'https://www.khanacademy.org/', description: '永久免费的全球公益教育', tags: ['公益'] },
          { name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/', description: '麻省理工学院公开课资料', tags: ['名校'] },
          { name: 'Bilibili 课堂', url: 'https://www.bilibili.com/', description: '最好的中文学习网站', tags: ['视频'] }
        ]
      },
      {
        name: '编程与开发',
        links: [
          { name: '菜鸟教程', url: 'https://www.runoob.com/', description: '学的不仅是技术，更是梦想', tags: ['入门'] },
          { name: 'W3School', url: 'https://www.w3school.com.cn/', description: '全球最大的 WEB 技术教程', tags: ['基础'] },
          { name: 'DevDocs', url: 'https://devdocs.io', description: '多语言开发文档聚合离线查询', tags: ['文档'] },
          { name: 'Replit', url: 'https://replit.com', description: '浏览器端的强大的 IDE', tags: ['在线'] },
          { name: 'CodePen', url: 'https://codepen.io', description: '前端代码在线编辑分享', tags: ['前端'] }
        ]
      },
      {
        name: '学术与资料',
        emoji: '📚',
        links: [
          { name: 'arXiv', url: 'https://arxiv.org/', description: '前沿学术论文预印本库', tags: ['论文'] },
          { name: 'ifixit', url: 'https://www.ifixit.com/', description: '专业的维修与修复服务', tags: ['维修'] },
          { name: 'JSTOR', url: 'https://www.jstor.org/', description: '数字学术图书馆', tags: ['学术'] },
          { name: 'Open Library', url: 'https://openlibrary.org/', description: '互联网档案馆旗下的开放图书馆', tags: ['开源'] },
          { name: 'Wikidata', url: 'https://www.wikidata.org/', description: '自由的结构化知识库', tags: ['开源'] },
          { name: 'TED', url: 'https://ed.ted.com/', description: '传播有价值的思想', tags: ['开源'] },
          { name: '迅维网', url: 'https://www.chfix.com/', description: ' 是中国本地的修复平台，为用户提供专业的修复服务', tags: ['维修'] },
          { name: '鑫智造', url: 'https://www.xzmpdf.net/', description: ' 一款提供手机、笔记本电脑、平板等电子产品的电路图、点位图、位置图、维修案例等专业维修资料查询的软件', tags: ['维修'] },
          { name: '装机天下', url: 'https://www.dnpz.net/', description: ' 装机天下', tags: ['装机'] },
          { name: '中国修复网', url: 'https://www.chinafix.tech/', description: ' 中国修复网，为用户提供专业的修复服务', tags: ['维修'] },
        ]
      }
    ]
  },
  {
    name: 'IT信息',
    group: '💻 编程与开发',
    icon: 'IT',
    emoji: '💻',
    links: [
      { name: 'CSDN', url: 'https://www.csdn.net/', description: '专业开发者社区' },
      { name: '掘金', url: 'https://juejin.cn/', description: '帮助开发者成长的社区' },
      { name: '博客园', url: 'https://www.cnblogs.com/', description: '老牌开发技术博客' },
      { name: 'SegmentFault', url: 'https://segmentfault.com/', description: '思否技术问答社区' },
      { name: 'V2EX', url: 'https://www.v2ex.com/', description: '创意工作者们的社区' },
      { name: 'InfoQ', url: 'https://www.infoq.cn/', description: '促进软件开发领域知识与创新' },
      { "name": "Medium", "url": "https://medium.com/", "description": "专业创作平台" },
     
    ]
  },
  {
    name: '法律与政务',
    icon: 'Law',
    emoji: '⚖️',
    links: [
      { name: '中国法律服务网', url: 'https://www.moj.gov.cn/', description: '司法部主办的法律服务平台', tags: ['官方'] },
      { name: '人行征信中心', url: 'https://ipcrs.pbccrc.org.cn/', description: '个人信用信息服务平台', tags: ['征信'] },
      { name: '裁判文书网', url: 'https://wenshu.court.gov.cn/', description: '中国裁判文书公开网', tags: ['文书'] },
      { name: '国家政务服务平台', url: 'http://www.gjzwfw.gov.cn/', description: '全国一体化在线政务服务', tags: ['政务'] }
    ]
  },
  {
    name: '中国教育',
    icon: 'Education',
    emoji: '🎓',
    links: [
      { name: '学信网', url: 'https://www.chsi.com.cn/', description: '中国高等教育学生信息网', tags: ['学历'] },
      { name: '研招网', url: 'https://yz.chsi.com.cn/', description: '中国研究生招生信息网', tags: ['考研'] },
      { name: '学位网', url: 'https://www.cdgdc.edu.cn/', description: '中国学位与研究生教育信息网', tags: ['学位'] },
      { name: '教育考试网', url: 'https://www.neea.edu.cn/', description: '教育部教育考试院', tags: ['考试'] },
      { name: '留学网', url: 'http://www.cscse.edu.cn/', description: '中国留学网', tags: ['留学'] }
    ]
  }
];