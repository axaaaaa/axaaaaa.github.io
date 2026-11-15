import { devtoolsShortcuts } from './devtools-shortcuts.mjs';
import { extendedShortcuts } from './extended-shortcuts.mjs';
import {photoshopShortcuts} from './photoshop-shortcuts.mjs';
import { officeShortcuts } from './office-shortcuts.mjs';
import { supplementalShortcuts } from './reference-shortcut-additions.mjs';
// Default shortcuts; customized keymaps and OS settings may override these.
export const shortcuts = [
  {
    "id": "windows-1",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "复制",
    "strokes": [
      [
        "Ctrl",
        "C"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-2",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "剪切",
    "strokes": [
      [
        "Ctrl",
        "X"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-3",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "粘贴",
    "strokes": [
      [
        "Ctrl",
        "V"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-4",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "撤销",
    "strokes": [
      [
        "Ctrl",
        "Z"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-5",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "全选",
    "strokes": [
      [
        "Ctrl",
        "A"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-6",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "切换应用",
    "strokes": [
      [
        "Alt",
        "Tab"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-7",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "关闭当前窗口",
    "strokes": [
      [
        "Alt",
        "F4"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-8",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "打开任务管理器",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "Esc"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-9",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "打开资源管理器",
    "strokes": [
      [
        "Win",
        "E"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-10",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "打开系统设置",
    "strokes": [
      [
        "Win",
        "I"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-11",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "锁定电脑",
    "strokes": [
      [
        "Win",
        "L"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-12",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "显示或隐藏桌面",
    "strokes": [
      [
        "Win",
        "D"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-13",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "截图工具",
    "strokes": [
      [
        "Win",
        "Shift",
        "S"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-14",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "剪贴板历史",
    "strokes": [
      [
        "Win",
        "V"
      ]
    ],
    "topic": "编辑",
    "note": "首次使用需启用剪贴板历史。",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-15",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "表情符号面板",
    "strokes": [
      [
        "Win",
        "."
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-16",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "运行对话框",
    "strokes": [
      [
        "Win",
        "R"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-17",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "打开搜索",
    "strokes": [
      [
        "Win",
        "S"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-18",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "任务视图",
    "strokes": [
      [
        "Win",
        "Tab"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-19",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "窗口贴靠左侧",
    "strokes": [
      [
        "Win",
        "Left"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-20",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "窗口贴靠右侧",
    "strokes": [
      [
        "Win",
        "Right"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-21",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "创建虚拟桌面",
    "strokes": [
      [
        "Win",
        "Ctrl",
        "D"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-22",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "切换右侧虚拟桌面",
    "strokes": [
      [
        "Win",
        "Ctrl",
        "Right"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-23",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "重命名文件",
    "strokes": [
      [
        "F2"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "windows-24",
    "category": "Windows",
    "platform": "Windows 10 / 11",
    "title": "新建文件夹",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "N"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.microsoft.com/en-gb/accessibility/windows/keyboard-shortcuts-in-windows"
  },
  {
    "id": "macos-1",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "复制",
    "strokes": [
      [
        "Cmd",
        "C"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-2",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "剪切",
    "strokes": [
      [
        "Cmd",
        "X"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-3",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "粘贴",
    "strokes": [
      [
        "Cmd",
        "V"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-4",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "撤销",
    "strokes": [
      [
        "Cmd",
        "Z"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-5",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "重做",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "Z"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-6",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "全选",
    "strokes": [
      [
        "Cmd",
        "A"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-7",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "查找",
    "strokes": [
      [
        "Cmd",
        "F"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-8",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "保存文稿",
    "strokes": [
      [
        "Cmd",
        "S"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-9",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "切换应用",
    "strokes": [
      [
        "Cmd",
        "Tab"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-10",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "退出应用",
    "strokes": [
      [
        "Cmd",
        "Q"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-11",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "关闭当前窗口",
    "strokes": [
      [
        "Cmd",
        "W"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-12",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "隐藏当前应用",
    "strokes": [
      [
        "Cmd",
        "H"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-13",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "聚焦搜索 Spotlight",
    "strokes": [
      [
        "Cmd",
        "Space"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-14",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "强制退出窗口",
    "strokes": [
      [
        "Cmd",
        "Alt",
        "Esc"
      ]
    ],
    "topic": "系统",
    "note": "打开强制退出应用选择窗口。Alt 对应 Option。",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-15",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "锁定屏幕",
    "strokes": [
      [
        "Ctrl",
        "Cmd",
        "Q"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-16",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "截取全屏",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "3"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-17",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "截取选定区域",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "4"
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-18",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "截屏与录屏工具",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "5"
      ]
    ],
    "topic": "系统",
    "note": "适用于 macOS Mojave 及更新版本。",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-19",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "Finder 前往文件夹",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "G"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "macos-20",
    "category": "macOS",
    "platform": "macOS 默认键位",
    "title": "Finder 新建文件夹",
    "strokes": [
      [
        "Cmd",
        "Shift",
        "N"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.apple.com/en-us/102650"
  },
  {
    "id": "chrome-1",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "新建标签页",
    "strokes": [
      [
        "Ctrl",
        "T"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-2",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "新建窗口",
    "strokes": [
      [
        "Ctrl",
        "N"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-3",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "新建无痕窗口",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "N"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-4",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "关闭当前标签页",
    "strokes": [
      [
        "Ctrl",
        "W"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-5",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "恢复关闭的标签页",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "T"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-6",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "切换下一个标签页",
    "strokes": [
      [
        "Ctrl",
        "Tab"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-7",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "切换上一个标签页",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "Tab"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-8",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "跳到最后一个标签页",
    "strokes": [
      [
        "Ctrl",
        "9"
      ]
    ],
    "topic": "标签页",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-9",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "聚焦地址栏",
    "strokes": [
      [
        "Ctrl",
        "L"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-10",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "查找页面内容",
    "strokes": [
      [
        "Ctrl",
        "F"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-11",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "刷新页面",
    "strokes": [
      [
        "Ctrl",
        "R"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-12",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "强制刷新页面",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "R"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-13",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "后退",
    "strokes": [
      [
        "Alt",
        "Left"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-14",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "前进",
    "strokes": [
      [
        "Alt",
        "Right"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-15",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "打开历史记录",
    "strokes": [
      [
        "Ctrl",
        "H"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-16",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "打开下载列表",
    "strokes": [
      [
        "Ctrl",
        "J"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-17",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "收藏当前页面",
    "strokes": [
      [
        "Ctrl",
        "D"
      ]
    ],
    "topic": "书签",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-18",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "显示或隐藏书签栏",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "B"
      ]
    ],
    "topic": "书签",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-19",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "打开开发者工具",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "I"
      ]
    ],
    "topic": "开发",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "chrome-20",
    "category": "Chrome",
    "platform": "Chrome · Windows / Linux",
    "title": "打印页面",
    "strokes": [
      [
        "Ctrl",
        "P"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://support.google.com/chrome/answer/157179"
  },
  {
    "id": "vs-code-1",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "命令面板",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "P"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-2",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "快速打开文件",
    "strokes": [
      [
        "Ctrl",
        "P"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-3",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "打开设置",
    "strokes": [
      [
        "Ctrl",
        ","
      ]
    ],
    "topic": "系统",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-4",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "打开快捷键设置",
    "strokes": [
      [
        "Ctrl",
        "K"
      ],
      [
        "Ctrl",
        "S"
      ]
    ],
    "topic": "系统",
    "note": "依次按两组快捷键，不是同时按下全部按键。",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-5",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "当前文件查找",
    "strokes": [
      [
        "Ctrl",
        "F"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-6",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "当前文件替换",
    "strokes": [
      [
        "Ctrl",
        "H"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-7",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "全局搜索",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "F"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-8",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "保存文件",
    "strokes": [
      [
        "Ctrl",
        "S"
      ]
    ],
    "topic": "文件",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-9",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "切换行注释",
    "strokes": [
      [
        "Ctrl",
        "/"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-10",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "格式化文档",
    "strokes": [
      [
        "Shift",
        "Alt",
        "F"
      ]
    ],
    "topic": "编辑",
    "note": "需为当前语言配置格式化程序。",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-11",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "向上移动一行",
    "strokes": [
      [
        "Alt",
        "Up"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-12",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "向下移动一行",
    "strokes": [
      [
        "Alt",
        "Down"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-13",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "向下复制一行",
    "strokes": [
      [
        "Shift",
        "Alt",
        "Down"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-14",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "删除当前行",
    "strokes": [
      [
        "Ctrl",
        "Shift",
        "K"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-15",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "选择下一个匹配项",
    "strokes": [
      [
        "Ctrl",
        "D"
      ]
    ],
    "topic": "编辑",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-16",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "跳转到行",
    "strokes": [
      [
        "Ctrl",
        "G"
      ]
    ],
    "topic": "导航",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-17",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "转到定义",
    "strokes": [
      [
        "F12"
      ]
    ],
    "topic": "导航",
    "note": "需对应语言扩展支持。",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-18",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "重命名符号",
    "strokes": [
      [
        "F2"
      ]
    ],
    "topic": "编辑",
    "note": "需对应语言扩展支持。",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-19",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "切换侧栏",
    "strokes": [
      [
        "Ctrl",
        "B"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  },
  {
    "id": "vs-code-20",
    "category": "VS Code",
    "platform": "VS Code · Windows 默认键位",
    "title": "关闭编辑器",
    "strokes": [
      [
        "Ctrl",
        "W"
      ]
    ],
    "topic": "窗口",
    "note": "",
    "source": "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
  }
].concat(supplementalShortcuts,photoshopShortcuts,officeShortcuts,extendedShortcuts,devtoolsShortcuts);
