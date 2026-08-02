/**
 * ALADDIN Enterprise V4
 *
 * Finance Reports ERP
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
  generateFinanceReport,
  getFinanceReportById,
  getFinanceReports,
  updateFinanceReportStatus,
} from '../api/finance-report'

import type {
  FinanceReport,
  FinanceReportFilters,
  FinanceReportGenerateInput,
  FinanceReportPagination,
  FinanceReportStatistics,
  FinanceReportStatusUpdateInput,
} from '../types/finance-report'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceReportFilters {
  return {
    keyword:
      '',

    periodType:
      '',

    status:
      '',

    startDate:
      null,

    endDate:
      null,

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,
  }
}

function createEmptyPagination():
  FinanceReportPagination {
  return {
    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total:
      0,

    totalPages:
      0,
  }
}

function createEmptyStatistics():
  FinanceReportStatistics {
  return {
    totalReports:
      0,

    draftReports:
      0,

    generatedReports:
      0,

    confirmedReports:
      0,

    archivedReports:
      0,

    grossIncome:
      0,

    totalExpense:
      0,

    netIncome:
      0,
  }
}

function normalizeError(
  errorValue: unknown,
  fallback: string,
): string {
  return errorValue instanceof Error
    ? errorValue.message
    : fallback
}

export const useFinanceReportStore =
  defineStore(
    'finance-report',
    () => {
      const reports =
        ref<FinanceReport[]>([])

      const currentReport =
        ref<FinanceReport | null>(
          null,
        )

      const filters =
        ref<FinanceReportFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceReportPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceReportStatistics>(
          createEmptyStatistics(),
        )

      const isLoading =
        ref(false)

      const isMutating =
        ref(false)

      const error =
        ref<string | null>(
          null,
        )

      const mutationMessage =
        ref<string | null>(
          null,
        )

      const hasReports =
        computed(() =>
          reports.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          reports.value.length === 0,
        )

      const hasPreviousPage =
        computed(() =>
          pagination.value.page > 1,
        )

      const hasNextPage =
        computed(() =>
          pagination.value.totalPages >
            0 &&
          pagination.value.page <
            pagination.value.totalPages,
        )
              async function fetchReports():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceReports(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          reports.value =
            response.reports

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (errorValue) {
          reports.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '財務報表資料載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchReportById(
        reportId: string,
      ): Promise<
        FinanceReport | null
      > {
        const normalizedId =
          reportId.trim()

        if (!normalizedId) {
          currentReport.value =
            null

          error.value =
            '財務報表 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceReportById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.report
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentReport.value =
            response.report

          const index =
            reports.value.findIndex(
              (report) =>
                report.id ===
                response.report!.id,
            )

          if (index >= 0) {
            reports.value[index] =
              response.report
          }

          return response.report
        } catch (errorValue) {
          currentReport.value =
            null

          error.value =
            normalizeError(
              errorValue,
              '財務報表詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function generateReport(
        input:
          FinanceReportGenerateInput,
      ): Promise<
        FinanceReport | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await generateFinanceReport(
              input,
            )

          if (
            !response.success ||
            !response.report
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentReport.value =
            response.report

          reports.value.unshift(
            response.report,
          )

          mutationMessage.value =
            response.message

          return response.report
        } catch (errorValue) {
          error.value =
            normalizeError(
              errorValue,
              '財務報表產生失敗。',
            )

          return null
        } finally {
          isMutating.value = false
        }
      }

      async function updateReportStatus(
        input:
          FinanceReportStatusUpdateInput,
      ): Promise<
        FinanceReport | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await updateFinanceReportStatus(
              input,
            )

          if (
            !response.success ||
            !response.report
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentReport.value =
            response.report

          const index =
            reports.value.findIndex(
              (report) =>
                report.id ===
                response.report!.id,
            )

          if (index >= 0) {
            reports.value[index] =
              response.report
          }

          mutationMessage.value =
            response.message

          return response.report
        } catch (errorValue) {
          error.value =
            normalizeError(
              errorValue,
              '財務報表狀態更新失敗。',
            )

          return null
        } finally {
          isMutating.value = false
        }
      }
            async function searchReports(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchReports()
      }

      async function setPeriodTypeFilter(
        periodType:
          FinanceReportFilters['periodType'],
      ): Promise<void> {
        filters.value.periodType =
          periodType

        filters.value.page =
          1

        await fetchReports()
      }

      async function setStatusFilter(
        status:
          FinanceReportFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchReports()
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

        filters.value.page =
          1

        await fetchReports()
      }

      async function setPage(
        page: number,
      ): Promise<void> {
        if (
          !Number.isInteger(page) ||
          page < 1
        ) {
          return
        }

        if (
          pagination.value.totalPages >
            0 &&
          page >
            pagination.value.totalPages
        ) {
          return
        }

        filters.value.page =
          page

        await fetchReports()
      }

      async function setPageSize(
        pageSize: number,
      ): Promise<void> {
        if (
          !Number.isInteger(pageSize) ||
          pageSize < 1
        ) {
          return
        }

        filters.value.pageSize =
          pageSize

        filters.value.page =
          1

        await fetchReports()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchReports()
      }

      function clearCurrentReport():
        void {
        currentReport.value =
          null
      }

      function clearError():
        void {
        error.value =
          null
      }

      function clearMutationMessage():
        void {
        mutationMessage.value =
          null
      }

      return {
        reports,
        currentReport,
        filters,
        pagination,
        statistics,
        isLoading,
        isMutating,
        error,
        mutationMessage,

        hasReports,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchReports,
        fetchReportById,
        generateReport,
        updateReportStatus,

        searchReports,
        setPeriodTypeFilter,
        setStatusFilter,
        setDateRange,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentReport,
        clearError,
        clearMutationMessage,
      }
    },
  )

export default useFinanceReportStore