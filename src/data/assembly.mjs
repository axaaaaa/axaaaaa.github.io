// 汇编语言教程数据：x86-64 为主，ARM64 对照。
// 说明性内容，命令与示例均在 Linux（System V ABI）下可直接跑通。

export const asmTabs = [
  { id: 'arch', label: 'CPU 架构' },
  { id: 'regs', label: '寄存器' },
  { id: 'isa', label: '指令速查' },
  { id: 'addr', label: '寻址方式' },
  { id: 'demo', label: '示例程序' },
  { id: 'tools', label: '工具与坑' },
];

// ---------- 架构 ----------

export const archCards = [
  {
    id: 'x86',
    title: 'x86-64',
    tag: 'CISC',
    accent: '#1d4ed8',
    lines: [
      '16 个通用寄存器（RAX…R15），指令变长 1–15 字节',
      '两操作数指令：目标在前（Intel 语法）',
      '内存操作数可直接参与运算，寻址模式丰富',
      '桌面、服务器、Windows / Linux 主场',
      '向后兼容 8086，历史包袱多，解码复杂',
    ],
  },
  {
    id: 'arm',
    title: 'ARM64 (AArch64)',
    tag: 'RISC',
    accent: '#0f7f57',
    lines: [
      '31 个 64 位通用寄存器（X0…X30）+ SP / PC',
      '定长 4 字节指令，Load / Store 架构：只有 LDR/STR 访存',
      '三操作数指令：add x0, x1, x2',
      '手机、Apple Silicon、服务器（Graviton / 鲲鹏）',
      '条件执行 + 零寄存器 XZR，代码密度高',
    ],
  },
];

export const archCompare = [
  { k: '指令长度', x86: '变长 1–15 字节', arm: '定长 4 字节', note: '定长译码简单，变长代码更紧凑' },
  { k: '通用寄存器', x86: '16 个（含 rsp / rbp）', arm: '31 个 + SP', note: '寄存器多，溢出到栈的次数少' },
  { k: '访存模型', x86: '运算指令可直接读写内存', arm: '只有 LDR / STR 能访存', note: 'RISC 的经典取舍' },
  { k: '操作数顺序', x86: 'add rax, rbx（目标在前）', arm: 'add x0, x1, x2（目标在前，三操作数）', note: 'AT&T 语法下 x86 顺序相反' },
  { k: '标志位', x86: 'RFLAGS：CF ZF SF OF PF AF DF', arm: 'NZCV + PSTATE', note: 'x86 大多数算术指令默认改标志位；ARM 需加 S 后缀' },
  { k: '函数调用', x86: 'call / ret 自动压返回地址', arm: 'bl 把返回地址写入 X30', note: 'ARM 的 lr 可以被覆盖，深层调用要自己压栈' },
  { k: '字节序', x86: '小端（固定）', arm: '小端为主，可切换大端', note: '网络传输要 htonl 转换' },
  { k: '典型平台', x86: 'PC / 服务器', arm: '手机 / 嵌入式 / Apple Silicon', note: '服务器端 ARM 份额在上升' },
];

export const pipeline = [
  { step: '取指', en: 'IF', desc: '按 PC / RIP 从指令缓存取下一条指令' },
  { step: '译码', en: 'ID', desc: '解析操作码与操作数，变长指令在这里拆包' },
  { step: '执行', en: 'EX', desc: 'ALU 做算术逻辑运算，或计算访存地址' },
  { step: '访存', en: 'MEM', desc: '读写数据缓存；ARM 的 LDR / STR 在这一级' },
  { step: '写回', en: 'WB', desc: '结果写回寄存器，标志位同时更新' },
];

export const cpuParts = [
  { name: '控制单元 CU', desc: '取指、译码、调度，分支预测失败时清空流水线' },
  { name: '算术逻辑单元 ALU', desc: '加减、与或非、移位、比较，结果附带标志位' },
  { name: '寄存器堆', desc: '离 ALU 最近的一级存储，通常 1 个周期可读写' },
  { name: 'L1 / L2 / L3 缓存', desc: 'L1 约 32–64KB，命中 4–5 周期；未命中就去内存（上百周期）' },
  { name: 'MMU 与 TLB', desc: '把虚拟地址翻译成物理地址，页表项缓存在 TLB' },
  { name: 'SIMD / FPU', desc: 'XMM / YMM / ZMM 或 ARM 的 V 寄存器，一条指令算 4–16 个数据' },
];

export const dataRep = [
  { t: '小端序', d: 'x86 与 ARM 默认把低字节放在低地址。0x12345678 在内存里是 78 56 34 12。' },
  { t: '补码', d: '负数用补码表示：-1 = 0xFFFF…FF。取负 = 按位取反再加一（neg）。' },
  { t: '对齐', d: '4 字节 int 按 4 字节边界访问最快。x86 容忍未对齐（慢），部分 ARM 配置会直接异常。' },
  { t: '栈方向', d: 'x86 与 ARM 的栈都向低地址生长：push 先减 rsp 再写入，pop 先读出再加 rsp。' },
];

// ---------- 寄存器 ----------

