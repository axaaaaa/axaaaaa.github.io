// 数据结构知识模块的数据源。
// ops 固定顺序：访问 / 查找 / 插入 / 删除，便于详情卡和总览表共用。

export const dsGroups = [
  { id: 'all', name: '全部' },
  { id: 'linear', name: '线性结构' },
  { id: 'hash', name: '散列' },
  { id: 'tree', name: '树结构' },
  { id: 'graph', name: '图与集合' },
];

export const dataStructures = [
  {
    id: 'array',
    group: 'linear',
    name: '数组',
    en: 'Array',
    space: 'O(n)',
    summary: '一段连续内存，元素按下标存放。地址 = 首地址 + 下标 × 元素大小，所以按下标取值是一步到位。',
    props: ['连续内存', '随机访问 O(1)', 'CPU 缓存友好'],
    ops: [
      ['访问', 'O(1)', '下标直达'],
      ['查找', 'O(n)', '线性扫描'],
      ['插入', 'O(n)', '后续元素后移'],
      ['删除', 'O(n)', '后续元素前移'],
    ],
    uses: ['频繁按下标读取：表格、像素缓冲、帧数据', '作为其他结构的底层存储：堆、哈希桶、循环队列'],
    pitfalls: ['中间插入删除要搬移整段内存', '尾部扩容是摊还 O(1)，但偶尔会一次性拷贝'],
    code: `const arr = ['a', 'b', 'c'];
arr[1];           // O(1) 随机访问 → 'b'
arr.push('d');    // O(1) 摊还，尾部追加
arr.splice(1, 1); // O(n) 中间删除，后续元素前移`,
  },
  {
    id: 'linkedlist',
    group: 'linear',
    name: '链表',
    en: 'Linked List',
    space: 'O(n)',
    summary: '节点离散存放，用指针串起来。插入删除只改指针，但要找第 k 个元素只能从头一个个走。',
    props: ['离散存储', '已知位置增删 O(1)', '每节点额外指针开销'],
    ops: [
      ['访问', 'O(n)', '必须从头遍历'],
      ['查找', 'O(n)', '逐个比对'],
      ['插入', 'O(1)', '修改前后指针'],
      ['删除', 'O(1)', '需已知前驱'],
    ],
    uses: ['LRU 缓存：哈希表 + 双向链表', '频繁头部插入的撤销栈、链式队列'],
    pitfalls: ['缓存不友好，小数据量时实跑常慢于数组', '单链表删除节点需要先找到前驱'],
    code: `// 双向链表：在 node 之后插入，只需改 3 个指针
function insertAfter(node, value) {
  const next = node.next;
  node.next = { value, prev: node, next };
  if (next) next.prev = node.next;   // O(1)，不搬移任何元素
}`,
  },
  {
    id: 'stack',
    group: 'linear',
    name: '栈',
    en: 'Stack',
    space: 'O(n)',
    summary: '只在一端进出，后进先出（LIFO）。函数调用、递归、表达式求值都靠它。',
    props: ['LIFO 后进先出', '只在栈顶操作', '函数调用模型'],
    ops: [
      ['访问', 'O(1)', '只看栈顶'],
      ['查找', 'O(n)', '需要弹出才能看到'],
      ['插入', 'O(1)', 'push 入栈'],
      ['删除', 'O(1)', 'pop 出栈'],
    ],
    uses: ['函数调用栈、递归展开', '括号匹配、表达式求值、撤销重做'],
    pitfalls: ['递归过深或只入不出会栈溢出', '需要先进先出时别把栈当队列用'],
    code: `const stack = [];
stack.push('a');   // 入栈
stack.push('b');
stack.pop();       // 'b' —— 后进先出
stack.at(-1);      // 'a' 只看栈顶，不移除`,
  },
  {
    id: 'queue',
    group: 'linear',
    name: '队列',
    en: 'Queue',
    space: 'O(n)',
    summary: '一端进、另一端出，先进先出（FIFO）。它描述的是「排队」这件事本身。',
    props: ['FIFO 先进先出', '队尾入、队头出', '天然的公平顺序'],
    ops: [
      ['访问', 'O(1)', '只看队头'],
      ['查找', 'O(n)', '需要遍历'],
      ['插入', 'O(1)', 'enqueue 入队'],
      ['删除', 'O(1)', 'dequeue 出队'],
    ],
    uses: ['任务调度、消息队列、限流', 'BFS 逐层遍历、缓冲区'],
    pitfalls: ['数组 shift 出队是 O(n)，量大用循环数组或链表', '优先队列按优先级出队，不是 FIFO'],
    code: `const queue = [];
queue.push('a');    // 入队（队尾）
queue.push('b');
queue.shift();      // 'a' —— 先进先出
// 大批量出队用循环数组或链表，避开 shift 的 O(n)`,
  },
  {
    id: 'hashtable',
    group: 'hash',
    name: '哈希表',
    en: 'Hash Table',
    space: 'O(n)',
    summary: '用哈希函数把键映射到桶数组下标，平均 O(1) 完成增删查。冲突用链地址法或开放寻址解决。',
    props: ['键值映射', '平均 O(1)', '需要处理冲突'],
    ops: [
      ['访问', 'O(1)', '平均，直接算下标'],
      ['查找', 'O(1)', '平均，按 key'],
      ['插入', 'O(1)', '平均，可能触发扩容'],
      ['删除', 'O(1)', '平均'],
    ],
    uses: ['字典、缓存、去重', '词频统计、索引、路由表'],
    pitfalls: ['哈希函数差或负载因子高会退化成链表的 O(n)', '键必须可哈希且不要在容器里被修改'],
    code: `const m = new Map();
m.set('apple', 3);   // 插入 / 更新，平均 O(1)
m.get('apple');      // 3
m.has('pear');       // false
m.delete('apple');   // 删除，平均 O(1)`,
  },
  {
    id: 'bst',
    group: 'tree',
    name: '二叉搜索树',
    en: 'Binary Search Tree',
    space: 'O(n)',
    summary: '左子树都比根小、右子树都比根大，中序遍历就是升序序列。查找路径取决于树高。',
    props: ['左小右大', '中序有序', '可能退化成链表'],
    ops: [
      ['访问', 'O(log n)', '平衡时'],
      ['查找', 'O(log n)', '每层砍掉一半'],
      ['插入', 'O(log n)', '沿比较路径下沉'],
      ['删除', 'O(log n)', '双子节点找后继接替'],
    ],
    uses: ['有序集合、范围查询', '数据库索引与 TreeMap 的基础思想'],
    pitfalls: ['按有序数据插入会退化成链表，最坏 O(n)', '删除有两个子节点的节点要用中序后继替换'],
    code: `function insert(node, value) {
  if (!node) return { value, left: null, right: null };
  if (value < node.value) node.left = insert(node.left, value);
  else if (value > node.value) node.right = insert(node.right, value);
  return node;   // 中序遍历即升序
}`,
  },
  {
    id: 'balanced-tree',
    group: 'tree',
    name: '平衡树',
    en: 'AVL / Red-Black Tree',
    space: 'O(n)',
    summary: '在 BST 上加平衡约束，用旋转把树高压在 O(log n)，避免「有序插入就退化」的老问题。',
    props: ['自动旋转保持平衡', '高度稳定 O(log n)', '实现与维护成本高'],
    ops: [
      ['访问', 'O(log n)', '稳定上界'],
      ['查找', 'O(log n)', '稳定上界'],
      ['插入', 'O(log n)', '含旋转修复'],
      ['删除', 'O(log n)', '修复最繁琐'],
    ],
    uses: ['标准库有序容器：std::map、TreeMap', '定时器、区间合并等需要稳定最坏复杂度的场景'],
    pitfalls: ['常数比数组和哈希表大，小数据不划算', 'AVL 更严、红黑树更松，旋转规则容易写错'],
    code: `// 左左失衡：对 y 右旋一次
function rotateRight(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  return x;   // 旋转后重算高度，保持 |平衡因子| ≤ 1
}`,
  },
  {
    id: 'heap',
    group: 'tree',
    name: '堆',
    en: 'Binary Heap',
    space: 'O(n)',
    summary: '完全二叉树，且父节点总是不小于（或不大于）子节点。它不排序，只保证堆顶是极值。',
    props: ['完全二叉树', '堆序：父 ≥ 子', '只保证堆顶最优'],
    ops: [
      ['访问', 'O(1)', '取堆顶极值'],
      ['查找', 'O(n)', '任意元素需扫描'],
      ['插入', 'O(log n)', '上浮 sift-up'],
      ['删除', 'O(log n)', '堆顶下沉 sift-down'],
    ],
    uses: ['优先队列、Top K', 'Dijkstra、定时器、任务调度'],
    pitfalls: ['遍历堆得到的不是有序序列', '大顶堆里找最小元素仍是 O(n)'],
    code: `// 小顶堆下沉：把较大的根一路换到叶子
function siftDown(h, i) {
  const l = i * 2 + 1, r = l + 1;
  let min = i;
  if (l < h.length && h[l] < h[min]) min = l;
  if (r < h.length && h[r] < h[min]) min = r;
  if (min !== i) { [h[i], h[min]] = [h[min], h[i]]; siftDown(h, min); }
}`,
  },
  {
    id: 'bplustree',
    group: 'tree',
    name: 'B+ 树',
    en: 'B+ Tree',
    space: 'O(n)',
    summary: '多路平衡搜索树：非叶子只做路由，数据全在叶子，叶子之间还有链表。为磁盘与页对齐而生。',
    props: ['多路、矮胖', '数据只在叶子', '范围扫描友好'],
    ops: [
      ['访问', 'O(log n)', '按页读，层数极少'],
      ['查找', 'O(log n)', '内部节点路由'],
      ['插入', 'O(log n)', '可能分裂节点'],
      ['删除', 'O(log n)', '可能合并节点'],
    ],
    uses: ['MySQL InnoDB、PostgreSQL 索引', '文件系统目录、键值存储的 SSTable'],
    pitfalls: ['分裂合并逻辑复杂，写放大明显', '扇出取决于页大小，不是树越高越好'],
    code: `// 非叶子只存分隔键，数据都在叶子，叶子用链表串联
        [ 10 | 20 | 30 ]          // 内部节点：路由
        /      |      |    \\
     [≤10]  [11–20] [21–30] [>30] // 叶子：真实数据 + 叶子链表
// 范围查询顺着叶子链表顺序读，不用回到根`,
  },
  {
    id: 'trie',
    group: 'tree',
    name: '字典树',
    en: 'Trie',
    space: 'O(字符总数)',
    summary: '按字符逐层建树，公共前缀只存一份。查一个词的成本只和词长有关，与词表大小无关。',
    props: ['按字符分层', '共享公共前缀', '前缀查询极快'],
    ops: [
      ['访问', 'O(m)', 'm 为词长'],
      ['查找', 'O(m)', '与词表规模无关'],
      ['插入', 'O(m)', '逐字符建节点'],
      ['删除', 'O(m)', '回溯清理分支'],
    ],
    uses: ['搜索联想、自动补全、拼写检查', 'IP 路由前缀匹配、敏感词过滤'],
    pitfalls: ['节点分散、指针多，内存开销大', '短词多、前缀差异大时还不如哈希表'],
    code: `const root = {};
function insert(word) {
  let node = root;
  for (const ch of word) node = node[ch] || (node[ch] = {});  // 公共前缀共享
  node.$ = true;                                              // 词尾标记
}`,
  },
  {
    id: 'graph',
    group: 'graph',
    name: '图',
    en: 'Graph',
    space: 'O(V+E)',
    summary: '点与边的集合，可以带权、可以有向。邻接表省空间，邻接矩阵查边快，选型看稠密度。',
    props: ['点 + 边', '邻接表 / 邻接矩阵', '可带权、有向'],
    ops: [
      ['访问', 'O(1)', '取某点邻居列表'],
      ['查找', 'O(V+E)', 'BFS / DFS 遍历'],
      ['插入', 'O(1)', '加一条边'],
      ['删除', 'O(V+E)', '需清理对应邻接'],
    ],
    uses: ['社交关系、路线规划、推荐', '依赖分析、知识图谱、状态机'],
    pitfalls: ['稠密图用邻接矩阵是 O(V²) 内存', '遍历必须标记已访问，否则有环就死循环'],
    code: `// 邻接表：每个点只存邻居，空间 O(V+E)
const g = new Map([['A', ['B', 'C']], ['B', ['A']], ['C', ['A']]]);
function bfs(start) {
  const seen = new Set([start]), q = [start];
  while (q.length) for (const n of g.get(q.shift()) || []) {
    if (!seen.has(n)) { seen.add(n); q.push(n); }
  }
  return seen;
}`,
  },
  {
    id: 'union-find',
    group: 'graph',
    name: '并查集',
    en: 'Union-Find',
    space: 'O(n)',
    summary: '只回答一个问题：两个元素是否连通。路径压缩 + 按秩合并后，单次操作接近 O(1)。',
    props: ['只维护连通性', '路径压缩 + 按秩合并', '近似 O(1)'],
    ops: [
      ['访问', '—', '不支持随机访问'],
      ['查找', 'O(α(n))', '找根，近似常数'],
      ['插入', 'O(1)', '新建独立集合'],
      ['删除', '—', '标准实现不支持拆分'],
    ],
    uses: ['连通分量、Kruskal 最小生成树', '账号合并、网络分组、朋友圈'],
    pitfalls: ['不支持拆分（删除）', '不做路径压缩会退化成链'],
    code: `const parent = new Map();
const find = x => parent.get(x) === x ? x : parent.set(x, find(parent.get(x))).get(x);
function union(a, b) { parent.set(find(a), find(b)); }   // 连通即合并`,
  },
];

export const dsComplexityNote = 'n = 元素数量 · m = 键或词长度 · V / E = 顶点 / 边数 · α 为反阿克曼函数（几乎等于常数）';
