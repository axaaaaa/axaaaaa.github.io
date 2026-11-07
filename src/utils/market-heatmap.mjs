// Area-preserving binary treemap. Currency conversion happens in the collector.
export function marketTreemap(items,width,height,basis='cap') {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return [];
 const nodes=items.filter(i=>i&&i.kind!=='index').map(item=>({item,weight:basis==='equal'?1:item.marketCapUsd})).filter(n=>Number.isFinite(n.weight)&&n.weight>0).sort((a,b)=>b.weight-a.weight||a.item.symbol.localeCompare(b.item.symbol));
 const result=[];
 function split(list,x,y,w,h){
  if(!list.length)return;
  if(list.length===1){result.push({...list[0],x,y,width:w,height:h});return;}
  const total=list.reduce((s,n)=>s+n.weight,0);let sum=0,index=0;
  while(index<list.length-1){const next=sum+list[index].weight;if(index>0&&Math.abs(sum-total/2)<Math.abs(next-total/2))break;sum=next;index++;if(sum>=total/2)break;}
  index=Math.max(1,index);const ratio=sum/total;
  if(w>=h){const cut=w*ratio;split(list.slice(0,index),x,y,cut,h);split(list.slice(index),x+cut,y,w-cut,h);}
  else{const cut=h*ratio;split(list.slice(0,index),x,y,w,cut);split(list.slice(index),x,y+cut,w,h-cut);}
 }
 split(nodes,0,0,width,height);return result;
}
export function heatColor(change,redUp=true,dark=false){
 if(!Number.isFinite(change)||change===0)return dark?'#46594e':'#697c71';
 const red=(change>0)===redUp;const strength=Math.min(Math.abs(change)/8,1);const light=dark?25+strength*13:31+strength*13;
 return `hsl(${red?354:151} 65% ${light}%)`;
}
