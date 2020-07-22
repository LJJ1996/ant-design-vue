const libDir = process.env.LIB_DIR;

const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
];

module.exports = {
  // rootDir  默认值：当前目录，一般是package.json所在的目录。
  testURL: 'http://localhost/',
  setupFiles: ['./tests/setup.js'], // 配置或设置测试环境的模块的路径, 每个测试文件将运行一次setupFile
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'md', 'jpg'], // 测试文件的类型
  modulePathIgnorePatterns: ['/_site/'],
  testPathIgnorePatterns: ['/node_modules/', 'node'], // 忽略文件
  transform: {
    // 转换器路径的映射，为转换源文件提供同步功能的模块
    '.*\\.(vue|md)$': '<rootDir>/node_modules/vue-jest', // 使用vue-jest解析vue文件
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest', // 使用babel-jest解析js文件
    '^.+\\.svg$': '<rootDir>/node_modules/jest-transform-stub',
  },
  // testRegex: libDir === 'dist' ? 'demo\\.test\\.js$' : '.*\\.test\\.js$',
  testRegex: 'button\\.test\\.js$', // 设置识别哪些文件是测试文件
  moduleNameMapper: {
    // 模块名称的映射，允许存根资源，例如具有单个模块的图像或样式，主要用于与webpack的resolve.alias匹配，注意正则写法
    '^@/(.*)$': '<rootDir>/$1',
    'ant-design-vue$': '<rootDir>/components/index.js',
    'ant-design-vue/es': '<rootDir>/components',
    '^vue$': 'vue/dist/vue.common.js',
  },
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'], // 快照美观插件
  // 是否收集测试时的覆盖率信息
  collectCoverage: process.env.COVERAGE === 'true',
  // 哪些文件需要收集覆盖率信息
  collectCoverageFrom: [
    'components/**/*.{js,jsx,vue}',
    '!components/*/style/index.{js,jsx}',
    '!components/style/*.{js,jsx}',
    '!components/*/locale/*.{js,jsx}',
    '!components/*/__tests__/**/type.{js,jsx}',
    '!components/vc-*/**/*',
    '!components/*/demo/**/*',
    '!components/_util/**/*',
    '!components/align/**/*',
    '!components/trigger/**/*',
    '!components/style.js',
    '!**/node_modules/**',
  ],
  // 转换时需要忽略的文件
  transformIgnorePatterns,
};
