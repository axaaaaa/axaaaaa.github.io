"""用 Cloudflare Workers AI 生成「今日速览」，写回 news.json 的 digest 字段。

设计原则：这一步是锦上添花，任何失败都只跳过、不报错、不阻断采集与部署。
凭证来自环境变量 CF_ACCOUNT_ID / CF_API_TOKEN，缺失时静默跳过。
"""
import argparse
import ast
import hashlib
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
# 素材指纹相同且上次生成不足这么多小时，就直接沿用，省 Workers AI 额度
REUSE_WINDOW_HOURS = 3
# 两次生成之间的最小间隔：无论定时器怎么配，都按这个节奏走
MIN_INTERVAL_HOURS = 2.5
MAX_SECTIONS = 16
MAX_SECURITY = 18
MAX_HOT = 18
MAX_SHORT_VIDEO = 8
MAX_INTL = 20
MAX_REVERSE = 14
MAX_FINANCE = 16
MAX_TECH_MEDIA = 16
MAX_X = 12
MAX_OPEN_SOURCE = 12
MAX_MARKET = 10
MAX_ACADEMIC = 8
MAX_AI_VENDOR = 14

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
# 学术前沿
ACADEMIC_KEYS = ['arxiv']
# AI 厂商官方发布（每家取一条，保证不被某一家刷屏）
AI_VENDOR_KEYS = ['openai_news', 'anthropic_news', 'deepmind_news', 'mistral_news',
                  'meta_ai_news', 'qwen_news', 'kimi_news', 'glm_news', 'deepseek_news',
                  'bytedance_news', 'tencent_ai_news', 'minimax_news', 'minimax_api',
                  'mistral_api', 'aa_models']

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
2b. **每个板块的 title 开头必须带一个与主题贴合的 emoji**（如「🤖 AI 与大模型」「📱 手机与硬件」「🎮 游戏与娱乐」），一个板块只用一个，且各板块之间不重复；**不要用 🛡️ 🔥 🎬 🌍 🔧 💰 💻 🐦 🚀 📈 🔬 🏢 这几个**（固定版面已占用）；
3. **正文写 3～5 行**，行与行之间用换行符分隔；**每一行都必须以 emoji 开头**，同一板块内各行用不同的 emoji，行内其余文字不要再加 emoji；**不要用「-」「*」「•」「1.」这类列表符号**；
3b. **每行覆盖一个话题方向**：同一家公司、同一类产品、同一个话题的多条材料要合并进同一行（例如手机新品与耳机预售合成「消费电子」一行），**不要一条材料写一行，也不要只写一条就收尾**；每行 1～2 句、整个板块合计 80～160 字，说清发生了什么，不要罗列型号与价格清单；
4. 篇幅不限，但每句都要带新信息；**同一件事全局只能出现一次，只放在最贴切的那个板块里，换成另一种说法复述也算重复**（例如「某高管跳槽」不要既写进 AI 板块又写进硬件板块）；**如果一个板块去掉重复内容后剩下的材料不足一行，就不要写这个板块**；
5. **全部用中文写**：材料里的英文标题和摘要必须译成中文再概括，不要直接抄英文原文；
6. 不要提到材料里没有的公司、产品、地区或数字；
7. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"🚗 板块名","text":"🚀 第一行要点\n📦 第二行要点\n🔋 第三行要点"}}]"""

FIXED_TEMPLATE = """下面是今天采集到的各类榜单与专项材料（分块给出，每块注明对应板块）。

请严格按「网络安全」「新闻热搜」「短视频热榜」「国际新闻」「逆向论坛」「财经热榜」「科技资讯」「X 新闻」这八个板块各写一段概述。八个板块一个都不能少，不能改名、不能合并，也不要新增其他板块。

通用要求：
1. **每个板块的 title 开头必须带一个与板块主题贴合的 emoji**（如「🛡️ 网络安全」「🔥 新闻热搜」「🎬 短视频热榜」「🌍 国际新闻」「🔧 逆向论坛」「💰 财经热榜」「💻 科技资讯」「🐦 X 新闻」），一个板块只用一个，八个板块的 emoji 互不重复；**正文里每行开头也要带一个与该条内容贴合的 emoji**；
2. 只依据对应材料，不补充材料之外的信息，不做推断或评价（不写「这说明」「意味着」「反映出」这类内容）；
3. **每个板块只能用它自己那块材料**，不要把一类材料写进另一类板块；
4. **全部用中文写**：材料里的英文标题与摘要必须先译成中文再概括；
5. 不要提到材料里没有的公司、产品、地区或数字；
6. **正文写 3～5 行**，行与行之间用换行符分隔；**每一行都必须以 emoji 开头**，同一板块内各行用不同的 emoji，行内其余文字不要再加 emoji；**不要用「-」「*」「•」「1.」这类列表符号**；
6b. **每行覆盖一个话题方向**：同一件事、同一类话题的多条材料要合并进同一行，**不要一条材料写一行，也不要只写一条就收尾**；每行 1～2 句、整个板块合计 100～200 字，说清发生了什么，不要逐条罗列标题；

