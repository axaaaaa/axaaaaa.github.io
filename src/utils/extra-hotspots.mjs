let pending=null,latest=null,loadedAt=0;
export async function loadExtraHotspots(force=false){
 if(!force&&latest&&Date.now()-loadedAt<60000)return latest;
 if(pending)return pending;
 pending=(async()=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(`${process.env.BASE_URL}extra-hotspots.json`,{cache:'no-cache',signal:controller.signal});if(!r.ok)throw Error('sources request failed');const data=await r.json();if(!data?.sources||typeof data.sources!=='object')throw Error('invalid sources');latest=data;loadedAt=Date.now();try{localStorage.setItem('extra-hotspots-v1',JSON.stringify(data));}catch{/* optional cache */}return data;}finally{clearTimeout(timeout);}})();
 try{return await pending;}finally{pending=null;}
}
export function cachedExtraHotspots(){try{return JSON.parse(localStorage.getItem('extra-hotspots-v1'));}catch{return null;}}
