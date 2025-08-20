module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions: {
      configFile: require('path').resolve(__dirname, 'babel.config.js')
    }
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/singleline-html-element-content-newline': [
      'warn',
      {
        
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
        ignores: ['router-link']
      }
    ]
  }
}