export const x86RegisterGroups = [
  {
    id: 'gpr',
    title: '通用寄存器（整数）',
    note: '同一个寄存器有 64 / 32 / 16 / 8 位四种名字，改小名字只影响对应位。',
    rows: [
      { name: 'RAX', alias: 'EAX · AX · AL/AH', role: '累加器；函数返回值；syscall 调用号', note: '乘除法默认用它，隐式操作数最多' },
      { name: 'RBX', alias: 'EBX · BX · BL/BH', role: '基址寄存器', note: 'callee-saved，被调用函数要自己保存' },
      { name: 'RCX', alias: 'ECX · CX · CL', role: '计数器；第 4 个参数', note: '循环、REP、移位位数都默认读它' },
      { name: 'RDX', alias: 'EDX · DX · DL/DH', role: '数据；第 3 个参数', note: '乘除的高 64 位；返回值第二个也用它' },
      { name: 'RSI', alias: 'ESI · SI · SIL', role: '第 2 个参数；字符串源地址', note: 'MOVS 系列隐含读它' },
      { name: 'RDI', alias: 'EDI · DI · DIL', role: '第 1 个参数；字符串目标地址', note: 'STOS 系列隐含写它' },
      { name: 'RBP', alias: 'EBP · BP · BPL', role: '栈帧基址', note: '省略帧指针可空出来当通用寄存器（-fomit-frame-pointer）' },
      { name: 'RSP', alias: 'ESP · SP · SPL', role: '栈顶指针', note: 'push/pop/call/ret 自动修改，不要随意手改' },
      { name: 'R8–R15', alias: 'R8D · R8W · R8B …', role: '第 5、6 个参数；临时寄存器', note: 'x86-64 新增，32 位时代没有' },
    ],
  },
  {
    id: 'special',
    title: '指针、标志与系统寄存器',
    note: '',
    rows: [
      { name: 'RIP', alias: 'EIP · IP', role: '下一条要执行的指令地址', note: '不能直接 mov 写入；用 lea rax,[rip+符号] 取地址' },
      { name: 'RFLAGS', alias: 'EFLAGS · FLAGS', role: 'CF 进位 / ZF 零 / SF 符号 / OF 溢出 / PF 奇偶 / DF 方向 / IF 中断', note: 'CMP、TEST、ADD 等自动更新，Jcc 靠它跳转' },
      { name: 'CS/DS/SS/ES', alias: '代码 / 数据 / 栈 / 附加段', role: '64 位下基本置 0，仅保留兼容', note: '现代系统靠分页而不是分段做隔离' },
      { name: 'FS / GS', alias: '段基址寄存器', role: '线程本地存储（TLS）', note: 'Linux 用 fs 指 TLS，Windows 64 位用 gs 指 TEB' },
      { name: 'CR0 / CR2 / CR3 / CR4', alias: '控制寄存器', role: 'CR0 保护模式开关；CR2 缺页地址；CR3 页表基址；CR4 特性开关', note: '只有内核态可读写，切页表就是换 CR3' },
      { name: 'DR0–DR7', alias: '调试寄存器', role: '硬件断点与监视点', note: '最多 4 个硬件断点，调试器底层用它' },
      { name: 'MSR', alias: '模型特定寄存器', role: 'syscall 入口地址、性能计数器、特性位等', note: '用 rdmsr / wrmsr 访问，仅内核态' },
    ],
  },
  {
    id: 'vector',
    title: '浮点与向量寄存器',
    note: 'SSE / AVX / AVX-512 是同一套寄存器的向上扩展，低 128 位互相重叠。',
    rows: [
      { name: 'ST0–ST7', alias: 'x87 栈式寄存器', role: '80 位扩展精度浮点', note: '现代编译器基本改用 SSE，只在 long double 里偶现' },
      { name: 'XMM0–XMM15', alias: '128 位', role: 'SSE 标量 / 打包浮点、整数', note: '前 8 个用于传浮点参数（xmm0–xmm7）' },
      { name: 'YMM0–YMM15', alias: '256 位', role: 'AVX / AVX2', note: '低 128 位就是对应的 XMM' },
      { name: 'ZMM0–ZMM31', alias: '512 位', role: 'AVX-512', note: '需要 CPU 支持，服务器平台常见' },
      { name: 'K0–K7', alias: '掩码寄存器', role: 'AVX-512 条件掩码', note: '配合 {k1}{z} 做按元素选择' },
      { name: 'MXCSR', alias: '控制状态寄存器', role: '舍入模式、异常标志', note: '改舍入模式要先 stmxcsr / ldmxcsr 保存现场' },
    ],
  },
];

export const sysvAbi = {
  args: ['RDI', 'RSI', 'RDX', 'RCX', 'R8', 'R9'],
  ret: 'RAX（第二个返回值放 RDX）',
  callerSaved: 'RAX RCX RDX RSI RDI R8 R9 R10 R11 XMM0–15',
  calleeSaved: 'RBX RBP R12 R13 R14 R15',
  stack: '调用前 RSP 必须 16 字节对齐；call 之后 RSP ≡ 8 (mod 16)',
  redZone: '叶子函数可使用 RSP 下方 128 字节而不移动栈指针',
};

