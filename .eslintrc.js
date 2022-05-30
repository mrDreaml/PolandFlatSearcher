module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: [2, 'never'],
    'no-await-in-loop': 'off',
    curly: [2, 'all'],
    'object-curly-newline': 'off',
    'no-plusplus': 'off',
    'import/extensions': 'off',
    'no-shadow': 'off',
    'max-len': [
      2,
      {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
  },
}
