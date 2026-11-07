export function convertWidth(text, toFull = false) {
  return Array.from(text, char => { const code=char.codePointAt(0); if(toFull){if(code===32)return '\u3000';if(code>=33&&code<=126)return String.fromCodePoint(code+0xfee0);}else{if(code===0x3000)return ' ';if(code>=0xff01&&code<=0xff5e)return String.fromCodePoint(code-0xfee0);}return char; }).join('');
}
const invisibleNames = new Map([[0x00a0,'不换行空格'],[0x00ad,'软连字符'],[0x034f,'组合字素连接符'],[0x061c,'阿拉伯字母标记'],[0x180e,'蒙古文元音分隔符'],[0x200b,'零宽空格'],[0x200c,'零宽非连接符'],[0x200d,'零宽连接符（可能用于表情）'],[0x200e,'从左到右标记'],[0x200f,'从右到左标记'],[0x2028,'行分隔符'],[0x2029,'段分隔符'],[0x202a,'从左到右嵌入'],[0x202b,'从右到左嵌入'],[0x202c,'方向格式结束'],[0x202d,'从左到右覆盖'],[0x202e,'从右到左覆盖'],[0x202f,'窄不换行空格'],[0x205f,'中等数学空格'],[0x2060,'词连接符'],[0x2066,'从左到右隔离'],[0x2067,'从右到左隔离'],[0x2068,'首强隔离'],[0x2069,'方向隔离结束'],[0x3000,'全角空格'],[0xfeff,'BOM / 零宽不换行空格']]);
function invisibleName(code) { if(code===9)return '制表符';if(code===10)return '换行 LF';if(code===13)return '回车 CR';if(code<32||(code>=127&&code<=159))return '控制字符';if(code>=0x2000&&code<=0x200a)return '特殊宽度空格';if(code>=0xfe00&&code<=0xfe0f)return '变体选择符（可能影响表情）';if(code>=0xe0100&&code<=0xe01ef)return '补充变体选择符';return invisibleNames.get(code)||(/\p{Default_Ignorable_Code_Point}/u.test(String.fromCodePoint(code))?'默认可忽略格式字符':''); }
export function inspectInvisible(text, includeWhitespace = false) {
  if(text.length>100000)throw Error('请将文本控制在 10 万字符以内');
  const rows=[],counts=new Map();let line=1,column=1,offset=0,total=0,annotated='',lastCR=false;
  for(const char of text){const cp=char.codePointAt(0),name=invisibleName(cp),common=[9,10,13].includes(cp),found=name&&(!common||includeWhitespace),code='U+'+cp.toString(16).toUpperCase().padStart(4,'0');if(found){total++;counts.set(code,(counts.get(code)||0)+1);if(rows.length<300)rows.push({code,name,line,column,offset});annotated+='⟦'+code+' '+name+'⟧';}else annotated+=char;if(cp===13){line++;column=1;lastCR=true;}else if(cp===10){if(!lastCR)line++;column=1;lastCR=false;}else{column++;lastCR=false;}offset+=char.length;}
  return {rows,total,kinds:counts.size,annotated};
}
export function cleanInvisible(text, { keepWhitespace = true, keepEmoji = true } = {}) {
  return Array.from(text).filter(char=>{const code=char.codePointAt(0);return !invisibleName(code)||(keepWhitespace&&[9,10,13].includes(code))||(keepEmoji&&(code===0x200d||(code>=0xfe00&&code<=0xfe0f)||(code>=0xe0100&&code<=0xe01ef)));}).join('');
}
export function richTextToPlain(html, doc = document) {
  if(html.length>1000000)throw Error('富文本内容过大，请缩小到 100 万字符以内');
  const template=doc.createElement('template');template.innerHTML=html;
  let output='';const newline=()=>{if(output&&!output.endsWith('\n'))output+='\n';};
  const skipped=new Set(['SCRIPT','STYLE','TEMPLATE','IFRAME','OBJECT','EMBED','HEAD','SVG','MATH','NOSCRIPT']);
  const blocks=new Set(['P','DIV','SECTION','ARTICLE','HEADER','FOOTER','MAIN','ASIDE','LI','TR','H1','H2','H3','H4','H5','H6','BLOCKQUOTE','PRE','DL','DT','DD','TABLE','UL','OL','FIGURE']);
  const stack=Array.from(template.content.childNodes).reverse().map(node=>({node,pre:false,exit:false}));
  let visited=0;
  while(stack.length){const {node,pre,exit}=stack.pop();if(++visited>100000)throw Error('节点过多，请缩小富文本片段');if(node.nodeType===3){let text=pre?node.nodeValue:node.nodeValue.replace(/\s+/g,' ');if(!pre&&output.endsWith('\n'))text=text.replace(/^ +/,'');output+=text;continue;}if(node.nodeType!==1)continue;const tag=node.tagName.toUpperCase();if(skipped.has(tag))continue;if(exit){if(blocks.has(tag))newline();if(tag==='TD'||tag==='TH')output+='\t';continue;}if(tag==='BR'){output+='\n';continue;}if(tag==='IMG'){const alt=node.getAttribute('alt');if(alt)output+='['+alt+']';continue;}if(blocks.has(tag))newline();stack.push({node,pre,exit:true});for(let i=node.childNodes.length-1;i>=0;i--)stack.push({node:node.childNodes[i],pre:pre||tag==='PRE',exit:false});}
  return output.replace(/[ \t]+\n/g,'\n').replace(/^\n+|\n+$/g,'');
}
const converters = new Map();
export async function convertChinese(text, from='cn', to='tw') {
  if(text.length>20000)throw Error('请将文本控制在 2 万字符以内');
  const key=from+'-'+to;if(!converters.has(key)){const module=await import('opencc-js');const opencc=module.Converter?module:module.default;converters.set(key,opencc.Converter({from,to}));}return converters.get(key)(text);
}
export async function chineseToPinyin(text, { toneType='symbol', initials=false, uppercase=false } = {}) {
  if(text.length>20000)throw Error('请将文本控制在 2 万字符以内');
  const {pinyin}=await import('pinyin-pro');const result=pinyin(text,{type:'array',toneType,pattern:initials?'first':'pinyin',nonZh:'consecutive'}).join(initials?'':' ');return uppercase?result.toUpperCase():result;
}
const passwordGroups={lower:'abcdefghijklmnopqrstuvwxyz',upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',digits:'0123456789',symbols:'!@#$%^&*()-_=+[]{};:,.?'};
function secureIndex(size, source) { if(!source?.getRandomValues)throw Error('当前浏览器未提供安全随机数');const limit=0x100000000-(0x100000000%size),value=new Uint32Array(1);let attempts=0;do{if(++attempts>1024)throw Error('随机源未返回可用值，请重试');source.getRandomValues(value);}while(value[0]>=limit);return value[0]%size; }
export function generatePasswords({length=20,count=1,lower=true,upper=true,digits=true,symbols=true,excludeSimilar=true}={},source=globalThis.crypto) {
  if(!Number.isInteger(length)||length<4||length>128||!Number.isInteger(count)||count<1||count>20)throw Error('长度应为 4–128，数量应为 1–20 的整数');
  const enabled={lower,upper,digits,symbols};const groups=Object.entries(passwordGroups).filter(([key])=>enabled[key]).map(([,value])=>excludeSimilar?value.replace(/[Il1O0o|]/g,''):value);if(!groups.length)throw Error('至少选择一种字符类型');const pool=groups.join(''),result=[];let attempts=0;
  while(result.length<count){if(++attempts>10000)throw Error('随机数生成未完成，请重试');let candidate='';for(let i=0;i<length;i++)candidate+=pool[secureIndex(pool.length,source)];if(groups.every(group=>Array.from(candidate).some(c=>group.includes(c)))&&!result.includes(candidate))result.push(candidate);}
  return result;
}
