const definitions=[
 ['Windows','Windows 10 / 11','https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows',[
 ['系统','语音输入',['Win','H'],'需要支持的语言与语音输入设置。'],['系统','打开快速链接菜单',['Win','X'],'菜单项目随系统版本变化。'],['窗口','最小化所有窗口',['Win','M'],'与显示桌面切换不同。'],['窗口','还原最小化的窗口',['Win','Shift','M'],'用于还原之前最小化的窗口。'],['窗口','切换左侧虚拟桌面',['Win','Ctrl','Left'],'需存在左侧虚拟桌面。'],['窗口','关闭当前虚拟桌面',['Win','Ctrl','F4'],'应用窗口通常移到其他桌面，不等于关闭所有应用。'],['系统','重置图形显示响应',['Win','Ctrl','Shift','B'],'Windows 运行时黑屏可尝试；可能提示音或闪屏，不用于开机自检无显示。'],['文件','打开所选项目属性',['Alt','Enter'],'适用于资源管理器等支持的界面。']
 ]],
 ['macOS','macOS','https://support.apple.com/en-us/102650',[
 ['窗口','最小化前台窗口',['Cmd','M'],'取决于当前应用窗口支持。'],['窗口','隐藏其他应用',['Cmd','Alt','H'],'隐藏除当前应用外的其他应用。'],['系统','打开表情与符号查看器',['Ctrl','Cmd','Space'],'输入界面与系统设置可能影响行为。'],['文件','Finder 显示隐藏文件',['Cmd','Shift','.'],'在 Finder 窗口中切换隐藏文件显示。'],['文件','Finder 移到废纸篓',['Cmd','Backspace'],'对选中项目执行，重要文件先确认。'],['文件','Finder 粘贴并移动已复制项目',['Cmd','Alt','V'],'先复制 Finder 中的文件，再在目标位置执行；不同于文稿剪切粘贴。'],['窗口','循环切换当前应用窗口',['Cmd','`'],'键位布局及应用支持可能影响操作。'],['系统','打开辅助功能快捷面板',['Alt','Cmd','F5'],'部分键盘需要同时按 Fn。']
 ]],
 ['Chrome','Chrome（Windows / Linux）','https://support.google.com/chrome/answer/157179',[
 ['书签','打开书签管理器',['Ctrl','Shift','O'],'适用于 Windows / Linux 默认键位。'],['书签','收藏所有当前标签页',['Ctrl','Shift','D'],'将当前窗口标签页保存至文件夹。'],['导航','打开清除浏览数据对话框',['Ctrl','Shift','Delete'],'只打开对话框；确认清除前检查范围。'],['开发','查看当前页源代码',['Ctrl','U'],'对支持的普通网页生效。'],['开发','打开 JavaScript 控制台',['Ctrl','Shift','J'],'勿粘贴来源不明的控制台脚本。'],['导航','重置页面缩放',['Ctrl','0'],'数字 0，不是字母 O。'],['导航','聚焦 Chrome 工具栏',['Alt','Shift','T'],'后续可使用方向键移动。'],['标签页','跳到第一个标签页',['Ctrl','1'],'数字 1；Ctrl+1 至 Ctrl+8 对应指定序号。']
 ]],
 ['VS Code','VS Code（Windows 默认键位）','https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf',[
 ['编辑','选择当前行',['Ctrl','L'],'焦点位于文本编辑器时使用。'],['编辑','选择全部匹配项',['Ctrl','Shift','L'],'为当前选中文字的匹配项添加选择，注意批量编辑范围。'],['编辑','在下方插入一行',['Ctrl','Enter'],'文本编辑器默认操作。'],['编辑','在上方插入一行',['Ctrl','Shift','Enter'],'文本编辑器默认操作。'],['编辑','切换自动换行',['Alt','Z'],'切换显示换行，不插入实际换行符。'],['开发','拆分编辑器',['Ctrl','\\'],'按当前布局拆分编辑器。'],['开发','切换集成终端',['Ctrl','`'],'显示或隐藏集成终端面板。'],['导航','转到文件中的符号',['Ctrl','Shift','O'],'依赖语言服务提供符号信息。']
 ]]
];
export const supplementalShortcuts=definitions.flatMap(([category,platform,source,rows])=>rows.map(([topic,title,keys,note],i)=>({id:'supplement-'+category.toLowerCase().replace(/\s/g,'-')+'-'+(i+1),category,platform,source,topic,title,strokes:[keys],note})));
