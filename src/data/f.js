export const f = [
  {
    name: '在线工具',
    group: '💻 编程与开发',
    icon: 'Trophy',
    emoji: '🔧',
    subCategories: [
      {
        name: 'IP 与域名查询',
        emoji: '🔍',
        links: [
          { name: 'MyIP', url: 'https://www.myip.com/', description: '快速查询本机公网 IP', tags: ['查询'] },
          { name: 'IP138', url: 'https://www.ip138.com', description: 'IP 归属地与手机号查询', tags: ['查询'] },
          { name: 'Whois', url: 'https://www.whois.com/', description: '域名注册信息查询', tags: ['域名'] },
          { name: 'DNSChecker', url: 'https://dnschecker.org', description: '全球 DNS 解析生效检测', tags: ['DNS'] },
          { name: 'IP2Location', url: 'https://www.ip2location.com/', description: 'IP 归属地查询', tags: ['查询'] },
        ]
      },
      {
        name: '测速与网络诊断',
        emoji: '📡',
        links: [
          { name: 'OpenSpeedtest', url: 'https://openspeedtest.com/', description: '内网网速测试', tags: ['测速'] },
          { name: 'Speedtest', url: 'https://www.speedtest.net', description: '全球最权威的网速测试', tags: ['测速'] },
          { name: 'SpeedtestCN', url: 'https://www.speedtest.cn/', description: '中国网速测试', tags: ['测速'] },
          { name: 'Ping.pe', url: 'https://ping.pe', description: '全球 Ping 与路由追踪工具', tags: ['诊断'] },
          { name: 'TCP Ping', url: 'https://tcp.ping.pe/', description: 'TCP Ping 与路由追踪工具', tags: ['诊断'] },
          { name: 'Ping', url: 'https://www.itdog.cn/ping', description: 'Ping 与路由追踪工具', tags: ['诊断'] },
        ]
      },
      {
        name: '短信与号码服务',
        emoji: '📱',
        links: [
          { name: 'HeroSMS', url: 'https://hero-sms.com/', description: '短信接码', tags: ['短信'] },
        ]
      },
      {
        name: '图片处理与设计',
        emoji: '🎨',
        links: [
          { name: 'TEye', url: 'https://www.tineye.com/', description: '图片搜索工具，基于图片识别', tags: ['搜索'] },
          { name: 'Photopea', url: 'https://www.photopea.com/', description: '在线图片编辑工具，无需下载', tags: ['编辑'] },
          { name: 'Canva', url: 'https://www.canva.com/', description: '在线平面设计神器，做海报 PPT 必备', tags: ['设计'] },
          { name: 'TinyPNG', url: 'https://tinypng.com/', description: '智能 WebP、PNG、JPEG 压缩', tags: ['压缩'] },
          { name: 'Fotor', url: 'https://www.fotor.com/', description: '在线修图与照片增强', tags: ['修图'] },
        ]
      },
      {
        name: '音视频与录屏',
        emoji: '🎬',
        links: [
          { name: 'Loom', url: 'https://www.loom.com/', description: '屏幕录制与视频分享工具', tags: ['录屏'] },
          { name: 'Twitter Downloader', url: 'https://twittervideodownloader.com/', description: '推特视频下载工具', tags: ['下载'] },
          { name: 'ScreenToGif', url: 'https://www.screentogif.com/', description: '轻量级 GIF 录制工具', tags: ['开源'] },
        ]
      },
      {
        name: '文件转换与 PDF',
        emoji: '📄',
        links: [
          { name: 'Zamzar', url: 'https://www.zamzar.com/', description: '万能文件格式转换器', tags: ['转换'] },
          { name: 'iLovePDF', url: 'https://www.ilovepdf.com/', description: 'PDF 处理工具，合并、拆分、压缩等', tags: ['PDF'] },
          { name: 'PDFescape', url: 'https://www.pdfescape.com/', description: '在线 PDF 编辑与表单填写', tags: ['PDF'] },
        ]
      },
      {
        name: '办公协作与建站',
        emoji: '📋',
        links: [
          { name: 'Google Docs', url: 'https://docs.google.com/', description: '强大的在线文档协作', tags: ['文档'] },
          { name: 'Trello', url: 'https://trello.com/', description: '看板式项目管理工具', tags: ['管理'] },
          { name: 'JotForm', url: 'https://www.jotform.com/', description: '强大的在线表单生成器', tags: ['表单'] },
          { name: 'Grammarly', url: 'https://www.grammarly.com/', description: '英文写作语法检查助手', tags: ['写作'] },
          { name: 'Wix', url: 'https://www.wix.com/', description: '拖拽式网站建设平台', tags: ['建站'] },
        ]
      },
      {
        name: '财务与汇率',
        emoji: '💱',
        links: [
          { name: 'Currency Converter', url: 'https://wise.com/zh-cn/currency-converter/', description: '汇率换算，货币转换工具，支持多种货币', tags: ['货币'] },
          { name: 'GnuCash', url: 'https://www.gnucash.org/', description: '适用于个人和小企业的开源财务软件', tags: ['财务'] },
          { name: 'Wise', url: 'https://wise.com/', description: '国际汇率换算与汇款', tags: ['汇率'] },
        ]
      },
      {
        name: '远程桌面',
        emoji: '🖥️',
        links: [
          { name: 'RustDesk', url: 'https://rustdesk.com/', description: '开源远程桌面软件', tags: ['远程'] },
        ]
      },
      {
        name: '表情与条码工具',
        emoji: '🧰',
        links: [
          { name: 'EmojiAll', url: 'https://www.emojiall.com/zh-hans/emojis/', description: 'Emoji 表情大全与含义', tags: ['表情'] },
          { name: '条形码扫描', url: 'https://products.groupdocs.app/zh/scanner/scan-barcode', description: '在线条形码识别', tags: ['识别'] },
        ]
      }
    ]
  },
  {
    name: '接单平台',
    icon: 'Trophy',
    emoji: '💼',
    subCategories: [
      {
        name: '国内平台',
        links: [
          { name: '猪八戒', url: 'https://www.zbj.com/', description: '综合性服务外包平台' },
          { name: '程序员客栈', url: 'https://www.proginn.com/', description: '互联网技术人员远程工作平台' },
          { name: '码市', url: 'https://www.codemart.com/', description: '基于云端的软件外包平台' },
          { name: '一品威客', url: 'https://www.epwk.com/', description: '创意设计、品牌营销与软件开发众包服务', tags: ['众包'] },
          { name: '实现网', url: 'https://shixian.com/', description: '对接工程师与企业的软件开发外包服务', tags: ['开发'] },
          
        ]
      },
      {
        name: '国际综合',
        emoji: '🌍',
        links: [
          { name: 'Upwork', url: 'https://www.upwork.com/', description: '全球最大的自由职业平台', tags: ['首选'] },
          { name: 'Freelancer', url: 'https://www.freelancer.com/', description: '老牌威客竞标平台' },
          { name: 'Fiverr', url: 'https://www.fiverr.com/', description: '微服务交易市场，起价 5 美元' },
          { name: 'PeoplePerHour', url: 'https://www.peopleperhour.com/', description: '按小时计费的自由职业平台' },
          { name: 'Contra', url: 'https://contra.com/', description: '自由职业项目发现、作品展示与合作管理平台', tags: ['自由职业'] },
          { name: 'Malt', url: 'https://www.malt.com/', description: '连接企业与独立人才的自由职业服务平台', tags: ['国际'] },
          { name: 'SimplyHired', url: 'https://www.simplyhired.com/', description: '职位搜索引擎，含大量外包机会' }
        ]
      },
      {
        name: '垂直领域',
        links: [
          { name: 'Toptal', url: 'https://www.toptal.com/', description: '只招募全球前 3% 的顶尖开发者与设计师', tags: ['高端'] },
          { name: '99designs', url: 'https://99designs.com/', description: '专注 Logo 与平面设计的竞标平台', tags: ['设计'] },
          { name: 'DesignCrowd', url: 'https://www.designcrowd.com/', description: '创意设计众包平台', tags: ['设计'] },
          { name: '站酷设计服务', url: 'https://www.zcool.com.cn/design-service', description: '平面、插画、UI 与三维等创意设计定制服务', tags: ['设计'] },
          { name: 'Gun.io', url: 'https://gun.io/find-work/', description: '面向软件开发者的自由职业项目匹配平台', tags: ['开发'] },
          { name: 'Arc', url: 'https://arc.dev/talent', description: '开发、设计与营销人才的自由职业及远程职位平台', tags: ['远程'] },
          { name: 'WeWorkRemotely', url: 'https://weworkremotely.com/', description: '全球最大的远程工作招聘板', tags: ['远程'] },
          { name: 'Guru', url: 'https://www.guru.com/', description: '适合长期合作的专业自由职业平台' }
        ]
      }
    ]
  },
  {
    name: '数据平台',
    icon: 'Trophy',
    emoji: '📊',
    subCategories: [
      {
        name: '指数与趋势',
        emoji: '📈',
        links: [
          { name: '谷歌趋势', url: 'https://trends.google.com/', description: '全球搜索热度分析', tags: ['全球'] },
          { name: '百度指数', url: 'https://index.baidu.com/', description: '中文互联网关键词热度分析', tags: ['国内'] },
          { name: '国家统计局', url: 'https://www.stats.gov.cn/', description: '中国官方权威统计数据', tags: ['官方'] },
          { name: 'CNPP', url: 'https://www.cnpp.cn/', description: '十大品牌排行榜', tags: ['排行'] }
        ]
      },
      {
        name: '行业数据',
        emoji: '📊',
        links: [
        {"name":"世界银行开放数据","url":"https://data.worldbank.org/","description":"各国经济、人口与发展指标的开放数据","tags":["数据"]},
          { name: '极客湾芯片排行', url: 'https://socpk.com/', description: '移动端芯片性能天梯图', tags: ['数码'] },
          { name: 'WebMD', url: 'https://www.webmd.com/', description: '全球权威的医疗健康信息库', tags: ['医疗'] },
          { name: '长江有色金属', url: 'https://www.ccmn.cn/', description: '大宗商品与金属价格行情', tags: ['财经'] }
        ]
      },
      {
        name: '宠物与生物',
        links: [
        {"name":"iNaturalist","url":"https://www.inaturalist.org/","description":"记录与识别动植物的自然观察社区","tags":["自然"]},
          { name: 'Doberman Blog', url: 'https://dobermanblog.com/', description: '专业的杜宾犬知识博客' },
          { name: 'Working Dog', url: 'https://en.working-dog.com/', description: '全球工作犬赛事与视频数据库' },
          { name: 'ICB', url: 'https://www.instituteofcaninebiology.org/', description: '犬类生物学研究所' }
        ]
      }
    ]
  },
  {
  "name": "金融支付",
  "group": "💳金融支付",
  "icon": "Trophy",
  "emoji": "💳",
  "subCategories": [
    {
      "name": "中国银行",
      "emoji": "🏦",
      "links": [
        {
          "name": "工商银行",
          "url": "https://www.icbc.com.cn/",
          "description": "中国工商银行"
        },
        {
          "name": "建设银行",
          "url": "https://www.ccb.com/",
          "description": "建行"
        },
        {
          "name": "中国银行",
          "url": "https://www.boc.cn/",
          "description": "中行"
        },
        {
          "name": "农业银行",
          "url": "https://www.abchina.com/",
          "description": "农行"
        },
        {
          "name": "招商银行",
          "url": "https://www.cmbchina.com/",
          "description": "商业银行"
        },
        {
          "name": "平安银行",
          "url": "https://bank.pingan.com/",
          "description": "平安集团旗下"
        },
        {
          "name": "交通银行",
          "url": "https://www.bocom.com.cn/",
          "description": "交通银行"
        },
        {
          "name": "中信银行",
          "url": "https://www.citicbank.com/",
          "description": "中信银行"
        },
        {
          "name": "华夏银行",
          "url": "https://www.hxb.com.cn/",
          "description": "华夏银行"
        },
        {
          "name": "广发银行",
          "url": "https://www.cgbchina.com.cn/",
          "description": "广发银行"
        },
        {
          "name": "民生银行",
          "url": "https://www.cmbc.com.cn/",
          "description": "中国民生银行"
        },
        {
          "name": "中国邮政储蓄银行",
          "url": "https://www.psbc.com/",
          "description": "邮储银行个人、公司金融与电子银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "兴业银行",
          "url": "https://www.cib.com.cn/",
          "description": "兴业银行个人与企业金融服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "浦发银行",
          "url": "https://www.spdb.com.cn/",
          "description": "上海浦东发展银行个人与公司金融服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "浙商银行",
          "url": "https://czbank.com/cn/",
          "description": "浙商银行个人、企业与供应链金融服务",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "美国银行",
      "emoji": "🏛️",
      "links": [
        {
          "name": "摩根大通 Chase",
          "url": "https://www.chase.com/",
          "description": "Chase 美国个人银行、信用卡及商业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "美国银行 Bank of America",
          "url": "https://www.bankofamerica.com/",
          "description": "Bank of America 美国个人与商业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "富国银行 Wells Fargo",
          "url": "https://www.wellsfargo.com/",
          "description": "Wells Fargo 美国个人与企业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "花旗银行 Citi",
          "url": "https://www.citi.com/",
          "description": "Citi 美国个人银行与信用卡服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "美国合众银行 U.S. Bank",
          "url": "https://www.usbank.com/",
          "description": "U.S. Bank 个人与企业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Capital One",
          "url": "https://www.capitalone.com/",
          "description": "Capital One 银行账户、信用卡及相关金融服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "PNC Bank",
          "url": "https://www.pnc.com/",
          "description": "PNC 个人银行、商业银行与金融服务",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "中国香港银行",
      "emoji": "🏙️",
      "links": [
        {
          "name": "汇丰香港 HSBC",
          "url": "https://www.hsbc.com.hk/",
          "description": "汇丰香港个人、商业银行及跨境金融服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "恒生银行",
          "url": "https://www.hangseng.com/",
          "description": "恒生银行香港个人与商业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "中银香港",
          "url": "https://www.bochk.com/",
          "description": "中国银行（香港）个人与企业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "渣打香港",
          "url": "https://www.sc.com/hk/",
          "description": "渣打银行香港个人与商业银行服务",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "新加坡银行",
      "emoji": "🦁",
      "links": [
        {
          "name": "星展银行 DBS",
          "url": "https://www.dbs.com.sg/",
          "description": "DBS 新加坡个人与企业银行服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "华侨银行 OCBC",
          "url": "https://www.ocbc.com/",
          "description": "OCBC 个人、商业银行与金融服务",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "大华银行 UOB",
          "url": "https://www.uob.com.sg/",
          "description": "UOB 新加坡个人与企业银行服务",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "电子支付与数字钱包",
      "emoji": "📱",
      "links": [
        {
          "name": "支付宝",
          "url": "https://www.alipay.com/",
          "description": "全球领先的数字支付平台",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "微信支付",
          "url": "https://pay.weixin.qq.com/",
          "description": "腾讯移动支付",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "PayPal",
          "url": "https://www.paypal.com/",
          "description": "全球通用的跨境支付工具",
          "tags": [
            "国际"
          ]
        },
        {
          "name": "Apple Pay",
          "url": "https://www.apple.com/apple-pay/",
          "description": "Apple 设备上的数字钱包与支付服务",
          "tags": [
            "官方",
            "数字钱包"
          ]
        },
        {
          "name": "云闪付",
          "url": "https://www.95516.com/",
          "description": "中国银联移动支付与持卡人服务入口",
          "tags": [
            "官方",
            "银联"
          ]
        }
      ]
    },
    {
      "name": "跨境收款与汇款",
      "emoji": "🌍",
      "links": [
        {
          "name": "Payoneer",
          "url": "https://www.payoneer.com/",
          "description": "派安盈，跨境电商收款首选",
          "tags": [
            "跨境"
          ]
        },
        {
          "name": "Wise",
          "url": "https://wise.com/",
          "description": "国际汇款、货币兑换及多币种账户服务",
          "tags": [
            "官方",
            "跨境"
          ]
        },
        {
          "name": "Airwallex 空中云汇",
          "url": "https://www.airwallex.com/",
          "description": "面向企业的全球收款、付款与财务管理平台",
          "tags": [
            "官方",
            "企业"
          ]
        },
        {
          "name": "WorldFirst 万里汇",
          "url": "https://www.worldfirst.com/",
          "description": "跨境经营收款、付款与多币种账户服务",
          "tags": [
            "官方",
            "跨境"
          ]
        }
      ]
    },
    {
      "name": "商户收单与支付 API",
      "emoji": "🔌",
      "links": [
        {
          "name": "Stripe",
          "url": "https://stripe.com/",
          "description": "在线支付接入、结账与订阅计费基础设施",
          "tags": [
            "官方",
            "API"
          ]
        },
        {
          "name": "Adyen",
          "url": "https://www.adyen.com/",
          "description": "面向商户的线上线下支付与收单平台",
          "tags": [
            "官方",
            "商户"
          ]
        },
        {
          "name": "Checkout.com",
          "url": "https://www.checkout.com/",
          "description": "面向企业的数字支付处理与 API 接入平台",
          "tags": [
            "官方",
            "API"
          ]
        },
        {
          "name": "Square",
          "url": "https://squareup.com/",
          "description": "商户收款、销售终端与经营管理工具",
          "tags": [
            "官方",
            "商户"
          ]
        }
      ]
    },
    {
      "name": "银行卡组织",
      "emoji": "💳",
      "links": [
        {
          "name": "Visa",
          "url": "https://www.visa.com/",
          "description": "全球领先的支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Mastercard",
          "url": "https://www.mastercard.com/",
          "description": "美国领先的支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Discover",
          "url": "https://www.discover.com/",
          "description": "美国Discover支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Amex",
          "url": "https://www.amex.com/",
          "description": "美国运通支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "JCB",
          "url": "https://www.jcb-us.com/",
          "description": "日本卡联支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "UnionPay",
          "url": "https://www.unionpay.com/",
          "description": "中国银联支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Maestro",
          "url": "https://www.maestrocard.com/",
          "description": "Mastercard 旗下历史借记卡品牌，正逐步由 Debit Mastercard 替代",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Diners Club",
          "url": "https://www.dinersclub.com/",
          "description": "美国Diners Club支付卡品牌",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "虚拟卡与数字账户",
      "emoji": "🪪",
      "links": [
        {
          "name": "Privacy",
          "url": "https://www.privacy.com/",
          "description": "隐私支付卡品牌",
          "tags": [
            "官方"
          ]
        },
        {
          "name": "Revolut",
          "url": "https://www.revolut.com/",
          "description": "全球领先的移动支付平台",
          "tags": [
            "官方"
          ]
        }
      ]
    },
    {
      "name": "金融监管与机构查询",
      "emoji": "🔎",
      "links": [
        {
          "name": "中国人民银行",
          "url": "https://www.pbc.gov.cn/",
          "description": "中国人民银行政策、公告及金融信息查询",
          "tags": [
            "官方",
            "监管"
          ]
        },
        {
          "name": "国家金融监督管理总局",
          "url": "https://www.nfra.gov.cn/",
          "description": "金融监管政策、机构信息与公告查询",
          "tags": [
            "官方",
            "监管"
          ]
        },
        {
          "name": "FDIC BankFind",
          "url": "https://banks.data.fdic.gov/bankfind-suite/bankfind",
          "description": "查询 FDIC 承保银行、分支机构与历史信息",
          "tags": [
            "官方",
            "银行查询"
          ]
        },
        {
          "name": "CFPB",
          "url": "https://www.consumerfinance.gov/",
          "description": "美国消费者金融信息、投诉入口与教育资源",
          "tags": [
            "官方",
            "消费者"
          ]
        }
      ]
    },
    {
      "name": "公链与数字资产项目",
      "emoji": "⛓️",
      "links": [
        {
          "name": "Bitcoin",
          "url": "https://bitcoin.org/",
          "description": "比特币入门、白皮书与开源社区资源",
          "tags": [
            "BTC"
          ]
        },
        {
          "name": "Ethereum",
          "url": "https://www.ethereum.org/",
          "description": "以太坊智能合约平台",
          "tags": [
            "ETH"
          ]
        },
        {
          "name": "Litecoin",
          "url": "https://www.litecoin.org/",
          "description": "莱特币",
          "tags": [
            "LTC"
          ]
        },
        {
          "name": "Solana",
          "url": "https://solana.com/",
          "description": "Solana 公链生态、应用与开发者资源",
          "tags": [
            "SOL",
            "公链"
          ]
        },
        {
          "name": "Ripple",
          "url": "https://www.ripple.com/",
          "description": "瑞波币与支付网络",
          "tags": [
            "XRP"
          ]
        }
      ]
    },
    {
      "name": "稳定币发行方",
      "emoji": "💵",
      "links": [
        {
          "name": "Tether",
          "url": "https://tether.to/",
          "description": "USDT 稳定币发行方，提供产品介绍与透明度报告",
          "tags": [
            "USDT",
            "稳定币"
          ]
        },
        {
          "name": "Circle",
          "url": "https://www.circle.com/",
          "description": "USDC 稳定币发行方，提供数字支付与开发者资源",
          "tags": [
            "USDC",
            "稳定币"
          ]
        }
      ]
    },
    {
      "name": "加密资产行情与数据",
      "emoji": "📊",
      "links": [
        {
          "name": "CoinMarketCap",
          "url": "https://coinmarketcap.com/",
          "description": "加密货币价格、市值排行与市场数据",
          "tags": [
            "行情",
            "数据"
          ]
        },
        {
          "name": "CoinGecko",
          "url": "https://www.coingecko.com/",
          "description": "加密资产行情、交易量与项目数据查询",
          "tags": [
            "行情",
            "数据"
          ]
        },
        {
          "name": "DefiLlama",
          "url": "https://defillama.com/",
          "description": "DeFi 协议锁仓量、稳定币与链上数据分析",
          "tags": [
            "DeFi",
            "数据"
          ]
        }
      ]
    },
    {
      "name": "区块链浏览器",
      "emoji": "🔍",
      "links": [
        {
          "name": "Etherscan",
          "url": "https://etherscan.io/",
          "description": "以太坊区块、交易、地址与智能合约查询",
          "tags": [
            "区块浏览器",
            "ETH"
          ]
        }
      ]
    },
    {
      "name": "数字资产钱包与硬件",
      "emoji": "🔐",
      "links": [
        {
          "name": "MetaMask",
          "url": "https://metamask.io/",
          "description": "加密资产自托管钱包与去中心化应用入口",
          "tags": [
            "钱包",
            "Web3"
          ]
        },
        {
          "name": "Trezor",
          "url": "https://trezor.io/",
          "description": "硬件钱包产品、使用指南与资产管理工具",
          "tags": [
            "硬件钱包"
          ]
        }
      ]
    },
    {
      "name": "数字资产交易平台",
      "emoji": "🔄",
      "links": [
        {
          "name": "Bybit",
          "url": "https://www.bybit.com/",
          "description": "Bybit交易所",
          "tags": [
            "加密交易所"
          ]
        },
        {
          "name": "Binance",
          "url": "https://www.binance.com/",
          "description": "全球领先的加密货币交易所",
          "tags": [
            "Binance"
          ]
        }
      ]
    }
  ]
}
];