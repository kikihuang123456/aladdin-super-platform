import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () =>
      import('../../layouts/AuthLayout.vue'),
    meta: {
      guestOnly: true,
    },
    children: [
      {
        path: '',
        name: 'Login',
        component: () =>
          import('../../views/auth/LoginView.vue'),
        meta: {
          title: '登入管理平台',
          guestOnly: true,
        },
      },
    ],
  },
]

export default authRoutes