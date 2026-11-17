"""用 Cloudflare Workers AI 生成「今日速览」，写回 news.json 的 digest 字段。

设计原则：这一步是锦上添花，任何失败都只跳过、不报错、不阻断采集与部署。
凭证来自环境变量 CF_ACCOUNT_ID / CF_API_TOKEN，缺失时静默跳过。
"""
import argparse
import ast
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}'

# 按优先级排列：GLM-4.7-Flash 中文表达与板块分派最稳，Llama-3.3-70B 作次选，8B 最后兜底。
# 用 CF_AI_MODEL 环境变量可整体覆盖（指定后只跑这一个）。
MODELS = [
    '@cf/zai-org/glm-4.7-flash',
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3.1-8b-instruct-fp8-fast',
]

# 部分模型默认开「思考模式」，会把 max_tokens 全烧在思维链上、正文返回空字符串，
# 必须显式关闭，否则表现为「调用成功但内容为空」。
MODEL_PARAMS = {
    '@cf/zai-org/glm-4.7-flash': {'chat_template_kwargs': {'enable_thinking': False}},
    '@cf/openai/gpt-oss-120b': {'reasoning_effort': 'low'},
    '@cf/qwen/qwen3-30b-a3b-fp8': {'chat_template_kwargs': {'enable_thinking': False}},
}

MAX_ITEMS = 24
MAX_TOKENS = 3600
MAX_CHARS = 2400
MAX_SECTIONS = 16
MAX_SECURITY = 18
MAX_HOT = 18
MAX_SHORT_VIDEO = 8
MAX_INTL = 20
MAX_REVERSE = 14
MAX_FINANCE = 16
MAX_TECH_MEDIA = 16
MAX_X = 12

# 安全类来源（取自 extra-hotspots.json），用于生成固定的「网络安全」板块
SECURITY_KEYS = [
    'nvd', 'cisa_kev', 'exploitdb', 'cncert', 'cve_program', 'github_advisory',
    'eset', 'checkpoint', 'crowdstrike', 'elastic', 'microsoft',
    'thehackernews', 'securelist', 'unit42', 'sentinellabs', 'anquanke', 'seebug', 'xz',
]
# 新闻热搜与短视频热榜来源
HOT_KEYS = ['baidu', 'toutiao', 'qq', 'netease', 'thepaper', 'tieba']
SHORT_VIDEO_KEYS = ['bilibili']
# 国际新闻（路透/美联/ BBC/半岛/卫报/NHK/纽时/华日）
INTL_KEYS = ['reuters', 'ap', 'bbc', 'aljazeera', 'guardian', 'nhk', 'nytimes', 'wsj']
# 逆向与破解论坛（看雪、吾爱破解、精易）
REVERSE_KEYS = ['kanxue', 'pojie52', 'pojie52_new', 'pojie52_tech', 'pojie52_digest',
                'ijingyi_new', 'ijingyi_hot']
# 财经热榜（雪球另在 xueqiu-hot.json）
FINANCE_KEYS = ['eastmoney', 'sinafinance', 'yicai', 'wallstreetcn', '36kr']
# 科技资讯（国内科技媒体与开发者社区）
TECH_MEDIA_KEYS = ['ithome_rank', 'geekpark', 'qbitai', 'sspai', 'ruanyifeng',
                   'hellogithub', 'juejin', 'oschina']

# 这三个板块是固定版面，模型漏掉就当本次失败、换下一个模型重试
REQUIRED_SECTIONS = ['网络安全', '新闻热搜', '短视频热榜']

# 热搜材料里剔除时政类条目：靠提示词约束不够稳（换模型就失效），在取样阶段直接掐掉
SENSITIVE_HOT = [
    '习近平', '总书记', '中共中央', '政治局', '人大常委会', '全国政协', '中央军委',
    '解放军', '军演', '国防部', '外交部', '总理', '李强', '王沪宁', '赵乐际',
    '蔡奇', '丁薛祥', '李希', '台独', '中美', '中日', '中印', '领事', '大使',
    '会见', '考察', '公诉', '落马', '被查', '双开', '受贿', '贪腐', '违纪',
    '主席', '复兴', '中山之行', '元首', '会晤', '中俄',
]