各板块的具体要求：
7. 「网络安全」：先说最值得注意的漏洞或攻击活动，说清影响什么产品、严重到什么程度，**正文里不要出现任何 CVE 编号**；
8. 「新闻热搜」：概括今天大众在关注什么，按话题方向归类；**涉及时政、领导人活动、官员案件、外交军事的条目一律不写**；
9. 「短视频热榜」：概括热门内容的类型和几个有代表性的内容；
10. 「国际新闻」：概括今天国际上发生了什么（经济、科技、社会、灾害、冲突等），只陈述事实，不评价、不预测；
11. 「逆向论坛」：概括技术爱好者在研究什么（逆向分析、脱壳、抓包、协议还原、安全工具等），可以点出项目或工具名，但**不要写具体破解步骤或绕过授权的方法**；
12. 「财经热榜」：概括市场与投资者在关注什么（行情、公司业绩、行业政策、大宗商品等），**不要给投资建议、不预测涨跌**；
13. 「科技资讯」：概括国内科技媒体与开发者在讨论什么，侧重新技术、新产品、开发者工具与开源项目；
14. 「X 新闻」：概括 X 上今天的热门话题与高互动讨论，按方向归类（AI、科技、社会、娱乐等）；

15. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"🚗 板块名","text":"🚀 第一行要点\n📦 第二行要点\n🔋 第三行要点"}}]

{security_block}

{hot_block}

{short_block}

{intl_block}

{reverse_block}

{finance_block}

{tech_block}

{x_block}"""

NEW_TEMPLATE = """下面是今天采集到的开源项目、市场行情、学术论文与 AI 厂商官方动态（分块给出，每块注明对应板块）。

请严格按「GitHub 与开源」「市场行情」「学术前沿」「AI 厂商官方」这四个板块各写一段概述。四个板块一个都不能少，不能改名、不能合并，也不要新增其他板块。

通用要求：
1. **每个板块的 title 开头必须带一个与板块主题贴合的 emoji**（建议「🚀 GitHub 与开源」「📈 市场行情」「🔬 学术前沿」「🏢 AI 厂商官方」），四个 emoji 互不重复；**正文里每行开头也要带一个与该条内容贴合的 emoji**；
2. 只依据对应材料，不补充材料之外的信息，不做推断或评价（不写「这说明」「意味着」「反映出」这类内容）；
3. **每个板块只能用它自己那块材料**，不要把一类材料写进另一类板块；
4. **全部用中文写**：项目名、论文标题、模型名可以保留英文原名，其余一律译成中文；
5. 不要提到材料里没有的公司、产品、地区或数字；
6. **正文写 3～5 行**，行与行之间用换行符分隔；**每一行都必须以 emoji 开头**，同一板块内各行用不同的 emoji，行内其余文字不要再加 emoji；**不要用「-」「*」「•」「1.」这类列表符号**；
7. **每行覆盖一个话题方向**，同类信息合并进一行，不要一条材料写一行，也不要只写一条就收尾；每行 1～2 句、整个板块合计 80～180 字；

各板块的具体要求：
8. 「GitHub 与开源」：概括今天 trending 的项目在做什么（说清它解决什么问题、什么语言），可以点名项目；
9. 「市场行情」：用「涨/跌 + 百分比」陈述指数与主要加密资产的表现，**只陈述事实，不给投资建议、不预测涨跌、不推荐标的**；如果材料里有恐惧贪婪指数也一并说明当前市场情绪；
10. 「学术前沿」：概括这些论文在研究什么问题、提出了什么方法，用通俗说法，不要罗列公式与作者；
11. 「AI 厂商官方」：概括各家厂商今天发布了什么（新模型、新功能、API 变更、价格调整），按厂商归类，不要逐条罗列；

