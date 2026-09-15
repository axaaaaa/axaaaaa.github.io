import unittest
from unittest.mock import patch
import check_sites as c

class Tests(unittest.TestCase):
    def test_states(self):
        self.assertEqual(c.transition("failure", {}), ("retrying", 1))
        self.assertEqual(c.transition("failure", {"failureCount": 2}), ("unreachable", 3))
        self.assertEqual(c.transition("reachable", {"failureCount": 2}), ("reachable", 0))
        self.assertEqual(c.transition("restricted", {}), ("restricted", 0))
    def test_private(self):
        self.assertEqual(c.probe("http://localhost"), ("private", None))
        self.assertEqual(c.probe("http://127.0.0.1"), ("private", None))
        self.assertEqual(c.probe("http://192.168.1.1"), ("private", None))
    def test_protocol(self):
        self.assertEqual(c.probe("file:///etc/passwd"), ("skipped", None))
    def test_fallback(self):
        with patch.object(c, "request", side_effect=[(405, None, None), (200, None, None)]) as mock:
            self.assertEqual(c.probe("https://example.com"), ("reachable", 200))
            self.assertEqual(mock.call_args_list[1].args[1], "GET")
    def test_redirect(self):
        with patch.object(c, "request", side_effect=[(302, "http://localhost", None), (None, None, "private")]):
            self.assertEqual(c.probe("https://example.com"), ("private", None))
    def test_redirect_loop(self):
        with patch.object(c, "request", return_value=(302, "/loop", None)) as mock:
            self.assertEqual(c.probe("https://example.com")[0], "failure")
            self.assertEqual(mock.call_count, 5)
    def test_timeout(self):
        with patch.object(c, "probe", side_effect=TimeoutError()):
            self.assertEqual(c.check("https://example.com", {})["status"], "retrying")
if __name__ == "__main__":
    unittest.main()

