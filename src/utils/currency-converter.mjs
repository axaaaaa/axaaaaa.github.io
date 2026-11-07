export function convertExpense(amount, feePercent, fixedFee, from, to, rates) {
  const values=[amount,feePercent,fixedFee];
  if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0)||feePercent>100||!Number.isFinite(rates[from])||rates[from]<=0||!Number.isFinite(rates[to])||rates[to]<=0) return null;
  const total=amount*(1+feePercent/100)+fixedFee;
  const rate=rates[to]/rates[from];
  const result=total*rate;
  return Number.isFinite(result)?{total,rate,result}:null;
}
