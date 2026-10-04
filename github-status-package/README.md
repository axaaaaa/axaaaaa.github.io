# github-status-package

这个目录是**要同步到 GitHub Pages 仓库**（`axaaaaa/axaaaaa.github.io`）的那一部分。

## 内容

| 路径 | 作用 |
|---|---|
| `sites-to-check.json` | 待巡检的 URL 清单，**由 `scripts/generate-sites-list.py` 自动生成**，不要手改 |
| `scripts/check_sites.py` | 巡检脚本，逐个探测并把结果写成 `status.json` |
| `scripts/test_check_sites.py` | 巡检脚本的单元测试，Actions 里会先跑它 |
| `.github/workflows/site-status.yml` | 定时任务：测 → 巡检 → 打包 → 部署 Pages |

## 工作方式

```
sites-to-check.json
        │
        ▼
  GitHub Actions（每 6 小时 + 每次 push）
    ├─ unittest   ← 测试不过直接中断，不污染线上数据
    ├─ check_sites.py  ──►  status.json
    └─ 打包 index.html / css / js / img / status.json → Pages
```

巡检结果通过 `actions/cache` 在多次运行间传递，所以：

- 单次失败 → `retrying`（待复检）
- 连续失败 3 次 → `unreachable`（疑似异常）
- 超过 24 小时没复检的记录会被清掉

前端读 `status.json` 渲染每个链接的状态点，逻辑在 `src/utils/site-status.mjs`。

## 改巡检清单

**不要直接编辑 `sites-to-check.json`。** 先在 `src/data/*.js` 里增删站点，然后：

```bash
python scripts/generate-sites-list.py
```

脚本会按 `src/nav-data.js` 的 import 顺序重新生成清单（保持顺序、自动去重），
再把结果同步到：

- `github-status-package/sites-to-check.json`
- `dist/sites-to-check.json`

CI 里可以用 `--check` 只做校验，不写文件。

## 关于误报

`check_sites.py` 曾经因为 HTTPS 用错连接类（`HTTPConnection` 套 TLS socket，Host 头
被写成 `host:443`）而产生大量误报。现已修正并保留 SSRF 防护，详见
`../docs/上线检查清单.md`。