# 国际/财经/逆向/X 这几个板块最容易带出涉政涉华内容，取样时也一并滤掉
SENSITIVE_POLITICS = [
    '习近平', '总书记', '中共中央', '政治局', '人大常委会', '全国政协', '中央军委',
    '国防部', '外交部', '解放军', '军演', '台独', '台湾', '香港', '澳门', '新疆',
    '西藏', '南海', '会见', '会晤', '元首', '考察', '落马', '被查', '双开', '受贿',
    '贪腐', '违纪', '公诉', '李强', '王沪宁', '赵乐际', '蔡奇', '丁薛祥', '李希',
]

SYSTEM = (
    '你是一名中文科技媒体的值班编辑，擅长把一堆资讯按主题归类并写成版面。'
    '你只依据给定材料写作，不编造、不评论、不署名。'
)

TECH_TEMPLATE = """下面是从今天采集到的 {n} 条科技资讯，格式为「序号. [分类] 标题 —— 摘要」：

{material}

请按主题把它们归成 5～7 个板块，每个板块写一段概述，要求：
1. 只依据材料，不补充材料之外的信息，不做推断或评价（不写「这说明」「意味着」「反映出」这类内容）；
2. 板块名用 2～6 个字的名词短语，例如「AI 与大模型」「手机与硬件」「行业与资本」「游戏与娱乐」；不要用「科技动态」「其他」「综合」这类笼统名字；材料撑不起一个板块的主题就不要硬凑；
3. 每个板块 2～5 句，说清发生了什么；不要罗列型号与价格清单，挑有信息量的细节写；
4. 篇幅不限，但每句都要带新信息，同一件事只说一次，不要跨板块重复；
5. **全部用中文写**：材料里的英文标题和摘要必须译成中文再概括，不要直接抄英文原文；
6. 不要提到材料里没有的公司、产品、地区或数字；
7. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"板块名","text":"该板块概述"}}]"""

FIXED_TEMPLATE = """下面是今天采集到的各类榜单与专项材料（分块给出，每块注明对应板块）。

请严格按「网络安全」「新闻热搜」「短视频热榜」「国际新闻」「逆向论坛」「财经热榜」「科技资讯」「X 新闻」这八个板块各写一段概述。八个板块一个都不能少，不能改名、不能合并，也不要新增其他板块。

通用要求：
1. 只依据对应材料，不补充材料之外的信息，不做推断或评价（不写「这说明」「意味着」「反映出」这类内容）；
2. **每个板块只能用它自己那块材料**，不要把一类材料写进另一类板块；
3. **全部用中文写**：材料里的英文标题与摘要必须先译成中文再概括；
4. 不要提到材料里没有的公司、产品、地区或数字；
5. 每个板块 2～4 句，说清发生了什么，挑有信息量的细节写，不要逐条罗列标题；

各板块的具体要求：
6. 「网络安全」：先说最值得注意的漏洞或攻击活动，说清影响什么产品、严重到什么程度，**正文里不要出现任何 CVE 编号**；
7. 「新闻热搜」：概括今天大众在关注什么，按话题方向归类；**涉及时政、领导人活动、官员案件、外交军事的条目一律不写**；
8. 「短视频热榜」：概括热门内容的类型和几个有代表性的内容；
9. 「国际新闻」：概括今天国际上发生了什么（经济、科技、社会、灾害、冲突等），只陈述事实，不评价、不预测；
10. 「逆向论坛」：概括技术爱好者在研究什么（逆向分析、脱壳、抓包、协议还原、安全工具等），可以点出项目或工具名，但**不要写具体破解步骤或绕过授权的方法**；
11. 「财经热榜」：概括市场与投资者在关注什么（行情、公司业绩、行业政策、大宗商品等），**不要给投资建议、不预测涨跌**；
12. 「科技资讯」：概括国内科技媒体与开发者在讨论什么，侧重新技术、新产品、开发者工具与开源项目；
13. 「X 新闻」：概括 X 上今天的热门话题与高互动讨论，按方向归类（AI、科技、社会、娱乐等）；

14. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"板块名","text":"该板块概述"}}]

{security_block}

{hot_block}

{short_block}

{intl_block}

{reverse_block}

{finance_block}

{tech_block}

{x_block}"""


