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

      meta: {
        title:
          '財務中心',

        requiresAuth:
          true,

        permission:
          'finance.view',
      },
    },

    {
      path:
        '/finance/transactions',

      name:
        'FinanceTransactions',

      component:
        () =>
          import(
            '../../views/finance/FinanceTransactionListView.vue'
          ),

      meta: {
        title:
          '財務交易',

        requiresAuth:
          true,

        permission:
          'finance.transaction.view',
      },
    },
    {
  path:
    '/finance/transactions/:id',

  name:
    'FinanceTransactionDetail',

  component:
    () =>
      import(
        '../../views/finance/FinanceTransactionDetailView.vue'
      ),

  meta: {
    title:
      '財務交易詳情',

    requiresAuth:
      true,

    permission:
      'finance.transaction.view',
  },
},
  ]

export default financeRoutes