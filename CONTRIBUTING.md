# 代码提交流程

请按以下流程提交代码，保证提交信息与分支规范统一。

## 一、分支规范

在开发前请基于 `main` 拉取功能分支，分支命名与 commit type 对应：

| 类型   | 分支示例       | 说明        |
| ------ | -------------- | ----------- |
| 新功能 | `feat/xxx`     | 新功能      |
| 修复   | `fix/xxx`      | Bug 修复    |
| 文档   | `docs/xxx`     | 文档        |
| 样式   | `style/xxx`    | 格式/样式   |
| 重构   | `refactor/xxx` | 重构        |
| 其他   | `chore/xxx`    | 构建/依赖等 |

```bash
# 示例：开发新功能前创建分支
git checkout main
git pull
git checkout -b feat/your-feature-name
```

## 二、开发与自检

1. 修改代码后，**提交前**在项目根目录执行全量校验：

```bash
pnpm check
```

该命令会依次执行：**ESLint**、**Stylelint**、**TypeScript 编译检查**。任一步失败则需先修复再提交。

2. 可按需执行自动修复与格式化：

```bash
pnpm lint:fix      # ESLint 自动修复
pnpm stylelint:fix # 样式属性排序等
pnpm format        # Prettier 格式化
```

## 三、按流程提交（推荐）

使用脚本按「先校验 → 再交互式填写提交信息」提交：

```bash
# 1. 暂存需要提交的文件
git add .

# 2. 执行提交流程：先跑 check，通过后进入交互式提交
pnpm commit
```

`pnpm commit` 会：

1. 先执行 `pnpm check`，不通过则中止，不会进入提交；
2. 通过后启动 **Commitizen**，在终端中按提示选择：
   - **类型 (type)**：feat / fix / docs / style / refactor / perf / test / chore / ci / build / revert
   - **范围 (scope)**：可选，如 popup、background
   - **简短说明 (subject)**：必填，一句话描述变更

生成的提交信息会符合 [Conventional Commits](https://www.conventionalcommits.org/)，并由 **commitlint** 在 `commit-msg` 钩子中再次校验。

## 四、直接使用 git commit

若不用 `pnpm commit`，也可直接：

```bash
git add .
git commit -m "feat(popup): 添加登录按钮"
```

提交信息必须满足：

- **格式**：`<type>(<scope>): <subject>`
- **type** 必须为规定枚举之一（见上表及 `commitlint.config.js`）
- **subject** 必填，不能以句号结尾，总长度建议不超过 100 字符

非法提交会被 **commit-msg** 钩子拦截。

## 五、提交后：推送与 MR/PR

```bash
git push origin <你的分支名>
```

随后在代码托管平台创建 **Merge Request / Pull Request**，由他人 Review 后合并到 `main`。

---

## 脚本速查

| 命令             | 说明                           |
| ---------------- | ------------------------------ |
| `pnpm check`     | 全量校验（lint+stylelint+tsc） |
| `pnpm commit`    | 校验通过后交互式提交           |
| `pnpm lint`      | 仅 ESLint                      |
| `pnpm stylelint` | 仅 Stylelint                   |
| `pnpm compile`   | 仅 TypeScript 检查             |

## 钩子说明

- **pre-commit**：提交前对暂存文件执行 `lint-staged`（ESLint --fix、Stylelint --fix、Prettier）。
- **commit-msg**：校验提交信息是否符合 commitlint 规则。

跳过钩子（不推荐）：`git commit --no-verify`。
