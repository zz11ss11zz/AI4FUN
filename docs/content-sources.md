# 首发作品资料与核对范围

核对日期：2026-11-20。首发目录包含 16 个作品，所有条目目前均为 `source-reviewed`（已核对资料），没有标记为实际试玩。目录关注作品本身，收录 AI 辅助创作与运行时由 AI 驱动的交互；两者通过 `aiRole` 明确区分。

## 收录与标注约定

- 优先采用作者作品页、官方仓库、制作团队日志或模型合作方的一手说明。每条记录的 `evidence` 保存链接与其能支持的事实，`verification.note` 说明本次实际核对到哪里。
- `year` 是已查到的公开作品年份，不是推断出来的开发起始年。只有明确的作品公开日期才填写 `publishedAt`；文章报道日期、页面更新时间与首发日期有疑义时留空。
- 2016–2023 年的机器学习交互明确使用“经典实验”标签；早期电影使用“早期AI影像”。不将它们包装成 2026 年的新作。
- `creator.name` 保存作品页上的公开署名或发布账号，不代表已核验真实身份；AI 制作归因属于有来源的创作者声明，不等于本站审计结果。
- `code` 表示 AI 辅助编程，`runtime` 表示作品运行时使用 AI 模型。生成素材不等于自动完成整部电影；人工剪辑不标记为 AI 剪辑。
- 费用、登录与设备兼容性以可见作者说明为依据。无法确认的状态填 `unknown`。`play` 表示作者提供浏览器体验入口，不代表已在当前设备成功运行；下载及自行部署使用 `setup`。
- `five-minutes`（“五分钟，换个心情”）同时包含游戏、音乐互动与短片，是短暂休息的体验邀请，不承诺五分钟通关或完整观影；`made-with-ai` 收录有 AI 制作披露的作品；`open-source` 要求有作品相关公开实现，不把数据集或某个通用库误标成完整作品源码。
- 封面是 AI4FUN 自制的编辑插画，用于区分作品题材，不是原作截图。未下载或重新托管第三方作品、视频与配乐。

## 首发内容构成

3 款 2026 年有发布者 AI 披露的游戏、2024–2025 年影像作品与经典互动共同组成种子目录。Nightshoal 明确标记开发中、需下载；AI Town 明确标记需要部署。目录不使用虚构热度、评分、访问次数或“已试玩”徽章。

## 2026 年三款游戏复核

2026-11-20 再次核对作品页、对应作者账号主页、发布记录和制作披露。三个账号与其作品链接均相互对应。以下是 itch.io 官方页面索引保存的 `Published` 时间；它们表示公开发布，不代表开始开发的时间。

| 作品 | 公开署名 / 发布账号 | 官方公开记录（UTC） | 交叉核对 |
| --- | --- | --- | --- |
| Oh, Peppers! | Agent 57951（0xe25f） | 2026-09-12 23:01 | 作者主页、同日开发日志与参赛制作说明一致 |
| Reef Relay | alvinhastra-web | 2026-09-08 09:22 | 作品正文确认 2026 年 9 月首发，参赛页署名与 AI 代理披露一致 |
| Nightshoal | ProFactor | 2026-10-02 12:32 | 首个公开 Windows 版本及文件时间同日，11 月日志继续沿用该作者署名 |

Reef Relay 先前仅记录年份；本次补齐官方公开日期。其页面明确声明 AI 代理创作，因此不会把平台账号改写成人类作者。Oh, Peppers! 的音效有程序合成说明，“AI 参与声音”不意味着已确认使用某个音频生成模型。Nightshoal 是开发中的下载版本，未归入短时浏览器体验合集。

影片页面未明确提供设备兼容性声明，本次将四部影片的设备字段统一改为未知，避免把可读取作品介绍页当成手机和电脑均可播放的证据。

## 各作品证据

### Oh, Peppers!

