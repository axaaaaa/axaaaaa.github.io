export function greetingForHour(hour) {
  if (hour < 5) return { text: '夜深了', note: '别忘了休息，明天再继续探索。', icon: '☾' };
  if (hour < 11) return { text: '早上好', note: '新的一天，从发现一点美好开始。', icon: '☀' };
  if (hour < 14) return { text: '中午好', note: '稍作休息，为下午蓄一点能量。', icon: '☀' };
  if (hour < 18) return { text: '下午好', note: '保持好奇，去往心之所向。', icon: '◈' };
  if (hour < 23) return { text: '晚上好', note: '放慢节奏，留一点时间给自己。', icon: '☾' };
  return { text: '夜深了', note: '别忘了休息，明天再继续探索。', icon: '☾' };
}
