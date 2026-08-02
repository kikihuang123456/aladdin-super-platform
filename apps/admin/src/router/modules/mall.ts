import type { RouteRecordRaw } from 'vue-router'

const mallRoutes: RouteRecordRaw[] = [
  {
    path: '/mall',
    name: 'MallList',
    component: () =>
      import(
        '../../views/mall/MallListView.vue'
      ),
    meta: {
      title: '商城管理',
      requiresAuth: true,
      permissions: [
        'mall.view',
      ],
    },
  },
]

export default mallRoutes