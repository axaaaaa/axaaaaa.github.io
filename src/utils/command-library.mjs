export const categories = ['Windows', 'Linux', 'Anaconda', 'Docker', '路由器', 'Git'];
export function renderCommand(entry, values = {}) {
  let command = entry.command;
  for (const param of entry.params || []) {
    const value = String(values[param.key] ?? param.default).trim();
    const valid = param.type === 'gitref' ? /^[A-Za-z0-9][A-Za-z0-9._/-]{0,100}$/.test(value) && !value.includes('..') && !value.includes('//') && value.split('/').every(part => part && !part.endsWith('.') && !part.endsWith('.lock') && !part.startsWith('.')) && value !== 'HEAD'
      : param.type === 'path' ? value.length > 0 && value.length <= 1024 && !/^[\-]/.test(value) && !/[\x00-\x1f\x7f]/.test(value)
      : param.type === 'integer' ? /^[1-9]\d{0,8}$/.test(value)
      : param.type === 'version' ? /^\d+\.\d+(?:\.\d+)?$/.test(value)
      : param.type === 'port' ? /^\d+$/.test(value) && +value > 0 && +value <= 65535
      : /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,79}$/.test(value);
    if (!valid) return { command: '', error: `${param.label}格式不正确，请按示例填写` };
    if (entry.command.startsWith('conda env remove') && param.key === 'env' && value.toLowerCase() === 'base') return { command: '', error: 'base 是基础环境，请填写其他目标环境' };
    const argument = param.type === 'path'
      ? (entry.shell.includes('PowerShell') ? "'" + value.replaceAll("'", "''") + "'" : "'" + value.replaceAll("'", "'\"'\"'") + "'")
      : value;
    command = command.split(`{{${param.key}}}`).join(argument);
  }
  return { command, error: '' };
}
export function filterCommands(entries, query, category, favoritesOnly, favorites) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry => (!category || entry.category === category)
    && (!favoritesOnly || favorites.includes(entry.id))
    && words.every(word => [entry.title, entry.command, entry.explanation, entry.category, entry.topic, entry.shell, entry.environment, entry.permission, entry.impact].join(' ').toLowerCase().includes(word)));
}
export function readFavorites(storage) {
  try { const value = JSON.parse(storage.getItem('nax-command-favorites') || '[]'); return Array.isArray(value) ? value.filter(x => typeof x === 'string') : []; }
  catch { return []; }
}
