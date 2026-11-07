const branch = { key: 'branch', label: '分支名称', default: 'feature/nax', type: 'gitref' };
const file = { key: 'file', label: '仓库内文件路径', default: 'README.md', type: 'path' };
const routerGroups = [
  ['Cisco IOS / IOS XE', 'Cisco IOS/IOS XE 的 EXEC 终端；部分 show 命令需要特权 EXEC（#）。不适用于所有家用路由器，具体以设备版本和 ? 帮助为准。', 'https://www.cisco.com/c/en/us/support/ios-nx-os-software/ios-software-releases-15-2m-t/products-command-reference-list.html', [
    ['查看版本与运行时间','show version','显示系统版本、硬件与运行时间；输出字段因设备而异。'],
    ['查看接口 IP 概要','show ip interface brief','汇总接口 IPv4 地址与物理、协议状态；不更改接口配置。'],
    ['查看 IPv4 路由','show ip route','显示当前 IPv4 路由表；没有路由不等于接口故障，需结合 VRF 配置。'],
    ['查看 ARP 表','show ip arp','显示已学习的 IPv4 邻居映射，并非全部在线设备。'],
    ['查看运行配置','show running-config','需要相应权限，配置可能含内部地址和凭据相关信息，分享前检查。'],
    ['查看缓冲日志','show logging','显示设备日志配置及可用缓冲日志；内容依日志级别和缓冲设置而定。'],
  ]],
  ['华为 VRP', '华为 VRP 用户视图或允许的查询视图；需要相应查询权限。型号、VRP 版本与业务板卡影响命令支持，先查看设备 ? 帮助。', 'https://info.support.huawei.com/hedex/api/pages/EDOC1000053358/YEF0907R/25/resources/en-us_cliref_0133018113.html', [
    ['查看 VRP 版本','display version','查询 VRP 软件与硬件版本，不修改设备。'],
    ['查看接口 IP 概要','display ip interface brief','显示接口 IPv4 地址、物理及协议状态；二层接口未必具有 IP 信息。'],
    ['查看路由表','display ip routing-table','读取当前 IPv4 路由概要，VPN 实例的路由需另外指定实例。'],
    ['查看 ARP 信息','display arp','显示设备维护的 ARP 映射；输出格式依平台而异。'],
    ['查看当前配置','display current-configuration','读取当前生效配置，可能包含敏感信息；不会自动保存配置。'],
    ['查看日志缓冲','display logbuffer','读取日志缓冲内容，条目数量与日志配置有关。'],
  ]],
  ['OpenWrt', 'OpenWrt SSH/本地 ash 终端，相关命令或 ubus 对象需存在；通常使用设备管理账户。命令是系统查询，不适用于 Cisco/华为配置终端。', 'https://openwrt.org/docs/guide-user/base-system/uci', [
    ['查看系统板卡信息','ubus call system board','读取 board 对象的板卡、固件和发布信息。'],
    ['查看系统状态','ubus call system info','读取运行时间、负载和内存等信息；不会重启设备。'],
    ['查看网络配置','uci show network','打印 UCI 网络配置，不提交变更；可能含内部地址。'],
    ['查看网络接口状态','ubus call network.interface dump','列出 netifd 管理的逻辑接口状态，与全部物理端口状态不同。'],
    ['查看系统日志','logread','输出当前日志环形缓冲，重启前历史可能未持久化。'],
    ['查看内核路由','ip route','读取默认 IPv4 路由表，命令支持依固件自带的 ip 实现而异。'],
  ]],
  ['MikroTik RouterOS', 'MikroTik RouterOS CLI，账户具备对应 read 权限；不是 Linux shell。v6/v7 菜单、字段和路由功能存在差异。', 'https://help.mikrotik.com/docs/', [
    ['查看设备资源','/system resource print','查询版本、运行时间、CPU 与内存等信息。'],
    ['查看接口','/interface print','列出接口与标志，不启用或禁用接口。'],
    ['查看 IPv4 地址','/ip address print','读取接口地址配置，不添加或删除地址。'],
    ['查看 IPv4 路由','/ip route print','显示路由项及状态，v6/v7 的字段与标志可能不同。'],
    ['查看 ARP 映射','/ip arp print','列出 ARP 缓存和静态项，不代表全部在线设备。'],
    ['查看系统日志','/log print','显示当前可见日志，保存周期取决于日志动作配置。'],
  ]],
];
const routers = routerGroups.flatMap(([topic,requirement,source,rows],groupIndex) => rows.map(([title,command,explanation],index)=>({
  id:`router-${groupIndex}-${index}`,category:'路由器',topic,title,command,explanation,
  result: '输出对应设备信息；如提示未知命令或权限不足，请核对系统版本、模式和账户权限。',
  params:[],impact:'只读查询',danger:false,shell:topic === 'OpenWrt' ? 'OpenWrt ash' : `${topic} CLI`,requirement,source,
})));
const gitRows = [
  ['仓库','查看 Git 版本','git --version','查询本机 Git 版本；部分操作如 switch/restore 要求 Git 2.23 或更新版本。'],
  ['仓库','初始化仓库','git init','在当前目录创建或初始化 .git，不自动提交文件；先确认当前目录。',[],'创建仓库元数据'],
  ['仓库','查看仓库状态','git status --short --branch','以简洁格式显示分支、暂存区和工作区状态，不修改文件。'],
  ['配置','查看仓库配置来源','git config --list --show-origin','显示生效配置和来源，可能含用户名、邮箱与私有远程地址，分享前检查。'],
  ['提交','暂存单个文件','git add -- {{file}}','将文件当前内容放入暂存区；之后的修改需要再次 add。', [file],'修改暂存区'],
  ['提交','提交暂存内容','git commit -m "Update README"','仅提交暂存区内容；先核对 git diff --cached，需已配置提交身份。示例提交信息可自行编辑。',[],'创建本地提交'],
  ['差异','查看未暂存修改','git diff','对比工作区与暂存区；未跟踪文件不显示在普通 diff 中。'],
  ['差异','查看已暂存修改','git diff --cached','对比暂存区与当前提交，用于提交前核对。'],
  ['历史','查看最近提交','git log -10 --oneline --decorate','显示最近十个可达提交、简写标识和引用，不改历史。'],
  ['历史','查看所有分支提交图','git log --graph --oneline --decorate --all -30','图形展示最多三十个可达提交与引用；隐藏历史不代表被删除。'],
  ['历史','查看上次提交改动','git show --stat HEAD','HEAD 指向当前提交；--stat 展示文件改动概要，不是完整补丁。'],
  ['分支','列出本地与远程跟踪分支','git branch --all','只查看本地引用中的分支，不自动联网刷新。'],
  ['分支','创建并切换分支','git switch -c {{branch}}','需 Git 2.23+，目标名称应未使用；未提交修改可能影响切换。',[branch],'创建并切换本地分支'],
  ['分支','切换已有分支','git switch {{branch}}','切换工作区到已有分支；冲突的未提交改动可能阻止切换。',[branch],'切换分支及工作区'],
  ['分支','合并指定分支','git merge {{branch}}','将指定分支合入当前分支，可能产生冲突或合并提交；先提交或妥善保存现有修改。',[branch],'修改工作区并可能创建提交'],
  ['远程同步','查看远程地址','git remote -v','显示远程名称与 fetch/push 地址，分享前检查私有地址或嵌入式凭据。'],
  ['远程同步','获取远程引用','git fetch origin','需要名为 origin 的远程和网络权限；更新远程跟踪引用，不直接合并当前工作区。',[],'更新远程跟踪引用'],
  ['远程同步','仅快进拉取','git pull --ff-only','当前分支须配置上游；只接受快进更新，历史分叉时失败，不自动 rebase 或合并。',[],'更新本地分支和工作区'],
  ['远程同步','预览推送分支','git push --dry-run origin {{branch}}','需要远程写入或协商权限；预览不更新远程引用，但仍会联网认证。',[branch],'联网预览推送'],
  ['远程同步','推送分支并设置上游','git push -u origin {{branch}}','将本地分支推送到 origin 并记录上游，需要远程权限；不使用强制推送。',[branch],'更新远程仓库引用'],
  ['暂存工作','保存未完成工作','git stash push -u -m "NaX work in progress"','保存已跟踪修改及未跟踪文件，通常清理这些工作区修改；忽略文件不包含在 -u 中。',[],'暂存并移走工作区修改'],
  ['暂存工作','列出 stash 记录','git stash list','列出本地临时存储记录，不恢复或删除内容。'],
  ['暂存工作','恢复最近 stash 并保留记录','git stash apply','将最新 stash 应用至工作区，可能冲突；与 pop 不同，成功后也保留记录。',[],'恢复并修改工作区'],
  ['撤销','取消文件暂存','git restore --staged -- {{file}}','需 Git 2.23+，从 HEAD 恢复暂存区对应文件，工作区内容保留；尚无首个提交时不适用。',[file],'修改暂存区'],
];
const git = gitRows.map(([topic,title,command,explanation,params=[],impact='只读查询'],index)=>({
  id:`git-${index+1}`,category:'Git',topic,title,command,explanation,params,impact,
  danger:/修改|移走|推送|更新远程仓库/.test(impact),shell:'Git Bash',
  requirement:'已安装 Git，推荐 Git 2.23+；除版本查询和初始化外，在 Git 仓库目录执行。提交需配置身份；远程命令需对应远程/上游及访问权限。',
  result: impact==='只读查询' ? '在终端输出对应仓库信息；无提交、无记录等状态可能返回空结果或提示。' : `按说明执行：${impact}。执行后可用 git status 核对。`,
  source:`https://git-scm.com/docs/git-${command.split(' ')[1] === '--version' ? 'version' : command.split(' ')[1]}`,
}));
export const routerGitCommands = [...routers,...git];
