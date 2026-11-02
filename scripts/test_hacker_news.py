import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_hacker_news as hn
class Tests(unittest.TestCase):
    def test_normalize(self):
        r=hn.normalize({'id':1,'type':'story','title':'Test','score':9,'descendants':2,'url':'javascript:bad'})
        self.assertEqual(r['url'],'https://news.ycombinator.com/item?id=1');self.assertEqual(r['points'],9)
    def test_invalid(self):
        for r in [None,{}, {'id':True,'type':'story','title':'bad'},{'id':1,'type':'story','title':'bad','dead':True}]:self.assertIsNone(hn.normalize(r))
    def test_order(self):
        def get(endpoint):
            if endpoint=='topstories':return [3,1,2]
            id=int(endpoint.split('/')[1]);return {'id':id,'title':'test','type':'story'}
        with patch.object(hn,'get_json',side_effect=get):self.assertEqual([r['id'] for r in hn.fetch()],[3,1,2])
    def test_outage(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'hn.json';old=json.dumps({'updatedAt':'2026-10-31T00:00:00Z','items':[{'id':1}]});p.write_text(old)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(hn,'fetch',side_effect=OSError('offline')):hn.main()
            self.assertEqual(p.read_text(),old)
if __name__=='__main__':unittest.main()
