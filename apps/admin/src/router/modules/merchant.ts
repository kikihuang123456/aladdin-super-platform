import type { RouteRecordRaw } from 'vue-router'

const merchantRoutes: RouteRecordRaw[] = [
  {
    path: '/merchants',
    name: 'MerchantList',
    component: () =>
      import(
        '../../views/merchant/MerchantListView.vue'
      ),
    meta: {
      title: '商家管理',
      requiresAuth: true,
      permissions: [
        'merchant.view',
      ],
    },
  },
]

export default merchantRoutes