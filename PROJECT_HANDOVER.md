# Personal Workbench · 完整项目工程与未提交 Git 代码交接文档

> **文档性质**：全栈/前端工程技术交付与架构交接规范  
> **适用对象**：接手开发者、后端接入工程师 (Codex)、Git 提交维护者、QA 测试人员  
> **更新时间**：2026-09-29  
> **技术栈**：React 19 + TypeScript + Vite + Tailwind CSS v4 + Neo-Brutalism v4 Design System  
> **构建状态**：TypeScript 0 错误（`npm run lint` 验证通过），Vite 构建通过（`npm run build` 成功），运行服务响应正常（HTTP 200）。

---

## 目录
1. [本次未上传 Git 的全部变更与代码实现清单](#一本次未上传-git-的全部变更与代码实现清单)
2. [工程目录与核心文件拓扑](#二工程目录与核心文件拓扑)
3. [核心业务模块与最新架构实现](#三核心业务模块与最新架构实现)
   - 3.1 备忘录模块（Memos）：卡片/列表双模式与高密度交互
   - 3.2 通用标签栏（TagPanel）：右上角纯文字无边框展开与统一布局
   - 3.3 搜索工具栏与悬浮组（V4SearchToolbar）：右上角融合交互与垂直居中果冻组
   - 3.4 顶栏（V4Header）与底栏（V4Footer）：主导航精简与规范库文字链接
   - 3.5 全站路由过渡（Route Transitions）：淡入淡出（page-fade-in）与零跳动像素对齐
   - 3.6 目标管理模块（Goals）：全生命周期管理与资产关联
4. [数据存储模型与 LocalStorage 键值契约](#四数据存储模型与-localstorage-键值契约)
5. [后端接入与数据库设计建议（Codex 接入方案）](#五后端接入与数据库设计建议codex-接入方案)
   - 5.1 PostgreSQL 完整数据表结构定义
   - 5.2 RESTful API 路由契约
6. [快捷键体系与核心交互机制](#六快捷键体系与核心交互机制)
7. [本地启动、验证与提交指南](#七本地启动验证与提交指南)

---

## 一、本次未上传 Git 的全部变更与代码实现清单

本次开发周期聚焦于**全站交互体验整合、备忘录布局扩展、标签系统统一化、导航精简以及路由无缝过渡动效**。以下为所有未提交至 Git 的核心修改点明细：

| 变更分类 | 涉及核心文件 | 核心技术变更与实现内容 |
| :--- | :--- | :--- |
| **1. 备忘录双布局切换** | `src/modules/memos/MemosPage.tsx`<br>`src/modules/memos/MemoListItem.tsx` (新)<br>`src/modules/memos/memosStorage.ts`<br>`src/modules/memos/types.ts` | 1. 新增 `MemoListItem.tsx` 列表模式组件，支持高密度横向展示、正文摘录、标签徽章与右侧快捷操作。<br>2. 支持在卡片模式（`card`）与列表模式（`list`）间一键切换。<br>3. 布局模式持久化存储于 `localStorage: workbench_memos_view_mode`。 |
| **2. 通用标签栏组件与交互优化** | `src/components/layout/TagPanel.tsx`<br>`src/modules/memos/MemosPage.tsx`<br>`src/modules/goals/GoalsPage.tsx`<br>`src/App.tsx` | 1. 工作台、备忘录、目标管理全面接入统一的 `TagPanel` 组件。<br>2. 标签栏与上侧导航保持安全呼吸间距（`mt-3 sm:mt-4`）。<br>3. 「展开全部 / 收起」按钮去边框化、纯文字极简风格（`border-none`、`bg-transparent`），始终绝对定位锚定在标签栏边框右上角（`absolute right-3 top-3`）。<br>4. 包含标签计数、标签选中状态、编辑模式下的 CRUD 模态弹窗。 |
| **3. 搜索与悬浮组整合** | `src/components/v4/V4SearchToolbar.tsx`<br>`src/App.tsx` | 1. 展开态全局搜索栏与收起按钮合二为一吸附于顶部右上角，点击输入框即时检索，点击右侧「收起 (ESC)」文案即时折叠，消除多点割裂感。<br>2. 屏幕右侧快捷悬浮按钮组实现「屏幕右侧上下垂直居中」（`fixed right-0 top-1/2 -translate-y-1/2`），鼠标悬停果冻平滑滑出。 |
| **4. 导航栏精简与规范库移入页脚** | `src/components/v4/V4Header.tsx`<br>`src/components/v4/V4Footer.tsx`<br>`src/App.tsx` | 1. 从顶部主导航栏移除「规范库」，聚焦「资源库」「备忘录」「目标管理」三核导航。<br>2. 页面全局底部 `V4Footer` 中增加「规范库」文字下划线链接，点击平滑直达设计规范页面。 |
| **5. 路由淡入淡出与 Tab 零跳动** | `src/App.tsx`<br>`src/index.css`<br>`src/modules/memos/MemosPage.tsx`<br>`src/modules/goals/GoalsPage.tsx` | 1. 在 `App.tsx` 路由分支中，为 `workbench`、`memos`、`goals`、`design-system`、`resource-detail` 容器挂载唯一 `key` 与 `.page-fade-in` 动画。<br>2. `src/index.css` 注入硬件加速纯透明度 `@keyframes pageFadeIn`（200ms cubic-bezier），切换丝滑。<br>3. 工作台、备忘录、目标管理二级吸顶 Tab 栏高度均锁定为 `min-h-[40px]`，解决切换时头部飘逸/跳动问题。 |

---

## 二、工程目录与核心文件拓扑

```
.
├── DESIGN_AND_INTERACTION_SPEC.md   # 全局视觉与交互规范（Neo-Brutalism Tokens、防挤压红线）
├── MEMO_FRONTEND_HANDOVER.md        # 备忘录专属技术交接文档（最新同步）
├── PROJECT_HANDOVER.md              # 【本文档】全局主交接文档
├── package.json                     # 项目依赖与运行脚本
├── vite.config.ts                   # Vite 构建配置
├── tsconfig.json                    # TypeScript 类型配置
├── src/
│   ├── main.tsx                     # 应用程序入口
│   ├── App.tsx                      # 根路由控制器、快捷键总线、模态框管理、路由淡入淡出挂载
│   ├── types.ts                     # 全局通用类型定义
│   ├── index.css                    # Tailwind CSS v4 入口与 pageFadeIn 关键帧定义
│   │
│   ├── modules/
│   │   ├── memos/                   # 【备忘录完整模块】
│   │   │   ├── types.ts             # Memo 数据模型、显示标题与时间格式化
│   │   │   ├── memosStorage.ts      # 备忘录 LocalStorage 存储层（预留后端 API TODO）
│   │   │   ├── MemoQuickInput.tsx   # 快速记录卡片（支持快捷键、添加标题折叠）
│   │   │   ├── MemoCard.tsx         # 卡片模式单个卡片组件
│   │   │   ├── MemoListItem.tsx     # 【新增】列表模式单个列表条目组件
│   │   │   ├── MemoEditorModal.tsx  # 单级大尺寸编辑面板（防抖自动保存 + 显式保存）
│   │   │   ├── MemoDeleteModal.tsx  # 删除二次确认弹窗
│   │   │   ├── MemosPage.tsx        # 备忘录主页面容器（Tab筛选、布局切换、统一TagPanel）
│   │   │   └── index.ts             # 模块统一导出
│   │   │
│   │   └── goals/                   # 【目标管理完整模块】
│   │       ├── types.ts             # Goal 数据模型、状态、优先级类型定义
│   │       ├── goalsStorage.ts      # 目标 LocalStorage 存储层
│   │       ├── GoalCard.tsx         # 目标卡片组件（进度、优先级徽章、关联资产展示）
│   │       ├── GoalFormModal.tsx    # 目标新建与编辑模态弹窗
│   │       ├── GoalCompletionModal.tsx # 目标达成庆祝与复盘笔记模态弹窗
│   │       ├── GoalsPage.tsx        # 目标管理主页面容器
│   │       └── index.ts             # 模块统一导出
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TagPanel.tsx         # 【通用统一标签栏】右上角纯文字无边框展开按钮
│   │   │   └── TagEditModal.tsx     # 标签编辑/创建/重命名模态弹窗
│   │   ├── v4/
│   │   │   ├── WorkbenchLogo.tsx    # 官方工坊矢量 Logo 组件
│   │   │   ├── V4Header.tsx         # 顶栏三核导航、搜索栏触发、编辑模式/身份切换
│   │   │   ├── V4Footer.tsx         # 底部状态栏、快捷键提示、规范库直达文字链接
│   │   │   ├── V4SearchToolbar.tsx  # 右上角融合搜索栏 + 屏幕右侧垂直居中悬浮快捷组
│   │   │   ├── V4CategoryFilter.tsx # 工作台分类筛选 Tab
│   │   │   ├── V4PinnedSection.tsx  # 工作台精选置顶资产推荐区
│   │   │   ├── ResourceDetailPage.tsx # 资源资产完整详情大页面
│   │   │   ├── DetailModal.tsx      # 资源资产快速查看弹窗
│   │   │   └── AdminAuthModal.tsx   # 管理员密码认证模态框
│   │   ├── HomeGrid.tsx             # 工作台 6 列 Neo-Brutalism 网格画布
│   │   └── DesignSystemPage.tsx     # 视觉规范库与 Tokens 展示页面
│   │
│   ├── data/
│   │   └── seedData.ts              # 工作台预置初始化种子数据
│   └── utils/
│       └── tagManager.ts            # 标签颜色哈希与统计计算辅助库
```

---

## 三、核心业务模块与最新架构实现

### 3.1 备忘录模块（Memos）：卡片/列表双模式
- **定位**：捕捉瞬时灵感、闪念记录，3~5 秒内盲打盲记，无冗余字段。
- **双布局模式**：
  - **卡片模式 (`card`)**：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`，网格卡片展示，正文最多截取 8 行，底部流式标签，置顶项带 📌 黄色高亮徽章。
  - **列表模式 (`list`)**：`MemoListItem.tsx` 呈现，横向通栏结构，行高收敛，左侧为标题与首行摘要、右侧集中展示时间戳与置顶/归档/删除操作面板，适合高效大批量浏览。
- **单级编辑与自动保存**：`MemoEditorModal.tsx` 点击即编辑，内置 600ms 防抖自动落盘与显式「保存 (⌘+Enter)」双保险。
- **标题回退策略**：用户未填写标题时，前端自动截取正文首行 40 字符展示，无需后端参与。

### 3.2 通用标签栏（TagPanel）：右上角纯文字无边框展开
- **全站统一**：工作台首页、备忘录页、目标管理页全部统一采用 `TagPanel`。
- **与上侧导航呼吸间距**：外容器采用 `mt-3 sm:mt-4`，彻底消除贴边压迫感。
- **右上角纯文字展开按钮**：
  - 样式使用 `border-none`、`bg-transparent`，仅保留文字与上下箭头图标（`ChevronDown` / `ChevronUp`）。
  - 使用 `absolute right-3 top-3` 永久锚定在容器右上角，无论标签有多少均不被推挤或折行。
- **编辑模式 CRUD 支持**：在拥有者编辑模式下，支持新建标签、重命名标签与删除标签，自动联动全量资源的标签更新。

### 3.3 搜索工具栏与悬浮组（V4SearchToolbar）：右上角融合交互
- **右上角融合型搜索栏**：
  - 展开态下采用 `flex justify-end` 吸附在页面顶部右侧。
  - 搜索与收起结合为一体：点击搜索输入框直接键盘输入；内部右侧嵌入「收起 (ESC)」文案按钮，点击文案或按键盘 ESC 键即时折叠，移除了原先分散在不同地点的交互割裂。
- **屏幕右侧果冻悬浮工具组**：
  - 定位更新为 `fixed right-0 top-1/2 -translate-y-1/2`，在屏幕右边缘上下垂直居中。
  - 鼠标移入时果冻弹性滑出，提供「全局搜索」与「写备忘录」快捷入口。

### 3.4 顶栏（V4Header）与底栏（V4Footer）：主导航精简
- **顶栏三核导航**：移除原「规范库」Tab，导航项精简为「资源库」、「备忘录」、「目标管理」。
- **规范库底部化**：在全局底栏 `V4Footer` 的 Branding 区域新增下划线文字链接：`规范库`，点击直达 `DesignSystemPage`，规范库内可随时通过顶部导航或返回按钮切回工作台。

### 3.5 全站路由过渡（Route Transitions）：淡入淡出动效与零跳动
- **路由动效**：在 `App.tsx` 的路由切换处，各视图容器 `<main>` 均显式声明唯一 `key`（如 `key="workbench"`、`key="memos"`、`key="goals"`）并绑定 `.page-fade-in` 类。
- **CSS 关键帧**：
  ```css
  @keyframes pageFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .page-fade-in {
    animation: pageFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    will-change: opacity;
  }
  ```
- **头部 Tab 零跳动（Zero-Drift）规范**：
  - 工作台、备忘录与目标管理三个页面的二级吸顶容器均统一锁定为 `min-h-[40px]`。
  - 按钮规格统一为 `h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717]`。
  - 视图切换时，分类 Tab 绝对吸附在完全相同的水平基准线上，无任何纵向偏移与飘逸感。

### 3.6 目标管理模块（Goals）
- **核心定位**：管理阶段性任务与目标，支持 P0/P1/P2 优先级、未完成/已达成状态筛选。
- **深度关联工作台**：创建目标时可关联工作台现有资产链接（URL/本地路径）。
- **复盘机制**：勾选目标完成时唤起 `GoalCompletionModal`，可记录结构化复盘心得（Review Notes）。

---

## 四、数据存储模型与 LocalStorage 键值契约

当前前端采用本地持久化存储层（支持离线工作与即时操作），已全量标注后端 API 替换锚点：

| LocalStorage 键名 | 存储数据类型 | 说明与用途 |
| :--- | :--- | :--- |
| `workbench_memos_v1` | `Memo[]` | 备忘录实体列表（标题、正文、标签、置顶、归档） |
| `workbench_memos_view_mode` | `'card' \| 'list'` | 备忘录展示布局状态（默认 `'card'`） |
| `workbench_goals_v1` | `Goal[]` | 目标管理实体列表（优先级、状态、复盘笔记、关联资产） |
| `workbench_custom_tags_v1`| `string[]` | 用户自定义全局标签池 |
| `workbench_objects_v4` | `WorkbenchObject[]` | 工作台资源卡片列表（包含尺寸、网格坐标、置顶、分类） |
| `workbench_identity` | `UserIdentity` | 用户身份状态（`owner` 拥有者 / `guest` 访客） |

---

## 五、后端接入与数据库设计建议（Codex 接入方案）

后端接入（如 Node.js / Go / Python 或 Supabase / Cloud SQL / PGlite）时，建议采用以下标准 SQL Schema 与 RESTful API 契约：

### 5.1 PostgreSQL 完整数据表结构定义

```sql
-- 1. 备忘录数据表
CREATE TABLE IF NOT EXISTS memos (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memos_pinned_updated ON memos (pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_archived ON memos (archived);
CREATE INDEX IF NOT EXISTS idx_memos_tags ON memos USING GIN (tags);

-- 2. 目标管理数据表
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'P1',       -- P0, P1, P2
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, paused
  tags TEXT[] DEFAULT '{}',
  linked_resource_ids TEXT[] DEFAULT '{}',
  review_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_status ON goals (status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals (priority);

-- 3. 工作台资源资产表
CREATE TABLE IF NOT EXISTS workbench_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,                     -- project, tool, web, learning, reference
  url TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  size TEXT NOT NULL DEFAULT 'M',             -- S, M, L, Banner
  grid_position JSONB,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.2 RESTful API 路由契约

| 方法 | 端点 (Endpoint) | 功能说明 | 请求参数 / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/memos` | 获取备忘列表 | Query: `archived`, `pinned`, `tag`, `q` |
| `POST`| `/api/memos` | 创建新备忘 | Body: `{ title?, content, tags?, pinned? }` |
| `PUT` | `/api/memos/:id` | 全量更新备忘 | Body: `{ title?, content, tags?, pinned?, archived? }` |
| `PATCH`| `/api/memos/:id/pin` | 置顶/取消置顶 | Body: `{ pinned: boolean }` |
| `PATCH`| `/api/memos/:id/archive` | 归档/取消归档 | Body: `{ archived: boolean }` |
| `DELETE`| `/api/memos/:id` | 删除备忘 | - |
| `GET` | `/api/goals` | 获取目标列表 | Query: `status`, `priority`, `tag`, `q` |
| `POST`| `/api/goals` | 创建目标 | Body: `{ title, description?, priority, tags?, linkedResourceIds? }` |
| `PUT` | `/api/goals/:id` | 更新目标信息 | Body: `{ title, description, priority, tags... }` |
| `PATCH`| `/api/goals/:id/complete` | 达成目标并提交复盘 | Body: `{ reviewNotes: string, completedAt: string }` |
| `DELETE`| `/api/goals/:id` | 删除目标 | - |

---

## 六、快捷键体系与核心交互机制

全站已在 `App.tsx` 与各模块中配置完整键盘监听：

- **`⌘K` / `Ctrl + K`**：快速聚焦/展开顶部右上角全局搜索栏。
- **`ESC`**：
  - 当搜索栏处于展开状态时，一键收起折叠并清空输入；
  - 当任何弹窗（新建资源、编辑备忘、目标表单、密码认证）打开时，一键关闭弹窗。
- **`Tab`**：在工作台分类间顺时针轮播切换（全部 → 项目 → 工具 → 网页 → 学习 → 参考）。
- **`⌘ + Enter` / `Ctrl + Enter`**：
  - 在快速记备忘（MemoQuickInput）中，直接提交创建；
  - 在编辑备忘大弹窗（MemoEditorModal）中，直接保存并关闭；
  - 在目标管理创建表单中，直接保存。

---

## 七、本地启动、验证与提交指南

### 1. 验证命令
```bash
# 1. TypeScript 静态类型检查
npm run lint

# 2. Vite 生产构建测试
npm run build

# 3. 启动开发服务器
npm run dev
```

### 2. Git 提交建议分支与 Commit Message 格式
建议将本次未提交的修改拆分为以下结构清晰的 Commit：

```bash
# Commit 1: 备忘录双布局切换支持
git add src/modules/memos/MemoListItem.tsx src/modules/memos/MemosPage.tsx src/modules/memos/memosStorage.ts src/modules/memos/types.ts
git commit -m "feat(memos): add card/list view mode toggle with MemoListItem and layout persistence"

# Commit 2: 标签栏组件统一与右上角无边框展开改造
git add src/components/layout/TagPanel.tsx src/modules/goals/GoalsPage.tsx src/App.tsx
git commit -m "refactor(tags): unify TagPanel across all pages with borderless top-right expand action"

# Commit 3: 搜索工具栏右上角融合与悬浮组居中
git add src/components/v4/V4SearchToolbar.tsx src/components/v4/V4Header.tsx src/components/v4/V4Footer.tsx
git commit -m "feat(layout): merge search-collapse toolbar in top-right and vertically center quick-tools dock"

# Commit 4: 规范库移至页脚与路由淡入淡出动画
git add src/App.tsx src/index.css
git commit -m "feat(router): add smooth page-fade-in transition and eliminate header tab drift"

# Commit 5: 技术交付与交接文档更新
git add PROJECT_HANDOVER.md MEMO_FRONTEND_HANDOVER.md
git commit -m "docs: add comprehensive project handover document and sync memo specs"
```

---
> 交付完成：本工程已完成所有核心业务功能开发与细节规整，类型检查与构建 0 错误，可直接进行 Git 提交或无缝交接给后续工程师。
