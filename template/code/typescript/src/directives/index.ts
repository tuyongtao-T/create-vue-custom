import { useThrottleFn } from '@vueuse/core'

export const vThrottle = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el: any, binding: { value: number }, vNode: any) {
    const time = binding.value || 1000
    vNode.props.onClick = useThrottleFn(vNode.props.onClick, time)
  }
}

