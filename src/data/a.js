export const a = [
  {
    name: '编程工具',
    group: '💻 编程与开发', // ✅ 新增分组
    icon: 'Tools',
    emoji: '🛠️',
    subCategories: [
      {
        name: '文本编辑器',
        emoji: '📝',
        links: [
          { name: 'Visual Studio Code', url: 'https://code.visualstudio.com/', description: '目前最流行的开源代码编辑器，插件生态丰富' },
          { name: 'Sublime Text', url: 'https://www.sublimetext.com/', description: '轻量级、超快速的文本编辑器' },
          { name: 'Notepad++', url: 'https://notepad-plus-plus.org/', description: '经典的 Windows 免费文本编辑器' },
          { name: 'Vim', url: 'https://www.vim.org/', description: '高度可配置的编辑器，Linux 标配' },
          { name: 'Emacs', url: 'https://www.gnu.org/software/emacs/', description: '极其强大的可扩展编辑器' },
          { name: 'Atom', url: 'https://atom.io/', description: 'GitHub 开发的开源编辑器（已停止维护，建议转 VSCode）' },
          { name: 'EditPlus', url: 'https://www.editplus.com/', description: '功能强大的文本编辑器，支持多种语言', tags: ["收费"] },
          { name: 'Notepad2', url: 'https://notepad2.com/', description: '轻量级文本编辑器' },
          { name: 'Geany', url: 'https://www.geany.org/', description: '轻量级的跨平台集成开发环境' },
          { name: 'Brackets', url: 'https://brackets.io/', description: '专注于 Web 设计的开源编辑器' },
          { name: 'Positron', url: 'https://posit.co/', description: 'Posit 开发的面向数据科学的 IDE' },
        ]
      },
      {
        name: '集成开发环境 (IDE)',
        emoji: '🖥️',
        links: [
          { name: 'Visual Studio', url: 'https://visualstudio.microsoft.com/', description: '微软出品，宇宙第一 IDE，C#/.NET/C++ 首选' },
          { name: 'IntelliJ IDEA', url: 'https://www.jetbrains.com/idea/', description: '功能最强大的 Java IDE' },
          { name: 'PyCharm', url: 'https://www.jetbrains.com/pycharm/', description: '专业的 Python IDE' },
          { name: 'WebStorm', url: 'https://www.jetbrains.com/webstorm/', description: '最强大的前端开发 IDE' },
          { name: 'CLion', url: 'https://www.jetbrains.com/clion/', description: 'JetBrains 出品的 C/C++ IDE' },
          { name: 'Android Studio', url: 'https://developer.android.com/', description: 'Google 官方 Android 开发工具' },
          { name: 'Xcode', url: 'https://developer.apple.com/xcode/', description: 'macOS/iOS 开发必备工具' },
          { name: 'Eclipse', url: 'https://www.eclipse.org', description: '老牌开源 IDE，Java 开发常用' },
          { name: 'Dev-C++', url: 'https://www.bloodshed.net/', description: '轻量级 C/C++ 开发环境', tags: ["免费"] },
          { name: 'Anaconda', url: 'https://www.anaconda.com/', description: 'Python 数据科学全家桶' },
          { name: 'Lazarus', url: 'https://www.lazarus-ide.org/', description: '兼容 Delphi 的跨平台集成开发环境', tags: ["免费"] },
          { name: 'VB6.0', url: 'https://www.onlinedown.net/soft/19976.htm', description: 'VB6.0 开发环境', tags: ["免费"] },
          { name: 'MASM32', url: 'https://www.masm32.com/', description: 'MASM32 是一个免费的汇编语言开发环境', tags: ["免费"] },
        ]
      },
      {
        name: '运维与自动化',
        emoji: '⚙️',
        links: [
          { name: 'Git', url: 'https://git-scm.com/', description: '分布式版本控制系统', tags: ["免费"] },
          { name: 'Docker', url: 'https://www.docker.com/', description: '应用容器引擎' },
          { name: 'Vmware', url: 'https://www.vmware.com/', description: '强大的虚拟机软件' },
          { name: 'Postman', url: 'https://www.postman.com/', description: 'API 开发与测试神器' },

          { name: 'Appium', url: 'https://appium.io/', description: 'Android 与 iOS 应用自动化测试框架', tags: ['开源'] },
           { name: 'Scrcpy', url: 'https://github.com/Genymobile/scrcpy', description: '电脑控制 Android 手机的开源工具', tags: ['免费', '开源'] },
           { name: 'ADB', url: 'https://developer.android.com/tools/adb', description: 'Android 调试、设备控制与自动化命令行工具' },
          { name: 'AutoX.js', url: 'https://github.com/aiselp/AutoX', description: '安卓平台上的JavaScript自动化工具' },
          { name: 'AutoHotkey', url: 'https://www.autohotkey.com/', description: 'Windows 自动化脚本工具' },
          { name: '按键精灵', url: 'https://www.anjian.com/', description: '国产自动化脚本工具' },
          { name: '懒人精灵', url: 'http://www.lrappsoft.com/', description: '基于 Lua 的移动端自动化开发工具' },
          { name: '大漠插件', url: 'http://www.dmwebsite.net/', description: '知名的图色模拟插件', tags: ['收费'] },
          { name: '火山软件开发', url: 'https://www.voldp.com/', description: '中文编程软件开发平台' },
          { name: 'Arduino', url: 'https://www.arduino.cc/', description: '开源电子原型平台' },

           // ===== 浏览器自动化 =====
          { name: 'Playwright', url: 'https://playwright.dev/', description: '现代浏览器自动化与测试框架', tags: ['开源'] },
          { name: 'Selenium', url: 'https://www.selenium.dev/', description: '经典 Web 浏览器自动化框架', tags: ['开源'] },
          { name: 'Puppeteer', url: 'https://pptr.dev/', description: '基于 JavaScript 的 Chrome 浏览器自动化工具', tags: ['开源'] },


          // ===== 监控 / 日志 =====
          { name: 'Prometheus', url: 'https://prometheus.io/', description: '服务器与应用指标监控系统', tags: ['开源'] },
          { name: 'Grafana', url: 'https://grafana.com/', description: '监控数据可视化与仪表盘平台' },
          { name: 'Zabbix', url: 'https://www.zabbix.com/', description: '企业级服务器、网络与服务监控平台', tags: ['开源'] },




        ]
      }
    ]
  },
  {
    name: '编程语言',
    group: '💻 编程与开发', // ✅ 新增分组
    icon: 'Code',
    emoji: '💻',
    subCategories: [
      {
        name: '主流后端/通用',
        emoji: '🔧',
        links: [
          { name: 'Python', url: 'https://python.org', description: '人生苦短，我用 Python' },
          { name: 'Java', url: 'https://java.com', description: '企业级应用开发首选' },
          { name: 'Go', url: 'https://golang.org/', description: 'Google 开发的高性能并发语言' },
          { name: 'C++', url: 'https://isocpp.org/', description: '高性能系统级编程语言' },
          { name: 'C', url: 'https://www.learn-c.org/', description: '现代编程语言的基石' },
          { name: 'C#', url: 'https://docs.microsoft.com/zh-cn/dotnet/csharp/', description: '微软 .NET 平台核心语言' },
          { name: 'Rust', url: 'https://www.rust-lang.org/', description: '注重安全与性能的系统级语言' },
          { name: 'PHP', url: 'https://www.php.net/', description: 'Web 开发老牌脚本语言' },
          { name: 'Ruby', url: 'https://www.ruby-lang.org/en/', description: '优雅的面向对象脚本语言' },
          { name: 'Node.js', url: 'https://nodejs.org/', description: '基于 Chrome V8 的 JavaScript 运行时' }
        ]
      },
      {
        name: 'Web 前端',
        emoji: '🎨',
        links: [
          { name: 'HTML', url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML', description: '网页结构标记语言' },
          { name: 'CSS', url: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS', description: '网页样式表' },
          { name: 'JavaScript', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', description: 'Web 的脚本语言' },
          { name: 'TypeScript', url: 'https://www.typescriptlang.org/', description: '带类型的 JavaScript 超集' },
          { name: 'Vue.js', url: 'https://vuejs.org/', description: '渐进式 JavaScript 框架' },
          { name: 'React', url: 'https://react.dev/', description: 'Facebook 开发的 UI 库' },
          { name: 'Angular', url: 'https://angular.dev/', description: 'Google 开发的前端框架' },
          { name: 'Svelte', url: 'https://svelte.dev/', description: '无虚拟 DOM 的前端框架' },
          { name: 'Next.js', url: 'https://nextjs.org/', description: 'React 服务端渲染框架' },
          { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', description: '实用优先的 CSS 框架' },
          { name: 'Bootstrap', url: 'https://getbootstrap.com/', description: '最流行的前端 UI 框架' },
          { name: 'jQuery', url: 'https://jquery.com/', description: '经典的 JS 库' },
          { name: 'AJAX', url: 'https://www.w3schools.com/Js/js_ajax_intro.asp', description: '异步 JavaScript 和 XML' }
        ]
      },
      {
        name: '数据与数据库',
        emoji: '🗄️',
        links: [
          { name: 'MySQL', url: 'https://www.mysql.com', description: '最流行的开源关系型数据库' },
          { name: 'PostgreSQL', url: 'https://www.postgresql.org/', description: '世界上最先进的开源关系数据库' },
          { name: 'MongoDB', url: 'https://www.mongodb.com/', description: '流行的 NoSQL 数据库' },
          { name: 'SQLite', url: 'https://www.sqlite.org/', description: '轻量级嵌入式数据库' },
          { name: 'JSON', url: 'https://www.json.org/json-en.html', description: '轻量级数据交换格式' },
          { name: 'XML', url: 'https://www.w3schools.com/xml/default.asp', description: '可扩展标记语言' },
          { name: 'GraphQL', url: 'https://graphql.org/', description: 'API 查询语言' }
        ]
      },
      {
        name: '移动与脚本',
        links: [
          { name: 'Kotlin', url: 'https://kotlinlang.org/', description: 'Android 开发首选语言' },
          { name: 'Swift', url: 'https://developer.apple.com/swift/', description: 'iOS/macOS 开发语言' },
          { name: 'Dart', url: 'https://dart.dev/', description: 'Google 开发，用于 Flutter' },
          { name: 'Lua', url: 'https://www.lua.org', description: '轻量级嵌入式脚本，游戏开发常用' },
          { name: 'Perl', url: 'https://www.perl.org', description: '强大的文本处理语言' },
          { name: 'Shell', url: 'https://www.gnu.org/software/bash/', description: 'Linux 命令行脚本' },
          { name: 'Tcl', url: 'https://www.tcl.tk/', description: '工具命令语言' }
        ]
      },
      {
        name: '数据科学与特定领域',
        emoji: '📈',
        links: [
          { name: 'R', url: 'https://www.r-project.org', description: '统计分析与绘图' },
          { name: 'MATLAB', url: 'https://www.mathworks.com/products/matlab.html', description: '数学计算与仿真' },
          { name: 'Julia', url: 'https://julialang.org/', description: '高性能数值分析语言' },
          { name: 'D3.js', url: 'https://d3js.org/', description: '数据驱动文档可视化库' },
          { name: 'Chart.js', url: 'https://www.chartjs.org/', description: '简单灵活的图表库' },
          { name: 'Solidity', url: 'https://soliditylang.org/', description: '以太坊智能合约语言' },
          { name: 'VHDL', url: 'https://www.vhdl.org/', description: '硬件描述语言' },
          { name: 'Verilog', url: 'https://www.verilog.com/', description: '硬件描述语言' },
          { name: 'Prolog', url: 'https://www.swi-prolog.org/', description: '逻辑编程语言' }
        ]
      },
      {
        name: '其他语言',
        emoji: '🔤',
        links: [
          { name: '易语言', url: 'https://www.dywt.com.cn/', description: '全中文编程语言' },
          { name: '精易论坛', url: 'https://bbs.125.la/', description: '易语言交流社区' },
          { name: '易语言知识库', url: 'https://esdn.125.la/', description: '易语言学习资料' },
          { name: 'Assembly', url: 'https://www.tutorialspoint.com/assembly_programming/assembly_introduction.htm', description: '汇编语言' },
          { name: 'Delphi', url: 'https://www.embarcadero.com/products/rad-studio/', description: 'Object Pascal 开发环境' },
          { name: 'Visual Basic', url: 'https://learn.microsoft.com/en-us/dotnet/visual-basic/', description: '微软开发的事件驱动编程语言' },
          { name: 'Scratch', url: 'https://scratch.mit.edu/', description: '少儿图形化编程' },
          { name: 'Haskell', url: 'https://www.haskell.org', description: '纯函数式编程语言' },
          { name: 'Erlang', url: 'https://www.erlang.org/', description: '高并发分布式系统语言' },
          { name: 'Elixir', url: 'https://elixir-lang.org/', description: '基于 Erlang VM 的动态语言' },
          { name: 'Scala', url: 'https://www.scala-lang.org/', description: 'JVM 上的多范式语言' },
          { name: 'Clojure', url: 'https://clojure.org/', description: 'JVM 上的 Lisp 方言' },
          { name: 'OCaml', url: 'https://ocaml.org/', description: '函数式编程语言' },
          { name: 'F#', url: 'https://dotnet.microsoft.com/en-us/languages/f#', description: '.NET 函数式语言' },
          { name: 'Fortran', url: 'https://fortran-lang.org/', description: '科学计算鼻祖' },
          { name: 'COBOL', url: 'https://www.cobol.com/', description: '商业数据处理' },
          { name: 'Ada', url: 'https://www.adaic.org/', description: '高可靠性嵌入式系统语言' },
          { name: 'Smalltalk', url: 'https://www.smalltalk.org/', description: '纯面向对象语言' },
          { name: 'ActionScript', url: 'https://www.adobe.com/', description: 'Flash 开发语言' },
          { name: 'Objective-C', url: 'https://developer.apple.com/documentation/objectivec', description: 'iOS 开发的前辈' },
          { name: 'Forth', url: 'https://www.forth.com/starting-forth/', description: '栈式编程语言' },
          { name: 'Xojo', url: 'https://www.xojo.com/', description: '跨平台开发工具' },
          { name: 'Vala', url: 'https://wiki.gnome.org/Projects/Vala', description: 'GNOME 开发语言' },
          { name: 'Hack', url: 'https://hacklang.org/', description: 'Facebook 开发的 PHP 衍生语言' },
          { name: 'Flask', url: 'https://flask.palletsprojects.com/', description: '轻量级 Python Web 框架' },
          { name: 'Django', url: 'https://www.djangoproject.com/', description: '全功能 Python Web 框架' },
          { name: 'Laravel', url: 'https://laravel.com/', description: 'PHP Web 框架' },
          { name: 'Symfony', url: 'https://symfony.com/', description: 'PHP Web 框架' },
          { name: 'CakePHP', url: 'https://cakephp.org/', description: 'PHP Web 框架' }
        ]
      }
    ]
  },
  {
    name: '音乐播放',
    group: '🛠️ 常用与生活', // ✅ 新增分组
    icon: 'Headset',
    emoji: '🎵',
    subCategories: [
      {
        name: '在线流媒体',
        links: [
          { name: '网易云音乐', url: 'https://music.163.com/', description: '专注于发现与分享的音乐平台' },
          { name: 'QQ音乐', url: 'https://y.qq.com/', description: '腾讯旗下音乐平台，版权丰富' },
          { name: '酷狗音乐', url: 'https://www.kugou.com/', description: '老牌音乐播放器' },
          { name: '酷我音乐', url: 'https://www.kuwo.cn/', description: '无损音质正版音乐' },
          { name: '汽水音乐', url: 'https://www.qishui.com/', description: '抖音出品的音乐 App' },
          { name: 'Spotify', url: 'https://open.spotify.com/', description: '全球最大的音乐流媒体服务' },
          { name: '百度音乐', url: 'https://music.baidu.com/', description: '千千静听的前身' }
        ]
      },
      {
        name: '本地与工具',
        emoji: '🎧',
        links: [
          { name: 'TTKMusicPlayer', url: 'https://github.com/Greedysky/TTKMusicPlayer', description: '仿酷狗 UI 的开源音乐播放器' },
          { name: 'AIMP', url: 'https://www.aimp.ru/', description: '轻量级、高音质的本地播放器' },
          { name: 'HiFiNi', url: 'https://hifini.com/', description: '高品质音乐磁场' },
          { name: '熊猫音乐', url: 'https://www.xmwav.com/', description: '无损音乐分享博客' }
        ]
      }
    ]
  },
  {
    name: '浏览器',
    group: '🛠️ 常用与生活', // ✅ 新增分组
    icon: 'ChromeFilled',
    emoji: '🌐',
    links: [
      { name: 'Chrome', url: 'https://www.google.com/chrome/', description: 'Google 开发的全球最流行浏览器' },
      { name: 'Edge', url: 'https://www.microsoft.com/en-us/edge', description: '微软出品，兼容 Chrome 插件' },
      { name: 'Firefox', url: 'https://www.mozilla.org/en-US/firefox/new/', description: '注重隐私的开源浏览器' },
      { name: 'Safari', url: 'https://www.apple.com/safari/', description: 'Apple 设备默认浏览器' },
      { name: 'Brave', url: 'https://brave.com/', description: '主打隐私保护与广告拦截' },
      { name: 'Opera', url: 'https://www.opera.com/', description: '特色功能丰富的浏览器' },
      { name: 'Vivaldi', url: 'https://vivaldi.com/', description: '高度可定制的极客浏览器' },
      { name: 'Tor Browser', url: 'https://www.torproject.org/', description: '洋葱路由，匿名上网' },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', description: '隐私保护浏览器' },
      { name: '360安全浏览器', url: 'https://browser.360.cn/', description: '国内用户量较大的双核浏览器' },
      { name: 'QQ浏览器', url: 'https://browser.qq.com/', description: '腾讯出品，整合微信生态' },
      { name: '傲游浏览器', url: 'https://www.maxthon.com/', description: '老牌国产浏览器' },
      { name: 'Chrome 应用商店', url: 'https://chromewebstore.google.com/', description: '浏览器插件下载中心', tags: ["插件"] }
    ]
  }
];