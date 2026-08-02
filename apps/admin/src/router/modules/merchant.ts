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
  {
  path:
    '/merchants/:id',

  name:
    'MerchantDetail',

  component:
    () =>
      import(
        '../../views/merchant/MerchantDetailView.vue'
      ),

  meta: {
    title:
      '商家詳情',

    requiresAuth:
      true,

    permission:
      'merchant.view',
  },
},
]

export default merchantRoutes