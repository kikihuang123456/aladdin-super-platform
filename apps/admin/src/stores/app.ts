import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    platformName: 'ALADDIN Super Platform',
    environment: 'Development',
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },
  },
})