export const winAbi = {
  args: ['RCX', 'RDX', 'R8', 'R9'],
  ret: 'RAX',
  callerSaved: 'RAX RCX RDX R8 R9 R10 R11 XMM0–5',
  calleeSaved: 'RBX RBP RDI RSI R12–R15 XMM6–15',
  stack: '调用前 16 字节对齐，并额外预留 32 字节影子空间（shadow space）',
  redZone: '没有 red zone 概念',
};

export const armRegisterGroups = [
  {
    id: 'gpr',
    title: '通用寄存器 X0–X30',
    note: '写 W 视图会清零对应 X 的高 32 位；X 视图写则整 64 位生效。',
    rows: [
      { name: 'X0–X7', alias: 'W0–W7', role: '参数 1–8；X0 同时是返回值', note: '超过 8 个参数走栈' },
      { name: 'X8', alias: 'W8', role: '间接结果寄存器；Linux 下是 syscall 号', note: 'LDR/LDUR 的 syscall 号放 X8，SVC 触发' },
      { name: 'X9–X15', alias: 'W9–W15', role: '临时寄存器（caller-saved）', note: '调用后内容不保证' },
      { name: 'X16 / X17', alias: 'IP0 / IP1', role: '链接器跳板寄存器', note: 'PLT 长跳转用，写代码别占' },
      { name: 'X18', alias: 'W18', role: '平台保留（Windows 上指 TEB）', note: 'Linux 用户态可用，但可移植性差' },
      { name: 'X19–X28', alias: 'W19–W28', role: 'callee-saved', note: '用了就要在序言里保存、尾声恢复' },
      { name: 'X29', alias: 'FP', role: '帧指针', note: 'Apple 平台强制要求保留' },
      { name: 'X30', alias: 'LR', role: '链接寄存器，保存返回地址', note: 'bl 写入；深层调用需 push {x29, x30}' },
      { name: 'SP', alias: 'WSP', role: '栈指针', note: '必须 16 字节对齐' },
      { name: 'PC', alias: '—', role: '程序计数器', note: '不能直接读写，用 ADR / 跳转指令间接控制' },
      { name: 'XZR / WZR', alias: '零寄存器', role: '读恒为 0，写被丢弃', note: 'cmp x0, x1 本质是 subs xzr, x0, x1' },
      { name: 'NZCV', alias: 'PSTATE 条件标志', role: 'N 负数 / Z 零 / C 进位 / V 溢出', note: '只有带 S 后缀的指令才更新' },
    ],
  },
  {
    id: 'vector',
    title: 'SIMD / 浮点寄存器',
    note: '',
    rows: [
      { name: 'V0–V31', alias: 'Q / D / S / H / B 视图', role: '128 位向量，可当 2×64 / 4×32 / 8×16 / 16×8 用', note: '前 8 个传浮点参数（V0–V7）' },
      { name: 'FPCR / FPSR', alias: '浮点控制 / 状态', role: '舍入模式、异常标志', note: '类似 x86 的 MXCSR' },
      { name: 'PSTATE', alias: '处理器状态', role: '条件标志、异常屏蔽、当前 EL 等级', note: '用户态只能读部分字段' },
    ],
  },
];

export const armAbi = {
  args: ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
  ret: 'X0（128 位返回值用 X0:X1）',
  callerSaved: 'X0–X18、X30、V0–V31（低 64 位部分）',
  calleeSaved: 'X19–X29',
  stack: 'SP 始终 16 字节对齐',
  redZone: '没有 red zone，栈下不能随手写',
};

// ---------- 指令 ----------

