# ICE Portfolio · 设计与工程文档

> 当前美术施工基准：**V8 冬日纹章**。V1–V7 浏览器原型已清理；仅保留 `prototypes/cinema-v8/`。正式 Astro 源码已有框架，但首次依赖安装、构建、部署与真实 UE 媒体验证尚未完成。V8 美术仍等待最终评审。

## 施工阅读顺序

1. [V8 视觉合同](design/14-v8-winter-emblem.md)：最新主视觉、配色、动效、页面结构、导航及禁用项。
2. [V8 独立 HTML/CSS/SVG 原型](prototypes/cinema-v8/README.md)：**视觉还原的首要依据**，包含首页、两篇案例、可编辑雪纹、截图与测试。
3. [整体架构](architecture/01-system-overview.md)、[内容模型](architecture/02-content-model.md)、[组件接口](architecture/05-component-contracts.md)：正式 Astro 迁移约束。
4. [技术选型](decisions/ADR-0001-tech-stack.md)、[原生跨页导航决策](decisions/ADR-0003-navigation-transitions.md)：Astro SSG、TypeScript、MDX 与真正独立项目页。
5. [案例模板](content/01-case-study-template.md)、[项目资产清单](content/02-project-inventory.md)、[媒体审核](content/03-media-collection-plan.md)：素材真实性、个人贡献和技术证据。
6. [动效边界](architecture/04-motion-runtime.md)、[媒体性能](architecture/06-media-performance.md)、[无障碍交互](design/02-interaction-accessibility.md)：质量和渐进降级。
7. [施工任务包](implementation/03-work-packages.md)、[验收标准](implementation/02-acceptance.md)、[部署安全](architecture/03-deployment-security.md)：开发顺序及发布限制。
8. [Codex 交接提示词](implementation/04-codex-v8-handoff.md)：从原型迁移正式 Astro 的施工要求。

## 项目状态与优先级

- 目标：面向 Unreal Engine Gameplay / C++ 客户端相关岗位的独立作品展示站点，与 Fuwari 博客无任何必需链接。
- **最新视觉：** 温暖晨光、浅青雾感、二次元冰雪纹章；首页「让规则凝成世界。」→「作品选集。」→ 可直接进入独立案例。
- **功能：** RTS 和 Blitz Archive 项目案例都需有显著的首屏/页尾下一部作品导航，且保留原生浏览器历史。
- **事实约束：** RTS 的命令系统并非本人开发；其多人网络实测尚未完成。Blitz Archive 应区分 Lyra/GAS 基座与个人扩展。
- **风险边界：** 正式源码已存在，但依赖未确认安装；不得把未运行的 build、Playwright、Lighthouse、部署或真实素材核验写为通过。

## 历史文档

`docs/design/04–13` 中的旧版冰晶/暗背景记录，以及一些早期架构文档中的“V4 已确认”措辞，**仅用于了解设计取舍，不能覆盖最新 V8 设计合同**。不应恢复已删除原型或写实雪花资源。
