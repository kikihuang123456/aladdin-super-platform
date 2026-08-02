/**
 * ALADDIN Enterprise V4
 *
 * Finance Dashboard
 *
 * Pinia Store
 */

import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  getFinanceDashboard,
} from '../api/finance-dashboard'

import type {
  FinanceDashboardData,
  FinanceDashboardFilters,
} from '../types/finance-dashboard'

function createDefaultFilters():
  FinanceDashboardFilters {
  return {
    startDate:
      null,

    endDate:
      null,

    currency:
      'TWD',
  }
}

function createEmptyDashboard():
  FinanceDashboardData {
  return {
    summary: {
      transactionCount: 0,
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
      walletCount: 0,
      walletBalance: 0,
      frozenBalance: 0,
      availableBalance: 0,
      pendingWithdrawCount: 0,
      pendingWithdrawAmount: 0,
      pendingRefundCount: 0,
      pendingRefundAmount: 0,
      pendingSettlementCount: 0,
      pendingSettlementAmount: 0,
      reportCount: 0,
      failedAuditCount: 0,
    },

    statusSummary: {
      pendingTransactions: 0,
      completedTransactions: 0,
      failedTransactions: 0,
      pendingWithdraws: 0,
      processingWithdraws: 0,
      completedWithdraws: 0,
      pendingRefunds: 0,
      processingRefunds: 0,
      completedRefunds: 0,
      pendingSettlements: 0,
      processingSettlements: 0,
      completedSettlements: 0,
    },

    trends: [],

    modules: [],

    recentTransactions: [],

    recentAuditLogs: [],

    generatedAt:
      new Date().toISOString(),
  }
}

export const useFinanceDashboardStore =
  defineStore(
    'finance-dashboard',
    () => {
      const dashboard =
        ref(
          createEmptyDashboard(),
        )

      const filters =
        ref(
          createDefaultFilters(),
        )

      const isLoading =
        ref(false)

      const error =
        ref<
          string | null
        >(null)

      const summary =
        computed(
          () =>
            dashboard.value.summary,
        )

      const statusSummary =
        computed(
          () =>
            dashboard.value.statusSummary,
        )

      const trends =
        computed(
          () =>
            dashboard.value.trends,
        )

      const modules =
        computed(
          () =>
            dashboard.value.modules,
        )

      const recentTransactions =
        computed(
          () =>
            dashboard.value.recentTransactions,
        )

      const recentAuditLogs =
        computed(
          () =>
            dashboard.value.recentAuditLogs,
        )
              async function fetchDashboard():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value =
          true

        error.value =
          null

        try {
          const response =
            await getFinanceDashboard(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          dashboard.value =
            response.data
        } catch (
          errorValue
        ) {
          dashboard.value =
            createEmptyDashboard()

          error.value =
            errorValue instanceof Error
              ? errorValue.message
              : '財務 Dashboard 載入失敗。'
        } finally {
          isLoading.value =
            false
        }
      }

      async function setDateRange(
        startDate:
          string | null,
        endDate:
          string | null,
      ): Promise<void> {
        filters.value.startDate =
          startDate

        filters.value.endDate =
          endDate

        await fetchDashboard()
      }

      async function setCurrency(
        currency: string,
      ): Promise<void> {
        const normalizedCurrency =
          currency.trim().toUpperCase()

        if (!normalizedCurrency) {
          return
        }

        filters.value.currency =
          normalizedCurrency

        await fetchDashboard()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchDashboard()
      }

      function clearError():
        void {
        error.value =
          null
      }

      return {
        dashboard,
        filters,
        isLoading,
        error,

        summary,
        statusSummary,
        trends,
        modules,
        recentTransactions,
        recentAuditLogs,

        fetchDashboard,
        setDateRange,
        setCurrency,
        resetFilters,
        clearError,
      }
    },
  )

export default useFinanceDashboardStore