export const x86InstructionGroups = [
  {
    id: 'move',
    cat: '数据传送',
    items: [
      { m: 'MOV', ops: 'dst, src', desc: '把 src 复制到 dst，源不变', flags: '不影响标志位', ex: 'mov rax, rbx\nmov qword [rbp-8], 1' },
      { m: 'LEA', ops: 'dst, [mem]', desc: '只计算有效地址，不访存，常用作快速算术', flags: '不影响', ex: 'lea rax, [rip+msg]\nlea rax, [rdi+rdi*2]  ; rax = rdi*3' },
      { m: 'MOVZX', ops: 'dst, src', desc: '零扩展搬运，把小类型升到 32/64 位', flags: '不影响', ex: 'movzx eax, byte [rdi]' },
      { m: 'MOVSX', ops: 'dst, src', desc: '符号扩展搬运，保留负数符号', flags: '不影响', ex: 'movsx rax, word [rdi]' },
      { m: 'XCHG', ops: 'a, b', desc: '交换两个操作数；带内存操作数时隐含锁', flags: '不影响', ex: 'xchg rax, rbx' },
      { m: 'PUSH', ops: 'src', desc: 'RSP 减 8 后写入；只能是 64 位（或 16 位）', flags: '不影响', ex: 'push rbp\npush qword [rbx]' },
      { m: 'POP', ops: 'dst', desc: '读出后 RSP 加 8', flags: '不影响', ex: 'pop rdi' },
      { m: 'CMOVcc', ops: 'dst, src', desc: '条件为真才搬运，避免分支预测失败', flags: '读取标志位', ex: 'cmp rax, rbx\ncmovl rax, rbx' },
    ],
  },
  {
    id: 'arith',
    cat: '算术运算',
    items: [
      { m: 'ADD / ADC', ops: 'dst, src', desc: '加法；ADC 额外加进位 CF（多精度相加）', flags: 'CF ZF SF OF PF AF', ex: 'add rax, 8\nadc rdx, 0        ; 64 位以上进位' },
      { m: 'SUB / SBB', ops: 'dst, src', desc: '减法；SBB 额外减借位', flags: 'CF ZF SF OF PF AF', ex: 'sub rsp, 32\nsbb rdx, 0' },
      { m: 'INC / DEC', ops: 'dst', desc: '自增 / 自减 1', flags: '除 CF 外都影响', ex: 'dec rcx\njnz .loop' },
      { m: 'NEG', ops: 'dst', desc: '取负（按位取反加一）', flags: 'CF ZF SF OF PF AF', ex: 'neg eax' },
      { m: 'MUL', ops: 'src', desc: '无符号乘：RDX:RAX = RAX × src，结果 128 位', flags: 'CF / OF（其余未定义）', ex: 'mov rax, 10\nmul rbx' },
      { m: 'IMUL', ops: 'dst, src / dst, src, imm', desc: '有符号乘；双、三操作数形式只保留低位', flags: 'CF / OF', ex: 'imul eax, ebx, 4' },
      { m: 'DIV / IDIV', ops: 'src', desc: '无符号 / 有符号除：商在 RAX，余数在 RDX', flags: '全部未定义', ex: 'xor rdx, rdx\nmov rax, 100\nmov rcx, 7\ndiv rcx      ; rax=14, rdx=2' },
      { m: 'CMP', ops: 'a, b', desc: '按 a - b 计算但丢掉结果，只留标志位', flags: 'CF ZF SF OF PF AF', ex: 'cmp rax, 100\njg .big' },
    ],
  },
  {
    id: 'logic',
    cat: '逻辑与位运算',
    items: [
      { m: 'AND / OR / XOR', ops: 'dst, src', desc: '按位与 / 或 / 异或；xor rax, rax 是清零惯用法', flags: 'CF=OF=0，改 SF ZF PF', ex: 'and rax, 0xff\nxor eax, eax' },
      { m: 'NOT', ops: 'dst', desc: '按位取反', flags: '不影响', ex: 'not rax' },
      { m: 'TEST', ops: 'a, b', desc: '做按位与但不写回，只更新标志位，常用于判零/判位', flags: 'CF=OF=0，改 SF ZF PF', ex: 'test rax, rax\njz .empty' },
      { m: 'SHL / SAL', ops: 'dst, n / cl', desc: '左移，低位补 0，等价乘 2^n', flags: 'CF、OF（移 1 位时）', ex: 'shl rax, 3' },
      { m: 'SHR', ops: 'dst, n / cl', desc: '逻辑右移，高位补 0（无符号除法）', flags: 'CF、OF', ex: 'shr eax, 1' },
      { m: 'SAR', ops: 'dst, n / cl', desc: '算术右移，高位补符号位（保留负数）', flags: 'CF、OF', ex: 'sar eax, 1' },
      { m: 'ROL / ROR', ops: 'dst, n', desc: '循环移位，移出的位补到另一端', flags: 'CF、OF', ex: 'rol eax, 8' },
      { m: 'BT / BTS / BTR / BTC', ops: 'dst, n', desc: '测试 / 置位 / 清位 / 取反某一位，位号可来自寄存器', flags: 'CF = 该位原值', ex: 'bt eax, 3\nbts eax, 7' },
      { m: 'BSF / BSR', ops: 'dst, src', desc: '找最低 / 最高有效位的位置', flags: 'ZF', ex: 'bsr eax, ebx' },
      { m: 'POPCNT / LZCNT / TZCNT', ops: 'dst, src', desc: '数 1 的个数 / 前导零 / 尾随零', flags: 'ZF、CF', ex: 'popcnt eax, ebx' },
      { m: 'BSWAP', ops: 'dst', desc: '字节序翻转，处理网络字节序常用', flags: '不影响', ex: 'bswap eax' },
    ],
  },
  {
    id: 'flow',
    cat: '比较、跳转与调用',
    items: [
      { m: 'JMP', ops: 'label', desc: '无条件跳转；可以是相对或间接（jmp rax）', flags: '不影响', ex: 'jmp .done' },
      { m: 'JE / JZ', ops: 'label', desc: '相等 / 为零时跳转（ZF=1）', flags: '读取 ZF', ex: 'cmp rax, 0\nje .empty' },
      { m: 'JNE / JNZ', ops: 'label', desc: '不相等 / 不为零时跳转', flags: '读取 ZF', ex: 'jne .loop' },
      { m: 'JG / JGE / JL / JLE', ops: 'label', desc: '有符号比较跳转', flags: '读 ZF SF OF', ex: 'cmp eax, 10\njle .small' },
      { m: 'JA / JAE / JB / JBE', ops: 'label', desc: '无符号比较跳转（Above / Below）', flags: '读 CF ZF', ex: 'cmp eax, 10\nja .big' },
      { m: 'CALL', ops: 'label / reg', desc: '压入返回地址后跳转', flags: '不影响', ex: 'call add_two' },
      { m: 'RET', ops: '— / imm16', desc: '弹出返回地址并跳回，可选再弹出若干参数', flags: '不影响', ex: 'ret' },
      { m: 'LEAVE', ops: '—', desc: '等价 mov rsp, rbp; pop rbp，函数出口常用', flags: '不影响', ex: 'leave\nret' },
      { m: 'LOOP', ops: 'label', desc: 'RCX 减 1，不为 0 则跳转', flags: '不影响（改 RCX）', ex: 'mov rcx, 10\n.loop: dec rcx\njnz .loop' },
      { m: 'SYSCALL', ops: '—', desc: 'Linux x86-64 系统调用：号在 RAX，参数 RDI/RSI/RDX/R10/R8/R9', flags: '破坏 RCX、R11', ex: 'mov rax, 1\nmov rdi, 1\nsyscall' },
      { m: 'INT 0x80', ops: '—', desc: '32 位系统调用入口，参数走 EBX/ECX/EDX，64 位程序不建议用', flags: '—', ex: 'mov eax, 4\nint 0x80' },
    ],
  },
  {
    id: 'mem',
    cat: '内存与字符串',
    items: [
      { m: 'MOVS / MOVSB / MOVSQ', ops: '—（隐含 RSI→RDI）', desc: '批量复制，配合 REP 前缀使用', flags: '不影响', ex: 'mov rcx, 16\nrep movsb' },
      { m: 'STOS / STOSB', ops: '—（隐含 RAX→RDI）', desc: '把 RAX/AL 填到目标内存，常用来清零', flags: '不影响', ex: 'xor eax, eax\nmov rcx, 64\nrep stosb' },
      { m: 'LODS / LODSB', ops: '—（隐含 RSI→RAX）', desc: '从内存加载到累加器', flags: '不影响', ex: 'lodsb' },
      { m: 'CMPS / SCAS', ops: '—', desc: '比较两块内存 / 查找某个字节，配合 REPE / REPNE', flags: 'CF ZF SF OF PF AF', ex: 'repe cmpsb' },
      { m: 'MOVDQU / MOVAPS', ops: 'xmm, [mem]', desc: 'SSE 向量加载存储（未对齐 / 16 字节对齐）', flags: '不影响', ex: 'movdqu xmm0, [rdi]' },
      { m: 'PADDD / ADDPS', ops: 'xmm, xmm', desc: '打包整数加 / 单精度浮点加，一条指令算 4 个', flags: '不影响', ex: 'paddd xmm0, xmm1' },
    ],
  },
  {
    id: 'sys',
    cat: '系统与杂项',
    items: [
      { m: 'NOP', ops: '—', desc: '空操作，用于对齐或打补丁', flags: '不影响', ex: 'nop' },
      { m: 'CPUID', ops: 'EAX 决定功能号', desc: '查询 CPU 厂商、特性位、缓存信息', flags: '写 EAX EBX ECX EDX', ex: 'mov eax, 7\nxor ecx, ecx\ncpuid' },
      { m: 'RDTSC / RDTSCP', ops: '—', desc: '读时间戳计数器到 EDX:EAX，用于精确计时', flags: '不影响', ex: 'rdtsc\nshl rdx, 32\nor rax, rdx' },
      { m: 'CLI / STI', ops: '—', desc: '关 / 开中断，仅内核态可用', flags: '改 IF', ex: 'cli' },
      { m: 'PREFETCHT0', ops: '[mem]', desc: '把数据预取到 L1，减少访存停顿', flags: '不影响', ex: 'prefetcht0 [rdi]' },
    ],
  },
];

