// Cloudflare Worker：定时向 GitHub 发送 workflow_dispatch，触发线上采集。
// 令牌不写在代码里，通过 `wrangler secret put GH_TOKEN` 存成加密环境变量。

const OWNER = "axaaaaa";
const REPO = "axaaaaa.github.io";
const WORKFLOW = "collect-news.yml";
const REF = "main";

async function dispatch(env) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "pages-dispatch-cron",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: REF }),
  });

  const body = await res.text();
  const ok = res.status === 204;

  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      status: res.status,
      ok,
      body: body.slice(0, 200),
    })
  );

  if (!ok) {
    if (res.status === 401) console.error("GH_TOKEN 无效或已过期");
    else if (res.status === 403) console.error("GH_TOKEN 权限不足，需要 Actions: Read and write");
    else if (res.status === 404) console.error("仓库/工作流路径不对，或令牌未授权该仓库");
    else console.error(`GitHub 返回 ${res.status}`);
  }

  return ok;
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(dispatch(env));
  },

  // 手动自测用：/ ?key=<TRIGGER_KEY>；未设置 TRIGGER_KEY 时一律 404。
  async fetch(request, env) {
    const key = new URL(request.url).searchParams.get("key");
    if (!env.TRIGGER_KEY || key !== env.TRIGGER_KEY) {
      return new Response("not found", { status: 404 });
    }
    const ok = await dispatch(env);
    return Response.json({ ok }, { status: ok ? 200 : 502 });
  },
};
