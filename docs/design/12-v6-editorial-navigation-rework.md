# V6 冬日编辑式作品展厅：结构与换片导航

日期：2026-10-08。状态：本机 Edge 原型已生成并进行 390 CSS px 冒烟测试；**待用户审美确认、未替换正式 Astro 站点**。

## 对 V5 反馈的处理

- V5 的巨大裁切玻璃雪晶缺乏位置合理性，抽象冰壁、伪游戏景观与唯一真实雪晶产生强烈风格割裂。
- 改为尺寸受控、具有统一留白与文字说明的玻璃雪晶材质展示窗，不再使用假冰壁/虚构游戏海报。页面其余部分统一为深蓝、低彩度、细边线的编辑式展陈风格。
- 首页保留用户确认的「让规则凝成世界。」以及「作品选集。」、既定介绍文字。
- 未获真实 UE 截图前，两部作品卡仅采用醒目的项目缩写和实际技术范围，不假装有实机媒体。
- 两个案例都具备明确的首屏右上角「下一部作品」链接，底部重复；RTS → Blitz Archive，BA → RTS。首页有两部独立项目卡与「从第一部作品开始」入口。

## 预览和证据

在 Windows 直接打开 H:\vs_code\ice-portfolio\docs\prototypes\cinema-v6\index.html；详情页为同目录下 rts.html 与 blitz-archive.html。

Edge 浏览器实际生成的桌面图为 v6-index-full-desktop.png、v6-rts-desktop.png、v6-blitz-archive-desktop.png；390 CSS px 图为 v6-index-mobile390.png、v6-rts-mobile390.png、v6-blitz-mobile390.png。

Node 22 / Edge CDP 测试：14/14 PASS，含真实透明雪晶成功解码、390px 无横向溢出、首页点击 RTS、首屏下一部跳转 BA、BA 下一部返回 RTS、案例返回首页及 reduced-motion 偏好。

## 尚未验收

这不是最终网站：真实 UE 游戏画面、用户视觉确认、iOS/Android 真机、完整无障碍/性能测试、Astro build 和正式部署均未完成。不可将设计占位内容写成实际游戏演示、不可将 RTS 命令系统作为本人开发成果，或虚构多人网络验证。V4/V5 原型和正式 Astro 源码仍保留。