export const armInstructionGroups = [
  {
    id: 'move',
    cat: '数据传送',
    items: [
      { m: 'MOV', ops: 'Xd, Xn / #imm', desc: '寄存器或立即数搬运（立即数受编码限制）', ex: 'mov x0, x1\nmov w2, #1' },
      { m: 'MOVZ / MOVK', ops: 'Xd, #imm, LSL #shift', desc: '构造 64 位常量：MOVZ 清零后写入半字，MOVK 保留其它位再写', ex: 'movz x0, #0x1234\nmovk x0, #0xabcd, lsl #16' },
      { m: 'LDR / STR', ops: 'Xt, [addr]', desc: '唯一的常规访存指令（Load / Store 架构）', ex: 'ldr x0, [x1, #16]\nstr w0, [x1]' },
      { m: 'LDRB / LDRH', ops: 'Wt, [addr]', desc: '按字节 / 半字加载，零扩展', ex: 'ldrb w0, [x1]' },
      { m: 'LDP / STP', ops: 'Xt, Xt2, [addr]', desc: '一次读写两个寄存器，函数序言压栈常用', ex: 'stp x29, x30, [sp, #-16]!' },
      { m: 'ADR / ADRP', ops: 'Xd, label', desc: '取附近标签的地址（PC 相对），位置无关代码的基础', ex: 'adrp x0, msg@PAGE\nadd x0, x0, msg@PAGEOFF' },
    ],
  },
  {
    id: 'arith',
    cat: '算术与逻辑',
    items: [
      { m: 'ADD / SUB', ops: 'Xd, Xn, Xm/#imm', desc: '加 / 减；加 S 后缀（ADDS / SUBS）才更新 NZCV', ex: 'add x0, x1, x2\nsub sp, sp, #32' },
      { m: 'MADD / MSUB', ops: 'Xd, Xn, Xm, Xa', desc: '乘加 / 乘减：Xd = Xa ± Xn × Xm', ex: 'madd x0, x1, x2, x3' },
      { m: 'MUL', ops: 'Xd, Xn, Xm', desc: '乘法（MADD 的别名，目标不能与源相同）', ex: 'mul x0, x1, x2' },
      { m: 'SDIV / UDIV', ops: 'Xd, Xn, Xm', desc: '有 / 无符号整除，不产生余数', ex: 'sdiv x0, x1, x2' },
      { m: 'AND / ORR / EOR / BIC', ops: 'Xd, Xn, Xm/#imm', desc: '按位与 / 或 / 异或 / 与非', ex: 'and x0, x0, #0xff\norr x0, x0, x1' },
      { m: 'LSL / LSR / ASR', ops: 'Xd, Xn, #n', desc: '左移 / 逻辑右移 / 算术右移（移位量也可用寄存器）', ex: 'lsl x0, x1, #3\nasr w2, w2, #1' },
      { m: 'CMP / TST', ops: 'Xn, Xm/#imm', desc: 'CMP = SUBS xzr；TST = ANDS xzr，只更新标志位', ex: 'cmp x0, #10\nb.eq .done' },
      { m: 'CSEL / CSET', ops: 'Xd, Xn, Xm, cond', desc: '条件选择 / 条件置位，替代短分支', ex: 'cmp x0, x1\ncsel x2, x0, x1, gt' },
    ],
  },
  {
    id: 'flow',
    cat: '跳转与调用',
    items: [
      { m: 'B', ops: 'label', desc: '无条件跳转（不写 LR）', ex: 'b .loop' },
      { m: 'B.cond', ops: 'label', desc: '条件跳转：eq ne gt ge lt le hi ls …，读 NZCV', ex: 'b.ne .loop' },
      { m: 'CBZ / CBNZ', ops: 'Xt, label', desc: '寄存器为零 / 非零则跳转，不需要先 CMP', ex: 'cbz x0, .empty' },
      { m: 'TBZ / TBNZ', ops: 'Xt, #bit, label', desc: '测试某一位并跳转', ex: 'tbz w0, #0, .even' },
      { m: 'BL', ops: 'label', desc: '调用并把返回地址写入 X30（LR）', ex: 'bl add_two' },
      { m: 'RET', ops: '— / Xn', desc: '跳到 X30（或指定寄存器）保存的地址', ex: 'ret' },
      { m: 'SVC', ops: '#imm', desc: 'Linux ARM64 系统调用：号在 X8，参数 X0–X5，返回值 X0', ex: 'mov x8, #64\nsvc #0' },
    ],
  },
];

