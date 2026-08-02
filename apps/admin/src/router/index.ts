import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

import dashboardRoutes from './modules/dashboard'
import memberRoutes from './modules/member'
import merchantRoutes from './modules/merchant'
import dealerRoutes from './modules/dealer'
import travelRoutes from './modules/travel'
import aiRoutes from './modules/ai'
import authRoutes from './modules/auth'
import systemRoutes from './modules/system'
import {
  mallRoutes,
} from './modules/mall'
import orderRoutes from './modules/order'
import mallCategoryRoutes
from './modules/mall-category'

import financeRoutes
  from './modules/finance'

import { registerPermissionGuard } from './permission'
const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...systemRoutes,
  ...dashboardRoutes,
  ...memberRoutes,
  ...merchantRoutes,
  ...dealerRoutes,
  ...mallRoutes,
  ...mallCategoryRoutes,
  ...travelRoutes,
  ...aiRoutes,
  ...orderRoutes,
  ...financeRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      left: 0,
    }
  },
})

router.beforeEach((to) => {
  const pageTitle =
    typeof to.meta.title === 'string'
      ? to.meta.title
      : '阿拉丁企業管理平台'

  document.title = `${pageTitle}｜阿拉丁企業管理平台`

  return true
})

registerPermissionGuard(router)

export default router