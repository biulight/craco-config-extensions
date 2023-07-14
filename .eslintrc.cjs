module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['semistandard', 'standard'],
  ignorePatterns: ['**/*.d.ts'],
  env: {},
  rules: {
    'space-before-function-paren': ['error', {
      named: 'never'
    }]
  },
  globals: {
    __DEV__: false // 禁用
  }
}
