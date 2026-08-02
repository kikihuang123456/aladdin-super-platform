/**
 * ALADDIN Enterprise
 *
 * Finance ERP Router
 */


import type {
  RouteRecordRaw,
} from 'vue-router'


const financeRoutes:
RouteRecordRaw[] = [

  {

    path:
      '/finance',


    name:
      'FinanceDashboard',


    component:
      () =>
        import(
          '../../views/finance/FinanceDashboardView.vue'
        ),


    meta:{

      title:
        '財務中心',

      requiresAuth:
        true,

      permission:
        'finance.view',

    },

  },

]


export default financeRoutes
