import {bootDisplayNodes,bootDisplayEntries} from './boot-display-diagnostic.mjs';
import {hardwareCases} from './hardware-diagnostic-cases.mjs';
const option=(label,next)=>({label,next});
export const diagnosticNodes={
 start:{title:'请选择最接近的现象',text:'先区分供电、显示、自检和 Windows 阶段。每次只改变一项并记录结果；网页不会检测或操作本机。',options:[option('按开机键完全没反应','power'),option('风扇转，显示器无信号','monitor'),option('主板 Logo 后进入 Windows 黑屏','windows'),option('黑屏但能看到鼠标指针','cursor')]},
 power:{title:'检查外部供电',text:'确认插座和插线板供电、电源线插紧，台式电源背部开关处于 I。笔记本使用匹配的适配器。出现焦味、冒烟或异常发热时断电，停止通电检查。',options:[option('恢复开机或显示','recovered'),option('仍完全没反应','powerInternal')]},
 powerInternal:{title:'核对主机供电与开机接线',text:'先关机并断开电源，再按主板手册核对 24-pin、CPU EPS 供电和机箱 PWR SW 接线。不混用模组电源线，不拆开电源外壳；不熟悉拆装时交给维修人员。',options:[option('恢复开机或显示','recovered'),option('仍无反应，需要进一步检测','service')]},
 monitor:{title:'显示器自身菜单能显示吗？',text:'按显示器菜单键测试 OSD。这一步先判断显示器是否有基本供电与显示响应。',options:[option('能显示菜单','signal'),option('菜单也没有','monitorPower')]},
 monitorPower:{title:'检查显示器供电',text:'核对显示器开关、插座和适配器；使用已知正常且匹配的电源连接测试。',options:[option('菜单恢复，继续检查信号','signal'),option('恢复电脑画面','recovered'),option('仍没有菜单','service')]},
 signal:{title:'核对输入源与显示连接',text:'选择与实际接口一致的 HDMI / DP 输入源，重新连接或换已知正常的显示线、端口。独显优先接独显输出；主板视频接口仅在 CPU 具备核显且平台支持时使用。',options:[option('显示恢复','recovered'),option('仍无信号，检查主板自检灯','led')]},
 led:{title:'哪一个自检灯持续停留？',text:'按 CPU、DRAM、VGA、BOOT 丝印判断，不只看颜色。依次短亮通常是自检流程；内存训练按型号手册等待，不反复强制断电。',options:[option('CPU 灯','cpu'),option('DRAM 灯','dram'),option('VGA 灯','vga'),option('BOOT 灯','boot'),option('无自检灯或看不清','minimal')]},
 cpu:{title:'CPU 初始化阶段排查',text:'断电后核对 CPU 供电和安装，查主板 CPU 支持列表及所需 BIOS 版本。仅凭灯号不判定 CPU 损坏；不要在型号、供电与恢复步骤未确认时盲目刷写固件。',options:[option('显示恢复','recovered'),option('仍停留在 CPU 阶段','service')]},
 dram:{title:'内存初始化阶段排查',text:'新装机或改参数后可能训练较久，按手册等待。断电后重插内存，按推荐插槽用单条测试；使用默认参数排除 XMP / EXPO 影响。恢复固件默认值前记录启动和存储模式及设备加密恢复信息。',options:[option('显示恢复','recovered'),option('单条与默认参数后仍异常','service')]},
 vga:{title:'显示设备初始化阶段排查',text:'断电后核对显卡安装及供电插头。若 CPU 确有核显且平台支持，可按手册使用核显交叉测试；不要把有主板视频接口等同于 CPU 有核显。',options:[option('显示恢复','recovered'),option('仍无显示','service')]},
 boot:{title:'检查启动设备与引导项',text:'BOOT 灯不等于显卡故障；先确认能否显示固件界面。新装机无系统时可能亮灯；检查磁盘识别、启动模式及 Windows Boot Manager，不直接初始化或格式化磁盘。',options:[option('画面已恢复，继续处理系统安装或引导','recovered'),option('仍完全无画面','minimal')]},
 minimal:{title:'按手册进行最小配置排查',text:'断电后仅保留主板、CPU 与散热、单条内存、必要的图形输出和显示器，移除非必要 USB 外设；逐项测试。风扇转动不代表供电与自检正常。',options:[option('显示恢复','recovered'),option('仍无显示，记录配置送检','service')]},
 windows:{title:'尝试恢复图形输出',text:'在 Windows 已加载的前提下，按 Win + Ctrl + Shift + B 重置图形驱动，可能听到提示音或短暂闪屏。检查外接显示器和显示连接；这组快捷键不用于解决开机自检无显示。',options:[option('画面恢复','recovered'),option('仍黑屏，检查安全选项','security')]},
 cursor:{title:'检查任务管理器入口',text:'按 Ctrl + Alt + Delete，观察是否出现安全选项，或按 Ctrl + Shift + Esc 尝试打开任务管理器。',options:[option('任务管理器可以打开','explorer'),option('安全选项和任务管理器均未出现','recovery')]},
 security:{title:'Ctrl + Alt + Delete 有响应吗？',text:'出现安全选项时尝试打开任务管理器；若无响应，转入恢复环境排查。',options:[option('可以打开任务管理器','explorer'),option('仍无响应','recovery')]},
 explorer:{title:'重新启动桌面进程',text:'在任务管理器中找到 Windows 资源管理器并重新启动；若进程不存在，运行新任务 explorer.exe。此操作只针对 Windows 桌面阶段。',options:[option('桌面恢复','recovered'),option('仍黑屏','recovery')]},
 recovery:{title:'进入恢复环境与安全模式',text:'若能打开安全选项，可按住 Shift 选择重启；也可使用系统恢复入口或安装介质的“修复计算机”。在疑难解答 → 高级选项 → 启动设置中进入安全模式。设备加密可能要求恢复密钥；不要在更新或固件写入时强制断电。',options:[option('安全模式能显示','safeMode'),option('恢复环境或安全模式仍无显示','service')]},
 safeMode:{title:'检查近期驱动和更新',text:'先备份重要文件，记录近期变化；按实际时间线检查显卡驱动或更新，优先使用设备厂商提供的驱动与回退途径，一次只改一项，再正常重启验证。',options:[option('正常启动已恢复','recovered'),option('正常模式仍黑屏','service')]},
 recovered:{title:'已记录：画面或启动恢复',text:'记录最后有效的检查步骤，重新启动验证是否稳定。此结果是你的选择，不是网页自动检测的结论；若复发，可返回上一步继续排查。',end:true},
 service:{title:'保留记录，进入进一步检测',text:'记录主板、CPU、内存、显卡、电源型号，以及持续灯号、近期改动和已做检查。将记录交给维修人员交叉检测，避免反复替换或继续修改未知配置。',end:true}
};
export function diagnosticRecord(trail){const result=diagnosticResult(trail);return ['综合故障排查记录（用户选择，非自动检测）',...trail.map((step,i)=>`${i+1}. ${diagnosticNodes[step.id].title}${step.choice?' → '+step.choice:''}`),...(result?['','可能结果：'+result.title,'当前状态：'+result.status,'可能原因：'+result.causes.join('；'),'判断依据：'+result.evidence,'下一步：'+result.next,result.note]:['','排查尚未结束，请继续选择检查结果。'])].join('\n');}
const resultHints={
 power:['外部供电、插线板或电源连接异常',['接触不良或电源开关状态','适配器或供电线路问题'],'复查供电连接，观察多次正常开机是否稳定。'],
 powerInternal:['整机供电或开机控制链路异常',['电源输出或主板供电问题','机箱开机按钮及接线问题'],'按手册核对接线；由维修人员使用匹配的已知正常电源交叉检测。'],
 monitorPower:['显示器供电或显示器本体异常',['供电线、适配器或插座问题','显示器本体故障'],'用匹配且已知正常的供电测试，再交叉测试显示器。'],
 signal:['显示信号链路或输出接口异常',['输入源选择或线材接触问题','连接了未启用或不具备输出能力的接口'],'逐项交叉测试线材、显示器和输出口，记录有效连接。'],
 cpu:['CPU 初始化环节异常',['CPU 供电或安装接触问题','BIOS 版本与 CPU 支持不匹配','主板、CPU 或电源相关故障'],'核对支持列表与供电，再由维修人员交叉检测；灯号不单独证明 CPU 损坏。'],
 dram:['内存初始化或训练异常',['内存接触、插槽或兼容性问题','XMP / EXPO 参数不稳定','内存控制器或主板相关问题'],'按手册用推荐插槽、单条及默认参数复测，确认训练等待时间。'],
 vga:['图形设备初始化或显示输出异常',['显卡供电、安装或接触问题','显卡、显示线或输出链路问题','平台固件兼容性问题'],'交叉测试已知正常的图形输出；核显测试需确认 CPU 与主板支持。'],
 boot:['启动设备或系统引导配置异常',['磁盘未识别或未安装系统','启动模式与引导项不匹配'],'先确认磁盘和引导项；新装机无系统时 BOOT 灯可能持续亮，不据此认定磁盘损坏。'],
 minimal:['基础硬件或显示链路仍需定位',['供电、内存、图形输出或主板相关异常','固件兼容性或外设影响尚未排除'],'保留最小配置测试记录，交叉测试部件以缩小范围。'],
 windows:['Windows 图形驱动或显示输出状态异常',['图形驱动暂时失去响应','显示器连接或输出状态变化'],'记录近期驱动和更新变化，正常重启验证；复发时检查厂商驱动。'],
 explorer:['Windows 桌面进程未正常启动或失去响应',['资源管理器异常','登录后启动程序或系统组件影响'],'重启验证桌面是否稳定，检查近期启动项和系统变更。'],
 safeMode:['正常启动环境中的驱动或软件冲突',['显卡驱动异常','近期更新、服务或启动程序冲突'],'依据近期变更一次回退一项并验证；安全模式可显示只是缩小范围，不锁定某个驱动。'],
 recovery:['故障跨越正常 Windows 启动环境',['恢复环境、驱动或系统启动异常','显示连接与硬件问题尚未排除'],'记录恢复环境是否显示、是否有错误信息，再结合硬件交叉测试定位。']
};
export function diagnosticResult(trail){
 const end=trail[trail.length-1];if(!end||!diagnosticNodes[end.id]?.end)return null;
 const context=[...trail.slice(0,-1)].reverse().find(s=>resultHints[s.id]||diagnosticNodes[s.id]?.resultHint);
 const hint=diagnosticNodes[context?.id]?.resultHint||resultHints[context?.id]||['现有信息尚不足以定位',['供电、显示或系统启动环节仍需检查'],'补充具体症状和已完成的测试。'];
 const recovered=end.id==='recovered';
 return {status:recovered?'已恢复，待复测确认':trail.some(s=>s.choice?.includes('暂未检查'))?'部分检查未完成，待进一步检测':'仍未恢复，待进一步检测',title:hint[0],causes:hint[1],evidence:trail.filter(s=>s.choice).map(s=>`${diagnosticNodes[s.id].title} → ${s.choice}`).join('；')||'尚无具体检查结果',next:hint[2],note:'根据用户选择推测可能方向，不是硬件检测或故障确诊；一次恢复也不代表根因已经确认。'};
}

