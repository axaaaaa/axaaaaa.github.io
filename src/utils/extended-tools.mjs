import { lookupCitizenRegion } from './citizen-id-region.mjs';
export async function compareLines(before, after, ignoreWhitespace = false) {
  if (before.length + after.length > 200000 || before.split('\n').length + after.split('\n').length > 4000) throw Error('请将两段文本合计控制在 20 万字符、4000 行以内');
  const { diffLines } = await import('diff');
  const parts = diffLines(before.replace(/\r\n|\r/g, '\n'), after.replace(/\r\n|\r/g, '\n'), { ignoreWhitespace, timeout: 1000, maxEditLength: 2000 });
  if (!parts) throw Error('差异过多或计算超时，请缩小对比范围');
  let oldLine = 1, newLine = 1, added = 0, removed = 0;
  const rows = [];
  for (const part of parts) {
    if (!part.value) continue;
    const values = part.value.split('\n'); if (part.value.endsWith('\n')) values.pop();
    const kind = part.added ? 'added' : part.removed ? 'removed' : 'same';
    for (let i=0;i<values.length;i++) {
      const text = values[i];
      rows.push({ kind, text, oldLine: part.added ? null : oldLine++, newLine: part.removed ? null : newLine++, noNewline: i===values.length-1&&!part.value.endsWith('\n') });
      if(part.added)added++;if(part.removed)removed++;
    }
  }
  return { rows, added, removed };
}
function toBase64(value) { const bytes = new TextEncoder().encode(value); let binary = ''; for (let i=0;i<bytes.length;i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768)); return btoa(binary); }
function fromBase64(value, url) {
  let text = value.replace(/\s/g, '');
  if (url) text = text.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1 || (text.includes('=') && text.length % 4 !== 0)) throw Error('Base64 字符或补位格式有误');
  text = text.padEnd(Math.ceil(text.length/4)*4,'=');
  const binary = atob(text), bytes = Uint8Array.from(binary, c=>c.charCodeAt(0));
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
export function transformEncoding(input, mode, decode = false) {
  if (input.length > 2*1024*1024) throw Error('请将文本控制在约 200 万字符以内');
  if (mode === 'url-component') return decode ? decodeURIComponent(input) : encodeURIComponent(input);
  if (mode === 'url') return decode ? decodeURI(input) : encodeURI(input);
  if (mode === 'base64' || mode === 'base64url') { if (decode) return fromBase64(input,mode==='base64url'); const result=toBase64(input); return mode==='base64url'?result.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):result; }
  if (mode === 'unicode') { if (!decode) return JSON.stringify(input).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')); const value=JSON.parse(input);if(typeof value!=='string')throw Error('请输入带双引号的 JSON 字符串');return value; }
  throw Error('请选择编码方式');
}
const PROVINCES = {11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江',31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北',43:'湖南',44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏',61:'陕西',62:'甘肃',63:'青海',64:'宁夏',65:'新疆'};
export function validateCitizenId(input, today = new Date()) {
  const id=String(input).trim().toUpperCase();
  if(!/^\d{17}[\dX]$/.test(id))return {valid:false,checks:[{label:'18 位结构',ok:false,detail:'请输入 17 位数字和末位数字或 X；本工具不处理旧 15 位号码'}]};
  const province=PROVINCES[id.slice(0,2)]||'';
  const year=Number(id.slice(6,10)),month=Number(id.slice(10,12)),day=Number(id.slice(12,14));
  const leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  const dateNumber=year*10000+month*100+day,todayNumber=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
  const dateValid=year>=1&&month>=1&&month<=12&&day>=1&&day<=days[month-1]&&dateNumber<=todayNumber;
  const weights=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
  const sum=weights.reduce((value,w,i)=>value+Number(id[i])*w,0),checksum='10X98765432'[sum%11]===id[17];
  const checks=[{label:'18 位结构',ok:true,detail:'位数与字符格式符合要求'},{label:'省级前缀',ok:!!province,detail:province?province+'（仅校验前两位，未核验县级及历史区划）':'省级前缀不在当前内地地区表内'},{label:'出生日期',ok:dateValid,detail:dateValid?'日期有效且不晚于当前日期':'日期不存在或晚于当前日期'},{label:'MOD 11-2 校验码',ok:checksum,detail:checksum?'末位校验码匹配':'末位校验码不匹配'}];
  return {valid:checks.every(c=>c.ok),checks,masked:id.slice(0,3)+'***********'+id.slice(-4),province,region:lookupCitizenRegion(id.slice(0,6))};
}
