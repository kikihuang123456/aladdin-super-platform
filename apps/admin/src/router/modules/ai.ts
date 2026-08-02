import type { RouteRecordRaw } from 'vue-router'

const aiRoutes: RouteRecordRaw[] = [
  {
    path: '/ai-center',
    name: 'AICenter',
    component: () =>
      import('../../views/ai/AICenterView.vue'),
    meta: {
      title: 'AI 智能中心',
      requiresAuth: true,
      permissions: [
        'ai.view',
      ],
    },
  },
]

export default aiRoutes