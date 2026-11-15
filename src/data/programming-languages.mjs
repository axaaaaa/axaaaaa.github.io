// 编程语言模块数据源：C / C++ / Python / JavaScript。
// accent 用各语言在 GitHub linguist 里的代表色，视觉上更好认。

export const languages = [
  {
    id: 'c',
    name: 'C',
    monogram: 'C',
    accent: '#5c5c5c',
    accentSoft: '#f1f1f1',
    year: 1972,
    creator: 'Dennis Ritchie · Bell Labs',
    tagline: '贴着硬件写，几乎没有运行时',
    summary: 'C 是「可移植的汇编」：没有类、没有异常、没有垃圾回收，只有函数、指针和一块块内存。操作系统内核、驱动、嵌入式、语言运行时都建在它上面。',
    specs: {
      type: '静态类型，弱检查（隐式转换多）',
      memory: '全手动：malloc / free',
      exec: 'AOT 编译为原生机器码',
      std: 'C17 / C23',
      pkg: '无官方包管理（vcpkg、Conan 属第三方）',
      perf: '基准 1×（原生速度）',
    },
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int) * 3);   /* 手动申请 */
    if (!p) return 1;

    p[0] = 42;
    printf("hello, C: %d\\n", p[0]);

    free(p);                            /* 必须手动释放 */
    p = NULL;                           /* 防止悬垂指针 */
    return 0;
}`,
    uses: ['操作系统内核、驱动、固件', '嵌入式 / RTOS、单片机', '语言运行时、数据库存储引擎'],
    pitfalls: ['未定义行为：越界、悬垂指针、double free', '有符号整数溢出、隐式类型截断', '字符串没有边界检查，strcpy 一类函数危险'],
    eco: ['gcc', 'clang', 'musl', 'POSIX', 'CMake'],
  },
  {
    id: 'cpp',
    name: 'C++',
    monogram: 'C++',
    accent: '#f34b7d',
    accentSoft: '#fdeef3',
    year: 1985,
    creator: 'Bjarne Stroustrup',
    tagline: '零成本抽象：既要性能，也要表达力',
    summary: 'C++ 在 C 的地基上加上了类、模板、RAII 和值语义。它不强迫你用某一种范式 —— 你可以写过程式、面向对象、泛型，甚至函数式，代价是语言本身非常庞大。',
    specs: {
      type: '静态类型，强检查（模板推导）',
      memory: 'RAII：栈对象 + 智能指针自动释放',
      exec: 'AOT 编译为原生机器码',
      std: 'C++20 / C++23（C++26 在路上）',
      pkg: 'vcpkg / Conan / CMake FetchContent',
      perf: '约 1×（零成本抽象）',
    },
    code: `#include <iostream>
#include <memory>
#include <vector>

struct Buffer {
    std::vector<int> data{1, 2, 3};
    ~Buffer() { std::cout << "离开作用域，自动释放\\n"; }
};

