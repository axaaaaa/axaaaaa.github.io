import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import fetch_github_trending as trending
HTML = '<article class="Box-row"><h2><a href="/owner/repo">owner / repo</a></h2><p>A &amp; B</p><span itemprop="programmingLanguage">Python</span><a href="/owner/repo/stargazers">1,234</a><span class="d-inline-block float-sm-right">99 stars today</span></article>'
class Tests(unittest.TestCase):
    def test_parse(self):
        items = trending.parse_trending(HTML + HTML)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['description'],'A & B')
        self.assertEqual(items[0]['language'],'Python')
        self.assertEqual(items[0]['stars'],'1,234')
        self.assertEqual(items[0]['growth'],'99 stars today')
    def test_empty(self):
        with self.assertRaises(ValueError): trending.parse_trending('<html>error</html>')
    def test_partial_outage(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'trending.json'
            prior={'updatedAt':'2026-10-01T00:00:00Z','items':[{'name':'old/repo'}]}
            p.write_text(json.dumps({'periods':{'weekly':prior}}))
            def fetch(period):
                if period=='weekly': raise OSError('offline')
                return trending.parse_trending(HTML)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(trending,'fetch',side_effect=fetch): trending.main()
            data=json.loads(p.read_text())
            self.assertEqual(data['periods']['weekly'],prior)
            self.assertEqual(len(data['periods']['monthly']['items']),1)
    def test_total_outage(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'trending.json'; before=json.dumps({'periods':{'daily':{'items':[{'name':'old/repo'}]}}});p.write_text(before)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(trending,'fetch',side_effect=OSError('offline')):trending.main()
            self.assertEqual(p.read_text(),before)
if __name__=='__main__': unittest.main()
