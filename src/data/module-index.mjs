import { markRaw } from 'vue';
import {
  Collection, Grid, Connection, Cpu, MagicStick, Setting, Refresh, Lock,
  Key, Picture, EditPen, Tools, Monitor, Lightning, Operation, TrendCharts, Share, Notebook, Guide,
} from '@element-plus/icons-vue';

// 知识区 / 工具区模块索引：顶部 sticky 导航与首屏快捷入口共用。
export const moduleGroups = [
  {
    title: '知识区',
    id: 'knowledge-zone',
    items: [
      { label: '命令速查', ref: 'commandLibrary', id: 'command-library', component: 'CommandLibrary', openKey: 'libraryExpanded', icon: markRaw(Collection) },
      { label: '快捷键速查', ref: 'shortcutLibrary', id: 'shortcut-library', component: 'ShortcutLibrary', openKey: 'opened', icon: markRaw(Grid) },
      { label: '网络知识', ref: 'networkReference', id: 'network-reference', component: 'NetworkReference', openKey: 'opened', icon: markRaw(Connection) },
      { label: '计算机底层', ref: 'computerFundamentals', id: 'computer-fundamentals', component: 'ComputerFundamentals', openKey: 'opened', icon: markRaw(Cpu) },
      { label: '人工智能', ref: 'aiKnowledge', id: 'ai-knowledge', component: 'AIKnowledge', openKey: 'opened', icon: markRaw(MagicStick) },
      { label: '硬件天梯图', ref: 'hardwareTiers', id: 'hardware-tiers', component: 'HardwareTierList', openKey: 'opened', icon: markRaw(TrendCharts) },
      { label: '系统安装', ref: 'systemInstallation', id: 'system-installation', component: 'SystemInstallation', openKey: 'opened', icon: markRaw(Setting) },
      { label: '逆向手册', ref: 'reverseHandbook', id: 'reverse-handbook', component: 'ReverseHandbook', openKey: 'opened', icon: markRaw(Refresh) },
      { label: '漏洞手册', ref: 'vulnerabilityHandbook', id: 'vulnerability-handbook', component: 'VulnerabilityHandbook', openKey: 'opened', icon: markRaw(Lock) },
      { label: '数据结构', ref: 'dataStructures', id: 'data-structures', component: 'DataStructures', openKey: 'opened', icon: markRaw(Share) },
      { label: '编程语言', ref: 'programmingLanguages', id: 'programming-languages', component: 'ProgrammingLanguages', openKey: 'opened', icon: markRaw(Notebook) },
      { label: '汇编语言', ref: 'assemblyGuide', id: 'assembly-guide', component: 'AssemblyGuide', openKey: 'opened', icon: markRaw(Guide) },
    ],
  },
  {
    title: '工具区',
    id: 'tools-zone',
    items: [
      { label: '密码学', ref: 'cryptoPlayground', id: 'crypto-playground', component: 'CryptoPlayground', openKey: 'opened', icon: markRaw(Key) },
      { label: '图片工具', ref: 'imageTools', id: 'image-tools', component: 'UtilityToolbox', openKey: 'opened', icon: markRaw(Picture) },
      { label: '文字工具', ref: 'textTools', id: 'text-tools', component: 'UtilityToolbox', openKey: 'opened', icon: markRaw(EditPen) },
      { label: '实用工具箱', ref: 'utilityToolbox', id: 'utility-toolbox', component: 'UtilityToolbox', openKey: 'opened', icon: markRaw(Tools) },
      { label: '装机与系统', ref: 'systemTools', id: 'system-tools', component: 'SystemTools', openKey: 'opened', icon: markRaw(Monitor) },
      { label: '电学知识', ref: 'electricityLibrary', id: 'electricity-library', component: 'ElectricityLibrary', openKey: 'opened', icon: markRaw(Lightning) },
      { label: '终端练习', ref: 'linuxTerminal', id: 'linux-terminal', component: 'LinuxTerminal', openKey: 'opened', icon: markRaw(Operation) },
    ],
  },
];

export const allModules = moduleGroups.flatMap(group => group.items);
