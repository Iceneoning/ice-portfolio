# 冬日工坊：实施与验收

2026-10-09，Asia/Hong_Kong。用户反馈上一版「没有美感」，直接修改正式 Astro 源码。当前设计见 `docs/design/17-winter-atelier.md`。

## 实施范围

替换几何主视觉，使用为网站生成的三幅冬日概念插画，重做标题字体、色彩、背景融合和作品区。停止页面对 `ConceptArt.astro` 的引用。内容集合、MDX 事实、独立路由、真实媒体条件和首尾换片保留。所有插画明确标注为 AI 概念图、非 UE 画面。

| 文件 | 修改 |
| --- | --- |
| `src/components/Hero.astro` | 场景图片、渐变遮罩、主标题和项目入口 |
| `src/components/PortfolioArtwork.astro` | 新增共享响应式插画组件 |
| `src/components/ProjectPoster.astro` | 概念封面、标题与职责的清楚层次；保留真实媒体分支 |
| `src/layouts/ProjectLayout.astro` | 去掉旧晶体；对应概念横幅、可见非 UE 标注 |
| `src/pages/index.astro` | 作品区标签与介绍 |
| `src/layouts/BaseLayout.astro` | 暖白 theme color |
| `src/styles/winter.css` | 全站字体、画面比例、响应式、动效与案例阅读样式 |
| `src/assets/atelier/` | 三幅 PNG 源图、来源说明与完整生成提示词 |
| `package.json`、`pnpm-lock.yaml` | 增加 Sharp 0.35.5 图片优化依赖 |
| `scripts/verify-build.mjs` | srcset 资源存在、WebP、AI 标注与旧几何图未引用检查；重复资源检查去重 |
| README、设计 17、本记录 | 当前版本说明；09 标记历史 |

## 命令与构建

```powershell
git status --short
pnpm check
pnpm build
pnpm add sharp
pnpm check
pnpm build
node scripts/verify-build.mjs http://127.0.0.1:4323/ | Set-Content -LiteralPath docs/implementation/qa-v8-astro/atelier-build-results.json
```

首次构建因缺失 Sharp 失败；安装项目依赖后解决。最终 Astro 检查 22 文件，0 errors / warnings / hints。构建成功生成 4 HTML 页、保留的历史 SVG 路由和 11 个优化图片变体。主视觉 WebP 的构建日志约为 67 / 145 / 302kB；原始 PNG 约 2.6MB。两处已有 Zod PURE 注释警告仍存在，不影响构建。pnpm 提示旧 esbuild / sharp 版本脚本被忽略，本次所需图片处理实际执行成功。

构建及 HTTP 回归 138 / 138。检查范围含静态资源、srcset 所有变体、锚点、两部换片、事实边界、404、无 JS 与静态降低动效规则；数量不与上一轮直接比较，因为重复资源去重且旧 SVG 渐变检查不再产生对应条目。

## 浏览器实测

| 范围 | 结果 |
| --- | --- |
| 1440×1000 首页 | 文档宽 1425，零客户端脚本，所有图片加载；两部入口底部约 832px，在首屏内 |
| 390×844 首页 / 作品区 | 文档宽 375，零脚本，插画加载正确，无横向溢出；手机单列封面与内容 |
| 820×1000 首页 | 文档宽 805，图片加载，标题和入口未溢出；场景遮罩保持文字可读 |
| 两部手机案例 | 文档宽 375；Blitz 首屏下一部入口底部约 213px；RTS 卡片进入案例成功 |
| 键盘导航 | Tab 从 RTS 快捷入口到 Blitz，2px 可见焦点；Enter 进入 Blitz，浏览器 back 返回首页 |
| 首尾换片 | RTS 首屏 → Blitz，Blitz 页尾 → RTS，RTS 页尾 → Blitz；返回作品选集 `/#screenings` 成功 |
| 桌面深链 / 换片 | 直接打开 Blitz URL 正确，首屏 → RTS 正确；两部文档宽 1425 |
| Console | 最终读取 warning / error 为零 |
| 无 JS | 构建无脚本，原生链接已实测；未单独操作浏览器禁用 JS 开关 |
| 降低动效 | CSS 静态检查通过；未模拟系统偏好 |
| 真机、多浏览器、屏幕阅读器 | 未执行；390px 为桌面视口模拟 |

原始结果和截图：`docs/implementation/qa-v8-astro/atelier-*`。验证针对最新正式构建，不表示美术已经获得用户认可。

开发地址 `http://127.0.0.1:4322/`，构建预览 `http://127.0.0.1:4323/`。未部署、推送 Git、修改 DNS / Cloudflare / Fuwari / 磁盘映射，未删除无关文件。真实 UE 媒体、源码和测试证据仍待补。