def _render_block(title, rows):
    if not rows:
        return ''
    lines = []
    for index, item in enumerate(rows, 1):
        text = re.sub(r'\s+', ' ', str(item.get('title') or ''))[:110]
        meta = re.sub(r'\s+', ' ', str(item.get('meta') or ''))[:60]
        lines.append(f'{index}. [{item.get("source")}] {text}' + (f' —— {meta}' if meta else ''))
    return f'{title}：\n' + '\n'.join(lines)


def build_security_block(security):
    return _render_block('今日安全情报（漏洞与威胁研究，供「网络安全」板块使用）', security)


def build_hot_block(hot):
    return _render_block('今日热搜榜（各平台热榜标题，供「新闻热搜」板块使用）', hot)


def build_short_block(short):
    return _render_block('今日短视频热榜（供「短视频热榜」板块使用）', short)


def build_intl_block(rows):
    return _render_block('今日国际新闻（供「国际新闻」板块使用）', rows)


def build_reverse_block(rows):
    return _render_block('逆向与破解论坛新帖（供「逆向论坛」板块使用）', rows)


def build_finance_block(rows):
    return _render_block('财经热榜与市场资讯（供「财经热榜」板块使用）', rows)


def build_tech_block(rows):
    return _render_block('国内科技媒体与开发者社区（供「科技资讯」板块使用）', rows)


def build_x_block(rows):
    return _render_block('X（推特）趋势与高互动推文（供「X 新闻」板块使用）', rows)


def build_tech_prompt(items):
    lines = []
    for index, item in enumerate(items, 1):
        title = re.sub(r'\s+', ' ', str(item.get('title') or ''))[:120]
        summary = re.sub(r'\s+', ' ', str(item.get('summary') or ''))[:160]
        category = str(item.get('category') or '')
        line = f'{index}. [{category}] {title}'
        if summary:
            line += f' —— {summary}'
        lines.append(line)
    return TECH_TEMPLATE.format(n=len(items), material='\n'.join(lines))


def build_fixed_prompt(security=None, hot=None, short=None,
                       intl=None, reverse=None, finance=None, tech=None, x_news=None):
    return FIXED_TEMPLATE.format(
        security_block=build_security_block(security),
        hot_block=build_hot_block(hot),
        short_block=build_short_block(short),
        intl_block=build_intl_block(intl),
        reverse_block=build_reverse_block(reverse),
        finance_block=build_finance_block(finance),
        tech_block=build_tech_block(tech),
        x_block=build_x_block(x_news),
    )


def load_group(path, keys, limit, per_source=2):
    """按来源轮转取样：先保证每家都出一条，再补下一轮，避免某一家占满板块。"""
    try:
        data = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    except (OSError, ValueError):
        return []
    sources = data.get('sources') or {}
    queues = []
    for key in keys:
        source = sources.get(key) or {}
        items = [item for item in (source.get('items') or []) if isinstance(item, dict) and len(str(item.get('title') or '').strip()) >= 6]
        if items:
            queues.append((key, str(source.get('updatedAt') or ''), items[:per_source]))
    picked = []
    for round_index in range(per_source):
        for key, updated_at, items in queues:
            if round_index >= len(items):
                continue
            item = items[round_index]
            picked.append({'source': key, 'title': str(item.get('title')).strip(), 'meta': str(item.get('meta') or ''), 'at': updated_at})
            if len(picked) >= limit:
                return picked
    return picked


def load_security(path):
    return load_group(path, SECURITY_KEYS, MAX_SECURITY)


def load_hot(path, weibo_path='weibo-hot.json'):
    # 多取一些，过滤掉时政条目后还能凑够数量
    rows = load_group(path, HOT_KEYS, MAX_HOT + 10)
    # 微博热搜不在 extra-hotspots 里，单独从 weibo-hot.json 取前几条
    try:
        weibo = json.loads(Path(weibo_path).read_text(encoding='utf-8-sig'))
        head = []
        for item in (weibo.get('items') or [])[:8]:
            title = str(item.get('title') or '').strip()
            if len(title) >= 4:
                heat = item.get('heat')
                head.append({'source': 'weibo', 'title': title, 'meta': f'热度 {heat}' if heat else '', 'at': str(weibo.get('updatedAt') or '')})
        rows = head + rows
    except (OSError, ValueError):
        pass
    rows = [row for row in rows
            if not any(word in row['title'] for word in SENSITIVE_HOT)]
    # 同一条热搜常被多家平台同时收录，按标题去重
    seen, unique = set(), []
    for row in rows:
        key = re.sub(r'[\s\W]+', '', row['title'])[:24]
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique[:MAX_HOT]


