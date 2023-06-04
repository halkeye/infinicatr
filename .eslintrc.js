module.exports = {
  extends: [
    'eslint:recommended',
    'standard'
  ],
  rules: {
    semi: [
      2,
      'always'
    ],
    'no-extra-semi': 2,
    'no-unused-vars': [
      2,
      {
        vars: 'all',
        args: 'after-used'
      }
    ]
  },
  env: {
    browser: true,
    es2021: true
  }
};
