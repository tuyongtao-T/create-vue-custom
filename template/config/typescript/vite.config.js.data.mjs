export default function getData({ oldData }) {
  const vueMockPlugin = [{
    id: 'viteMockServe',
    importer: "import { viteMockServe } from 'vite-plugin-mock'",
    initializer: `
      viteMockServe({
        mockPath: '/mock',
        localEnabled: isEnabledMock,
        prodEnabled: false,
        supportTs: true, // 打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件。
        watchFiles: true // 监视文件更改
      })
    `,
  }]

  return {
    ...oldData,
    // Append the PcPlugin plugin right after the vue plugin
    plugins: oldData.plugins.flatMap((plugin) =>
      plugin.id === 'vue' ? [plugin, ...vueMockPlugin] : plugin,
    ),
  }
}
