export const regionCenters = {
 北京:[116.4,39.9],天津:[117.2,39.1],河北:[114.5,38.0],山西:[112.5,37.9],内蒙古:[111.7,40.8],辽宁:[123.4,41.8],吉林:[125.3,43.8],黑龙江:[126.6,45.8],上海:[121.5,31.2],江苏:[118.8,32.1],浙江:[120.2,30.3],安徽:[117.3,31.9],福建:[119.3,26.1],江西:[115.9,28.7],山东:[117.0,36.7],河南:[113.6,34.8],湖北:[114.3,30.6],湖南:[113.0,28.2],广东:[113.3,23.1],广西:[108.3,22.8],海南:[110.3,20.0],重庆:[106.6,29.6],四川:[104.1,30.7],贵州:[106.7,26.6],云南:[102.7,25.0],西藏:[91.1,29.7],陕西:[108.9,34.3],甘肃:[103.8,36.1],青海:[101.8,36.6],宁夏:[106.3,38.5],新疆:[87.6,43.8],香港:[114.17,22.3],澳门:[113.54,22.2],台湾:[121.56,25.03]
};
export function groupRadioRegions(stations) {
 return Object.entries(regionCenters).map(([name,coordinates])=>({name,coordinates,count:stations.filter(s=>s.region===name).length})).filter(r=>r.count>0);
}
export function stationForPlayer(stations, candidate) {
 // URL matching preserves preset IDs and the existing player's saved favorites.
 return stations.find(s=>s.url===candidate.url);
}

export function provinceShapes(geo, pathBuilder) {
 return geo.features.map(f => {
  const fullName=f.properties?.name || '';
  const name=Object.keys(regionCenters).sort((a,b)=>b.length-a.length).find(n=>fullName.startsWith(n)) || fullName;
  return {name,fullName,paths:[pathBuilder({features:[f]}).join(' ')],center:f.properties?.centroid || f.properties?.center || regionCenters[name]};
 });
}
