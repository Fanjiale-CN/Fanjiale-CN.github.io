# Galok 项目通用开发规范

> 适用于所有 Chat、Codex、人工开发会话和自动化。开始任何 Galok 网站任务前先读本文件，再读仓库根目录的 `AGENTS.md` 与 `DESIGN.md`。本文件记录长期规则，不记录某个临时 PR 的进度。

## 1. 规则优先级

发生冲突时，按以下顺序执行：

1. 用户在当前任务中的明确要求。
2. 仓库根目录 `AGENTS.md` 的发布与推送约束。
3. 仓库根目录 `DESIGN.md` 的身份、信息架构与视觉原则。
4. 本文件的通用流程。
5. 页面或子目录中的局部说明。

任何会话都不得以“以前这样做过”为理由绕过当前仓库规则。先读取真实文件、真实分支和真实 Actions 状态，再判断。

## 2. 项目与生产环境

- 仓库：`Fanjiale-CN/Fanjiale-CN.github.io`
- 生产域名：`https://www.galok.me`
- 技术形态：原生 HTML、CSS、JavaScript；不引入前端框架作为默认方案。
- Node.js：以 CI 为准，当前为 Node 24。
- 包管理：npm；依赖锁定在 `package-lock.json`，安装使用 `npm ci`。
- Python：用于 Reading 字体子集等构建任务；字体工具需要 `fonttools` 与 `brotli`。
- 浏览器检查：CI 使用 Google Chrome；本地浏览器测试统一使用 `http://127.0.0.1:4173`。
- 本地静态服务器：`node scripts/serve-static.mjs`，默认端口 `4173`。
- 媒体与运行服务：站点可引用 Galok 媒体域；Radar Worker 的规范源在 `workers/radar/`，根目录 `wrangler.jsonc` 仅为 Cloudflare Git 集成入口。

初始化一个全新开发环境：

```bash
git clone https://github.com/Fanjiale-CN/Fanjiale-CN.github.io.git
cd Fanjiale-CN.github.io
npm ci
python -m pip install "fonttools[woff]" brotli
```

`npm ci` 会安装仓库的 pre-push hook。不要删除、替换或绕过它。

## 3. 每次会话的起手检查

在修改任何文件前：

```bash
git status --short
git branch --show-current
git log -5 --oneline --decorate
```

然后执行以下动作：

1. 阅读 `AGENTS.md`、`DESIGN.md` 和本文件。
2. 确认当前任务范围、目标页面、是否只诊断或允许实施。
3. 检查工作树是否已有用户改动；所有未知改动默认属于用户，必须保留。
4. 如果当前位于 `main`，先同步远端，再从最新 `main` 新建工作分支。
5. 对 UI 任务先读取现有页面、共享样式、相关截图或真实线上状态；禁止凭想象重建。

推荐分支名：

```text
work/<short-task-name>
fix/<short-task-name>
content/<short-task-name>
```

一个分支只处理一个清晰主题。发现无关问题时记录，除非用户明确扩展范围，否则不顺手大改。

## 4. 主分支、PR 与推送规范

`main` 是受保护发布分支。当前 GitHub ruleset `Protect main release` 强制：

- 所有改动通过 Pull Request 进入 `main`。
- 必需检查 `Validate site release gates` 必须成功。
- 分支必须基于最新 `main`，严格状态检查生效。
- 禁止删除 `main`、禁止 non-fast-forward 更新和 force-push。
- 没有 bypass actor；自动化和维护者都不能绕过。

标准流程：

1. 从最新 `main` 创建工作分支。
2. 完成一组内聚修改；优先早开 Draft PR，让 Actions 尽早暴露问题。
3. 生成并提交所有由本次源文件变化引起的构建产物。
4. 在本地运行发布门禁。
5. 检查 diff，只提交任务相关内容。
6. 推送工作分支，等待 PR 检查。
7. 修复失败检查的根因；不要临时改 workflow 绕过。
8. 检查全部变绿后再把 PR 标记 ready。
9. 只有用户明确授权合并时才合并；“提交”“推送”“开 PR”不等于“合并”。

