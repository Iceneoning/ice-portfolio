# 技术资料、核验记录与待确认问题

- 核验时间：2026-10-08
- 范围：技术选型官方支持情况；具体依赖版本、CLI 命令和账号能力尚未在本地实测。
- 原则：优先官方文档；引用链接不代表软件已安装。

## 已核验的官方资料

| 主题 | 官方链接 | 对方案的影响 |
| --- | --- | --- |
| Astro Content Collections | https://docs.astro.build/en/guides/content-collections/ | `src/content.config.ts` + `glob()` loader + 可选 Zod schema，可管理本地项目内容 |
| Astro MDX 集成 | https://docs.astro.build/en/guides/integrations-guide/mdx/ | 可将 MDX 纳入集合，用于嵌入专门设计的技术展示组件 |
| Astro 部署到 Cloudflare | https://docs.astro.build/en/guides/deploy/cloudflare/ | 官方支持 Workers；静态站可直接配置 Wrangler assets，不需要 SSR adapter |
| Cloudflare Workers 静态资源 | https://developers.cloudflare.com/workers/static-assets/ | Workers 可托管 HTML/CSS/JS/图片等静态资源 |
| Wrangler assets 配置 | https://developers.cloudflare.com/workers/static-assets/binding/ | 通过 `assets.directory` 指定 `dist` 等静态输出目录 |
| Tailwind CSS v4 + Astro | https://tailwindcss.com/docs/installation/framework-guides/astro | 现行推荐 `tailwindcss` + `@tailwindcss/vite`，而非旧 v3 Astro integration 路径 |
| Astro View Transitions | https://docs.astro.build/en/guides/view-transitions/ | 默认原生多页导航；`ClientRouter` 属可选 SPA 式增强且会改变脚本生命周期 |
| MDN 跨文档 View Transitions | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using | 同源 MPA 可用 `@view-transition { navigation: auto; }` 渐进启用，无支持时正常导航 |
| Astro 内置 Prefetch | https://docs.astro.build/en/guides/prefetch/ | 可按链接 `hover`/`tap` 选择性预取，不建议全站默认预取 |
| Astro Image/Picture | https://docs.astro.build/en/reference/modules/astro-assets/ | `src/assets` 可在构建阶段优化、生成响应式图；`public` 不自动转换 |
| GSAP matchMedia | https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/ | 将来确实引入 GSAP 时，对不同断点/reduced-motion 动画与清理进行控制 |

## 初步结论

- 作品集不需要 SSR。Astro SSG 的公开静态页面足以覆盖当前用例。
- 项目内容以文件维护更易审查；数据库/CMS 不产生足够的 V1 收益。
- 复杂交互、GSAP、Three.js、视频托管服务都属于“需求触发再评估”，而不是 V1 依赖。
- 使用 Workers 是部署**目标**，不是“已经部署”或“免费配额一定满足”；实际媒体体积、限制和费用在实施时再核实。

## 待实施时确认

- Astro / Node.js / pnpm 在本机的具体版本与兼容性。
- `@astrojs/mdx` 与 Content Collections 的实际 `image()` frontmatter 路径行为。
- Workers 的静态站 404 行为、缓存头、构建集成和回滚操作。
- 用户实际拥有的域名、Cloudflare DNS 管理方式与子域名名称。
- 实机 Lighthouse、CPU 负载、视频首屏网络开销与移动端流畅性。
- 简历 PDF 是否已脱敏、是否含个人联系方式及发布许可。
