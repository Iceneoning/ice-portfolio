# ADR-0003：原生导航优先、页面转场渐进增强

- 时间：2026-10-08
- 状态：**设计方案采纳，具体转场尚待原型和跨浏览器测试**
- 背景：作品集需要高质量视觉衔接，但不需要整站 SPA 或常驻 JS 路由。
- S1 V4 明确采用 [冰晶影院选片大厅 → 独立作品展映厅](../design/07-s1-cinema-navigation-v4.md)；点击作品必须进入独立页面而非首页同页展开。

## 选择

**先使用 Astro 默认多页应用（MPA）导航。** 当视觉样稿需要跨页面衔接时，优先尝试浏览器原生 **跨文档 View Transitions**，只在同源页面且浏览器支持时启用；回退为正常的完整页面导航。

```css
/* 施工示意：需核对目标浏览器支持和实际转场表现 */
@view-transition {
  navigation: auto;
}
```

跨文档过渡是双方页面 opt-in 的能力，**不能**假定每个浏览器、跨域链接或 PDF 下载都能播放动画。首页项目封面与详情 Hero 可用稳定、仅页面当下唯一的 `view-transition-name` 实现共享元素试验；其 key 应基于项目 id，避免同页多个元素名称冲突。

V4 本地原型已经采用 `index.html → rts.html / blitz-archive.html` 的正常链接；原生 View Transitions 仅作为可选视觉增强，不能插入强制等待或不可跳过的片头动画。

## 不在 V1 默认启用 `<ClientRouter />`

Astro 的 `<ClientRouter />` 能增强过渡并模拟 SPA 式导航，但会引入客户端路由生命周期：部分脚本在切换后不自动重新执行、持久组件可能保留状态、需处理清理和页面焦点。仅在实际原型证明「原生 MPA 不足以实现一个经审美评审确认的关键过渡」时评估，并须先完成专项回归测试。

若将来升级：

1. 记录为什么原生 MPA 不能满足目标，以及影响的页面。
2. 试点一条首页→项目页→返回的链路，不一次全站开启。
3. 定义 `astro:before-swap`、`astro:page-load` 等生命周期事件的脚本归属和销毁策略（实际名称按锁定版本文档确认）。
4. 覆盖返回、前进、直达链接、滚动位置、焦点、视频播放状态和脚本重复初始化。
5. 保证 `prefers-reduced-motion` 下退化到无动画导航。

## 预获取策略

V1 不全局预取所有项目页；如需改善跳转响应，在首屏精选项目链接按需添加 Astro 官方内置 `data-astro-prefetch="hover"`，触控优先 `tap`。禁用对外部链接、视频文件、简历 PDF 的预取；真实网络预算实测后决定是否保留。

## 备选方案及排除原因

| 方案 | 优势 | 本项目 V1 取舍 |
| --- | --- | --- |
| 无转场 MPA | 最可靠且零附加客户端路由 | 永远存在的回退 |
| 浏览器原生跨文档 View Transitions | 不需要额外 SPA 路由 runtime，可渐进增强 | **优先试验** |
| Astro ClientRouter | 控制力更强，支持更多降级过渡 | 非必要不启用 |
| React Router / Next.js App Router | 适合深交互应用及状态保留 | 项目展示场景额外复杂度较高 |
| GSAP 拦截点击后整页遮挡 | 动画自由度高 | 容易破坏焦点、返回和弱网体验，不采用 |

## 验收与回滚

- 浏览器无 JS、未支持新 API、reduced motion 以及网络失败时，导航必须正常工作。
- 任何动画不应阻止点击、返回或阅读；一次转场不能出现双份标题、白屏或留存的旧遮罩。
- 失败时移除 `@view-transition` 的启用规则即可回到标准 MPA，不影响内容层。
- 官方参考：
  - https://docs.astro.build/en/guides/view-transitions/
  - https://docs.astro.build/en/guides/prefetch/
  - https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
