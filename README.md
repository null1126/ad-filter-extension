# 🚫 搜索广告过滤器

一个强大的浏览器扩展，用于过滤搜索引擎结果中的广告，提供纯净的搜索体验。

## ✨ 功能特性

- 🎯 **智能过滤**：自动识别并过滤搜索结果中的广告
- 🔄 **实时检测**：使用 MutationObserver 监听 DOM 变化，动态过滤新插入的广告
- 📊 **统计功能**：实时显示已过滤的广告数量
- 🎛️ **开关控制**：支持一键启用/禁用广告过滤
- 💾 **状态持久化**：过滤状态自动保存，重新打开浏览器后依然有效
- ⚡ **性能优化**：CSS 预隐藏 + JavaScript 动态过滤，避免 DOM 闪烁

## 🎯 当前支持

- ✅ **百度搜索**：支持过滤多种类型的百度广告

## 🔮 计划支持

- 🔜 Google 搜索
- 🔜 Bing 搜索
- 🔜 其他搜索引擎...

## 📦 安装

### 从源码构建

1. **克隆仓库**

   ```bash
   git clone https://github.com/null1126/ad-filter-extension.git
   cd ad-filter-extension
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **开发模式运行**

   ```bash
   # Chrome/Edge
   pnpm dev

   # Firefox
   pnpm dev:firefox
   ```

4. **构建生产版本**

   ```bash
   # Chrome/Edge
   pnpm build

   # Firefox
   pnpm build:firefox
   ```

5. **打包扩展**

   ```bash
   # Chrome/Edge
   pnpm zip

   # Firefox
   pnpm zip:firefox
   ```

### 加载到浏览器

1. 打开浏览器扩展管理页面
   - Chrome/Edge: `chrome://extensions/`
   - Firefox: `about:addons`

2. 启用"开发者模式"

3. 点击"加载已解压的扩展程序"

4. 选择项目的 `.output/chrome-mv3` 或 `.output/firefox-mv2` 目录

## 🚀 使用方法

1. 安装扩展后，访问百度搜索页面

2. 点击浏览器工具栏中的扩展图标

3. 在弹窗中：
   - 使用开关启用/禁用广告过滤
   - 查看已过滤的广告数量

4. 广告会自动被过滤，无需额外操作

## 🛠️ 技术栈

- **框架**: [WXT](https://wxt.dev/) - 现代化的浏览器扩展开发框架
- **UI**: React 19 + TypeScript
- **样式**: SCSS
- **代码规范**: ESLint + Prettier + Stylelint
- **Git 规范**: Commitizen + Husky + Commitlint

## 📁 项目结构

```
├── entrypoints/          # 入口文件
│   ├── background.ts    # 后台脚本（Service Worker）
│   ├── content.ts        # 内容脚本（广告过滤逻辑）
│   └── popup/            # 弹窗界面
│       ├── App.tsx       # React 组件
│       ├── main.tsx      # 入口文件
│       └── index.html    # HTML 模板
├── utils/                # 工具函数
│   ├── ad-filter-constants.ts  # 常量定义
│   └── ad-filter-utils.ts      # 工具函数
├── constant/             # 常量
│   └── enum.ts           # 枚举定义
├── assets/               # 静态资源
│   └── styles/           # 样式文件
└── public/               # 公共资源
    └── icon/             # 图标文件
```

## 🔧 开发指南

### 开发命令

```bash
# 开发模式（Chrome）
pnpm dev

# 开发模式（Firefox）
pnpm dev:firefox

# 类型检查
pnpm compile

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 样式检查
pnpm stylelint

# 完整检查（lint + stylelint + typecheck）
pnpm check
```

### 代码规范

项目使用以下工具保证代码质量：

- **ESLint**: JavaScript/TypeScript 代码检查
- **Prettier**: 代码格式化
- **Stylelint**: CSS/SCSS 样式检查
- **TypeScript**: 类型检查
- **Husky**: Git hooks
- **Commitlint**: Commit 信息规范

### 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 使用 commitizen 进行规范化提交
pnpm commit

# 提交类型示例
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 添加测试
chore: 构建/工具链更新
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [WXT](https://wxt.dev/) - 优秀的浏览器扩展开发框架
- [React](https://react.dev/) - 强大的 UI 库

## 📮 反馈与建议

如有问题或建议，欢迎提交 [Issue](https://github.com/null1126/ad-filter-extension/issues)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
