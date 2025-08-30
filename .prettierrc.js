module.exports = {
  // 基础配置
  printWidth: 120, // 每行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而不是制表符
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象属性引号：仅在需要时添加
  jsxSingleQuote: true, // JSX 中使用单引号
  trailingComma: 'es5', // 尾随逗号：ES5 兼容
  bracketSpacing: true, // 对象字面量的括号间添加空格
  bracketSameLine: false, // 将多行 HTML 元素的 > 放在最后一行的末尾
  arrowParens: 'avoid', // 箭头函数参数括号：仅在必要时添加
  rangeStart: 0, // 格式化范围开始
  rangeEnd: Infinity, // 格式化范围结束
  requirePragma: false, // 不需要 pragma
  insertPragma: false, // 不插入 pragma
  proseWrap: 'preserve', // 散文换行：保持原样
  htmlWhitespaceSensitivity: 'css', // HTML 空白敏感性
  vueIndentScriptAndStyle: false, // Vue 文件中的 script 和 style 标签不缩进
  endOfLine: 'lf', // 换行符：LF
  embeddedLanguageFormatting: 'auto', // 嵌入语言格式化：自动
  singleAttributePerLine: false, // 每行单个属性：关闭

  // 覆盖特定文件类型的配置
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        parser: 'yaml',
        singleQuote: false,
      },
    },
  ],
};