import json,unittest
from unittest.mock import patch
import fetch_extra_hotspots as x
class BilibiliTests(unittest.TestCase):
 def body(self,rows,code=0):return json.dumps({'code':code,'data':{'list':rows}}).encode()
 def row(self,bvid='BV1RA4w6AE74',**kwargs):return {'bvid':bvid,'title':'测试视频','owner':{'name':'示例UP'},'stat':{'view':1234,'like':56},**kwargs}
 def test_fields_and_order(self):
  items=x.parse_source('bilibili',self.body([self.row(),self.row('BV1xx411c7mD',title='第二个视频')]))
  self.assertEqual([r['url'] for r in items],['https://www.bilibili.com/video/BV1RA4w6AE74','https://www.bilibili.com/video/BV1xx411c7mD'])
  self.assertIn('UP主 示例UP',items[0]['meta']);self.assertIn('1,234 播放',items[0]['meta'])
 def test_dedup_and_invalid(self):
  items=x.parse_source('bilibili',self.body([None,self.row('javascript:alert(1)'),self.row(),self.row(),self.row(title=123)]))
  self.assertEqual(len(items),1)
 def test_optional_stats(self):
  row=x.parse_source('bilibili',self.body([self.row(owner=None,stat={'view':True,'like':-1})]))[0]
  self.assertEqual(row['meta'],'')
 def test_error_and_empty(self):
  for value in [self.body([],code=-412),self.body([]),b'{"code":0,"data":{}}',b'{"code":true,"data":{"list":[]}}']:
   with self.assertRaises(ValueError):x.parse_source('bilibili',value)
 def test_fetch_uses_shared_pipeline_without_article_scrapes(self):
  with patch.object(x,'request_body',return_value=self.body([self.row()])),patch.object(x,'attach_covers',side_effect=AssertionError('not articles')):
   data=x.fetch('bilibili')
  self.assertEqual(len(data['items']),1);self.assertIn('updatedAt',data)
if __name__=='__main__':unittest.main()
