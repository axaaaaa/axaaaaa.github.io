import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import fetch_extra_hotspots as x
class TiebaTests(unittest.TestCase):
 def body(self,rows,errno=0):return json.dumps({'errno':errno,'data':{'bang_topic':{'topic_list':rows}}}).encode()
 def test_parse_and_dedup(self):
  rows=[{'topic_id':123,'topic_name':' 测试话题标题 ','discuss_num':12345,'topic_url':'javascript:bad'}]*2
  result=x.parse_source('tieba',self.body(rows));self.assertEqual(len(result),1);self.assertEqual(result[0]['title'],'测试话题标题');self.assertEqual(result[0]['url'],'https://tieba.baidu.com/hottopic/browse/hottopic?topic_id=123');self.assertIn('12,345',result[0]['meta'])
 def test_invalid_rows(self):
  rows=[None,{}, {'topic_id':True,'topic_name':'bad title'},{'topic_id':0,'topic_name':'bad title'},{'topic_id':1,'topic_name':[]},{'topic_id':2,'topic_name':'广告测试','is_ad':True}]
  with self.assertRaises(ValueError):x.parse_source('tieba',self.body(rows))
 def test_bad_response(self):
  for body in [b'not-json',self.body([],1),self.body([]),b'[]']:
   with self.assertRaises((ValueError,TypeError)):x.parse_source('tieba',body)
 def test_limit_and_order(self):
  result=x.parse_source('tieba',self.body([{'topic_id':i,'topic_name':f'topic {i}'} for i in range(1,40)]));self.assertEqual(len(result),24);self.assertTrue(result[0]['url'].endswith('=1'))
 def test_offline_preserves_snapshot(self):
  with tempfile.TemporaryDirectory() as tmp:
   out=Path(tmp)/'extra.json';old={'updatedAt':'2026-11-02T00:00:00Z','items':[{'title':'previous','url':'https://tieba.baidu.com/'}]};out.write_text(json.dumps({'sources':{'tieba':old}}))
   with patch.dict(x.SOURCES,{'tieba':x.SOURCES['tieba']},clear=True),patch.object(x,'fetch',side_effect=OSError('offline')),patch('sys.argv',['fetch','--output',str(out)]):x.main()
   result=json.loads(out.read_text(encoding='utf-8'))['sources']['tieba'];self.assertEqual(result['items'],old['items']);self.assertEqual(result['updatedAt'],old['updatedAt']);self.assertEqual(result['collection']['status'],'stale')
 def test_offline_without_cache(self):
  with tempfile.TemporaryDirectory() as tmp:
   out=Path(tmp)/'extra.json'
   with patch.dict(x.SOURCES,{'tieba':x.SOURCES['tieba']},clear=True),patch.object(x,'fetch',side_effect=OSError('offline')),patch('sys.argv',['fetch','--output',str(out)]):x.main()
   result=json.loads(out.read_text(encoding='utf-8'))['sources']['tieba'];self.assertEqual(result['items'],[]);self.assertEqual(result['collection']['status'],'unavailable')
if __name__=='__main__':unittest.main()
