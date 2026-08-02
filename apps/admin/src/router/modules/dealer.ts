import type { RouteRecordRaw } from 'vue-router'

const dealerRoutes: RouteRecordRaw[] = [
  {
    path: '/dealers',
    name: 'DealerList',
    component: () =>
      import(
        '../../views/dealer/DealerListView.vue'
      ),
    meta: {
      title: '經銷商管理',
      requiresAuth: true,
      permissions: [
        'dealer.view',
      ],
    },
  },
]

export default dealerRoutes