import {holidaySchedules} from '../data/china-holidays.mjs';
const pad=n=>String(n).padStart(2,'0');
export function chinaDateISO(date=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function chineseDay(day) {
  if(day===10)return '初十';if(day===20)return '二十';if(day===30)return '三十';
  return ['初','十','廿'][Math.floor(day/10)]+'一二三四五六七八九'[day%10-1];
}
const lunarFormatter=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
export function lunarForISO(iso) {
  const parts=lunarFormatter.formatToParts(new Date(iso+'T04:00:00Z'));
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  const month=get('month'),day=Number(get('day')),dayText=chineseDay(day);
  return {month,day,dayText,year:get('yearName')||get('relatedYear'),short:day===1?month:dayText,label:`${get('yearName')||get('relatedYear')}年${month}${dayText}`};
}
export function dayStatus(iso) {
  const schedule=holidaySchedules[Number(iso.slice(0,4))];
  if(schedule?.workdays.includes(iso))return {type:'work',label:'调休上班',badge:'班'};
  const holiday=schedule?.holidays.find(h=>iso>=h.start&&iso<=h.end);
  if(holiday)return {type:'holiday',label:`${holiday.name}放假`,badge:'休',name:holiday.name};
  const weekday=new Date(iso+'T04:00:00Z').getUTCDay();
  return {type:weekday===0||weekday===6?'weekend':'normal',label:weekday===0||weekday===6?'普通周末':'普通日期',badge:''};
}
export function monthDays(year,month) {
  const first=new Date(Date.UTC(year,month-1,1));
  const offset=(first.getUTCDay()+6)%7;
  return Array.from({length:42},(_,i)=>{const d=new Date(Date.UTC(year,month-1,1-offset+i));const iso=`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;return {iso,day:d.getUTCDate(),inMonth:d.getUTCMonth()+1===month,lunar:lunarForISO(iso),status:dayStatus(iso)};});
}
