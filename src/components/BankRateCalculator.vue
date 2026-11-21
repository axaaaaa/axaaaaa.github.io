<template>
<section class="br-panel" aria-labelledby="bank-rate-title">
  <header class="br-head">
    <div>
      <h3 id="bank-rate-title">🏦 银行存款利率计算器</h3>
      <p>按各行人民币整存整取挂牌利率估算到期利息<span v-if="updatedAt"> · 数据更新 {{updatedAt}}</span></p>
    </div>
    <span class="br-count" v-if="banks.length">{{banks.length}} 家银行</span>
  </header>

  <div v-if="error" class="br-empty">利率数据加载失败。<button type="button" @click="load">重试</button></div>
  <div v-else-if="!banks.length" class="br-empty">正在加载银行利率…</div>

  <template v-else>
    <div class="br-form">
      <label class="br-field">
        <span>存款本金（元）</span>
        <input type="number" min="0" step="1000" v-model.number="principal" inputmode="decimal" aria-label="存款本金">
        <div class="br-chips">
          <button v-for="p in presets" :key="p" type="button" :class="{active:principal===p}" @click="principal=p">{{money(p,0)}}</button>
        </div>
      </label>

      <label class="br-field">
        <span>银行</span>
        <select v-model="bankName" aria-label="选择银行">
          <optgroup v-for="group in groups" :key="group" :label="group">
            <option v-for="b in banks.filter(x=>x.group===group)" :key="b.name" :value="b.name">{{b.name}}</option>
          </optgroup>
        </select>
      </label>

      <label class="br-field">
        <span>存期</span>
        <select v-model="tenorKey" aria-label="选择存期">
          <option v-for="t in tenors" :key="t.key" :value="t.key">{{t.label}}</option>
        </select>
      </label>

      <label class="br-field">
        <span>年利率（%）<button v-if="customRate!==null" type="button" class="br-reset" @click="customRate=null">用挂牌值</button></span>
        <input type="number" min="0" step="0.01" v-model.number="rateInput" aria-label="年利率百分比">
      </label>
    </div>

    <div class="br-result" role="status" aria-live="polite">
      <div class="br-result-head">
        <img v-if="bank?.logo" class="br-logo" :class="{wide:bank.wide}" :src="logoSrc(bank)" :alt="bank.name">
        <span class="br-bank-name">{{bank?.name}}</span>
        <span class="br-group-tag" v-if="bank?.group">{{bank.group}}</span>
      </div>
      <div class="br-line">
        <span class="br-amount">{{money(interest)}}</span>
        <small>到期利息</small>
      </div>
      <div class="br-meta">
        <span>本息合计 <b>{{money(total)}}</b></span>
        <span>满期利率 <b>{{rate.toFixed(2)}}%</b></span>
        <span>持有 <b>{{yearsLabel}}</b></span>
        <span>月均利息 <b>{{money(monthly)}}</b></span>
      </div>
      <p class="br-formula">{{money(principal,0)}} × {{rate.toFixed(2)}}% × {{years}} 年 = {{money(interest)}}（单利，到期一次性支取）</p>
    </div>

    <div class="br-table-wrap">
      <table class="br-table">
        <caption class="br-caption">{{tenorLabel}}期 · 按本金 {{money(principal,0)}} 计算，点行可切换银行</caption>
        <thead><tr><th>银行</th><th>类型</th><th class="num">{{tenorLabel}}利率</th><th class="num">到期利息</th></tr></thead>
        <tbody>
          <tr v-for="(row,index) in ranking" :key="row.name" :class="{active:row.name===bankName,best:index===0}" tabindex="0" @click="bankName=row.name" @keydown.enter.prevent="bankName=row.name" @keydown.space.prevent="bankName=row.name">
            <td><span class="br-cell"><img v-if="row.logo" class="br-row-logo" :class="{wide:row.wide}" :src="logoSrc(row)" :alt="row.name" loading="lazy">{{row.name}}</span><span v-if="index===0" class="br-tag">最高</span></td>
            <td class="br-group">{{row.group}}</td>
            <td class="num">{{row.rate.toFixed(2)}}%</td>
            <td class="num">{{money(row.interest)}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="br-note">
      <span>{{notice}}</span>
      <span>利息税已暂停征收，计算未扣税；提前支取通常按活期计息。</span>
    </footer>
  </template>
</section>
</template>
<script>
export default {
  name: 'BankRateCalculator',
  data: () => ({ data: null, error: false, principal: 100000, bankName: '工商银行', tenorKey: 'y1', customRate: null, presets: [10000, 100000, 500000, 1000000] }),
  computed: {
    banks() { return this.data?.banks || []; },
    tenors() { return this.data?.tenors || []; },
    updatedAt() { return this.data?.updatedAt || ''; },
    notice() { return this.data?.notice || ''; },
    groups() { return [...new Set(this.banks.map(b => b.group))]; },
    tenor() { return this.tenors.find(t => t.key === this.tenorKey) || { key: 'y1', label: '1 年', years: 1 }; },
    tenorLabel() { return this.tenor.label; },
    years() { return this.tenor.years; },
    yearsLabel() { return this.tenor.hint || `${this.years} 年`; },
    bank() { return this.banks.find(b => b.name === this.bankName) || this.banks[0]; },
    listedRate() { return Number(this.bank?.rates?.[this.tenorKey]) || 0; },
    rateInput: {
      get() { return this.customRate === null ? this.listedRate : this.customRate; },
      set(value) { const n = Number(value); this.customRate = Number.isFinite(n) ? n : 0; }
    },
    rate() { return this.customRate === null ? this.listedRate : Number(this.customRate) || 0; },
    principalSafe() { const n = Number(this.principal); return Number.isFinite(n) && n > 0 ? n : 0; },
    interest() { return this.principalSafe * (this.rate / 100) * this.years; },
    total() { return this.principalSafe + this.interest; },
    monthly() { return this.years > 0 ? this.interest / (this.years * 12) : 0; },
    ranking() {
      return this.banks
        .map(b => { const rate = Number(b.rates?.[this.tenorKey]) || 0; return { name: b.name, group: b.group, logo: b.logo || '', wide: !!b.wide, rate, interest: this.principalSafe * (rate / 100) * this.years }; })
        .sort((a, b) => b.rate - a.rate || b.interest - a.interest);
    }
  },
  watch: {
    bankName() { this.customRate = null; },
    tenorKey() { this.customRate = null; }
  },
  mounted() { this.load(); },
  methods: {
    logoSrc(bank) { return bank?.logo ? `${process.env.BASE_URL}${bank.logo}` : ''; },
    money(value, digits = 2) {
      const n = Number(value);
      if (!Number.isFinite(n)) return '0';
      return n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    },
    async load() {
      this.error = false;
      try {
        const response = await fetch(`${process.env.BASE_URL}bank-rates.json`, { cache: 'no-cache' });
        if (!response.ok) throw Error('request failed');
        const data = await response.json();
        if (!Array.isArray(data?.banks) || !Array.isArray(data?.tenors) || !data.banks.length) throw Error('invalid data');
        this.data = data;
        if (!this.banks.some(b => b.name === this.bankName)) this.bankName = this.banks[0].name;
      } catch { this.error = true; }
    }
  }
};
</script>
<style scoped>
.br-panel{color:var(--m-text,#26364c)}
.br-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin:0 0 14px}
.br-head h3{margin:0;font-size:14px;line-height:1.7}
.br-head p{margin:4px 0 0;font-size:11px;color:var(--m-muted,#7b8799);line-height:1.6}
.br-count{font-size:10px;color:var(--m-muted,#7b8799);border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:999px;padding:4px 9px;white-space:nowrap}
.br-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.br-field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:11px;color:var(--m-muted,#7b8799)}
.br-field>span{display:flex;justify-content:space-between;align-items:center;gap:6px}
.br-field input,.br-field select{width:100%;box-sizing:border-box;border:1px solid var(--m-line,rgba(105,128,160,.15));background:rgba(127,145,171,.05);color:var(--m-text,#26364c);border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;font-variant-numeric:tabular-nums}
.br-field input:focus-visible,.br-field select:focus-visible{outline:2px solid #43898d;outline-offset:1px}
.br-reset{border:0;background:transparent;color:#43898d;font:inherit;font-size:10px;cursor:pointer;padding:0}
.br-chips{display:flex;gap:4px;flex-wrap:wrap}
.br-chips button{border:1px solid var(--m-line,rgba(105,128,160,.15));background:transparent;color:var(--m-muted,#7b8799);border-radius:6px;padding:3px 7px;font:inherit;font-size:10px;cursor:pointer}
.br-chips button.active{background:rgba(66,143,143,.12);color:#43898d;border-color:rgba(66,143,143,.35)}
.br-result{margin:14px 0 16px;border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:12px;padding:14px 16px;background:rgba(66,143,143,.05)}
.br-result-head{display:flex;align-items:center;gap:8px;margin:0 0 8px;flex-wrap:wrap}
.br-logo{width:22px;height:22px;object-fit:contain;background:#fff;border-radius:5px;padding:1px;box-sizing:border-box;box-shadow:0 0 0 1px var(--m-line,rgba(105,128,160,.15))}
.br-logo.wide{width:auto;max-width:72px;height:20px;padding:2px 4px}
.br-bank-name{font-size:12px;font-weight:600}
.br-group-tag{font-size:10px;color:var(--m-muted,#7b8799);border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:999px;padding:2px 7px}
.br-cell{display:inline-flex;align-items:center;gap:7px;vertical-align:middle}
.br-row-logo{width:18px;height:18px;object-fit:contain;background:#fff;border-radius:4px;padding:1px;box-sizing:border-box;box-shadow:0 0 0 1px var(--m-line,rgba(105,128,160,.12))}
.br-row-logo.wide{width:auto;max-width:46px;height:15px;padding:2px 3px}
.br-line{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.br-amount{font-size:26px;font-weight:650;color:#43898d;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.br-line small{font-size:11px;color:var(--m-muted,#7b8799)}
.br-meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin:8px 0 0;font-size:11px;color:var(--m-muted,#7b8799)}
.br-meta b{color:var(--m-text,#26364c);font-weight:600;font-variant-numeric:tabular-nums}
.br-formula{margin:8px 0 0;font-size:10px;color:var(--m-muted,#7b8799);line-height:1.6}
.br-table-wrap{overflow-x:auto;border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:10px}
.br-table{width:100%;border-collapse:collapse;font-size:12px;min-width:420px}
.br-caption{caption-side:top;text-align:left;font-size:10px;color:var(--m-muted,#7b8799);padding:8px 12px;background:rgba(127,145,171,.06);border-bottom:1px solid var(--m-line,rgba(105,128,160,.15))}
.br-table th{font-size:10px;font-weight:500;color:var(--m-muted,#7b8799);text-align:left;padding:8px 12px;background:rgba(127,145,171,.06)}
.br-table td{padding:7px 12px;border-top:1px solid var(--m-line,rgba(105,128,160,.15))}
.br-table .num{text-align:right;font-variant-numeric:tabular-nums}
.br-table tbody tr{cursor:pointer}
.br-table tbody tr:hover{background:rgba(127,145,171,.05)}
.br-table tbody tr.active{background:rgba(66,143,143,.09);box-shadow:inset 2px 0 0 #43898d}
.br-table tbody tr.best td:last-child{color:#d75c60;font-weight:600}
.br-group{color:var(--m-muted,#7b8799);font-size:10px}
.br-tag{margin-left:5px;font-size:9px;color:#d75c60;border:1px solid rgba(215,92,96,.4);border-radius:4px;padding:1px 4px}
.br-note{display:flex;flex-direction:column;gap:3px;margin:10px 0 0;font-size:10px;color:var(--m-muted,#7b8799);line-height:1.6}
.br-empty{padding:18px;text-align:center;font-size:12px;color:var(--m-muted,#7b8799)}
.br-empty button{margin-left:6px;border:0;background:transparent;color:#43898d;font:inherit;font-size:12px;cursor:pointer;text-decoration:underline}
@media(max-width:700px){.br-amount{font-size:22px}.br-form{grid-template-columns:repeat(2,minmax(0,1fr))}.br-table{min-width:360px}}
@media(max-width:520px){.br-table{min-width:0}.br-table th:nth-child(2),.br-table td:nth-child(2){display:none}.br-table th,.br-table td{padding:7px 9px}.br-row-logo{width:16px;height:16px}.br-row-logo.wide{max-width:38px;height:13px}}
</style>
