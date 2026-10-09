# 内容架构与数据契约

## 数据唯一来源

项目卡片、首页精选列表、项目详情都来自同一个 `projects` Content Collection。**不要**在组件中复制项目名、截图和技术描述。MDX 仅负责长篇说明，通用 metadata 负责索引、排序和 SEO。

- 位置：`src/content/projects/<slug>.mdx`
- 配置：`src/content.config.ts`
- 读取：`getCollection('projects')` / `getEntry('projects', slug)`
- 路由：`src/pages/projects/[slug].astro` 的 `getStaticPaths()`
- 构建时：校验 schema、slug 唯一性、必填图片、必填责任边界、媒体引用和页面路由
- 参考：Astro 官方 Content Collections `glob()` loader + Zod schema

## 规范化字段（设计契约）

| 字段 | 类型 | 语义 / 约束 |
| --- | --- | --- |
| `title` | string | 对外作品名称，不因营销任意改动 |
| `subtitle` | string | 具体技术定位，如「RTS 建筑与资源系统」 |
| `summary` | string | 1–2 句介绍，首页卡片可完整读懂 |
| `featuredOrder` | number? | 精选排序，空表示不进入首页精选 |
| `stage` | enum | `prototype / in-progress / demonstrable / archived`，反映作品状态 |
| `role` | string | 本人在项目中的身份与职责摘要 |
| `ownedSystems` | string[] | 本人实际负责的模块；必须核实 |
| `integratedSystems` | string[] | 复用或参与集成、但不主张独立原创的模块 |
| `stack` | string[] | 实际用到的引擎、语言和关键技术 |
| `cover` | image() | 与 MDX 文件相对的项目封面，走 Astro 优化流程 |
| `gallery` | image()[] | 可选多张实机截图 |
| `video` | string? | 指向 `/media/projects/<slug>/...` 的公开视频 |
| `sourceUrl` | url? | 仅允许已公开且核验的源码入口 |
| `demoUrl` | url? | 真实且可访问的演示链接 |
| `publishedAt` | date | 案例首次对外发布时间 |
| `updatedAt` | date? | 内容修订日期 |
| `evidenceLevel` | enum | `described / captured / tested`，代表该案例所附证据等级 |
| `draft` | boolean | 未公开案例构建时不输出、也不出现在索引 |

`slug` 由 MDX 文件路径 ID 定义，另在构建期间校验链接稳定；若将来迁移 slug，必须显式维护 redirect，不应悄悄更改。

## MDX frontmatter 示例（说明性草案，并非可直接构建）

```yaml
---
title: "RTS Gameplay Systems"
subtitle: "建筑 / 资源 / 能力 / 地图"
summary: "围绕 RTS 玩法搭建可组合的核心系统。"
featuredOrder: 1
stage: "in-progress"
role: "系统实现与集成"
ownedSystems: ["地图", "建筑", "能力", "资源"]
integratedSystems: ["现有命令体系的接入（须核对具体范围）"]
stack: ["Unreal Engine 5.8", "C++"]
cover: "../../assets/projects/rts/cover.webp"
video: "/media/projects/rts/overview.mp4"
publishedAt: 2026-10-08
evidenceLevel: "described"
draft: true
---
```

以上日期、图片路径、视频路径与证据状态是**模板占位内容，不代表已有资产**。实际施工必须使用已核实的项目材料，且先确认 `image()` 相对路径与实际文件位置。

## 案例正文的章节数据与呈现

正文由 MDX 组织，标准标题顺序：

1. 30–60 秒功能视频 / 静态图文替代
2. 项目背景与要解决的问题
3. 我负责的部分、复用/协作边界
4. 技术架构 / 系统数据流
5. 2–4 个关键实现细节（设计约束 → 技术方案 → 取舍）
6. 测试、验收、证据和已知限制
7. 项目总结、复盘与相关链接

组件可包括 `ArchitectureFigure`、`CodeExcerpt`、`MediaViewer`、`EvidenceBadge`、`DecisionTable`，但内容必须在组件不可用时仍有语义文本和可替代内容。

## 真实性和证据等级

- **described：** 文字说明；不意味着功能已经验证。
- **captured：** 有对应版本的真实运行截图、录屏或可检查代码。
- **tested：** 测试范围、环境、步骤、结果、日期均有可追溯记录；不得将单个通过测试扩大为“完整系统验证通过”。
- 可给同一项目的不同特性附不同证据等级；页面整体等级不等于每个功能都通过测试。
- 不能将“理解 Replication 技术”自动写为“完成多人测试与延迟丢包验证”。

## 内容维护与迁移

- 添加项目时新增 MDX 和对应媒体，不必复制一份首页卡片对象。
- 首页只展示 `!draft` 且有 `featuredOrder` 的项目，按顺序稳定排序。
- 项目索引读取全部非草稿数据，详情由 slug 静态生成。
- 所有数据按 UTF-8、绝对站内 URL 约定、统一大小写处理。
- 任何源代码片段在公开前核对版权、隐私、许可证和可复现程度。
