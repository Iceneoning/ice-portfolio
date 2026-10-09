# 组件树、接口契约与文件责任

## 1. 组件树（逻辑，不表示代码已存在）

```text
BaseLayout
├── SeoHead
├── SkipLink
├── SiteHeader / MobileNav
├── <main>
│   ├── HomePage / CinemaLobby
│   │   ├── LobbyHero → 保留 V3「让规则凝成世界」/ 冰晶构图 / 展厅 CTA
│   │   ├── ScreeningWall → ProjectPoster × N
│   │   └── BriefAbout / ContactStrip
│   ├── ProjectsIndex（可选扩充）→ ProjectGrid → ProjectPoster × N
│   ├── ProjectPage → ScreeningLayout / ProjectLayout
│   │   ├── ProjectHero / FactSheet
│   │   ├── MediaViewer / MediaGallery
│   │   ├── TechnicalSection / ArchitectureFigure / CodeExcerpt
│   │   └── EvidencePanel / RelatedProjects
│   ├── AboutPage
│   └── ResumePage
├── SiteFooter
└── 可选的装饰性 MotionBoundary / CrystalAccent
```

文件路由：`src/pages/index.astro`、`projects/index.astro`、`projects/[slug].astro`、`about/index.astro`、`resume/index.astro`、`404.astro`。路径仍以 [总体架构](01-system-overview.md) 为准。

## 2. 组件设计契约

| 组件 | 输入 | 输出及职责 | 禁忌 |
| --- | --- | --- | --- |
| `SeoHead` | `title, description, canonical, ogImage?` | 正确 title、OG、canonical、图标等 | 模板占位域名进入正式包 |
| `SiteHeader` | `activePath` | 语义 nav / 作品/关于/简历链接 | JS 才能导航、混用博客链接 |
| `LobbyHero` | `headline, subtitle, intro, galleryHref` | 保留 V3「让规则凝成世界」冰晶 Hero 与原文，CTA 导航至下方海报墙 | 擅自换回「请选择一个世界」或占满首页插入技术长文 |
| `ProjectPoster` | `ProjectCardViewModel`, `priority?` | 电影海报式真实封面、标题、职责一句话、独立 URL | 首页展开完整案例，或者硬编码路由 |
| `ScreeningLayout / ProjectLayout` | `project, headings/MDX content, nextProject?` | 独立详情骨架、章节顺序、返回大厅、换片 | 用首页弹窗替代独立页面 |
| `MediaViewer` | `poster, src?, captions?, title` | 视频点击加载、字幕与控制；无视频有占位说明 | 自动下载所有高清视频或静音抢占 |
| `ArchitectureFigure` | `src, alt, description?, caption` | 高清可缩放图 + 完整文字描述 | 只输出视觉 SVG 无语义说明 |
| `CodeExcerpt` | `language, code, filename?, note?` | 可阅读语法、行号可选和复制 | 未经许可直接输出公司源码 |
| `EvidencePanel` | `evidenceItems` | 展示证据级别、来源范围与未知项 | 将设计意图当作已验证功能 |
| `Reveal` | `as?, variant?, once?` | 仅装饰性的一次出现效果 | JS 失败时隐藏正文 |
| `CrystalAccent` | `intensity, placement` | 冰晶视觉纹理，默认无交互 | 遮住可点内容、参与读屏 |

所有组件采用 TypeScript Props；以内容 schema 的静态类型派生 ViewModel。不得到处使用 `any` 或为装饰引入全局共享状态。

## 3. 数据和视图转换

```text
MDX frontmatter（原始事实）
  → Content Collection schema
    → server-side project selectors / adapters
      → ProjectCardViewModel（精简：slug/title/summary/cover/ownedSystems/status）
        → 首页/索引的同一 ProjectCard
      → ProjectDetailViewModel（完整正文+媒体+证据）
        → ProjectLayout + MDX render()
```

- selector 负责过滤 `draft`、排序 `featuredOrder`、标准化 route。
- 卡片不自行筛选或查询 collection；与内容文件解耦。
- 所有项目图片宽高在构建时可确定，避免布局抖动；不要从前端临时抓取私有 CDN 数据。

## 4. 页面约定

### 首页

首页首先呈现用户认可的 **V3「让规则凝成世界」冰晶主视觉**（包括原有中英文介绍与「进入作品展厅」CTA）；下一分区为影院式精选海报墙，整张海报链接到独立项目 URL。保留简短关于摘要；**首页不展开完整技术案例**。这是用户最新明确确认的设计，优先级高于旧版「首屏直接展示两个海报」构想。

### 项目列表

卡片可单独复制分享目标链接；支持浏览器返回/刷新。V1 不加入筛选栏（项目数少，收益不足），后续项目数增加再评估筛选交互。

### 项目详情

每部作品都是独立 URL。用统一模板呈现“项目 / 本人负责 / 作品阶段 / 技术”，保持返回大厅、下一部作品与浏览器历史可用。原文 MDX 可用少量专项展示组件，不能为每个项目造一套 Web 应用。

最新分工见 [V4 导航方案](../design/07-s1-cinema-navigation-v4.md)。

### 简历页

未得到可公开 PDF 前只展示说明性占位，不生成失效下载按钮；发布前检查真实文件与路径。

## 5. 依赖规则

- `pages` 可依赖 `layouts`、`components`、`lib/content`。
- `components` 不直接依赖 `pages` 或引入完整 MDX 内容集合。
- `content` 不导入有副作用的交互脚本（仅允许可审核的展示组件）。
- `lib/content` 可以读取集合、转换 ViewModel，但不操作 DOM。
- `styles/tokens` 被所有页面共享，组件样式只消费 token，不修改全局色彩变量。
- `scripts/motion` 禁止更改项目数据或 route 决策。
- 不从博客仓库 import 任何构建时或运行时依赖。