// ---------- 寻址方式 ----------

export const addressingModes = [
  { name: '立即数', x86: 'mov rax, 42', arm: 'mov x0, #42', desc: '操作数直接写在指令里，不访存。x86 立即数最大 32/64 位，ARM 的立即数受编码限制。' },
  { name: '寄存器', x86: 'mov rax, rbx', arm: 'mov x0, x1', desc: '最快的形式，1 个周期左右完成。' },
  { name: '直接（绝对）', x86: 'mov rax, [0x402000]', arm: 'ldr x0, [x1]', desc: '地址是常量。位置无关代码（PIE）里少用，改用 RIP / ADRP 相对寻址。' },
  { name: '寄存器间接', x86: 'mov rax, [rbx]', arm: 'ldr x0, [x1]', desc: '把寄存器里的值当地址。指针解引用的本质。' },
  { name: '基址 + 位移', x86: 'mov rax, [rbp-8]', arm: 'ldr x0, [x1, #-8]', desc: '访问结构体成员、局部变量最常见的形式。' },
  { name: '变址（比例）', x86: 'mov eax, [rbx+rcx*4]', arm: '(用 lsl 先算偏移) add x2, x1, x3, lsl #2', desc: '数组下标寻址。x86 支持 ×1 / ×2 / ×4 / ×8 四种比例。' },
  { name: '基址 + 变址 + 位移', x86: 'lea rax, [rdi+rsi*8+16]', arm: 'add x2, x0, x1, lsl #3', desc: '一条指令算完指针运算，LEA 就是靠它当加法器用。' },
  { name: 'RIP 相对', x86: 'lea rax, [rip+msg]', arm: 'adrp x0, msg@PAGE', desc: '位置无关代码取符号地址的标准写法，不受加载基址影响。' },
  { name: '段覆盖', x86: 'mov rax, qword [fs:0x28]', arm: 'mrs x0, tpidr_el0', desc: '访问 TLS、栈保护 canary 时会见到。' },
  { name: '前变址 / 后变址', x86: '（x86 无对应写法，需两条指令）', arm: 'ldr x0, [x1, #8]!  /  ldr x0, [x1], #8', desc: 'ARM 特有：前变址先更新基址再访存，后变址先访存再更新基址。' },
];

