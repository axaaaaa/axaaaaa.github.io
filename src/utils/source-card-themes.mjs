// The three pilot cards keep their original, locally scoped themes.
export const securitySourceIds = ['pojie52', 'kanxue', 'sec_forums', 'vendor_security', 'threat_research', 'nvd'];

const groups = {
  bbs: ['v2ex', 'tieba', 'csdn', 'oschina'],
  personal: ['hackernews'],
  arcade: ['weibo'],
  ticker: ['toutiao'],
  wire: ['x-global'],
  archive: ['x-articles'],
  ledger: ['sinafinance', 'fng', 'eastmoney', 'xueqiu', 'wallstreetcn', 'qq'],
  notes: ['sspai', 'juejin', 'qbitai', '36kr'],
  tickets: ['ijingyi_new'],
  industrial: ['autohome', 'pcauto'],
  aero: ['geekpark'],
  aqua: ['netease'],
  palm: ['hellogithub'],
  lcd: ['baidu'],
  win95: securitySourceIds,
  modern: ['x-events', 'x-hot', 'steam_top', 'design_hub', 'douban', 'dongchedi', 'yicai', 'bilibili', 'short_video', 'video_hot', 'tech_news', 'world_news', 'news-hotspot']
};

const themes = new Map(Object.entries(groups).flatMap(([theme, ids]) => ids.map(id => [id, theme])));

export function sourceCardTheme(id, dark) {
  return dark ? undefined : themes.get(id);
}
