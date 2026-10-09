# Codex 施工交接：将 V8 冬日纹章原型迁移至正式 Astro 网站

**执行路径：** `H:\vs_code\ice-portfolio`（仓库根目录）。

## 给 Codex 的完整施工指令

你是负责将此仓库内**已存在的 V8 冬日纹章设计原型**落地为可构建 Astro 作品集的前端工程师。目标不是重新设计视觉，也不是继续出旧版视觉方案，而是**检查当前源码 → 迁移 V8 → 运行可重复验收 → 汇报实际结果**。请直接修改代码，不要停留在设计提案或空泛说明。

### 开工前必须读取

1. `README.md`、`package.json`、`astro.config.mjs`、`src/content.config.ts`；
2. `docs/design/14-v8-winter-emblem.md`：当前唯一美术设计合同；
3. `docs/prototypes/cinema-v8/index.html`、`rts.html`、`blitz-archive.html`、`base.css`、`emblem.css`、`snow-emblem.svg`；
4. `docs/architecture/01-system-overview.md`、`02-content-model.md`、`05-component-contracts.md`；
5. `docs/decisions/ADR-0001-tech-stack.md`、`ADR-0003-navigation-transitions.md`、`docs/implementation/02-acceptance.md`、`03-work-packages.md`。

**重要版本边界：** `docs/prototypes` 已清理到只剩 `cinema-v8/` 和 README；旧版 V1–V7 视觉原型已经删除。某些旧设计/架构文档提到暗色冰窟、实拍雪晶或 V4/V7 的历史要求，**不得覆盖 V8 现行设计**。V8 内的 `base.css` 已自包含旧版通过的暖冬排版，不需要再找 V7 文件。

### 当前工程事实

- Astro 6 静态站、TypeScript、Content Collections/MDX、Tailwind 4 的源码骨架已存在于 `src/`，不是空仓库。
- 当前 `src/pages/index.astro`、`src/pages/projects/[slug].astro` 和 `src/styles/cinema*.css` 还是**旧暗色影院视觉**；必须在保留内容模型的前提下迁移到 V8，而不是把旧首页当现行设计。
- 部分文件在 Git 中尚未提交，先 `git status`，不要清空工作区、无条件重置或覆盖用户未保存的改动。
- 旧版 SVG/WebP 素材可能仍位于 `public/visuals`，不再用于 V8 主视觉；不要因为清理原型就误删仍被其他页面引用的公共资产。

### 具体实施要求

1. **重构基础样式和布局。** 在 `src/styles` 中整理 V8 的晨光浅蓝背景、暖白天空、深墨蓝文字、Typography、响应式断点、卡片与导航；参考 V8 视觉，不要求一字不差保留原型 CSS 结构，但**视觉层级、比例、明亮气氛和文字内容不能退回旧版**。浏览器与资源构建不能依赖 `docs/prototypes` 的相对文件路径。
2. **首页 Hero。** 准确保留「凝固一瞬光，构建一个世界。」「让规则 / 凝成世界。」「From systems to playable worlds.」「专注于 Unreal Engine 客户端与 Gameplay Systems。」及用户确认的说明；右侧使用 V8 原创 `snow-emblem.svg` 作为二次元幻想纹章。把 SVG 正确放进 Astro 可发布的静态资产目录，保留透明背景，不引入实拍材质、写实雪晶或旧 WebGL shader。允许极轻的 CSS 呼吸，`prefers-reduced-motion` 下关闭。
3. **作品选集。** 保留「作品选集。」和「选择一个项目，进入独立的作品页面。了解玩法目标、个人职责与技术实现。」使用现有 Content Collections 驱动 RTS 和 Blitz Archive 的展示顺序、标题、介绍和原生链接；整张卡片可点击、键盘可用。无真实 UE 图片时使用明确的文字占位，**禁止凭空绘制游戏实机截图、项目效果或不存在的技术成果**。
4. **独立案例页。** 继续使用 `/projects/[slug]/` 和项目 MDX，不把所有案例展开在首页。两部案例在**首屏标题区域与页尾**都要有清楚写明下一部作品名称的链接；返回选集、浏览器前进后退和深链必须工作。保留信息章节：玩法目标、系统设计、个人职责、真实验证/待验证。
5. **事实准确性。** RTS：本人负责地图、建筑、能力、资源；命令/Order 系统不是本人开发；多人网络尚未进行完整多人测试，不允许写成实测通过。Blitz Archive：区分 Lyra/GAS 现有框架与独立扩展，若证据未核实则标注待补，不要编造数据、录屏或代码链接。
6. **动效品质。** 动画以少而精为原则；作品卡 hover/focus 亮边、小幅抬升、主纹章极轻微运动即可。不要全屏乱飞粒子、大幅旋转、强烈扫光、没有意义的开场动画。页面最初可见性、无 JS 正常导航和移动端阅读优先。
7. **工程化。** 优先复用已经存在的 Astro Layout、ProjectPoster、Content Collection Schema 与项目 MDX；可合理拆分 Header/Hero/ProjectCard/ProjectLayout 等组件，不需要新增 React、Three.js 或 SPA Router。保持 Astro SSG、TypeScript、MDX、Tailwind v4 技术方向，不修改 Fuwari 博客。合理设置标题、description、装饰图 alt、可访问标签和焦点样式。
8. **质量验收。** 在工具和权限允许的情况下执行 `pnpm install`（仅在依赖尚未安装时）、`pnpm check`、`pnpm build`；启动站点并用桌面 1440px 和手机 390 CSS px 验证布局、首屏 SVG、无横向滚动、首页→RTS→Blitz→首页、首屏/页尾换片按钮、reduced-motion、资源 404 和无 JS 链接。能用自动化就输出实际结果；不能运行就明确写 `NOT RUN`，**禁止把预期测试说成已通过**。
9. **安全界限。** 不动磁盘映射，不改 Cloudflare/DNS/线上部署，不擅自 `git push`、`git reset --hard`、删除项目资源或替换任何真实媒体；涉及网络安装/外部发布、缺权限或敏感素材时按当前工具安全机制处理。当前阶段只需要本地实现和验收，不要部署上线。

### 交付报告必须包含

- 实际修改和新增的文件列表，以及对 V8 原型作过的任何差异；
- 执行过的命令、构建/类型检查/浏览器验收结果、未运行的项目；
- 能打开的本地开发 URL（启动成功后以真实终端输出为准）；
- 尚缺真实 UE 素材、证据或用户审美确认的具体位置；
- 未触碰的 Fuwari、Cloudflare、磁盘映射与 Git push 安全边界。

目标：**把已认可的 V7 页面节奏 + 当前 V8 二次元雪花风格，从 docs 原型真正变成可运行、可深链、可维护的 Astro 作品集。** 先执行，遇到真实阻塞再说明；不要仅回复计划。

## 施工结果（2026-10-09）

正式 Astro 迁移已完成。实际修改、运行命令、浏览器截图、测试通过范围及未执行项见 [V8 Astro 验收记录](05-v8-astro-acceptance.md)。本交接任务书保留为原始要求，历史的「尚未迁移」状态不代表当前源码状态。
