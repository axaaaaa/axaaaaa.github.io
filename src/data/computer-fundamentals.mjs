export const knowledgeEntries = [
{
  "id": "disk-layout",
  "category": "硬盘格式",
  "title": "硬盘格式到底指什么？",
  "term": "Disk → Partition → File system",
  "description": "硬盘是设备，分区表记录分区的位置，文件系统负责在分区内组织文件。SSD/HDD 是介质，SATA/NVMe 是接口或协议，不是文件系统。",
  "example": "一块 SSD 使用 GPT 分区表，其中一个分区使用 NTFS，另一个分区使用 exFAT。",
  "pitfall": "GPT 和 NTFS 属于不同层次，二者不是二选一。"
},
{
  "id": "disk-partition",
  "category": "硬盘格式",
  "title": "GPT 与 MBR 分区表",
  "term": "GPT / MBR",
  "description": "MBR 使用 32 位扇区地址，512 字节逻辑扇区下寻址容量约 2 TiB，最多四个主分区项；扩展分区可承载逻辑分区。GPT 支持更大的磁盘，并保存分区表备份及校验信息。",
  "example": "现代 UEFI 装机通常搭配 GPT；旧设备的启动兼容性需要结合固件与系统判断。",
  "pitfall": "GPT 不是文件系统；转换分区表可能影响数据和启动，先备份。"
},
{
  "id": "disk-fat32",
  "category": "硬盘格式",
  "title": "FAT32：兼容广与单文件限制",
  "term": "FAT32",
  "description": "FAT32 常见于 U 盘和部分固件启动分区，设备兼容性广；单个文件最大为 4 GiB 减 1 字节。",
  "example": "一个 6 GiB 的视频即使磁盘剩余空间充足，也放不进 FAT32 分区。",
  "pitfall": "单文件大小限制与整个分区容量限制是两回事。"
},
{
  "id": "disk-exfat",
  "category": "硬盘格式",
  "title": "exFAT 与 NTFS 怎么区分？",
  "term": "exFAT / NTFS",
  "description": "exFAT 支持大文件，常用于跨系统移动存储；NTFS 支持权限、日志等功能，是 Windows 系统盘的常见格式。实际读写支持取决于系统版本和驱动。",
  "example": "跨 Windows 与 macOS 传递大视频常用 exFAT；Windows 内置工作盘常用 NTFS。",
  "pitfall": "exFAT 不具备 NTFS 同等的日志和权限机制；macOS 默认通常只读 NTFS。"
},
{
  "id": "disk-native",
  "category": "硬盘格式",
  "title": "ext4、APFS 与系统原生格式",
  "term": "ext4 / APFS",
  "description": "ext4 是 Linux 常见文件系统，支持日志；APFS 用于现代 Apple 系统，提供写时复制、快照等机制。两者在其他系统中通常需要额外支持。",
  "example": "Linux 工作分区常用 ext4；现代 Mac 内置系统卷通常使用 APFS。",
  "pitfall": "文件系统快照不等于独立备份，磁盘损坏仍可能丢失数据。"
},
{
  "id": "disk-formatting",
  "category": "硬盘格式",
  "title": "格式化、簇大小与数据删除",
  "term": "Format / Allocation unit / TRIM",
  "description": "格式化建立文件系统结构；簇是文件系统分配空间的单位，不等同于硬盘物理扇区。快速格式化主要重建元数据，其具体行为依赖系统和设备。",
  "example": "4 KiB 簇下，一个 1 字节文件的数据通常至少占一个簇，另有元数据开销；大量小文件时簇大小会影响空间利用率。",
  "pitfall": "格式化会破坏原有文件组织；快速格式化不等于可靠擦除，SSD 的 TRIM 也可能影响后续恢复。操作前备份并核对目标盘。"
},
  {
    "id": "bits",
    "category": "二进制与编码",
    "title": "位与字节",
    "term": "bit / byte",
    "description": "位是二进制信息的基本单位，只取 0 或 1；1 字节通常为 8 位。",
    "example": "8 位共有 256 种位模式，无符号整数范围为 0–255。",
    "pitfall": "位宽决定可表示状态数，而不是直接决定运算速度。"
  },
  {
    "id": "complement",
    "category": "二进制与编码",
    "title": "补码与溢出",
    "term": "Two’s complement",
    "description": "n 位补码范围为 −2^(n−1) 到 2^(n−1)−1；负数可由对应正数按位取反再加一得到。",
    "example": "8 位中 11111111 表示无符号 255，也可按补码解释为 −1。",
    "pitfall": "位模式没有自带正负含义；解释方式由类型和指令决定。"
  },
  {
    "id": "endian",
    "category": "二进制与编码",
    "title": "大小端序",
    "term": "Endianness",
    "description": "小端把多字节值的低有效字节放在低地址，大端则相反。",
    "example": "0x12345678 按小端从低地址排列为 78 56 34 12。",
    "pitfall": "端序描述字节顺序，不是把每个字节内部的位反转。"
  },
  {
    "id": "unicode",
    "category": "二进制与编码",
    "title": "字符与 UTF-8",
    "term": "Unicode / UTF-8",
    "description": "Unicode 码点标识字符；UTF-8 用 1–4 个字节编码一个 Unicode 标量值。",
    "example": "ASCII 字符 A 的 UTF-8 为 41；汉字“中”为 E4 B8 AD。",
    "pitfall": "屏幕上一个可见字形可能由多个码点组成，字符串长度不一定等于字数。"
  },
  {
    "id": "cycle",
    "category": "CPU 与体系结构",
    "title": "指令执行",
    "term": "Fetch → Decode → Execute",
    "description": "CPU 从指令地址获取指令，进行译码并执行，再更新架构状态；现代处理器可能使用流水线和乱序执行。",
    "example": "加法指令读取操作数，计算结果，并按指令定义更新目标寄存器或标志。",
    "pitfall": "机器指令与高级语言代码通常不是一一对应关系。"
  },
  {
    "id": "register",
    "category": "CPU 与体系结构",
    "title": "寄存器与栈",
    "term": "Registers / Stack",
    "description": "寄存器保存运算状态；栈是常用于函数调用和局部数据的内存区域，由 ABI 约定其使用规则。",
    "example": "函数调用可能把参数放入寄存器，并在栈上保存部分寄存器和返回信息。",
    "pitfall": "局部变量不保证都在栈上，编译器可能把它们放入寄存器或优化掉。"
  },
  {
    "id": "pipeline",
    "category": "CPU 与体系结构",
    "title": "流水线与分支预测",
    "term": "Pipeline",
    "description": "流水线重叠执行不同指令的阶段；分支预测猜测控制流以持续供给指令。",
    "example": "预测错误时，处理器丢弃错误路径上的推测工作并重新取指。",
    "pitfall": "主频高不等于程序一定更快，依赖链、缓存和分支同样重要。"
  },
  {
    "id": "isa",
    "category": "CPU 与体系结构",
    "title": "指令集与微架构",
    "term": "ISA / Microarchitecture",
    "description": "指令集定义软件可见的指令与状态；微架构描述处理器如何实现这些约定。",
    "example": "不同代的处理器可实现同一指令集，却具有不同的流水线和缓存设计。",
    "pitfall": "x86-64 与 AArch64 是指令集体系，不是某一款 CPU 型号。"
  },
  {
    "id": "cache",
    "category": "内存与缓存",
    "title": "缓存与局部性",
    "term": "Cache / Locality",
    "description": "缓存利用时间局部性与空间局部性，保存近期或邻近访问的数据。",
    "example": "顺序遍历数组通常比跨越大步长访问更有利于缓存利用。",
    "pitfall": "缓存行大小和各级延迟依具体硬件而定，不是固定通用常量。"
  },
  {
    "id": "virtual",
    "category": "内存与缓存",
    "title": "虚拟内存",
    "term": "Virtual memory",
    "description": "页表把虚拟地址映射到物理页，并保存访问权限等属性；TLB 缓存地址翻译。",
    "example": "两个进程中相同的虚拟地址可以映射到不同的物理页。",
    "pitfall": "虚拟内存不等于交换空间；没有磁盘交换也可使用虚拟内存。"
  },
  {
    "id": "fault",
    "category": "内存与缓存",
    "title": "缺页与地址保护",
    "term": "Page fault",
    "description": "缺页异常可由页面未驻留、映射不存在或权限不满足等条件触发，系统根据原因处理。",
    "example": "首次访问按需分配的页面时，系统可分配物理页后继续执行。",
    "pitfall": "缺页并不总是读取磁盘，也不总是程序错误。"
  },
  {
    "id": "heap",
    "category": "内存与缓存",
    "title": "堆与内存生命周期",
    "term": "Heap / Lifetime",
    "description": "动态分配的对象有明确生命周期；释放后的地址不再保证属于原对象。",
    "example": "释放对象后保留旧指针，会留下悬空引用的风险。",
    "pitfall": "释放内存不保证操作系统立即回收对应物理页。"
  },
  {
    "id": "process",
    "category": "操作系统",
    "title": "进程与线程",
    "term": "Process / Thread",
    "description": "进程是资源隔离的基本组织单位；同一进程内线程通常共享地址空间，各自具有执行上下文和栈。",
    "example": "线程间可直接共享堆对象，但对共享可变数据需要同步。",
    "pitfall": "进程也可通过共享内存通信；多线程不保证更快。"
  },
  {
    "id": "syscall",
    "category": "操作系统",
    "title": "用户态与系统调用",
    "term": "User / Kernel",
    "description": "系统调用是程序请求内核服务的受控入口，例如文件访问和进程管理。",
    "example": "库函数可能封装系统调用，也可能完全在用户态完成。",
    "pitfall": "系统调用不等于必然发生进程上下文切换。"
  },
  {
    "id": "schedule",
    "category": "操作系统",
    "title": "调度与上下文切换",
    "term": "Scheduling",
    "description": "调度器选择可运行任务；上下文切换保存和恢复执行状态，使任务共享处理器。",
    "example": "线程等待 I/O 时可让出处理器，让其他可运行任务继续执行。",
    "pitfall": "并发是多个任务交错推进，并行是多个任务同时执行。"
  },
  {
    "id": "sync",
    "category": "操作系统",
    "title": "原子性与同步",
    "term": "Atomic / Synchronization",
    "description": "原子操作保证特定操作的不可分割性；锁和内存顺序约束帮助协调共享状态。",
    "example": "计数器的读取、加一、写回若不是同步操作，可能丢失其他线程的更新。",
    "pitfall": "volatile 不是通用的线程同步方案，其语义取决于语言。"
  },
  {
    "id": "compile",
    "category": "编译与链接",
    "title": "从源码到程序",
    "term": "Compile / Link / Load",
    "description": "常见本地编译流程包括预处理、编译、汇编和链接；加载器映射程序及所需共享库。",
    "example": "多个源文件可分别生成目标文件，再由链接器解析符号引用。",
    "pitfall": "解释执行、JIT 和静态编译可在一个运行时中组合使用。"
  },
  {
    "id": "link",
    "category": "编译与链接",
    "title": "静态与动态链接",
    "term": "Static / Dynamic linking",
    "description": "静态链接把所需目标代码合入产物；动态链接使程序在加载或运行期间使用共享库。",
    "example": "更新共享库可能影响多个程序，因此 ABI 兼容性很重要。",
    "pitfall": "动态链接不意味着所有符号都会在程序启动时立即解析。"
  },
  {
    "id": "abi",
    "category": "编译与链接",
    "title": "调用约定与 ABI",
    "term": "Application Binary Interface",
    "description": "ABI 约定二进制边界上的调用方式、数据布局和符号等规则，调用约定是其中一部分。",
    "example": "参数传递寄存器、栈对齐和保存寄存器规则随平台而变。",
    "pitfall": "同一种语言编译出的二进制不一定彼此兼容。"
  },
  {
    "id": "layout",
    "category": "编译与链接",
    "title": "对齐与结构体布局",
    "term": "Alignment / Padding",
    "description": "编译器可能在成员之间或结构体末尾添加填充，以满足对齐要求。",
    "example": "char 与 int 组成的结构体，其大小不一定等于两个成员大小之和。",
    "pitfall": "实际布局依赖类型大小、ABI 和编译选项，应使用 sizeof 等方式核实。"
  },
  {
    "id": "io",
    "category": "存储与 I/O",
    "title": "缓冲与持久化",
    "term": "Buffer / Persistence",
    "description": "写入成功可能只表示数据进入内存缓冲；持久化还涉及文件系统、设备缓存和具体同步语义。",
    "example": "应用缓冲、内核页缓存和磁盘设备缓存是不同层次。",
    "pitfall": "flush 不在所有 API 中都代表数据已抵达持久介质。"
  },
  {
    "id": "interrupt",
    "category": "存储与 I/O",
    "title": "中断、轮询与 DMA",
    "term": "Interrupt / Polling / DMA",
    "description": "中断通知处理器处理事件；轮询主动查询状态；DMA 让设备在配置后传输数据而无需 CPU 逐字节搬运。",
    "example": "网卡可把接收数据通过 DMA 写入内存，再通知系统处理。",
    "pitfall": "DMA 仍需驱动配置、同步和权限控制，并非 CPU 完全不参与。"
  },
  {
    "id": "filesystem",
    "category": "存储与 I/O",
    "title": "文件与文件描述符",
    "term": "File descriptor",
    "description": "文件描述符是进程持有的打开资源引用标识，在类 Unix 系统中可指向文件、管道或套接字等。",
    "example": "打开文件后可使用描述符读写，关闭描述符释放该引用。",
    "pitfall": "文件名、文件对象与打开后的句柄是不同层次的概念。"
  },
  {
    "id": "performance",
    "category": "存储与 I/O",
    "title": "延迟与吞吐量",
    "term": "Latency / Throughput",
    "description": "延迟衡量一次操作耗时；吞吐量衡量单位时间完成的工作量，两者应分别观察。",
    "example": "批量处理可能提高吞吐量，但也可能增加单个请求的等待时间。",
    "pitfall": "性能优化应先测量瓶颈，并区分 CPU、内存、存储和网络限制。"
  }
];

export function inspectByte(input) {
  const text = String(input).trim();
  if (!/^\d+$/.test(text) || Number(text) > 255) return null;
  const value = Number(text);
  return { binary: value.toString(2).padStart(8, '0'), hex: value.toString(16).toUpperCase().padStart(2, '0'), signed: value > 127 ? value - 256 : value, inverse: value ^ 255, ones: value.toString(2).replace(/0/g, '').length };
}
export function filterKnowledge(entries, category, query) {
  const q = query.trim().toLowerCase();
  return entries.filter(e => (!category || e.category === category) && Object.values(e).join(' ').toLowerCase().includes(q));
}
export const quiz = [
  { question: '8 位位模式 11111111 按补码解释的值是？', answers: ['255', '−1', '128'], correct: 1, explanation: '同一位模式按无符号解释为 255，按 8 位补码解释为 −1。' },
  { question: '系统调用一定会切换到另一个进程吗？', answers: ['一定会', '不一定'], correct: 1, explanation: '进入内核态与切换进程是两个不同的概念。' },
  { question: '0x1234 在小端内存中，从低地址到高地址排列为？', answers: ['12 34', '34 12'], correct: 1, explanation: '小端把低有效字节 34 放到较低地址。' }
];
