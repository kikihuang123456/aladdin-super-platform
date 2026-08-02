import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import type {
  RouteRecordRaw,
} from 'vue-router'


import dashboardRoutes from './modules/dashboard'
import memberRoutes from './modules/member'
import merchantRoutes from './modules/merchant'
import dealerRoutes from './modules/dealer'
import mallRoutes from './modules/mall'
import travelRoutes from './modules/travel'
import aiRoutes from './modules/ai'
import authRoutes from './modules/auth'
import systemRoutes from './modules/system'


const routes:
RouteRecordRaw[] = [

  ...authRoutes,

  ...dashboardRoutes,

  ...memberRoutes,

  ...merchantRoutes,

  ...dealerRoutes,

  ...mallRoutes,

  ...travelRoutes,

  ...aiRoutes,

  ...systemRoutes,


  {
    path: '/',
    redirect: '/dashboard',
  },


  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },

]



const router =
  createRouter({

    history:
      createWebHistory(),

    routes,

  })



export default router