const groups=[
 ['Windows','PowerShell（Windows）','Windows 10/11，Windows PowerShell 及对应系统模块可用；部分查询需管理员权限。',[
 ['系统信息','查看即插即用设备','Get-PnpDevice -PresentOnly','仅列出当前存在的设备及状态，异常状态不是单独的坏件结论。','https://learn.microsoft.com/en-us/powershell/module/pnpdevice/get-pnpdevice'],
 ['网络诊断','查看物理网卡状态','Get-NetAdapter -Physical','查看物理网卡名称、链路状态与速率。','https://learn.microsoft.com/en-us/powershell/module/netadapter/get-netadapter'],
 ['网络诊断','查看网络连接配置文件','Get-NetConnectionProfile','查看接口网络类别与 IPv4／IPv6 连通状态。','https://learn.microsoft.com/en-us/powershell/module/netconnection/get-netconnectionprofile'],
 ['磁盘存储','查看物理磁盘健康摘要','Get-PhysicalDisk | Select-Object FriendlyName,MediaType,HealthStatus,Size','健康摘要受设备与驱动支持影响，不代替完整检测。','https://learn.microsoft.com/en-us/powershell/module/storage/get-physicaldisk'],
 ['系统信息','查看内存条规格','Get-CimInstance Win32_PhysicalMemory | Select-Object DeviceLocator,Capacity,Speed,ConfiguredClockSpeed','显示固件报告的容量与频率信息，字段单位和完整性依平台而异。','https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-physicalmemory'],
 ['系统信息','查看显卡与驱动版本','Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,Status','列出系统识别的显示控制器；不用于准确判断现代显卡显存容量。','https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-videocontroller'],
 ['时间日期','查看时间同步状态','w32tm /query /status','显示 Windows 时间服务同步状态，服务未运行时可能报错。','https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings'],
 ['系统信息','查看可用睡眠状态','powercfg /a','列出系统支持的睡眠状态与部分不可用原因，不强行启用睡眠模式。','https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/powercfg-command-line-options']
 ]],
 ['Linux','Bash / sh','Linux，需安装对应命令；硬件和日志查询受权限、容器和发行版影响。',[
 ['系统信息','列出 PCI 设备','lspci -nn','显示 PCI 设备与数字厂商／设备 ID，需要 pciutils。','https://man7.org/linux/man-pages/man8/lspci.8.html'],
 ['系统信息','列出 USB 设备','lsusb','显示 USB 总线与设备，需要 usbutils。','https://man7.org/linux/man-pages/man8/lsusb.8.html'],
 ['磁盘存储','查看挂载关系','findmnt','按树形显示当前挂载点，不执行挂载或卸载。','https://man7.org/linux/man-pages/man8/findmnt.8.html'],
 ['磁盘存储','查看 inode 使用率','df -i','检查 inode 使用情况，区别于磁盘字节容量。','https://www.gnu.org/software/coreutils/manual/html_node/df-invocation.html'],
 ['磁盘存储','列出块设备型号','lsblk -o NAME,SIZE,TYPE,MODEL,MOUNTPOINTS','显示块设备、型号与挂载位置；旧版 util-linux 可能不支持 MOUNTPOINTS。','https://man7.org/linux/man-pages/man8/lsblk.8.html'],
 ['系统信息','查看内核启动参数','cat /proc/cmdline','读取本次启动的内核参数，不修改启动配置。','https://man7.org/linux/man-pages/man5/proc_cmdline.5.html'],
 ['日志审计','查看本次启动的内核日志','journalctl -k -b -n 100 --no-pager','查询本次启动的最近 100 条内核日志，需要 systemd journal。','https://www.freedesktop.org/software/systemd/man/latest/journalctl.html'],
 ['网络诊断','查看接口流量计数','ip -s link show','显示链路收发包及错误计数，计数并非实时带宽。','https://man7.org/linux/man-pages/man8/ip-link.8.html']
 ]],
 ['Git','PowerShell / Bash / CMD','安装 Git；除全局帮助外需在对应 Git 仓库中执行。',[
 ['历史','查看最近引用移动记录','git reflog -10','查看本地引用历史，不等同于远程备份，也不执行回退。','https://git-scm.com/docs/git-reflog'],
 ['仓库','列出关联工作区','git worktree list','列出该仓库管理的工作区及分支，不创建或移除工作区。','https://git-scm.com/docs/git-worktree'],
 ['仓库','定位仓库根目录','git rev-parse --show-toplevel','返回当前工作区顶层路径。','https://git-scm.com/docs/git-rev-parse'],
 ['分支','查看当前分支名称','git branch --show-current','分离 HEAD 时输出为空，并非命令故障。','https://git-scm.com/docs/git-branch'],
 ['历史','查看所有标签','git tag --list','列出本地标签，不创建或推送标签。','https://git-scm.com/docs/git-tag'],
 ['差异','汇总工作区修改规模','git diff --stat','汇总未暂存差异的文件和行数，不包含未跟踪文件。','https://git-scm.com/docs/git-diff'],
 ['远程同步','查看 origin 地址','git remote get-url origin','查看名为 origin 的远程地址；未配置时返回错误。','https://git-scm.com/docs/git-remote'],
 ['仓库','检查仓库对象完整性','git fsck --no-reflogs','检查对象及连通性，忽略 reflog 作为可达性根；不修复或删除对象。','https://git-scm.com/docs/git-fsck']
 ]],
 ['Docker','PowerShell / Bash / CMD','安装 Docker CLI 且能访问所选引擎；Compose 命令需要 Compose v2，配置类查询需项目配置。',[
 ['系统','查看当前 Docker context','docker context show','输出当前上下文名称，不切换目标引擎。','https://docs.docker.com/reference/cli/docker/context/show/'],
 ['系统','列出 Docker contexts','docker context ls','列出上下文及当前选中项，不切换连接目标。','https://docs.docker.com/reference/cli/docker/context/ls/'],
 ['网络','查看 Compose 插件版本','docker compose version','显示 Docker Compose 插件版本，不操作项目。','https://docs.docker.com/reference/cli/docker/compose/version/'],
 ['数据卷','查看镜像摘要','docker image ls --digests','列出本地镜像及可用摘要；并非所有镜像都有仓库摘要。','https://docs.docker.com/reference/cli/docker/image/ls/'],
 ['Compose','列出 Compose 配置卷名称','docker compose config --volumes','输出当前配置中声明的命名卷名称，不创建卷。','https://docs.docker.com/reference/cli/docker/compose/config/'],
 ['Compose','列出 Compose 服务名称','docker compose config --services','输出配置中的服务名，不启动容器。','https://docs.docker.com/reference/cli/docker/compose/config/'],
 ['Compose','查看 Compose 项目列表','docker compose ls','列出引擎中运行的 Compose 项目。','https://docs.docker.com/reference/cli/docker/compose/ls/'],
 ['Compose','查看当前项目全部容器','docker compose ps --all','列出当前项目容器，包括已停止项。','https://docs.docker.com/reference/cli/docker/compose/ps/']
 ]]
];
export const supplementalCommands=groups.flatMap(([category,shell,requirement,rows])=>rows.map(([topic,title,command,explanation,source],i)=>({id:'supplement-'+category.toLowerCase()+'-'+(i+1),category,shell,requirement,topic,title,command,explanation,source,result:'输出查询信息；具体内容由环境决定。',params:[],impact:'只读查询；不更改系统或仓库配置',danger:false})));
