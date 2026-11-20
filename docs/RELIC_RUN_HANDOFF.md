# RELIC RUN 开发交接

更新日期：2026-11-20。用于上下文耗尽后的接续开发；先读本文件，再检查实际代码与发布状态。

## 当前状态

- 用户要求继续开发 AI4FUN 中第一人称「神庙逃亡」；沿用现有项目，五场景为埃及、高棉、玛雅、长城、欧洲古堡。
- 游戏名称为「遗迹疾行 RELIC RUN」。目标是规模较小、细节丰富、可直接点击玩的浏览器跑酷。
- **此源码快照已完成兼容模式主要交互验收，准备发布。** 以仓库当前提交对应的 GitHub Actions 部署结论和 Sites 返回状态确认上线，不要仅根据文档推断成功。
- WebGL 3D 与 Canvas 兼容渲染均已实现，共享同一套跑酷模拟；不要将概念封面当作运行截图，也不要声称已经达到照片级 AAA 画质。
- 保留此前未提交的目录内容复核与网站改动；不要因为接续游戏而重置或覆盖其他文件。

## 项目定位

| 项目 | 位置 / 标识 |
| --- | --- |
| 本地完整项目 | `/workspace/sites/ai4fun` |
| GitHub 仓库 | `https://github.com/zz11ss11zz/AI4FUN` |
| GitHub Pages 游戏目标地址 | `https://zz11ss11zz.github.io/AI4FUN/games/relic-run/` |
| 既有 Sites project_id | `appgprj_6afffe33df888191888f8a935a6b4d8a` |
| 本地发布配置 | `.openai/hosting.json`；继续使用既有身份与访问范围 |
| 静态构建结果 | `dist/` |

上面的公开地址是项目约定入口，不能单凭本文件判断此次游戏版本已上线。不要创建重复 Site。

## 文件地图

| 文件 | 职责 |
| --- | --- |
| `public/games/relic-run/index.html` | 全屏游戏、选关、HUD、暂停、结果、设置与错误界面 |
| `public/games/relic-run/game.css` | 桌面与手机布局、触控按钮、动态状态样式 |
| `public/games/relic-run/game.js` | 初始化、输入、倒计时、状态/UI、音效、WebGL/Canvas 切换与主循环 |
| `public/games/relic-run/logic.mjs` | 无 DOM 的确定性关卡与跑酷模拟：动作、物理、碰撞、得分、暂停和通关 |
| `public/games/relic-run/world.mjs` | Three.js 实例化建筑、程序材质、地形、循环区块、照明参数和终点门楼 |
| `public/games/relic-run/fallback.mjs` | 原创 Canvas 2D 透视投影渲染，包含五主题建筑与可玩的障碍/遗物 |
| `public/games/relic-run/themes.mjs` | 五主题名称、说明、颜色、种子和封面路径 |
| `public/games/relic-run/assets/` | 优化 WebP、保留的原始 PNG、素材生成说明 |
| `public/games/relic-run/vendor/` | 随仓库分发的 Three.js r170 与 MIT 许可证 |
| `public/games/relic-run/making-of.html` | 制作档案、AI 参与说明、概念图与渲染边界 |
| `data/projects.json`、`data/collections.json` | 游戏卡片、站内入口与合集归属 |
| `src/` | AI4FUN 目录、详情、搜索等网站界面 |
| `tests/relic-run.test.mjs` | 跑酷模拟测试 |
| `tests/relic-assets.test.mjs` | 静态/动态模块、页面、样式和封面资源完整性测试 |
| `tests/catalog.test.mjs` | 原有网站目录行为测试 |
| `scripts/build.mjs`、`scripts/validate.mjs` | 静态构建与项目数据校验 |

## 游戏规则与操作

- 每关 `RUN_LENGTH = 720` 米；三条路线，车道间距 `LANE_WIDTH = 1.85` 米；速度从 11 增至 16 米/秒。
- 收集金色遗物；石障/裂隙使用跳跃或变道，横梁使用滑铲或变道；每局三次碰撞容错。
- 键盘：`A/D` 或左右方向键变道，`空格/W/↑` 跳跃，`S/↓` 滑铲，`P/Esc` 暂停，`R` 重开。
- 手机：滑动或屏幕按钮；暂停、音效、设置与全屏有独立按钮。
- 声音默认关闭；最高分和设置只保存在当前浏览器的 localStorage。
- 五场景标识固定为 `egypt`、`khmer`、`maya`、`wall`、`castle`；`?scene=maya` 等可指定初始场景。

## 两条渲染路径