int main() {
    auto buf = std::make_unique<Buffer>();   // 独占所有权
    for (int v : buf->data) std::cout << v << ' ';
    return 0;                                 // 不需要 delete
}`,
    uses: ['游戏引擎、浏览器、CAD', '编译器、数据库、消息中间件', '量化交易、AI 框架底层算子'],
    pitfalls: ['对象生命周期与悬垂引用（比指针更难查）', '头文件包含与 ODR 违规、编译期爆炸', '模板报错信息极长；ABI 跨编译器不兼容'],
    eco: ['STL', 'Boost', 'Qt', 'CMake', 'Conan'],
  },
  {
    id: 'python',
    name: 'Python',
    monogram: 'Py',
    accent: '#3572a5',
    accentSoft: '#eaf2f9',
    year: 1991,
    creator: 'Guido van Rossum',
    tagline: '可读性优先，把复杂度交给解释器',
    summary: 'Python 把「写得快」放在第一位：动态类型、缩进即语法、内置容器和推导式。CPython 逐条执行字节码，把性能压力交给了 C 扩展和向量化库。',
    specs: {
      type: '动态类型，强类型（不做隐式转换）',
      memory: '自动：引用计数 + 循环垃圾回收',
      exec: '解释执行字节码（CPython），PyPy 有 JIT',
      std: '3.12 / 3.13',
      pkg: 'pip + venv / uv / conda',
      perf: '约 10–100× 慢于 C',
    },
    code: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

points = [Point(i, i * 2) for i in range(3)]   # 列表推导式
print([p.y for p in points if p.x > 0])

# 动态类型：调用时才看有没有 .x，鸭子类型
def shift(p, dx):
    p.x += dx`,
    uses: ['数据分析、机器学习、科学计算', '自动化脚本、爬虫、运维工具', 'Web 后端（Django / FastAPI）'],
    pitfalls: ['可变默认参数 def f(a=[]) 会被复用', 'GIL 让纯 Python 多线程无法并行', '打包与环境混乱；热点代码要落到 NumPy/C'],
    eco: ['NumPy', 'pandas', 'PyTorch', 'FastAPI', 'uv'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    monogram: 'JS',
    accent: '#c9a900',
    accentSoft: '#fdf7e0',
    year: 1995,
    creator: 'Brendan Eich · ECMAScript 标准',
    tagline: '单线程事件循环，把等待变成并发',
    summary: 'JS 用原型而不是类（class 只是语法糖），靠事件循环在单线程里处理大量 I/O。现代引擎用 JIT 把热点代码编译成机器码，所以它比「解释型脚本」快得多。',
    specs: {
      type: '动态类型，弱类型（隐式转换）',
      memory: '自动：分代垃圾回收（标记-清除）',
      exec: 'JIT 编译（V8 TurboFan），单线程 + 事件循环',
      std: 'ES2024（ECMA-262 第 15 版）',
      pkg: 'npm / pnpm / yarn',
      perf: '约 2–20× 慢于 C（热点代码接近）',
    },
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('1 start');
  await sleep(100);            // 让出线程，去跑别的任务
  console.log('3 after await');
}

main();
console.log('2 sync first');    // 同步代码先执行完`,
    uses: ['前端界面、跨端（Electron / RN）', 'Node.js 后端与 BFF', 'CLI 工具、构建脚本、Serverless'],
    pitfalls: ['隐式类型转换：0 == "" 为 true，用 ===', 'this 绑定随调用方式变化（箭头函数例外）', 'var 提升与闭包；0.1 + 0.2 !== 0.3'],
    eco: ['TypeScript', 'React', 'Vue', 'Node.js', 'Vite'],
  },
];

// 横向对比表（行 = 维度）
export const comparisonRows = [
  ['首次发布', '1972', '1985', '1991', '1995'],
  ['类型系统', '静态 · 弱检查', '静态 · 强检查', '动态 · 强类型', '动态 · 弱类型'],
  ['内存管理', '手动 malloc/free', 'RAII + 智能指针', '引用计数 + GC', '分代 GC'],
  ['执行方式', 'AOT 编译', 'AOT 编译', '解释字节码', 'JIT 编译'],
  ['性能量级', '1×', '约 1×', '10–100× 慢', '2–20× 慢'],
  ['包管理', 'vcpkg / Conan', 'vcpkg / Conan', 'pip / uv', 'npm / pnpm'],
  ['典型项目', 'Linux、SQLite', 'Chrome、虚幻引擎', 'PyTorch、Instagram', 'VS Code、React'],
];

// 选型建议
export const pickingTips = [
  {
    title: '要贴近硬件',
    lead: 'C',
    body: '资源受限、需要确定性内存布局、要写内核/驱动/固件时，C 是最小公分母：ABI 稳定、工具链无处不在。',
  },
  {
    title: '要高性能 + 抽象',
    lead: 'C++',
    body: '既要零成本抽象又要工程规模：游戏引擎、浏览器、数据库、交易系统。前提是团队能驾驭生命周期管理。',
  },
  {
    title: '要快出结果',
    lead: 'Python',
    body: '数据、AI、脚本、原型验证。性能敏感的部分下推到 NumPy / C 扩展，用 Python 负责编排。',
  },
  {
    title: '要交互与全栈',
    lead: 'JavaScript',
    body: '浏览器是它唯一的主场，Node 让它通吃前后端；大型项目建议直接上 TypeScript。',
  },
];
