module.exports = {
  env: {
    serviceworker: true,
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'google'],
  globals: {
    goog: false,
    BroadcastChannel: false,
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    'valid-jsdoc': 1,
    'require-jsdoc': 1,
  },
};