建议提交信息：

```text
feat(scope): add or complete a capability
fix(scope): correct a defect
style(scope): visual-only change
content(scope): publish or revise editorial material
chore(scope): tooling, generated assets, or maintenance
```

提交应当内聚、可回滚。不要制造十几个“try again”“fix CI”碎片提交；修复完成后再交付，必要时在合并前 squash。

## 5. 本地发布门禁

通用改动的最小完整流程：

```bash
npm ci
npm run build:discovery
git add <intended-source-files> feed.xml sitemap.xml index/search-catalog.json pagefind/
npm run release
git status --short
git diff --check
```

`npm run release` 会：

1. 重新生成 discovery。
2. 执行轻量发布检查，包括全局样式、站点 shell、发布结构、Discovery、Radar 和主要城市页面规则。
3. 检查生成物是否干净。

如果 `check:generated-clean` 失败：

1. 不要忽略。
2. 检查 `feed.xml`、`sitemap.xml`、`index/search-catalog.json`、`pagefind/` 的变化。
3. 确认变化确实由本次内容或路由引起。
4. 把生成物与源文件一起 stage。
5. 再运行 `npm run release`，直到成功。

pre-push hook 会再次运行完整 `npm run release`。不得使用 `--no-verify` 绕过。

## 6. Discovery 与生成物规范

以下文件是版本化发布资产，必须与触发它们的源内容一起提交：

- `feed.xml`
- `sitemap.xml`
- `index/search-catalog.json`
- `pagefind/` 下的索引、fragment、filter、metadata 与 build marker

当改动涉及页面正文、标题、描述、canonical、路由、索引状态、站内搜索或栏目类型时，必须运行：

```bash
npm run build:discovery
```

规则：

- sitemap 与 feed 只包含允许外部索引的页面。
- `noindex` 页面默认不进入外部 discovery。
- 如页面需要保持 `noindex` 但进入 Galok 站内搜索，使用项目已有的显式 internal-search 标记；不得为站内搜索擅自开放外部索引。
- 不手改 Pagefind 哈希文件；始终由构建脚本生成。
- 不只提交 catalog 而漏掉 Pagefind，或只提交 Pagefind 而漏掉 sitemap/feed。

## 7. Reading 字体规范

Reading 字体是构建资产，正文和罕见古字必须达到 100% cmap 联合覆盖。

当前字体栈：

- GenRyu Reading：中文正文主字体。
- Qiji Reading：中文标题与展示用途。
- HanaMin Reading Rare：GenRyu 未覆盖的 CJK 扩展字 fallback。
- Bagnard 等拉丁展示字体仅用于其明确负责的拉丁标题层，不得因加载失败退回普通 sans 后仍被视为通过。

任何 `reading/**/*.html` 中的中文字符变化都要运行：

```bash
python scripts/build-reading-font-subsets.py
python scripts/check-reading-font-coverage.py
npm run build:discovery
```

并提交脚本生成的字体文件：

- `assets/fonts/genryu-reading-tw.woff2`
- `assets/fonts/qiji-reading-title.woff2`
- `assets/fonts/hanamin-reading-rare.woff2`

字体 workflow 只验证 PR 中已提交的字体和 discovery 是否为最新，不替开发者向分支写回文件。不要等待机器人替你生成提交。

罕见字处理规则：保留原文字符，通过 fallback 字体解决；不得为通过检查擅自换成近似字、简化字或图片。

## 8. 设计规范

### 8.1 身份与信息架构

