import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import fetch_weibo as w
class Tests(unittest.TestCase):
    def test_rank_dedup_ads(self):
        rows=[{'word':'话题 & 测试','realpos':2,'num':12345,'label_name':'新'},{'word':'第一','realpos':1},{'word':'第一','realpos':1},{'word':'广告','realpos':3,'is_ad':1}]
        result=w.normalize({'ok':1,'data':{'realtime':rows}})
        self.assertEqual(len(result),2);self.assertEqual(result[0]['rank'],1);self.assertIn('%26',result[1]['url'])
    def test_invalid(self):
        for value in [{}, {'ok':1,'data':{'realtime':[]}}]:
            with self.assertRaises(ValueError):w.normalize(value)
    def test_outage_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'weibo.json';old=json.dumps({'updatedAt':'2026-10-31T00:00:00Z','items':[{'title':'old'}]});p.write_text(old)
            with patch('sys.argv',['fetch','--output',str(p)]),patch.object(w.urllib.request,'urlopen',side_effect=OSError('offline')):w.main()
            self.assertEqual(p.read_text(),old)
    def test_outage_no_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            with patch('sys.argv',['fetch','--output',str(Path(tmp)/'weibo.json')]),patch.object(w.urllib.request,'urlopen',side_effect=OSError('offline')):
                with self.assertRaises(SystemExit):w.main()
if __name__=='__main__':unittest.main()
