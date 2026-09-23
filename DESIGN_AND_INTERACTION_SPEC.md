# Personal Workbench (Neo-Brutalism v4) 交互与视觉设计交接规范文档

> **版本**：v4.2.0-spec  
> **设计风格**：Neo-Brutalism（新野兽派）极客工坊风格  
> **核心原则**：高对比度、硬边缘、物理级触觉反馈（无模糊软投影、无渐变、无玻璃拟态）、数学对齐防挤压、信息高密度。  
> **目标读者**：AI 审查 Agent / 前端开发 / UI·UX 审核员

---

## 目录
1. [设计理念与反“AI Slop”负向清单](#1-设计理念与反ai-slop负向清单)
2. [官方 Logo 与品牌标识（Official Brand Logo）](#2-官方-logo-与品牌标识official-brand-logo)
3. [设计系统基础（Design Tokens）](#3-设计系统基础design-tokens)
   - 3.1 颜色系统（Color Tokens）
   - 3.2 阴影与描边规则（Shadows & Borders）
   - 3.3 字体排版与数学比例（Typography）
4. [栅格系统与尺寸防溢出数学约束](#4-栅格系统与尺寸防溢出数学约束)
   - 4.1 6 列响应式栅格与 88px 基础行高公式
   - 4.2 卡片四种尺寸矩阵（Small / Wide / Large / Banner）
5. [核心组件交互规范（Component Specs）](#5-核心组件交互规范component-specs)
   - 5.1 头部与视图切换（V4Header & View Switcher）
   - 5.2 检索与标签过滤器（V4SearchToolbar & V4Tag）
   - 5.3 资源卡片（V4ResourceCard）
   - 5.4 按钮与输入框（V4Button & V4Input）
   - 5.5 状态圆点与类型徽章（V4StatusDot & V4Badge）
   - 5.6 底部全局状态栏（V4Footer）
6. [权限系统与状态机交互](#6-权限系统与状态机交互)
   - 6.1 访客模式（Guest）vs 拥有者模式（Owner）
   - 6.2 布局编辑模式（Edit Mode）
7. [AI 审查自检核对表（Audit Checklist）](#7-ai-审查自检核对表audit-checklist)

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

### 4.1 头部与视图切换（V4Header & View Switcher）
- **左侧品牌区**：展示 `PW` 图标（1:1黑底白字方块），支持快速返回；展示当前系统版本徽标（如 `v1.0`）及当前在线卡片数量。
- **中央视图切换器**：
  - 包含 `[工作台]` 与 `[规范库]` 胶囊切换。
  - 选中态高亮：背景色为 `#FFD84D`，带有 `shadow-[2px_2px_0_#171717]`。
  - 支持路由/Hash 联动（`#design-system`）。
- **右侧能力区**：
  - `>_ PGlite: OK`：当前本地数据库运行状态芯片。
  - `Owner 权限`：身份状态指示，点击可切换身份模拟访客体验。
  - `编辑布局`：仅 Owner 模式下呈现，进入后解锁卡片重排与删除。

### 4.2 检索与标签过滤器（V4SearchToolbar & V4Tag）
- **即时搜索输入框**：
  - 前缀放大镜图标，内置单选清空 `X` 按钮。
  - 键盘操作支持：按下 `⌘K` 或 `Ctrl+K` 快速聚焦输入框，按下 `ESC` 清空输入。
- **分类筛选标签组**：
  - 包含「全部入口」、「项目与应用」、「开发与工具」、「Web 控制台」、「学习与参考」、「微服务与资产」等。
  - 单选互斥筛选，每个标签包含独立数量计数气泡。
  - 激活时上浮 `-translate-y-0.5` 并施加黄色背景与硬阴影。

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

### 4.5 底部全局状态栏（V4Footer）
- **左侧**：品牌标识与版本声明。
- **中央**：系统运行引擎（`Client Engine: React 19 + PGlite`）、分支信息、已核对数据表。
- **右侧快捷键提示徽章**：
  - 包含 `⌘K 搜索`、`ESC 清空`、`Tab 导航`。
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
                                    * 可切换卡片栅格尺寸
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

---

*文档生成时间：2026-09-21 | Neo-Brutalism v4 Personal Workbench 团队*
