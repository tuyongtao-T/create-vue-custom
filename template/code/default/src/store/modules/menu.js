import { defineStore } from 'pinia'


export const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      noTabList: ['/', '/home', '/404'],
      tabItems: [],
      activeTab: ''
    }
  },
  getters: {
    menuItems: state => {
      const aa = state.tabItems.filter(tab => !state.noTabList.includes(tab.path))
      return aa
    },
    showTab: state => {
      return !state.noTabList.includes(state.activeTab)
    }
  },
  actions: {
    addTab(data) {
      this.tabItems.push(data)
    },
    removeTab(tab) {
      let index = 0
      for (const item of this.tabItems) {
        if (item.path === tab) {
          break
        }
        index++
      }
      this.tabItems.splice(index, 1)
    },
    clearTab() {
      this.tabItems = []
    },
    setActiveTab(tab) {
      this.activeTab = tab
    }
  }
})
