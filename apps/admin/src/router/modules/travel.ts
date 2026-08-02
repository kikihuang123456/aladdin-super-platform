import type { RouteRecordRaw } from 'vue-router'

const travelRoutes: RouteRecordRaw[] = [
  {
    path: '/travel',
    name: 'TravelList',
    component: () =>
      import('../../views/travel/TravelListView.vue'),
    meta: {
      title: '文旅管理',
      requiresAuth: true,
      permissions: [
        'travel.view',
      ],
    },
  },
]

export default travelRoutes