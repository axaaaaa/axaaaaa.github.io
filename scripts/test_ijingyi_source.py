import unittest
from pathlib import Path
import fetch_extra_hotspots as x
class JingyiTests(unittest.TestCase):
 def test_tabs_and_filter(self):
  body='''<li lay-id="newthread">最新帖</li><li lay-id="reply">最新回复</li><li lay-id="hot">本周热帖</li><div class="layui-tab-content"><ul class="thread"><a href="thread-123-1-1.html">最新测试帖子</a><a href="uid-1">用户入口</a><a href="https://example.com/thread-2-1-1.html">外部链接</a><a href="thread-123-1-1.html">重复测试</a></ul><ul class="thread"><a href="thread-222-1-1.html">回复测试帖子</a></ul><ul class="thread"><a href="thread-333-1-1.html">每周热门帖子</a></ul>'''.encode()
  latest=x.parse_source('ijingyi_new',body);hot=x.parse_source('ijingyi_hot',body)
  self.assertEqual(len(latest),1)
  self.assertEqual(latest[0]['url'],'https://bbs.ijingyi.com/thread-123-1-1.html')
  self.assertEqual(hot[0]['title'],'每周热门帖子')
  self.assertEqual(hot[0]['meta'],'本周热帖')
 def test_invalid(self):
  for key in ['ijingyi_new','ijingyi_hot']:
   with self.assertRaises(ValueError):x.parse_source(key,b'<html>login</html>')
if __name__=='__main__':unittest.main()
