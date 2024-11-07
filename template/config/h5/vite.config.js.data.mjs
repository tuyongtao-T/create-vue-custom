export default function getData({ oldData }) {
  const vueH5Plugin = []

  return {
    ...oldData,
    // Append the PcPlugin plugin right after the vue plugin
    plugins: oldData.plugins.flatMap((plugin) =>
      plugin.id === 'vue' ? [plugin, ...vueH5Plugin] : plugin,
    ),
  }
}
