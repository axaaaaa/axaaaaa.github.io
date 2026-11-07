export const VISIT_SCRIPT = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
export function canCountVisits(hostname) {
 const host=String(hostname||'').toLowerCase().replace(/\.$/,'');
 return Boolean(host.includes('.') && !host.includes(':') && !/^\d+(?:\.\d+){3}$/.test(host) && host!=='localhost' && !/\.(localhost|local|test|invalid)$/.test(host));
}
export function formatVisitCount(value) {
 const text=String(value??'').trim();
 if(!/^\d+$/.test(text))return null;
 return text.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');
}
// One provider request per page lifetime, including component remounts.
export function createVisitCounter(env=globalThis) {
 let request;
 return function loadVisitCount() {
  if(request)return request;
  request=new Promise((resolve,reject)=>{
   const target=env.document.getElementById('busuanzi_value_site_pv');
   if(!target){reject(new Error('Counter target missing'));return;}
   let observer,timer,script,finished=false;
   const finish=(value,error)=>{if(finished)return;finished=true;observer?.disconnect();env.clearTimeout(timer);if(script)script.onerror=null;if(error)reject(error);else resolve(value);};
   const read=()=>{const value=formatVisitCount(target.textContent);if(value!==null)finish(value);};
   observer=new env.MutationObserver(read);observer.observe(target,{childList:true,subtree:true,characterData:true});
   timer=env.setTimeout(()=>finish(null,new Error('Counter request timed out')),12000);
   read();if(finished)return;
   script=env.document.createElement('script');script.id='navx-visit-counter-script';script.async=true;script.src=VISIT_SCRIPT;script.referrerPolicy='no-referrer-when-downgrade';script.onerror=()=>finish(null,new Error('Counter service unavailable'));env.document.head.appendChild(script);
  });
  return request;
 };
}
export const loadVisitCount=createVisitCounter();
