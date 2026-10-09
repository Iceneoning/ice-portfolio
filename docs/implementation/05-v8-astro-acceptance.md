# V8 Astro 实施与验收记录

日期：2026-10-09（Asia/Hong_Kong）。项目：`H:\vs_code\ice-portfolio`。

后续更新：用户反馈雪花造型和整体美术需要改善，已完成 [视觉打磨](06-visual-refinement.md)。本文记录首次迁移时的状态与测试；当前 SVG 已重新绘制，与原型 SHA256 相同的描述仅适用于首次迁移。

V8 已迁移到正式 Astro 6 / TypeScript / Content Collections / MDX 工程。验收针对本次 `dist/` 和真实本地 HTTP 预览，不使用旧原型的验收结果。美术主观确认、真实 UE 媒体与工程证据仍需补齐；工程通过不代表这些工作已完成。

## 本次实现

- 首页保留 V8 晨光背景、版式、原文、作品选集和原创冬日纹章。SVG 从原型复制到 `public/visuals/snow-emblem.svg`，文件 SHA256 与原型一致；运行时无 `docs/prototypes` 依赖。
- 复用 `ProjectPoster`、项目集合和 `/projects/[slug]/` 路由。公共 Header / Footer / Hero / NextProject / ProjectLayout 负责布局，项目标题分行、卡片文字、颜色变体、介绍、职责与长文来自 MDX。
- 首页卡片为完整原生链接；案例首屏与页尾由同一 NextProject 组件生成具名换片入口。返回选集、浏览器历史与直接深链使用原生导航。
- 目录根据 MDX 二级标题生成；统一项目排序及草稿过滤，不输出草稿案例。内容 Schema 对已核准的封面要求 cover 与 coverAlt。
- 正文包含玩法目标、个人职责、系统设计、真实验证与待验证。RTS 明确命令系统非本人开发、多人实测尚未完成。Blitz Archive 明确复用 Lyra / GAS，具体个人实现尚待代码核实。
- 移除两份旧深色 CSS；未删除或覆盖旧公共媒体。卡片轻微抬升、键盘焦点反馈、纹章 9 秒轻呼吸；降低动效 CSS 关闭动画、过渡、平滑滚动及卡片抬升。

## 与原型的有意差异

1. `index.html` / `rts.html` / `blitz-archive.html` 改为 Astro 静态路由，链接统一为 `/projects/<id>/`。
2. 欢迎条和纹章小字去掉 `VISUAL STUDY 08` 原型状态标签；主体文案、纹章造型、色彩和布局比例保留。
3. 案例三个原型占位章节改成四个 MDX 内容章节，并保留数据驱动的职责清单与资料状态。长文未附源码的部分如实标为待核实。
4. 案例状态同时展示「开发中」和「案例资料整理中」；Blitz 的具体职责范围明确待源码核实。
5. 纹章整体是装饰，容器 aria-hidden，图片空 alt；增加公共 skip link、可见焦点、404、OG 标题与介绍。不填写虚构公开域名或 OG 游戏截图。
6. 清除从 base.css 继承的 optics / WebGL 样式。保留 Tailwind v4 theme / utilities，未引入会改变原型默认排版的 preflight。
7. 增加窄屏欢迎条/卡片顶栏折行、长文代码/表格溢出处理和 focus-visible 卡片反馈。

## 修改文件清单

已有文件修改：

- `README.md`
- `package.json`：增加构建验收命令与 packageManager
- `src/content.config.ts`
- `src/components/ProjectPoster.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`
- `src/pages/projects/[slug].astro`
- `src/pages/404.astro`
- `src/content/projects/rts-gameplay-systems.mdx`
- `src/content/projects/blitz-archive.mdx`
- `docs/implementation/04-codex-v8-handoff.md`：追加结果指针，保留原始任务书

新增文件：

