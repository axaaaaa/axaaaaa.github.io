const physics='https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power';
const ac='https://openstax.org/books/university-physics-volume-2/pages/15-4-power-in-an-ac-circuit';
const safety='https://ehs.mit.edu/workplace-safety-program/electrical-safety/';
export const electricityEntries=[
 ['基础概念','电压','V','两点之间的电势差，不等于实际流过设备的电流。',physics],
 ['基础概念','电流','A','单位时间通过的电荷量；用电设备在相应工作条件下取用电流。',physics],
 ['基础概念','电阻','Ω','描述对电流的阻碍；欧姆定律适用于相应条件下的欧姆元件，不概括所有器件。',physics],
 ['基础概念','串联与并联','电路','串联支路电流相同；并联支路两端电压相同。实际连接还受器件额定值限制。',physics],
 ['交直流','直流 DC','DC','电流方向不周期反转，大小仍可变化；电脑适配器输出通常为直流。',ac],
 ['交直流','交流 AC','AC','电流方向周期变化；交流铭牌常标有效值，不是瞬时峰值。',ac],
 ['交直流','有效值与峰值','RMS','正弦波的峰值为有效值×√2；该比例不适用于任意波形。',ac],
 ['交直流','功率因数','PF','有功功率与视在功率之比；通常为 0 到 1。畸变负载的功率因数不只由相位差决定。',ac],
 ['功率与电量','功率与电量不同','W / kWh','功率表示能量转换快慢，电量表示累计能量；恒定 1000W 使用 1 小时为 1kWh。',physics],
 ['功率与电量','有功与视在功率','W / VA','单相交流：视在功率 S=Vrms×Irms，有功功率 P=S×PF。两者单位和用途不同。',ac],
 ['功率与电量','额定功率与实际功耗','铭牌','额定值描述指定条件下的能力或工作值，实际用电随负载变化；电费估算宜使用实测平均功率。',physics],
 ['电脑供电','电源额定输出与插座输入','效率','电脑电源的额定直流输出不等于插座耗电。效率 η=P输出/P输入；效率会随负载和工作条件变化。',physics],
 ['电脑供电','适配器电压、电流与极性','匹配','核对设备厂商要求的电压、协议、极性和插头。电流容量是供给能力，不代表设备始终按该数值取电。',physics],
 ['电脑供电','USB-C 外形不代表协议','USB PD','同样的接口外形可能有不同的数据、视频与供电能力；以设备、充电器和线缆规格共同支持为准。', 'https://www.usb.org/usb-charger-pd'],
 ['用电常识','过载、短路与漏电','不同异常','过载是超过回路承载能力，短路形成异常低阻路径，漏电涉及非预期电流路径；保护功能不能互相简单替代。',safety],
 ['用电常识','保护接地与中性线','PE / N','接地保护与正常回路导体用途不同；不要自行混接，不依据线色单独判断是否安全。固定布线交合格人员处理。',safety],
 ['用电常识','插线板与延长线','负载','遵守产品额定值，不串接插线板；插头松动、发热、破损或焦味时停止使用并安排检查。',safety],
 ['用电常识','跳闸与潮湿环境','异常处理','跳闸后先查明原因，不反复强行合闸；湿手、潮湿环境与破损线缆增加风险，市电检测维修交合格人员。',safety]
].map(([category,title,unit,text,source],i)=>({id:'electric-'+i,category,title,unit,text,source}));
function num(value,label,{positive=false,max=1e12}={}){if(String(value).trim()===''||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>max||(positive&&Number(value)===0))throw Error(label+'请填写'+(positive?'大于 0':'不小于 0')+'的有效数值');return Number(value);}
export function calculateOhm(target,a,b){try{let value,unit;if(target==='voltage'){value=num(a,'电流')*num(b,'电阻',{positive:true});unit='V';}else if(target==='current'){value=num(a,'电压')/num(b,'电阻',{positive:true});unit='A';}else if(target==='resistance'){value=num(a,'电压')/num(b,'电流',{positive:true});unit='Ω';}else throw Error('请选择计算目标');if(!Number.isFinite(value))throw Error('结果超出范围');return {value,unit};}catch(e){return {error:e.message};}}
export function calculateEnergy(watts,hours,days,price){try{const w=num(watts,'平均功率'),h=num(hours,'每天小时',{max:24}),d=num(days,'天数',{max:36600}),p=num(price,'单价',{max:10000});const energy=w/1000*h*d;return {energy,cost:energy*p};}catch(e){return {error:e.message};}}
export function calculateAC(voltage,current,pf){try{const v=num(voltage,'有效值电压',{positive:true}),i=num(current,'有效值电流'),factor=num(pf,'功率因数',{max:1});return {apparent:v*i,active:v*i*factor};}catch(e){return {error:e.message};}}
