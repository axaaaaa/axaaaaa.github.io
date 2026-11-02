import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import fetch_news as news

class NewsTests(unittest.TestCase):
    def test_rss_and_url_validation(self):
        xml = '<rss><channel><item><title>AI &amp; 科技</title><link>https://example.com/1</link><pubDate>Sat, 31 Oct 2026 01:00:00 GMT</pubDate></item><item><title>bad</title><link>javascript:alert(1)</link><pubDate>Sat, 31 Oct 2026 01:00:00 GMT</pubDate></item></channel></rss>'
        rows = news.parse_feed(xml, 'RSS', 'AI 前沿')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['title'], 'AI & 科技')
    def test_atom(self):
        rows = news.parse_feed('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Model release</title><link href="https://example.com/model"/><updated>2026-10-31T01:00:00Z</updated></entry></feed>', 'Atom', 'AI 前沿')
        self.assertEqual(rows[0]['url'], 'https://example.com/model')
    def test_outage_preserves_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'news.json'
            before = '{"updatedAt":"2026-10-31T01:00:00Z","items":[{"title":"old"}]}'
            p.write_text(before, encoding='utf-8')
            with patch('sys.argv', ['fetch_news', '--output', str(p)]), patch.object(news, 'fetch', side_effect=OSError('offline')):
                news.main()
            self.assertEqual(p.read_text(encoding='utf-8'), before)
    def test_dedup_and_partial_outage(self):
        row = {'title': 'Test', 'url': 'https://example.com/1', 'source': 'IT之家', 'category': '科技动态', 'publishedAt': '2026-10-31T01:00:00+00:00'}
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'news.json'
            with patch('sys.argv', ['fetch_news', '--output', str(p)]), patch.object(news, 'fetch', return_value=[row, row]):
                news.main()
            self.assertEqual(len(json.loads(p.read_text(encoding='utf-8'))['items']), 1)

if __name__ == '__main__':
    unittest.main()
