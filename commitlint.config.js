/**
 * 提交信息规范：类型(枚举) + 可选范围 + 必填说明
 * 格式: <type>(<scope>): <subject>
 * 示例: feat(popup): 添加登录按钮
 *       fix: 修复样式顺序报错
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档
        'style',    // 格式（不影响代码运行）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建/工具/依赖
        'ci',       // CI 配置
        'build',    // 构建
        'revert',   // 回滚
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