// Expand the existing black-screen paths without breaking their stable IDs.
const legacyEntries=diagnosticNodes.start.options;
Object.assign(diagnosticNodes,bootDisplayNodes);
diagnosticNodes.vga.options=[option('继续详细检查显卡供电、插槽和交叉测试','gpu-entry'),...diagnosticNodes.vga.options];
export const diagnosticCatalog=[...bootDisplayEntries,...legacyEntries.map(o=>({...o,category:['windows','cursor'].includes(o.next)?'Windows 启动与桌面':'开机与黑屏',keywords:'显示 电源 Windows 鼠标'})),...hardwareCases.map(c=>({label:c.label,next:'case-'+c.id+'-0',category:c.category,keywords:c.keywords}))];
export const diagnosticMajorCategories=[
 {id:'hardware',label:'电脑硬件故障',description:'供电、自检、开机黑屏、显卡、内存、存储、散热及外设。'},
 {id:'network',label:'网络故障',description:'有线网络、Wi-Fi、蓝牙连接与无线模块。'},
 {id:'system',label:'系统与驱动故障',description:'Windows 启动与桌面、蓝屏重启、卡顿及睡眠唤醒。'},
 {id:'other',label:'紧急与其他故障',description:'焦味、鼓包、进液及暂不确定的综合问题。'}
];
function majorFor(category){return category==='网络与无线'?'network':['Windows 启动与桌面','稳定性与性能','睡眠与唤醒'].includes(category)?'system':['紧急异常','其他与综合'].includes(category)?'other':'hardware';}
for(const entry of diagnosticCatalog){entry.major=majorFor(entry.category);entry.majorLabel=diagnosticMajorCategories.find(m=>m.id===entry.major).label;}
const groups=[...new Set(diagnosticCatalog.map(c=>c.category))];
diagnosticNodes.start={title:'先选择故障大类',text:'按“大类 → 具体分类 → 症状 → 检查步骤 → 可能结果”逐层排查。跨硬件与驱动的问题按症状入口选择；出现焦味、冒烟、鼓包或进液时优先进入紧急与其他故障。',options:diagnosticMajorCategories.map(m=>option(m.label,'major-'+m.id))};
for(const major of diagnosticMajorCategories){diagnosticNodes['major-'+major.id]={title:major.label+'：选择具体分类',text:major.description,options:groups.map((g,i)=>({label:g,next:'group-'+i})).filter(o=>diagnosticCatalog.some(c=>c.category===o.label&&c.major===major.id))};}

groups.forEach((g,i)=>{diagnosticNodes['group-'+i]={title:g+'：选择症状',text:'选择最符合当前现象的一项；多个现象可分别排查并复制记录。',options:diagnosticCatalog.filter(c=>c.category===g).map(c=>option(c.label,c.next))};});
for(const c of hardwareCases){
 const hint=[c.label+'相关异常',c.causes,c.next];
 if(c.critical){diagnosticNodes['case-'+c.id+'-0']={title:c.label+'：优先停止进一步损伤',text:c.checks.map(row=>row[0]+'：'+row[1]).join(' '),resultHint:hint,options:[option('已停止使用，查看处理建议','service')]};continue;}
 c.checks.forEach((row,i)=>{diagnosticNodes['case-'+c.id+'-'+i]={title:c.label+' · '+row[0],text:row[1],resultHint:hint,options:[option('完成检查，症状已恢复','recovered'),option(i===2?'检查后仍异常，查看可能结果':'检查后仍异常，继续下一步',i===2?'service':'case-'+c.id+'-'+(i+1)),option('暂未检查／不便操作'+(i===2?'，查看建议':'，继续记录'),i===2?'service':'case-'+c.id+'-'+(i+1))]};});
}
