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
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(trending,'fetch',side_effect=fetch),patch.object(trending,'translate_title',return_value='中文简介'): trending.main()
            data=json.loads(p.read_text(encoding='utf8'))
            self.assertEqual(data['periods']['weekly'],prior)
            self.assertEqual(len(data['periods']['monthly']['items']),1)
    def test_localize_cache_and_failure(self):
        rows=[{'description':'Cached','growth':'1,234 stars this week'},
              {'description':'Fresh'},{'description':'Fresh'},
              {'description':'Unavailable'},{'description':'中文原文'}]
        previous={'weekly':{'items':[{'description':'Cached','descriptionZh':'缓存译文'}]}}
        def translate(text):
            if text=='Unavailable':raise OSError('offline')
            return '新译文'
        with patch.object(trending,'translate_title',side_effect=translate) as translator:
            trending.localize_periods({'daily':{'items':rows}},previous)
        self.assertEqual(translator.call_count,2)
        self.assertEqual(rows[0]['growthZh'],'本周新增 1,234 星')
        self.assertEqual(rows[0]['descriptionZh'],'缓存译文')
        self.assertEqual(rows[1]['descriptionZh'],rows[2]['descriptionZh'])
        self.assertNotIn('descriptionZh',rows[3])
        self.assertEqual(rows[3]['description'],'Unavailable')
        self.assertNotIn('descriptionZh',rows[4])

    def test_total_outage(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'trending.json'; before=json.dumps({'periods':{'daily':{'items':[{'name':'old/repo'}]}}});p.write_text(before)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(trending,'fetch',side_effect=OSError('offline')):trending.main()
            self.assertEqual(p.read_text(),before)
if __name__=='__main__': unittest.main()
