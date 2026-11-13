export function compareLines(a, b, { ignoreCase = false, trim = false, skipBlank = true, mode = 'both' } = {}) {
  const collect = text => {
    const rows = new Map();
    if (!text) return rows;
    const lines = text.split(/\r\n|\n|\r/);
    if (lines[lines.length - 1] === '') lines.pop();
    for (const line of lines) {
      if (skipBlank && !line.trim()) continue;
      let key = trim ? line.trim() : line;
      if (ignoreCase) key = key.toLowerCase();
      if (!rows.has(key)) rows.set(key, line);
    }
    return rows;
  };
  const left = collect(a);
  const right = collect(b);
  const output = [];
  let shared = 0;
  for (const [key, line] of left) {
    if (right.has(key)) shared++;
    else output.push(line);
  }
  if (mode === 'both') {
    for (const [key, line] of right) {
      if (!left.has(key)) output.push(line);
    }
  }
  return { text: output.join('\n'), shared, count: output.length };
}
