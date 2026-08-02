/**
 * ALADDIN Enterprise V4
 *
 * Merchant ERP
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
  getMerchantById,
  getMerchants,
  reviewMerchant,
  updateMerchantStatus,
} from '../api/merchant'

import type {
  Merchant,
  MerchantFilters,
  MerchantPagination,
  MerchantReviewInput,
  MerchantStatistics,
  MerchantStatusUpdateInput,
} from '../types/merchant'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  MerchantFilters {
  return {
    keyword:
      '',

    merchantType:
      '',

    market:
      '',

    status:
      '',

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,
  }
}

function createEmptyPagination():
  MerchantPagination {
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
  MerchantStatistics {
  return {
    total:
      0,

    pending:
      0,

    approved:
      0,

    active:
      0,

    suspended:
      0,

    rejected:
      0,

    disabled:
      0,

    taiwan:
      0,

    china:
      0,

    crossBorder:
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

export const useMerchantStore =
  defineStore(
    'merchant',
    () => {
      const merchants =
        ref<Merchant[]>([])

      const currentMerchant =
        ref<Merchant | null>(
          null,
        )

      const filters =
        ref<MerchantFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<MerchantPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<MerchantStatistics>(
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

      const hasMerchants =
        computed(() =>
          merchants.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          merchants.value.length === 0,
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
              async function fetchMerchants():
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
            await getMerchants(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          merchants.value =
            response.merchants

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (
          errorValue
        ) {
          merchants.value =
            []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '商家資料載入失敗。',
            )
        } finally {
          isLoading.value =
            false
        }
      }

      async function fetchMerchantById(
        merchantId: string,
      ): Promise<
        Merchant | null
      > {
        const normalizedId =
          merchantId.trim()

        if (!normalizedId) {
          currentMerchant.value =
            null

          error.value =
            '商家 ID 不可空白。'

          return null
        }

        isLoading.value =
          true

        error.value =
          null

        try {
          const response =
            await getMerchantById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.merchant
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentMerchant.value =
            response.merchant

          const index =
            merchants.value.findIndex(
              (merchant) =>
                merchant.id ===
                response.merchant!.id,
            )

          if (index >= 0) {
            merchants.value[index] =
              response.merchant
          }

          return response.merchant
        } catch (
          errorValue
        ) {
          currentMerchant.value =
            null

          error.value =
            normalizeError(
              errorValue,
              '商家詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value =
            false
        }
      }

      async function reviewMerchantRequest(
        input:
          MerchantReviewInput,
      ): Promise<
        Merchant | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value =
          true

        error.value =
          null

        mutationMessage.value =
          null

        try {
          const response =
            await reviewMerchant(
              input,
            )

          if (
            !response.success ||
            !response.merchant
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentMerchant.value =
            response.merchant

          const index =
            merchants.value.findIndex(
              (merchant) =>
                merchant.id ===
                response.merchant!.id,
            )

          if (index >= 0) {
            merchants.value[index] =
              response.merchant
          }

          mutationMessage.value =
            response.message

          return response.merchant
        } catch (
          errorValue
        ) {
          error.value =
            normalizeError(
              errorValue,
              '商家審核失敗。',
            )

          return null
        } finally {
          isMutating.value =
            false
        }
      }

      async function updateStatus(
        input:
          MerchantStatusUpdateInput,
      ): Promise<
        Merchant | null
      > {
        if (isMutating.value) {
          return null
        }

        isMutating.value =
          true

        error.value =
          null

        mutationMessage.value =
          null

        try {
          const response =
            await updateMerchantStatus(
              input,
            )

          if (
            !response.success ||
            !response.merchant
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentMerchant.value =
            response.merchant

          const index =
            merchants.value.findIndex(
              (merchant) =>
                merchant.id ===
                response.merchant!.id,
            )

          if (index >= 0) {
            merchants.value[index] =
              response.merchant
          }

          mutationMessage.value =
            response.message

          return response.merchant
        } catch (
          errorValue
        ) {
          error.value =
            normalizeError(
              errorValue,
              '商家狀態更新失敗。',
            )

          return null
        } finally {
          isMutating.value =
            false
        }
      }
            async function searchMerchants(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchMerchants()
      }

      async function setMerchantTypeFilter(
        merchantType:
          MerchantFilters['merchantType'],
      ): Promise<void> {
        filters.value.merchantType =
          merchantType

        filters.value.page =
          1

        await fetchMerchants()
      }

      async function setMarketFilter(
        market:
          MerchantFilters['market'],
      ): Promise<void> {
        filters.value.market =
          market

        filters.value.page =
          1

        await fetchMerchants()
      }

      async function setStatusFilter(
        status:
          MerchantFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchMerchants()
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

        await fetchMerchants()
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

        await fetchMerchants()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchMerchants()
      }

      function clearCurrentMerchant():
        void {
        currentMerchant.value =
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
        merchants,
        currentMerchant,
        filters,
        pagination,
        statistics,

        isLoading,
        isMutating,

        error,
        mutationMessage,

        hasMerchants,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchMerchants,
        fetchMerchantById,
        reviewMerchantRequest,
        updateStatus,

        searchMerchants,
        setMerchantTypeFilter,
        setMarketFilter,
        setStatusFilter,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentMerchant,
        clearError,
        clearMutationMessage,
      }
    },
  )

export default useMerchantStore