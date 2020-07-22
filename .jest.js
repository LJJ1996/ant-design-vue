const libDir = process.env.LIB_DIR;

const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
];

module.exports = {
  // rootDir  默认值：当前目录，一般是package.json所在的目录。
  testURL: 'http://localhost/',
  setupFiles: ['./tests/setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'md', 'jpg'], // 测试文件的类型
  modulePathIgnorePatterns: ['/_site/'],
  testPathIgnorePatterns: ['/node_modules/', 'node'],
  transform: {
    '.*\\.(vue|md)$': '<rootDir>/node_modules/vue-jest',
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.svg$': '<rootDir>/node_modules/jest-transform-stub',
  },
  // testRegex: libDir === 'dist' ? 'demo\\.test\\.js$' : '.*\\.test\\.js$',
  testRegex: 'button\\.test\\.js$', // 设置识别哪些文件是测试文件
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'ant-design-vue$': '<rootDir>/components/index.js',
    'ant-design-vue/es': '<rootDir>/components',
    '^vue$': 'vue/dist/vue.common.js',
  },
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  collectCoverage: process.env.COVERAGE === 'true',
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
  transformIgnorePatterns,
};
