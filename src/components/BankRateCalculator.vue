<template>
<section class="br-panel" :class="{'br-dark':dark}" aria-labelledby="bank-rate-title">
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
      </label>

      <div class="br-field">
        <span id="br-bank-label">银行</span>
        <div class="br-picker" :class="{open:bankOpen}">
          <button type="button" class="br-picker-btn" aria-haspopup="listbox" :aria-expanded="bankOpen" aria-labelledby="br-bank-label" @click.stop="bankOpen=!bankOpen" @keydown.esc="bankOpen=false" @keydown.down.prevent="bankOpen=true">
            <img v-if="bank?.logo" class="br-picker-logo" :class="{wide:bank.wide}" :src="logoSrc(bank)" :alt="bank.name">
            <span class="br-picker-name" :title="bank?.name">{{bank?.name || '选择银行'}}</span>
            <span class="br-picker-caret" aria-hidden="true">▾</span>
          </button>
          <div v-if="bankOpen" class="br-picker-panel" role="listbox" aria-labelledby="br-bank-label">
            <div v-for="row in pickerRows" :key="row.key">
              <div v-if="row.type==='group'" class="br-picker-group">{{row.label}}</div>
              <button v-else type="button" role="option" :aria-selected="row.bank.name===bankName" class="br-picker-item" :class="{active:row.bank.name===bankName}" @click="pickBank(row.bank.name)">
                <img v-if="row.bank.logo" class="br-picker-item-logo" :class="{wide:row.bank.wide}" :src="logoSrc(row.bank)" :alt="row.bank.name" loading="lazy">
                <span class="br-picker-item-name">{{row.bank.name}}</span>
                <span class="br-picker-item-rate">{{Number(row.bank.rates?.[tenorKey] || 0).toFixed(2)}}%</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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

      <div class="br-chips" role="group" aria-label="快捷金额">
        <button v-for="p in presets" :key="p" type="button" :class="{active:principal===p}" @click="principal=p">{{money(p,0)}}</button>
      </div>
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

    <details class="br-why">
      <summary>
        <span class="br-why-icon" aria-hidden="true">🏦</span>
        <span class="br-why-title">这笔利息从哪来 · 银行拿你的本金做了什么</span>
        <span class="br-why-tip" aria-hidden="true"></span>
      </summary>
      <div class="br-why-body">
        <p class="br-why-lead">存款在法律上是「银行欠你的钱」：你按约定期限把钱借给银行，到期它还本付息。利息就是这笔借款的租金 —— 银行把你的钱用到收益更高的地方，再把其中一小部分分给你。</p>

        <ol class="br-why-flow">
          <li>
            <b>约 6% 先冻在央行：存款准备金</b>
            <span>每吸收 100 元存款，约 6 元要按加权平均 6.2% 的存款准备金率缴存央行，不能放贷，只拿很低的准备金利息。这是防挤兑的安全垫，不产生利差。</span>
          </li>
          <li>
            <b>大头拿去放贷：银行最主要的收入</b>
            <span>房贷、企业经营贷、消费贷。1 年期 LPR 3.00%、5 年期以上 3.50%，而 3 年期定存成本约 1.25% —— 这个差额叫「净息差」，2026 年三季度全行业只有 1.41%。</span>
          </li>
          <li>
            <b>一部分买债券、做同业</b>
            <span>国债、地方债、金融债、同业存单，收益略高于存款成本、又能随时卖出，用来应付你提前支取。</span>
          </li>
          <li>
            <b>留一点现金和在央行备付</b>
            <span>应付日常取现、转账和跨行清算，这部分同样不赚钱。</span>
          </li>
        </ol>

        <p class="br-why-case">
          按上面的输入算一遍：{{money(principalSafe,0)}} 元存 {{yearsLabel}}，银行付你利息 <b>{{money(interest)}}</b> 元；扣掉准备金后约 {{money(lendable,0)}} 元可用于放贷，按 1 年期 LPR 3.00% 贷出同样期限，毛收入约 <b>{{money(lendIncome)}}</b> 元，毛差价约 <b>{{money(grossSpread)}}</b> 元 —— 这还没扣不良核销、人工网点和税。所以利率给得越高的银行，越要靠收益更高（通常风险也更高）的资产来覆盖成本。
        </p>

        <dl class="br-why-qa">
          <div>
            <dt>为什么定期比活期高这么多</dt>
            <dd>期限溢价：钱锁得越久，银行越敢拿去做长期贷款。1 年期 0.95% 与活期 0.05% 的差距，买的就是「随时能取」这个权利；提前支取按活期计息，等于你把流动性让渡给了银行。</dd>
          </div>
          <div>
            <dt>银行为什么开始压长期利率</dt>
            <dd>定期存款已占存款约 59%，负债成本压不下来息差就撑不住。所以部分银行的 5 年期不再比 3 年期高，长期的「锁死」未必更划算。</dd>
          </div>
          <div>
            <dt>你要承担什么风险</dt>
            <dd>你拿的是合同约定的固定利息，银行放贷赚多少、亏多少都与你无关（这点和买银行股、买理财不同）。存款保险对同一家银行 50 万元以内本息全额偿付，超过就分散到几家。</dd>
          </div>
          <div>
            <dt>挂牌利率不等于到手利率</dt>
            <dd>起存金额、额度、新客专享、线上线下的报价都可能不同，以柜台或 App 实际报价为准。</dd>
          </div>
        </dl>
      </div>
    </details>

    <div class="br-table-wrap">
      <table class="br-table">
        <caption class="br-caption">{{tenorLabel}}期 · 按本金 {{money(principal,0)}} 计算 · 共 {{ranking.length}} 家，表内滚动查看，点行切换银行</caption>
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
  props: { dark: Boolean },
  data: () => ({ data: null, error: false, principal: 100000, bankName: '工商银行', tenorKey: 'y1', customRate: null, bankOpen: false, presets: [10000, 100000, 500000, 1000000] }),
  computed: {
    banks() { return this.data?.banks || []; },
    tenors() { return this.data?.tenors || []; },
    updatedAt() { return this.data?.updatedAt || ''; },
    notice() { return this.data?.notice || ''; },
    groups() { return [...new Set(this.banks.map(b => b.group))]; },
    pickerRows() {
      const rows = [];
      this.groups.forEach(group => {
        rows.push({ type: 'group', key: `g-${group}`, label: group });
        this.banks.filter(b => b.group === group).forEach(b => rows.push({ type: 'bank', key: b.name, bank: b }));
      });
      return rows;
    },
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
    lendable() { return this.principalSafe * 0.938; },
    lendIncome() { return this.lendable * 0.03 * this.years; },
    grossSpread() { return this.lendIncome - this.interest; },
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
  mounted() { this.load(); document.addEventListener('click', this.closePicker); },
  beforeUnmount() { document.removeEventListener('click', this.closePicker); },
  methods: {
    closePicker() { this.bankOpen = false; },
    pickBank(name) { this.bankName = name; this.bankOpen = false; },
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
.br-panel{container-type:inline-size;--br-head-bg:#fafafb;--m-text:#26364c;--m-muted:#7b8799;--m-line:rgba(105,128,160,.15);margin:18px 0 24px;border:1px solid var(--m-line);border-radius:18px;background:rgba(255,255,255,.86);color:var(--m-text);padding:20px 22px 16px;box-sizing:border-box;min-width:0}
.br-dark{--br-head-bg:#0c1310;--m-text:#e2e9f4;--m-muted:#95a3b9;--m-line:rgba(145,164,194,.17);background:linear-gradient(rgba(176,212,186,.015) 1px,transparent 1px),#080f0b;background-size:100% 4px}
.br-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin:0 0 14px}
.br-head h3{margin:0;font-size:14px;line-height:1.7}
.br-head p{margin:4px 0 0;font-size:11px;color:var(--m-muted,#7b8799);line-height:1.6}
.br-count{font-size:10px;color:var(--m-muted,#7b8799);border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:999px;padding:4px 9px;white-space:nowrap}
.br-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:start}
.br-field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:11px;color:var(--m-muted,#7b8799)}
.br-field>span{display:flex;justify-content:space-between;align-items:center;gap:6px}
.br-field input,.br-field select{width:100%;box-sizing:border-box;border:1px solid var(--m-line,rgba(105,128,160,.15));background:rgba(127,145,171,.05);color:var(--m-text,#26364c);border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;font-variant-numeric:tabular-nums}
.br-field input:focus-visible,.br-field select:focus-visible{outline:2px solid #43898d;outline-offset:1px}
.br-reset{border:0;background:transparent;color:#43898d;font:inherit;font-size:10px;cursor:pointer;padding:0}
.br-chips{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}
.br-chips button{flex:1 1 0;min-width:72px;text-align:center;border:1px solid var(--m-line,rgba(105,128,160,.15));background:transparent;color:var(--m-muted,#7b8799);border-radius:6px;padding:5px 8px;font:inherit;font-size:10px;line-height:1.5;cursor:pointer;font-variant-numeric:tabular-nums;white-space:nowrap}
.br-chips button:hover{border-color:rgba(66,143,143,.35);color:#43898d}
.br-chips button.active{background:rgba(66,143,143,.12);color:#43898d;border-color:rgba(66,143,143,.35)}
.br-picker{position:relative}
.br-picker-btn{display:flex;align-items:center;gap:7px;width:100%;box-sizing:border-box;border:1px solid var(--m-line,rgba(105,128,160,.15));background:rgba(127,145,171,.05);color:var(--m-text,#26364c);border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;cursor:pointer;text-align:left}
.br-picker-btn:focus-visible{outline:2px solid #43898d;outline-offset:1px}
.br-picker-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.br-picker-caret{flex:none;color:var(--m-muted,#7b8799);font-size:10px}
.br-picker-logo{width:18px;height:18px;flex:none;object-fit:contain;background:#fff;border-radius:4px;padding:1px;box-sizing:border-box;box-shadow:0 0 0 1px var(--m-line,rgba(105,128,160,.15))}
.br-picker-logo.wide{width:auto;max-width:46px;height:15px;padding:2px 3px}
.br-picker-panel{position:absolute;left:0;top:calc(100% + 4px);min-width:180px;max-width:240px;z-index:40;max-height:250px;overflow-y:auto;border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:10px;background:#fff;box-shadow:0 10px 26px rgba(28,45,64,.14);padding:4px;box-sizing:border-box;scrollbar-width:thin}
.br-dark .br-picker-panel{background:#121a15;box-shadow:0 10px 26px rgba(0,0,0,.5)}
.br-picker-group{font-size:9px;color:var(--m-muted,#7b8799);padding:5px 8px 3px;letter-spacing:.04em}
.br-picker-item{display:flex;align-items:center;gap:7px;width:100%;box-sizing:border-box;border:0;background:transparent;color:var(--m-text,#26364c);font:inherit;font-size:12px;padding:6px 8px;border-radius:6px;cursor:pointer;text-align:left}
.br-picker-item:hover{background:rgba(127,145,171,.08)}
.br-picker-item.active{background:rgba(66,143,143,.12);color:#43898d}
.br-picker-item-logo{width:17px;height:17px;flex:none;object-fit:contain;background:#fff;border-radius:4px;padding:1px;box-sizing:border-box;box-shadow:0 0 0 1px var(--m-line,rgba(105,128,160,.12))}
.br-picker-item-logo.wide{width:auto;max-width:44px;height:14px;padding:2px 3px}
.br-picker-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.br-picker-item-rate{flex:none;font-size:11px;font-variant-numeric:tabular-nums;color:var(--m-muted,#7b8799)}
.br-picker-item.active .br-picker-item-rate{color:#43898d}
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
.br-why{margin:0 0 14px;border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:10px;background:rgba(127,145,171,.035);overflow:hidden}
.br-why>summary{display:flex;align-items:center;gap:7px;padding:9px 12px;font-size:11px;color:var(--m-text,#26364c);cursor:pointer;list-style:none}
.br-why>summary::-webkit-details-marker{display:none}
.br-why>summary::marker{content:''}
.br-why>summary:hover{background:rgba(127,145,171,.06)}
.br-why>summary:focus-visible{outline:2px solid #43898d;outline-offset:-2px}
.br-why-icon{font-size:12px;line-height:1}
.br-why-title{font-weight:600}
.br-why-tip{margin-left:auto;flex:none;font-size:10px;color:#43898d}
.br-why-tip::before{content:'展开'}
.br-why[open] .br-why-tip::before{content:'收起'}
.br-why-body{padding:2px 12px 12px;font-size:11px;color:var(--m-muted,#7b8799);line-height:1.75}
.br-why-lead{margin:0 0 10px;color:var(--m-text,#26364c)}
.br-why-flow{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:7px;counter-reset:brstep}
.br-why-flow li{position:relative;padding-left:22px}
.br-why-flow li::before{counter-increment:brstep;content:counter(brstep);position:absolute;left:0;top:2px;width:15px;height:15px;border-radius:50%;background:rgba(66,143,143,.12);color:#43898d;font-size:9px;line-height:15px;text-align:center;font-weight:600}
.br-why-flow b{display:block;color:var(--m-text,#26364c);font-weight:600}
.br-why-flow span{display:block}
.br-why-case{margin:0 0 10px;padding:8px 10px;border-radius:8px;background:rgba(66,143,143,.06)}
.br-why-case b{color:var(--m-text,#26364c);font-variant-numeric:tabular-nums}
.br-why-qa{display:grid;gap:8px;margin:0}
.br-why-qa dt{margin:0;color:var(--m-text,#26364c);font-weight:600}
.br-why-qa dd{margin:2px 0 0}
.br-table-wrap{max-height:286px;overflow:auto;border:1px solid var(--m-line,rgba(105,128,160,.15));border-radius:10px;scrollbar-width:thin}
.br-table{width:100%;border-collapse:collapse;font-size:12px;min-width:420px}
.br-caption{caption-side:top;text-align:left;font-size:10px;color:var(--m-muted,#7b8799);padding:8px 12px;background:rgba(127,145,171,.06);border-bottom:1px solid var(--m-line,rgba(105,128,160,.15))}
.br-table th{position:sticky;top:0;z-index:1;font-size:10px;font-weight:500;color:var(--m-muted,#7b8799);text-align:left;padding:8px 12px;background:var(--br-head-bg,#fafafb)}
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
@media(max-width:700px){.br-amount{font-size:22px}.br-table{min-width:360px}}
@container (max-width:560px){.br-form{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.br-table{min-width:0}.br-table th:nth-child(2),.br-table td:nth-child(2){display:none}.br-table th,.br-table td{padding:7px 9px}.br-row-logo{width:16px;height:16px}.br-row-logo.wide{max-width:38px;height:13px}.br-why-body{padding:2px 10px 10px}}
</style>
