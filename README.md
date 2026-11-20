# AI4FUN

**发现、体验并持续记录主要由 AI 创作的有趣作品。人类可以提供创意、Prompt、指挥 Agent、测试、剪辑与打磨。**

一个中文优先的精选作品库，涵盖互动与界面、游戏、影像和音乐。作品详情保留原作者、原作入口、AI 参与环节、公开制作资料和核验时间；收藏保存在读者自己的浏览器中。

**[打开 AI4FUN](https://zz11ss11zz.github.io/AI4FUN/) · [推荐作品](https://github.com/zz11ss11zz/AI4FUN/issues/new?template=project.yml) · [推荐信源](https://github.com/zz11ss11zz/AI4FUN/issues/new?template=source.yml)**

当前公开精选 **23 件作品、11 个信源和 3 个主题合集**；2026-11-20 首轮按“AI 主导主要制作/生成内容”标准复核，**12 件历史条目暂入待复核队列**（并非断言这些作品没有使用 AI）。界面支持手机浏览、浅色与深色模式。

## 原创游戏：遗迹疾行 RELIC RUN

**[点击开玩](https://zz11ss11zz.github.io/AI4FUN/games/relic-run/)** · [制作档案](https://zz11ss11zz.github.io/AI4FUN/games/relic-run/making-of.html) · [游戏源码](public/games/relic-run/)

第一人称 3D 浏览器跑酷，包含埃及、高棉、玛雅、长城和欧洲古堡五个可直接选择的场景。每关 720 米，支持变道、跳跃、滑铲、遗物收集、三次碰撞容错、暂停与重开。电脑使用 A/D、空格、S；手机使用滑动或屏幕按钮。最高分与设置仅保存在本机。

游戏主代码、场景几何、程序材质、程序音效和 UI 由 ChatGPT 根据用户需求制作；封面与石材贴图由内置图像生成工具制作。渲染使用随仓库分发的 Three.js r170（MIT）。无远程模型请求、无需 API Key、无需安装；首次打开需要加载站内图片与 3D 库。视觉目标是电影感的轻量 3D 小品，实际画面以游戏为准，不将 AI 概念封面当作运行截图。

支持 WebGL 2 的浏览器使用完整三维场景；无法创建 WebGL 上下文时会自动选择 Canvas 兼容画面，沿用相同的路线、动作、碰撞和得分规则。兼容画面的建筑与光照细节更简化，界面会标明当前模式。运行时六张 WebP 图片合计约 1.12 MiB，原始 PNG 保留在素材目录用于追溯制作过程。

验证分为玩法逻辑、站内资源完整性与实际浏览器体验。自动化测试覆盖前两项，不能据此认定所有设备的三维画面与帧率已验证；2026-11-20 已在云端 Chrome 验证兼容模式五场景切换、倒计时暂停、键盘与屏幕按钮，以及 320×480、320×568 和 844×320 布局；该浏览器禁用 WebGL，完整三维画质仍需在支持硬件加速的设备上验收。具体范围见制作档案和 [开发交接](docs/RELIC_RUN_HANDOFF.md)。本站使用静态 HTTP 服务运行，请通过在线入口或本地服务器打开。

## 网站提供什么

- 搜索与分类筛选，按体验条件发现作品。
- 编辑精选、主题合集和随机发现。
- 每个作品有独立页面、作者归属、一手证据及更新记录。
- 区分 **AI 主导程序开发**、**AI 主导视听制作**、**AI 实时生成核心体验**；允许人类创意与 Prompt 迭代。缺少核心制作证据的项目暂不进入公开目录。
- 浏览器本地收藏；无需为浏览目录注册账号。
- 结构化作品库与信源登记，方便持续添加和审阅。

当前条目采用 `source-reviewed`（来源已核对）级别，表示编辑核对了所列公开说明，**不代表已经逐一完整试玩、观看或验证全部功能**。如有实际体验记录，必须注明设备、浏览器、日期和验证范围。

## 本地运行

需要 Node.js 24 或更新的兼容版本。站点使用原生浏览器功能与 Node 内置模块，不需要 API Key。

```bash
npm run validate
npm test
npm run build
```

构建结果在 `dist/`。使用任意静态 HTTP 服务器预览该目录；不要直接用 `file://` 打开。网站无需后端即可浏览；原创小游戏在本站直接运行，外部作品在原作者网站打开。

## 后续如何添加内容

**只提供一个新信源**时，先登记到 `data/sources.json`，再挑选具体作品逐条核对。登记来源不会自动发布该来源的全部内容。

```bash
npm run source:add -- \
  --id creator-name \
  --name '创作者名称' \
  --url 'https://creator.example.org/works' \
  --type creator \
  --language en \
  --scope game,interactive \
  --description '持续发布有制作说明的互动作品'
```

上面的域名只是命令格式示例，执行时换成真实信源。增加 `--dry-run` 可只预览记录而不写文件。

**提供具体作品**时，在 `data/projects.json` 加一条记录，核对原作者与 AI 参与证据，补齐必要字段。如果加入合集，同时更新该条目的 `collectionIds` 和 `data/collections.json` 的 `projectIds`。最后执行校验与构建。

详见 [内容维护指南](docs/ADDING_CONTENT.md)、[AI 主导制作标准](docs/EDITORIAL_POLICY.md) 和 [2026-11-20 目录复核](docs/CONTENT_AUDIT_2026-11-20.md)。GitHub Issue 模板支持推荐作品、推荐信源和报告失效入口。页面投稿表单只整理内容并打开 GitHub，由投稿者确认提交。

## 数据与目录

| 路径 | 内容 |
| --- | --- |
| `data/projects.json` | 作品档案与证据 |
| `data/sources.json` | 发现来源，目前均为手动审阅 |
| `data/collections.json` | 主题合集 |
| `src/` | 页面与交互源码 |
| `public/` | 本站静态素材 |
| `scripts/build.mjs` | 生成静态站点 |
| `scripts/validate.mjs` | 数据完整性、链接格式、重复与引用校验 |
| `scripts/add-source.mjs` | 安全、原子地登记新来源 |
| `scripts/check-links.mjs` | 可选的外链可访问性检查 |
| `docs/content-sources.md` | 作品事实依据、核验边界与扩充记录 |

### 可选的外链检查

```bash
npm run check:links
npm run check:links -- --project infinite-craft --output /tmp/ai4fun-links.json
```

该命令只检查 HTTP 可访问性，不执行第三方项目、不登录、不证明可玩性。它会限制并发和超时、验证 DNS 目标并逐跳检查重定向，拒绝本地地址和 IP 字面量。`403`、`429` 或网络超时需要人工复查，不会自动删除作品或改动核验状态。常规 CI 不依赖外网链接检查，避免把地区限制和反爬误判为内容错误。

## 发布与维护

每次提交或 Pull Request 会运行数据校验、目录与跑酷行为测试和静态构建。`main` 分支通过检查后，由 `Publish GitHub Pages` 工作流自动部署到上面的在线地址。校验工作流只有只读权限；发布工作流仅部署任务拥有 Pages 写入和 OIDC 权限。checkout/setup-node 固定官方提交，Pages 专用 actions 使用官方文档推荐的 major 版本。

GitHub Pages 使用 Actions 作为发布来源。迁移到其他静态托管时，设置 `SITE_URL` 后构建即可，构建产物包含独立作品页、RSS、sitemap、robots.txt 与 404 页面。预览所用 Sites 配置与公开 Pages 互相独立。

内容按需人工核对，目前没有无人值守抓取或定时自动发文。后续提供信源链接时，可以先登记来源，再精选具体作品；合并内容更新后自动发布网站。

## 隐私与素材

收藏数据保存在浏览器本地，不会上传到本站服务。访问外部作品、GitHub 或第三方页面后，适用相应平台的规则。网站不保存用户登录凭据或第三方 API Key。

本站代码按 [MIT License](LICENSE) 发布。第三方作品、截图、影片、音频、商标和源码保持各自权利与许可证；收录链接不授予复制或重新分发它们的许可。本站原创示意视觉用于帮助区分作品，不应当被理解为原作截图或实际运行结果。