def load_short_video(path):
    return load_group(path, SHORT_VIDEO_KEYS, MAX_SHORT_VIDEO, per_source=MAX_SHORT_VIDEO)


def drop_politics(rows):
    """滤掉涉政涉华条目，并按标题去重。"""
    seen, unique = set(), []
    for row in rows:
        title = str(row.get('title') or '')
        if any(word in title for word in SENSITIVE_POLITICS):
            continue
        key = re.sub(r'[\s\W]+', '', title)[:24]
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique


# 明显不适合放进速览的内容（刑事案件细节、擦边话题），X 板块尤其容易带出来
CONTENT_BLOCK = ['侵犯', '性侵', '强奸', '猥亵', '裸照', '色情', '约炮', '卖淫']


def drop_unfit(rows):
    return [row for row in rows
            if not any(word in str(row.get('title') or '') for word in CONTENT_BLOCK)]


def load_intl(path):
    return drop_politics(load_group(path, INTL_KEYS, MAX_INTL + 8))[:MAX_INTL]


def load_reverse(path):
    return drop_politics(load_group(path, REVERSE_KEYS, MAX_REVERSE + 6))[:MAX_REVERSE]


def load_finance(path, xueqiu_path='xueqiu-hot.json'):
    rows = list(load_group(path, FINANCE_KEYS, MAX_FINANCE + 6))
    # 雪球热榜单独一个文件，补在前面
    try:
        data = json.loads(Path(xueqiu_path).read_text(encoding='utf-8-sig'))
        head = []
        for item in (data.get('items') or [])[:8]:
            title = str(item.get('title') or '').strip()
            if len(title) >= 5:
                likes = item.get('likes')
                head.append({
                    'source': 'xueqiu',
                    'title': title,
                    'meta': f'{likes} 赞' if likes else '',
                    'at': str(data.get('updatedAt') or ''),
                })
        rows = head + rows
    except (OSError, ValueError):
        pass
    return drop_politics(rows)[:MAX_FINANCE]


def load_tech_media(path):
    return drop_politics(load_group(path, TECH_MEDIA_KEYS, MAX_TECH_MEDIA + 8))[:MAX_TECH_MEDIA]


def load_x_news(words_path='x-words.json', global_path='x-global.json'):
    """X（推特）板块：以趋势词条为主，再用高互动推文补足。"""
    rows = []
    try:
        data = json.loads(Path(words_path).read_text(encoding='utf-8-sig'))
        for item in (data.get('items') or [])[:10]:
            title = str(item.get('title') or '').strip()
            if len(title) < 5:
                continue
            meta = str(item.get('summary') or '')[:80]
            rows.append({'source': 'x-words', 'title': title, 'meta': meta})
    except (OSError, ValueError):
        pass
    try:
        data = json.loads(Path(global_path).read_text(encoding='utf-8-sig'))
        posts = [item for item in (data.get('items') or [])
                 if isinstance(item, dict) and len(str(item.get('title') or '')) >= 12]
        posts.sort(key=lambda item: int(re.sub(r'\D', '', str(item.get('likes') or '0')) or 0), reverse=True)
        for item in posts[:10]:
            title = re.sub(r'\s+', ' ', str(item.get('title') or ''))[:100]
            likes = item.get('likes')
            rows.append({
                'source': 'x',
                'title': title,
                'meta': f'{likes} 赞' if likes else str(item.get('category') or ''),
            })
    except (OSError, ValueError):
        pass
    return drop_unfit(drop_politics(rows))[:MAX_X]


