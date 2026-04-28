# AI 漫画创作平台 🎨

一个基于 React + TypeScript 的纯前端 AI 漫画创作与分享平台，支持模板创作、弹幕互动、接龙续写、每周挑战等社交功能。

## ✨ 核心功能

### 🎭 三种创作模式
- **模板创作**：5 个预设模板，填空即可生成漫画（零门槛）
- **一次性生成**：输入故事概述，AI 自动生成完整漫画
- **分镜式编辑**：专业模式，逐页编辑 prompt 和画面

### 💬 社交互动
- **弹幕评论**：看漫画时发送实时飞行弹幕
- **接龙续写**：基于他人作品继续创作后续章节
- **每周挑战**：参与主题创作挑战，投票评选优秀作品
- **点赞 & 评论**：作品级互动功能

### 💰 商业化支持
- **付费阅读**：设置免费试读页数 + 付费解锁
- **创作者收益**：收益面板、收入记录统计
- **信用点系统**：AI 生成消耗信用点

### 🔐 管理后台
- **多管理员审核**：内容审核、用户管理
- **权限控制**：管理员/创作者/普通用户角色分离
- **作品审核流程**：待审核/已通过/已驳回状态管理

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **UI 组件库**：Ant Design 5
- **状态管理**：Zustand
- **路由**：React Router 6
- **数据持久化**：localStorage（纯前端方案）

## 📦 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+

### 安装依赖
```bash
cd manga-website
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看项目

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
manga-website/
├── src/
│   ├── components/        # 通用组件
│   │   ├── AppLayout.tsx         # 应用布局
│   │   ├── DanmakuOverlay.tsx    # 弹幕组件
│   │   ├── CommentSection.tsx    # 评论区
│   │   └── ...
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx          # 首页
│   │   ├── CreatePage.tsx        # 创作页
│   │   ├── MangaViewerPage.tsx   # 阅读器
│   │   ├── ChallengePage.tsx     # 每周挑战
│   │   └── ...
│   ├── stores/            # Zustand 状态管理
│   │   ├── mangaStore.ts         # 漫画数据
│   │   ├── authStore.ts          # 认证状态
│   │   └── ...
│   ├── mock/              # Mock 数据层
│   │   ├── manga.ts              # 漫画数据
│   │   ├── danmaku.ts            # 弹幕数据
│   │   ├── chains.ts             # 接龙数据
│   │   └── ...
│   ├── data/              # 静态数据
│   │   └── mangaTemplates.ts     # 创作模板
│   └── types/             # TypeScript 类型定义
├── .gitignore
├── package.json
└── vite.config.ts
```

## 🎯 使用指南

### 1. 模板创作（推荐新手）
1. 进入创作页面，默认显示"模板创作"标签
2. 选择一个故事模板（校园恋爱/奇幻冒险/日常搞笑等）
3. 填写 3-4 个字段（角色名、场景、情节等）
4. 点击"一键生成漫画"
5. 预览并设置付费选项（可选）
6. 发布作品

### 2. 观看漫画 & 发弹幕
1. 在首页点击任意漫画封面
2. 进入阅读器，底部有弹幕输入框
3. 输入内容后按回车或点击发送
4. 点击"弹幕"按钮可开关弹幕

### 3. 参与每周挑战
1. 点击侧边栏"🔥 每周挑战"
2. 查看当前挑战主题
3. 点击"立即参与"创作作品
4. 为其他参赛作品投票

### 4. 接龙续写
1. 在阅读器工具栏点击"接龙"
2. 查看该作品的接龙列表
3. （功能开发中）点击"开始接龙"继续创作

## 🔧 配置说明

### VS Code 设置
项目包含 `.vscode/settings.json`，已优化 Git 行为：
- 禁用自动刷新（避免卡顿）
- 禁用智能提交
- 禁用自动 fetch

### Git 配置
- 分支名称：`master`
- 忽略文件：`node_modules/`, `dist/`, `.vscode/*`（保留 `settings.json`）

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 组件使用函数式 + Hooks
- 使用 Ant Design 组件库保持一致性

### 状态管理
- 全局状态使用 Zustand
- 临时状态使用 useState
- Mock 数据层与 UI 分离

### 数据持久化
- 所有数据存储在 localStorage
- 纯前端方案，无需后端
- 键名规范：`{feature}_records`

## 🚀 未来规划

- [ ] 接入真实 AI 绘图 API（如 Stable Diffusion、DALL-E）
- [ ] 后端服务集成（用户认证、数据存储）
- [ ] 图片上传与 CDN 存储
- [ ] 实时聊天室
- [ ] 创作者排行榜
- [ ] 移动端 APP（React Native）

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受创作的乐趣！** 🎨✨
