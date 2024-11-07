export default function getData({ oldData }) {
  const vuePcPlugin = [{
    name: 'components',
    importer: "import Components from 'unplugin-vue-components/vite'",
    initializer: `Components({
      include: [/\.tsx$/, /\.vue$/, /\.vue\?vue/],
      // 生产环境按需引入
      resolvers: command === 'build' ? ElementPlusResolver() : undefined
    })`,
  },
  {
    id: 'elementPlusResolver',
    importer: "import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'",
    initializer: '',
  }]

  return {
    ...oldData,
    // Append the PcPlugin plugin right after the vue plugin
    plugins: oldData.plugins.flatMap((plugin) =>
      plugin.id === 'vue' ? [plugin, ...vuePcPlugin] : plugin,
    ),
  }
}