def tidy(text):
    """清掉模型爱加的前后缀、项目符号与多余空白，保留段落换行供前端换行显示。"""
    value = str(text or '').replace('\r\n', '\n').replace('\r', '\n')
    value = re.sub(r'[ \t\u3000]+', ' ', value)
    lines = []
    for line in value.split('\n'):
        line = line.strip()
        line = re.sub(r'^(导读|速览|今日速览)\s*[:：]\s*', '', line)
        # 模型偶尔还是会分点，这里把符号去掉降级成普通段落
        line = re.sub(r'^(?:[-*•·]|\d+[.、)])\s*', '', line)
        if line:
            lines.append(line)
    value = '\n'.join(lines)
    value = re.sub(r'\n{3,}', '\n\n', value)
    return value.strip('“”"\'「」 \n')[:MAX_CHARS]


def parse_sections(raw):
    """从模型输出里抠出 [{title,text}]，容忍代码块包裹、前后废话、坏转义与截断。"""
    value = str(raw or '').strip()
    if not value:
        return []
    value = re.sub(r'^```(?:json|JSON)?\s*', '', value)
    value = re.sub(r'\s*```$', '', value)
    start, end = value.find('['), value.rfind(']')
    chunk = value[start:end + 1] if start >= 0 and end > start else value
    data = None
    try:
        data = json.loads(chunk)
    except ValueError:
        # llama 常见输出是单引号的 Python 字面量，用 literal_eval 再试一次
        try:
            data = ast.literal_eval(chunk)
        except (ValueError, SyntaxError):
            data = None
    if not isinstance(data, list):
        # 最后一道兜底：直接按字段正则抠，能救回坏转义和被截断的数组。
        # 先用「锚定对象结尾」的宽松写法（正文里混进未转义引号时也不会被截断），
        # 再退回到严格转义写法。
        pairs = re.findall(
            r'"title"\s*:\s*"([^"]*)"\s*,\s*"text"\s*:\s*"(.*?)"\s*\}\s*(?=,|\]|$)',
            chunk, re.S)
        if not pairs:
            pairs = re.findall(
                r'"title"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"',
                chunk, re.S)
        if not pairs:
            return []
        data = [{'title': title, 'text': body} for title, body in pairs]

    def _unescape(text):
        return (text.replace('\\n', '\n').replace('\\t', ' ')
                .replace('\\"', '"').replace('\\\\', '\\'))

    sections = []
    for entry in data:
        if not isinstance(entry, dict):
            continue
        title = re.sub(r'\s+', ' ', _unescape(str(entry.get('title') or ''))).strip(' 「」【】#：:·-')
        body = _unescape(str(entry.get('text') or '')).replace('\r\n', '\n').replace('\r', '\n')
        body = re.sub(r'[ \t\u3000]+', ' ', body).strip()
        body = re.sub(r'\n{2,}', '\n', body)
        if len(title) < 2 or len(body) < 10:
            continue
        sections.append({'title': title[:16], 'text': body[:900]})
        if len(sections) >= MAX_SECTIONS:
            break
    return sections


def flatten(sections):
    return '\n\n'.join(f'{section["title"]}：{section["text"]}' for section in sections)


