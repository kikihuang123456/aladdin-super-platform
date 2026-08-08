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
      '/merchants/create',

    name:
      'MerchantCreate',

    component:
      () =>
        import(
          '../../views/merchant/MerchantCreateView.vue'
        ),

    meta: {
      title:
        '新增商家',

      requiresAuth:
        true,

      permission:
        'merchant.create',
    },
  },

  {
    path:
      '/merchants/:id/edit',

    name:
      'MerchantEdit',

    component:
      () =>
        import(
          '../../views/merchant/MerchantEditView.vue'
        ),

    meta: {
      title:
        '編輯商家',

      requiresAuth:
        true,

      permission:
        'merchant.update',
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