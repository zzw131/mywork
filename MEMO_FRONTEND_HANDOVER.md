# Personal Workbench · 备忘录（Memos）前端实现与后端交接文档

> **文档性质**：前端设计与工程实现交付规范（交给 Codex 接入后端与数据库使用）  
> **模块名称**：备忘录（Memos）  
> **设计系统**：Neo-Brutalism V4  
> **交付状态**：前端功能完整实现，零控制台报错，编译/Lint 全部通过，预留完整数据接口与 TODO 锚点。  
> **最新更新**：支持卡片/列表（Card/List）双布局无缝切换、列表模式专用组件 `MemoListItem`、通用 `TagPanel` 标签栏同步、全站路由淡入淡出动效。

---

## 一、模块定位与业务边界

| 模块 | 一级定位 | 核心交互与边界约束 |
| :--- | :--- | :--- |
| **工作台 (Workbench)** | 我的资源在哪里、打开什么 | 数字资产入口、URL/本地路径协议、S/M/L/Banner 尺寸、拖拽排版 |
| **备忘录 (Memos)** | **我刚想到什么、快速记录什么** | **极速闪念捕捉（3~5秒内完成）、卡片/列表双布局、无强制标题、标签索引、置顶/归档、全文检索。严禁混入项目进度、截止日、URL 打开等属性** |
| **目标管理 (Goals)** | 我要完成什么 | P0/P1 优先级、进行中/达成打勾、复盘笔记、关联工作台资产 |
| **规范库 (Design System)** | 我应该遵守什么固定规则 | 全局 Tokens、排版准则、交互说明（已移至页脚文字链接） |

**主顶栏固定三项导航**：
`工作台` → `备忘录` → `目标管理`（「规范库」已规范移至页面底部 Footer 链接）

---

## 二、前端工程文件拓扑

```
src/
├── modules/
│   └── memos/
│       ├── types.ts              # 核心数据模型、显示标题与时间格式化工具函数
│       ├── memosStorage.ts       # 本地临时状态层（已标注 // TODO: replace with Memo API，支持布局持久化）
│       ├── MemoQuickInput.tsx    # 核心快速记录卡片（支持快捷保存 Ctrl/Cmd+Enter，折叠标题）
│       ├── MemoCard.tsx          # 备忘录卡片模式（Neo-Brutalism 网格卡片，置顶/归档/删除操作）
│       ├── MemoListItem.tsx      # 【新增】备忘录列表模式（横向紧凑条目，兼具高信息密度与快速操作）
│       ├── MemoEditorModal.tsx   # 居中大尺寸编辑面板（防抖自动保存 + 显式保存）
│       ├── MemoDeleteModal.tsx   # 删除二次确认弹窗
│       ├── MemosPage.tsx         # 备忘录完整页面（Banner、筛选Tab、布局切换器、统一TagPanel、网格/列表展示）
│       └── index.ts              # 模块导出统一出口
├── components/
│   ├── layout/
│   │   ├── TagPanel.tsx          # 全站统一通用标签栏（右上角无边框纯文字展开/收起、常用标签与计数）
│   │   └── TagEditModal.tsx      # 标签编辑/新建/重命名/删除弹窗
│   └── v4/
│       ├── V4Header.tsx          # 顶栏导航组件（工作台/备忘录/目标管理，规范库移至Footer）
│       ├── V4SearchToolbar.tsx   # 右上角融合型搜索栏（点击文案收起，点击搜索栏搜索）+ 屏幕右侧上下居中悬浮组
│       └── V4Footer.tsx          # 全局页脚（包含规范库直达文字链接）
└── App.tsx                       # SPA 路由挂载、路由淡入淡出（page-fade-in）、全局搜索语义响应、快捷键监听
```

---

## 三、前端数据模型（TypeScript）

文件位置：`src/modules/memos/types.ts`

```typescript
export interface Memo {
  id: string;               // 唯一标识符，后端推荐采用 UUID 或 cuid
  title?: string;           // 标题（可选）。前端展示时若为空，自动截取正文首行
  content: string;          // 正文内容（必填）
  tags: string[];           // 标签数组，例如 ["工作台", "产品"]
  pinned: boolean;          // 是否置顶（默认 false）
  archived: boolean;        // 是否已归档（默认 false，归档后默认列表不可见）
  createdAt: string;        // ISO 8601 创建时间戳
  updatedAt: string;        // ISO 8601 最后更新时间戳
}

export type MemoFilterTab = 'all' | 'pinned' | 'recent';

// 【最新增补】布局模式：卡片网格 vs 紧凑列表
export type MemoViewMode = 'card' | 'list';
```

> **注意**：第一版严格禁止在 Memo 中引入 `priority`, `deadline`, `completed`, `progress`, `status`，以保持轻量快速。

---

## 四、最新新增与交互优化特性（本次未上传 Git 重点）

### 1. 备忘录双布局切换（Card / List View Mode）
- **布局切换控制器**：位于备忘录二级吸顶操作栏右侧，采用 Neo-Brutalism 硬阴影药丸组。
- **卡片模式（`viewMode: 'card'`）**：
  - 响应式自适应网格 `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`。
  - 大尺寸展示正文前 8 行，完整标签云流式排版。
- **列表模式（`viewMode: 'list'`）**：
  - 由 `MemoListItem.tsx` 呈现，横向通栏单条呈现（`flex items-start justify-between`）。
  - 左侧为主标题、首行摘录预览及紧凑型标签徽章；右侧为时间戳、置顶钉子标识与快捷操作菜单。
  - 信息密度提高 300%，特别适合长列表快速定位与管理。
