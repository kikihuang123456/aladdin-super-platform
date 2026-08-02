import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () =>
      import(
        '../../views/system/ForbiddenView.vue'
      ),
    meta: {
      title: '無權限存取',
      requiresAuth: false,
    },
  },
]

export default systemRoutes