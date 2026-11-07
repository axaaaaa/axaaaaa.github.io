export const worldCities=[{name:'北京',flag:'cn',country:'中国',zone:'Asia/Shanghai'},{name:'东京',flag:'jp',country:'日本',zone:'Asia/Tokyo'},{name:'新加坡',flag:'sg',country:'新加坡',zone:'Asia/Singapore'},{name:'迪拜',flag:'ae',country:'阿联酋',zone:'Asia/Dubai'},{name:'伦敦',flag:'gb',country:'英国',zone:'Europe/London'},{name:'巴黎',flag:'fr',country:'法国',zone:'Europe/Paris'},{name:'纽约',flag:'us',country:'美国',zone:'America/New_York'},{name:'洛杉矶',flag:'us',country:'美国',zone:'America/Los_Angeles'},{name:'悉尼',flag:'au',country:'澳大利亚',zone:'Australia/Sydney'},{name:'UTC',zone:'UTC'}];
const formatters=new Map();
export function worldClock(date,zone,hour12=false){
 const key=zone+hour12;let f=formatters.get(key);if(!f){f=new Intl.DateTimeFormat('zh-CN',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12,timeZoneName:'shortOffset'});formatters.set(key,f);}
 const parts=f.formatToParts(date);const get=t=>parts.find(p=>p.type===t)?.value||'';
 const numericHour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',hourCycle:'h23'}).format(date));
 return {time:`${get('dayPeriod')}${get('hour')}:${get('minute')}:${get('second')}`,date:`${get('year')}-${get('month')}-${get('day')} ${get('weekday')}`,offset:get('timeZoneName'),daytime:numericHour>=7&&numericHour<19};
}
