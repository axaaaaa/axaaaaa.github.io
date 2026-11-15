import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import fetch_xueqiu as x
def row(title,target,author='球友',replies=1,likes=2,description=''):
    return {'data':json.dumps({'title':title,'description':description,'target':target,'reply_count':replies,'like_count':likes,'user':{'screen_name':author}})}
class Tests(unittest.TestCase):
    def test_normalize(self):
        data={'list':[row('话题 A','/u/1'),row('话题 A','/u/1'),row('',' /u/2'.strip(),description='纯描述 <br/> 文本'),{'data':json.dumps({'title':'非法','target':'https://evil.example'})}]}
        result=x.normalize(data)
        self.assertEqual(len(result),2)
        self.assertEqual(result[0]['url'],'https://xueqiu.com/u/1')
        self.assertEqual(result[1]['title'],'纯描述 文本')
    def test_invalid(self):
        for value in [{}, {'list':[]}, {'list':[{'data':'not-json'}]}]:
            with self.assertRaises(ValueError):x.normalize(value)
    def test_outage_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'xueqiu.json';old=json.dumps({'updatedAt':'2026-10-31T00:00:00Z','items':[{'title':'old'}]});path.write_text(old)
            with patch('sys.argv',['fetch','--output',str(path)]),patch.object(x,'fetch',side_effect=OSError('offline')):x.main()
            self.assertEqual(path.read_text(),old)
    def test_outage_no_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            with patch('sys.argv',['fetch','--output',str(Path(tmp)/'xueqiu.json')]),patch.object(x,'fetch',side_effect=OSError('offline')):
                with self.assertRaises(SystemExit):x.main()
if __name__=='__main__':unittest.main()
