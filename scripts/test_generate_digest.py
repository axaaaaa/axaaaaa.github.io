import json, sys, tempfile, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_digest as g


class ParseSectionsTests(unittest.TestCase):
    def test_plain_json(self):
        raw = '[{"title":"AI","text":"模型发布了新版本，参数规模更大。"}]'
        sections = g.parse_sections(raw)
        self.assertEqual(len(sections), 1)
        self.assertEqual(sections[0]['title'], 'AI')

    def test_code_fence_and_chatter(self):
        raw = '好的，结果如下：\n```json\n[{"title":"手机","text":"新机搭载骁龙芯片，售价三千元。"}]\n```\n希望有帮助'
        self.assertEqual(g.parse_sections(raw)[0]['title'], '手机')

    def test_single_quote_literal(self):
        raw = "[{'title':'游戏','text':'新作公布发售日期，支持多人联机。'}]"
        self.assertEqual(g.parse_sections(raw)[0]['title'], '游戏')

    def test_bad_escape_falls_back_to_regex(self):
        # 正文里出现未转义的引号，json.loads 与 literal_eval 都会失败，应被正则兜底救回
        raw = '[{"title":"财经","text":"分析师说:"注意风险"，市场波动加大。"}]'
        sections = g.parse_sections(raw)
        self.assertEqual(len(sections), 1)
        self.assertEqual(sections[0]['title'], '财经')
        self.assertIn('市场波动加大', sections[0]['text'])

    def test_truncated_array_recovered(self):
        raw = '[{"title":"国际","text":"两国代表就贸易问题举行了会谈，未达成协议。"},{"title":"体育","text":"球'
        sections = g.parse_sections(raw)
        self.assertEqual(len(sections), 1)
        self.assertEqual(sections[0]['title'], '国际')

    def test_garbage_returns_empty(self):
        for raw in ['', '我不知道', '[]', '[{"title":"","text":""}]']:
            self.assertEqual(g.parse_sections(raw), [])

    def test_caps_sections(self):
        raw = json.dumps([{'title': f'板块{i}', 'text': 'x' * 20} for i in range(g.MAX_SECTIONS + 5)])
        self.assertEqual(len(g.parse_sections(raw)), g.MAX_SECTIONS)


class SampleTests(unittest.TestCase):
    def fixture(self, sources):
        temp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8')
        json.dump({'sources': sources}, temp, ensure_ascii=False)
        temp.close()
        self.addCleanup(lambda: Path(temp.name).unlink(missing_ok=True))
        return temp.name

    def test_round_robin_takes_each_source_first(self):
        sources = {
            'a': {'updatedAt': '2026-11-17T00:00:00Z', 'items': [{'title': f'a 来源第 {i} 条'} for i in range(5)]},
            'b': {'updatedAt': '2026-11-17T00:00:00Z', 'items': [{'title': f'b 来源第 {i} 条'} for i in range(5)]},
        }
        rows = g.load_group(self.fixture(sources), ['a', 'b'], limit=4, per_source=2)
        self.assertEqual([row['source'] for row in rows], ['a', 'b', 'a', 'b'])

    def test_short_titles_dropped(self):
        sources = {'a': {'items': [{'title': '短'}, {'title': '足够长的标题内容'}]}}
        rows = g.load_group(self.fixture(sources), ['a'], limit=5)
        self.assertEqual(len(rows), 1)

    def test_missing_file_returns_empty(self):
        self.assertEqual(g.load_group('not-exists.json', ['a'], limit=5), [])

    def test_drop_politics_filters_and_dedupes(self):
        rows = [
            {'title': '习近平在广东中山考察'},
            {'title': '同一条热搜出现了两次'},
            {'title': '同一条热搜出现了两次'},
            {'title': '台积电公布季度财报'},
        ]
        kept = g.drop_politics(rows)
        self.assertEqual([row['title'] for row in kept], ['同一条热搜出现了两次', '台积电公布季度财报'])

    def test_drop_unfit_filters_crime_details(self):
        rows = [{'title': '网传某地性侵案件细节'}, {'title': '开源推理框架发布'}]
        self.assertEqual(len(g.drop_unfit(rows)), 1)


