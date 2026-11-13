// The three pilot cards keep their original, locally scoped themes.
export const securitySourceIds = ['pojie52', 'kanxue', 'xz', 'anquanke', 'freebuf', 'thehackernews', 'projectzero', 'unit42', 'unknowncheats', 'vendor_security', 'securelist', 'checkpoint', 'sentinellabs', 'elastic', 'eset', 'microsoft', 'seebug', 'cisa_kev', 'cncert', 'github_advisory', 'cve_program', 'crowdstrike'];

const groups = {
  bbs: ['v2ex', 'tieba', 'csdn', 'oschina'],
  personal: ['hackernews', 'ruanyifeng'],
  arcade: ['bilibili', 'weibo'],
  ticker: ['toutiao', 'qq'],
  wire: ['ap', 'nhk', 'aljazeera', 'x-global'],
  swiss: ['bbc', 'globaltimes', 'uisdc'],
  archive: ['nytimes', 'guardian', 'x-articles'],
  ledger: ['wsj', 'yicai', 'sinafinance', 'woshipm', 'fng', 'eastmoney'],
  notes: ['sspai', 'juejin', 'qbitai', 'arxiv'],
  tickets: ['ijingyi_new', 'maoyan'],
  industrial: ['dongchedi', 'autohome', 'pcauto'],
  bento: ['zcool'],
  aero: ['geekpark'],
  aqua: ['netease'],
  winamp: ['x-hot'],
  palm: ['hellogithub'],
  gameboy: ['gamersky'],
  lcd: ['baidu'],
  library: ['douban'],
  win95: [...securitySourceIds, 'x-events']
};

const themes = new Map(Object.entries(groups).flatMap(([theme, ids]) => ids.map(id => [id, theme])));

export function sourceCardTheme(id, dark) {
  return dark ? undefined : themes.get(id);
}
