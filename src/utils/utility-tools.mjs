export function textStats(text) {
  return { characters: Array.from(text).length, nonWhitespace: Array.from(text.replace(/\s/g, '')).length, lines: text ? text.split(/\r\n|\r|\n/).length : 0, bytes: new TextEncoder().encode(text).length };
}
export function processText(text, action, options = {}) {
  const lines = text.replace(/\r\n|\r/g, '\n').split('\n');
  switch (action) {
    case 'dedupe': return [...new Set(lines)].join('\n');
    case 'sort': return lines.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true })).join('\n');
    case 'reverse-sort': return lines.sort((a, b) => b.localeCompare(a, 'zh-CN', { numeric: true })).join('\n');
    case 'no-empty': return lines.filter(line => line.trim()).join('\n');
    case 'trim-lines': return lines.map(line => line.trim()).join('\n');
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'replace': if (!options.find) throw Error('请先填写要查找的文字'); return text.split(options.find).join(options.replacement || '');
    default: return text;
  }
}
function locateJsonError(text) {
  let i = 0;
  const fail = () => { throw { position: i }; };
  const whitespace = () => { while (i < text.length && /[\x20\t\r\n]/.test(text[i])) i++; };
  function string() {
    if (text[i++] !== '"') fail();
    while (i < text.length) {
      const char = text[i++];
      if (char === '"') return;
      if (char.charCodeAt(0) < 32) { i--; fail(); }
      if (char === '\\') {
        if (text[i] === 'u') { i++; if (!/^[a-f\d]{4}$/i.test(text.slice(i, i + 4))) fail(); i += 4; }
        else { if (i >= text.length || !'"\\/bfnrt'.includes(text[i])) fail(); i++; }
      }
    }
    fail();
  }
  function value(depth = 0) {
    if (depth > 512) fail(); whitespace();
    if (text[i] === '"') return string();
    if (text[i] === '{') {
      i++; whitespace(); if (text[i] === '}') { i++; return; }
      for (;;) { whitespace(); if (text[i] !== '"') fail(); string(); whitespace(); if (text[i] !== ':') fail(); i++; value(depth + 1); whitespace(); if (text[i] === '}') { i++; return; } if (text[i] !== ',') fail(); i++; }
    }
    if (text[i] === '[') {
      i++; whitespace(); if (text[i] === ']') { i++; return; }
      for (;;) { value(depth + 1); whitespace(); if (text[i] === ']') { i++; return; } if (text[i] !== ',') fail(); i++; }
    }
    const match = text.slice(i).match(/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
    if (!match) fail(); i += match[0].length;
  }
  try { value(); whitespace(); if (i !== text.length) fail(); } catch (error) { return error.position ?? i; }
  return i;
}
export function formatJson(text, compact = false, indent = 2) {
  if (text.length > 2 * 1024 * 1024) return { error: 'JSON 文本过大，请缩小到约 200 万字符以内再处理' };
  try { JSON.parse(text); } catch (error) {
    const position = error.message.match(/position\s+(\d+)/i);
    const offset = position ? Number(position[1]) : locateJsonError(text);
    const before = offset === null ? null : text.slice(0, offset);
    return { error: error.message, line: before === null ? null : before.split('\n').length, column: before === null ? null : before.length - before.lastIndexOf('\n') };
  }
  // Token formatting preserves large numeric literals and duplicate object keys.
  const tokens = text.match(/"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g) || [];
  if (compact) return { text: tokens.join('') };
  let depth = 0, result = '';
  const unit = indent === 'tab' ? '\t' : ' '.repeat(indent === 4 ? 4 : 2);
  let scanDepth = 0, estimatedSize = 0;
  for (const token of tokens) {
    if (token === '{' || token === '[') scanDepth++;
    if (token === '}' || token === ']') scanDepth--;
    estimatedSize += token.length + 2 + scanDepth * unit.length;
    if (scanDepth > 256 || estimatedSize > 8 * 1024 * 1024) return { error: '格式化结果过大或嵌套过深，请压缩或缩小片段后处理' };
  }
  const newline = () => '\n' + unit.repeat(depth);
  tokens.forEach((token, i) => {
    if (token === '{' || token === '[') { result += token; depth++; if (tokens[i + 1] !== '}' && tokens[i + 1] !== ']') result += newline(); }
    else if (token === '}' || token === ']') { depth--; if (tokens[i - 1] !== '{' && tokens[i - 1] !== '[') result += newline(); result += token; }
    else if (token === ',') result += ',' + newline();
    else if (token === ':') result += ': ';
    else result += token;
  });
  return { text: result };
}
export function buildJsonTree(text) {
  const validated = formatJson(text, true);
  if (validated.error) return { error: validated.error };
  const tokens = validated.text.match(/"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g) || [];
  let cursor = 0, count = 0;
  function node(label, depth) {
    if (++count > 1000 || depth > 64) throw Error('树形视图最多展示 1000 个节点、64 层；仍可使用格式化与压缩');
    const id = count, token = tokens[cursor++];
    if (token !== '{' && token !== '[') return { id, label, value: token };
    const object = token === '{', close = object ? '}' : ']', children = [];
    while (tokens[cursor] !== close) {
      const childLabel = object ? JSON.parse(tokens[cursor++]) : '[' + children.length + ']';
      if (object) cursor++;
      children.push(node(childLabel, depth + 1));
      if (tokens[cursor] === ',') cursor++;
    }
    cursor++;
    return { id, label, value: object ? 'Object' : 'Array', children };
  }
  try { return { node: node('根节点', 0) }; } catch (error) { return { error: error.message }; }
}
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const power = Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / 1024 ** power).toFixed(2) + ' ' + ['B', 'KiB', 'MiB', 'GiB'][power];
}
export const unitGroups = {
  storage: { label: '文件大小', units: { B: 1, bit: 0.125, kB: 1000, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 } },
  speed: { label: '网速', units: { 'bit/s': 1, 'kbit/s': 1000, 'Mbit/s': 1e6, 'Gbit/s': 1e9, 'B/s': 8, 'kB/s': 8000, 'MB/s': 8e6, 'MiB/s': 8388608 } },
  length: { label: '长度', units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.344 } },
  weight: { label: '重量', units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 } },
  temperature: { label: '温度', units: { '°C': 1, '°F': 1, K: 1 } }
};
export function convertUnits(input, group, from, to) {
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(String(input).trim())) return { error: '请输入有效数字（支持科学计数法）' };
  const value = Number(input), units = unitGroups[group]?.units;
  if (!Number.isFinite(value) || !units || !(from in units) || !(to in units)) return { error: '数字超出范围或单位不匹配' };
  let output;
  if (group === 'temperature') {
    const celsius = from === 'K' ? value - 273.15 : from === '°F' ? (value - 32) * 5 / 9 : value;
    if (celsius < -273.150000001) return { error: '温度低于绝对零度' };
    output = to === 'K' ? celsius + 273.15 : to === '°F' ? celsius * 9 / 5 + 32 : celsius;
  } else { if (value < 0) return { error: '此类数量应大于或等于 0' }; output = value * units[from] / units[to]; }
  return Number.isFinite(output) ? { value: Math.abs(output) < 1e-12 && group === 'temperature' ? 0 : output } : { error: '换算结果超出数值范围' };
}
export function displayNumber(value) { return value !== 0 && (Math.abs(value) < 1e-6 || Math.abs(value) >= 1e15) ? value.toExponential(10) : value.toLocaleString('zh-CN', { maximumSignificantDigits: 15 }); }