- **WebGL**：`game.js` 加载本地 Three.js 与 `world.mjs`；PBR 材质、阴影、雾、程序建筑与本地石材贴图。循环建筑采用实例化网格，切换场景时显式释放资源。
- **Canvas**：WebGL 初始化失败时自动启用；也可用 `?renderer=canvas` 明确选择。`fallback.mjs` 从世界坐标投影建筑、道路、障碍和遗物，具有近裁剪与深度排序，并非播放封面图片。
- WebGL 失败后必须换一个新 canvas 才能创建 2D context；控制监听要绑定替换后的画布。
- 两条路径共用 `logic.mjs`，不要维护两份碰撞或计分规则。
- 所有运行素材与依赖随站点分发，无外部 CDN、运行时模型请求或 API Key。

## 本轮已经完成的修复

- 补齐此前动态引用但缺失的 `fallback.mjs`，使 WebGL 不可用时也能实际游玩。
- 失败降级采用新画布，解决已尝试 WebGL 的 canvas 无法再获取 2D context 的问题。
- 倒计时改为 RAF 驱动，暂停/设置/失焦时冻结；恢复后继续剩余倒计时，不在暂停面板后偷偷开跑。
- 初始化期间允许选择主题但延后构建，避免模块尚未就绪时调用场景构造。
- WebGL 五主题加入与 720 米终点绑定的实体出口门楼，通行空间覆盖所有车道与最高跳跃高度。
- 玛雅棕榈树冠按树干真实缩放/旋转定位，修复树冠浮空。
- 五张封面和石材纹理改为 WebP：六张运行素材合计约 1.18 MB，原始 PNG 约 19.69 MB，保留原图。
- 增加动态模块与站内素材引用检查，防止类似「漏掉兼容渲染文件」的问题再次混入构建。

## 验证证据与边界

- 交接时项目自动化测试为 **30 项通过**；后续更改后应以实际测试输出更新此数字。
- 额外脚本已检查 **500 组路线**，验证生成路线存在可完成的安全行进路径；这不是浏览器完整试玩记录。
- 场景程序检查覆盖 **5 场景 × 3 画质 = 15 种组合**：几何坐标有效、48 米循环区块连续、终点定位正确、资源重复释放安全。
- 实际 Three.js 射线检测覆盖五主题出口的各车道/边缘，以及地面、站立与最高跳跃高度，未发现门楼阻挡通道。
- **当前云浏览器禁用 WebGL，完整 3D 画面尚未获得浏览器视觉验证。** 不能将几何检查等同于 WebGL 实际运行验收。
- 云端 Chrome 已实测 Canvas 五主题切换、开始/倒计时、设置中冻结倒计时、运行暂停与恢复、键盘变道/跳跃、横屏按钮、返回选关。暂停状态下隔开多次操作后距离仍保持 152 米；倒计时设置弹窗内保持 0 米。
- 响应式已检查 320×480、320×568、844×320，修复了旧横屏规则误中短竖屏、底部文字重叠和窄屏选中卡片滚动。画质设置即时改变像素比/阴影，几何细节仍在下一次加载场景时采用新档位。

## 下一位开发者从这里继续

1. 阅读本文件并查看实际工作区改动；保留未提交工作，核对是否已有主代理补充的最新部署记录。
2. 在 `/workspace/sites/ai4fun` 使用 Node 内置工具执行 `npm run validate`、`npm test`、`npm run build`。
3. 用静态 HTTP 预览 `dist/`，不要以 `file://` 打开模块。按 Sites 技能使用已有预览/浏览器入口。
4. 检查五场景选关、开跑、暂停倒计时、设置、失焦、重开、结果、返回目录，以及窄屏按钮和布局。
5. 使用 WebGL 2 可用浏览器补做真正的 3D 视觉与性能验收：障碍可辨识性、光照、阴影、纹理、终点、持续切场景内存。
6. 主代理完成 GitHub / Sites 集成后，在下方记录准确的提交、已保存版本、部署结果、实际链接与验证范围。

## 发布与最终验收记录

发布使用原有 GitHub main/Pages 工作流与既有私有 Sites 身份；GitHub 上传采用逐文件 SHA 验证和基于当前 main 的原子提交，更新分支时使用 expected_sha 防止覆盖并发改动。最终部署结论请对照此提交的 Actions 运行与 Sites 部署记录。

真实兼容模式截图（不是概念图，也不代表 WebGL 画质）：[玛雅](images/relic-run-maya-compatibility.jpg) · [欧洲古堡](images/relic-run-castle-compatibility.jpg)。

下次继续开发优先补齐 WebGL 2 硬件环境下的实际视觉审核；已实现的双渲染、玩法与素材不要重做。禁止在此记录任何访问令牌或凭据。
