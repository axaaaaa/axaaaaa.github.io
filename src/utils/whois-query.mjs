export function normalizeWhoisInput(input){
 let value=String(input).trim();if(!value||value.length>2048)throw Error('请输入域名、IPv4 或 IPv6 地址');
 if(/^https?:\/\//i.test(value)){const url=new URL(value);if(url.username||url.password)throw Error('请只输入域名或 IP 地址');value=url.hostname;}
 value=value.replace(/^\[|\]$/g,'').replace(/\.$/,'');
 if(/^\d+(?:\.\d+){3}$/.test(value)){if(value.split('.').some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255||(p.length>1&&p[0]==='0')))throw Error('IPv4 地址格式不正确');return {type:'ip',value};}
 if(value.includes(':')){try{const url=new URL(`http://[${value}]/`);return {type:'ip',value:url.hostname.slice(1,-1)};}catch{throw Error('IPv6 地址格式不正确');}}
 let domain;try{domain=new URL('https://'+value).hostname;}catch{throw Error('域名格式不正确');}
 if(/[\s/@?#\\:]/.test(value)||domain.length>253||!domain.includes('.')||!domain.split('.').every(p=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(p))||/^\d+$/.test(domain.split('.').pop()))throw Error('请输入完整域名，例如 example.com');
 return {type:'domain',value:domain.toLowerCase()};
}
export function summarizeRdap(data){
 if(!data||typeof data!=='object'||data.errorCode)throw Error('登记信息返回异常');
 const registrar=(data.entities||[]).find(e=>e.roles?.includes('registrar'));
 const name=(registrar?.vcardArray?.[1]||[]).find(v=>v[0]==='fn')?.[3]||registrar?.handle||'未公开';
 const rows=[['查询对象',data.unicodeName||data.ldhName||data.name||data.handle||'—'],['对象类型',data.objectClassName||'—']];
 if(data.objectClassName==='domain'){rows.push(['注册服务商',String(name)],['域名状态',(data.status||[]).join('、')||'未公开'],['DNS 服务器',(data.nameservers||[]).map(n=>n.ldhName||n.unicodeName).filter(Boolean).join('\n')||'未公开'],['DNSSEC',data.secureDNS?.delegationSigned===true?'已签名':data.secureDNS?.delegationSigned===false?'未签名':'未公开']);}
 if(data.objectClassName==='ip network')rows.push(['地址范围',`${data.startAddress||'—'} — ${data.endAddress||'—'}`],['IP 版本',data.ipVersion||'—'],['登记国家/地区',data.country||'未公开']);
 const labels={registration:'注册日期',expiration:'到期日期','last changed':'最近变更','last update of RDAP database':'数据库更新'};
 for(const event of data.events||[]){if(labels[event.eventAction])rows.push([labels[event.eventAction],event.eventDate||'未公开']);}
 return rows;
}
