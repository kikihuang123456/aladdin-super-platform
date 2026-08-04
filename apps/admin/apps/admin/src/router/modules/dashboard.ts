/**
 * ALADDIN Enterprise V4
 *
 * Dashboard Router
 */

import type {
  RouteRecordRaw,
} from 'vue-router'


const dashboardRoutes:
RouteRecordRaw[] = [

  {
    path:
      '/dashboard',

    name:
      'Dashboard',

    component:
      () =>
        import(
          '../../views/DashboardView.vue'
        ),

    meta: {

      title:
        '總覽儀表板',

      requiresAuth:
        true,

    },

  },

]


export default dashboardRoutes