// Curated educational connections, not surveyed cable geometry or a live inventory.
const point = (name, lon, lat) => ({ name, lon, lat });
const virginia = point('弗吉尼亚海滩 · 美国', -75.98, 36.85);
const bilbao = point('毕尔巴鄂地区 · 西班牙', -3.0, 43.4);
export const cables = [
 {id:'marea',name:'MAREA',region:'大西洋',color:'#40d9d0',points:[virginia,bilbao],note:'跨大西洋连接美国与西班牙。'},
 {id:'dunant',name:'Dunant',region:'大西洋',color:'#80aaff',points:[virginia,point('圣伊莱尔德里耶 · 法国',-1.95,46.72)],note:'连接美国与法国的跨大西洋系统。'},
 {id:'grace-hopper',name:'Grace Hopper',region:'大西洋',color:'#f5b85b',points:[point('纽约地区 · 美国',-72.87,40.8),point('比尤德 · 英国',-4.55,50.83),bilbao],note:'连接美国、英国和西班牙；图中连线仅表达连接关系。'},
 {id:'equiano',name:'Equiano',region:'非洲沿岸',color:'#f289b4',points:[point('塞辛布拉 · 葡萄牙',-9.1,38.44),point('洛美 · 多哥',1.22,6.13),point('拉各斯 · 尼日利亚',3.4,6.45),point('斯瓦科普蒙德 · 纳米比亚',14.53,-22.68),point('梅尔克博斯斯特兰德 · 南非',18.44,-33.73)],note:'沿非洲西岸连接欧洲与非洲。仅选取部分登陆地区。'},
 {id:'curie',name:'Curie',region:'太平洋',color:'#b4de7d',points:[point('洛杉矶地区 · 美国',-118.4,33.9),point('巴尔博亚 · 巴拿马',-79.57,8.95),point('瓦尔帕莱索 · 智利',-71.63,-33.05)],note:'连接美国、巴拿马和智利；采用教育示意连线。'},
 {id:'ellalink',name:'EllaLink',region:'大西洋',color:'#ba9bff',points:[point('福塔莱萨 · 巴西',-38.54,-3.73),point('锡尼什 · 葡萄牙',-8.87,37.96)],note:'展示南美洲与欧洲之间的直接连接，省略其他分支。'},
 {id:'faster',name:'FASTER',region:'太平洋',color:'#ffd86e',points:[point('俄勒冈州 · 美国',-124.0,43.7),point('千叶地区 · 日本',140.4,35.5),point('三重地区 · 日本',136.8,34.3),point('淡水地区 · 中国台湾',121.4,25.18)],note:'连接美国与东亚；跨越日期变更线时在地图边缘分段绘制。'}
].map(c => ({...c, source:'https://www.submarinecablemap.com/submarine-cable/'+c.id}));
export const project = (lon, lat) => [ (lon+180)*3, (90-lat)*3 ];
export function connectionPaths(points) {
 const paths=[];
 for(let i=1;i<points.length;i++) {
  const a=project(points[i-1].lon,points[i-1].lat), b=project(points[i].lon,points[i].lat);
  if(Math.abs(b[0]-a[0])<=540) paths.push(`M${a} L${b}`);
  else { const adjusted=b[0]>a[0]?b[0]-1080:b[0]+1080; const edge=adjusted<0?0:1080; const y=a[1]+(b[1]-a[1])*(edge-a[0])/(adjusted-a[0]); paths.push(`M${a} L${edge},${y}`,`M${edge===0?1080:0},${y} L${b}`); }
 }
 return paths;
}
export function landPaths(geo) { return geo.features.flatMap(f=> f.geometry.type==='Polygon' ? [f.geometry.coordinates] : f.geometry.type==='MultiPolygon' ? f.geometry.coordinates : []).map(poly=>poly.map(ring=>'M'+ring.map(([lon,lat])=>project(lon,lat).join(',')).join(' L')+' Z').join(' ')); }
export function filterCables(query,region) { const q=query.trim().toLowerCase(); return cables.filter(c=>(!region||c.region===region)&&(`${c.name} ${c.region} ${c.points.map(p=>p.name).join(' ')}`.toLowerCase().includes(q))); }
