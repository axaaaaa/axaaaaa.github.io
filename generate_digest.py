"""用 Cloudflare Workers AI 生成「今日速览」，写回 news.json 的 digest 字段。

设计原则：这一步是锦上添花，任何失败都只跳过、不报错、不阻断采集与部署。
凭证来自环境变量 CF_ACCOUNT_ID / CF_API_TOKEN，缺失时静默跳过。
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}'

# 实测：8b 可读性最好，70b 更保守（不编造但偏平淡），按序兜底；可用 CF_AI_MODEL 覆盖
MODELS = ['@cf/meta/llama-3.1-8b-instruct-fp8-fast', '@cf/meta/llama-3.3-70b-instruct-fp8-fast']

MAX_ITEMS = 24
MAX_TOKENS = 900
MAX_CHARS = 700

SYSTEM = (
    '你是一名中文科技媒体的值班编辑，擅长把一堆资讯压成一段让人想读下去的导读。'
    '你只依据给定材料写作，不编造、不评论、不署名。'
)

TEMPLATE = """以下是今天采集到的 {n} 条科技资讯，格式为「序号. [分类] 标题 —— 摘要」：

{material}

请写一段导读，要求：
1. 只依据上面的材料，不要补充任何材料之外的信息，不要猜测原因或影响；
2. 按重要性从高到低，开头先说今天最值得关注的一件事，再依次带出其余值得一看的内容；
3. 篇幅 300～400 字，写成 3 段：第一段说今天最值得关注的一件事（2～3 句），第二段说其他重要动态（3～4 句），第三段说新品、产品与价格类信息（3～4 句）；不要分点、不要编号、不要小标题、不要加粗；
4. 不要使用「据悉」「值得注意的是」「总的来说」这类套话，也不要提到「以上」「下面」「这份材料」；
5. 不要做推断或评价：不写「这说明」「意味着」「反映出」后面那类内容，只陈述材料里直接出现的事实；
6. 不要提到材料里没有的公司、产品、地区或数字；材料以商品与降价信息为主时，就老实概括有哪些值得关注的新品，不要硬凑趋势；
7. 每句都要带新信息，不要先把标题念一遍再补细节，同一件事只说一次。"""


def build_prompt(items):
    lines = []
    for index, item in enumerate(items, 1):
        title = re.sub(r'\s+', ' ', str(item.get('title') or ''))[:120]
        summary = re.sub(r'\s+', ' ', str(item.get('summary') or ''))[:160]
        category = str(item.get('category') or '')
        line = f'{index}. [{category}] {title}'
        if summary:
            line += f' —— {summary}'
        lines.append(line)
    return TEMPLATE.format(n=len(items), material='\n'.join(lines))


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


def call_model(model, account, token, prompt, timeout=45):
    payload = {
        'messages': [
            {'role': 'system', 'content': SYSTEM},
            {'role': 'user', 'content': prompt},
        ],
        'max_tokens': MAX_TOKENS,
        'temperature': 0.3,
    }
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
    return tidy(text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='news.json')
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

    prompt = build_prompt(items)
    for model in ([args.model] if args.model else MODELS):
        try:
            text = call_model(model, args.account, args.token, prompt)
        except urllib.error.HTTPError as error:
            print(f'DIGEST_MODEL_FAIL {model} http={error.code}')
            continue
        except Exception as error:  # 超时、网络、解析失败都只换下一个模型
            print(f'DIGEST_MODEL_FAIL {model} {type(error).__name__}: {error}')
            continue
        if not text:
            print(f'DIGEST_MODEL_FAIL {model} 返回空文本')
            continue
        data['digest'] = {
            'text': text,
            'model': model,
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'basedOn': len(items),
        }
        temp = path.with_suffix('.tmp')
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temp.replace(path)
        print(f'DIGEST_OK chars={len(text)} model={model} items={len(items)}')
        return 0

    print('DIGEST_SKIP 所有模型均失败，保留原有数据')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as error:
        print(f'DIGEST_SKIP 未预期的错误 {type(error).__name__}: {error}')
        sys.exit(0)
