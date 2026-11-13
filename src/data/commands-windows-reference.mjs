const docs = 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/';
const admin = '需要管理员权限';
const rows = [
  ['change-dir', 'CMD', '文件', '切换目录（cd / chdir）', 'cd /d "C:\\Users"', '/d 同时切换驱动器和目录；chdir 是同义命令。', '当前工作目录改变。', '更改当前 CMD 会话'],
  ['mkdir', 'CMD', '文件', '创建目录（md / mkdir）', 'mkdir "example-folder"', 'md 和 mkdir 在 CMD 中等价。', '创建示例目录。', '创建目录', 'md'],
  ['del', 'CMD', '文件', '删除文件', 'del "test.txt"', '按指定路径删除文件，通常不经过回收站。', '删除指定文件。', '删除文件', 'del', true],
  ['rmdir', 'CMD', '文件', '删除空目录（rd / rmdir）', 'rmdir "example-folder"', 'rd 和 rmdir 等价；不带 /s 时仅删除空目录。', '删除指定空目录。', '删除目录', 'rd', true],
  ['copy', 'CMD', '文件', '复制文件', 'copy "a.txt" "b.txt"', '将源文件复制到目标路径；先确认目标文件是否已存在。', '生成目标副本。', '可能覆盖目标文件', 'copy', true],
  ['xcopy', '通用', '文件', '递归复制目录', 'xcopy "C:\\source" "D:\\backup" /e /i', '/e 包含空子目录，/i 将尚不存在的目标视作目录。', '复制文件与子目录。', '写入目标目录'],
  ['robocopy', '通用', '文件', '可续传地复制目录', 'robocopy "C:\\source" "D:\\backup" /E /Z', '/E 包含空子目录，/Z 启用可重启模式；/MIR 会删除目标中源目录没有的项目，本例未使用。', '复制目录并显示汇总。', '写入目标目录'],
  ['move', 'CMD', '文件', '移动或重命名文件', 'move "a.txt" "b.txt"', '示例在当前目录重命名文件；目标也可以是其他目录。', '源路径发生变化。', '移动文件，可能覆盖目标', 'move', true],
  ['attrib', '通用', '文件', '查看文件属性', 'attrib "test.txt"', '不带修改开关时查看属性；+h/-h 设置或移除隐藏，+r/-r 设置或移除只读。', '输出文件属性。'],
  ['telnet', '通用', '网络诊断', '用 Telnet 测试 TCP 端口', 'telnet example.com 80', '需启用 Windows 的 Telnet 客户端。建立 TCP 连接不代表应用协议正常；Ctrl+] 后输入 quit 退出。', '连接成功或返回错误。', '发起网络连接'],
  ['taskkill', '通用', '进程', '按 PID 强制结束进程', 'taskkill /pid {{pid}} /f', '先用 tasklist 确认 PID；/f 会强制结束进程，未保存的数据可能丢失。', '结束目标进程或显示错误。', '强制结束进程', 'taskkill', true],
  ['shutdown-delay', '通用', '系统', '60 秒后关机', 'shutdown /s /t 60', '/s 指定关机，/t 指定倒计时秒数；非零超时会隐含强制关闭应用。', '开始关机倒计时。', '计划关机，未保存数据可能丢失', 'shutdown', true],
  ['shutdown-cancel', '通用', '系统', '取消待执行的关机', 'shutdown /a', '在倒计时结束前执行。', '取消当前关机计划。', '取消关机计划', 'shutdown'],
  ['sfc', '通用', '系统', '扫描并修复系统文件', 'sfc /scannow', '扫描受保护的系统文件，尝试修复检测到的损坏。', '输出扫描及修复结果。', '可能修复系统文件', 'sfc', true, admin],
  ['chkdsk', '通用', '磁盘', '检查磁盘文件系统', 'chkdsk C:', '默认检查并报告状态；添加 /f 才修复错误，系统卷可能需重启。', '输出卷检查报告。', '只读检查', 'chkdsk', false, admin],
  ['net-user', '通用', '用户', '列出本地用户', 'net user', '不带用户名时列出本地账号；追加用户名可查看该账号详情。', '输出本地用户列表。', '', 'net-user'],
  ['net-user-add', '通用', '用户', '添加本地用户', 'net user {{username}} * /add', '星号让终端交互提示输入密码，避免将明文密码写入命令。', '创建本地账号。', '新增本地账号', 'net-user', true, admin],
  ['net-admin-add', '通用', '用户', '将用户加入本地管理员组', 'net localgroup Administrators {{username}} /add', '确认目标用户与系统中的管理员组名称；组名因系统语言而异。', '赋予指定用户本地管理员权限。', '授予管理员权限', 'net-localgroup', true, admin],
  ['net-share', '通用', '网络共享', '查看本机共享', 'net share', '不带参数列出共享；创建共享的语法为 net share 共享名=本地路径，需检查访问权限。', '输出共享名称与路径。', '', 'net-share'],
  ['net-use', '通用', '网络共享', '连接或断开网络共享', 'net use Z: "\\\\SERVER\\SHARE"', '将示例服务器和共享名替换为实际值；不带参数列出现有连接，net use Z: /delete 断开示例映射。', '映射共享到 Z:，或显示连接错误。', '建立网络驱动器映射', 'net-use'],
  ['net-stop', '通用', '系统', '停止 Windows 服务', 'net stop {{service}}', '填入服务名称而非进程名；停止可能影响依赖该服务的程序。', '停止服务或显示错误。', '停止服务', 'net-stop', true, admin],
  ['net-start', '通用', '系统', '启动 Windows 服务', 'net start {{service}}', '填入服务名称；不带参数时列出已经启动的服务。', '启动服务或显示错误。', '启动服务', 'net-start', false, admin],
  ['runas', '通用', '用户', '以其他用户身份运行 CMD', 'runas /user:Administrator cmd', '要求账户已启用并输入密码；runas 切换运行身份，不等同于通过 UAC 提升当前账户。', '以指定账户启动新的 CMD。', '以指定账户启动程序'],
  ['cipher-wipe', '通用', '磁盘', '覆盖卷上的可用空间', 'cipher /w:C:\\', '/w 覆盖指定目录所在卷的可用空间，不删除现有文件；耗时较长，不等同于 SSD 安全擦除。', '覆盖卷的可用空间。', '覆盖可用空间，已删除的数据可能无法恢复', 'cipher', true],
  ['icacls', '通用', '文件', '查看文件权限（icacls / cacls）', 'icacls "test.txt"', '不带修改选项时显示访问控制列表；修改可用 /grant 等选项。旧版 cacls 已弃用。', '输出文件的访问控制条目。'],
  ['echo', 'CMD', '终端操作', '显示文本', 'echo hello', '在终端或批处理中输出文本；@echo off 可关闭批处理中的命令回显。', '输出 hello。'],
  ['pause', 'CMD', '终端操作', '等待按键', 'pause', '暂停执行，等待用户按任意键继续。', '按键后继续执行。', '暂停当前批处理'],
  ['exit', 'CMD', '终端操作', '退出命令提示符', 'exit', '退出当前 cmd.exe；批处理用 exit /b 可仅退出当前脚本。', '关闭当前 CMD 会话。', '结束当前 CMD 会话'],
  ['set-value', 'CMD', '环境', '设置当前会话变量', 'set "APP_MODE=demo"', '等号两侧不加空格；set 不带参数是查看变量，赋值只影响当前进程及其后续子进程。', 'APP_MODE 设为 demo。', '修改当前会话变量', 'set_1'],
  ['for-f', 'CMD', '批处理', '逐行读取文本文件', 'for /f "usebackq delims=" %I in ("notes.txt") do @echo %I', '这是交互式 CMD 写法；在 .bat 中把 %I 改为 %%I。默认跳过空行及以分号开头的行。', '输出读取到的文本行。', '', 'for'],
  ['call', 'CMD', '批处理', '调用另一个批处理脚本', 'call "example.bat"', '将 example.bat 替换为脚本路径；子脚本完成后返回调用处。', '运行脚本后返回。', '运行指定脚本'],
  ['start', 'CMD', '终端操作', '启动程序', 'start "" notepad.exe', '第一个带引号的参数是窗口标题，空字符串是占位。', '启动记事本。', '启动程序'],
  ['assoc', 'CMD', '文件', '查看扩展名关联', 'assoc .txt', '不带等号时查询扩展名关联；可用 ftype 继续查看该文件类型的打开命令。', '输出 .txt 对应的文件类型。'],
  ['ftype', 'CMD', '文件', '查看文件类型的打开命令', 'ftype txtfile', '先用 assoc .txt 获取实际类型名，再查询该类型的打开命令。', '输出类型对应的打开命令。'],
  ['choco', '通用', '软件管理', '使用 Chocolatey 安装 Git', 'choco install git', '需预装 Chocolatey；在确认提示中检查软件包来源，系统级安装通常需要提升权限。', '下载并安装 Git。', '安装软件', 'https://docs.chocolatey.org/en-us/choco/commands/install/'],
  ['wt', '通用', '终端操作', '启动 Windows Terminal 配置', 'wt -p "PowerShell"', '需安装 Windows Terminal，并存在名为 PowerShell 的配置文件；名称应以本机设置为准。', '打开指定终端配置。', '启动终端', 'https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments'],
  ['backup-bat', 'CMD', '批处理', '批处理示例：备份文件', String.raw`@echo off
REM 示例：自动备份文件
set "SRC=C:\source"
set "DEST=D:\backup"
xcopy "%SRC%" "%DEST%" /e /i /y
if errorlevel 1 (
  echo 备份失败，请检查源目录和目标路径。
  pause
  exit /b 1
)
echo 备份完成
pause`, '保存为 .bat 后运行。先调整源与目标路径；/y 会覆盖同名文件而不再询问。', '复制目录，显示成功或失败并等待按键。', '复制文件并覆盖同名目标文件', 'xcopy', true],
];

const name = (key, label, defaultValue) => ({ key, label, default: defaultValue, type: 'name' });
const parameters = {
  taskkill: [{ key: 'pid', label: '进程 PID', default: '1234', type: 'integer' }],
  'net-user-add': [name('username', '用户名', 'example-user')],
  'net-admin-add': [name('username', '用户名', 'example-user')],
  'net-stop': [name('service', '服务名称', 'ExampleService')],
  'net-start': [name('service', '服务名称', 'ExampleService')],
};

export const windowsReferenceCommands = rows.map(([id, environment, topic, title, command, explanation, result, impact, doc, danger = false, permission]) => ({
  id: 'windows-reference-' + id,
  category: 'Windows',
  environment,
  topic,
  title,
  command,
  explanation,
  result,
  impact: impact || '只读查询',
  source: doc?.startsWith('https://') ? doc : docs + (doc || id),
  requirement: environment === 'CMD' ? 'Windows；在命令提示符中使用，脚本示例须保存为 .bat。' : 'Windows 10/11；命令需在当前环境可用。',
  params: parameters[id] || [],
  danger,
  permission,
}));
