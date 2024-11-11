export default function getData({ oldData }) {
  const vueMockPlugin = [{
    id: 'viteMockServe',
    importer: "import { viteMockServe } from 'vite-plugin-mock'",
    initializer: `
       viteMockServe({
        mockPath: './mock',
        enable: true
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
