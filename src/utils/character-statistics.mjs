const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'grapheme'}):null;
export function countText(input){
 const text=String(input),points=Array.from(text),lines=text?text.split(/\r\n|\r|\n/):[];
 let graphemes=0,emojis=0;
 for(const part of segmenter?segmenter.segment(text):points.map(segment=>({segment}))){graphemes++;if(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u20e3]/u.test(part.segment))emojis++;}
 return {graphemes,codePoints:points.length,utf16:text.length,nonWhitespace:points.filter(c=>!/^\s$/u.test(c)).length,han:(text.match(/\p{Script=Han}/gu)||[]).length,words:(text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[]).length,digits:(text.match(/[0-9]/g)||[]).length,punctuation:(text.match(/\p{P}/gu)||[]).length,whitespace:(text.match(/\s/gu)||[]).length,lines:lines.length,nonEmptyLines:lines.filter(l=>l.trim()).length,paragraphs:text.replace(/\r\n|\r/g,'\n').split(/\n\s*\n/).filter(p=>p.trim()).length,bytes:new TextEncoder().encode(text).length,emojis,graphemeSupported:!!segmenter};
}
