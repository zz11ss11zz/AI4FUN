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


## 2026-11-20 · 第二批发现

本轮新增 18 件作品（8 款游戏、3 个互动实验、5 部短片、2 个音乐实验），目录扩充为 34 件。新增 Qosmo、Magenta、VibeJam、VibeGamer 与 InfiPlot 官方仓库 5 个发现来源，来源总数为 11。仓库、Pages 地址与页面标识统一采用 AI4FUN。

所有新条目均为 `source-reviewed`，表示公开来源已核对，不等同于完整试玩或观影通过。未确认的费用、登录、设备和发布日期继续留作未知；来源索引的发布时间与获奖年份分开记录。

- `Space DJ` 的 AI Studio 入口是可查看和复刻的代码，需 Google 登录；没有据此宣称某个开源许可。
- `Neural Beatbox` 的源码是模型示例，不是整站实现。
- 《雾锁山门》的公开制作 Skill 与演示游戏素材权利不同，因此未标记为游戏源码开源。
- `Oasis` 早期模型仓库本轮返回失效结果，源码字段留空；保留官方演示与研究说明。
- `Total Pixel Space` 的作品年份是 2024，2025 是获奖年；`Reverse Lo-fi Anime Girl` 的目录年份是 2025，2026 年的介绍文章不作为首发日。
- 2026 年 Runway 奖项采用仍明确标注 AIF 2026 的官方页面；根首页已转向下一届征片。

### 雾锁山门