- **本地记忆**：切换状态自动存入 `localStorage('workbench_memos_view_mode')`，刷新不丢失。

### 2. 全站统一标签栏（TagPanel）与右上角无边框展开按钮
- 备忘录页已全面接入 `src/components/layout/TagPanel.tsx`，与工作台、目标管理视觉与交互 100% 保持一致。
- 标签栏与上侧导航保持安全呼吸间距（`mt-3 sm:mt-4`）。
- **展开/收起按钮无边框纯文字**：彻底去除原先内嵌在标签流里的厚重黑框，使用 `border-none`、`bg-transparent`，始终绝对锚定在标签栏边框的右上角（`absolute right-3 top-3`）。

### 3. 右上角融合搜索栏与屏幕右侧果冻悬浮组
- **右上角搜索与收起结合**：展开态下的全局搜索栏与收起按钮合二为一吸附于顶部右上角，点击输入框即时搜索，点击内部右侧「收起 (ESC)」文案即时折叠，消除了以往多个交互地点的割裂感。
- **悬浮组屏幕右侧上下居中**：屏幕右侧快捷入口（搜索 / 写备忘录）定位样式更新为 `fixed right-0 top-1/2 -translate-y-1/2`，鼠标悬停时平滑滑出。

### 4. 路由切换淡入淡出（Smooth Page Fade-In）
- 在 `App.tsx` 中为备忘录页面容器挂载了 `key="memos"` 与 `.page-fade-in` 动画类。
- 在 `src/index.css` 中注入了高性能、纯透明度的 `@keyframes pageFadeIn`（200ms cubic-bezier），切换页面丝滑无跳跃。
- 头部 Tab 切换行（全部 / 置顶 / 最近）与二级容器高度强制锚定 `min-h-[40px]`，与工作台、目标管理完全共享基准线，彻底消除飘逸/跳跃感。

---

## 五、推荐后端数据库设计（供 Codex 参考）

### PostgreSQL / PGlite 表结构建议

```sql
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

-- 提升默认列表与置顶排序性能
CREATE INDEX IF NOT EXISTS idx_memos_pinned_updated 
  ON memos (pinned DESC, updated_at DESC);

-- 提升归档过滤查询
CREATE INDEX IF NOT EXISTS idx_memos_archived 
  ON memos (archived);

-- 标签查询支持 (PostgreSQL GIN 索引)
CREATE INDEX IF NOT EXISTS idx_memos_tags 
  ON memos USING GIN (tags);

-- 全文检索支持
CREATE INDEX IF NOT EXISTS idx_memos_fts 
  ON memos USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || content));
```

---

## 六、推荐 RESTful API 契约（供 Codex 接入）

前端在 `src/modules/memos/memosStorage.ts` 中已为以下端点预留 TODO 锚点：

### 1. 获取备忘列表
- **Endpoint**: `GET /api/memos`
- **Query Params**:
  - `archived`: boolean（默认 `false`）
  - `pinned`: boolean（可选）
  - `tag`: string（可选，过滤单个标签）
  - `q`: string（可选，搜索标题、正文、标签）
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "memo-001",
      "title": "Workbench 资产详情卡片交互细节优化",
      "content": "首页全局搜索增加快捷拼音首字母检索...",
      "tags": ["工作台", "产品", "设计"],
      "pinned": true,
      "archived": false,
      "createdAt": "2026-09-29T00:00:00.000Z",
      "updatedAt": "2026-09-29T02:30:00.000Z"
    }
  ]
  ```

### 2. 快速创建备忘
- **Endpoint**: `POST /api/memos`
- **Request Body**:
  ```json
  {
    "title": "可选标题",
    "content": "我刚想到的一个点子...",
    "tags": ["产品", "想法"],
    "pinned": false
  }
  ```
- **Response**: `201 Created` 返回完整的 `Memo` 对象。

### 3. 获取单条备忘详情
- **Endpoint**: `GET /api/memos/:id`
- **Response**: `200 OK`

### 4. 编辑更新备忘（正文/标题/标签）
- **Endpoint**: `PUT /api/memos/:id` 或 `PATCH /api/memos/:id`
- **Request Body**:
  ```json
  {
    "title": "更新后的标题",
    "content": "更新后的正文内容...",
    "tags": ["更新后的标签"]
  }
  ```
- **Response**: `200 OK`

### 5. 快速置顶 / 取消置顶
- **Endpoint**: `PATCH /api/memos/:id/pin`
- **Request Body**: `{ "pinned": true }`
- **Response**: `200 OK`

### 6. 归档 / 取消归档
- **Endpoint**: `PATCH /api/memos/:id/archive`
- **Request Body**: `{ "archived": true }`
- **Response**: `200 OK`

### 7. 删除备忘
- **Endpoint**: `DELETE /api/memos/:id`
- **Response**: `204 No Content` 或 `{ "success": true }`

---

## 七、Codex 接入步骤（How to Wire Up）

1. **替换存储层**：打开 `src/modules/memos/memosStorage.ts`，搜索 `// TODO: replace with Memo API`。
2. **将现有的 LocalStorage 读写方法改造为 fetch/axios 调用**：
   - 将 `loadMemos()` 替换为 `async function fetchMemos()` 并接入 React Query / SWR 或组件内 useEffect。
   - 将 `createMemo()`、`updateMemo()`、`deleteMemo()` 改为异步请求对应 API。
3. **数据库迁移**：执行上述第五节的 SQL 语句以完成数据库初始化。
