import { WorkbenchObject, DetailBlock, SecondaryEntry } from '../types';
import { detectProtocol } from './resourceAdapter';

/**
 * Generates sensible default detail content blocks for any resource
 * when no custom blocks have been configured yet.
 */
export function getDefaultDetailBlocks(obj: WorkbenchObject): DetailBlock[] {
  const isLocal = detectProtocol(obj.targetUrl) === 'localPath';
  const isGithub = detectProtocol(obj.targetUrl) === 'github';
  const cleanTitle = obj.title || '资源档案';

  switch (obj.type) {
    case 'project':
      return [
        {
          id: 'blk-p-1',
          type: 'heading',
          content: '## 项目背景与核心定位',
          meta: { level: 2 },
        },
        {
          id: 'blk-p-2',
          type: 'text',
          content:
            obj.summary ||
            `${cleanTitle} 是工作台中登记的关键工程项目，为本地开发工作流与数字资产提供标准化服务。`,
        },
        {
          id: 'blk-p-3',
          type: 'heading',
          content: '## 本地开发与使用方式',
          meta: { level: 2 },
        },
        {
          id: 'blk-p-4',
          type: 'list',
          content: `1. 检出或打开本地工作空间：${obj.targetUrl}\n2. 安装项目所需依赖模块：npm install\n3. 启动本地开发服务热重载：npm run dev\n4. 访问本地端口或直达生产验证环境`,
        },
        {
          id: 'blk-p-5',
          type: 'heading',
          content: '## 技术方案与快捷命令',
          meta: { level: 2 },
        },
        {
          id: 'blk-p-6',
          type: 'code',
          content: isLocal
            ? `cd ${obj.targetUrl}\nnpm run dev\n# 单元测试与类型校验\nnpm run lint && npm test`
            : `git clone ${obj.targetUrl}.git\ncd ${cleanTitle.toLowerCase().replace(/\s+/g, '-')}\nnpm install\nnpm run dev`,
          meta: { language: 'bash' },
        },
        {
          id: 'blk-p-7',
          type: 'heading',
          content: '## 长期笔记与经验记录',
          meta: { level: 2 },
        },
        {
          id: 'blk-p-8',
          type: 'quote',
          content: '优先保持核心模块轻量化，遵循 Neo-Brutalism 硬直观审美与本地零延迟调度原则。',
        },
      ];

    case 'tool':
      return [
        {
          id: 'blk-t-1',
          type: 'heading',
          content: '## 工具简介与使用场景',
          meta: { level: 2 },
        },
        {
          id: 'blk-t-2',
          type: 'text',
          content:
            obj.summary ||
            `${cleanTitle} 是个人日常效率工作流中的高频实用工具，用于提升开发、编译或本地调试体验。`,
        },
        {
          id: 'blk-t-3',
          type: 'heading',
          content: '## 安装方式与环境依赖',
          meta: { level: 2 },
        },
        {
          id: 'blk-t-4',
          type: 'code',
          content: obj.targetUrl.includes('brew')
            ? `brew install ${cleanTitle.toLowerCase().replace(/\s+/g, '-')}`
            : obj.targetUrl.includes('docker')
            ? `docker pull ${obj.targetUrl}`
            : `npm install -g ${cleanTitle.toLowerCase().replace(/\s+/g, '-')}`,
          meta: { language: 'bash' },
        },
        {
          id: 'blk-t-5',
          type: 'heading',
          content: '## 核心命令与配置备忘',
          meta: { level: 2 },
        },
        {
          id: 'blk-t-6',
          type: 'list',
          content: `• 启动入口：${obj.targetUrl}\n• 常用调试命令：--verbose / --debug\n• 配置文件路径：~/.config/${cleanTitle.toLowerCase().replace(/\s+/g, '-')}/config.json`,
        },
      ];

    case 'website':
      return [
        {
          id: 'blk-w-1',
          type: 'heading',
          content: '## 网站定位与常用用途',
          meta: { level: 2 },
        },
        {
          id: 'blk-w-2',
          type: 'text',
          content:
            obj.summary ||
            `${cleanTitle} 是一项经常查阅或使用的网络服务与知识平台，提供信息获取与在线协作支持。`,
        },
        {
          id: 'blk-w-3',
          type: 'heading',
          content: '## 访问入口与直达地址',
          meta: { level: 2 },
        },
        {
          id: 'blk-w-4',
          type: 'list',
          content: `• 官方主站：${obj.targetUrl}\n• 认证方式：OAuth 授权 / 浏览器 Cookies 保持\n• 加密通道：HTTPS 安全传输`,
        },
        {
          id: 'blk-w-5',
          type: 'heading',
          content: '## 个人使用记录与备忘',
          meta: { level: 2 },
        },
        {
          id: 'blk-w-6',
          type: 'quote',
          content: '标记为高频资源，已纳入个人工作台主索引体系。',
        },
      ];

    case 'repository':
      return [
        {
          id: 'blk-r-1',
          type: 'heading',
          content: '## 代码仓库概览',
          meta: { level: 2 },
        },
        {
          id: 'blk-r-2',
          type: 'text',
          content:
            obj.summary ||
            `${cleanTitle} 维护着该模块的核心源码、CI/CD 构建脚本以及相关版本发布分支。`,
        },
        {
          id: 'blk-r-3',
          type: 'heading',
          content: '## Git 克隆与贡献指引',
          meta: { level: 2 },
        },
        {
          id: 'blk-r-4',
          type: 'code',
          content: `git clone ${obj.targetUrl.replace(/\/$/, '')}.git\ncd ${cleanTitle.toLowerCase().replace(/\s+/g, '-')}\ngit checkout -b feature/my-update`,
          meta: { language: 'bash' },
        },
        {
          id: 'blk-r-5',
          type: 'heading',
          content: '## 常用分支与议题',
          meta: { level: 2 },
        },
        {
          id: 'blk-r-6',
          type: 'list',
          content: `• 主干分支：main / master\n• Issues 讨论区：${obj.targetUrl}/issues\n• 自动化 Action 状态：在线构建正常`,
        },
      ];

    default:
      return [
        {
          id: 'blk-g-1',
          type: 'heading',
          content: '## 资源定位与核心功能',
          meta: { level: 2 },
        },
        {
          id: 'blk-g-2',
          type: 'text',
          content:
            obj.summary ||
            `${cleanTitle} 记录于个人工作台数字档案库，作为日常查阅与快速启动的枢纽。`,
        },
        {
          id: 'blk-g-3',
          type: 'heading',
          content: '## 使用步骤与关键入口',
          meta: { level: 2 },
        },
        {
          id: 'blk-g-4',
          type: 'list',
          content: `• 主调度入口：${obj.targetUrl}\n• 访问分类：${obj.type}\n• 运行就绪状态：${obj.status === 'ok' ? '正常' : '待复核'}`,
        },
        {
          id: 'blk-g-5',
          type: 'heading',
          content: '## 个人笔记与操作备忘',
          meta: { level: 2 },
        },
        {
          id: 'blk-g-6',
          type: 'quote',
          content: obj.notes || '由个人工作台档案模块统一管理，支持浏览器即时访问与本地路径映射。',
        },
      ];
  }
}

