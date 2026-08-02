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
{
  path:
    '/merchants/products',

  name:
    'MerchantProductList',

  component:
    () =>
      import(
        '../../views/merchant/MerchantProductListView.vue'
      ),

  meta: {
    title:
      '商家商品管理',

    requiresAuth:
      true,

    permission:
      'merchant.product.view',
  },
},

{
  path:
    '/merchants/products/:id',

  name:
    'MerchantProductDetail',

  component:
    () =>
      import(
        '../../views/merchant/MerchantProductDetailView.vue'
      ),

  meta: {
    title:
      '商家商品詳情',

    requiresAuth:
      true,

    permission:
      'merchant.product.view',
  },
},
]

export default merchantRoutes