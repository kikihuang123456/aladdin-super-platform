/**
 * ALADDIN Enterprise V4
 *
 * Merchant Product ERP
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
  getMerchantProductById,
  getMerchantProducts,
  reviewMerchantProduct,
  updateMerchantProductStatus,
  updateMerchantProductStock,
} from '../api/merchant-product'

import type {
  MerchantProduct,
  MerchantProductFilters,
  MerchantProductPagination,
  MerchantProductReviewInput,
  MerchantProductStatistics,
  MerchantProductStatusUpdateInput,
  MerchantProductStockUpdateInput,
} from '../types/merchant-product'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  MerchantProductFilters {
  return {
    keyword:
      '',

    merchantId:
      null,

    productId:
      null,

    status:
      '',

    isListed:
      null,

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,
  }
}

function createEmptyPagination():
  MerchantProductPagination {
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
  MerchantProductStatistics {
  return {
    total:
      0,

    draft:
      0,

    pending:
      0,

    approved:
      0,

    rejected:
      0,

    active:
      0,

    inactive:
      0,

    listed:
      0,

    unlisted:
      0,

    totalStock:
      0,

    availableStock:
      0,

    lowStock:
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

export const useMerchantProductStore =
  defineStore(
    'merchant-product',
    () => {
      const products =
        ref<
          MerchantProduct[]
        >([])

      const currentProduct =
        ref<
          MerchantProduct |
          null
        >(null)

      const filters =
        ref<
          MerchantProductFilters
        >(
          createDefaultFilters(),
        )

      const pagination =
        ref<
          MerchantProductPagination
        >(
          createEmptyPagination(),
        )

      const statistics =
        ref<
          MerchantProductStatistics
        >(
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

      const hasProducts =
        computed(() =>
          products.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          products.value.length === 0,
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
              async function fetchProducts():
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
            await getMerchantProducts(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          products.value =
            response.products

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (
          errorValue
        ) {
          products.value =
            []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '商家商品資料載入失敗。',
            )
        } finally {
          isLoading.value =
            false
        }
      }

      async function fetchProductById(
        merchantProductId: string,
      ): Promise<
        MerchantProduct | null
      > {
        const normalizedId =
          merchantProductId.trim()

        if (!normalizedId) {
          currentProduct.value =
            null

          error.value =
            '商家商品 ID 不可空白。'

          return null
        }

        isLoading.value =
          true

        error.value =
          null

        try {
          const response =
            await getMerchantProductById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentProduct.value =
            response.product

          const index =
            products.value.findIndex(
              (product) =>
                product.id ===
                response.product!.id,
            )

          if (index >= 0) {
            products.value[index] =
              response.product
          }

          return response.product
        } catch (
          errorValue
        ) {
          currentProduct.value =
            null

          error.value =
            normalizeError(
              errorValue,
              '商家商品詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value =
            false
        }
      }

      async function reviewProduct(
        input:
          MerchantProductReviewInput,
      ): Promise<
        MerchantProduct | null
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
            await reviewMerchantProduct(
              input,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentProduct.value =
            response.product

          const index =
            products.value.findIndex(
              (product) =>
                product.id ===
                response.product!.id,
            )

          if (index >= 0) {
            products.value[index] =
              response.product
          }

          mutationMessage.value =
            response.message

          return response.product
        } catch (
          errorValue
        ) {
          error.value =
            normalizeError(
              errorValue,
              '商家商品審核失敗。',
            )

          return null
        } finally {
          isMutating.value =
            false
        }
      }

      async function updateStatus(
        input:
          MerchantProductStatusUpdateInput,
      ): Promise<
        MerchantProduct | null
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
            await updateMerchantProductStatus(
              input,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentProduct.value =
            response.product

          const index =
            products.value.findIndex(
              (product) =>
                product.id ===
                response.product!.id,
            )

          if (index >= 0) {
            products.value[index] =
              response.product
          }

          mutationMessage.value =
            response.message

          return response.product
        } catch (
          errorValue
        ) {
          error.value =
            normalizeError(
              errorValue,
              '商家商品狀態更新失敗。',
            )

          return null
        } finally {
          isMutating.value =
            false
        }
      }

      async function updateStock(
        input:
          MerchantProductStockUpdateInput,
      ): Promise<
        MerchantProduct | null
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
            await updateMerchantProductStock(
              input,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentProduct.value =
            response.product

          const index =
            products.value.findIndex(
              (product) =>
                product.id ===
                response.product!.id,
            )

          if (index >= 0) {
            products.value[index] =
              response.product
          }

          mutationMessage.value =
            response.message

          return response.product
        } catch (
          errorValue
        ) {
          error.value =
            normalizeError(
              errorValue,
              '商家商品庫存更新失敗。',
            )

          return null
        } finally {
          isMutating.value =
            false
        }
      }
            async function searchProducts(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchProducts()
      }

      async function setMerchantFilter(
        merchantId:
          string | null,
      ): Promise<void> {
        filters.value.merchantId =
          merchantId

        filters.value.page =
          1

        await fetchProducts()
      }

      async function setProductFilter(
        productId:
          string | null,
      ): Promise<void> {
        filters.value.productId =
          productId

        filters.value.page =
          1

        await fetchProducts()
      }

      async function setStatusFilter(
        status:
          MerchantProductFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchProducts()
      }

      async function setListedFilter(
        isListed:
          boolean | null,
      ): Promise<void> {
        filters.value.isListed =
          isListed

        filters.value.page =
          1

        await fetchProducts()
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

        await fetchProducts()
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

        await fetchProducts()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchProducts()
      }

      function clearCurrentProduct():
        void {
        currentProduct.value =
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
        products,
        currentProduct,
        filters,
        pagination,
        statistics,

        isLoading,
        isMutating,

        error,
        mutationMessage,

        hasProducts,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchProducts,
        fetchProductById,
        reviewProduct,
        updateStatus,
        updateStock,

        searchProducts,
        setMerchantFilter,
        setProductFilter,
        setStatusFilter,
        setListedFilter,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentProduct,
        clearError,
        clearMutationMessage,
      }
    },
  )

export default useMerchantProductStore