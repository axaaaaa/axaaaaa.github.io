const field = (key, label, value, type = 'name') => ({ key, label, default: value, type });
const env = field('env', '环境名称', 'myenv');
const clone = field('clone', '新环境名称', 'myenv-copy');
const pkg = field('package', '包名', 'numpy');
const container = field('container', '容器名称', 'nax-web');
const service = field('service', '服务名称', 'nginx');
const file = field('file', '当前目录文件名', 'README.md');
const folder = field('folder', '子目录名称', 'nax-demo');
const port = field('port', 'TCP 端口', '8080', 'port');
const pid = field('pid', '进程 PID', '1234', 'integer');
const volume = field('volume', '数据卷名称', 'nax-data');
const image = field('image', '本地镜像标签', 'nax-demo');
// Explicit snippets: no execution, no remote secrets, parameters use constrained tokens.
const source = {
  Windows: 'https://learn.microsoft.com/en-us/powershell/module/',
  Linux: 'https://man7.org/linux/man-pages/',
  Anaconda: 'https://docs.conda.io/projects/conda/en/stable/commands/index.html',
  Docker: 'https://docs.docker.com/reference/cli/docker/',
};
const requirement = {
  Windows: 'Windows 10/11，PowerShell 5.1 或 7。网络 cmdlet 需要系统内置 NetTCPIP/DnsClient 模块；系统日志、完整进程信息可能需要管理员权限。文件操作在当前目录进行。',
  Linux: 'Linux Bash/sh；安装相应工具。ip 使用 iproute2，vmstat 使用 procps；systemctl/journalctl 仅适用于正在运行 systemd 的系统，日志访问可能需要 sudo 或相应组权限。',
  Anaconda: 'Anaconda/Miniconda 的 conda 命令可用。命名目标环境需存在；创建、克隆的目标环境名应尚未使用。联网操作需要可用通道。',
  Docker: 'Docker CLI 可用，引擎已启动且有访问权限。名称参数必须对应实际对象；新建对象名称应空闲。Compose 命令需要 v2 插件并在已检查配置的项目目录执行。',
};
const rows = [
  ['Windows', '文件', '读取文本文件', "Get-Content -LiteralPath '{{file}}'", '-LiteralPath 将输入作为实际文件名而非通配符。只读取文本内容，不修改文件；目标文件需要存在。', '输出文本文件的各行。', [file]],
  ['Windows', '文件', '查看文本末尾 50 行', "Get-Content -LiteralPath '{{file}}' -Tail 50", '-Tail 50 限制为末尾五十行，适合快速检查日志；不会持续追踪。目标应为文本文件。', '输出文件末尾的文本。', [file]],
  ['Windows', '文件', '计算文件 SHA-256', "Get-FileHash -LiteralPath '{{file}}' -Algorithm SHA256", '-Algorithm 指定 SHA-256。读取完整文件计算摘要，大文件耗时更长；不修改原文件。', '输出算法、摘要和路径。', [file]],
  ['Windows', '文件', '创建子目录', "New-Item -ItemType Directory -Path '{{folder}}'", '-ItemType Directory 创建目录。名称相对于当前目录；若已存在则可能报错，不带强制覆盖。', '当前目录出现新子目录。', [folder], '创建目录'],
  ['Windows', '文件', '进入子目录', "Set-Location -LiteralPath '{{folder}}'", '切换当前 PowerShell 会话目录。子目录必须存在；不影响其他终端窗口。', '后续相对路径以该目录为起点。', [folder], '更改当前终端目录'],
  ['Windows', '网络', '查看 IPv4 配置', 'Get-NetIPConfiguration', '汇总网卡的 IP、网关和 DNS 配置。虚拟网卡与 VPN 也可能出现在结果中。', '输出网卡与 IP 配置。'],
  ['Windows', '网络', '测试本机 TCP 端口', 'Test-NetConnection -ComputerName 127.0.0.1 -Port {{port}}', '-Port 指定单个 TCP 端口，测试本机是否能建立连接；TcpTestSucceeded 为 True 表示本次连接成功。', '输出 TCP 测试结果。', [port]],
  ['Windows', '网络', '查看 DNS 缓存', 'Get-DnsClientCache', '读取系统 DNS 客户端缓存。查询结果取决于此前解析记录；不会清空缓存。', '输出缓存的名称与记录。'],
  ['Windows', '网络', '清空 DNS 缓存', 'Clear-DnsClientCache', '清除本机 DNS 客户端缓存，不修改 DNS 服务器配置。随后访问域名会重新解析；如权限不足，请使用管理员终端。', '成功时通常没有输出。', [], '清理系统 DNS 缓存'],
  ['Windows', '网络', '查看路由表', 'Get-NetRoute', '列出本机路由，包括目的前缀、下一跳与接口信息。虚拟网卡会产生额外路由。', '输出 IPv4/IPv6 路由记录。'],
  ['Windows', '系统', '列出环境变量', 'Get-ChildItem Env:', 'Env: 是 PowerShell 环境变量驱动器。输出可能含令牌与凭据，不宜直接公开分享。', '显示当前进程环境变量。'],
  ['Windows', '系统', '查找可用命令', 'Get-Command -Name python -All', '-All 列出可找到的同名命令。可用于检查 Python 路径或别名冲突，未安装时会报查找错误。', '输出 python 的命令类型和来源。'],
  ['Windows', '系统', '查看进程详细信息', 'Get-Process -Id {{pid}} | Format-List *', '-Id 精确指定进程。Format-List * 展开可读取属性；权限不足的属性可能为空或报错，PID 必须存在。', '输出目标进程的属性列表。', [pid]],
  ['Windows', '系统', '查看最近系统事件', 'Get-WinEvent -LogName System -MaxEvents 20', '-LogName System 选择系统日志，-MaxEvents 20 限制数量。访问部分事件需要管理员权限。', '输出最近二十条系统事件。'],
  ['Windows', '帮助', '查看命令帮助', 'Get-Help Get-ChildItem -Examples', '-Examples 查看示例。若本机帮助未安装，显示内容可能较少，可进一步查阅 Microsoft 文档。', '输出命令示例或基础帮助。'],
  ['Windows', '系统', '查看已加载模块', 'Get-Module', '显示当前会话已经加载的模块，而非机器上全部可安装模块；不会安装或卸载模块。', '输出模块名、类型与版本。'],

  ['Linux', '文件', '读取文本文件', 'cat -- {{file}}', '-- 结束选项解析，后面是当前目录的文件名。适用于文本文件，不适合直接输出二进制内容。', '输出文件全文。', [file]],
  ['Linux', '文件', '查看文件开头 20 行', 'head -n 20 -- {{file}}', '-n 20 指定前二十行。不会修改文件，目标应存在且可读。', '输出文件开头内容。', [file]],
  ['Linux', '文件', '查看文件末尾 50 行', 'tail -n 50 -- {{file}}', '-n 50 显示末尾五十行，不会持续跟踪新增内容。', '输出文件末尾内容。', [file]],
  ['Linux', '文件', '持续跟踪文本日志', 'tail -f -- {{file}}', '-f 等待追加内容；Ctrl+C 仅结束查看。日志轮转后行为依实现而异，可按需求查阅 -F。', '持续显示新增文本。', [file]],
  ['Linux', '文件', '统计文件行数字数', 'wc -l -w -c -- {{file}}', '-l 统计换行符，-w 统计词，-c 统计字节；字节数并非 Unicode 字符数。', '输出行、词、字节数量。', [file]],
  ['Linux', '文件', '计算文件 SHA-256', 'sha256sum -- {{file}}', '读取文件生成 SHA-256 摘要。可用于与可信来源的摘要比对，不会修改文件。', '输出摘要与文件名。', [file]],
  ['Linux', '文件', '创建子目录', 'mkdir -- {{folder}}', '在当前目录创建一个子目录。名称已存在或父目录不可写时会报错；不带 -p。', '创建指定目录。', [folder], '创建目录'],
  ['Linux', '文件', '查找当前目录下的文件', 'find . -maxdepth 2 -type f', '点号表示当前目录，-maxdepth 2 限定两层，-type f 仅匹配普通文件。不会删除文件。', '输出匹配的相对路径。'],
  ['Linux', '文件', '列出块设备', 'lsblk -f', '-f 展示文件系统类型、标签与 UUID 等。只查询，不格式化设备。需要 util-linux 工具集。', '输出块设备与文件系统信息。'],
  ['Linux', '系统', '查看系统运行时长', 'uptime', '显示系统运行时间、用户数量和负载平均值。负载数不是 CPU 使用率百分比。', '输出运行时长与负载。'],
  ['Linux', '系统', '采样系统资源 5 次', 'vmstat 1 5', '间隔一秒输出五次；第一行通常是启动以来的平均值，后续行反映采样区间。', '输出内存、换页、IO 和 CPU 统计。'],
  ['Linux', '网络', '查看路由', 'ip route show', '读取默认路由表，default 行通常给出默认网关。不会添加或删除路由。', '输出 IPv4 路由。'],
  ['Linux', '网络', '测试本机回环', 'ping -c 4 127.0.0.1', '-c 4 发送四次 ICMP 请求。回环正常仅说明本机响应，精简容器可能未安装 ping。', '输出响应与丢包统计。'],
  ['Linux', '服务', '查看运行中的服务', 'systemctl list-units --type=service --state=running --no-pager', '仅适用于 systemd；按 service 类型和 running 状态筛选，--no-pager 避免进入分页器。', '输出运行服务清单。'],
  ['Linux', '服务', '查看服务状态', 'systemctl status {{service}} --no-pager', '查询服务状态和部分日志，服务名应按本机填写。非运行状态可能返回非零退出码，并不一定表示命令写错。', '输出目标服务状态。', [service]],
  ['Linux', '服务', '查看服务最近日志', 'journalctl -u {{service}} -n 100 --no-pager', '-u 指定服务，-n 100 限制最近一百条。日志完整性取决于当前用户权限。', '输出指定服务的最近日志。', [service]],

  ['Anaconda', '环境', '克隆已有环境', 'conda create -n {{clone}} --clone {{env}}', '-n 是尚未存在的新环境名，--clone 是源环境。会占用额外磁盘空间；新名称与源名称应不同。', '创建源环境的副本。', [clone, env], '创建环境副本'],
  ['Anaconda', '环境', '在指定环境运行 Python', 'conda run -n {{env}} python --version', '无需激活就使用目标环境中的 Python。该环境应安装 Python。', '输出目标环境的 Python 版本。', [env]],
  ['Anaconda', '环境', '查看环境变量配置', 'conda env config vars list -n {{env}}', '列出由 Conda 环境配置管理的变量。输出可能包含敏感值，不是当前 shell 所有变量的全集。', '输出环境配置变量。', [env]],
  ['Anaconda', '包管理', '更新一个软件包', 'conda update -n {{env}} {{package}}', '按通道与依赖约束更新指定包，可能调整其他依赖。执行前核对变更清单。', '更新包及相关依赖。', [env, pkg], '修改环境的软件包'],
  ['Anaconda', '包管理', '预览包更新计划', 'conda update -n {{env}} {{package}} --dry-run', '--dry-run 只求解并展示计划，不安装更新；可能仍会读取或更新索引缓存。', '输出拟更新的软件包。', [env, pkg]],
  ['Anaconda', '包管理', '移除环境内的软件包', 'conda remove -n {{env}} {{package}}', '移除指定包，求解器也可能移除依赖它的包。先查看清单；不等同于删除整个环境。', '指定环境的软件包集合改变。', [env, pkg], '删除环境中的软件包'],
  ['Anaconda', '包管理', '预览软件包安装', 'conda install -n {{env}} {{package}} --dry-run', '仅计算安装计划，不执行安装。可提前检查下载量和依赖变化。', '输出拟安装的软件包。', [env, pkg]],
  ['Anaconda', '导入导出', '打印显式包清单', 'conda list -n {{env}} --explicit', '--explicit 打印具体包地址，适合相同平台精确重建。输出可能带私有通道地址或令牌，分享前检查。', '输出显式规格列表，不自动写文件。', [env]],
  ['Anaconda', '导入导出', '导出手动安装的依赖', 'conda env export -n {{env}} --from-history', '--from-history 主要导出用户明确请求的 Conda 依赖，更简洁，但不代表完整锁定，也不完整记录 pip 安装内容。', '输出精简环境 YAML。', [env]],
  ['Anaconda', '导入导出', '按 YAML 更新环境', 'conda env update -n {{env}} -f environment.yml', '从当前目录 YAML 更新指定环境。未使用 --prune；仍可能调整依赖版本，先检查文件内容。', '目标环境与配置中的依赖要求同步。', [env], '修改环境的软件包'],
  ['Anaconda', '配置', '查看软件源通道', 'conda config --show channels', '读取当前生效的通道列表。不添加镜像、不改优先级。', '输出 channels 配置。'],
  ['Anaconda', '配置', '查看配置来源', 'conda config --show-sources', '显示参与配置合并的文件和配置项。可能包含私有地址或令牌，分享前先检查。', '输出配置文件来源及内容。'],
  ['Anaconda', '配置', '查看通道优先级', 'conda config --show channel_priority', '读取 strict、flexible 等通道优先级设置。不会修改配置。', '输出当前优先级策略。'],
  ['Anaconda', '清理', '清理下载包归档', 'conda clean --tarballs', '--tarballs 清理下载的包归档，不等于卸载已安装包。终端通常会要求确认；后续可能重新下载。', '释放包归档缓存空间。', [], '删除下载包归档缓存'],
  ['Anaconda', '清理', '清理索引缓存', 'conda clean --index-cache', '只清理软件源索引缓存。下次操作可能需要重新获取索引，不删除环境。', '移除索引缓存。', [], '删除索引缓存'],
  ['Anaconda', '帮助', '查看 Conda 子命令帮助', 'conda create --help', '--help 展示本机安装版本支持的参数，以本机帮助为准；不创建环境。', '输出 create 子命令说明。'],

  ['Docker', '容器', '检查容器详细配置', 'docker container inspect {{container}}', '读取容器 JSON 配置与状态，可能包含环境变量中的凭据。它不会改变配置。', '输出容器完整配置。', [container]],
  ['Docker', '容器', '查看容器端口映射', 'docker port {{container}}', '显示创建容器时发布的端口。未发布端口时可能没有输出。', '输出容器与宿主端口关系。', [container]],
  ['Docker', '容器', '查看容器内进程', 'docker top {{container}}', '查看运行容器内的进程。目标需要运行；平台决定可用输出格式。', '输出容器进程清单。', [container]],
  ['Docker', '容器', '进入容器 sh 终端', 'docker exec -it {{container}} sh', '-i 保持输入，-t 分配伪终端。目标需运行并包含 sh；精简无 shell 镜像不适用，输入 exit 返回。', '打开容器内交互 shell。', [container], '启动容器内交互进程'],
  ['Docker', '容器', '重启指定容器', 'docker restart {{container}}', '停止后重新启动同一容器，会中断服务。配置与挂载沿用原设置。', '目标容器重新运行。', [container], '重启运行服务'],
  ['Docker', '容器', '删除已停止的容器', 'docker rm {{container}}', '不带 -f，仅移除满足条件的停止容器。容器可写层中未持久化的数据会丢失；不主动删除命名卷。', '移除指定容器。', [container], '删除容器及其未持久化数据'],
  ['Docker', '数据卷', '列出数据卷', 'docker volume ls', '列出当前引擎管理的数据卷，不包括所有宿主机绑定目录。只查询。', '输出数据卷名称与驱动。'],
  ['Docker', '数据卷', '查看数据卷配置', 'docker volume inspect {{volume}}', '读取数据卷元数据及挂载位置，不输出卷中所有文件。目标卷应存在。', '输出数据卷 JSON。', [volume]],
  ['Docker', '数据卷', '创建命名数据卷', 'docker volume create {{volume}}', '创建用于持久化数据的命名卷；同名已存在时按引擎行为返回已有卷。此命令不自动挂载到容器。', '返回卷名称。', [volume], '创建数据卷'],
  ['Docker', '网络', '列出容器网络', 'docker network ls', '显示 Docker 管理的网络及驱动。与宿主机全部网卡列表不同。', '输出网络 ID、名称和驱动。'],
  ['Docker', '系统', '查看磁盘占用概要', 'docker system df', '统计镜像、容器、数据卷与构建缓存空间；不清理任何内容。共享层使简单相加不一定等于实际占用。', '输出 Docker 磁盘使用概要。'],
  ['Docker', '镜像', '构建当前目录镜像', 'docker build -t {{image}} .', '-t 指定本地标签，点号是构建上下文。需要当前目录 Dockerfile；构建会执行文件中的步骤，先检查内容和 .dockerignore。', '生成或更新本地镜像标签。', [image], '执行镜像构建并占用磁盘'],
  ['Docker', 'Compose', '检查 Compose 配置', 'docker compose config --quiet', '--quiet 只验证配置，成功时通常无输出，不启动服务。需要 v2 插件和目标项目配置文件。', '成功返回零退出码；有错误时输出原因。'],
  ['Docker', 'Compose', '查看 Compose 服务状态', 'docker compose ps -a', '-a 包括停止的项目容器。需在对应 Compose 项目目录执行。', '输出项目容器状态。'],
  ['Docker', 'Compose', '查看 Compose 最近日志', 'docker compose logs --tail 100', '查看项目各服务的近期日志，--tail 按每个容器限制输出；默认不持续跟踪。', '输出带服务前缀的日志。'],
  ['Docker', 'Compose', '构建 Compose 服务镜像', 'docker compose build', '依据配置为需要构建的服务生成镜像，不自动启动容器。先检查 build 上下文与 Dockerfile。', '生成或更新服务镜像。', [], '执行项目镜像构建'],
];
export const extraCommands = rows.map(([category, topic, title, command, explanation, result, params = [], impact = '只读查询'], index) => ({
  id: `extra-${category.toLowerCase()}-${index + 1}`, category, topic, title, command, explanation, result, params, impact,
  shell: category === 'Windows' ? 'PowerShell' : category === 'Linux' ? 'Bash / sh' : category === 'Anaconda' ? 'Anaconda Prompt / 已初始化的终端' : 'PowerShell / Bash / CMD',
  requirement: requirement[category], source: source[category], danger: /删除|停止|重启|终止/.test(impact),
}));