class PromptTests(unittest.TestCase):
    def test_fixed_prompt_lists_all_eight_blocks(self):
        prompt = g.build_fixed_prompt(
            security=[{'source': 'nvd', 'title': '某插件存在远程代码执行漏洞'}],
            hot=[{'source': 'weibo', 'title': '某话题登上热搜榜'}],
            short=[{'source': 'bilibili', 'title': '某视频播放量很高'}],
            intl=[{'source': 'reuters', 'title': '海外市场出现波动'}],
            reverse=[{'source': 'kanxue', 'title': '某加固方案的脱壳分析'}],
            finance=[{'source': 'xueqiu', 'title': '某板块资金流入明显'}],
            tech=[{'source': 'ithome', 'title': '某厂商发布新硬件产品'}],
            x_news=[{'source': 'x', 'title': '某条推文互动量很高'}],
        )
        for name in g.REQUIRED_SECTIONS + ['国际新闻', '逆向论坛', '财经热榜', '科技资讯', 'X 新闻']:
            self.assertIn(name, prompt)
        self.assertIn('不要出现任何 CVE 编号', prompt)

    def test_empty_blocks_are_omitted(self):
        prompt = g.build_fixed_prompt(security=[{'source': 'nvd', 'title': '某漏洞'}])
        self.assertNotIn('X 新闻：\n', prompt)

    def test_tech_prompt_numbers_material(self):
        items = [{'title': '标题一', 'summary': '摘要一', 'category': 'tech'},
                 {'title': '标题二', 'summary': '', 'category': 'ai'}]
        prompt = g.build_tech_prompt(items)
        self.assertIn('1. [tech] 标题一 —— 摘要一', prompt)
        self.assertIn('2. [ai] 标题二', prompt)

    def test_flatten(self):
        text = g.flatten([{'title': 'A', 'text': '一'}, {'title': 'B', 'text': '二'}])
        self.assertEqual(text, 'A：一\n\nB：二')


class EmojiTests(unittest.TestCase):
    def test_norm_title_ignores_spaces(self):
        self.assertIn(g.norm_title('X 新闻'), g.norm_title('🐦 X新闻'))

    def test_dedupe_replaces_repeated_emoji(self):
        sections = [
            {'title': '💻 操作系统与软件', 'text': 'x' * 20},
            {'title': '💻 科技资讯', 'text': 'y' * 20},
        ]
        g.dedupe_emojis(sections)
        emojis = [g.EMOJI_RE.match(s['title']).group(1) for s in sections]
        self.assertEqual(len(set(emojis)), 2)
        self.assertEqual(sections[0]['title'], '💻 操作系统与软件')
        self.assertTrue(sections[1]['title'].endswith('科技资讯'))

    def test_dedupe_keeps_titles_without_emoji(self):
        sections = [{'title': '无表情板块', 'text': 'x' * 20}]
        self.assertEqual(g.dedupe_emojis(sections)[0]['title'], '无表情板块')

    def test_dedupe_priority_keeps_semantic_emoji(self):
        tech = {'title': '🚀 科技与前沿', 'text': 'x' * 20}
        new = {'title': '🚀 GitHub 与开源', 'text': 'y' * 20}
        result = g.dedupe_emojis([tech, new], priority=[new])
        self.assertEqual(result[1]['title'], '🚀 GitHub 与开源')
        self.assertNotEqual(result[0]['title'], '🚀 科技与前沿')
        self.assertEqual([item is tech for item in result][0], True)


