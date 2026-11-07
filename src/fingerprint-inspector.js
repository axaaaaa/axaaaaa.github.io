const unsupported='未提供 / 不支持';
async function digest(value){const bytes=new TextEncoder().encode(value);if(!window.crypto?.subtle)return 'SHA-256 不可用（请使用 localhost 或 HTTPS）';return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');}
function canvasSample(){try{const c=document.createElement('canvas');c.width=360;c.height=90;const x=c.getContext('2d');if(!x)return unsupported;x.fillStyle='#142e42';x.fillRect(0,0,360,90);x.font='19px Arial';x.fillStyle='#66e1bc';x.fillText('Fingerprint Lab 浏览器 🌐',12,35);x.globalCompositeOperation='multiply';x.fillStyle='#f9b963';x.beginPath();x.arc(250,45,30,0,Math.PI*2);x.fill();return c.toDataURL();}catch{return '读取受限';}}
function webgl(){try{const g=document.createElement('canvas').getContext('webgl');if(!g)return {状态:unsupported};const d=g.getExtension('WEBGL_debug_renderer_info');return {厂商:d?g.getParameter(d.UNMASKED_VENDOR_WEBGL):g.getParameter(g.VENDOR),渲染器:d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER),版本:g.getParameter(g.VERSION),'着色语言':g.getParameter(g.SHADING_LANGUAGE_VERSION),'最大纹理尺寸':g.getParameter(g.MAX_TEXTURE_SIZE),'扩展列表':(g.getSupportedExtensions()||[]).sort().join(', ')};}catch{return {状态:'读取受限'};}}

// Keep UA-derived versions labelled: some browsers reduce their UA version.
export async function browserDetails(n = navigator) {
  const ua = n.userAgent || ''
  const candidates = [
    ['Microsoft Edge', /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/],
    ['Opera', /(?:OPR|OPiOS)\/([\d.]+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
    ['Google Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/]
  ]
  const detected = candidates.find(([, pattern]) => pattern.test(ua))
  const details = {
    浏览器名称: detected ? detected[0] : unsupported,
    浏览器版本: detected ? ua.match(detected[1])[1] : unsupported,
    版本来源: detected ? 'User Agent（版本可能经过简化）' : unsupported,
    系统名称: n.userAgentData?.platform || n.platform || unsupported,
    '系统版本（平台报告值）': unsupported,
    CPU架构: unsupported,
    架构位数: unsupported,
    设备型号: unsupported,
    '32位浏览器运行于64位Windows': unsupported,
    完整版本列表: unsupported
  }
  try {
    if (typeof n.userAgentData?.getHighEntropyValues !== 'function') return details
    const values = await n.userAgentData.getHighEntropyValues([
      'fullVersionList', 'platformVersion', 'architecture', 'bitness', 'model', 'wow64'
    ])
    const versions = (Array.isArray(values.fullVersionList) ? values.fullVersionList : [])
      .filter(item => item && typeof item.brand === 'string' && typeof item.version === 'string' && item.version)
    // Select the matching product; never assume the first item is a real browser brand.
    const product = versions.find(item => item.brand === details.浏览器名称)
    if (product) {
      details.浏览器版本 = product.version
      details.版本来源 = 'User-Agent Client Hints（完整版本）'
    }
    details.完整版本列表 = versions.map(item => `${item.brand} ${item.version}`).join(', ') || unsupported
    details.系统名称 = values.platform || details.系统名称
    details['系统版本（平台报告值）'] = values.platformVersion || unsupported
    details.CPU架构 = values.architecture || unsupported
    details.架构位数 = values.bitness ? `${values.bitness} 位` : unsupported
    details.设备型号 = values.model || unsupported
    details['32位浏览器运行于64位Windows'] = typeof values.wow64 === 'boolean' ? values.wow64 : unsupported
  } catch {
    // Preserve UA information when detailed hints are not returned.
  }
  return details
}

export async function collectFingerprint(){const n=navigator,s=screen,c=n.connection;let hints={};try{if(n.userAgentData)hints={品牌:n.userAgentData.brands.map(b=>b.brand+' '+b.version).join(', '),移动设备:n.userAgentData.mobile,平台提示:n.userAgentData.platform};}catch{ /* optional client hints unavailable */ }const canvas=canvasSample();return {'浏览器与系统':{'User Agent':n.userAgent,平台:n.platform||unsupported,语言:n.language,语言列表:(n.languages||[]).join(', '),Cookie:n.cookieEnabled,在线状态:n.onLine,自动化标记:n.webdriver,'Do Not Track':n.doNotTrack??unsupported,...hints},'浏览器详细版本':await browserDetails(n),'屏幕与显示':{屏幕尺寸:`${s.width} × ${s.height}`,可用区域:`${s.availWidth} × ${s.availHeight}`,窗口视口:`${innerWidth} × ${innerHeight}`,像素比:devicePixelRatio,色深:s.colorDepth,像素深度:s.pixelDepth,屏幕方向:s.orientation?.type??unsupported,配色偏好:matchMedia('(prefers-color-scheme: dark)').matches?'深色':'浅色',减少动画:matchMedia('(prefers-reduced-motion: reduce)').matches,'HDR 查询':matchMedia('(dynamic-range: high)').matches},'硬件与能力':{逻辑处理器:n.hardwareConcurrency??unsupported,'设备内存（近似 GB）':n.deviceMemory??unsupported,最大触摸点:n.maxTouchPoints,触摸事件:'ontouchstart' in window,PDF查看器:n.pdfViewerEnabled??unsupported,WebAssembly:typeof WebAssembly!=='undefined',WebRTC:typeof RTCPeerConnection!=='undefined',安全上下文:isSecureContext},'区域与网络提示':{时区:Intl.DateTimeFormat().resolvedOptions().timeZone,'UTC 偏移（分钟）':new Date().getTimezoneOffset(),数字格式示例:new Intl.NumberFormat().format(1234567.89),连接类型:c?.effectiveType??unsupported,'下行估计 Mbps':c?.downlink??unsupported,'往返估计 ms':c?.rtt??unsupported,节省流量:c?.saveData??unsupported},'Canvas 指纹':{'Canvas SHA-256':canvas.startsWith('data:')?await digest(canvas):canvas,绘制样本:'360 × 90 · 文字 / 图形 / 混合模式'},'WebGL 渲染':webgl()};}

export async function inspectFingerprint() {
  const data = await collectFingerprint()
  const fingerprint = await digest(JSON.stringify(data))
  const count = Object.values(data).reduce((sum, fields) => sum + Object.keys(fields).length, 0)
  return { fingerprint, data, count }
}
