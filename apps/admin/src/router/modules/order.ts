import type {
  RouteRecordRaw,
} from 'vue-router'

const orderRoutes:
  RouteRecordRaw[] = [
    {
      path: '/order',

      name: 'MallOrderList',

      component:
        () =>
          import(
            '../../views/order/MallOrderListView.vue'
          ),

      meta: {
        title:
          '訂單管理',

        requiresAuth:
          true,
      },
    },

    {
      path: '/order/:id',

      name:
        'MallOrderDetail',

      component:
        () =>
          import(
            '../../views/order/MallOrderDetailView.vue'
          ),

      meta: {
        title:
          '訂單詳情',

        requiresAuth:
          true,
      },
    },
  ]

export default orderRoutes