class LineStyleTests(unittest.TestCase):
    def test_ensure_line_emoji_fills_missing(self):
        sections = [{'title': '🛡️ 安全', 'text': '某漏洞影响广泛\n🐛 已有 emoji 的行'}]
        g.ensure_line_emoji(sections)
        lines = sections[0]['text'].split('\n')
        self.assertTrue(g.EMOJI_RE.match(lines[0]))
        self.assertEqual(lines[1], '🐛 已有 emoji 的行')

    def test_ensure_line_emoji_avoids_repeat_within_section(self):
        sections = [{'title': '🛡️ 安全', 'text': '第一行\n第二行\n第三行'}]
        g.ensure_line_emoji(sections)
        emojis = [g.EMOJI_RE.match(line).group(1) for line in sections[0]['text'].split('\n')]
        self.assertEqual(len(set(emojis)), len(emojis))

    def test_clamp_lines_merges_overflow(self):
        text = '\n'.join(f'📌 第{i}行内容' for i in range(9))
        sections = [{'title': '🛡️ 安全', 'text': text}]
        g.clamp_lines(sections)
        lines = sections[0]['text'].split('\n')
        self.assertEqual(len(lines), g.MAX_LINES)
        self.assertTrue(g.EMOJI_RE.match(lines[-1]))
        self.assertIn('第8行内容', lines[-1])

    def test_clamp_lines_keeps_short(self):
        sections = [{'title': '🛡️ 安全', 'text': '📌 一\n📦 二'}]
        g.clamp_lines(sections)
        self.assertEqual(len(sections[0]['text'].split('\n')), 2)


class NewPromptTests(unittest.TestCase):
    def test_new_prompt_lists_four_blocks(self):
        prompt = g.build_new_prompt(
            open_source=[{'source': 'github', 'title': 'x/y（日榜 · Go）', 'meta': '一个项目'}],
            market=[{'source': 'market', 'title': '上证指数 -1.44%', 'meta': 'A 股'}],
            academic=[{'source': 'arxiv', 'title': '某论文研究模型遗忘问题'}],
            vendor=[{'source': 'openai_news', 'title': '发布新模型'}],
        )
        for name in ['GitHub 与开源', '市场行情', '学术前沿', 'AI 厂商官方']:
            self.assertIn(name, prompt)
        self.assertIn('不给投资建议', prompt)

    def test_new_prompt_empty_sections_omitted(self):
        prompt = g.build_new_prompt(open_source=[{'source': 'github', 'title': 'x/y'}])
        self.assertNotIn('arXiv 最新论文', prompt)

    def test_market_loader_marks_sign(self):
        import json as _json
        temp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8')
        _json.dump({'items': [
            {'name': '上证指数', 'kind': 'index', 'changePercent': -1.44, 'category': 'A 股'},
            {'name': '某只股票', 'kind': 'stock', 'changePercent': 3.2, 'category': 'A 股'},
            {'name': '比特币', 'kind': 'crypto', 'changePercent': 2.5, 'category': '加密货币'},
        ]}, temp, ensure_ascii=False)
        temp.close()
        self.addCleanup(lambda: Path(temp.name).unlink(missing_ok=True))
        rows = g.load_market(temp.name, 'not-exists.json')
        titles = [row['title'] for row in rows]
        self.assertIn('上证指数 -1.44%', titles)
        self.assertIn('比特币 +2.50%', titles)
        self.assertTrue(all('某只股票' not in title for title in titles))

    def test_academic_takes_more_than_two(self):
        import json as _json
        temp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8')
        _json.dump({'sources': {'arxiv': {'items': [
            {'title': f'第 {i} 篇关于模型压缩的论文研究'} for i in range(8)]}}}, temp, ensure_ascii=False)
        temp.close()
        self.addCleanup(lambda: Path(temp.name).unlink(missing_ok=True))
        self.assertGreater(len(g.load_academic(temp.name)), 2)


class ModelParamsTests(unittest.TestCase):
    def test_thinking_disabled_for_glm(self):
        self.assertEqual(
            g.MODEL_PARAMS['@cf/zai-org/glm-4.7-flash'],
            {'chat_template_kwargs': {'enable_thinking': False}})

    def test_first_model_is_defined(self):
        self.assertIn(g.MODELS[0], g.MODEL_PARAMS)


if __name__ == '__main__':
    unittest.main()