def call_model(model, account, token, prompt, timeout=90):
    payload = {
        'messages': [
            {'role': 'system', 'content': SYSTEM},
            {'role': 'user', 'content': prompt},
        ],
        'max_tokens': MAX_TOKENS,
        'temperature': 0.3,
    }
    payload.update(MODEL_PARAMS.get(model) or {})
    request = urllib.request.Request(
        API.format(account=account, model=model),
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = json.loads(response.read().decode('utf-8', 'replace'))
    result = body.get('result') or {}
    # 兼容两种返回：Workers AI 原生 {response} 与 OpenAI 风格 {choices[].message.content}
    text = result.get('response') or result.get('text') or ''
    if not text:
        for choice in result.get('choices') or []:
            content = ((choice or {}).get('message') or {}).get('content')
            if content:
                text = content
                break
    # 原样返回，JSON 交给 parse_sections 解析；纯文本兜底由调用方 tidy
    return str(text or '')


def write_digest(path, data, sections, model, based_on):
    data['digest'] = {
        'sections': sections,
        'text': flatten(sections),
        'model': model,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'basedOn': based_on,
    }
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='news.json')
    parser.add_argument('--security', default='extra-hotspots.json')
    parser.add_argument('--weibo', default='weibo-hot.json')
    parser.add_argument('--xueqiu', default='xueqiu-hot.json')
    parser.add_argument('--x-words', dest='x_words', default='x-words.json')
    parser.add_argument('--x-global', dest='x_global', default='x-global.json')
    parser.add_argument('--account', default=os.environ.get('CF_ACCOUNT_ID', ''))
    parser.add_argument('--token', default=os.environ.get('CF_API_TOKEN', ''))
    parser.add_argument('--model', default=os.environ.get('CF_AI_MODEL', ''))
    args = parser.parse_args()

    if not args.account or not args.token:
        print('DIGEST_SKIP 未配置 CF_ACCOUNT_ID / CF_API_TOKEN')
        return 0

    path = Path(args.input)
    try:
        data = json.loads(path.read_text(encoding='utf-8-sig'))
    except (OSError, ValueError) as error:
        print(f'DIGEST_SKIP 读取 {path} 失败: {error}')
        return 0

    items = [item for item in data.get('items') or [] if isinstance(item, dict) and item.get('title')][:MAX_ITEMS]
    if len(items) < 5:
        print(f'DIGEST_SKIP 有效资讯仅 {len(items)} 条，样本太少')
        return 0

    security = load_security(args.security)
    hot = load_hot(args.security, args.weibo)
    short = load_short_video(args.security)
    intl = load_intl(args.security)
    reverse = load_reverse(args.security)
    finance = load_finance(args.security, args.xueqiu)
    tech = load_tech_media(args.security)
    x_news = load_x_news(args.x_words, args.x_global)
    print(f'DIGEST_MATERIAL security={len(security)} hot={len(hot)} video={len(short)} '
          f'intl={len(intl)} reverse={len(reverse)} finance={len(finance)} '
          f'tech={len(tech)} x={len(x_news)}')

    # 固定板块 + 材料非空的新板块都要校验，材料为空的就放过（当天没数据不怪模型）
    required = list(REQUIRED_SECTIONS)
    for name, rows in (('国际新闻', intl), ('逆向论坛', reverse), ('财经热榜', finance),
                       ('科技资讯', tech), ('X 新闻', x_news)):
        if rows:
            required.append(name)

    tech_prompt = build_tech_prompt(items)
    fixed_prompt = build_fixed_prompt(security, hot, short, intl, reverse, finance, tech, x_news)
    models = [args.model] if args.model else MODELS

    def run(prompt, required_names, tag):
        """跑一遍模型链，返回 (model, sections)；全失败返回 (None, [])。"""
        best = None
        for name in models:
            try:
                raw = call_model(name, args.account, args.token, prompt)
            except urllib.error.HTTPError as error:
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} http={error.code}')
                continue
            except Exception as error:  # 超时、网络、解析失败都只换下一个模型
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} {type(error).__name__}: {error}')
                continue
            if not raw:
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} 返回空文本')
                continue
            sections = parse_sections(raw)
            if not sections:
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} 未返回可解析的板块 JSON')
                continue
            missing = [title for title in required_names
                       if not any(title in section['title'] for section in sections)]
            if missing:
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} 缺少板块 {"/".join(missing)}')
                # 留覆盖最全的那一份兜底，不要拿到第一个半成品就用
                score = (len(required_names) - len(missing), len(sections))
                if best is None or score > best[0]:
                    best = (score, name, sections)
                continue
            return name, sections
        if best:
            return best[1], best[2]
        return None, []

    # 第一段：24 条科技资讯按主题归类；第二段：八个固定版面。
    # 分两次调用是因为一次让模型写 13～15 个板块时，它会把科技板块整个丢掉。
    tech_model, tech_sections = run(tech_prompt, [], '科技板块')
    tech_sections = [section for section in tech_sections
                     if not any(name in section['title'] for name in required)]
    fixed_model, fixed_sections = run(fixed_prompt, required, '固定板块')

    if not tech_sections and not fixed_sections:
        print('DIGEST_SKIP 两段生成均失败，保留原有数据')
        return 0

    sections = tech_sections + fixed_sections
    model = fixed_model or tech_model
    write_digest(path, data, sections, model, len(items))
    total = sum(len(section['text']) for section in sections)
    print(f'DIGEST_OK sections={len(sections)} tech={len(tech_sections)} '
          f'fixed={len(fixed_sections)} chars={total} model={model} items={len(items)}')
    return 0



if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print(f'DIGEST_SKIP 未预期的错误 {type(error).__name__}: {error}')
        sys.exit(0)