- 原作：[Oh, Peppers!](https://0xe25f.itch.io/oh-peppers)
- 作品年份：2026；精确公开日期：2026-09-12。
- 本次范围：复核作者主页、作品公开记录、AI 披露与参赛制作说明；署名与来源一致。AI 使用属于作者自述，未运行游戏或审计制作过程。
- [作者作品页](https://0xe25f.itch.io/oh-peppers)：作者页的公开记录显示发布于 2026-09-12 23:01 UTC，署名 Agent 57951；列明三十关、键盘/触屏操作与 AI 代码/图像/声音披露。精确时间取自该官方页面的索引快照。
- [作者制作过程](https://itch.io/jam/all-tools-allowed-2/rate/5002411)：作者说明使用 Codex Astra、LittleJS 与逐轮提示完成制作。
- [作者主页与开发日志](https://0xe25f.itch.io/oh-peppers/devlog/1661851/oh-peppers-thirty-kitchens-one-escapee-chilli-pepper)：开发日志与作者主页均署名 Agent 57951；日志说明音效由程序合成，不据此声称使用了独立音频生成模型。

### Reef Relay

- 原作：[Reef Relay](https://alvinhastra-web.itch.io/reef-relay)
- 作品年份：2026；精确公开日期：2026-09-08。
- 本次范围：复核发布账号主页、作品公开记录与参赛披露；日期和署名相互对应。AI 创作方式属于发布者声明，未试玩或审计代码。
- [作者作品页与 AI 披露](https://alvinhastra-web.itch.io/reef-relay)：官方页面索引显示发布于 2026-09-08 09:22 UTC，署名 alvinhastra-web；正文确认 2026 年 9 月首发、无需账号，以及 AI 代理参与设计与编写。
- [平台参赛页与制作披露](https://itch.io/jam/uplifting-game-jam-9/rate/4986358)：参赛页同样署名 alvinhastra-web，说明 Codex（Astra）参与设计与编程、Kenney 素材及程序合成音效；不将发布账号等同于人类独立作者。

### ANCESTRA

- 原作：[ANCESTRA](https://www.primordialsoup.ai/projects/ancestra)
- 作品年份：2025；精确公开日期：2025-06-13。
- 本次范围：核对工作室作品页及合作方幕后文章；未核验完整影片播放或地区限制。
- [制作方作品页](https://www.primordialsoup.ai/projects/ancestra)：确认导演、年份、片长，以及实拍团队和生成影像的协作。
- [合作方幕后说明](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/ancestra-behind-the-scenes/)：2025 年 6 月 13 日公布 Tribeca 首映，说明 Gemini、Imagen、Veo 在制作中的分工。

### Air Head

- 原作：[Air Head](https://openai.com/index/sora-first-impressions/)
- 作品年份：2024；精确公开日期：未确认，留空。
- 本次范围：核对官方作品展示与署名；未独立完整观看影片或测量播放时长。
- [官方作品展示与创作者说明](https://openai.com/index/sora-first-impressions/)：2024 年 3 月 25 日展示 Air Head，列出 shy kids 团队与导演 Walter Woodman；说明生成素材由艺术家剪辑处理。

### Infinite Craft

- 原作：[Infinite Craft](https://neal.fun/infinite-craft/)
- 作品年份：2024；精确公开日期：未确认，留空。
- 本次范围：核对原作入口；AI 开发历史通过作者原帖及同期保存的引文交叉核对。未试玩或检测当前模型。
- [作者原作](https://neal.fun/infinite-craft/)：核对原作入口及四种初始元素。
- [作者公开开发帖](https://twitter.com/nealagarwal/status/1747284257582506102)：作者在发布期开发帖中提及 Llama 2；原帖当前访问受限，相关原文由报道保存。
- [开发帖原文的同期报道](https://gigazine.net/news/20240201-infinite-craft/)：2024 年 2 月 1 日报道保存作者 1 月 16 日开发帖原文，作为原帖访问受限时的交叉核对；不据此断言当前模型版本。

### Nightshoal

- 原作：[Nightshoal](https://profactor.itch.io/nightshoal)
- 作品年份：2026；精确公开日期：2026-10-02。
- 本次范围：复核 ProFactor 作者主页、作品公开记录、首发及 2026-11-12 演示版日志；AI 使用属于作者自述，未下载、安装或试玩。
- [作者作品页的公开记录](https://profactor.itch.io/nightshoal)：官方页面索引显示发布于 2026-10-02 12:32 UTC，署名 ProFactor；该日期与首个公开版本日志一致。当前正文提取受限。
- [作者首个公开版本日志](https://profactor.itch.io/nightshoal/devlog/1686876/nightshoal-is-on-itch-first-public-build-windows)：确认 2026 年 10 月 2 日 Windows 公开版本及 AI 对代码、美术和声音的辅助。
- [作者 11 月演示版更新](https://profactor.itch.io/nightshoal/devlog/1773198/what-changed-since-the-4-november-demo)：2026 年 11 月 12 日日志列出 Windows、Mac、Linux 下载包和开发中状态，采用自定价下载。

### Blob Opera

- 原作：[Blob Opera](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw)
- 作品年份：2020；精确公开日期：未确认，留空。
- 本次范围：核对官方实验说明及上线历史；未运行音频交互。
- [官方实验页](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw)：确认 David Li、机器学习生成歌剧声音及互动方式。
- [官方幕后回顾](https://blog.google/company-news/outreach-and-initiatives/arts-culture/story-behind-blob-opera-world-tour/)：2021 年官方回顾明确原作于 2020 年 12 月推出；不把实验页后来的更新日期误作首发。

### Growing Neural Cellular Automata

- 原作：[Growing Neural Cellular Automata](https://distill.pub/2020/growing-ca/)
- 作品年份：2020；精确公开日期：2020-02-11。
- 本次范围：核对原论文、交互说明和作者实现入口；未执行训练或浏览器模型。
- [作者交互论文](https://distill.pub/2020/growing-ca/)：2020 年 2 月 11 日发表，包含点击/触摸擦除与再生演示，并链接实现笔记本。
- [作者代码与笔记本](https://github.com/google-research/self-organising-systems)：论文链接的 Google Research 实现；浏览器演示与需要环境的训练笔记本是不同入口。

### Quick, Draw!

- 原作：[Quick, Draw!](https://quickdraw.withgoogle.com/)
- 作品年份：2016；精确公开日期：未确认，留空。
- 本次范围：核对官网玩法、数据说明与官方历史；未提交涂鸦或试玩。
- [官方游戏页](https://quickdraw.withgoogle.com/)：说明二十秒绘画与神经网络识别，并说明涂鸦对公开数据集的贡献。
- [官方上线历史](https://blog.google/innovation-and-ai/products/quick-draw-one-billion-drawings-around-world/)：Google 2017 年回顾说明项目自 2016 年 11 月上线。
- [官方数据集](https://github.com/googlecreativelab/quickdraw-dataset)：公开的是绘画数据集；不将它标记为完整游戏源码。

### Semantris

- 原作：[Semantris](https://research.google.com/semantris/)
- 作品年份：2018；精确公开日期：2018-04-13。
- 本次范围：核对官方发布说明与入口；未执行游戏交互。
- [官方游戏入口](https://research.google.com/semantris/)：核对官方语义游戏入口；页面主体依赖 JavaScript。
- [Google Research 发布说明](https://research.google/blog/introducing-semantic-experiences-with-talk-to-books-and-semantris/?m=1)：2018 年 4 月 13 日介绍 Semantris 及其对话语料训练的语义关联模型。

### Viola the Bird

- 原作：[Viola the Bird](https://artsandculture.google.com/experiment/nAEJVwNkp-FnrQ)
- 作品年份：2023；精确公开日期：2023-07-12。
- 本次范围：核对官方实验页、发布时间和技术说明；未实际拉奏或录制。
- [官方实验页](https://artsandculture.google.com/experiment/nAEJVwNkp-FnrQ)：列明 2023 年 7 月 12 日上线、作者、机器学习与实时音频合成机制。
- [官方幕后说明](https://blog.google/company-news/outreach-and-initiatives/arts-culture/meet-viola-the-bird-a-new-experiment-inspired-by-the-cello/)：介绍弦乐演奏者参与训练、自由创作模式和记录作品功能。

### Paint With Music

- 原作：[Paint With Music](https://artsandculture.google.com/experiment/paint-with-music/YAGuJyDB-XbbWg)
- 作品年份：2021；精确公开日期：2021-06-18。
- 本次范围：核对官方创作者、日期、技术与设备说明；未实际绘画或播放音频。
- [官方实验说明](https://artsandculture.google.com/experiment/paint-with-music/YAGuJyDB-XbbWg)：说明作者、2021 年 6 月 18 日上线、Magenta DDSP 技术及桌面/Android 支持。

### GAN Lab

- 原作：[GAN Lab](https://poloclub.github.io/ganlab/)
- 作品年份：2018；精确公开日期：未确认，留空。
- 本次范围：核对作者项目说明、论文年份和官方仓库；未在浏览器执行训练。
- [作者交互项目](https://poloclub.github.io/ganlab/)：说明二维数据分布、浏览器训练、慢放与逐步执行；项目关联 VIS 2018 论文，期刊卷期为 2019 年。
- [官方源码](https://github.com/poloclub/ganlab)：Apache-2.0 许可的 GAN Lab 实现，采用 TensorFlow.js。

### AI Town

- 原作：[AI Town](https://github.com/a16z-infra/ai-town)
- 作品年份：2023；精确公开日期：未确认，留空。
- 本次范围：核对官方仓库、运行说明及公开历史；未安装、部署或验证在线演示。
- [官方项目仓库](https://github.com/a16z-infra/ai-town)：MIT 许可的可部署小镇，README 提供配置与运行说明；不是预设无需配置的本地游戏。
- [Convex 2023 年回顾](https://news.convex.dev/what-a-2023/)：作者团队回顾 2023 年举办的 AI Town 活动，核对项目在该年已公开。

### PLSTC

- 原作：[PLSTC](https://www.plstcfilm.com/)
- 作品年份：2022；精确公开日期：未确认，留空。
- 本次范围：核对导演作品页、年份、片长与工具信息；未独立完整观看。
- [导演官方作品页](https://www.plstcfilm.com/)：列明 2022 年、1 分 37 秒、导演 Laen Sanches；说明生成图像与手工合成，并列出 Midjourney、Topaz Labs 等工具。

### The Frost

- 原作：[The Frost](https://www.thefrost.ai/)
- 作品年份：2023；精确公开日期：未确认，留空。
- 本次范围：核对官方影片站与制作方回顾；未核验播放器或续作发行状态。
- [官方影片网站](https://www.thefrost.ai/)：核对作品梗概、制作幕后入口及出品署名。原 thefrostpart.one 官方域名跳转至此。
- [制作方阶段回顾](https://waymark.com/post/the-frost-part-two-trailer-reveal)：2023 年 8 月 25 日回顾第一部使用 DALL·E 2 图像与人工动画；文中 Runway Gen-2 属于第二部预告，未混为第一部工具。

## 需要保留的边界

**Infinite Craft：** 原作可定位，但作者关于 Llama 2 的开发帖当前返回访问限制。该帖原文由 2024 年同期报道保存，因此明确保留这条例外的二手交叉核对路径，并不将发布期模型版本写成当前后端配置。精确首发日留空。

**Nightshoal：** 作品主页正文提取受限，作者首发与更新日志可读，已核对 2026-11-12 的三个桌面系统下载包。没有安装验证；自定价下载是否包含可零付费入口未核验，费用保持未知。

**AI Town：** README 列有托管演示，但本次没有确认演示可运行，主要入口指向官方代码仓库。可免费读取源码并不等于部署、托管或模型推理没有费用。

**影片：** 作品页和制作记录可查，不保证各地区的嵌入播放器、完整片源、字幕和登录条件相同。没有把制作方宣传替代为独立观影评价。

## 后续加入用户信源

新信源应先进入信源登记，之后逐条确认原作者、AI 参与方式、实际作品入口及可访问条件。新增作品继续使用相同 JSON 字段；只有确实在注明设备和浏览器中操作完成后，才能将验证级别改为 `hands-on` 并记录环境与步骤。条目去留与推荐理由属于编辑判断，不等同于作者或平台认证。