- `pnpm-lock.yaml`
- `src/lib/projects.ts`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/Hero.astro`
- `src/components/NextProject.astro`
- `src/layouts/ProjectLayout.astro`
- `src/styles/winter.css`
- `src/styles/emblem.css`
- `public/visuals/snow-emblem.svg`
- `scripts/verify-build.mjs`
- 本文以及 `qa-v8-astro/` 中的 JSON / JPG 证据文件

明确移除的旧视觉依赖：`src/styles/cinema.css`、`src/styles/cinema-hero.css`。其他原有未提交文件未重置或清理。

## 命令与环境

Windows / PowerShell 7.6；Node v22.20.0；pnpm 10.28.1；浏览器为 Codex In-app Browser（Chromium）。浏览器视口覆盖为 1440×1000 和 390×844 CSS px，并在验收结束后恢复默认视口。

安装实际解析：Astro 6.4.8、MDX 6.0.3、Tailwind / Vite 插件 4.3.3、Astro Check 0.9.10、TypeScript 5.9.3。

```powershell
git status --short
node --version
pnpm --version
pnpm install
pnpm check
pnpm build
pnpm dev
pnpm preview --port 4322
pnpm verify:build http://127.0.0.1:4323/
node scripts/verify-build.mjs http://127.0.0.1:4323/ | Set-Content -LiteralPath docs/implementation/qa-v8-astro/build-results.json -Encoding utf8
pnpm check
Get-FileHash docs/prototypes/cinema-v8/snow-emblem.svg,public/visuals/snow-emblem.svg -Algorithm SHA256
```

安装成功。pnpm 提示跳过 esbuild / sharp 的安装脚本，本次类型检查和构建实际成功，无需另行放开脚本。构建有两条来自依赖 Zod 的 Rollup PURE 注释位置警告，不影响输出；Astro Check 为 0 errors / 0 warnings / 0 hints。

首轮浏览器窄屏检查发现清理旧 optics 样式时误移除了部分响应式断点。已修复并再次运行正式构建；最终手机截图和记录来自修复后的产物。

服务实际输出：4321 已被占用，开发服务器选择 **http://127.0.0.1:4322/**；请求的预览 4322 也被占用，构建预览选择 **http://127.0.0.1:4323/**。未终止或修改占用原端口的服务。

## 真实验收结果

| 项目 | 结果 | 实际依据 |
| --- | --- | --- |
| 依赖安装 | PASS | pnpm install 成功，生成锁文件 |
| 类型检查 | PASS | 0 errors / 0 warnings / 0 hints |
| 正式静态构建 | PASS | 首页、两部案例、404 共 4 页 |
| 1440px 首页与两部案例 | PASS | 实际浏览器检查、截图，无横向溢出 |
| 390px 首页与两部案例 | PASS | 实际浏览器检查、截图，无横向溢出；两部首屏换片按钮 bottom 约 242px，844px 视口可见 |
| SVG 主视觉 | PASS | naturalWidth 800；空 alt；无 canvas；SVG 与原型一致 |
| 首页两张卡片、首屏/页尾换片 | PASS | 两部作品的两处换片入口均已实际点击 |
| 返回作品选集、前进/后退 | PASS | 实际点击和 browser.back / forward |
| 深链与刷新 | PASS | 两部路径分别直接访问并 reload |
| 章节锚点 | PASS | 所有生成链接均对应真实 MDX 标题 ID，中文锚点有效 |
| 键盘 | PASS | 首页 11 个链接逐一 Tab，均 focus-visible 且实线 outline；RTS 卡片 Enter 导航成功 |
| 资源与 404 | PASS | CSS / SVG HTTP 成功；不存在路由 HTTP 404；404 页面有返回选集路径；浏览器控制台无 error / warn |
| 零 JS 基础架构 | PASS | 4 份正式 HTML 与已测页面均 0 个 script，所有导航是可用原生 href，无隐藏正文 |
| 浏览器显式禁用 JS 场景 | NOT RUN | 当前浏览器接口未暴露禁用 JS 开关；零脚本静态产物检查不冒充开关测试 |
| reduced-motion 实现与静态检查 | PASS（静态） | 已构建 CSS 含关闭动画/过渡的规则，源码含关闭平滑滚动、恢复静止变换的规则 |
| 浏览器模拟 reduced-motion | NOT RUN | 当前接口无媒体偏好模拟能力，未更改用户系统设置 |
| 静态/HTTP 回归 | PASS | 127/127 检查；数量含每条链接与锚点，非 127 个独立用户场景 |
| 主观审美确认 | 待用户评审 | 提供实际桌面和手机截图，不自动视为审美通过 |
| Lighthouse、完整 WCAG 审计、Safari/Firefox、真实手机 | NOT RUN | 本次未执行，未报告性能分数或帧率 |
| UE 网络/性能及功能测试 | NOT RUN | 本次只验收网站，未操作 UE 工程 |

## 证据

- [自动构建/HTTP 记录](qa-v8-astro/build-results.json)
- [浏览器尺寸、页面与键盘记录](qa-v8-astro/browser-results.json)
- [桌面首页](qa-v8-astro/home-1440.jpg)
- [桌面作品选集](qa-v8-astro/gallery-1440.jpg)
- [桌面 RTS](qa-v8-astro/rts-1440.jpg)
- [桌面 Blitz](qa-v8-astro/blitz-1440.jpg)
- [手机首页](qa-v8-astro/home-390.jpg)
- [手机 RTS](qa-v8-astro/rts-390.jpg)
- [手机 Blitz](qa-v8-astro/blitz-390.jpg)

截图为视口截图，不声称全页截图或实体手机测试。浏览器工具曾出现一次完整截图不支持和一次 body 键盘定位失败；已改用受支持的视口截图与当前聚焦链接逐项 Tab 验证，未将失败尝试算作通过。

## 剩余资料与边界

首页两张卡片和两部案例媒体版位都缺真实 UE 截图/录屏。两篇 MDX 的系统设计与验证章节缺代码/蓝图位置、版本、复现步骤和测试记录；Blitz 的具体扩展范围需源码核实。上述位置已在页面明确说明，未创造项目效果、截图、量化成果或测试记录。

未操作磁盘映射、Fuwari、Cloudflare、DNS 或部署；未执行 Git push、commit、reset、clean。服务仅监听 127.0.0.1。可运行的本地网站已经完成，公开展示所需的真实工程材料仍待提供。
