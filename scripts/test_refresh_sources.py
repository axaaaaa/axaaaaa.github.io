import io,json,tempfile,unittest,subprocess
from pathlib import Path
from unittest.mock import patch,Mock
import refresh_sources as r

class Tests(unittest.TestCase):
 def test_classifies_preserved_without_faking_success(self):
  self.assertEqual(r.classify(0,['SOURCE_PRESERVED freebuf: verification'],True),'degraded')
  self.assertEqual(r.classify(0,['COLLECT_OK'],True),'ok')
  self.assertEqual(r.classify(1,['network failure'],False),'error')
 def test_failure_does_not_skip_later_sources(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'good.json').write_text('{"items":[1]}')
   processes=[Mock(communicate=Mock(return_value=('error\n',None)),returncode=1),Mock(communicate=Mock(return_value=('SOURCE_OK\n',None)),returncode=0)]
   with patch('sys.argv',['refresh','--root',tmp]),patch.object(r,'COLLECTORS',[('bad','Bad','bad.py','bad.json'),('good','Good','good.py','good.json')]),patch.object(r,'COLLECTOR_RETRIES',1),patch('refresh_sources.run_collector',side_effect=[(1,['error']),(0,['SOURCE_OK'])]),patch.dict(r.os.environ,{'GITHUB_STEP_SUMMARY':str(root/'summary.md')}):
    code=r.main()
   self.assertEqual(code,1)
   data=json.loads((root/'collection-health.json').read_text())
   self.assertEqual([x['status'] for x in data['sources']],['error','ok'])

 def test_retries_transient_failure_then_succeeds(self):
  processes=[Mock(communicate=Mock(return_value=('temporary failure',None)),returncode=1),Mock(communicate=Mock(return_value=('COLLECT_OK',None)),returncode=0)]
  code,lines=r.run_collector(['python','sample.py'],'.',{},retries=1,popen=Mock(side_effect=processes),sleep=Mock())
  self.assertEqual(code,0);self.assertEqual(len([x for x in lines if x=='COLLECT_OK']),1)

 def test_timeout_kills_process_and_retries(self):
  timed=Mock();timed.communicate=Mock(side_effect=[subprocess.TimeoutExpired('collector',1),('killed output',None)]);timed.kill=Mock();timed.returncode=-9
  good=Mock(communicate=Mock(return_value=('ok',None)),returncode=0)
  code,lines=r.run_collector(['python','sample.py'],'.',{},timeout=1,retries=1,popen=Mock(side_effect=[timed,good]),sleep=Mock())
  self.assertEqual(code,0);timed.kill.assert_called_once();self.assertTrue(any('COLLECTOR_TIMEOUT' in x for x in lines))

 def test_failed_collector_restores_last_valid_snapshot(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'public').mkdir();(root/'public'/'old.json').write_text('{"items":[1]}')
   proc=Mock(communicate=Mock(return_value=('SOURCE_UNAVAILABLE upstream',None)),returncode=1)
   with patch('sys.argv',['refresh','--root',tmp]),patch.object(r,'COLLECTORS',[('old','Old','old.py','old.json')]),patch.object(r,'COLLECTOR_RETRIES',0),patch.object(r.subprocess,'Popen',return_value=proc),patch.dict(r.os.environ,{},clear=False):
    code=r.main()
   self.assertEqual(code,0);self.assertEqual(json.loads((root/'old.json').read_text()),{'items':[1]})
   health=json.loads((root/'collection-health.json').read_text());self.assertEqual(health['sources'][0]['status'],'degraded')

if __name__=='__main__':unittest.main()
