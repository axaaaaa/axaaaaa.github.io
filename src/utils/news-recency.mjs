// 资讯条目时间识别：判断新闻是否在最近两天内发布
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 解析常见发布时间文本，返回毫秒时间戳；无法识别时返回 null
function parseNewsTime(text, now) {
  if (typeof text !== 'string') return null;
  const value = text.trim();
  if (!value) return null;
  if (/刚刚/.test(value)) return now;
  let match = value.match(/(\d+)\s*(秒|分钟|分|小时|时|天)前/);
  if (match) {
    const size = { 秒: 1000, 分钟: MINUTE, 分: MINUTE, 小时: HOUR, 时: HOUR, 天: DAY }[match[2]];
    return now - Number(match[1]) * size;
  }
  if (/前天/.test(value)) return now - 2 * DAY;
  if (/昨天/.test(value)) {
    const clock = value.match(/昨天\s*(\d{1,2}):(\d{1,2})/);
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    if (clock) date.setHours(Number(clock[1]), Number(clock[2]), 0, 0);
    return date.getTime();
  }
  if (/今天/.test(value)) {
    const clock = value.match(/今天\s*(\d{1,2}):(\d{1,2})/);
    const date = new Date(now);
    if (clock) date.setHours(Number(clock[1]), Number(clock[2]), 0, 0);
    return date.getTime();
  }
  match = value.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?(?:[ T]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0)).getTime();
  }
  match = value.match(/(?:^|\D)(\d{1,2})[-/](\d{1,2})(?:[ T]+(\d{1,2}):(\d{1,2}))?/);
  if (match) {
    const date = new Date(now);
    date.setMonth(Number(match[1]) - 1, Number(match[2]));
    date.setHours(Number(match[3] || 0), Number(match[4] || 0), 0, 0);
    if (date.getTime() > now + DAY) date.setFullYear(date.getFullYear() - 1);
    return date.getTime();
  }
  return null;
}

// 发布时间在最近两天内的新闻需要标红展示
export function isRecentNews(text, now = Date.now()) {
  const stamp = parseNewsTime(text, now);
  if (stamp === null) return false;
  const diff = now - stamp;
  return diff >= -HOUR && diff <= 2 * DAY;
}
