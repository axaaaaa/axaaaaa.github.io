import data from '../data/citizen-id-regions.mjs';
// Reference mapping only: newer and historical citizen ID address codes may be absent.
export function lookupCitizenRegion(code) {
  const addressCode=String(code);
  if(!/^\d{6}$/.test(addressCode))return null;
  const exact=data.regions[addressCode];
  const parts=exact||data.regions[addressCode.slice(0,4)]||data.regions[addressCode.slice(0,2)]||[];
  return {addressCode,province:parts[0]||'',city:parts[1]||'',district:exact?.[2]||'',label:[...new Set(parts)].join(' / '),matched:!!exact,asOf:data.asOf};
}
