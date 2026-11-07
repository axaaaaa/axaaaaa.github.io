import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import fetch_history_today as h
class Tests(unittest.TestCase):
 def test_events(self):
  item={'year':2000,'text':'历史事件示例','pages':[{'content_urls':{'desktop':{'page':'https://zh.wikipedia.org/wiki/Test'}}}]}
  result=h.normalize({'events':[item,item,{'year':1999,'text':'无链接跳过'}]})
  self.assertEqual(len(result['events']),1)
 def test_invalid(self):
  with self.assertRaises(ValueError):h.normalize({'events':[{'year':True,'text':'test'}]})
 def test_outage_old_date(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'h.json';old=json.dumps({'date':'2026-10-30','groups':{'events':[{'year':2000}]}});p.write_text(old)
   with patch('sys.argv',['fetch','--output',str(p),'--date','2026-10-31']),patch.object(h.urllib.request,'urlopen',side_effect=OSError('offline')):h.main()
   self.assertEqual(p.read_text(),old)
 def test_same_day_cache(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'h.json';p.write_text(json.dumps({'date':'2026-10-31','groups':{'events':[{'year':2000}]}}))
   with patch('sys.argv',['fetch','--output',str(p),'--date','2026-10-31']),patch.object(h.urllib.request,'urlopen') as request:h.main();request.assert_not_called()
if __name__=='__main__':unittest.main()
