<template>
<div class="mr-wrap">
  <section v-for="group in groups" :key="group.key" class="mr-block">
    <header class="mr-head">
      <h4>{{group.title}}</h4>
      <small>{{group.hint}}</small>
    </header>
    <ol v-if="group.rows.length" class="mr-list">
      <li v-for="(row,index) in group.rows" :key="row.item.symbol">
        <a :href="row.item.url" target="_blank" rel="noopener noreferrer" class="mr-row" :title="`${row.item.nameZh||row.item.name} ${price(row.item)} ${row.item.kind==='index'?'点':(row.item.currency||'')} · ${signed(row.item.changePercent)}%`">
          <span class="mr-rank">{{index+1}}</span>
          <img v-if="logo(row.item)" class="mr-logo" :src="logo(row.item)" :alt="row.item.ticker" loading="lazy">
          <span class="mr-name">{{row.item.nameZh||row.item.name}}<small>{{row.item.ticker||row.item.symbol}}<template v-if="group.mixed"> · {{row.item.category}}</template></small></span>
          <span class="mr-pct" :class="dir(row.item)">{{signed(row.item.changePercent)}}%</span>
        </a>
      </li>
    </ol>
    <p v-else class="mr-empty">暂无可用行情</p>
  </section>
  <p class="mr-note">按最近一次采集的涨跌幅排序，休市期间价格与涨跌保持上一交易日的收盘值；涨跌以数据源前收价为基准。</p>
</div>
</template>
<script>
export default {
  name: 'MarketRanking',
  props: { items: { type: Array, default: () => [] }, redUp: { type: Boolean, default: true } },
  computed: {
    listed() { return this.items.filter(i => Number.isFinite(i.changePercent)); },
    mixed() { return new Set(this.listed.map(i => i.category)).size > 1; },
    groups() {
      const byPct = [...this.listed];
      const gainers = [...byPct].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      const losers = [...byPct].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
      const movers = [...byPct].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5);
      return [
        { key: 'gainers', title: '涨幅榜', hint: '涨幅由高到低', rows: gainers.map(item => ({ item })), mixed: this.mixed },
        { key: 'losers', title: '跌幅榜', hint: '跌幅由低到高', rows: losers.map(item => ({ item })), mixed: this.mixed },
        { key: 'movers', title: '波动最大', hint: '涨跌幅绝对值', rows: movers.map(item => ({ item })), mixed: this.mixed }
      ];
    }
  },
  methods: {
    logo(item) { return item.kind === 'crypto' && item.ticker ? `${process.env.BASE_URL}coin-logos/${item.ticker}.svg` : ''; },
    price(item) {
      const n = Math.abs(Number(item.price));
      const digits = item.kind === 'crypto' && n > 0 && n < 10 ? Math.min(12, Math.max(4, 2 - Math.floor(Math.log10(n)))) : 2;
      return Number(item.price).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: digits });
    },
    signed(n) { return `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}`; },
    dir(item) { if (item.changePercent === 0) return 'mr-flat'; return (item.changePercent > 0) === this.redUp ? 'mr-red' : 'mr-green'; }
  }
};
</script>
<style scoped>
.mr-wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px;align-items:start}
.mr-block{border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:11px;overflow:hidden;min-width:0}
.mr-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:9px 11px;background:rgba(127,145,171,.07);border-bottom:1px solid var(--m-line,rgba(105,128,160,.15))}
.mr-head h4{margin:0;font-size:11px;font-weight:600;letter-spacing:.04em}
.mr-head small{font-size:9px;color:var(--m-muted,#7b8799);white-space:nowrap}
.mr-list{list-style:none;margin:0;padding:0}
.mr-list li+li{border-top:1px solid var(--m-line,rgba(105,128,160,.12))}
.mr-row{display:flex;align-items:center;gap:7px;padding:7px 10px;text-decoration:none;color:var(--m-text,#26364c);font-size:11px;min-width:0}
.mr-row:hover{background:rgba(127,145,171,.05)}
.mr-row:focus-visible{outline:2px solid #43898d;outline-offset:-2px}
.mr-rank{flex:none;width:13px;font-size:9px;color:var(--m-muted,#7b8799);font-variant-numeric:tabular-nums}
.mr-logo{flex:none;width:14px;height:14px;border-radius:50%;object-fit:contain;background:rgba(255,255,255,.92)}
.mr-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.5}
.mr-name small{display:block;font-size:9px;color:var(--m-muted,#7b8799);overflow:hidden;text-overflow:ellipsis}
.mr-pct{flex:none;width:56px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.mr-red{color:#d75c60}
.mr-green{color:#30916b}
.mr-flat{color:var(--m-muted,#7b8799)}
.mr-empty{padding:14px 11px;margin:0;font-size:11px;color:var(--m-muted,#7b8799)}
.mr-note{grid-column:1/-1;margin:2px 0 0;font-size:9px;line-height:1.6;color:var(--m-muted,#7b8799)}
@media(max-width:700px){.mr-wrap{grid-template-columns:minmax(0,1fr);gap:9px}.mr-pct{width:52px}}
</style>
