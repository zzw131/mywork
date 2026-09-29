# Personal Workbench (Neo-Brutalism v4) 交互与视觉设计交接规范文档

> **版本**：v4.4.0-spec  
> **设计风格**：Neo-Brutalism（新野兽派）极客工坊风格  
> **核心原则**：高对比度、硬边缘、物理级触觉反馈（无模糊软投影、无渐变、无玻璃拟态）、数学对齐防挤压、跨页零跳动、信息高密度。  
> **目标读者**：AI 审查 Agent / 前端开发 / UI·UX 审核员

---

## 目录
1. [设计理念与反“AI Slop”负向清单](#1-设计理念与反ai-slop负向清单)
2. [官方 Logo 与品牌标识（Official Brand Logo）](#2-官方-logo-与品牌标识official-brand-logo)
3. [设计系统基础（Design Tokens）](#3-设计系统基础design-tokens)
   - 3.1 颜色系统（Color Tokens）
   - 3.2 阴影与描边规则（Shadows & Borders）
   - 3.3 字体排版与数学比例（Typography）
4. [核心组件交互规范（Component Specs）](#4-核心组件交互规范component-specs)
   - 4.1 头部与三级核心视图切换（V4Header & View Switcher）
   - 4.2 检索与通用标签栏（V4SearchToolbar & TagPanel）
   - 4.3 资源卡片（V4ResourceCard）
   - 4.4 备忘录系统与双布局模式（Memos System & Card/List Views）
   - 4.5 目标管理系统与废除容器1规范（Goals System & Container 1 Elimination）
   - 4.6 状态筛选 Tab 防裁剪与防挤压规范（Tab Anti-Clipping Rule）
   - 4.7 跨页面「容器2」绝对对齐与路由淡入淡出（Sticky Container 2 & Route Fade-in）
   - 4.8 底部全局状态栏与规范库文字链接（V4Footer）
5. [权限系统与状态机交互](#5-权限系统与状态机交互)
   - 5.1 访客模式（Guest）vs 拥有者模式（Owner）
   - 5.2 布局编辑模式（Edit Mode）
6. [AI 审查自检核对表（Audit Checklist）](#6-ai-审查自检核对表audit-checklist)

---

## 2. 官方 Logo 与品牌标识（Official Brand Logo）

> **重要标识原则**：全站所有页面的官方 Logo 恒定且唯一，统一采用 `<WorkbenchLogo />` 组件（矢量图形源文件位于 `/public/logo.svg` 与 `/public/favicon.svg`）。**严禁随意替换或回退为纯文字缩写。**

- **Logo 视觉构成**：
  1. **基底轮廓**：Neo-Brutalism 黄色圆角卡片（`#FFCD29`），4.5px 纯黑外描边（`#171717`）与右下方向 3D 实心硬阴影（Offset `+6px, +6px`，`#171717`）。
  2. **工坊工作台图案**：
     - **左侧核心屏幕**：主工作显示器圆角矩形；
     - **右侧双模块**：上下两个平行排列的组件面板/层叠窗口；
     - **一体式工作台面**：横贯底部的厚实支撑桌面；
     - **坚固双桌腿**：左右两侧对称立柱桌腿。
- **全站使用场景**：
  - **浏览器 Favicon**：`/public/favicon.svg`；
  - **全局顶栏（V4Header）**：`<WorkbenchLogo className="w-9 h-9" />`；
  - **全局页脚（V4Footer）**：`<WorkbenchLogo className="w-6 h-6" />`；
  - **规范库（DesignSystemPage）**：展示于核心 Banner 标题区。

---

---

## 1. 设计理念与反“AI Slop”负向清单

为杜绝 generic / 低质 AI 界面范式，本系统强制执行以下红线限制：

| 违规模式 (Banned AI Cliché) | 本项目设计规范实现 |
| :--- | :--- |
| **蓝紫渐变色、文本渐变** | **绝对禁用任何渐变**。使用纯色填充，主背景为低饱和纸感色 `#FBF7EF`。 |
| **毛玻璃 / 模糊投影 (backdrop-blur / blur-xl)** | **硬边缘投影**（`box-shadow: Xpx Xpx 0px #171717`），模糊度恒等于 `0`。 |
| **卡片套卡片 (Card inside card 滥用)** | 通过留白（whitespace）、硬分割线与字重层级划分，避免多重嵌套。 |
| **标签/按键文本折行 (如 "⌘K\n搜索")** | 强制设置 `whitespace-nowrap`、`shrink-0`，单行内自适应容器宽度。 |
| **卡片重叠/高度穿透下方网格** | 明确绑定 `row-span` 与 `min-h`，行高基于 `88px` 倍数进行严密对齐。 |
| **低对比度灰字** | 严格遵循 WCAG AA 标准，正文最低 `#5F5E5A`，主字色 `#171717`。 |

---

## 2. 设计系统基础（Design Tokens）

### 2.1 颜色系统（Color Tokens）

#### (1) 中性底色与墨黑体系 (Neutrals)
- **纸质背景 (Paper Base)**：`#FBF7EF` —— 全局底色，暖调微饱和纸质质感。
- **纯白表面 (Surface)**：`#FFFFFF` —— 卡片、弹窗与输入框主表面。
- **墨黑 (Ink Primary)**：`#171717` —— 2px 核心描边、主文字与硬阴影投射色。
- **次级正文灰 (Ink Secondary)**：`#5F5E5A` —— 描述摘要、副标题、计数标签。
- **弱化提示灰 (Ink Tertiary)**：`#888780` —— 占位符、离线状态、禁用边框。
- **硬质细分割线 (Divider)**：`#EDE8DC` —— 卡片内底部分割线、浅色徽标背景。

#### (2) 语义特征色 (Vibrant Accents)
- **品牌高光黄 (Brand Yellow)**：`#FFD84D` —— 置顶徽章、选中激活态、主操作按钮。
- **健康运行绿 (Mint Green)**：`#A9E5C3` —— OK 状态指示灯、SVC 微服务徽标。
- **智能紫 (Purple)**：`#C9B8FF` —— APP 应用徽章、AI 算法节点。
- **代码粉 (Pink/Coral)**：`#FFB4C6` —— REPO 仓库、代码资产。
- **基础设施蓝 (Blue)**：`#A9D0FF` —— 网络隧道、CDN 路由。
- **文档橙杏 (Apricot)**：`#F7C873` —— 知识库、笔记文档。

### 2.2 阴影与描边规则（Shadows & Borders）
1. **描边标准**：除特定内嵌小组件（1px）外，所有容器与交互实体均使用 **`border-2 border-[#171717]`**。
2. **硬阴影矩阵**：
   - **默认常态卡片**：`shadow-[4px_4px_0_#171717]`
   - **悬停提升态 (Hover)**：`-translate-x-0.5 -translate-y-0.5 shadow-[6px_6px_0_#171717]`
   - **激活/模态聚焦态 (Active/Focus)**：`-translate-x-1 -translate-y-1 shadow-[8px_8px_0_#171717]`
   - **按压/禁用平贴态 (Pressed/Disabled)**：`translate-x-0.5 translate-y-0.5 shadow-none` 或 `shadow-[1px_1px_0_#171717]`

### 2.3 字体排版与数学比例（Typography）
- **主要字体栈**：`Plus Jakarta Sans`, `Inter`, `ui-sans-serif`, `system-ui`。
- **等宽数据字族**：`ui-monospace`, `Menlo`, `Monaco`, `Courier New`（用于快捷键、URL Chip、卡片元信息、PGlite 状态）。
- **字阶比例（Major Second 1.125）**：
  - Header Title: `18px / font-bold / tracking-tight`
  - Card Title: `14px / font-bold / leading-snug`
  - Body Text: `12px / font-normal / leading-relaxed / text-[#5F5E5A]`
  - Meta/Tag Text: `11px ~ 12px / font-mono / font-bold`
  - Micro Badges: `10px / font-mono / font-semibold`

---

## 3. 栅格系统与尺寸防溢出数学约束

### 3.1 6 列响应式栅格与 88px 基础行高公式
- **栅格配置**：`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[88px]`
- **高度计算公式**：
  $$\text{Height} = (\text{Rows} \times 88\text{px}) + ((\text{Rows} - 1) \times 16\text{px})$$
  - 2 行单元：$(2 \times 88) + (1 \times 16) = \mathbf{192\text{px}}$
  - 4 行单元：$(4 \times 88) + (3 \times 16) = \mathbf{400\text{px}}$ (对应 `min-h-[396px]`)

### 3.2 卡片四种尺寸矩阵（Card Sizes）

| 尺寸名称 | 列跨度 (`col-span`) | 行跨度 (`row-span`) | 最小高度 (`min-h`) | 内容呈现规则 |
| :--- | :--- | :--- | :--- | :--- |
| **Small** | `lg:col-span-2` (1/3宽) | `row-span-2` | 192px | 顶部类型+状态、主标题、URL单行Chip、底部类型元信息。**隐藏正文摘要以防溢出**。 |
| **Wide** | `lg:col-span-4` (2/3宽) | `row-span-2` | 192px | 包含上述要素，额外展示 **1 行单行截断正文** (`line-clamp-1`) 与首个 Tag。 |
| **Large** | `lg:col-span-4` (2/3宽) | `row-span-4` | 396px | 高度加倍，展示 **2 行完整正文** (`line-clamp-2`)，展示全量标签组、时间戳与操作区。 |
| **Banner** | `lg:col-span-6` (全宽通栏) | `row-span-2` | 192px | 全宽通栏横幅，右侧展示快速访问操作区，适合核心系统入口或数据总线。 |

---

## 4. 核心组件交互规范（Component Specs）

### 4.1 头部与三级核心视图切换（V4Header & View Switcher）
- **左侧品牌区**：展示官方 `WorkbenchLogo` 矢量工作台图案（黄色底座、黑描边与硬阴影），支持快速返回工作台；展示系统运行状态芯片。
- **中央视图切换器（固定三核导航顺序与定位隔离）**：
  - 固定三核一级导航顺序：`工作台` → `备忘录` → `目标管理`（「规范库」已规范移至页面底部页脚文字链接，精简顶栏视线）。
  - **模块职责边界隔离**：
    - **工作台**：我的资源在哪里、打开什么（入口资产、链接协议、本地/云端服务、六大标准分类）。
    - **备忘录**：我刚想到什么、快速记录什么（3~5秒极速捕获灵感，支持卡片与列表双布局，纯粹文本与标签，无 Dashboard 数据屏，单级弹窗即时编辑）。
    - **目标管理**：我要完成什么（进行中/达成打对号、阶段性里程碑、结构化复盘手记）。
  - 选中态高亮：背景色为 `#FFD84D`，墨黑字体，带有 `shadow-[2px_2px_0_#171717]`。
  - 统一 SPA 切换机制，同步 URL Hash/Path（`#memos`、`#goals`、`#design-system`）。
- **右侧能力区**：
  - `>_ PGlite: OK`：当前本地数据库运行状态芯片。
  - `Owner / 访客 权限`：身份状态指示，点击可切换身份模拟访客体验。
  - `编辑布局`：仅 Owner 模式下呈现，进入后解锁卡片重排与删除。

### 4.2 检索与标签过滤器（V4SearchToolbar & V4Tag）
- **右上角融合型即时搜索栏**：
  - 展开态下采用 `flex justify-end` 吸附在页面顶部右上角，将搜索输入与收起操作融为一体。
  - **点击搜索栏搜索**：在输入框内点击即可即时输入并检索。
  - **点击文案收起**：内部右侧嵌入「收起 (ESC)」文案按钮，点击文案或按键盘 ESC 键即时折叠，移除了原先分散在不同地点的交互割裂。
  - 随当前激活模块自适应语义：
    - 工作台：`快速检索工作台标题、标签、摘要或入口路径（URL、本地路径、GitHub）...`
    - 备忘录：`搜索备忘标题、正文、标签…`（严禁检索 URL 或工程协议）
    - 目标管理：`搜索目标标题、简介、具体链接、复盘笔记...`
    - 规范库：`搜索设计规范 Tokens、色彩、组件与阴影规范...`
  - 键盘操作支持：按下 `⌘K` 或 `Ctrl+K` 快速聚焦输入框，按下 `ESC` 清空输入并收起。
- **全站统一通用标签栏（TagPanel）**：
  - 标签栏与上侧导航保持安全呼吸间距（`mt-3 sm:mt-4`），消除贴边压迫感。
  - **右上角纯文字无边框展开按钮**：去边框化、纯文字极简风格（`border-none`、`bg-transparent`），始终绝对定位锚定在标签栏边框右上角（`absolute right-3 top-3`）。
  - 包含标签计数、标签选中状态、编辑模式下的 CRUD 模态弹窗。

### 4.3 资源卡片（V4ResourceCard）
- **卡片头部**：
  - 左侧：`V4Badge`（3字母大写代号，如 `SVC`、`APP`、`REPO`）+ `V4StatusDot` 呼吸状态圆点。
  - 右侧：置顶标记（黄底 Pin 图标）或编辑模式下的移除按钮。
- **地址快速复制交互**：
  - URL 采用独立浅灰背景展示（`bg-[#FBF7EF]`），点击复制按钮复制后即时变更为「已复制」勾选状态，并在 1.5 秒后平滑复原。
- **点击外链交互**：
  - 点击卡片右下角外链图标或直接点击标题，触发在新窗口打开目标绝对路径/Web 地址。

### 4.4 按钮与输入框（V4Button & V4Input）
- **按钮变体**：
  - `yellow`：高优先级提交、新建入口。
  - `default`：标准白色背景、硬描边与硬阴影。
  - `ghost`：透明背景、无阴影，悬停显示浅灰边框背景。
- **按压位移（Micro-interactions）**：
  - Hover: `hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171717]`
  - Active: `active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#171717]`
  - 必须包含 `select-none` 与 `whitespace-nowrap`。

### 4.4 备忘录系统与浮动记录弹层（Memos System & Floating Quick Input）
- **页面总体结构与权限隔离**：
  $$\text{Header} \rightarrow \text{搜索栏} \rightarrow \text{【容器2：状态筛选 Tab 与标签】} \rightarrow \text{Memo 卡片列表}$$
  - **访客模式（Guest Mode 铁律）**：
    - 访客没有编辑权限，“记点什么”快速记录区**绝对不显示**在页面任何区域或 DOM 树中。
    - 严禁向访客展示“写备忘录”触发入口。
    - 备忘录卡片仅提供“复制正文”，隐藏置顶、归档、彻底删除等写权限操作。
    - 备忘录详情弹层强制进入只读预览模式（无保存按钮，禁用自动保存，标题/正文禁用输入，仅供查阅和复制）。
  - **管理模式（Owner Mode 极速浮动录入）**：
    - **屏幕右侧吸附式果冻悬浮按钮组（Jelly Dock）**：在屏幕右侧设置吸附式果冻悬浮按钮组，采用 `fixed right-0 top-1/2 -translate-y-1/2` 处于屏幕右侧上下垂直居中。普通状态隐藏于页面右侧边缘，仅保留一个圆角曲线划框类似果冻吸附在屏幕右侧，内嵌向左的箭头；鼠标滑过（Hover）时通过弹性动画（Jelly Spring）平滑滑出展开，展示独立的「搜索」与「写备忘录」按钮组，鼠标移出自动收起，点击各自具有独立的打开逻辑，互不干扰捆绑。
    - **独立浮动层展开**：点击「写备忘录」icon 后，唤起独立的浮动弹层（`role="dialog"`，半透明遮罩与 Neo-Brutalism 硬边浮动框），而不是嵌入普通文档流把页面下方的容器2推移，确保跨页高度稳定。
    - **极速记录体验**：自动获取焦点，支持输入想法即存（自动提取首行）、回车加标签，支持快捷键保存（`Cmd/Ctrl + Enter`）与 `ESC` 一键关闭。保存后自动关闭浮层并触发全局数据同步。
  - **双布局模式支持（Card & List View Mode）**：
    - **卡片网格模式 (`card`)**：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`，直观呈现正文首屏多行内容与完整标签云。
    - **紧凑列表模式 (`list`)**：`MemoListItem` 呈现，横向通栏结构，行高紧凑，左侧展示标题、正文首行摘要与小标签徽章，右侧固定时间戳与操作区，大幅提升长列表检索效率。
    - 布局切换器位于二级吸顶操作栏右侧，状态自动持久化于 `localStorage: workbench_memos_view_mode`。

### 4.5 目标管理系统与废除容器1规范（Goals System & Container 1 Elimination）
- **彻底废除容器1（Container 1 Elimination）**：
  - 目标管理模块严禁包含任何冗余的「容器1」模块（如目标编辑临时顶栏、伪大数据进度看板等）。
  - 页面首屏顶部紧随全局搜索栏之后，**直接以「容器2」（状态切换与常用标签筛选）为起始入口**。
  - 「+ 新建未完成目标」主操作按钮直接内嵌于容器2的状态 Tab 筛选行右侧，保证操作触手可及。

### 4.6 状态筛选 Tab 防裁剪与防挤压规范（Tab Anti-Clipping Rule）
为解决 Neo-Brutalism 硬阴影与微位移在弹性/滚动容器内被裁剪的问题，所有 Tab 筛选条必须严格遵守以下四项铁律：
1. **容器边距防裁切（Padding Cushion）**：
   - 严禁在带 `overflow-x-auto` 容器内使用贴身紧缩的 `py-1`。因 Tab 激活时具有 `-translate-y-0.5`（向上位移 2px）与 `shadow-[3px_3px_0_#171717]`（向下投射 3px），必须保证父级容器留有至少 `p-1.5` 或使用 `flex-wrap` 配合 `p-1 -m-1`。
2. **图标抗压扁（Icon Shrink Protection）**：
   - Tab 内部所有 SVG 图标（如 `Sparkles`、`Pin`、`Clock`、`Archive`）必须显式包裹或标记 `shrink-0`，严禁在移动端或窄容器内被 flexbox 挤压压扁变形。
3. **文本与徽标单行对齐（Whitespace & Leading Discipline）**：
   - Tab 标签必须包含 `whitespace-nowrap leading-none`，严禁汉字与数字换行错位。
   - 计数徽标必须采用有效的内边距语法（如 `px-1.5 py-0.5 min-w-[20px] leading-none`），严禁写入如 `py-0.2` 等无效类。
4. **同级高度基准对齐（Fixed Height Alignment）**：
   - 所有横向并列筛选按钮（全部、置顶、最近、已归档）统一使用 `h-9 sm:h-10`，杜绝状态切换时的像素级抖动。

### 4.7 跨页面「容器2（筛选与标签栏）」绝对对齐与路由淡入淡出规范（Sticky Container 2 & Route Fade-in）
- **统一位置与零跳动（Zero Jumping Across Views）**：
  - 工作台（Workbench）、备忘录（Memos）、目标管理（Goals）三大核心页面的「容器2」全部采用相同的结构定位与内边距：
    - 外层：`sticky z-20 bg-[#FBF7EF]/95 backdrop-blur-md pt-3.5 pb-4 sm:pt-4.5 sm:pb-5 border-b border-[#171717]/10`
    - 内层宽度与显示范围：统一采用与顶部导航栏完全一致的 `w-full px-4 sm:px-8 space-y-3.5`。
    - Tab 行统一锁定：`min-h-[40px]`，保证不论哪一侧有附加操作按钮，水平基准线均完全重合。
  - 用户在工作台、备忘录、目标管理之间切换页面时，「容器2」的垂直像素位置恒定不变，杜绝页面切换时的任何上下抖动。
- **全站路由切换淡入淡出（Smooth Route Fade-In）**：
  - 路由挂载的各主视图容器注入唯一 `key` 与 `.page-fade-in` 动画，基于纯透明度进行 200ms cubic-bezier 缓动，杜绝位移抖动。
- **向下滚动吸顶冻结（Sticky Freeze Without Search Collision）**：
  - 「容器2」的吸顶偏移量严格采用 CSS 变量动态联动：`top: var(--search-bar-height, 0px)`。
  - 通过 `ResizeObserver` 实时监听 `V4SearchToolbar` 的实际物理高度，当搜索栏展开或折叠时动态重设 `--search-bar-height`。
  - 向下滚动页面时，「容器2」完美冻结吸附在搜索栏正下方，既不脱节留白，也绝对不遮挡搜索栏输入框。

### 4.8 底部全局状态栏（V4Footer）
- **左侧**：品牌标识 `WorkbenchLogo` 与版本声明，以及直达设计规范库的文字链接（`规范库`）。
- **中央**：系统运行引擎（`Client Engine: React 19 + PGlite`）、分支信息、已核对数据表。
- **右侧快捷键提示徽章**：
  - 包含 `⌘K 搜索`、`ESC 关闭 / 清空`、`Tab 切换分类`。
  - **强制规则**：必须保证 `whitespace-nowrap` 与 `shrink-0`，严禁按键文字与功能词换行拆分。

---

## 5. 权限系统与状态机交互

```
+--------------------------------------------------------+
|                      系统加载完成                       |
+--------------------------------------------------------+
                           |
            +--------------+--------------+
            |                             |
      [Guest 访客身份]              [Owner 拥有者身份]
            |                             |
  * 仅可检索、筛选、访问链接         * 可进入「编辑布局」模式
  * 隐藏所有编辑/删除控件           * 可新增卡片 (弹出 AddObjectForm)
  * 隐藏添加卡片悬浮/头部入口       * 可置顶/取消置顶卡片
  * 绝对不显示“记点什么”录入区      * 可切换卡片栅格尺寸
  * 隐藏搜索icon下的写备忘录入口     * 可点击写备忘录展开浮动记事
```

---

## 6. AI 审查自检核对表（Audit Checklist）

交给后续 AI 进行自动化检测或视觉一致性审查时，请依次执行以下断言：

1. **[断言-01] 文本折行审查**：
   - 检查所有 `<button>`、`<span class="badge">`、快捷键 `<kbd>` 是否含有 `whitespace-nowrap`。
   - 检查在 1024px ~ 1440px 分辨率下，页脚右侧快捷键是否出现双行折行（出现即判定为 Bug）。
2. **[断言-02] 栅格无穿透审查**：
   - 检查所有卡片外层容器是否配置了对应的 `row-span-2` 或 `row-span-4`。
   - 检查是否在小卡片（Small）内放置了长篇正文导致溢出底部描边。
3. **[断言-03] 颜色纯度审查**：
   - 检查 CSS 样式表与组件行内样式中是否包含 `linear-gradient`、`radial-gradient` 或 `backdrop-filter: blur`。如有则不符合 Neo-Brutalism v4 标准。
4. **[断言-04] 交互状态反馈审查**：
   - 检查按钮和卡片在 `:hover` 与 `:active` 时，`transform: translate` 的位移量与 `box-shadow` 的偏移量是否保持相反方向的等比补偿，确保机械物理按压感真实。
5. **[断言-05] 角色权限隔离审查**：
   - 当 `identity.role === 'guest'` 时，DOM 树内是否完全销毁了删除按钮、添加按钮与布局拖拽柄（不能仅依靠 `display: none` 隐藏）。
   - 检查「记点什么」输入区与「写备忘录」触发入口是否完全不渲染。
6. **[断言-06] 筛选 Tab 防裁剪与防挤压审查**：
   - 检查所有处于 `overflow-x-auto` 容器内的状态/分类 Tab 是否留有足量边距（至少 `p-1.5` 或 `p-1 -m-1`），在向上浮动 `-translate-y-0.5` 及投射硬阴影 `shadow-[3px_3px_0_#171717]` 时，上/下/左边缘不得出现硬性裁剪切边。
   - 检查 Tab 内的图标是否标注 `shrink-0`，徽标和文字是否设置 `whitespace-nowrap leading-none`，禁止出现文字换行或图标压扁。
7. **[断言-07] 备忘录极速录入与浮动唤出审查**：
   - 检查备忘录功能在管理模式下是否通过「搜索 icon 下方的写备忘录触发入口」唤起独立浮动弹层，不常驻冗余挤占纵向屏幕。
   - 检查页面顶部严禁出现与核心记录无关的伪大数据看板或大型宣传 Banner。
8. **[断言-08] 目标管理容器1移除审查**：
   - 检查目标管理页面是否已彻底清除容器1模块，首屏直接以容器2状态切换与标签面板起始。
9. **[断言-09] 容器2跨页面零跳动与防冲突冻结审查**：
   - 检查工作台、备忘录、目标管理三主页的容器2是否均配置了相同的顶边距与吸顶样式：`top: var(--search-bar-height, 88px)`。
   - 检查切换页面时容器2位置是否保持一致（无垂直位移跳动）。
   - 检查页面向下滚动时容器2是否稳定冻结在搜索栏正下方且无任何重叠冲突。
