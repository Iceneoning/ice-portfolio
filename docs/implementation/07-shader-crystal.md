# 首页 Shader 冰晶实现与实测

> 历史版本记录。用户随后要求重新设计作品集，当前页面已停止引用本轮 Shader，现行实现见 [作品集重设计记录](08-portfolio-redesign.md)。

日期：2026-10-09。用户在前两轮视觉反馈后明确提出「运用计算机图形学写 shader」。本次据此新增首页局部 WebGL 增强，保留明亮冬日、原有文案和作品路由。交接书中的旧 WebGL 禁令针对被否定的旧写实设计；本次为新写的风格化浅色冰晶，未引用旧实现。05 / 06 是历史版本记录，不能据其「零客户端脚本」推断当前首页。

## 实际变化

- `src/lib/crystal-geometry.ts`：原创六向、镜像枝片几何。精简小枝，增加主切面宽度；数据同时供着色器和 SVG 使用。
- `src/shaders/winter-crystal.frag`：折叠坐标生成六向轮廓，用枝片距离场构造浅浮雕法线，计算方向光、镜面高光、Fresnel 边缘和暖冷环境色。这是 2.5D 风格化光照和近似冰色效果，不是真实光线追踪或背景透射。鼠标轻微影响光线，不旋转纹章。
- `src/scripts/winter-crystal.ts`：原生 WebGL 1，仅首页加载，无新增依赖。检查 shader 编译、程序链接和首次绘制错误，失败保留 SVG。绘制节流目标不超过 24 帧/秒，画布尺寸上限 760×760；这两个数字为代码设置，并非性能实测结果。
- `src/components/WinterCrystal.astro`、`Hero.astro`：静态图片先显示，GPU 初始化成功后显示 canvas；提供键盘可操作的暂停 / 继续按钮。
- `src/pages/visuals/winter-crystal.svg.ts`：Astro 构建阶段生成静态 SVG，无运行时后端。
- `src/layouts/BaseLayout.astro`、`src/styles/emblem.css`：统一 favicon、卡片和案例装饰图形，响应式布置光影控件；静态资源通过 body 的 CSS 变量引用，避免 Vite 将静态路由误当源码资源解析。
- `scripts/verify-build.mjs`：允许首页一个可选增强模块；继续要求其他页面无脚本 / 无 canvas，并校验静态 SVG、导航、资源与内容边界。
- `README.md` 与本记录：更新实际工程状态。

没有改动项目 MDX 的技术声明。RTS 命令系统归属、尚未完成的多人测试、Lyra / GAS 复用边界及 UE 真实媒体待补标识继续保留。未修改原型文件、旧公共素材、磁盘映射、Fuwari、Cloudflare / DNS，也未提交或推送 Git。

## 绘制与降级

IntersectionObserver 在纹章离开视口时停绘；页面隐藏、暂停或降低动效偏好时停止动画。初始化时检测到降低动效则直接使用 SVG，不申请 WebGL context。上下文丢失后永久回退 SVG，不进行重复重试。页面离开时释放 GPU 资源，保留浏览器 bfcache 的返回行为。

浏览器实测曾发现切面黑点。修复了分数次幂输入的数值边界：specular / Fresnel 的底数限制到正数范围，避免当前渲染器在零底数上产生异常；同时扩大法线采样范围、调整抗锯齿。最终桌面及手机截图未再看到黑斑。

WebGL API 生命周期核对参考：[Khronos WebGL 1.0 规范](https://registry.khronos.org/webgl/specs/latest/1.0/)、[Khronos 上下文丢失处理](https://wikis.khronos.org/webgl/HandlingContextLost)。实现没有引入 Three.js、React 或 SPA 路由。

## 执行命令

```powershell
pnpm check
pnpm build
node scripts/verify-build.mjs http://127.0.0.1:4323/ | Set-Content docs/implementation/qa-v8-astro/shader-build-results.json
git status --short
```

依赖已存在，本轮未重新安装。沿用已启动的本地开发服务 `http://127.0.0.1:4322/` 与构建预览 `http://127.0.0.1:4323/`。本轮浏览器验收针对 4323 的最新 dist。

## 实测结果

| 项目 | 结果与证据 |
| --- | --- |
| Astro 类型检查 | PASS：20 个文件，0 errors / warnings / hints |
| 正式构建 | PASS：4 个 HTML 页面与 1 个静态 SVG 路由；Zod 依赖中有两处 PURE 注释警告，未导致失败 |
| 静态与 HTTP 检查 | PASS：132 / 132，见 `qa-v8-astro/shader-build-results.json` |
| WebGL 初始化 | PASS：首页状态 ready；1440px 时画布 725×725，390px 时 420×420；本轮观察无控制台 warn / error |
| 暂停与恢复 | PASS：Enter 操作后 paused / aria-pressed=true，间隔读数始终 24 帧；继续后为 ready，帧数增加 |
| 离屏停止 | PASS：纹章 bottom=-31.40px 后，两次间隔读数均为 29 帧 |
| 桌面布局 | PASS：1440×1000；首页和两部案例无横向溢出；首页 scrollWidth=1425（扣除滚动条） |
| 手机布局 | PASS：390×844；首页 / RTS / Blitz scrollWidth 均为 375，无横向溢出 |
| 手机控件 | PASS：Tab 从「阅读技术案例」移动到按钮，焦点为「继续光影」，按钮进入视口，高度 38px |
| 首页进入案例、首屏换片 | PASS：首页 RTS 卡片 Enter → RTS；首屏下一部 → Blitz |
| 案例深链与页尾换片 | PASS：手机直接打开 Blitz URL；Blitz 页尾 → RTS，RTS 页尾 → Blitz；页尾返回选集到 `/#screenings` |
| 浏览器返回 | PASS：Blitz → back → RTS |
| 案例脚本范围 | PASS：两部案例的 canvas / script 数量均为 0（桌面 DOM 实测） |
| 静态冰晶资源 | PASS：浏览器直接打开 `/visuals/winter-crystal.svg`，可见原创冰晶；此项只检验资源自身 |
| 禁用 JS 整站浏览 | NOT RUN：当前浏览器接口未提供禁用 JS；已检查构建 HTML 内有默认可见 SVG 与原生链接，但不等同于浏览器禁用 JS 实测 |
| OS 降低动效切换 | NOT RUN：当前浏览器接口未提供该偏好的模拟；已检查 CSS 与初始化 / 变更监听代码，不声明浏览器实测通过 |
| WebGL 不支持 / context lost 注入 | NOT RUN：未强制注入；静态优先及错误回退路径已代码检查 |
| 真机与性能 | NOT RUN：390px 为桌面浏览器视口模拟；未测手机 GPU、耗电或真实帧率 |

原始 DOM 读数在 `qa-v8-astro/shader-browser-results.json`。桌面首屏、作品选集与手机截图分别为 `shader-home-1440.jpg`、`shader-gallery-1440.jpg`、`shader-home-390.jpg`、`shader-crystal-390.jpg`。

美术效果由本地预览和截图供用户判断；工程通过不等同于审美已经获得用户认可。真实 UE 截图、录屏与工程证据仍待补。
