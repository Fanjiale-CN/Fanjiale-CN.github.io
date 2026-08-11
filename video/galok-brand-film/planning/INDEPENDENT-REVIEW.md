# Galok brand film — independent final review

## 发布门槛

**PASS / 可以发布。**

审查对象：`assets/about/galok-brand-film.mp4`
SHA-256：`702fdffafb0934cd1a5d26d94d8805e9a3152be9a4de20890be0b64227ffdb9a`
技术规格：1920×1080、30 fps、36.000 s、H.264 / yuv420p、仅 1 条视频流、**无音轨**。
创作模式：自主自由创作。

本次复审以当前 SHA 对应的最终 MP4、最新关键帧/边界联系表、`outro-hold-sheet.jpg`、修正版页面截图、源码、分镜、映射、设计规范及新增 `decisions.md` 为准。上一轮五项发布阻断均已关闭：CTA 达到 64px 且完整 hold 40 帧；镜头文档不再虚称精确卡片实现；About 已明确出现并带联系方式；首页与 Archive 推近在切镜前落定；Works/Notes 使用新的真实窄屏捕获并完整显示页面标题与说明。

## P — 产品目标

- P1 ✓ f120–239 的 “An independent visual archive” 清楚给出产品定位，后续镜头以四城、Works、Notes、Data、Archive、About 提供证据。
- P2 ✓ 36 秒时间分配符合最终优先级：品牌 4s、首页 4s、城市 6s、Works/Notes 6s、Data 5s、Archive 4s、About 4s、目标页 3s。
- P3 ✓ 未出现不存在或未经确认的功能。历史 CPI 序列与 `data/data.js` 一致；页面公开注明 NBS 来源与验证范围。
- P4 ✓ `planning/decisions.md` 已补齐需求→决定→证据→验收口径；视觉、静默、内容覆盖、真实素材、CTA、Q8 例外和部署要求均能在源码、分镜和最终帧中找到对应落地。

## F — 功能完整性

- F1 ✓ 每项必须展示内容均有清楚状态：北京/上海/西安/厦门在 f240–419；Works/Notes 在 f420–599；Data 在 f600–749；Archive 在 f750–869；About 在 f870–989；最终目的地在 f1040–1079。
- F2 ✓ 每镜头提供新信息，未重复 tagline 或用同一页面填充时长。城市第二轮事件改变取景但不重复内容。
- F3 ✓ f500 的真实 900px 捕获完整显示 “Work that keeps looking.”、“Keep the evidence close.” 及对应说明；叠加标签只强化分类，不再替代页面状态。

## V — 视觉方向

- V1 ✓ 纸白、墨黑、信号红、方正编辑网格、细线、克制阴影与两套字体持续一致；海报、网页和影片属于同一 Galok 系统。
- V2 ✓ 所有位移/缩放使用 cubic 或 smoothstep；首页推近在全局 f208 结束并静止 31 帧，Archive 在 f838 结束并静止 31 帧；城市第二轮按 4 帧错峰，数据/面板/方法段均有明确收尾。
- V3 ✓ 未漂移到霓虹、游戏 UI、粒子舞台或无关 Ink Press 风格。
- V4 ✓ 未使用禁用的 shake、glint、弹性 UI bounce、装饰性渐变或音效；渐变仅作为截图可读性 scrim。

## S — 镜头卡与 Gallery 变体

- S1 ✓ 最终映射已明确为 custom Shotcraft-informed shots，实际镜头与映射一致：quiet seal reveal、straight-on settled push、两轮错拍四宫格、two-panel reframe、historical line reveal、About paper specimen、restrained lockup。
- S2 ✓ 不适用精确变体复刻。用户未点名具体 `卡名 · 样式名`；`DESIGN.md` 将卡片定义为研究词汇，并逐项记录采用/弃用，不再宣称 Gallery 像素或动作一致性。
- S3 ✓ 对保留的动作语法适配忠实：四宫格保留 2×2、3–6 帧初始 stagger 与第二轮 4 帧 stagger；片尾保留 mark→lockup→CTA 的层级。被弃用的 spotlight、12-tile mosaic、live oscilloscope、neon/overshoot 均有明确项目理由。
- S4 ✓ 已知坑得到处理：6s 四宫格加入第二轮事件；数据收尾自局部 f98 至 f149 静止 52 帧；页面推近切前冻结；光效未群发；CTA 与品牌均有呼吸。
- S5 ✓ 真实截图、坐标、品牌色和海报适配自然；窄屏 Works/Notes 捕获避免了上一版半幅残字。
- S6 ✓ 不再对缺失的 Gallery 动态样片作一致性宣称；研究卡只用于明确记录的动作取舍，因此不存在“缺少预览却声称一致”的风险。

## B — 分镜一致性

- B1 ✓ 八镜顺序、帧段和功能状态与修正版 `storyboard.md` 一致；总长 1080 帧。
- B2 ✓ 主动作、真实页面状态、字幕、静默口径与素材来源一致；无未记录 SFX 或转场。
- B3 ✓ 片头完整 lockup 自 f58 至 f119 hold 62 帧；片尾 GALOK 自 f1048 至 f1079 hold 32 帧；主 CTA 自 f1040 至 f1079 完整 hold 40 帧。Works/Notes、Data、About 的批量动作收尾均超过 0.5 秒。
- B4 ✓ 没有在修正版分镜放行后无依据删除、替换或增加关键镜头；动作简化均在 `DESIGN.md` 与 `decisions.md` 中显式记录为项目选择。

## D — 数据与素材安全

