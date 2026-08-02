/**
 * ALADDIN Enterprise V4
 *
 * Finance Settlement ERP
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
  getFinanceSettlementRequestById,
  getFinanceSettlementRequests,
  reviewFinanceSettlementRequest,
} from '../api/finance-settlement'

import type {
  FinanceSettlementFilters,
  FinanceSettlementPagination,
  FinanceSettlementRequest,
  FinanceSettlementReviewInput,
  FinanceSettlementStatistics,
} from '../types/finance-settlement'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceSettlementFilters {
  return {
    keyword:
      '',

    targetType:
      '',

    status:
      '',

    settlementCycle:
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
  FinanceSettlementPagination {
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
  FinanceSettlementStatistics {
  return {
    total:
      0,

    pending:
      0,

    reviewing:
      0,

    approved:
      0,

    processing:
      0,

    completed:
      0,

    rejected:
      0,

    grossAmount:
      0,

    serviceFee:
      0,

    netAmount:
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

export const useFinanceSettlementStore =
  defineStore(
    'finance-settlement',
    () => {
      const requests =
        ref<
          FinanceSettlementRequest[]
        >([])

      const currentRequest =
        ref<
          FinanceSettlementRequest |
          null
        >(null)

      const filters =
        ref<FinanceSettlementFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceSettlementPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceSettlementStatistics>(
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

      const hasRequests =
        computed(() =>
          requests.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          requests.value.length === 0,
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
              async function fetchRequests():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceSettlementRequests(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          requests.value =
            response.requests

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (errorValue) {
          requests.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '結算申請資料載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchRequestById(
        settlementId: string,
      ): Promise<
        FinanceSettlementRequest | null
      > {
        const normalizedId =
          settlementId.trim()

        if (!normalizedId) {
          currentRequest.value =
            null

          error.value =
            '結算申請 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceSettlementRequestById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.request
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentRequest.value =
            response.request

          const index =
            requests.value.findIndex(
              (request) =>
                request.id ===
                response.request!.id,
            )

          if (index >= 0) {
            requests.value[index] =
              response.request
          }

          return response.request
        } catch (errorValue) {
          currentRequest.value =
            null

          error.value =
            normalizeError(
              errorValue,
              '結算申請詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function reviewRequest(
        input:
          FinanceSettlementReviewInput,
      ): Promise<
        FinanceSettlementRequest | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await reviewFinanceSettlementRequest(
              input,
            )

          if (
            !response.success ||
            !response.request
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentRequest.value =
            response.request

          const index =
            requests.value.findIndex(
              (request) =>
                request.id ===
                response.request!.id,
            )

          if (index >= 0) {
            requests.value[index] =
              response.request
          }

          mutationMessage.value =
            response.message

          return response.request
        } catch (errorValue) {
          error.value =
            normalizeError(
              errorValue,
              '結算申請更新失敗。',
            )

          return null
        } finally {
          isMutating.value = false
        }
      }
            async function searchRequests(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setTargetTypeFilter(
        targetType:
          FinanceSettlementFilters['targetType'],
      ): Promise<void> {
        filters.value.targetType =
          targetType

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setStatusFilter(
        status:
          FinanceSettlementFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setSettlementCycleFilter(
        settlementCycle:
          FinanceSettlementFilters['settlementCycle'],
      ): Promise<void> {
        filters.value.settlementCycle =
          settlementCycle

        filters.value.page =
          1

        await fetchRequests()
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

        await fetchRequests()
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

        await fetchRequests()
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

        await fetchRequests()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchRequests()
      }

      function clearCurrentRequest():
        void {
        currentRequest.value =
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
        requests,
        currentRequest,
        filters,
        pagination,
        statistics,
        isLoading,
        isMutating,
        error,
        mutationMessage,

        hasRequests,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchRequests,
        fetchRequestById,
        reviewRequest,

        searchRequests,
        setTargetTypeFilter,
        setStatusFilter,
        setSettlementCycleFilter,
        setDateRange,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentRequest,
        clearError,
        clearMutationMessage,
      }
    },
  )

export default useFinanceSettlementStore