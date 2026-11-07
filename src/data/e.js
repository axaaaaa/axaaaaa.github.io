export const e = [

{
    "name": "开源库",
    "icon": "code",
    "group": '💻 编程与开发',
    "emoji": "💻",
    subCategories: [
      {
        name: '开源社区与学习',
        emoji: '📚',
        links: [
          {"name": "开源中国","url": "https://www.oschina.net","description": "国内老牌开源项目与资讯社区",tag:"免费"},
          {"name": "HelloGitHub","url": "https://hellogithub.com/","description": "HelloGitHub 分享 GitHub 上有趣、入门级的开源项目",tag:"开源"},
          {"name": "Build Your Own X", "url": "https://github.com/codecrafters-io/build-your-own-x", "description": "这个仓库汇编了一系列写得很好的、逐步引导你从零开始重现我们喜爱的技术。", "tag": "开源"},
        ]
      },
      {
        name: '系统与开发工具',
        emoji: '🛠️',
        links: [
          {"name": "tortoisegit","url": "https://tortoisegit.org/","description": "TortoiseGit 是一个基于 TortoiseSVN 的 Git Windows Shell 界面。它是开源的，可以完全使用免费软件构建。",tag:"开源"},
          {"name": "GNU","url": "https://www.gnu.org/","description": "GNU是一个免费的操作系统，由 GNU 项目开发。",tag:"开源"},
          {"name": "Rich", "url": "https://github.com/Textualize/rich", "description": "终端美化神器，让CLI界面拥有进度条、表格与彩色日志", "tag": "界面"},
          {"name": "Loguru", "url": "https://github.com/Delgan/loguru", "description": "最优雅的日志库，调试、监控、长期运行程序必备", "tag": "日志"},
        ]
      },
      {
        name: 'AI 与深度学习',
        emoji: '🧠',
        links: [
          {"name": "PaddlePaddle","url": "https://github.com/PaddlePaddle/Paddle","description": "百度开源识字库",tag:"开源"},
          {"name": "TensorFlow","url": "https://www.tensorflow.org/","description": "TensorFlow是一个端到端的开源平台，用于机器学习。",tag:"开源"},
          {"name": "PyTorch","url": "https://pytorch.org/","description": "PyTorch是一个基于Python的科学计算库，用于自然语言处理、计算机视觉和语音识别。",tag:"开源"},
          {"name": "MXNet","url": "https://mxnet.apache.org/","description": "MXNet是一个基于Python的深度学习框架，用于计算机视觉和自然语言处理。",tag:"开源"},
          {"name": "Keras","url": "https://keras.io/","description": "Keras是一个基于Python的深度学习库，用于自然语言处理、计算机视觉和语音识别。",tag:"开源"},
        ]
      },
      {
        name: '图像与多媒体',
        emoji: '🎬',
        links: [
          {"name": "ffmpeg","url": "https://www.ffmpeg.org/","description": "开源的视频转码工具，几乎是行业标准",tag:"开源"},
          {"name": "Pillow","url": "https://github.com/python-pillow/Pillow","description": "Pillow是一个Python Imaging Library（PIL）的分支，用于处理图像。",tag:"开源"},
          {"name": "OpenCV","url": "https://opencv.org/","description": "OpenCV是世界上最大的计算机视觉库。",tag:"开源"},
        ]
      },
      {
        name: 'OCR 文字识别',
        emoji: '🔤',
        links: [
          {"name": "Tesseract","url": "https://github.com/tesseract-ocr/tesseract","description": "Tesseract是一个开源的OCR引擎，用于识别图像中的文本。",tag:"开源"},
          {"name": "EasyOCR","url": "https://github.com/JaidedAI/EasyOCR","description": "EasyOCR是一个基于Python的OCR库，用于识别图像中的文本。",tag:"开源"},
          {"name": "RapidOCR","url": "https://github.com/RapidAI/RapidOCR","description": "PaddleOCR 的轻量封装，适合桌面应用，用于识别图像中的文本。",tag:"开源"},
          {"name": "CnOCR","url": "https://github.com/breezedeus/cnocr","description": "CnOCR 是一个基于 PaddleOCR 的中文 OCR 库，支持识别中文、英文、数字和符号。对中文场景的识别更友好",tag:"开源"},
        ]
      },
      {
        name: '科学计算与数据分析',
        emoji: '📊',
        links: [
          {"name": "NumPy", "url": "https://numpy.org/", "description": "用于矩阵与科学计算的基础库，是AI算法与图像处理的底层基石", "tag": "基础"},
          {"name": "Pandas", "url": "https://pandas.pydata.org/", "description": "高效数据分析与表格处理工具，是数据工程的核心", "tag": "数据分析"},
        ]
      },
      {
        name: '网络与后端开发',
        emoji: '🌐',
        links: [
          {"name": "Requests", "url": "https://docs.python-requests.org/", "description": "最人性化的HTTP网络请求库，爬虫与API必备", "tag": "网络"},
          {"name": "FastAPI", "url": "https://fastapi.tiangolo.com/", "description": "基于异步的现代Web框架，性能极高，API开发首选", "tag": "后端"},
          {"name": "Scrapy", "url": "https://scrapy.org/", "description": "强大的爬虫框架，支持分布式、异步、管道化数据流", "tag": "爬虫"},
        ]
      },
      {
        name: '桌面自动化与截图',
        emoji: '🖱️',
        links: [
          {"name": "PyAutoGUI", "url": "https://pyautogui.readthedocs.io/", "description": "跨平台屏幕自动化操作库，可控制鼠标键盘，游戏脚本必备", "tag": "自动化"},
          {"name": "mss", "url": "https://github.com/BoboTiG/python-mss", "description": "极速截图库，适合实时图像识别、游戏脚本、监控系统", "tag": "截图"},
        ]
      },
      {
        name: '逆向与仿真引擎',
        emoji: '🔬',
        links: [
          {"name": "Capstone", "url": "https://www.capstone-engine.org/", "description": "强大的反汇编引擎，支持多架构，逆向分析基础工具", "tag": "逆向"},
          {"name": "Unicorn", "url": "https://www.unicorn-engine.org/", "description": "轻量级CPU仿真器，用于二进制执行与漏洞分析", "tag": "逆向"},
        ]
      },
      {
        name: '内存取证与安全研究',
        emoji: '🛡️',
        links: [
          {"name": "PCILeech", "url": "https://github.com/ufrisk/pcileech", "description": "合法的内存取证和安全研究工具，通过 PCIe DMA 接口读取内存，用于防御与漏洞分析", "tag": "安全研究"},
          {"name": "LeechCore", "url": "https://github.com/ufrisk/LeechCore", "description": "PCILeech 的底层库，提供访问物理内存、DMA 设备的抽象层接口", "tag": "内存取证"},
          {"name": "MemProcFS", "url": "https://github.com/ufrisk/MemProcFS", "description": "在 Windows 内存上创建虚拟文件系统，用于法证与安全分析", "tag": "内存取证"},
          {"name": "DMA attacks research by Ulf Frisk", "url": "https://github.com/ufrisk", "description": "全球最早系统性研究 Thunderbolt / PCIe DMA 安全漏洞的研究者合集", "tag": "安全研究"},
          {"name": "Thunderclap", "url": "https://github.com/thunderclap-io/thunderclap", "description": "研究 DMA 攻击面和防御的学术项目，帮助厂商加强 IOMMU 安全机制", "tag": "漏洞研究"},
        ]
      },
      {
        name: '开源硬件',
        emoji: '🔧',
        links: [
          {"name": "立创开源硬件平台","url": "https://oshwhub.com/","description": "硬件开源平台",tag:"开源"},
        ]
      }
    ]
  },
  
  
  
  



]