- 公开作者身份统一为 `Galok`。
- 个人姓名不得出现在导航、metadata、署名、结构化数据、联系文案或公开源代码注释中。
- 联系方式保持 `galokview@outlook.com` 与 `@galokview`。
- 一级信息架构以 `Cities / Essays / Work / Index / About` 为核心。
- Data 在规模足够前是 Essays 内的研究系列；Postcards 与 Visual Notes 是内容格式，不争夺一级导航。
- `View（視）/ Frame（框）/ Observe（察）` 是 Galok 的三种观察距离，不得随意改名或混用。

### 8.2 视觉语言

- 基础色：近黑墨色、暖纸色、一个信号红。
- 深蓝只用于选定编辑场域和城市内容，不扩散成第二套全站主色。
- 大号无衬线标题负责层级；衬线斜体用于引用和反思；等宽小标签用于日期、章节和证据。
- 方角、细线、真实资料共同构成编辑感。
- Zine 海报是版本封面或 feature art，不是所有卡片的通用皮肤。
- Glyph seal 使用 `Galok Glyph Display`，只使用 `視 / 框 / 察`，墨色落在纸色上，不使用信号红，不做持续动画。
- 设计服务于信息。装饰必须能解释层级、语义、证据或操作反馈，否则删除。

### 8.3 布局与响应式

- 先继承现有页面自己的网格、间距、字体与组件证据，再添加新模块。
- 桌面、平板、手机必须分别检查；不能只缩小桌面布局。
- 正文保持舒适行长和清楚段落；证据注释与正文要有明确层级，不能挤成同一视觉噪声。
- 不因某个局部需求重写全局 `styles.css`；优先在页面或栏目级样式内做最小改动。
- 不用内联样式堆叠长期规则，不复制已有组件形成第二套实现。

### 8.4 动效

- 动效只承担结构揭示或反馈。
- 生产页面只使用 `opacity` 与 `transform` 作为主要动画属性。
- 单段动效原则上不超过 `240ms`；hover 位移限制在 `2–6px`，不得引发布局重排。
- 避免长时间、逐项排队的 reveal；首屏内容不能因 JavaScript 失败而永久隐藏。
- 所有动效支持 `prefers-reduced-motion`。
- 动画库或 HyperFrames 可用于独立审片稿；未经明确决定，不得把审片依赖接入生产页面。

## 9. 开发规范

### HTML

- 使用语义元素，保持唯一 `h1`、合理标题层级、可见 skip link 与可聚焦主内容。
- 页面必须有绝对 canonical、description、Open Graph、Twitter metadata；公开文章按现有模式维护 JSON-LD。
- 图片提供真实 `alt`；装饰图使用空 `alt`；关键图尽量写明尺寸，减少布局抖动。
- 内部链接使用规范路由，目录页面使用尾斜杠。
- 状态、进度、导航和 LIVE/QUEUED 信息必须写在 HTML 真相中，不能依赖 JavaScript 在运行时伪造。

### CSS

- 优先复用现有 token、字体族、颜色和布局规则。
- 动效使用 transform/opacity；避免对宽高、top/left 和大面积滤镜做动画。
- 新增 CSS 前先搜索已有 selector，防止压缩 CSS 尾部 override 互相打架。
- 保持 UTF-8；运行 `git diff --check`，禁止尾随空格和冲突标记。

### JavaScript

- 使用渐进增强：核心正文、链接和导航在 JS 失败时仍可用。
- DOM 查询缺失时安全退出，不在全局泄漏变量。
- 观察器和事件监听器应有明确生命周期；一次性 reveal 完成后取消观察。
- 不在前端暴露 token、密钥或私有接口。
- 可用原生 API 完成时不新增依赖。

### 内容与证据

- 原文、译文、解释、异文和推断分层呈现。
- 不确定释义要标为 working translation、variant、open locus 或 limit，不包装成定论。
- 来源链接贴近具体主张；图像来源、版权状态和用途写清。
- 历史概念不强行现代化：避免错误币值换算、时代错置和把译名当作制度结论。

## 10. GitHub Actions 与自动化规范

