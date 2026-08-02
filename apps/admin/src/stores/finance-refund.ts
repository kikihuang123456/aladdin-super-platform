/**
 * ALADDIN Enterprise V4
 *
 * Finance Refund ERP
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
  getFinanceRefundRequestById,
  getFinanceRefundRequests,
  reviewFinanceRefundRequest,
} from '../api/finance-refund'

import type {
  FinanceRefundFilters,
  FinanceRefundPagination,
  FinanceRefundRequest,
  FinanceRefundReviewInput,
  FinanceRefundStatistics,
} from '../types/finance-refund'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceRefundFilters {
  return {
    keyword:
      '',

    applicantType:
      '',

    status:
      '',

    refundMethod:
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
  FinanceRefundPagination {
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
  FinanceRefundStatistics {
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

    requestedAmount:
      0,

    approvedAmount:
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

export const useFinanceRefundStore =
  defineStore(
    'finance-refund',
    () => {
      const requests =
        ref<
          FinanceRefundRequest[]
        >([])

      const currentRequest =
        ref<
          FinanceRefundRequest |
          null
        >(null)

      const filters =
        ref<FinanceRefundFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceRefundPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceRefundStatistics>(
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
            await getFinanceRefundRequests(
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
              '退款申請資料載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchRequestById(
        refundId: string,
      ): Promise<
        FinanceRefundRequest | null
      > {
        const normalizedId =
          refundId.trim()

        if (!normalizedId) {
          currentRequest.value =
            null

          error.value =
            '退款申請 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceRefundRequestById(
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
              '退款申請詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function reviewRequest(
        input:
          FinanceRefundReviewInput,
      ): Promise<
        FinanceRefundRequest | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await reviewFinanceRefundRequest(
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
              '退款申請更新失敗。',
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

      async function setApplicantTypeFilter(
        applicantType:
          FinanceRefundFilters['applicantType'],
      ): Promise<void> {
        filters.value.applicantType =
          applicantType

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setStatusFilter(
        status:
          FinanceRefundFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchRequests()
      }

      async function setRefundMethodFilter(
        refundMethod:
          FinanceRefundFilters['refundMethod'],
      ): Promise<void> {
        filters.value.refundMethod =
          refundMethod

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
        setApplicantTypeFilter,
        setStatusFilter,
        setRefundMethodFilter,
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

export default useFinanceRefundStore