// 导入 pinyin-pro 库
import { pinyin } from 'pinyin-pro';

// 拼音缓存（模块级别，所有调用共享）
const pinyinCache = {
  initials: new Map(),  // 首字母缓存
  full: new Map()       // 完整拼音缓存
};

/**
 * 获取字符串的拼音首字母（带缓存）
 * @param {string} str 输入字符串
 * @returns {string} 返回拼音首字母字符串
 */
export function getPinyinInitials(str) {
  if (!str) return '';
  
  // 检查缓存
  if (pinyinCache.initials.has(str)) {
    return pinyinCache.initials.get(str);
  }
  
  // 计算并存入缓存
  const result = pinyin(str, { pattern: 'first', toneType: 'none' }).replace(/\s/g, '');
  pinyinCache.initials.set(str, result);
  return result;
}

/**
 * 获取字符串的完整拼音（不带声调，带缓存）
 * @param {string} str 输入字符串
 * @returns {string} 返回完整拼音字符串
 */
export function getFullPinyin(str) {
  if (!str) return '';
  
  // 检查缓存
  if (pinyinCache.full.has(str)) {
    return pinyinCache.full.get(str);
  }
  
  // 计算并存入缓存
  const result = pinyin(str, { pattern: 'pinyin', toneType: 'none' }).replace(/\s/g, '').toLowerCase();
  pinyinCache.full.set(str, result);
  return result;
}

/**
 * 检查拼音是否匹配
 * @param {string} chineseText 中文文本
 * @param {string} query 搜索词
 * @returns {boolean} 是否匹配
 */
export function matchPinyin(chineseText, query) {
  if (!chineseText || !query) return false;
  
  const lowerQuery = query.toLowerCase();
  
  // 拼音首字母匹配（使用缓存版本）
  const initials = getPinyinInitials(chineseText).toLowerCase();
  if (initials.includes(lowerQuery)) {
    return true;
  }
  
  // 完整拼音匹配（使用缓存版本）
  const fullPinyin = getFullPinyin(chineseText);
  if (fullPinyin.includes(lowerQuery)) {
    return true;
  }
  
  return false;
}