- 仓库脚本是开发逻辑的唯一来源；workflow 只负责 checkout、安装、调用脚本、上传报告或部署。
- 禁止为单个任务新建 `*-preflight.yml`、`work/*-preflight.yml` 或一次性 workflow。
- 禁止把大型脚本、压缩包、gzip/base64 payload 或混淆代码塞进 YAML 环境变量。
- validation-only workflow 使用只读权限；确实需要写仓库的自动化必须在隔离分支修改并开 PR，不能直接写 `main`。
- 不通过 `continue-on-error`、删 gate、改 job 名或重跑无关 job 来伪造绿灯。
- workflow 失败时读取准确 job/step/log，修复根因后重跑失败任务。

## 11. CI、部署与“真正上线”

PR 的权威检查是 `Validate site release gates`，包括：

- Reading 字体覆盖与展示字体实际解析
- Discovery 生成物一致性
- 原生仓库 validators
- City Atlas / reader contact
- 路由、fragment 与 R2 媒体
- 资源预算
- 浏览器可访问性
- 全站搜索
- Analytics / Clarity wiring
- Radar 与 reduced motion
- 多路由、多 viewport 视觉检查
- Lighthouse

合并到 `main` 后，同一 workflow 还会检查本次变化对应的生产路由。验证器会添加 cache-busting query，并在部署传播期间重试：当前为最多 20 次、每次间隔 15 秒。

因此：

- PR 检查绿灯表示代码与构建符合发布门禁。
- 合并完成不代表新页面已经立即可访问。
- 只有 production route verifier 明确报告相关路由返回 2xx/3xx，才能称“已经上线”。
- 部署传播期间短暂 404 是可观察状态；不能提前宣布成功，也不应立刻用无关提交反复触发部署。

## 12. 故障处理

### 生成物不干净

运行 `npm run build:discovery`，检查并 stage 全套生成物，再运行 `npm run release`。

### 字体检查失败

先确认字符是否真实需要保留，再重新生成三层 Reading 字体并运行覆盖检查；不要手工编辑 WOFF2。

### 浏览器或视觉检查失败

下载 CI artifact，检查失败 viewport 与截图；先复现实际 selector、字体加载或尺寸问题，再改代码。

### 生产路由 404

查看 production verifier 是否仍在重试；如果超过重试窗口仍失败，再检查 Cloudflare/Pages 部署与路径生成。不要把“Actions 前半段绿灯”误判成生产已可用。

### 权限或凭据失败

停止写操作，报告准确 blocker。不得寻找绕过分支保护、提取凭据或改写远端历史的路径。

## 13. 每次对话的交接格式

跨 Chat 或换执行环境时，在仓库或 PR 留下以下最小状态：

```markdown
## 目标
用户要解决什么，明确不做什么。

## 仓库状态
分支、PR、最新提交 SHA、工作树是否干净。

## 已完成
按文件说明已经落地的事实。

## 未完成 / blocker
只写真实剩余项、失败命令与准确错误。

## 已验证
列出执行过的命令、成功结果和 CI 链接。

## 下一步
从第一条可执行动作开始，不让下一位重做。
```

不要只写“差不多完成”“应该没问题”。所有结论应能由文件、命令、PR、Actions 或生产 URL 复核。

## 14. 永久禁止项

- 直接推送、force-push 或试图删除 `main`。
- 未经用户明确授权合并 PR。
- 使用 `--no-verify`、删除 hook、弱化 ruleset 或移除 required check。
- 用一次性 workflow 代替正常开发。
- 丢弃用户未知改动，或使用 `git reset --hard` / `git checkout --` 清理工作树。
- 漏交 Discovery、Pagefind 或字体生成物。
- 用 JavaScript 伪造 HTML 中应该存在的内容状态。
- 为通过字体或文本检查修改历史原字。
- 在没有真实浏览器证据时宣布视觉修复完成。
- 在 production verifier 尚未确认路由时宣布内容已上线。