12. 只输出 JSON 数组，不要写任何解释、不要加代码块标记，格式严格为：
[{{"title":"🚀 板块名","text":"🚀 第一行要点\n📦 第二行要点\n🔋 第三行要点"}}]

{open_source_block}

{market_block}

{academic_block}

{vendor_block}"""


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

def build_open_source_block(rows):
    return _render_block('GitHub Trending 与开源社区（供「GitHub 与开源」板块使用）', rows)


def build_market_block(rows):
    return _render_block('指数与加密资产行情（供「市场行情」板块使用，只陈述涨跌）', rows)


def build_academic_block(rows):
    return _render_block('arXiv 最新论文（供「学术前沿」板块使用）', rows)


def build_vendor_block(rows):
    return _render_block('AI 厂商官方发布动态（供「AI 厂商官方」板块使用）', rows)


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


def build_new_prompt(open_source=None, market=None, academic=None, vendor=None):
    return NEW_TEMPLATE.format(
        open_source_block=build_open_source_block(open_source),
        market_block=build_market_block(market),
        academic_block=build_academic_block(academic),
        vendor_block=build_vendor_block(vendor),
    )


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


def load_open_source(trending_path='github-trending.json', hotspot_path='extra-hotspots.json'):
    """GitHub Trending（日榜/周榜各取几条）+ Hugging Face 趋势 + HelloGitHub 周刊。"""
    rows = []
    try:
        data = json.loads(Path(trending_path).read_text(encoding='utf-8-sig'))
        periods = data.get('periods') or {}
        for key, label in (('daily', '日榜'), ('weekly', '周榜')):
            for item in ((periods.get(key) or {}).get('items') or [])[:5]:
                name = str(item.get('name') or '').strip()
                if not name:
                    continue
                desc = re.sub(r'\s+', ' ', str(item.get('description') or ''))[:90]
                language = str(item.get('language') or '')
                title = f'{name}（{label}' + (f' · {language}' if language else '') + '）'
                rows.append({'source': 'github', 'title': title, 'meta': desc})
    except (OSError, ValueError):
        pass
    rows += load_group(hotspot_path, ['hf_trending', 'hellogithub'], 6)
    return drop_unfit(drop_politics(rows))[:MAX_OPEN_SOURCE]


MARKET_FALLBACK = ['比特币', '以太坊', 'Bitcoin', 'Ethereum', 'BTC', 'ETH']


def load_market(markets_path='markets.json', hotspot_path='extra-hotspots.json'):
    """大盘指数 + 主流加密资产；顺手带上恐惧贪婪指数。"""
    rows = []
    try:
        data = json.loads(Path(markets_path).read_text(encoding='utf-8-sig'))
        for item in data.get('items') or []:
            name = str(item.get('name') or '').strip()
            percent = item.get('changePercent')
            if not name or not isinstance(percent, (int, float)):
                continue
            is_index = item.get('kind') == 'index'
            is_coin = any(key in name for key in MARKET_FALLBACK)
            if not (is_index or is_coin):
                continue
            rows.append({
                'source': 'market',
                'title': f'{name} {percent:+.2f}%',
                'meta': str(item.get('category') or ''),
            })
    except (OSError, ValueError):
        pass
    rows += load_group(hotspot_path, ['fng'], 2)
    return rows[:MAX_MARKET]


def load_academic(path):
    # 只有一个来源，per_source 必须给足，否则 load_group 只走两轮
    return drop_politics(load_group(path, ACADEMIC_KEYS, MAX_ACADEMIC, per_source=MAX_ACADEMIC))


def load_ai_vendor(path):
    """每家厂商只取一条，避免某一家刷屏。"""
    return drop_politics(load_group(path, AI_VENDOR_KEYS, MAX_AI_VENDOR, per_source=1))


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


EMOJI_RE = re.compile(r'^([\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF][\uFE0F]?)\s*')
# 模型给的 emoji 撞车时的替补（固定版面那八个之外）
FALLBACK_EMOJI = ['📌', '📎', '🗂️', '🔖', '📰', '📊', '🧩', '🛰️', '⚙️', '🔍']


def norm_title(text):
    """比较板块名时忽略空格差异，"X 新闻" 与 "X新闻" 视为同一个。"""
    return re.sub(r'\s+', '', str(text or ''))


def dedupe_emojis(sections, priority=None):
    """保证每个板块标题前的 emoji 不重复；重复的换一个替补。

    priority 里的板块优先占位（固定版面比科技板块更值得保留语义贴切的 emoji），
    处理顺序优先、但返回顺序不变。
    """
    seen = set()
    ranked = list(priority or [])
    ordered = [section for section in sections if any(section is item for item in ranked)]
    ordered += [section for section in sections if not any(section is item for item in ranked)]
    for section in ordered:
        match = EMOJI_RE.match(section['title'])
        if not match:
            continue
        emoji = match.group(1)
        rest = section['title'][match.end():]
        if emoji in seen:
            for candidate in FALLBACK_EMOJI:
                if candidate not in seen:
                    emoji = candidate
                    break
        seen.add(emoji)
        section['title'] = f'{emoji} {rest}'.strip()
    return sections


# 比较正文是否同一件事时忽略的字符：空白、标点、引号、破折号
PUNCT_RE = re.compile(r'[\s，,。．.；;：:、！!？?“”"\'’‘（）()【】\[\]—–\-…·~～/]+')


def norm_line(text):
    """正文归一化：去掉行首 emoji 与全部标点空白，只留下用于比较的实词。"""
    return PUNCT_RE.sub('', EMOJI_RE.sub('', str(text or '')))


def dedupe_cross_section(sections, keep_sections=()):
    """同一事件被模型写进多个板块时，只在最先出现的板块里保留一次。

    材料分组本身有重叠（AI 与前沿 / 硬件与开发 / 开发者生态吃的是同一批科技源），
    模型会把同一条消息分别改写进三个板块，读起来像重复灌水。这里做确定性去重：
    去重后整块为空的板块直接丢弃，keep_sections 里的固定版面至少保留首行。
    """
    keep = {norm_title(item) for item in keep_sections}
    seen = set()
    result = []
    for section in sections:
        lines = [line.strip() for line in section['text'].split('\n') if line.strip()]
        kept = []
        for line in lines:
            key = norm_line(line)
            if not key or key in seen:
                continue
            seen.add(key)
            kept.append(line)
        if not kept:
            title = norm_title(EMOJI_RE.sub('', str(section['title'])))
            if not lines or title not in keep:
                continue  # 内容与前面板块完全重合，整块不再输出
            kept = lines[:1]
        section['text'] = '\n'.join(kept)
        result.append(section)
    return result


# 正文行首补 emoji 用的候选池
LINE_EMOJI = ['📌', '🔹', '💡', '⚙️', '📊', '🧩', '🚀', '📎', '🔖', '🗂️']


def ensure_line_emoji(sections):
    """正文每一行都以 emoji 开头；模型漏写的行在代码层补一个，保证版面统一。"""
    for section in sections:
        used = set()
        lines = []
        for line in section['text'].split('\n'):
            text = line.strip()
            if not text:
                continue
            match = EMOJI_RE.match(text)
            if match:
                used.add(match.group(1))
                lines.append(text)
                continue
            pick = next((item for item in LINE_EMOJI if item not in used), LINE_EMOJI[0])
            used.add(pick)
            lines.append(f'{pick} {text}')
        section['text'] = '\n'.join(lines)
    return sections


MAX_LINES = 5
# 合并同桶条目时要去掉的句末标点，避免拼出「。；」
TRAILING_PUNCT_RE = re.compile(r'[。．.；;，,、\s]+$')


def clamp_lines(sections, limit=MAX_LINES):
    """行数超限时把条目重新均分到 limit 行，而不是全部堆到末尾一行。

    模型经常「一条材料写一行」，直接截断会丢内容、堆到末行又会出一行超长文本，
    这里按原顺序分桶后合并，既保住全部信息，每行长度也大致相当。
    """
    for section in sections:
        lines = [line for line in section['text'].split('\n') if line.strip()]
        if len(lines) <= limit:
            continue
        size = -(-len(lines) // limit)  # 向上取整
        buckets = [lines[index:index + size] for index in range(0, len(lines), size)]
        merged = []
        for bucket in buckets:
            first = EMOJI_RE.match(bucket[0])
            prefix = f'{first.group(1)} ' if first else ''
            # 各条目先去句末标点再拼接，否则会出现「研究机器翻译。；如何成为…」这种「。；」
            bodies = [TRAILING_PUNCT_RE.sub('', EMOJI_RE.sub('', line).strip()) for line in bucket]
            body = '；'.join(item for item in bodies if item)
            if body and not body.endswith('。'):
                body += '。'
            merged.append(prefix + body)
        section['text'] = '\n'.join(merged)
    return sections


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


def source_fingerprint(items):
    """材料指纹：标题 + 链接排序后取哈希，用来判断这一轮素材和上一轮是否同一批。"""
    blob = '\n'.join(sorted(f'{item.get("title") or ""}|{item.get("url") or ""}' for item in items))
    return hashlib.sha1(blob.encode('utf-8')).hexdigest()[:16]


def load_previous_digest(previous):
    """读上一轮已经生成好的速览，用于生成失败时兜底。"""
    try:
        raw = json.loads(Path(previous).read_text(encoding='utf-8-sig'))
    except (OSError, ValueError):
        return None
    digest = raw.get('digest') if isinstance(raw, dict) else None
    if not isinstance(digest, dict):
        return None
    sections = digest.get('sections')
    if not isinstance(sections, list) or not sections:
        return None
    return digest


def keep_previous_digest(path, data, previous):
    """采集已经把 news.json 覆写成裸数据了，这里把上一轮的 digest 搬回来。

    不搬的话线上速览会直接消失：前端读不到 digest 就退回本地缓存，
    表现成「时间永远停在几小时前、刷新也不动」。
    """
    digest = load_previous_digest(previous)
    if not digest:
        return False
    data['digest'] = digest
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)
    return True


def write_digest(path, data, sections, model, based_on, fingerprint=''):
    data['digest'] = {
        'sections': sections,
        'text': flatten(sections),
        'model': model,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'basedOn': based_on,
        'sourceHash': fingerprint,
    }
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='news.json')
    parser.add_argument('--previous', default='news.previous.json',
                        help='采集前备份的上一版 news.json，用于生成失败时兜底')
    parser.add_argument('--security', default='extra-hotspots.json')
    parser.add_argument('--weibo', default='weibo-hot.json')
    parser.add_argument('--xueqiu', default='xueqiu-hot.json')
    parser.add_argument('--x-words', dest='x_words', default='x-words.json')
    parser.add_argument('--x-global', dest='x_global', default='x-global.json')
    parser.add_argument('--github', default='github-trending.json')
    parser.add_argument('--markets', default='markets.json')
    parser.add_argument('--account', default=os.environ.get('CF_ACCOUNT_ID', ''))
    parser.add_argument('--token', default=os.environ.get('CF_API_TOKEN', ''))
    parser.add_argument('--model', default=os.environ.get('CF_AI_MODEL', ''))
    args = parser.parse_args()

    path = Path(args.input)
    try:
        data = json.loads(path.read_text(encoding='utf-8-sig'))
    except (OSError, ValueError) as error:
        print(f'DIGEST_SKIP 读取 {path} 失败: {error}')
        return 0

    if not args.account or not args.token:
        if keep_previous_digest(path, data, args.previous):
            print('DIGEST_STALE 未配置 CF_ACCOUNT_ID / CF_API_TOKEN，沿用上一次速览')
        else:
            print('DIGEST_SKIP 未配置 CF_ACCOUNT_ID / CF_API_TOKEN')
        return 0

    items = [item for item in data.get('items') or [] if isinstance(item, dict) and item.get('title')][:MAX_ITEMS]
    if len(items) < 5:
        if keep_previous_digest(path, data, args.previous):
            print(f'DIGEST_STALE 有效资讯仅 {len(items)} 条，沿用上一次速览')
        else:
            print(f'DIGEST_SKIP 有效资讯仅 {len(items)} 条，样本太少')
        return 0

    fingerprint = source_fingerprint(items)
    previous_digest = load_previous_digest(args.previous)
    if previous_digest:
        generated = previous_digest.get('generatedAt') or ''
        try:
            age = (datetime.now(timezone.utc)
                   - datetime.fromisoformat(generated.replace('Z', '+00:00'))).total_seconds()
        except ValueError:
            age = 0
        # 时间闸门：触发频率（GitHub cron / Cloudflare Worker）随时可能被改错或失效，
        # 真正决定「多久生成一次」的应该是这里，这样即使每小时都触发也不会把额度烧光。
        if age < MIN_INTERVAL_HOURS * 3600:
            if keep_previous_digest(path, data, args.previous):
                print(f'DIGEST_REUSE 距上次生成只有 {age / 3600:.1f}h，未到 {MIN_INTERVAL_HOURS}h 间隔')
                return 0
        # 素材和上一轮完全一样也别重复生成
        elif previous_digest.get('sourceHash') == fingerprint and age < REUSE_WINDOW_HOURS * 3600:
            if keep_previous_digest(path, data, args.previous):
                print(f'DIGEST_REUSE 素材与上一轮一致（{age / 3600:.1f}h 前），沿用上次速览省额度')
                return 0

    security = load_security(args.security)
    hot = load_hot(args.security, args.weibo)
    short = load_short_video(args.security)
    intl = load_intl(args.security)
    reverse = load_reverse(args.security)
    finance = load_finance(args.security, args.xueqiu)
    tech = load_tech_media(args.security)
    x_news = load_x_news(args.x_words, args.x_global)
    open_source = load_open_source(args.github, args.security)
    market = load_market(args.markets, args.security)
    academic = load_academic(args.security)
    vendor = load_ai_vendor(args.security)
    print(f'DIGEST_MATERIAL security={len(security)} hot={len(hot)} video={len(short)} '
          f'intl={len(intl)} reverse={len(reverse)} finance={len(finance)} '
          f'tech={len(tech)} x={len(x_news)} oss={len(open_source)} '
          f'market={len(market)} paper={len(academic)} vendor={len(vendor)}')

    # 固定板块 + 材料非空的新板块都要校验，材料为空的就放过（当天没数据不怪模型）
    required = list(REQUIRED_SECTIONS)
    for name, rows in (('国际新闻', intl), ('逆向论坛', reverse), ('财经热榜', finance),
                       ('科技资讯', tech), ('X 新闻', x_news)):
        if rows:
            required.append(name)

    tech_prompt = build_tech_prompt(items)
    fixed_prompt = build_fixed_prompt(security, hot, short, intl, reverse, finance, tech, x_news)
    new_prompt = build_new_prompt(open_source, market, academic, vendor)
    models = [args.model] if args.model else MODELS

    def run(prompt, required_names, tag):
        """跑一遍模型链，返回 (model, sections)；全失败返回 (None, [])。"""
        best = None
        for name in models:
            try:
                raw = call_model(name, args.account, args.token, prompt)
            except urllib.error.HTTPError as error:
                # 429 到底是用量打满、限速还是权限问题，只有响应体能说清，必须打出来
                detail = ''
                try:
                    detail = error.read().decode('utf-8', 'replace')[:300]
                except Exception:
                    pass
                print(f'DIGEST_MODEL_FAIL[{tag}] {name} http={error.code} {detail}')
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
                       if not any(norm_title(title) in norm_title(section['title']) for section in sections)]
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
    new_required = [name for name, rows in (
        ('GitHub 与开源', open_source), ('市场行情', market),
        ('学术前沿', academic), ('AI 厂商官方', vendor)) if rows]

    tech_model, tech_sections = run(tech_prompt, [], '科技板块')
    tech_sections = [section for section in tech_sections
                     if not any(norm_title(name) in norm_title(section['title']) for name in required)]
    fixed_model, fixed_sections = run(fixed_prompt, required, '固定板块')
    new_model, new_sections = run(new_prompt, new_required, '开源市场前沿')

    if not tech_sections and not fixed_sections and not new_sections:
        if keep_previous_digest(path, data, args.previous):
            print('DIGEST_STALE 三段生成均失败，沿用上一次速览')
        else:
            print('DIGEST_SKIP 三段生成均失败，且没有上一次速览可沿用')
        return 0

    combined = dedupe_cross_section(
        tech_sections + fixed_sections + new_sections,
        keep_sections=REQUIRED_SECTIONS + list(new_required))
    sections = clamp_lines(ensure_line_emoji(
        dedupe_emojis(combined, priority=fixed_sections + new_sections)))
    model = fixed_model or tech_model or new_model
    write_digest(path, data, sections, model, len(items), fingerprint)
    total = sum(len(section['text']) for section in sections)
    print(f'DIGEST_OK sections={len(sections)} tech={len(tech_sections)} '
          f'fixed={len(fixed_sections)} chars={total} model={model} items={len(items)}')
    return 0



if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print(f'DIGEST_SKIP 未预期的错误 {type(error).__name__}: {error}')
        try:
            news = Path('news.json')
            keep_previous_digest(news, json.loads(news.read_text(encoding='utf-8-sig')), 'news.previous.json')
            print('DIGEST_STALE 异常兜底：沿用上一次速览')
        except Exception:
            pass
        sys.exit(0)
