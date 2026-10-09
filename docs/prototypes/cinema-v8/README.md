# V8 冬日纹章版 — 本地评审

本地首页：H:\vs_code\ice-portfolio\docs\prototypes\cinema-v8\index.html

本目录是一套独立 HTML/CSS 原型，无需安装 Astro、无需构建、无需解压。支持本机 Edge 或其他浏览器直接打开。

- index.html：首页，沿用 V7 用户已认可的排版与明亮晨光，将 WebGL 雪晶替换为二次元幻想纹章 SVG。
- snow-emblem.svg：原创可编辑矢量冰羽、晶核、局部星屑与弧线。
- base.css：保留经认可的 V7 暖冬排版基础，不再依赖旧版目录。
- emblem.css：在当前目录 base.css 之上的局部风格覆盖；静态时完整，动态仅为很弱的纹章呼吸。
- rts.html / blitz-archive.html：案例独立页面，首屏和页尾均设有具名下一部按钮。
- qa-v8.mjs：Edge Chromium DevTools 390 CSS px 导航/无溢出/素材/降低动效检查。
- v8-home-desktop.png、v8-home-full-desktop.png、v8-index-mobile390.png：桌面和移动端视觉复查图片。
- v8-rts-mobile390.png、v8-blitz-mobile390.png：案例手机首屏截图。

## 本轮原则

只对 V7 被用户吐槽的雪花造型做替换，不推翻 V7 排版和亮背景；主形象转为插画式冰系技能纹章，不使用实物图片或 GLSL 几何雪晶。本原型没有引入额外依赖。没有真实 UE 游戏画面时，继续用明确的文字版位，不拿 CG 装饰伪装实机。

## 已验收与未验收

浏览器测试：Windows Edge CDP 390 CSS px **17/17 PASS**，包含 800×800 原创 SVG 实际解码、无 WebGL canvas、RTS→Blitz→首页、每部案例两处换片按钮、无横向溢出、降低动效时 CSS animationName 为 none。桌面图已实际截图。

**尚未验收**：用户对纹章审美最终判断；正式 Astro 前端移植/构建；真实 UE 截图、性能、无障碍与真机全面验收。本目录作为独立新美术候选，不影响 V4–V7、博客、磁盘映射或部署。
