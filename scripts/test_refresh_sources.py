import io,json,tempfile,unittest
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
   processes=[Mock(stdout=io.StringIO('error\n'),wait=Mock(return_value=1)),Mock(stdout=io.StringIO('SOURCE_OK\n'),wait=Mock(return_value=0))]
   with patch('sys.argv',['refresh','--root',tmp]),patch.object(r,'COLLECTORS',[('bad','Bad','bad.py','bad.json'),('good','Good','good.py','good.json')]),patch.object(r.subprocess,'Popen',side_effect=processes) as run,patch.dict(r.os.environ,{'GITHUB_STEP_SUMMARY':str(root/'summary.md')}):
    code=r.main()
   self.assertEqual(code,1);self.assertEqual(run.call_count,2)
   data=json.loads((root/'collection-health.json').read_text())
   self.assertEqual([x['status'] for x in data['sources']],['error','ok'])

if __name__=='__main__':unittest.main()
