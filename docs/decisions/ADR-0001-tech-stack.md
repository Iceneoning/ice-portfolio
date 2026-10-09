# ADR-0001：V1 技术选型与架构基线

- 决策时间：2026-10-08
- 状态：**设计阶段采纳（Accepted for planning）**；尚未初始化、安装或验证代码
- 适用范围：ice-portfolio V1
- 决策依据：面向招聘的 UE 工程作品集、独立子域名、内容更新频率低、预算低、视觉品质高

## 决策驱动

1. 首屏在移动网络上应迅速展示定位和首个高质量作品；无需等待整个游戏视频加载。
2. 新增 UE 项目无需修改复杂前端组件；项目资料能够版本控制、代码审查和复用。
3. 单人维护，不引入身份系统、数据库、CMS 服务或长期后端运维。
4. 深度技术案例要支持代码片段、架构图、对照图和录屏，同时保留 SEO、可访问性与直接链接。
5. 可按页面逐渐增加交互，不因炫技牺牲可用性。

## 方案对比

| 决策点 | 选定 | 未选方案 | 主要理由 |
| --- | --- | --- | --- |
| 页面框架 | **Astro（静态生成 / SSG）** | Next.js / React SPA | 内容驱动、默认较少客户端 JS；V1 无 SSR 和账号诉求 |
| 语言 | **TypeScript + Astro 组件** | 全 JavaScript | Content Collections 的字段与 UI 接口可以静态校验 |
| 文档内容 | **Astro Content Collections + MDX** | 数据库 / Headless CMS | 作品更少更新，可直接 Git 提交，MDX 可嵌入演示组件 |
| 风格方案 | **Tailwind CSS v4 + CSS 自定义变量 / 组件样式** | 大型 UI 套件 | 精细自定义更容易；避免模板站的统一外观 |
| 交互 | **原生 CSS / Web Animations API；复杂动画按需引入 GSAP** | 全站 Three.js、无差别动效库 | 先做高质量转场，控制脚本、性能与维护成本 |
| 图片 | **Astro Image/Picture + WebP/AVIF 变体** | 所有图原始 PNG | 图片按断点和场景加载 |
| 视频 | **压缩 MP4 为主，WebM 可选 + poster + 按需加载** | 无条件自动播放高清背景视频 | 访客性能优先，视频需有控制 |
| 架构图 | **Mermaid 源文件或静态 SVG 导出** | 可执行 Canvas 全站引擎 | 清晰、易维护、可做无障碍替代 |
| 包管理 | **pnpm + lockfile（拟定）** | 混用 npm/yarn | 依赖一致；实际初始化后固定版本 |
| 测试 | **类型/构建检查 + 链接校验 + Playwright 冒烟 + Lighthouse 实测** | 只人工目测 | 视觉、可访问性、链接和构建均有验收证据 |
| 部署 | **Cloudflare Workers Static Assets + 独立子域名** | 与 fuwari 共建、引入 SSR 适配器 | 单独回滚与发布；当前官方对新项目推荐 Workers |

## 重要实现约束

- V1 以 `output: 'static'` 为出发点；先考虑直接部署 `dist/` 静态资源，**不为纯静态站点默认安装 `@astrojs/cloudflare` SSR adapter**。Cloudflare 适配器在使用按需渲染时再评估。
- Tailwind 采用 **v4 的 `@tailwindcss/vite` 集成**；不要照搬旧版 `@astrojs/tailwind` 的过时脚手架。
- MDX 使用官方 `@astrojs/mdx` 集成，通过 `src/content.config.ts` 中的 `glob()` loader 和 Zod schema 管理项目文章。
- 默认 Astro 服务端构建的 HTML，不为整个网站启用 React；独立高交互组件遇到真实需求再以 Islands 方式引入。
- **导航优先传统 Astro MPA**，尝试原生跨文档 View Transitions 作为渐进增强；不默认启用 `ClientRouter`，详见 [ADR-0003](ADR-0003-navigation-transitions.md)。
- 禁止为了视觉效果全局引入运行时 WebGL 背景、轮播大库或不断重绘的粒子系统。
- 依赖大版本与确切安装命令，在施工阶段根据届时官方文档核对并锁定；这里不提前声称依赖已经兼容。

## 非目标与升级条件

- V1 不做登录、后台编辑、访客留言、实时数据面板、UE 浏览器交互、可执行代码沙箱。
- 若确实需要交互式 3D 展台，先以独立 demo 做 FPS、移动端耗电、降级和可访问性评估，通过后才允许局部接入。
- 若内容作者明显增加、需要跨设备非 Git 编辑，再评估 CMS；若出现受保护数据或动态 API，再新写 ADR 审查 SSR/服务端方案。

## 风险与回滚

- **风险：** Tailwind 与自定义 CSS 混用产生风格漂移。**处理：** 设计 token 唯一来源、组件层封装、禁止任意值堆砌。
- **风险：** MDX 内任意 React/交互组件扩大 hydration。**处理：** 白名单组件、默认静态、不按文章整体 hydrate。
- **风险：** 大视频吞吐消耗和首屏延迟。**处理：** 图片封面先于视频、显式播放、独立媒体预算。
- **回滚：** 保持静态输出和内容层解耦；换部署平台无需改写页面/项目 MDX。

## 技术资料

参见 [官方资料核验](../research/01-official-sources.md)、[架构总览](../architecture/01-system-overview.md)、[媒体 ADR](ADR-0002-motion-media.md)。
