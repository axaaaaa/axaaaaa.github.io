export const aiTools = [
     //Group 1: 我的原创
  {
    "name": "本地地址",
    "group": "✨ 本地地址",  // ✅ 新增 group 字段
    "icon": "StarFilled",
    "emoji": "🚀",
    "links": [
      // 路由器管理地址
      { "name": "192.168.1.1", "url": "http://192.168.1.1", "description": "常见路由器管理地址" },
      { "name": "192.168.0.1", "url": "http://192.168.0.1", "description": "TP-Link/D-Link路由器" },
      { "name": "192.168.2.1", "url": "http://192.168.2.1", "description": "Belkin路由器" },
      { "name": "192.168.31.1", "url": "http://192.168.31.1", "description": "小米路由器" },
      { "name": "192.168.3.1", "url": "http://192.168.3.1", "description": "华为路由器" },
      { "name": "192.168.10.1", "url": "http://192.168.10.1", "description": "Cisco路由器" },
      { "name": "10.0.0.1", "url": "http://10.0.0.1", "description": "Apple/部分运营商路由器" },
      { "name": "192.168.100.1", "url": "http://192.168.100.1", "description": "光猫管理地址" },
      // 本地开发服务
      { "name": "localhost", "url": "http://localhost", "description": "本地主机" },
      { "name": "127.0.0.1", "url": "http://127.0.0.1", "description": "本地回环地址" },
      { "name": "本地:8080", "url": "http://localhost:8080", "description": "常用开发端口" },
      { "name": "本地:3000", "url": "http://localhost:3000", "description": "React/Vue开发服务器" },
      { "name": "本地:5000", "url": "http://localhost:5000", "description": "Flask开发服务器" },
      { "name": "本地:5500", "url": "http://localhost:5500", "description": "VS Code Live Server" },
      { "name": "本地:5173", "url": "http://localhost:5173", "description": "Vite开发服务器" },
      { "name": "本地:4200", "url": "http://localhost:4200", "description": "Angular开发服务器" },
    ]
  },



  //Group 1: 我的原创
  {
    "name": "项目",
    "group": "✨ 项目",  // ✅ 新增 group 字段
    "icon": "StarFilled",
    "emoji": "🚀",
    "links": [
      { "name": "通用 AI 调用台", "url": "https://axaaaaa.github.io/aiApi/", "description": "一个基于AI的调用台，帮助用户调用不同的AI模型。", "tags": ["开源"] },
      { "name": "AI 绘画风格图鉴", "url": "https://axaaaaa.github.io/huitu/", "description": "一个基于AI的绘画风格图鉴，帮助用户找到他们需要的绘画风格。", "tags": ["开源"] },
      { "name": "宝宝打字游戏", "url": "https://axaaaaa.github.io/dazi/", "description": "宝宝打字游戏，帮助宝宝提升打字能力。", "tags": ["开源"] },
      { "name": "知识库", "url": "https://axaaaaa.github.io/zhishiku/", "description": "一个基于AI的知识库，帮助用户找到他们需要的知识。", "tags": ["开源"] },
      { "name": "阅读助手", "url": "https://axaaaaa.github.io/yuedu/", "description": "一个基于AI的阅读助手，帮助用户阅读文章。", "tags": ["开源"] },
      { "name": "每日早报", "url": "https://axaaaaa.github.io/daily-morning-news/", "description": "一个基于AI的每日早报，帮助用户获取每日的新闻。", "tags": ["开源"] },
      { "name": "音乐播放器", "url": "http://axaaaaa.github.io/MusicPlay/", "description": "本地音乐播放器。", "tags": ["开源"] }
    ]
  },

  // Group 2: AI 核心生产力
  {
    "name": "人工智能-文字",
    "group": "🤖 AI 生产力", // ✅ 新增 group 字段
    "icon": "ChatDotRound",
    "emoji": "🧠",
    "subCategories": [
      {
        "name": "全球领军",
        "emoji": "🌍",
        "links": [
          { "name": "ChatGPT", "url": "https://chatgpt.com/", "description": "OpenAI开发的对话式AI模型，支持多种任务和语言", "tags": ["收费"] },
          { "name": "Claude", "url": "https://claude.ai/", "description": "Anthropic开发的AI助手，强调安全和协作", "tags": ["收费"] },
          { "name": "Gemini", "url": "https://gemini.google.com/app", "description": "Google推出的多模态AI助手，整合搜索和生成能力", "tags": ["收费"] },
          { "name": "Grok", "url": "https://x.ai", "description": "马斯克旗下xAI开发的大模型", "tags": ["收费"] },
          { "name": "Perplexity AI", "url": "https://perplexity.ai/", "description": "AI 驱动的搜索引擎，可以生成和理解文本", "tags": ["收费"] },
          { "name": "Mistral", "url": "https://mistral.ai/", "description": "欧洲最强开源模型", "tags": ["收费"] },
          { "name": "Cohere", "url": "https://coral.cohere.com/", "description": "专注于企业级开发的语言模型", "tags": ["收费"] },
          { "name": "DeepMind", "url": "https://deepmind.google/", "description": "Google旗下专注于开发先进AI技术的研究机构", "tags": ["免费"] },
          { "name": "Ollama", "url": "https://ollama.com/", "description": "本地运行大模型的最佳工具", "tags": ["免费", "开源"] },
        ]
      },
      {
        "name": "Agent",
        "emoji": "🤖",
        "links": [
          { "name": "Hermes Agent", "url": "https://hermes-agent.nousresearch.com/", "description": "Agent", "tags": ["开源"] },
          { "name": "OpenClaw", "url": "https://openclaw.ai/", "description": "本地AI助手，提供免费的AI助手", "tags": ["免费"] },
          { "name": "marvis", "url": "https://marvis.qq.com/", "description": "本地AI助手，提供免费的AI助手", "tags": ["免费"] },
         
          { "name": "Google AI Studio", "url": "https://aistudio.google.com/", "description": "谷歌人工智能开发者工作室", "tags": ["免费"] },
          { "name": "StackOverflow AI", "url": "https://stackoverflow.com/ai-assist", "description": "StackOverflow开发的AI助手", "tags": ["免费"] },
          { "name": "NotebookLM", "url": "https://notebooklm.google.com/", "description": "Google AI笔记，基于文档回答", "tags": ["免费"] },
          { "name": "PentestGPT", "url": "https://pentestgpt.ai/", "description": "渗透测试专用AI模型", "tags": ["收费"] },
          { "name": "Manus", "url": "https://manus.im/", "description": "AI工具导航与发现平台", "tags": ["收费"] },
          { "name": "360安全龙虾", "url": "https://claw.360.cn/", "description": "360OpenClaw", "tags": ["免费"] },
          { "name": "QClawd", "url": "https://qclawd.com/", "description": "腾讯OpenClaw", "tags": ["免费"] },
          { "name": "Copaw", "url": "https://copaw.bot/zh/", "description": "阿里出品的OpenClaw", "tags": ["免费"] },
          { "name": "SkillHub", "url": "https://skillhub.tencent.com/", "description": "腾讯出品的skillhub集合", "tags": ["免费"] },
        ]
      },
      {
        "name": "Prompt",
        "emoji": "💬",
        "links": [
          { "name": "Nano Banana Pro Prompts", "url": "https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts", "description": "Nano Banana Pro 提示词集合", "tags": ["免费"] },
           { "name": "gpt-image-2 Prompts", "url": "https://github.com/YouMind-OpenLab/awesome-gpt-image-2", "description": "gpt-image-2 提示词集合", "tags": ["免费"] },
          
          { "name": "Nano Prompt Gallery", "url": "https://opennana.com/awesome-prompt-gallery", "description": "OpenNana 提示词画廊", "tags": ["免费"] },
          { "name": "Prompthero", "url": "https://prompthero.com/", "description": "AI艺术创作的提示词社区", "tags": ["免费"] },
          { "name": "Prompthunt", "url": "https://www.prompthunt.com/", "description": "分享不同提示词生成的作品", "tags": ["免费"] },
          { "name": "IdeaPromptly", "url": "https://ideapromptly.com/", "description": "AI提示词生成工具", "tags": ["免费"] }
        ]
      },
      {
        "name": "国内大模型",
        "emoji": "🇨🇳",
        "links": [
          { "name": "Kimi", "url": "https://kimi.moonshot.cn/", "description": "长文本分析能力极强的AI助手", "tags": ["免费"] },
          { "name": "DeepSeek", "url": "https://chat.deepseek.com/", "description": "深度求索，代码与逻辑能力极强", "tags": ["免费"] },
          { "name": "通义千问", "url": "https://www.tongyi.com/", "description": "阿里出品的大语言模型", "tags": ["免费"] },
          { "name": "文心一言", "url": "https://yiyan.baidu.com/", "description": "百度出品的知识增强大语言模型", "tags": ["免费"] },
          { "name": "豆包", "url": "https://www.doubao.com/chat/", "description": "字节跳动出品，语音交互体验好", "tags": ["免费"] },
          { "name": "智谱清言", "url": "https://chatglm.cn/", "description": "源自清华系的GLM大模型", "tags": ["免费"] },
          { "name": "智谱开放平台", "url": "https://open.bigmodel.cn/", "description": "开放平台", "tags": ["免费"] },
          { "name": "元宝", "url": "https://yuanbao.tencent.com/", "description": "腾讯出品AI大模型，深度整合微信", "tags": ["免费"] },
          { "name": "讯飞星火", "url": "https://xinghuo.xfyun.cn/", "description": "科大讯飞出品，擅长办公与语音", "tags": ["免费"] },
          { "name": "天宫AI", "url": "https://www.tiangong.cn/", "description": "昆仑万维出品", "tags": ["免费"] },
          { "name": "当贝AI", "url": "https://ai.dangbei.com/chat", "description": "AI大模型", "tags": ["免费"] },
          { "name": "Coze (国内版)", "url": "https://space.coze.cn/", "description": "字节推出的AI Bot扣子平台", "tags": ["免费"] },
          { "name": "纳米AI", "url": "https://www.n.cn/", "description": "AI搜索与对话", "tags": ["免费"] },
          { "name": "小米大模型", "url": "https://aistudio.xiaomimimo.com/", "description": "小米出品的大模型", "tags": ["免费"] },
          { "name": "海螺AI", "url": "https://hailuoai.com/", "description": "MiniMax稀宇科技出品的大模型", "tags": ["免费"] }
        ]
      },

      {
        "name": "代码生成",
        "emoji": "💻",
        "links": [
          { "name": "OpenCode", "url": "https://opencode.ai/", "description": "代码生成工具", "tags": ["开源"] },
          { "name": "CodeX", "url": "https://chatgpt.com/codex/", "description": "代码生成工具", "tags": ["收费"] },
          { "name": "Copilot", "url": "https://github.com/copilot", "description": "GitHub推出的AI代码助手", "tags": ["收费"] },
          { "name": "Qoder", "url": "https://qoder.com/", "description": "AI驱动的代码生成与理解工具", "tags": ["收费"] },
          { "name": "Claude Code", "url": "https://claude.com/product/claude-code", "description": "Anthropic推出的专业代码助手", "tags": ["收费"] },
          { "name": "Antigravity", "url": "https://antigravity.google/", "description": "Google的AI代码生成与开发工具", "tags": ["收费"] },
          { "name": "Cursor", "url": "https://cursor.so/", "description": "基于VS Code的最强AI代码编辑器", "tags": ["收费"] },
          { "name": "Windsurf", "url": "https://codeium.com", "description": "Codeium推出的AI编辑器", "tags": ["收费"] },
          { "name": "通义灵码", "url": "https://lingma.aliyun.com/", "description": "阿里云免费AI编程插件", "tags": ["免费"] },
          { "name": "TRAE", "url": "https://www.trae.cn/", "description": "字节跳动推出的AI IDE", "tags": ["免费"] },
          { "name": "CodeBuddy", "url": "https://copilot.tencent.com/", "description": "腾讯云代码助手", "tags": ["免费"] },
          { "name": "Bolt", "url": "https://bolt.new/", "description": "浏览器内直接生成全栈Web应用", "tags": ["收费"] },
          { "name": "v0", "url": "https://v0.dev/", "description": "Vercel出品的UI生成工具", "tags": ["收费"] },
          { "name": "Kiro", "url": "https://kiro.dev/", "description": "AI编程助手", "tags": ["收费"] }
        ]
      },
    ]
  },


  {
    "name": "人工智能-视觉",
    "group": "🤖 AI 生产力",
    "icon": "Picture",
    "emoji": "🎨",
    "subCategories": [
      {
        "name": "绘画生成",
        "emoji": "🖌️",
        "links": [
          { "name": "Midjourney", "url": "https://www.midjourney.com/", "description": "目前艺术性最强的AI绘画工具", "tags": ["收费"] },
          { "name": "Stable Diffusion", "url": "https://stability.ai/", "description": "最强大的开源AI绘画生态", "tags": ["开源"] },
          { "name": "FLUX", "url": "https://blackforestlabs.ai/", "description": "当前最强开源文生图模型", "tags": ["免费"] },
          { "name": "ComfyUI", "url": "https://www.comfy.org/", "description": "基于节点流的工作流设计工具", "tags": ["免费"] },
          { "name": "Civitai", "url": "https://civitai.com/", "description": "全球最大的模型分享社区(C站)", "tags": ["免费"] },
          { "name": "liblib.art", "url": "https://liblib.art/", "description": "国内最大的AI绘画模型社区", "tags": ["免费"] },
          { "name": "即梦AI", "url": "https://jimeng.jianying.com/ai-tool/home", "description": "字节跳动出品的图像视频生成平台", "tags": ["免费"] },
          { "name": "Leonardo.ai", "url": "https://leonardo.ai/", "description": "游戏资产生成的首选AI平台", "tags": ["收费"] },
          { "name": "Firefly", "url": "https://firefly.adobe.com/", "description": "Adobe推出的AI绘画工具", "tags": ["收费"] },
          { "name": "Geospy", "url": "https://geospy.ai/", "description": "AI地理定位侦探，通过图片定位位置", "tags": ["收费"] },
        ]
      },

      {
        "name": "图片处理",
        "emoji": "🖼️",
        "links": [
          { "name": "Qwen-Image-Edit", "url": "https://huggingface.co/spaces/prithivMLmods/Qwen-Image-Edit-2511-LoRAs-Fast", "description": "基于Qwen-2.5的图像编辑模型", "tags": ["免费"] },
          { "name": "Z-Image-Turbo", "url": "https://huggingface.co/spaces/mrfakename/Z-Image-Turbo", "description": "基于Stable Diffusion的图像生成器", "tags": ["免费"] },
          { "name": "MagicQuill", "url": "https://magicquill.art/", "description": "智能交互式图像编辑系统", "tags": ["免费"] },
          { "name": "MagicQuill", "url": "https://huggingface.co/spaces/AI4Editing/MagicQuill", "description": "AI智能图片编辑", "tags": ["免费"] },
          { "name": "Object Removal", "url": "https://huggingface.co/spaces/aryadytm/remove-photo-object", "description": "AI智能移除图片对象", "tags": ["免费"] },
          { "name": "FaceFusion", "url": "https://github.com/facefusion/facefusion", "description": "开源换脸工具，支持高质量脸部融合", "tags": ["开源"] },
          { "name": "YOLO", "url": "https://www.ultralytics.com/", "description": "实时目标检测与视觉识别", "tags": ["开源", "免费"] },
          { "name": "Background Removal", "url": "https://huggingface.co/spaces/not-lain/background-removal", "description": "AI智能移除图片背景", "tags": ["免费"] },
          { "name": "CodeFormer", "url": "https://huggingface.co/spaces/sczhou/CodeFormer", "description": "面部修复", "tags": ["免费"] },
          { "name": "iLoveImg", "url": "https://www.iloveimg.com/zh-cn", "description": "图片处理工具，支持批量处理", "tags": ["免费"] }
        ]
      },
      {
        "name": "视频生成",
        "emoji": "🎬",
        "links": [
          
         { "name": "可灵AI", "url": "https://app.klingai.com/cn/", "description": "快手出品的视频与图像生成模型", "tags": ["收费"] },
         { "name": "小云雀AI", "url": "https://xyq.jianying.com/", "description": "视频与图像生成模型", "tags": ["收费"] },
         { "name": "Seedance", "url": "https://seed.bytedance.com/zh/seedance2_0/", "description": "字节跳动出品的视频生成模型", "tags": ["收费"] },
         { "name": "HunyuanVideo", "url": "https://video.hunyuan.tencent.com/", "description": "腾讯开源视频生成模型", "tags": ["收费"] },
          { "name": "Veo", "url": "https://gemini.google/overview/video-generation/", "description": "Google AI 文生视频", "tags": ["收费"] },
          { "name": "HunyuanVideo", "url": "https://github.com/Tencent-Hunyuan/HunyuanVideo", "description": "腾讯开源视频生成模型", "tags": ["开源"] },
          { "name": "Wan2.2-Animate", "url": "https://huggingface.co/spaces/Wan-AI/Wan2.2-Animate", "description": "统一的角色动画和视频人物替换", "tags": ["免费"] },
          { "name": "CapCut", "url": "https://www.capcut.com", "description": "剪映海外版，支持AI特效", "tags": ["收费"] },
          { "name": "Topaz Video AI", "url": "https://www.topazlabs.com/video-ai", "description": "视频画质修复与分辨率提升", "tags": ["收费"] },
          { "name": "Runway Gen-3", "url": "https://runwayml.com/", "description": "专业级AI视频生成与编辑平台", "tags": ["收费"] },
          { "name": "Pika 1.0", "url": "https://pika.art/", "description": "用户友好的AI视频生成工具", "tags": ["免费"] }
        ]
      },
      {
        "name": "3D与数字人",
        "emoji": "🧑‍🎨",
        "links": [
          { "name": "Meshy", "url": "https://www.meshy.ai/", "description": "一个基于AI的3D模型生成平台", "tags": ["收费"] },
          { "name": "Tripo3D", "url": "https://studio.tripo3d.ai/", "description": "一个基于AI的3D模型生成平台", "tags": ["收费"] },
          { "name": "Luma AI", "url": "https://lumalabs.ai/", "description": "从视频生成高质量3D模型", "tags": ["收费"] },
          { "name": "Polycam", "url": "https://poly.cam/", "description": "手机扫描生成3D模型", "tags": ["免费"] },
          { "name": "Wonder3D", "url": "https://github.com/xxlong0/Wonder3D", "description": "开源3D模型生成工具", "tags": ["开源"] },
          { "name": "Trellis", "url": "https://github.com/microsoft/TRELLIS", "description": "微软开源的AI 3D生成平台", "tags": ["开源"] },
          { "name": "LivePortrait", "url": "https://github.com/KwaiVGI/LivePortrait", "description": "快手开源的静态图转动态视频", "tags": ["开源"] },
          { "name": "Sonic", "url": "https://github.com/jixiaozhong/Sonic", "description": "AI数字人生成平台", "tags": ["开源"] },
          { "name": "InfiniteTalk", "url": "https://github.com/MeiGen-AI/InfiniteTalk", "description": "AI数字人对话生成", "tags": ["开源"] }
        ]
      }
    ]
  },

  {
    "name": "人工智能-听觉",
    "group": "🤖 AI 生产力",
    "icon": "Headset",
    "emoji": "🎵",
    "subCategories": [
      {
        "name": "语音合成",
        "emoji": "🗣️",
        "links": [
          { "name": "ElevenLabs", "url": "https://elevenlabs.io/", "description": "最逼真的AI语音合成平台", "tags": ["收费"] },
          { "name": "Fish Audio", "url": "https://fish.audio/zh-CN/", "description": "超逼真的情感语音克隆", "tags": ["收费"] },
          { "name": "ChatTTS", "url": "https://github.com/2noise/ChatTTS", "description": "专门针对对话优化的开源TTS", "tags": ["开源"] },
          { "name": "CosyVoice", "url": "https://github.com/FunAudioLLM/CosyVoice", "description": "阿里开源的高质量语音生成", "tags": ["开源"] },
          { "name": "F5-TTS", "url": "https://f5tts.org/", "description": "开源语音合成系统", "tags": ["免费"] },
          { "name": "IndexTTS2", "url": "https://indextts2.org/", "description": "精准语音时长控制与情感表达", "tags": ["开源"] },
          { "name": "Murf AI", "url": "https://murf.ai/", "description": "AI语音生成与配音工具", "tags": ["收费"] },
          { "name": "Azure TTS", "url": "https://azure.microsoft.com/zh-cn/services/cognitive-services/text-to-speech/", "description": "微软Azure语音合成服务", "tags": ["收费"] },
          { "name": "Google TTS", "url": "https://cloud.google.com/text-to-speech", "description": "谷歌云语音合成API", "tags": ["收费"] }
        ]
      },
      {
        "name": "语音识别",
        "emoji": "👂",
        "links": [
          { "name": "Whisper", "url": "https://openai.com/blog/whisper/", "description": "OpenAI开源的通用语音识别模型", "tags": ["开源", "免费"] },
          { "name": "Deepgram", "url": "https://deepgram.com/", "description": "高性能AI语音识别平台", "tags": ["收费"] },
          { "name": "AssemblyAI", "url": "https://www.assemblyai.com/", "description": "语音转文字API服务", "tags": ["收费"] },
          { "name": "Rev AI", "url": "https://www.rev.com/ai", "description": "专业语音转录服务", "tags": ["收费"] },
          { "name": "讯飞听见", "url": "https://www.iflyrec.com/", "description": "科大讯飞语音转写", "tags": ["收费"] },
          { "name": "网易见外", "url": "https://sight.youdao.com/", "description": "视频翻译与字幕生成", "tags": ["免费"] }
        ]
      },
      {
        "name": "音乐生成",
        "emoji": "🎶",
        "links": [
          { "name": "Suno", "url": "https://www.suno.ai/", "description": "AI音乐生成神器", "tags": ["免费"] },
          { "name": "Udio", "url": "https://www.udio.com/", "description": "高质量AI音乐创作平台", "tags": ["免费"] },
          { "name": "MusicGen", "url": "https://musicgen.com/", "description": "Meta开源音乐生成模型", "tags": ["开源"] },
          { "name": "Stable Audio", "url": "https://stability.ai/stable-audio", "description": "Stability AI音乐生成", "tags": ["收费"] },
          { "name": "AIVA", "url": "https://www.aiva.ai/", "description": "AI作曲家，生成电影配乐", "tags": ["收费"] },
          { "name": "Soundraw", "url": "https://soundraw.io/", "description": "AI音乐生成器", "tags": ["收费"] },
          { "name": "Boomy", "url": "https://boomy.com/", "description": "快速生成原创音乐", "tags": ["免费"] }
        ]
      },
      {
        "name": "声音克隆",
        "emoji": "🎙️",
        "links": [
          { "name": "GPT-SoVITS", "url": "https://github.com/RVC-Boss/GPT-SoVITS", "description": "开源少样本语音克隆", "tags": ["开源"] },
          
          { "name": "fish.audio", "url": "https://fish.audio/", "description": "语音克隆", "tags": ["收费"] },
          { "name": "fish-speech", "url": "https://github.com/fishaudio/fish-speech", "description": "语音克隆", "tags": ["开源"] },
          
          { "name": "RVC", "url": "https://github.com/RVC-Project/Retrieval-based-Voice-Conversion", "description": "开源实时语音转换", "tags": ["开源"] },
          { "name": "So-VITS-SVC", "url": "https://github.com/svc-develop-team/so-vits-svc", "description": "歌声转换开源项目", "tags": ["开源"] },
          { "name": "Resemble AI", "url": "https://www.resemble.ai/", "description": "企业级语音克隆平台", "tags": ["收费"] },
          { "name": "Descript", "url": "https://www.descript.com/", "description": "音频编辑与语音克隆", "tags": ["收费"] }
        ]
      }
    ]
  },

  {
    "name": "人工智能-聚合平台",
    "group": "🤖 AI 生产力", // ✅ 新增 group 字段
    "icon": "Connection",
    "emoji": "🔗",
    "links": [
      
      { "name": "Hugging Face", "url": "https://huggingface.co/", "description": "AI领域的GitHub，模型托管中心", "tags": ["开源"] },
      { "name": "Hugging Space", "url": "https://huggingface.co/spaces", "description": "在线运行和试用各种AI应用", "tags": ["免费"] },
      { "name": "魔塔社区", "url": "https://www.modelscope.cn/home", "description": "阿里推出的中国AI模型社区", "tags": ["免费"] },
      { "name": "Coze (国际版)", "url": "https://www.coze.com/", "description": "字节跳动推出的AI Bot编排平台", "tags": ["免费"] },
      { "name": "Poe", "url": "https://poe.com/", "description": "聚合了多种主流AI模型的聊天平台", "tags": ["免费"] },
      { "name": "LobeChat", "url": "https://chat-preview.lobehub.com/chat", "description": "高颜值的开源AI聊天WebUI", "tags": ["免费"] },
      { "name": "ChatGPT Proxy", "url": "https://vercel.ddaiai.com/", "description": "聚合ChatGPT、Midjourney等服务的代理界面", "tags": ["免费"] },
      { "name": "ChatNio", "url": "https://www.chatnio.com/", "description": "新一代AI一站式解决方案", "tags": ["免费"] },
      { "name": "LM Studio", "url": "https://lmstudio.ai/", "description": "在本地电脑轻松运行LLM的工具", "tags": ["免费"] },
      { "name": "Jan", "url": "https://jan.ai/", "description": "本地运行的ChatGPT替代品", "tags": ["免费"] },
      { "name": "TopAI Tools", "url": "https://topai.tools/", "description": "AI工具导航与发现平台", "tags": ["免费"] },
      { "name": "Rubbrband", "url": "https://www.rubbrband.com/home", "description": "一站式媒体生成工具", "tags": ["免费"] },
      { "name": "OpenAI API", "url": "https://platform.openai.com/", "description": "OpenAI官方API平台，接入最新模型", "tags": ["收费"] },
      { "name": "Anthropic API", "url": "https://console.anthropic.com/", "description": "Anthropic官方API平台", "tags": ["收费"] },
      { "name": "Google AI Studio", "url": "https://makersuite.google.com/app", "description": "Google AI模型开发与部署平台", "tags": ["免费"] }
        ]
  },

  // Group 4: 常用与生活
  {
    "name": "常用工具与翻译",
    "group": "🛠️ 常用与生活", // ✅ 新增 group 字段
    "icon": "Tools",
    "emoji": "🔧",
    "subCategories": [
      {
        "name": "翻译工具",
        "emoji": "🌐",
        "links": [
          { "name": "DeepL", "url": "https://www.deepl.com/zh/translator", "description": "全球最准确的AI翻译工具", "tags": ["免费"] },
          { "name": "Google 翻译", "url": "https://translate.google.com/", "description": "多语言互译老牌工具", "tags": ["免费"] },
          { "name": "沉浸式翻译", "url": "https://immersivetranslate.com/", "description": "浏览器插件，双语对照翻译神器", "tags": ["免费"] },
          { "name": "Bing 翻译", "url": "https://www.bing.com/translator", "description": "微软必应翻译", "tags": ["免费"] },
          { "name": "百度翻译", "url": "https://fanyi.baidu.com/", "description": "支持实时翻译", "tags": ["免费"] },
          { "name": "腾讯翻译", "url": "https://fanyi.qq.com/", "description": "腾讯翻译君", "tags": ["免费"] },
          { "name": "有道翻译", "url": "https://fanyi.youdao.com/", "description": "网易有道翻译", "tags": ["免费"] },
          { "name": "金山词霸", "url": "https://www.iciba.com/", "description": "老牌词典翻译", "tags": ["免费"] },
          { "name": "PyVideoTrans (Web)", "url": "https://pyvideotrans.com/", "description": "免费在线视频翻译与字幕工具", "tags": ["免费"] },
          { "name": "PyVideoTrans (Github)", "url": "https://github.com/jianchang512/pyvideotrans", "description": "开源本地视频翻译软件", "tags": ["开源", "免费"] },
          { "name": "HeyGen", "url": "https://www.heygen.com/", "description": "AI视频翻译与口型同步", "tags": ["收费"] },
          { "name": "Rask", "url": "https://www.rask.ai/", "description": "视频本地化与配音工具", "tags": ["收费"] }
        ]
      },
      {
        "name": "搜索引擎",
        "emoji": "🔍",
        "links": [
          { "name": "Google", "url": "https://www.google.com/", "description": "全球最大搜索引擎", "tags": ["免费"] },
          { "name": "Bing", "url": "https://www.bing.com/", "description": "微软必应搜索", "tags": ["免费"] },
          { "name": "百度", "url": "https://www.baidu.com/", "description": "中文搜索引擎", "tags": ["免费"] },
          { "name": "搜狗", "url": "https://www.sogou.com/", "description": "搜狗搜索", "tags": ["免费"] },
          { "name": "360搜索", "url": "https://www.so.com/", "description": "360安全搜索", "tags": ["免费"] },
          { "name": "Yahoo", "url": "https://www.yahoo.com/", "description": "雅虎搜索", "tags": ["免费"] },
          { "name": "维基百科", "url": "https://www.wikipedia.org/", "description": "自由的百科全书", "tags": ["免费", "开源"] },
          { "name": "Grokipedia", "url": "https://grokipedia.com/", "description": "Grok百科", "tags": ["免费"] }
        ]
      },
      {
        "name": "网址导航",
        "emoji": "🧭",
        "links": [
          { "name": "NavX", "url": "https://axaaaaa.github.io/", "description": "个人网址导航", "tags": ["免费"] },
          { "name": "GGXCWL", "url": "https://ggxcwl.com/", "description": "综合导航", "tags": ["免费"] },
          { "name": "发现AI", "url": "https://www.faxianai.com/", "description": "发现AI", "tags": ["免费"] },
          { "name": "UISDC", "url": "https://ai.uisdc.com/", "description": "AI工具导航", "tags": ["免费"] },
          { "name": "hao123", "url": "https://www.hao123.com/", "description": "老牌导航", "tags": ["免费"] },
          { "name": "360导航", "url": "https://hao.360.com/", "description": "安全导航", "tags": ["免费"] },
          { "name": "2345导航", "url": "https://www.2345.com/", "description": "上网导航", "tags": ["免费"] },
          { "name": "搜狗导航", "url": "https://123.sogou.com/", "description": "搜狗网址大全", "tags": ["免费"] },
          { "name": "银河录像局", "url": "https://nf.video/", "description": "录像局", "tags": ["免费"] }
        ]
      }
    ]
  },
  {
    "name": "新闻与社交",
    "group": "🛠️ 常用与生活", // ✅ 新增 group 字段
    "icon": "Service",
    "emoji": "🌐",
    "subCategories": [
      {
        "name": "视频媒体",
        "emoji": "📺",
        "links": [
          { "name": "YouTube", "url": "https://www.youtube.com/", "description": "全球最大视频网站" },
          { "name": "Netflix", "url": "https://www.netflix.com/", "description": "流媒体巨头" },
          { "name": "Bilibili", "url": "https://www.bilibili.com/", "description": "国内最大的二次元与知识社区" },
          { "name": "抖音", "url": "https://www.douyin.com/", "description": "短视频平台" },
          { "name": "TikTok", "url": "https://www.tiktok.com/", "description": "抖音国际版" },
          { "name": "快手", "url": "https://www.kuaishou.com/", "description": "短视频社区" },
          { "name": "Netflix", "url": "https://www.netflix.com/", "description": "流媒体巨头" },
          { "name": "Twitch", "url": "https://www.twitch.tv/", "description": "游戏直播平台" },
          { "name": "AcFun", "url": "https://www.acfun.cn/", "description": "A站" },
          { "name": "腾讯视频", "url": "https://v.qq.com/", "description": "腾讯视频" },
          { "name": "爱奇艺", "url": "https://www.iqiyi.com/", "description": "爱奇艺" },
          { "name": "优酷", "url": "https://www.youku.com/", "description": "优酷" },
          { "name": "芒果TV", "url": "https://www.mgtv.com/", "description": "芒果TV" },
          { "name": "搜狐视频", "url": "https://www.sohu.com/", "description": "搜狐视频" },
          { "name": "乐视视频", "url": "https://www.le.com/", "description": "乐视" },
          { "name": "PPTV", "url": "https://www.pptv.com/", "description": "PPTV聚力" },
          { "name": "央视网", "url": "https://www.cctv.com/", "description": "央视官网" },
          { "name": "Rumble", "url": "https://rumble.com/", "description": "视频平台" },
          { "name": "OnlyFans", "url": "https://onlyfans.com/", "description": "订阅制内容平台" }
        ]
      },
      {
        "name": "社交通讯",
        "emoji": "💬",
        "links": [
          { "name": "X (Twitter)", "url": "https://x.com/", "description": "实时资讯与社交" },
          { "name": "Facebook", "url": "https://www.facebook.com/", "description": "全球社交平台" },
          { "name": "Instagram", "url": "https://www.instagram.com/", "description": "图片视频分享" },
          { "name": "WeChat", "url": "https://weixin.qq.com/", "description": "微信网页版" },
          { "name": "QQ", "url": "https://im.qq.com/", "description": "QQ" },
          { "name": "Telegram", "url": "https://web.telegram.org/", "description": "加密通讯软件" },
          { "name": "Discord", "url": "https://discord.com/", "description": "游戏与社群聊天" },
          { "name": "Reddit", "url": "https://www.reddit.com/", "description": "互联网头条与讨论" },
          { "name": "WhatsApp", "url": "https://web.whatsapp.com/", "description": "全球即时通讯" },
          { "name": "Slack", "url": "https://slack.com/", "description": "团队协作平台" },
          { "name": "Signal", "url": "https://signal.org/", "description": "加密通讯软件" },
          { "name": "LinkedIn", "url": "https://www.linkedin.com/", "description": "职场社交" },
          { "name": "知乎", "url": "https://www.zhihu.com/", "description": "中文问答社区" },
          { "name": "小红书", "url": "https://www.xiaohongshu.com/", "description": "生活方式分享" },
          { "name": "微博", "url": "https://weibo.com/", "description": "随时随地发现新鲜事" },
          { "name": "钉钉", "url": "https://www.dingtalk.com/", "description": "企业办公通讯" },
          { "name": "TIM", "url": "https://tim.qq.com/", "description": "轻聊版QQ" },
          { "name": "Skype", "url": "https://www.skype.com/", "description": "视频通话软件" },
          { "name": "LINE", "url": "https://www.line.me/", "description": "通讯软件" },
          { "name": "Tumblr", "url": "https://www.tumblr.com/", "description": "轻博客" },
          { "name": "Mastodon", "url": "https://joinmastodon.org/", "description": "去中心化社交" },
          { "name": "Mattermost", "url": "https://mattermost.com/", "description": "开源协作平台" },
          { "name": "Quora", "url": "https://www.quora.com/", "description": "英文问答社区" },
          { "name": "Hacker News", "url": "https://news.ycombinator.com/", "description": "黑客与创业资讯" },
          { "name": "Vimeo", "url": "https://vimeo.com/", "description": "高清视频分享" },
          { "name": "简书", "url": "https://www.jianshu.com/", "description": "创作社区" },
          { "name": "百度贴吧", "url": "https://tieba.baidu.com/", "description": "全球最大中文社区" },
          { "name": "Beebeep", "url": "https://www.beebeep.net/", "description": "局域网安全通讯" },
          { "name": "IPMsg", "url": "https://ipmsg.org/", "description": "飞鸽传书" }
        ]
      },
      {
        "name": "新闻资讯",
        "emoji": "📰",
        "links": [
          { "name": "今日热榜", "url": "https://tophub.today/", "description": "聚合新闻资讯" },
          { "name": "今日头条", "url": "https://www.toutiao.com/", "description": "新闻推荐引擎" },
          { "name": "腾讯新闻", "url": "https://news.qq.com/", "description": "事实派" },
          { "name": "新浪新闻", "url": "https://news.sina.com.cn/", "description": "全球新闻资讯" },
          { "name": "网易新闻", "url": "https://news.163.com/", "description": "各有态度" },
          { "name": "搜狐新闻", "url": "https://news.sohu.com/", "description": "搜狐新闻" },
          { "name": "凤凰新闻", "url": "https://news.ifeng.com/", "description": "就做不同" },
          { "name": "环球时报", "url": "https://www.globaltimes.cn/", "description": "国际新闻" },
          { "name": "纽约时报", "url": "https://www.nytimes.com/", "description": "The New York Times" },
          { "name": "华尔街日报", "url": "https://www.wsj.com/", "description": "Wall Street Journal" },
          { "name": "华盛顿邮报", "url": "https://www.washingtonpost.com/", "description": "Washington Post" },
          { "name": "洛杉矶时报", "url": "https://www.latimes.com/", "description": "LA Times" },
          { "name": "IT之家", "url": "https://www.ithome.com/", "description": "数码科技资讯" },
          { "name": "新浪看点", "url": "https://www.sina.com.cn/", "description": "新浪看点" },
          { "name": "芝加哥论坛报", "url": "https://www.chicagotribune.com/", "description": "Chicago Tribune" },
          { "name": "波士顿环球报", "url": "https://www.bostonglobe.com/", "description": "Boston Globe" },
          { "name": "36氪", "url": "https://36kr.com/", "description": "科技资讯" },
          { "name": "搜狐IT", "url": "https://it.sohu.com/", "description": "搜狐IT" },
          { "name": "新浪科技", "url": "https://tech.sina.com.cn/", "description": "新浪科技" },
          { "name": "少数派", "url": "https://sspai.com/", "description": "科技资讯" },

        ]
      }
    ]
  },
  {
    "name": "购物",
    "group": "🛠️ 常用与生活", // ✅ 新增 group 字段
    "icon": "ShoppingBag",
    "emoji": "🛒",
    "links": [
      { "name": "淘宝", "url": "https://www.taobao.com/", "description": "综合电商平台" },
      { "name": "京东", "url": "https://www.jd.com/", "description": "自营物流电商" },
      { "name": "天猫", "url": "https://www.tmall.com/", "description": "品质购物" },
      { "name": "拼多多", "url": "https://www.pinduoduo.com/", "description": "社交电商" },
      { "name": "苏宁易购", "url": "https://www.suning.com/", "description": "家电数码" },
      { "name": "国美在线", "url": "https://www.gome.com.cn/", "description": "国美电器" },
      { "name": "当当网", "url": "https://www.dangdang.com/", "description": "图书音像" },
      { "name": "1688", "url": "https://www.1688.com/", "description": "阿里巴巴批发网" },
      { "name": "Amazon", "url": "https://www.amazon.com/", "description": "全球电商巨头" },
      { "name": "eBay", "url": "https://www.ebay.com/", "description": "全球拍卖购物" },
      { "name": "AliExpress", "url": "https://www.aliexpress.com/", "description": "全球速卖通" },
      { "name": "Wish", "url": "https://www.wish.com/", "description": "跨境电商" },
      { "name": "Shopee", "url": "https://www.shopee.com/", "description": "东南亚电商" },
      { "name": "Lazada", "url": "https://www.lazada.com/", "description": "东南亚电商" }
    ]
  }
];