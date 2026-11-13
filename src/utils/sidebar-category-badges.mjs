// Row-major positions in the 6 × 6 sidebar-categories.png atlas.
const labels = [
  '本地地址', 'AI-文字', 'AI-视觉', 'AI-听觉', '社交', '视频媒体',
  '程序开发', '云服务器', '游戏相关', 'Email邮箱', '软件下载', '系统',
  '设计资源', '编程工具', '编程语言', '音乐播放', '漏洞赏金', '杀毒安全',
  '游戏黑客', '逆向工具', '红队测试', '漏洞数据库', '安全社区', '生活信息',
  '学习资源', '科技与数码', '开源库', '在线工具', '接单平台', '数据平台',
  '金融支付', '医疗信息', '3D打印'
];
const slots = new Map(labels.map((label, index) => [label, index]));

export function categoryBadgePosition(name) {
  const index = slots.get(name) ?? 33; // Folder for newly added categories.
  return `${index % 6 * 20}% ${Math.floor(index / 6) * 20}%`;
}