// ---------- 示例程序 ----------

export const examples = [
  {
    id: 'hello',
    title: 'Hello World（x86-64 Linux）',
    desc: '不链接 libc，直接走 sys_write / sys_exit 两个系统调用。',
    code: `section .data
    msg db "Hello, Assembly!", 10
    len equ $ - msg

section .text
    global _start

_start:
    mov rax, 1          ; sys_write
    mov rdi, 1          ; fd = stdout
    mov rsi, msg        ; 缓冲区地址
    mov rdx, len        ; 写入长度
    syscall

    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; 返回码 0
    syscall`,
    run: `nasm -f elf64 hello.asm -o hello.o
ld -o hello hello.o
./hello`,
    tips: [
      '1 号调用是 write，参数顺序为 fd、buf、count',
      'syscall 会破坏 RCX 与 R11，别在这两个寄存器里存东西',
      'exit 必须显式调用，否则 CPU 会继续往下执行垃圾指令',
    ],
  },
  {
    id: 'loop',
    title: '循环求和 1 + 2 + … + 100',
    desc: '最小的控制流样板：初始化、循环体、条件跳转。',
    code: `section .text
    global _start

_start:
    xor rax, rax        ; sum = 0
    mov rcx, 100        ; 计数从 100 开始

.loop:
    add rax, rcx        ; sum += i
    dec rcx             ; i--
    jnz .loop           ; 不为 0 继续

    mov rdi, rax        ; 结果 5050 交给退出码
    mov rax, 60
    syscall`,
    run: `nasm -f elf64 sum.asm -o sum.o
ld -o sum sum.o
./sum ; echo $?   # 退出码只留低 8 位：186`,
    tips: [
      'DEC 不修改 CF，但会改 ZF —— 所以 JNZ 能用',
      '结果 5050 = 0x13BA，用 gdb 的 info registers rax 看完整值',
      '循环变量放 RCX 是历史惯例（LOOP 指令默认读它）',
    ],
  },
  {
    id: 'frame',
    title: '函数调用与栈帧',
    desc: '看清 call / push rbp / leave / ret 对栈的影响。',
    code: `add_two:                ; long add_two(long a, long b)
    push rbp            ; 保存调用者的帧指针
    mov rbp, rsp        ; 建立自己的帧
    mov rax, rdi        ; a 在第 1 个参数寄存器
    add rax, rsi        ; + b
    pop rbp             ; 恢复帧指针
    ret                 ; 弹出返回地址并跳回

_start:
    mov rdi, 20
    mov rsi, 22
    call add_two        ; 返回后 rax = 42
    mov rdi, rax
    mov rax, 60
    syscall`,
    run: `# 单步观察栈的变化
gdb -q ./frame
(gdb) break add_two
(gdb) run
(gdb) info registers rsp rbp
(gdb) x/4gx $rsp`,
    tips: [
      'call 先把返回地址压栈，再跳到目标地址',
      '进入函数时 RSP ≡ 8 (mod 16)，所以 push rbp 之后正好 16 字节对齐',
      '叶子函数（不再调用别人）可以省掉 push rbp / mov rbp, rsp',
      '返回值一律放 RAX，浮点返回值放 XMM0',
    ],
  },
  {
    id: 'arm',
    title: 'Hello World（ARM64 Linux）',
    desc: '同样的功能，ARM64 用 X8 传调用号、SVC 陷入内核。',
    code: `    .section .data
msg:
    .ascii "Hello, ARM64!\\n"
len = . - msg

    .text
    .global _start
_start:
    mov x0, #1          // fd = stdout
    adr x1, msg         // 缓冲区地址
    mov x2, #len        // 长度
    mov x8, #64         // sys_write
    svc #0

    mov x0, #0          // 返回码
    mov x8, #93         // sys_exit
    svc #0`,
    run: `aarch64-linux-gnu-as -o hello.o hello.s
aarch64-linux-gnu-ld -o hello hello.o
qemu-aarch64 ./hello`,
    tips: [
      'ARM64 的调用号在 X8，x86-64 在 RAX',
      'SVC 后面的立即数在 Linux 上恒为 0，区别于 32 位 ARM 的 svc #0',
      'ADRP + ADD 是取全局符号地址的标准组合，ADR 只覆盖 ±1MB',
    ],
  },
  {
    id: 'c2asm',
    title: '从 C 反查编译器生成的汇编',
    desc: '学汇编最快的路径：写 C，看编译器怎么翻。',
    code: `// add.c
long add(long a, long b) {
    return a + b;
}

long sum(long *arr, int n) {
    long s = 0;
    for (int i = 0; i < n; i++) s += arr[i];
    return s;
}`,
    run: `# Intel 语法更接近 Windows/IDA 的显示习惯
gcc -O2 -S -masm=intel add.c -o add.s
clang -O2 -S -masm=intel add.c -o add.s

# 直接看二进制反汇编
objdump -d -M intel add.o
gdb -batch -ex "disassemble /m sum" ./a.out`,
    tips: [
      '-O2 会把循环展开、向量化，看不懂就先 -O0 再看',
      '编译器常用 LEA 做乘法：lea rax,[rdi+rdi*2] 就是 ×3',
      'godbolt.org（Compiler Explorer）能左右对照 C 与汇编，最适合练手',
    ],
  },
];

