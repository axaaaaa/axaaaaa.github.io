export const MAX_AGE = 18 * 60 * 60 * 1000;

// 单次请求超时：status.json 约 200KB，国内访问 github.io 冷启动可能很慢，
// 原来组件里写死的 8 秒太紧，经常直接被 abort，结果整页都是「未检测」。
export const FETCH_TIMEOUT = 25000;
const CACHE_KEY = 'navx:site-status:v1';

export function isLocalUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
      /^(127|10)\./.test(host) || /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^169\.254\./.test(host) ||
      host === '::1' || host === '::' || /^(fc|fd)[0-9a-f]{2}:/.test(host) || /^fe[89ab][0-9a-f]:/.test(host);
  } catch { return false; }
}

export function describeStatus(url, sites, now = Date.now()) {
  if (isLocalUrl(url)) return { state: 'private', label: '内网地址', time: '不参与公网检测' };
  const record = sites && sites[url];
  const stamp = Date.parse(record?.checkedAt);
  if (!record || !Number.isFinite(stamp) || stamp > now + 300000) {
    return { state: 'unknown', label: '未检测', time: '暂无检测记录' };
  }
  const minutes = Math.max(0, Math.floor((now - stamp) / 60000));
  const age = minutes < 1 ? '刚刚' : minutes < 60 ? minutes + ' 分钟前' :
    minutes < 1440 ? Math.floor(minutes / 60) + ' 小时前' : Math.floor(minutes / 1440) + ' 天前';
  const labels = { reachable: '可访问', restricted: '访问受限', unreachable: '疑似异常',
    retrying: '待复检', private: '内网目标', skipped: '未检测' };
  const stale = now - stamp > MAX_AGE;
  return { state: stale ? 'stale' : (labels[record.status] ? record.status : 'unknown'),
    label: stale ? '待更新' : (labels[record.status] || '未检测'),
    time: age + '检测', checkedAt: new Date(stamp).toLocaleString('zh-CN') };
}

function isValid(data) {
  return !!data && data.schemaVersion === 1 && data.sites &&
    typeof data.sites === 'object' && !Array.isArray(data.sites);
}

/** 读上次成功的结果，让页面在请求失败时也有东西可显示 */
export function readCachedStatus() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed.sites : {};
  } catch { return {}; }
}

export function writeCachedStatus(data) {
  try {
    if (isValid(data)) localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* 隐私模式或超额，忽略 */ }
}

function withTimeout(promise, ms, signal) {
  if (!ms || ms <= 0) return promise;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DOMException('status fetch timeout', 'TimeoutError')), ms);
    const onAbort = () => { clearTimeout(timer); reject(new DOMException('aborted', 'AbortError')); };
    if (signal) {
      if (signal.aborted) { clearTimeout(timer); reject(new DOMException('aborted', 'AbortError')); return; }
      signal.addEventListener('abort', onAbort, { once: true });
    }
    promise.then(
      (v) => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); resolve(v); },
      (e) => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); reject(e); }
    );
  });
}

/**
 * 从多个候选地址依次尝试拉取巡检结果。
 *
 * 为什么要多个：status.json 不由 webpack 产出，而是 GitHub Actions 跑出来的，
 * 只在 Pages 的 _site 里。Cloudflare Pages 这类"直接托管 dist/"的平台没有这个文件，
 * 而且它们通常配了 SPA fallback —— 访问 /status.json 会 **200 返回 index.html**。
 * 旧代码只看 response.ok，于是去 JSON.parse 一段 HTML，直接崩掉，
 * 最后静默返回 {}，整页变成「未检测」。
 *
 * 所以这里：先按顺序试每个源（含 Content-Type 校验），全挂了再回退本地缓存。
 */
export async function loadSiteStatusAny(sources, options = {}) {
  const list = (Array.isArray(sources) ? sources : [sources]).filter(Boolean);
  const errors = [];
  for (const url of list) {
    try {
      const sites = await loadSiteStatus(url, { ...options, retries: 0 });
      if (sites && Object.keys(sites).length) return { sites, source: url };
      errors.push(`${url} -> 空结果`);
    } catch (error) {
      errors.push(`${url} -> ${error?.message || error}`);
    }
  }
  const cached = readCachedStatus();
  console.warn('[site-status] 全部候选地址都失败：\n  ' + errors.join('\n  '));
  options.onError?.(errors);
  return { sites: cached, source: null, errors };
}

/**
 * 拉取单个地址的巡检结果。
 * 拿不到时回退到本地缓存，实在没有才返回 {}。
 * onError 会收到失败原因，方便排查（原来是静默吞掉，页面只会显示「未检测」）。
 */
export async function loadSiteStatus(url, { signal, fetcher = fetch, timeout = FETCH_TIMEOUT, retries = 1, onError } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        fetcher(url, { signal, cache: 'no-cache', credentials: 'omit' }),
        timeout, signal
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // SPA fallback 会把缺失的文件以 200 + text/html 返回，必须挡掉
      const contentType = response.headers?.get?.('content-type') || '';
      if (contentType && !/json/i.test(contentType)) {
        throw new Error(`响应不是 JSON（${contentType}），多半是托管平台的 SPA 回退页`);
      }
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('响应体不是合法 JSON');
      }
      if (!isValid(data)) throw new Error('status.json 结构不符合预期');
      writeCachedStatus(data);
      return data.sites;
    } catch (error) {
      lastError = error;
      if (error?.name === 'AbortError' && signal?.aborted) break; // 组件卸载，别再试
    }
  }
  const cached = readCachedStatus();
  console.warn('[site-status] 拉取失败，回退到本地缓存:', lastError?.message || lastError);
  onError?.(lastError);
  return cached;
}
