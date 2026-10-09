# 原创视觉：规则凝成世界

> 历史版本：用户随后反馈此版没有美感。当前实现与验收见 `10-winter-atelier.md`；此处保留当轮测试范围。

2026-10-09，Asia/Hong_Kong。用户认为上一轮布局模板化，要求自己的特色。本轮直接修改正式 Astro 源码，设计约定见 `docs/design/16-worlds-in-formation.md`。

## 实施

新增原创等距 SVG 几何：规则网格、空间模块、晶体分色；RTS 与 Blitz 使用不同主体和冷暖比例。重排首屏标题与插画、底部项目入口，作品区改成错位展开的分册。案例页沿用项目概念标记与颜色。所有概念封面明确标注非实机，原有真实媒体条件分支、MDX 事实、路由和首尾换片继续复用。

| 修改文件 | 用途 |
| --- | --- |
| `src/components/ConceptArt.astro` | 新增原创概念美术，按实例生成唯一 SVG 渐变 ID |
| `src/components/Hero.astro` | 标题、成形空间与底部项目入口的完整构图 |
| `src/components/ProjectPoster.astro` | 概念封面与分册正文；保留真实媒体分支 |
| `src/pages/index.astro` | 作品选集标签更新 |
| `src/layouts/ProjectLayout.astro` | 案例页概念标记与冷暖主题 |
| `src/styles/winter.css` | 原创视觉比例、分册错位、响应式和动效降级 |
| `scripts/verify-build.mjs` | 检查多实例 SVG ID 唯一及所有渐变引用有效 |
| `README.md`、设计 16、本记录 | 现行设计与验收记录；08 标记历史 |

## 执行与结果

```powershell
git status --short
pnpm check
pnpm build
node scripts/verify-build.mjs http://127.0.0.1:4323/ | Set-Content -LiteralPath docs/implementation/qa-v8-astro/identity-build-results.json
```

本轮复用已有依赖和服务，未安装或更新依赖。开发地址 `http://127.0.0.1:4322/`，正式构建预览 `http://127.0.0.1:4323/`。

| 实测 | 结果 |
| --- | --- |
| Astro 类型检查 | 21 文件，0 errors / warnings / hints |
| 正式构建 | 成功：4 HTML 页及历史 SVG 路由。Zod 的两处 PURE 注释警告未导致失败 |
| 构建及 HTTP 回归 | 190 / 190；包括资源、锚点、事实边界、换片、404、唯一 ID 与渐变引用 |
| 1440×1000 首页 | 双项目入口在首屏内；文档宽 1425，零脚本，SVG ID 无重复 |
| 1440 案例 | RTS / Blitz 文档宽 1425，无横向溢出；直接打开 Blitz 深链成功，Blitz 首屏入口进入 RTS |
| 390×844 首页与分册 | 文档宽 375，无横向溢出；插画接在文字之后，分册单列 |
| 390 案例 | 两部文档宽 375；首页分册进入 RTS，RTS 首屏换片到 Blitz；两部页尾互换、返回 `/#screenings` 均成功 |
| 键盘及返回 | Tab 到 Blitz 快捷入口，2px 可见焦点；Enter 进入案例，浏览器 back 回到首页 |
| 820×1000 | 检查发现旧绝对定位靠近文字，改为自然流后插画在正文之后、项目入口在插画之后；文档宽 805 |
| Console | 最终读取 warning / error 为零 |
| 无 JS | 构建全站零脚本，原生导航实测；浏览器关闭 JS 开关未单独模拟 |
| 降低动效 | 静态 CSS 回归通过，关闭动画 / 过渡 / 位移 / 平滑滚动；系统偏好模拟未执行 |
| 真机、多浏览器、屏幕阅读器 | 未执行；390px 是桌面浏览器视口模拟 |

截图与原始结果在 `qa-v8-astro/identity-*`。技术验证通过不代表用户已认可美术。UE 媒体、源码引用和可追溯测试记录仍待补。

未部署、推送 Git、修改 DNS / Cloudflare / Fuwari / 磁盘映射，也没有删除无关文件。
