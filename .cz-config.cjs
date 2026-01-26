/**
 * Commitizen 中文交互配置
 * 运行 pnpm commit 时的提示文案
 */
module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复 bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    格式/样式（不影响代码运行）' },
    { value: 'refactor', name: 'refactor: 重构' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     测试相关' },
    { value: 'chore', name: 'chore:    构建/工具/依赖' },
    { value: 'ci', name: 'ci:       CI 配置' },
    { value: 'build', name: 'build:    构建' },
    { value: 'revert', name: 'revert:   回滚提交' },
  ],

  scopes: [
    { name: 'popup' },
    { name: 'background' },
    { name: 'content' },
    { name: 'options' },
    { name: 'styles' },
    { name: 'config' },
    { name: 'deps' },
  ],

  messages: {
    type: '选择提交类型：',
    scope: '选择影响范围（可选）：',
    customScope: '自定义范围：',
    subject: '简短描述（必填，不超过 100 字）：',
    body: '详细描述（可选，支持多行，以空行结束）：',
    breaking: '破坏性变更说明（可选）：',
    footer: '关联 Issue 等（可选）：',
    confirmCommit: '确认使用以上提交信息？',
  },

  allowCustomScopes: true,
  allowEmptyScopes: true,
  subjectLimit: 100,
  skipQuestions: ['body', 'breaking', 'footer'],
};