// ---------- 工具、坑、路线 ----------

export const asmTools = [
  { name: 'nasm', use: 'Intel 语法的汇编器，Linux/Windows 通用', cmd: 'nasm -f elf64 a.asm -o a.o' },
  { name: 'gas / as', use: 'GNU 汇编器，默认 AT&T 语法，加 .intel_syntax noprefix 可切换', cmd: 'as -o a.o a.s' },
  { name: 'ld', use: '链接器，裸汇编程序需要手动链接', cmd: 'ld -o a a.o' },
  { name: 'objdump', use: '反汇编与段信息查看，逆向入门必备', cmd: 'objdump -d -M intel a.out' },
  { name: 'gdb', use: '单步、看寄存器、看内存、看调用栈', cmd: 'gdb -q ./a.out' },
  { name: 'Compiler Explorer', use: '在线把 C/C++/Rust 编译成汇编，多编译器对照', cmd: 'godbolt.org' },
  { name: 'x64dbg / IDA / Ghidra', use: 'Windows 动态调试与反汇编，恶意样本分析常用', cmd: 'x64dbg → 附加进程' },
  { name: 'perf', use: '统计指令数、缓存未命中，验证优化是否有效', cmd: 'perf stat ./a.out' },
];

export const gdbCheatsheet = [
  { cmd: 'layout regs', desc: '分屏显示寄存器与下一条指令' },
  { cmd: 'stepi / nexti', desc: '单步一条汇编指令' },
  { cmd: 'info registers rax rsp', desc: '查看指定寄存器' },
  { cmd: 'x/8gx $rsp', desc: '以 8 字节十六进制查看栈顶 8 个单元' },
  { cmd: 'x/s $rdi', desc: '把 RDI 指向的地址当字符串打印' },
  { cmd: 'disassemble /r', desc: '反汇编并显示机器码字节' },
  { cmd: 'set $rax = 42', desc: '运行时改寄存器的值' },
  { cmd: 'bt', desc: '查看调用栈，配合帧指针理解栈帧' },
];

export const asmPitfalls = [
  { t: 'AT&T 与 Intel 语法写反了', d: 'AT&T 是 mov %源, %目标（顺序相反、寄存器带 %、立即数带 $）。看 objdump 默认输出 AT&T，加 -M intel 才和 Intel 手册一致。' },
  { t: '写 32 位寄存器会清空高 32 位', d: 'mov eax, 1 会把 RAX 高 32 位一并清零。想只改低位要清楚这条规则，否则指针高位会被抹掉。' },
  { t: '栈没对齐导致崩溃', d: 'System V 要求调用前 RSP 16 字节对齐。少 push 或多 push 一个寄存器，movaps 之类的指令就会因未对齐触发段错误。' },
  { t: 'PUSH / POP 只接受 64 位', d: 'push eax 非法；要压 32 位值得先 mov eax 到栈上（sub rsp,8; mov [rsp],eax）。' },
  { t: 'AH / BH 不能和 REX 前缀共存', d: '用 r8–r15 或 64 位操作数时指令带 REX 前缀，此时 AH/BH/CH/DH 不可用，改用 SPL/BPL/SIL/DIL。' },
  { t: 'CALL 之后标志位不可信', d: '被调用函数会改 RFLAGS。需要条件判断时，比较与跳转要放在 call 之前，或自己重新 cmp。' },
  { t: '忘了位置无关（PIE）', d: '现代 Linux 默认 PIE，直接 mov rax, msg 会因重定位报错。用 lea rax, [rip+msg]，ARM 用 adrp + add。' },
  { t: '把值当地址、把地址当值', d: 'mov rax, [rbx] 是取内容，mov rax, rbx 是复制指针。多一层中括号差一个内存访问。' },
];

export const asmRoadmap = [
  { n: 1, title: '数据表示与寻址', desc: '进制、补码、字节序、指针与数组的内存布局 —— 不搞清楚这些，后面的指令都是盲看。' },
  { n: 2, title: '寄存器与 mov / lea', desc: '认全 RAX…R15 与它们的 32/16/8 位别名，理解 LEA 为什么能当加法器。' },
  { n: 3, title: '算术、逻辑与标志位', desc: 'ADD / SUB / CMP / TEST 如何改 CF ZF SF OF，是理解所有条件跳转的前提。' },
  { n: 4, title: '控制流', desc: 'Jcc、循环、switch 跳转表，对照 C 的 if / for 看编译器产物。' },
  { n: 5, title: '函数与栈帧', desc: 'call / ret / push rbp 的配合，参数传递与调用约定，栈溢出与 canary。' },
  { n: 6, title: '系统调用与 ABI', desc: 'syscall 参数寄存器、返回值、错误码；再过渡到 libc 的调用封装。' },
  { n: 7, title: 'SIMD 与优化', desc: 'SSE / AVX 打包运算、缓存友好访问、分支预测 —— 到这里才谈得上“写得快”。' },
];
