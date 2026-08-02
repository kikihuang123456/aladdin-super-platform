/**
 * ALADDIN Enterprise V4
 *
 * Finance Audit Log ERP
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
  createFinanceAuditLog,
  getFinanceAuditLogById,
  getFinanceAuditLogs,
} from '../api/finance-audit-log'

import type {
  FinanceAuditLog,
  FinanceAuditLogCreateInput,
  FinanceAuditLogFilters,
  FinanceAuditLogPagination,
  FinanceAuditLogStatistics,
} from '../types/finance-audit-log'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceAuditLogFilters {
  return {
    keyword:
      '',

    module:
      '',

    action:
      '',

    result:
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
  FinanceAuditLogPagination {
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
  FinanceAuditLogStatistics {
  return {
    total:
      0,

    success:
      0,

    failed:
      0,

    transaction:
      0,

    wallet:
      0,

    withdraw:
      0,

    refund:
      0,

    settlement:
      0,

    report:
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

export const useFinanceAuditLogStore =
  defineStore(
    'finance-audit-log',
    () => {
      const logs =
        ref<FinanceAuditLog[]>([])

      const currentLog =
        ref<FinanceAuditLog | null>(
          null,
        )

      const filters =
        ref<FinanceAuditLogFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceAuditLogPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceAuditLogStatistics>(
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

      const hasLogs =
        computed(() =>
          logs.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          logs.value.length === 0,
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
              async function fetchLogs():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceAuditLogs(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          logs.value =
            response.logs

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (errorValue) {
          logs.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '財務稽核紀錄載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchLogById(
        auditLogId: string,
      ): Promise<
        FinanceAuditLog | null
      > {
        const normalizedId =
          auditLogId.trim()

        if (!normalizedId) {
          currentLog.value =
            null

          error.value =
            '財務稽核紀錄 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceAuditLogById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.log
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentLog.value =
            response.log

          const index =
            logs.value.findIndex(
              (log) =>
                log.id ===
                response.log!.id,
            )

          if (index >= 0) {
            logs.value[index] =
              response.log
          }

          return response.log
        } catch (errorValue) {
          currentLog.value =
            null

          error.value =
            normalizeError(
              errorValue,
              '財務稽核紀錄詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function createLog(
        input:
          FinanceAuditLogCreateInput,
      ): Promise<
        FinanceAuditLog | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await createFinanceAuditLog(
              input,
            )

          if (
            !response.success ||
            !response.log
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentLog.value =
            response.log

          logs.value.unshift(
            response.log,
          )

          mutationMessage.value =
            response.message

          return response.log
        } catch (errorValue) {
          error.value =
            normalizeError(
              errorValue,
              '財務稽核紀錄建立失敗。',
            )

          return null
        } finally {
          isMutating.value = false
        }
      }
            async function searchLogs(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchLogs()
      }

      async function setModuleFilter(
        module:
          FinanceAuditLogFilters['module'],
      ): Promise<void> {
        filters.value.module =
          module

        filters.value.page =
          1

        await fetchLogs()
      }

      async function setActionFilter(
        action:
          FinanceAuditLogFilters['action'],
      ): Promise<void> {
        filters.value.action =
          action

        filters.value.page =
          1

        await fetchLogs()
      }

      async function setResultFilter(
        result:
          FinanceAuditLogFilters['result'],
      ): Promise<void> {
        filters.value.result =
          result

        filters.value.page =
          1

        await fetchLogs()
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

        await fetchLogs()
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

        await fetchLogs()
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

        await fetchLogs()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchLogs()
      }

      function clearCurrentLog():
        void {
        currentLog.value =
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
        logs,
        currentLog,
        filters,
        pagination,
        statistics,

        isLoading,
        isMutating,

        error,
        mutationMessage,

        hasLogs,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchLogs,
        fetchLogById,
        createLog,

        searchLogs,
        setModuleFilter,
        setActionFilter,
        setResultFilter,
        setDateRange,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentLog,
        clearError,
        clearMutationMessage,
      }
    },
  )

export default useFinanceAuditLogStore