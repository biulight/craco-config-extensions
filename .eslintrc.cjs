module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['semistandard', 'standard'],
  ignorePatterns: ['**/*.d.ts'],
  env: {},
  globals: {
    __DEV__: false // 禁用
  }
}
