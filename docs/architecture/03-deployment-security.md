# 部署、域名与安全架构

## 架构决定

网站独立仓库、独立流水线、独立子域名，例如 `portfolio.<your-domain>`（**占位，尚未提供真实域名**）。博客 `fuwari` 不需要指向作品集，作品集可以公开分享自己的链接。独立部署不等于要购买第二个域名。

推荐 **Astro SSG → dist → Cloudflare Workers Static Assets → 自定义子域名**，无需先部署 API Worker。官方文档明确指出：静态 Astro 部署 Workers 可配置 `assets.directory: "./dist"`，若使用 on-demand rendering 才需要 Astro Cloudflare adapter。

## 发布拓扑（提案）

```text
ice-portfolio Git repo
  └─ push / PR
      └─ CI: install --frozen-lockfile → typecheck → build → link/media checks
          └─ preview environment
              └─ approved main release → Cloudflare Workers Static Assets
                  └─ portfolio.<your-domain>
```

仓库部署凭据留在 Cloudflare / CI 的 secrets 中，**绝不能**写入 MDX、README、前端 JS、截图或提交历史。V1 可能选 Cloudflare Workers Builds 与 Git 连接实现自动部署，实际入口和密钥管理按账号情况核验。

## 配置草案（施工时核对现行 Wrangler schema）

```jsonc
{
  "name": "ice-portfolio",
  "compatibility_date": "YYYY-MM-DD",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

上例是部署方向示意；`compatibility_date` 需要在实施当日写入真实日期，并使用最新版官方 schema 校验。不要直接拿占位配置发布。

## 域名和 SEO 的边界

- 博客不加作品集入口，不代表作品集需要隐藏：招聘作品集应保留可直接访问 URL、OG 信息、站点地图（按发布需要）。
- 如要将部分项目暂时保密，使用 `draft: true` 在构建时排除，而不是靠没有导航入口。
- 首次发布只绑定作品集子域名，不改博客所在根域名的正常 DNS 与构建流程。
- 检查根域名既有 Cookie 的 `Domain` 作用域，避免博客的跨子域 Cookie 在新站无意发送。
- 若启用统计，优先隐私友好且无须弹窗的轻量方案；不默认接入广告、追踪像素或个人信息表单。

## 安全检查

1. 不将 `*.env`、密钥、UE 私有插件授权、公司工程和受限第三方素材打包到 `public/`。
2. 公开源码片段脱敏路径、账号、服务地址、日志用户标识；审核许可证与原创贡献。
3. 外部链接使用安全的 `rel` 属性与目标策略，避免访问非预期域名。
4. 评估 CSP、安全响应头与 iframe/video 外链域名；不要在未审查资源域前配置会破坏内容的极严 CSP。
5. 依赖使用锁文件；CI 检查构建与已知问题；定期更新依赖但不无验证升级主版本。
6. 预览环境与正式域名分开，不在公开站点暴露调试组件/内部文档。
7. 不在网站 JS 中放 Cloudflare API 令牌；所有部署操作必须通过有权限的 CLI/CI。

## 发布与回滚检查

- 当前 `main` 的 Git commit SHA 和构建版本可追溯；预览与正式发布有清晰区分。
- 域名 HTTPS、页面直接访问、404、移动端、视频加载、PDF 下载、OG 预览分别实测。
- 发现错误的个人贡献描述或敏感内容，优先撤下对应案例并回滚发布。
- 新域名 DNS 或 Workers 路由设置需要明确授权；本次文档阶段不执行任何部署或域名修改。

## 官网

- https://docs.astro.build/en/guides/deploy/cloudflare/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/binding/