- 原作：[雾锁山门](https://op7418.github.io/guizang-game-skill/)
- 作品年份：2026；精确公开日期：未确认，留空。
- 本次范围：核对作者官方仓库、制作归因和在线演示操作说明；未加载并操作 WebGL 战斗场景。
- [作者制作复盘](https://github.com/op7418/guizang-game-skill)：作者将《雾锁山门》作为实际演示，披露 Fable 5.2 辅助开发、即梦设定图与 Tripo 模型，以及多轮测试、返工与修改。仓库 main 的 Skill 许可与演示游戏素材权利不同。
- [官方可玩演示](https://op7418.github.io/guizang-game-skill/)：页面有点击开始、键鼠与触屏操作提示，要求 WebGL 2；链接回作者制作过程。没有据页面抓取结果声称已实际跑通战斗。

### Space DJ

- 原作：[Space DJ](https://spacedj-363947264390.us-west1.run.app/)
- 作品年份：2025；精确公开日期：2025-11-03。
- 本次范围：已核对官方功能、日期与链接；未实际试听、测试设备兼容性或核对实时服务配额。
- [Magenta 官方发布说明](https://magenta.withgoogle.com/spacedj-announce)：2025-11-03 发布，说明飞船位置影响音乐风格权重，由 Lyria RealTime 生成音频；提供体验与 AI Studio 复刻入口。
- [官方体验入口](https://spacedj-363947264390.us-west1.run.app/)：地址来自官方发布页；本次能获取应用页面，但未实际生成或试听音乐。

### Dear “Stranger” · 浮生若梦

- 原作：[Dear “Stranger” · 浮生若梦](https://labs.google/flow/tv/short-films?i=dear-stranger)
- 作品年份：2025；精确公开日期：2025-05-20。
- 本次范围：已核对作者或官方展映页面、作品归属及 AI 参与依据；未完整播放影片，未验证各地区的登录、付费及设备限制。
- [Google Flow TV 官方影片页](https://labs.google/flow/tv/short-films?i=dear-stranger)：明确影片标题、Junie Lau 署名、故事梗概和 Watch 入口，并注明 Flow 与其他工具、技法共同参与。
- [导演官方项目记录](https://junielau.com/about)：Selected Projects 将 Dear Stranger 的 Flow TV 上线日期标为 2025.05.20。
- [Google 官方创作者介绍](https://blog.google/innovation-and-ai/products/google-flow-veo-ai-filmmaking-tool/)：Flow 发布介绍中点名这部作品与导演，说明祖母和孙女跨越梦境世界的故事。

### NEXT TOKEN

- 原作：[NEXT TOKEN](https://next-token.dev/play.html)
- 作品年份：未确认；精确公开日期：未确认，留空。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [作者作品说明](https://next-token.dev/)：说明九段对话、逐 token 选词和上下文机制；披露 Claude 制作、PAGAN 美术及 SEGAN 音乐音效，并公开原始提示。
- [作者项目目录](https://lukasgolino.com/projects.html)：Lukas Golino 的个人项目目录直接列出 NEXT TOKEN，并链接同一作品与游玩页。
- [浏览器入口](https://next-token.dev/play.html)：官方说明支持方向键与空格或鼠标，进度保存在本浏览器；首次加载约 50 MB。

### InfiPlot

- 原作：[InfiPlot](https://infiplot.com/)
- 作品年份：2026；精确公开日期：未确认，留空。
- 本次范围：核对官方体验页和项目 README；未提交故事生成、未测试完整剧情或模型额度，账号要求未确认。
- [官方体验页](https://infiplot.com/)：中文页面提供故事开场、风格和声音选项；注明公测期间免费、生成稳定性可能随并发波动。此说明不承诺长期免费。
- [官方源码与机制说明](https://github.com/zonghaoyuan/infiplot)：README 解释编剧、角色、场景和画家分工、点击探索与语音生成，记录移动端适配和2026年启动背景；源码采用 AGPL-3.0。未据此推断所有代码由 AI 编写。

### Reverse Lo-fi Anime Girl

- 原作：[Reverse Lo-fi Anime Girl](https://reverse-lofi.qosmo.jp/)
- 作品年份：2025；精确公开日期：未确认，留空。
- 本次范围：已核对作者、规则、技术说明和官方体验入口；未实际游玩或核对服务器当前可用额度。
- [Qosmo 官方作品说明](https://qosmo.jp/en/news/reverse-lo-fi-anime-girl-ai)：说明接提示词的规则、睡眠与跳舞状态、实时音乐生成和情绪估计模型，并列出创作团队。
- [官方实验目录](https://qosmo.jp/en/web-experiments)：项目被列在 2025 年栏目；没有据此补造具体首发日期。
- [官方新闻目录](https://qosmo.jp/en/news)：相关介绍文章日期为 2026-01-21；这是介绍文章日期，不等同于目录所列作品年份。

### LLM Concept Lab

- 原作：[LLM Concept Lab](https://conceptual-biome.vercel.app/)
- 作品年份：未确认；精确公开日期：未确认，留空。
- 本次范围：已核对官方系列归属与页面控件；未实际调用模型、审计代码或核对长期服务可用性。
- [Tangible Prompts 官方介绍](https://tangible-prompts.qosmo.jp/en)：明确将 LLM Concept Lab 列为具体实验，说明词语的语义空间探索与节点交互，并链接体验页。
- [实验页面](https://conceptual-biome.vercel.app/)：页面提供节点搜索、节点标签、可选语境输入和活动记录；没有据此推断后台模型或免费额度。
- [Qosmo 实验目录](https://qosmo.jp/en/web-experiments)：Tangible Prompts 系列列在 2025 年栏目，具体单项实验首发日未披露。

### THE WELL

- 原作：[THE WELL](https://www.youtube.com/watch?v=eoZyWHLHHLY)
- 作品年份：2026；精确公开日期：2026-04-30。
- 本次范围：已核对作者或官方展映页面、作品归属及 AI 参与依据；未完整播放影片，未验证各地区的登录、付费及设备限制。
- [导演频道的影片](https://www.youtube.com/watch?v=eoZyWHLHHLY)：作品条目署名 Dorian & Daniel，索引元数据显示发布于 2026-04-30；未将网页可索引等同于完整播放通过。
- [GIFF 官方节目与演职员表](https://giff.mx/epicentro-2026/)：The Well 条目确认 2026 年、5:29 片长、导演身份，并将其列为生成式 AI 叙事短片；编剧、剪辑、声音和配乐均有署名。
- [Runway 2026 官方获奖页](https://aif.runwayml.com/ja)：列出 THE WELL、Dorian & Daniel、Gold 和故事简介。
- [导演所属制作方作品集](https://www.whatif.film/)：AI 电影制作工作室的作品集中展示 The Well，并署名导演 Dorian & Daniel。

### A Game About Capybaras Delivering Food

- 原作：[A Game About Capybaras Delivering Food](https://capybara-vibejam26.leocoout.dev/)
- 作品年份：2026；精确公开日期：未确认，留空。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [官方赛事作品记录](https://vibejam.com/)：官方目录的索引记录包含作品、作者、送餐与堆叠规则，并列出 Claude Code、Tripo3D、Suno、ElevenLabs；赛事要求 AI 辅助编程。
- [原作入口](https://capybara-vibejam26.leocoout.dev/)：读取到游戏入口、移动/漂移按钮及版本标记；页面同时包含调试控件，未据此声称完成游玩。

### Exquisite Banana

- 原作：[Exquisite Banana](https://aistudio.google.com/app/apps/drive/1ABDfbzu32Xu7JA4CpYtPFGZ28TVBkj6Q?showAssistant=true&showPreview=true)
- 作品年份：2025；精确公开日期：未确认，留空。
- 本次范围：已核对作者公开说明和 Live Site 链接；入口要求 Google 登录，未进入账号内体验或核对生成配额。
- [作者作品页](https://www.mjgomez-saavedra.com/projects/exquisitebanana)：作者标注 2025 年作品，说明绘制、遮挡、AI 续画和揭晓流程，以及 Nano Banana 的使用。
- [作者提供的体验入口](https://aistudio.google.com/app/apps/drive/1ABDfbzu32Xu7JA4CpYtPFGZ28TVBkj6Q?showAssistant=true&showPreview=true)：来自作者 Live Site 链接；本次打开跳转 Google 登录，未登录或实际生成图像。

### Total Pixel Space

- 原作：[Total Pixel Space](https://www.youtube.com/watch?v=zpAeygE4d1A)
- 作品年份：2024；精确公开日期：2024-12-22。
- 本次范围：已核对作者或官方展映页面、作品归属及 AI 参与依据；未完整播放影片，未验证各地区的登录、付费及设备限制。
- [作者发布的影片](https://www.youtube.com/watch?v=zpAeygE4d1A)：作者频道公开影片条目署名 Jacob Adler；索引元数据显示发布日期为 2024-12-22。
- [BIFAN 官方作品页](https://www.bifan.kr/eng/program/program_view.asp?actEvent=view&pk_seq=8030&sc_category_seq=8021&sc_num=1)：列出作者、2024 年作品年份与像素空间的思想实验主题，并归入 AI Films 单元。
- [Runway 官方展映库](https://aif.runwayml.com/screening-room)：列出影片、作者、9:28 片长及 2025 Grand Prix；未据此推断具体生成模型。

### Orbitswarm

- 原作：[Orbitswarm](https://focaccai.itch.io/orbitswarm)
- 作品年份：2026；精确公开日期：未确认，留空。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [作者作品与工具说明](https://focaccai.itch.io/orbitswarm)：作者公开 HTML5 游戏入口，说明鼠标指挥和星球加成；列出 Copilot/Claude Sonnet 4.5 编程、ChatGPT 封面和 Suno 4.5 音乐。
- [作者参赛记录](https://itch.io/jam/ai-generated-space-jam-/rate/4253347)：同一作者在提交表中再次列出代码、封面与音乐工具，并链接原作。
- [赛事日期](https://itch.io/jam/ai-generated-space-jam-)：官方赛事于 2026 年 1–2 月举行并收录 Orbitswarm；仅据此记录年份，未推算作品的精确首发日期。

### Neural Beatbox

- 原作：[Neural Beatbox](https://neuralbeatbox.net/)
- 作品年份：2019；精确公开日期：未确认，留空。
- 本次范围：已核对官方项目档案、署名与示例仓库；未授予麦克风权限、录音或实际试听。
- [作者项目档案](https://qosmo.jp/en/art/neural-beatbox)：档案列为 2019 年，并说明 2020 年扩展多人在线版本；记录声音分段、鼓点分配和节奏生成方法。
- [官方网页与署名](https://neuralbeatbox.net/)：页面列出开发、机器学习、设计与项目管理署名，并链接公开示例代码。
- [机器学习示例仓库](https://github.com/QosmoInc/NeuralBeatbox_ML_Examples)：提供音频分类和节奏生成示例，不是完整网站的源码仓库。

### JAILBIRD

- 原作：[JAILBIRD](https://andrewtsalter.com/jailbird)
- 作品年份：2025；精确公开日期：未确认，留空。
- 本次范围：已核对作者或官方展映页面、作品归属及 AI 参与依据；未完整播放影片，未验证各地区的登录、付费及设备限制。
- [作者作品与制作说明](https://andrewtsalter.com/jailbird)：页面标注 EXPERIMENTAL AI DOCUMENTARY、04/25，并说明分镜到 AI 影像的流程；仅有月份，未填写精确发布日期。
- [Runway 官方展映库](https://aif.runwayml.com/screening-room)：列出 Andrew Salter、2:49 片长和 2025 Gold。

### Oasis

- 原作：[Oasis](https://oasis.decart.ai/)
- 作品年份：2024；精确公开日期：2024-10-31。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [官方项目与日期](https://oasis-model.github.io/)：官方联合项目页日期为 2024-10-31，解释键盘条件输入、实时生成和模型结构，并链接在线演示。
- [官方演示入口](https://oasis.decart.ai/)：官方项目链接的演示地址跳转至欢迎页面；本次仅核对入口，未运行体验或确认账号、费用要求。

### CATROOMS

- 原作：[CATROOMS](https://focaccai.itch.io/catrooms)
- 作品年份：2026；精确公开日期：2026-10-30。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [作者作品与发布记录](https://focaccai.itch.io/catrooms)：原作页显示 2026-10-30 发布，说明约六至十分钟的第一人称探索、键鼠和触屏操作，并勾选代码/画面/声音的 AI 披露。
- [作者制作工具披露](https://itch.io/jam/ai-jam-5/rate/5261946)：参赛说明列出 Claude 用于代码、3D 模型、剧本、纹理；ChatGPT 用于图片和部分纹理；ElevenLabs 用于配音与部分声音；Suno 用于音乐。

### A Face Only A Mother Could Love

- 原作：[A Face Only A Mother Could Love](https://www.youtube.com/watch?v=wytfCS-N8Sk)
- 作品年份：2026；精确公开日期：2026-04-23。
- 本次范围：已核对作者或官方展映页面、作品归属及 AI 参与依据；未完整播放影片，未验证各地区的登录、付费及设备限制。
- [作者频道的影片与制作说明](https://www.youtube.com/watch?v=wytfCS-N8Sk)：作者频道发布原版影片；索引元数据显示 2026-04-23，并附视觉、旁白和配乐的 AI 制作自述。
- [作者提交的 FilmFreeway 项目页](https://filmfreeway.com/AFaceOnlyAMotherCouldLove)：列出 Robert Gaudette 的导演、编剧、制片署名、7:50 片长和完成日期；导演声明披露 AI 角色设定、ElevenLabs 语音与 Suno 配乐。
- [Runway 2026 官方获奖页](https://aif.runwayml.com/ja)：官方列出作品、作者和 Grand Prix，独立核对获奖归属。

### HALDANE-4

- 原作：[HALDANE-4](https://haldane4.denisbondare.com/)
- 作品年份：2026；精确公开日期：未确认，留空。
- 本次范围：核对作者或官方公开页面与所列制作说明；未实际运行或通关，制作归因依据发布者自述。
- [作品入口与操作说明](https://haldane4.denisbondare.com/)：官方页面写明 WASD 推进、鼠标旋转、空格控制灯光，建议耳机与桌面设备。
- [官方赛事记录](https://vibejam.com/)：赛事官方目录的索引记录列出 HALDANE-4、@denisbondare、南极冰下 ASCII 叙事和 Cursor；未据此扩展为未公开的模型或素材归因。

### 本轮保留候选与排除理由

Imaginary Soundscape 原站说明 Street View 已停用；部分电影节作品的在线放映期已经结束，未将过期放映页当作长期观看入口。Bloom Cycles 与 Marble and Metal Visualisers 找到近期展示线索，但独立作品的作者、AI 环节或访问条件尚未核清，暂不发布。WenWare 作者页面访问受限，待取得可核验的一手说明再考虑收录。
