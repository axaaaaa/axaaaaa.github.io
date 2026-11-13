const pe='https://learn.microsoft.com/en-us/windows/win32/debug/pe-format',elf='https://refspecs.linuxfoundation.org/elf/gabi4+/contents.html',ghidra='https://ghidra.re/ghidra_docs/GhidraClass/Beginner/Introduction_to_Ghidra_Student_Guide.html',gdb='https://sourceware.org/gdb/current/onlinedocs/gdb/',lldb='https://lldb.llvm.org/use/tutorial.html';
const rows=[
 ['workflow','📋 逆向分析十步流程','从目标确认、样本识别和静动态分析，到结果验证与自动化。','了解文件格式、汇编控制流、调用约定和基本调试操作；准备分析样本及其副本。',[
   '目标确认：明确要研究的行为。常见主题包括注册／卡密检查、登录／VIP 限制、算法与协议、金币或广告逻辑，以及 API 或 C2 通信。',
   '初步判断：收集 EXE、DLL、APK、驱动、内存转储或抓包数据。用 Detect It Easy（DIE）、PEiD、strings 或 file 检查架构（x86／x64／ARM）、.NET／Java 层、混淆及加壳迹象，再决定直接分析还是先还原。',
   '脱壳与还原：区分 UPX 一类压缩壳与 VMProtect／Themida 一类保护器。比较静态解包和动态内存转储、导入地址表（IAT）重建两条路线；相关工具包括 x64dbg、Scylla 与 Import REConstructor。',
   '静态分析：用 IDA Pro 或 Ghidra 查看入口、关键字符串与调用关系。从 error、success、license 等字符串的交叉引用（XREF），或 SendMessage、strcmp 等 API 的调用点，定位候选代码。',
   '动态调试：用 x64dbg、OllyDbg 或 Frida 观察运行路径、调用栈、寄存器和内存。常见观测点包括 strcmp、memcmp、MessageBox、send 和 recv；对照正常与失败输入。',
   '关键点定位：区分条件判断、加解密与校验码等算法、HTTP／TCP 及自定义通信协议。用输入、返回值和分支结果验证关键逻辑。',
   '修改与对照：区分磁盘 Patch（如调整条件跳转或 NOP）、Hook（改变函数行为或返回值）、运行时内存修改和算法重实现。分别记录改动发生在哪一层，以及是否只影响当前进程。',
   '重打包与持久化：区分 EXE 补丁保存、APK 回编译与签名，以及 DLL 注入式的运行时加载。相关工具包括 apktool、jarsigner 与 Resource Hacker；重签后的产物与原签名应分开记录。',
   '对抗与反调试：识别 IsDebuggerPresent、虚拟机检测、时间检测和 VMProtect 虚拟化保护。记录调试前后路径差异，并区分 ScyllaHide、PEB 状态变化及检测函数 Hook 等影响因素。',
   '自动化：用 Frida 或 Python 整理重复的观测、数据提取和回归验证。将批量破解、自动生成 Key 和外挂工具区分为不同用途，不把这些用途当作分析结论。',
 ],'if (check == 1) {\n  success();\n} else {\n  fail();\n}','定位关键判断 → 理解输入、输出与依赖 → 用对照实验验证执行路径。熟练度体现在快速定位、解释保护带来的差异，以及自动化可重复的工作。','关键字符串只是线索；一次断点命中不代表覆盖全部路径。分析本地分支时，还要区分它与服务端校验。','用成功和失败样本各复测一次；记录样本哈希、工具版本、模块偏移、输入、输出及回滚结果。',ghidra],
 ['basics','🔰 入门与基础','建立字节、地址和类型的基本概念。','二进制整数、补码与 C 基础。',['保留原件与 SHA-256，记录架构和工具版本。','用已知字节判断大小端，再标注数据宽度与符号。','区分文件偏移、RVA、链接地址和运行时地址。'],'78 56 34 12 → 小端无符号整数 0x12345678','同一组字节按不同字节序和类型解释会产生不同数值。','不要把地址直接当文件偏移；ASLR 会改变运行时基址。','用手算与本页字节序工具对照同一组输入。',pe],
 ['formats','📦 文件格式识别','判断 PE、ELF、Mach-O、DEX 与托管程序。','十六进制及文件头边界。',['先查看魔数，不能只看扩展名。','PE 查看 DOS/PE 头与节；ELF 查看类别、字节序与 LOAD 段。','Mach-O 看 load commands，DEX 看版本与索引；.NET 继续确认 CLR 元数据。'],'PE: MZ + e_lfanew 指向 PE\\0\\0；ELF: 7F 45 4C 46','头信息只能说明结构线索，不保证文件可加载；本页解析器仅实现 PE/ELF 基础头。','MZ 不一定是完整 PE；原生 PE 与托管 PE 不能靠扩展名区分。','用截断文件、错误签名和已知正常样本交叉检查。',pe],
 ['static','🔍 静态分析','从字符串、导入与交叉引用形成行为假设。','文件结构、函数与调用关系。',['识别架构并导入副本，先跑基础分析。','从日志、路径和导入名称查看引用，追踪调用者与参数。','给函数和数据重命名，记录地址、引用与推断理由。'],'字符串“load failed” → 交叉引用 → 错误分支 → 上游调用者','字符串与导入是线索，不是功能已经执行的证据。','反编译器推断类型可能错误；未引用数据可能是资源或死代码。','找至少一个反例输入，并用受控调试验证关键路径。',ghidra],
 ['assembly','🧩 汇编阅读','阅读 x86/x64 与 ARM64 的常见控制流。','寄存器、栈和 ABI。',['先确认架构、位宽、语法与调用约定。','识别数据移动、比较、条件分支、调用与返回。','结合调用点跟踪参数、返回值和栈变化。'],'x86: cmp eax,0 / je label；ARM64: cmp w0,#0 / b.eq label','比较指令设置条件状态，条件跳转依状态决定路径。','x64 不只有一种调用约定；ARM64 的 w/x 寄存器宽度不同。','对照调用前后寄存器，确认符号扩展、截断和分支条件。','https://learn.microsoft.com/en-us/cpp/build/x64-calling-convention'],
 ['dynamic','🐞 动态调试','用断点、调用栈与内存观测验证假设。','进程、线程与调试符号。',['用可复现输入启动本地副本，记录环境。','在目标函数或源码行设置断点，检查线程与调用栈。','逐步记录入参、返回值和状态变化，结束调试恢复环境。'],'GDB: break main → run → backtrace → info registers','断点命中证明路径到达，不自动证明业务语义。','单步会改变时序；缺符号或优化会影响变量与栈显示。','重复正常与异常输入，比对同一观测点。',gdb],
 ['windows','🖥️ Windows 程序分析','理解模块加载、导入、资源与消息路径。','PE、Windows API 和 x64 ABI。',['读取 PE 节、入口 RVA、导入与导出。','区分启动包装、运行库初始化与实际业务入口。','沿窗口消息或日志定位函数，记录 DLL 与模块偏移。'],'entry VA = 映像基址 + AddressOfEntryPoint','入口地址不必是 main；资源和代码在文件中的布局也不同。','延迟导入和动态加载可能不直接列在普通导入表中。','用模块列表和调用栈核对静态推断的加载关系。',pe],
 ['linux','🐧 Linux 程序分析','理解 ELF、共享对象、动态链接与系统调用。','进程地址空间和 ELF。',['检查 ELF 类别、机器类型、PT_LOAD 与解释器信息。','区分 PLT/GOT 相关引用、动态符号与真实函数实现。','在 GDB 中用模块基址和调用栈确认目标代码路径。'],'readelf -h ./sample；readelf -l ./sample','ELF 段描述加载映射，节更偏向链接与分析；两者不要混同。','ET_DYN 可能是 PIE 或共享库；链接地址不等于实际运行地址。','对照 readelf 的 LOAD 段与本页文件偏移换算。',elf],
 ['android','🤖 Android 应用分析','把 APK、Manifest、DEX 与 JNI 关联起来。','Android 组件、Java/Kotlin 和原生库。',['保存 APK 副本并列出 Manifest、classes*.dex 和 lib/<abi>。','从组件入口跟踪类、方法和资源引用。','遇到 native 方法时核对 ABI、JNI 注册与对应 .so。'],'Activity 入口 → DEX 方法 → native 声明 → 对应 ABI 的 .so','反编译 Java 形式不是原始 Kotlin 源码，资源编号也依构建变化。','多 DEX、反射和动态注册会影响静态调用图完整性。','用组件生命周期日志与目标方法输入核对推断。','https://source.android.com/docs/core/runtime/dex-format'],
 ['dotnet','🔷 .NET 程序分析','识别程序集、元数据、CIL 与托管边界。','类型系统、程序集引用和 CLR。',['确认 CLR/CLI 元数据，查看程序集引用、类型和成员。','对照反编译视图与 IL，跟踪分支、异常处理和调用。','区分托管逻辑、P/Invoke 与本地实现。'],'类型 → 方法 token → IL 调用 → 被调用成员','元数据提供类型线索；还原代码可能不同于原始源码结构。','Native AOT、混合模式与泛型优化需要额外判断。','比较 IL 与运行时实参，明确尚未解析的调用。','https://learn.microsoft.com/en-us/dotnet/standard/metadata-and-self-describing-components'],
 ['electron','⚡ Electron／网页分析','定位包内脚本与主进程、预加载和渲染进程边界。','JavaScript、浏览器开发工具与 IPC。',['识别资源目录与 ASAR，在副本上列出包结构。','从 package.json 入口追踪主进程、preload 和渲染器。','使用实际存在的 Source Map 对照构建脚本，记录 IPC 请求与响应。'],'package.json main → 主进程 → preload → renderer','ASAR 是归档方式，不等于脚本加密；Source Map 可能缺失。','压缩变量名不是原始语义；浏览器请求不代表主进程全部行为。','比较脚本调用点、IPC 参数和可观测结果。','https://www.electronjs.org/docs/latest/tutorial/asar-archives'],
 ['protocol','📡 数据与协议分析','识别编码、长度、类型与序列化边界。','字节序、字符编码和结构化数据。',['从多个已知输入收集对应输出，记录边界与长度。','逐字段对齐样本，区分魔数、长度、类型、内容与校验。','用最小变化输入检验每个字段假设，保留未知项。'],'输入长度从 4 变成 5，比较候选长度字段与有效载荷变化','相关变化只支持假设；不能仅凭高熵认定加密。','TCP 包边界不是应用消息边界；压缩与编码也会改变字节分布。','构造可预测数据，再验证长度和字节序的计算。','https://www.rfc-editor.org/rfc/rfc9293.html'],
 ['crash','💥 崩溃与故障定位','从转储和异常上下文缩小故障范围。','模块、符号、线程和内存生命周期。',['记录异常码、故障线程、模块版本与复现输入。','用匹配符号查看调用栈、寄存器和故障地址附近指令。','检查空指针、越界和生命周期线索，区分直接故障与上游根因。'],'WinDbg: !analyze -v；GDB: thread apply all backtrace','栈顶是观测位置，不必是最初引入错误的位置。','符号版本错配、损坏栈和优化可能产生误导。','对最小复现多次验证，记录修正前后行为。','https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/analyzing-a-user-mode-dump-file'],
 ['versions','🔀 版本差异分析','比较两版结构与行为而非只看字节数量。','文件哈希、函数与模块对应关系。',['确认架构、构建模式和输入一致，保存两版哈希。','先看节、导入和资源差异，再找函数与调用变化。','对候选变更执行同一输入的行为回归，记录无法对应的区域。'],'同一输入 → 旧版结果 A／新版结果 B → 候选调用链','地址移动与重链接可能造成大量字节差异，但功能变化很小。','本页二进制对比是相同文件偏移比较，不是函数语义匹配。','加入不受影响输入作为对照，验证变更范围。','https://sourceware.org/binutils/docs/binutils/objdump.html'],
 ['tools','🛠️ 工具操作速查','选择静态、动态和托管工具并记录版本。','明确目标平台和架构。',['Ghidra／IDA：查看函数、引用、导入与反编译；x64dbg／WinDbg：Windows 动态观测。','GDB／LLDB：按源码行或地址设置断点，检查栈、寄存器与内存。','每次保存工作数据库、命令记录和地址基准，不把工具默认推断当作结论。'],'GDB: break main; bt; x/16bx ADDRESS\nLLDB: breakpoint set -n main; bt; memory read ADDRESS\nWinDbg: k; lm; r\nx64dbg: F2 断点、F7 单步进入、F8 单步跳过','快捷键及命令会随平台、布局、插件和版本变化，以工具文档为准。','静态工具分析结果不等于运行时执行记录。','用自编译带符号样例核对函数、引用与断点行为。',lldb],
 ['report','📝 分析记录与验证','形成可复核、可回滚的分析报告。','哈希、版本和证据编号。',['记录目标、环境、输入、命令、地址及观察事实。','将事实、推断与未知项分开，附最小复现与反例。','任何修改先保存原件，输出差异并在副本上验证回滚。'],'假设 H1 → 证据 E1/E2 → 反例 C1 → 结论与置信度','记录应能让另一位分析者复现，不只保留最终截图。','不可把文件时间戳当作可靠构建时间，也不把哈希不同直接当功能不同。', '在新副本按记录复做，核对哈希与输出。','https://csrc.nist.gov/publications/detail/sp/800-86/final'],
 ['network','🌐 网络行为','按行为类型整理样本的网络活动，展开可查看 9 类常见行为的示例与可能目的。','TCP／IP、DNS、HTTP(S) 与常见网络 API 基础。',[
   '在隔离环境抓包或用 API 监控记录 DNS 查询、连接目标、请求内容与时间，保留原始证据。',
   '把观测按解析、请求、长连接、下载、上传、反弹、扫描与隐匿通道分类，再与字符串、导入函数交叉核对。',
   '结合目标地址、数据内容与频率判断用途，区分正常更新、遥测与可疑 C2 通信，标注尚未确认的推断。',
 ],'DNS 查询 → connect(IP:8080) → POST /login → 定时心跳','行为类型只描述观测到的通道，不等于恶意结论；需结合上下文、目标与数据内容判断。','CDN、TLS 与域名前置会隐藏真实服务器；DNS 查询也可能来自系统组件或浏览器，而非样本进程自身。','用干净环境复现，比对抓包、API 日志与静态分析中的字符串／导入表，确认请求确由目标进程发起。','https://attack.mitre.org/tactics/TA0011/',[
   {type:'🌐 DNS 解析',example:'查询 example.com',purpose:'获取远程服务器 IP'},
   {type:'🔗 HTTP/HTTPS 请求',example:'GET /config.json、POST /login',purpose:'拉配置、上传信息、登录验证'},
   {type:'🔄 WebSocket 通信',example:'实时通信、心跳包',purpose:'持续连接远程服务器'},
   {type:'🔌 Socket 连接',example:'connect(123.45.67.89:8080)',purpose:'建立 TCP/UDP 通信通道'},
   {type:'⬇️ 远程文件下载',example:'curl、wget、WinINet、URLDownloadToFile',purpose:'下载更新、植入新模块'},
   {type:'⬆️ 上传敏感数据',example:'用户名、密码、机器信息',purpose:'数据泄露、C2 通信（Command & Control）'},
   {type:'🔙 反向连接/反弹 Shell',example:'程序连接攻击者主机',purpose:'被控端，等待远程控制'},
   {type:'🔎 扫描网络端口/IP',example:'探测内网',purpose:'横向移动、挖矿传播'},
   {type:'🛡️ 使用 CDN、加密通道',example:'Cloudflare、TLS',purpose:'隐匿真实服务器地址'},
 ]],
 ['files','📁 文件行为','按行为类型整理样本的文件操作，展开可查看 9 类常见行为的示例与意图说明。','文件系统、路径与常见文件 API（Windows API／POSIX）基础。',[
   '在隔离环境用文件监控或 API Hook 记录路径、操作类型、句柄与时间点，保留原始证据。',
   '把观测按创建、读取、写入、删除、属性、移动、临时文件、加解密与目录监视分类，再与字符串、导入函数交叉核对。',
   '结合路径、内容变化与调用上下文判断意图，区分正常缓存／配置写入与可疑落地或清除痕迹，标注尚未确认的推断。',
 ],'CreateFile(abc.txt) → WriteFile → SetFileAttributes(hidden) → 定时扫描目录','文件操作只说明行为本身，不等于恶意结论；需结合路径、内容、频率与进程来源判断。','临时目录和系统组件也会产生大量文件操作；隐藏属性、加密并不必然意味着对抗或勒索。','用干净环境复现，比对文件监控日志、快照差异与静态分析中的字符串／导入表，确认操作确由目标进程发起。','https://learn.microsoft.com/en-us/windows/win32/fileio/file-management',[
   {type:'📄 创建文件',example:'CreateFile、fopen("abc.txt", "w")',purpose:'可能写日志、缓存、落地Payload'},
   {type:'📖 读取文件',example:'ReadFile、fread(...)',purpose:'加载配置、读取资源或窃取信息'},
   {type:'✏️ 写入文件',example:'WriteFile、fwrite(...)',purpose:'保存数据、篡改文件、落地木马'},
   {type:'🗑️ 删除文件',example:'DeleteFile、remove(...)',purpose:'删除日志、自毁行为、清除证据'},
   {type:'🙈 修改文件属性',example:'SetFileAttributes、chmod',purpose:'躲避检测、设置隐藏属性'},
   {type:'📦 移动/重命名文件',example:'MoveFile、rename(...)',purpose:'数据转移、混淆轨迹'},
   {type:'🕒 创建临时文件',example:'通常是以 .tmp 结尾',purpose:'缓存处理、绕过权限控制'},
   {type:'🔐 文件加解密',example:'调用加解密函数',purpose:'数据保护或勒索行为'},
   {type:'👁️ 监视文件变动',example:'ReadDirectoryChangesW、inotify',purpose:'热更新、后门监听'},
 ],'意图说明']
];
export const reverseGuides=rows.map(([id,title,goal,prerequisite,steps,example,interpretation,pitfall,validation,source,behaviors,behaviorLabel])=>({id,title,goal,prerequisite,steps,example,interpretation,pitfall,validation,source,...(behaviors?{behaviors}:{}),...(behaviorLabel?{behaviorLabel}:{})}));
export const reverseTools=[{id:'integer',label:'进制与字节序转换'},{id:'hex',label:'十六进制查看器'},{id:'pattern',label:'字节特征搜索'},{id:'header',label:'PE／ELF 头信息'},{id:'strings',label:'字符串提取'},{id:'address',label:'偏移与虚拟地址'},{id:'diff',label:'二进制差异对比'},{id:'notes',label:'分析笔记模板'}];
export const reverseToolReferences=[
 {name:'Ghidra',actions:'导入并确认语言 → Auto Analyze → 从 Symbol Tree 查看函数，在 Listing 与 Decompiler 之间交叉核对。',source:'https://ghidra.re/ghidra_docs/GhidraClass/Beginner/Introduction_to_Ghidra_Student_Guide.html'},
 {name:'IDA',actions:'Functions／Imports 查看函数和导入；交叉引用检查调用者；伪代码视图需安装并支持对应架构的反编译器。',source:'https://docs.hex-rays.com/user-guide'},
 {name:'x64dbg',actions:'F2 切换断点，F7 单步进入，F8 单步跳过；在寄存器、栈和内存视图核对当前线程上下文。',source:'https://help.x64dbg.com/en/latest/gui/menus/Debug.html'},
 {name:'WinDbg',actions:'lm 查看模块，k 查看调用栈，r 查看寄存器；先匹配符号，再解释 !analyze -v 输出。',source:'https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/getting-started-with-windbg'},
 {name:'GDB',actions:'break main → run → bt；info registers 查看寄存器，x/16bx ADDRESS 查看 16 个字节。',source:'https://sourceware.org/gdb/current/onlinedocs/gdb/'},
 {name:'LLDB',actions:'breakpoint set -n main → run → bt；register read 查看寄存器，memory read ADDRESS 查看内存。',source:'https://lldb.llvm.org/use/tutorial.html'}
];
