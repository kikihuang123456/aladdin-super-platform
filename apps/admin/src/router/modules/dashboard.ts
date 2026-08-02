import type { RouteRecordRaw } from 'vue-router'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () =>
      import(
        '../../views/dashboard/DashboardView.vue'
      ),
    meta: {
      title: '總覽儀表板',
      requiresAuth: true,
      permissions: [
        'dashboard.view',
      ],
    },
  },
]

export default dashboardRoutes