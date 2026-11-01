import unittest
import json
import tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_v2ex as v
class Tests(unittest.TestCase):
    def test_normalize(self):
        row={'id':123,'title':' Test ', 'url':'javascript:bad','node':{'title':'Python'},'member':{'username':'user'},'replies':3,'created':1793420000}
        items=v.normalize([row,row,{'id':-1,'title':'bad'}])
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['url'],'https://www.v2ex.com/t/123')
        self.assertEqual(items[0]['replies'],3)
    def test_invalid(self):
        for value in [{},[],[{'id':True,'title':'bad'}]]:
            with self.assertRaises(ValueError):v.normalize(value)
    def test_outage_preserves_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'v.json'; before=json.dumps({'updatedAt':'2026-10-31T00:00:00Z','items':[{'id':123}]});p.write_text(before)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(v.urllib.request,'urlopen',side_effect=OSError('offline')):v.main()
            self.assertEqual(p.read_text(),before)
    def test_outage_without_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            with patch('sys.argv',['fetch','--output',str(Path(tmp)/'v.json')]),patch.object(v.urllib.request,'urlopen',side_effect=OSError('offline')):
                with self.assertRaises(SystemExit):v.main()
if __name__=='__main__':unittest.main()
