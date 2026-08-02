import type {
  RouteRecordRaw,
} from 'vue-router'

const mallRoutes:
  RouteRecordRaw[] = [
    {
      path: '/mall',
      name: 'mall-list',
      component: () =>
        import(
          '../../views/mall/MallListView.vue'
        ),
      meta: {
        title: '商城管理',
        requiresAuth: true,
        permission: 'mall.view',
      },
    },

    {
      path: '/mall/create',
      name: 'mall-create',
      component: () =>
        import(
          '../../views/mall/MallCreateView.vue'
        ),
      meta: {
        title: '新增商品',
        requiresAuth: true,
        permission: 'mall.create',
      },
    },

    {
      path: '/mall/category',
      name: 'mall-category',
      component: () =>
        import(
          '../../views/mall/MallCategoryView.vue'
        ),
      meta: {
        title: '商品分類',
        requiresAuth: true,
        permission: 'mall.view',
      },
    },

    {
      path: '/mall/:id/edit',
      name: 'mall-edit',
      component: () =>
        import(
          '../../views/mall/MallEditView.vue'
        ),
      meta: {
        title: '編輯商品',
        requiresAuth: true,
        permission: 'mall.update',
      },
    },

    {
      path: '/mall/:id',
      name: 'mall-detail',
      component: () =>
        import(
          '../../views/mall/MallDetailView.vue'
        ),
      meta: {
        title: '商品詳情',
        requiresAuth: true,
        permission: 'mall.view',
      },
    },
  ]

export default mallRoutes