/**
 * Returns existing detail blocks or falls back to generated defaults.
 */
export function getEffectiveDetailBlocks(obj: WorkbenchObject): DetailBlock[] {
  if (obj.detailBlocks && Array.isArray(obj.detailBlocks) && obj.detailBlocks.length > 0) {
    return obj.detailBlocks;
  }
  return getDefaultDetailBlocks(obj);
}

/**
 * Generates secondary entries based on resource characteristics if not explicitly defined.
 */
export function getEffectiveSecondaryEntries(obj: WorkbenchObject): SecondaryEntry[] {
  if (obj.secondaryEntries && Array.isArray(obj.secondaryEntries) && obj.secondaryEntries.length > 0) {
    return obj.secondaryEntries;
  }

  const entries: SecondaryEntry[] = [];
  const protocol = detectProtocol(obj.targetUrl);

  if (protocol === 'localPath') {
    entries.push({
      id: `${obj.id}-sec-term`,
      label: '终端快速跳转',
      target: `cd ${obj.targetUrl}`,
      protocol: 'other',
    });
    entries.push({
      id: `${obj.id}-sec-vscode`,
      label: 'VS Code 编辑器打开',
      target: `code ${obj.targetUrl}`,
      protocol: 'other',
    });
  } else if (protocol === 'github') {
    entries.push({
      id: `${obj.id}-sec-gitclone`,
      label: 'Git Clone 镜像命令',
      target: `git clone ${obj.targetUrl.replace(/\/$/, '')}.git`,
      protocol: 'other',
    });
    entries.push({
      id: `${obj.id}-sec-issues`,
      label: 'GitHub Issues 跟踪',
      target: `${obj.targetUrl.replace(/\/$/, '')}/issues`,
      protocol: 'url',
    });
  } else if (protocol === 'url') {
    entries.push({
      id: `${obj.id}-sec-share`,
      label: '一键分享直达链接',
      target: obj.targetUrl,
      protocol: 'url',
    });
    if (obj.targetUrl.includes(':')) {
      entries.push({
        id: `${obj.id}-sec-curl`,
        label: 'HTTP 探测端点',
        target: `curl -I ${obj.targetUrl}`,
        protocol: 'other',
      });
    }
  }

  return entries;
}
