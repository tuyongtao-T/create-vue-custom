export default function getData() {
  return {
    plugins: [
      {
        id: 'vue',
        importer: "import vue from '@vitejs/plugin-vue'",
        initializer: 'vue()',
      },
      {
        id: 'autoImport',
        importer: "import AutoImport from 'unplugin-auto-import/vite'",
        initializer: `AutoImport({
          include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
          dts: true,
          imports: ['vue', 'vue-router'],
          resolvers: [ElementPlusResolver()]
        }),`,
      },
      {
        id: 'components',
        importer: "import Components from 'unplugin-vue-components/vite'",
        initializer: `Components({
          include: [/\.tsx$/, /\.vue$/, /\.vue\?vue/],
          // 生产环境按需引入
          resolvers: import.meta.env.MODE === 'production' ? ElementPlusResolver() : undefined
        })`,
      },
      {
        id: 'elementPlusResolver',
        importer: "import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'",
        initializer: '',
      },
      {
        id: 'viteCompression',
        importer: "import viteCompression from 'vite-plugin-compression'",
        initializer: `viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz'
        })`,
      },
      {
        id: 'defineOptions',
        importer: "import DefineOptions from 'unplugin-vue-define-options/dist/vite'",
        initializer: 'DefineOptions()',
      },
      {
        id: 'visualizer',
        importer: "import { visualizer } from 'rollup-plugin-visualizer'",
        initializer: 'visualizer()',
      },
      {
        id: 'createHtmlPlugin',
        importer: "import { createHtmlPlugin } from 'vite-plugin-html'",
        initializer: `
          createHtmlPlugin({
            minify: true,
            inject: {
              data: {
                title: VITE_APP_TITLE
              }
          }
        })`,
      },
      {
        id: 'unocss',
        importer: "import Unocss from 'unocss/vite'",
        initializer: 'Unocss()',
      },
    ],
  }
}