- D1 ✓ 使用公开 NBS CPI 年度序列；数值与 `data/data.js` 逐项一致，未把虚构数据标为真实。
- D2 ✓ 未暴露客户、个人、密钥、内部 URL 或认证信息；邮箱与 X 是用户明确要求的公开联系方式。
- D3 ✓ 首页、Works、Notes、Data、Archive 均使用真实 Galok 页面捕获；四城使用站点已有视频，不是低质量手搓复刻。
- D4 ✓ 捕获脚本使用 1920×1080 / DPR 2、等待字体并冻结页面视频；最新关键帧无破图、未加载字体、异步空状态或页面穿帮。
- D5 ✓ 数据页公开注明 National Bureau of Statistics 来源、方法与验证范围；影片只使用已标为 fully verified 的 CPI。

## A — 音频与节奏

- A1 ✓ 静默是最终确认的音频方向；ffprobe 证明成片无音轨。
- A2 ✓ 不适用：无 SFX。
- A3 ✓ 不适用：无音乐切点。
- A4 ✓ 不适用：分镜未采用 riser→impact→sparkle。
- A5 ✓ 不适用：无长音频样本。
- A6 ✓ 不适用：无渲染音频。
- A7 ✓ 不适用：无 UI 合成提示音。
- A8 ✓ 不适用：未配置 BGM，不要求双版本。

## 审美准则逐条自检

### 节奏

- R1 ✓ 主 CTA 在 f1040 完全落定并保持至 f1079，共 40 帧；片头与片尾品牌字标均 hold 超过 1 秒。
- R2 ✓ 空间运动非匀速；城市第二轮按 4 帧错峰，Works/Notes 重排与 Data reveal 均有 ≥0.5s 静止收尾。
- R3 ✓ 主体段落均为 4–6s，页面和图表信息可跟随；不存在过快的模拟点击/输入交互。

### 质感、运镜与构图

- Q1 ✓ 既有页面均来自真实截图；自建 CPI 图是独立数据叙事组件，使用真实公开数值和明确坐标轴。
- Q2 ✓ 不适用：无 3D UI 透视或放大贴图。
- Q3 ✓ 无 handheld shake；相机仅作确定性、平稳、切前冻结的推近。
- Q4 ✓ 无 glint/sweep 群发，也无光效溢出圆角。
- Q5 ✓ 片头只有 Galok 标识一个主角，低能量起步且动作完整落定。
- Q6 ✓ 信息密集页面全部正视；没有倾斜机位破坏文字可读性。
- Q7 ✓ 不适用：无物件堆叠/orbit 特写。
- Q8 ✓ **有意识例外已合规记录。** `DESIGN.md` 说明 Galok 拒绝高能量“全家福”是为了保持安静的档案气质；片尾改以大号目的地与 >1s hold 作为能量/记忆峰值。该违反有明确项目依据，不再是未说明偏离。
- Q9 ✓ 不适用：无飞入元素落在虚假悬浮槽位。
- Q10 ✓ 不适用：无文档/报告 mock 镜头。
- Q11 ✓ 所有需要阅读的影片主文达到 ≥56px，辅助文字达到 ≥32px；Works/Notes 主 tagline 60px，About 方法 56px，最终 CTA 64px。开场 `FIELD NOTE / 00` 为不承担叙事的档案索引纹理，核心信息由 136px GALOK、32px kicker 与 32px分类承担。

### 声音

- S1 ✓ 不适用：静默是确认的片种选择，成片无音轨。
- S2 ✓ 不适用：无 SFX 表。
- S3 ✓ 不适用：无音轨需要重钉。
- S4 ✓ 不适用：无拟音或装饰音。

### 文案

- C1 ✓ 每个内容段都有与画面一致的屏幕文案；品牌收尾保持干净。静默片没有超过 3 秒且完全无语义提示的内容段。
- C2 ✓ 文案具体到 Cities、Works、Notes、Data、Archive、About 与目标网址；没有用抽象隐喻代替功能名。
- C3 ✓ 不适用：没有 3D 画内注记。

### 流程

- P1 ✓ 已提供最终/边界联系表、CTA hold sheet、Works/Notes 修正版静帧及 About 桌面/移动截图；复审核对了当前 SHA、源码、关键帧、时长、画幅和无音轨状态。
- P2 ✓ `DESIGN.md` 已逐卡记录采用与弃用；图片/动效参考没有被全局套用，实际镜头选择与项目的编辑气质和真实页面状态相符。
- P3 ✓ 不适用：本轮反馈对象与帧段均明确，无含糊指代。
- P4 ✓ 功能映射完整；视觉处理的主角分别是品牌 reveal、首页定义、四城并行、双页面对照、历史折线、Archive 索引、About 方法、目的地 lockup。首页/Archive 的轻推只是背景取景，不作为重复的主动作卖点。

## 必须修复项

无。

## 建议优化项

1. 开场装饰索引 `FIELD NOTE / 00` 仍为 28px。它不承担叙事，因此不阻断发布；后续若要把它从“纹理”升级成可读辅助信息，可统一到 32px。
2. 保留本次 `decisions.md` 与关键帧证据，后续改动时同步更新 SHA 与联系表，避免文档再次与渲染产物漂移。

## 无法验证项

无发布阻断项。Gallery 动态 MP4 本地缺失，但最终方案不再声称精确卡片复刻，且采用/弃用已由卡片文档、demo 源码和项目决策表充分说明。

## 最终结论

当前 SHA 对应的修正版满足发布门槛：36 秒、1920×1080 / 30fps、无音轨；四城与 Works/Notes/Data/Archive/About 均清楚覆盖；真实素材与公开数据口径成立；页面推近切前落定；CTA 在移动缩略观看仍可读并 hold 超过 1 秒；Shotcraft 研究与自定义执行之间的关系已如实记录。**PASS。**
