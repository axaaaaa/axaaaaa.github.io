import unittest
from fetch_extra_hotspots import parse_source

class DoubanBookTests(unittest.TestCase):
 def test_new_books(self):
  book = '''<li><img src="https://img3.doubanio.com/view/subject/s/public/s123.jpg">
  <div class="title"><a href="https://book.douban.com/subject/123/?ref=x">A &amp; B</a></div>
  <span class="author">Author</span><span class="year">2026-10</span><span class="publisher">Press</span></li>'''
  body=('<ul class="list-express">'+book+book+book.replace('book.douban.com','other.example')+'</ul>').encode()
  self.assertEqual(parse_source('douban_book',body),[{
   'title':'A & B','url':'https://book.douban.com/subject/123/',
   'meta':'Author · 2026-10 · Press','cover':'https://img3.doubanio.com/view/subject/s/public/s123.jpg'}])

 def test_unrelated_section(self):
  with self.assertRaises(ValueError):
   parse_source('douban_book',b'<ul class="popular"><li>Not new</li></ul>')
