/**
 * ALADDIN Enterprise V4
 *
 * Finance Withdraw ERP
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
  getFinanceWithdrawRequestById,
  getFinanceWithdrawRequests,
  reviewFinanceWithdrawRequest,
} from '../api/finance-withdraw'

import type {
  FinanceWithdrawFilters,
  FinanceWithdrawPagination,
  FinanceWithdrawRequest,
  FinanceWithdrawReviewInput,
  FinanceWithdrawStatistics,
} from '../types/finance-withdraw'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceWithdrawFilters {
  return {
    keyword:
      '',

    ownerType:
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
  FinanceWithdrawPagination {
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
  FinanceWithdrawStatistics {
  return {
    total:
      0,

    pending:
      0,

    approved:
      0,

    rejected:
      0,

    processing:
      0,

    completed:
      0,

    cancelled:
      0,

    totalAmount:
      0,

    pendingAmount:
      0,

    completedAmount:
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

export const useFinanceWithdrawStore =
  defineStore(
    'finance-withdraw',
    () => {
      const requests =
        ref<
          FinanceWithdrawRequest[]
        >([])

      const currentRequest =
        ref<
          FinanceWithdrawRequest |
          null
        >(null)

      const filters =
        ref<FinanceWithdrawFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceWithdrawPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceWithdrawStatistics>(
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
            await getFinanceWithdrawRequests(
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
              '提款申請資料載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchRequestById(
        withdrawId: string,
      ): Promise<
        FinanceWithdrawRequest | null
      > {
        const normalizedId =
          withdrawId.trim()

        if (!normalizedId) {
          currentRequest.value =
            null

          error.value =
            '提款申請 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceWithdrawRequestById(
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
              '提款申請詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function reviewRequest(
        input:
          FinanceWithdrawReviewInput,
      ): Promise<
        FinanceWithdrawRequest | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await reviewFinanceWithdrawRequest(
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
              '提款申請更新失敗。',
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

      async function setOwnerTypeFilter(
        ownerType:
          FinanceWithdrawFilters['ownerType'],
      ): Promise<void> {
        filters.value.ownerType =
          ownerType

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setStatusFilter(
        status:
          FinanceWithdrawFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

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
        setOwnerTypeFilter,
        setStatusFilter,
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

export default useFinanceWithdrawStore