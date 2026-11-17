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
MAX_TOKENS = 2200
MAX_CHARS = 2400
MAX_SECTIONS = 11
MAX_SECURITY = 18
MAX_HOT = 18
MAX_SHORT_VIDEO = 8

# 安全类来源（取自 extra-hotspots.json），用于生成固定的「网络安全」板块
SECURITY_KEYS = [
    'nvd', 'cisa_kev', 'exploitdb', 'cncert', 'cve_program', 'github_advisory',
    'eset', 'checkpoint', 'crowdstrike', 'elastic', 'microsoft',
    'thehackernews', 'securelist', 'unit42', 'sentinellabs', 'anquanke', 'kanxue', 'xz',
]
# 新闻热搜与短视频热榜来源
HOT_KEYS = ['baidu', 'toutiao', 'qq', 'netease', 'thepaper', 'tieba']
SHORT_VIDEO_KEYS = ['bilibili']

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

SYSTEM = (
    '你是一名中文科技媒体的值班编辑，擅长把一堆资讯按主题归类并写成版面。'
    '你只依据给定材料写作，不编造、不评论、不署名。'
)

TEMPLATE = """下面是从今天采集到的 {n} 条科技资讯，格式为「序号. [分类] 标题 —— 摘要」：

{material}

请按主题把它们归成 5～7 个板块，每个板块写一段概述；此外必须固定输出「网络安全」「新闻热搜」「短视频热榜」三个板块（材料见下文），这三个板块必须出现，不可省略、不可改名、不可合并进其他板块。要求：
1. 只依据材料，不补充材料之外的信息，不做推断或评价（不写「这说明」「意味着」「反映出」这类内容）；
2. 板块名用 2～6 个字的名词短语，例如「AI 与大模型」「手机与硬件」「行业与资本」「游戏与娱乐」；不要用「科技动态」「其他」「综合」这类笼统名字；材料撑不起一个板块的主题就不要硬凑；
3. 每个板块 2～5 句，说清发生了什么；不要罗列型号与价格清单，挑有信息量的细节写；
4. 篇幅不限，但每句都要带新信息，同一件事只说一次，不要跨板块重复；
5. **全部用中文写**：材料里的英文标题和摘要必须译成中文再概括，不要直接抄英文原文；
6. 不要提到材料里没有的公司、产品、地区或数字；
7. 「网络安全」板块只能使用下文的安全情报材料，不要把上面的科技资讯塞进这个板块；3～4 句，先说最值得注意的漏洞或攻击活动（说清影响什么产品、严重到什么程度），**正文里不要出现任何 CVE 编号**；
8. 「新闻热搜」板块只能使用下文的热搜榜材料：3～4 句，概括今天大众在关注什么，按话题方向归类（社会民生、娱乐、体育、科技等），不要逐条罗列各平台标题；**涉及时政、领导人活动、官员被查或贪腐案件、外交军事的条目一律不写**；
9. 「短视频热榜」板块只能使用下文的短视频热榜材料：2～3 句，概括热门内容的类型和几个有代表性的内容；
10. 每个板块的内容必须来自对应材料，不要把一类材料写进另一类板块；
11. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"板块名","text":"该板块概述"}}]

{security_block}

{hot_block}

{short_block}"""


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


def build_prompt(items, security=None, hot=None, short=None):
    lines = []
    for index, item in enumerate(items, 1):
        title = re.sub(r'\s+', ' ', str(item.get('title') or ''))[:120]
        summary = re.sub(r'\s+', ' ', str(item.get('summary') or ''))[:160]
        category = str(item.get('category') or '')
        line = f'{index}. [{category}] {title}'
        if summary:
            line += f' —— {summary}'
        lines.append(line)
    return TEMPLATE.format(
        n=len(items),
        material='\n'.join(lines),
        security_block=build_security_block(security),
        hot_block=build_hot_block(hot),
        short_block=build_short_block(short),
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
    """从模型输出里抠出 [{title,text}]，容忍代码块包裹与前后废话。"""
    value = str(raw or '').strip()
    if not value:
        return []
    value = re.sub(r'^```(?:json|JSON)?\s*', '', value)
    value = re.sub(r'\s*```$', '', value)
    start, end = value.find('['), value.rfind(']')
    if start < 0 or end <= start:
        return []
    chunk = value[start:end + 1]
    data = None
    try:
        data = json.loads(chunk)
    except ValueError:
        # llama 常见输出是单引号的 Python 字面量，用 literal_eval 再试一次
        try:
            data = ast.literal_eval(chunk)
        except (ValueError, SyntaxError):
            return []
    if not isinstance(data, list):
        return []
    sections = []
    for entry in data:
        if not isinstance(entry, dict):
            continue
        title = re.sub(r'\s+', ' ', str(entry.get('title') or '')).strip(' 「」【】#：:·-')
        body = str(entry.get('text') or '').replace('\r\n', '\n').replace('\r', '\n')
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

    prompt = build_prompt(
        items,
        load_security(args.security),
        load_hot(args.security, args.weibo),
        load_short_video(args.security),
    )
    plain_fallback = ''
    keeper = None  # 结构不全但可用的结果，所有模型都漏板块时兜底用
    for model in ([args.model] if args.model else MODELS):
        try:
            raw = call_model(model, args.account, args.token, prompt)
        except urllib.error.HTTPError as error:
            print(f'DIGEST_MODEL_FAIL {model} http={error.code}')
            continue
        except Exception as error:  # 超时、网络、解析失败都只换下一个模型
            print(f'DIGEST_MODEL_FAIL {model} {type(error).__name__}: {error}')
            continue
        if not raw:
            print(f'DIGEST_MODEL_FAIL {model} 返回空文本')
            continue
        sections = parse_sections(raw)
        if not sections:
            # 模型没守 JSON 格式时先留一份纯文本兜底，换下一个模型再试
            print(f'DIGEST_MODEL_FAIL {model} 未返回可解析的板块 JSON')
            if not plain_fallback:
                plain = tidy(raw)
                if len(plain) >= 40:
                    plain_fallback = plain
            continue
        missing = [name for name in REQUIRED_SECTIONS
                   if not any(name in section['title'] for section in sections)]
        if missing:
            print(f'DIGEST_MODEL_FAIL {model} 缺少固定板块 {"/".join(missing)}')
            if keeper is None:
                keeper = (model, sections)
            continue
        write_digest(path, data, sections, model, len(items))
        print(f'DIGEST_OK sections={len(sections)} chars={sum(len(s["text"]) for s in sections)} model={model} items={len(items)}')
        return 0

    if keeper:
        model, sections = keeper
        write_digest(path, data, sections, model, len(items))
        print(f'DIGEST_OK(固定板块不全) sections={len(sections)} model={model}')
        return 0

    if plain_fallback:
        sections = [{'title': '今日概览', 'text': plain_fallback}]
        write_digest(path, data, sections, MODELS[-1], len(items))
        print(f'DIGEST_OK sections=1（纯文本兜底）chars={len(plain_fallback)}')
        return 0

    print('DIGEST_SKIP 所有模型均失败，保留原有数据')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print(f'DIGEST_SKIP 未预期的错误 {type(error).__name__}: {error}')
        sys.exit(0)
