import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  createMallProduct,
  getMallProductById,
  getMallProducts,
  updateMallProduct,
} from '../api/mall'

import type {
  CreateMallProductInput,
  MallFilters,
  MallPagination,
  MallProduct,
  MallProductStatus,
  MallStatistics,
  UpdateMallProductInput,
} from '../types/mall'

const DEFAULT_PAGE_SIZE = 20

function createEmptyStatistics():
  MallStatistics {
  return {
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    disabled: 0,
    totalStock: 0,
    totalSales: 0,
  }
}

function createEmptyPagination():
  MallPagination {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }
}

function createDefaultFilters():
  MallFilters {
  return {
    keyword: '',
    categoryId: '',
    brandId: '',
    status: undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }
}

function normalizeError(
  caughtError: unknown,
  fallbackMessage: string,
): string {
  return caughtError instanceof Error
    ? caughtError.message
    : fallbackMessage
}

export const useMallStore =
  defineStore(
    'mall',
    () => {
      const products =
        ref<MallProduct[]>([])

      const currentProduct =
        ref<MallProduct | null>(
          null,
        )

      const statistics =
        ref<MallStatistics>(
          createEmptyStatistics(),
        )

      const pagination =
        ref<MallPagination>(
          createEmptyPagination(),
        )

      const filters =
        ref<MallFilters>(
          createDefaultFilters(),
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

      const currentPage =
        computed(() =>
          pagination.value.page,
        )

      const totalPages =
        computed(() =>
          pagination.value.totalPages,
        )

      const totalProducts =
        computed(() =>
          pagination.value.total,
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

      function replaceProductInList(
        product: MallProduct,
      ): void {
        const productIndex =
          products.value.findIndex(
            (currentItem) =>
              currentItem.id ===
              product.id,
          )

        if (productIndex < 0) {
          products.value = [
            product,
            ...products.value,
          ]

          return
        }

        products.value[
          productIndex
        ] = product
      }

      async function fetchProducts():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getMallProducts({
              ...filters.value,
            })

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message ||
              '商品資料載入失敗。',
            )
          }

          products.value =
            response.products

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (caughtError) {
          products.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              caughtError,
              '商品資料載入發生未知錯誤。',
            )

          console.error(
            '[MallStore] fetchProducts failed:',
            caughtError,
          )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchProductById(
        productId: string,
      ): Promise<MallProduct | null> {
        const normalizedProductId =
          productId.trim()

        if (!normalizedProductId) {
          currentProduct.value =
            null

          error.value =
            '商品 ID 不可空白。'

          return null
        }

        if (isLoading.value) {
          return currentProduct.value
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getMallProductById(
              normalizedProductId,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message ||
              '商品資料載入失敗。',
            )
          }

          const product =
            response.product

          currentProduct.value =
            product

          replaceProductInList(
            product,
          )

          return product
        } catch (caughtError) {
          currentProduct.value =
            null

          error.value =
            normalizeError(
              caughtError,
              '商品資料載入發生未知錯誤。',
            )

          console.error(
            '[MallStore] fetchProductById failed:',
            caughtError,
          )

          return null
        } finally {
          isLoading.value = false
        }
      }

      async function createProduct(
        input: CreateMallProductInput,
      ): Promise<MallProduct | null> {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await createMallProduct(
              input,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message ||
              '商品新增失敗。',
            )
          }

          const createdProduct =
            response.product

          currentProduct.value =
            createdProduct

          replaceProductInList(
            createdProduct,
          )

          mutationMessage.value =
            response.message ||
            '商品新增成功。'

          return createdProduct
        } catch (caughtError) {
          error.value =
            normalizeError(
              caughtError,
              '商品新增發生未知錯誤。',
            )

          console.error(
            '[MallStore] createProduct failed:',
            caughtError,
          )

          return null
        } finally {
          isMutating.value = false
        }
      }

      async function updateProduct(
        input: UpdateMallProductInput,
      ): Promise<MallProduct | null> {
        if (isMutating.value) {
          return null
        }

        isMutating.value = true
        error.value = null
        mutationMessage.value = null

        try {
          const response =
            await updateMallProduct(
              input,
            )

          if (
            !response.success ||
            !response.product
          ) {
            throw new Error(
              response.error ||
              response.message ||
              '商品更新失敗。',
            )
          }

          const updatedProduct =
            response.product

          currentProduct.value =
            updatedProduct

          replaceProductInList(
            updatedProduct,
          )

          mutationMessage.value =
            response.message ||
            '商品更新成功。'

          return updatedProduct
        } catch (caughtError) {
          error.value =
            normalizeError(
              caughtError,
              '商品更新發生未知錯誤。',
            )

          console.error(
            '[MallStore] updateProduct failed:',
            caughtError,
          )

          return null
        } finally {
          isMutating.value = false
        }
      }

      async function refreshProducts():
        Promise<void> {
        await fetchProducts()
      }

      async function searchProducts(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page = 1

        await fetchProducts()
      }

      async function setStatusFilter(
        status:
          MallProductStatus | '',
      ): Promise<void> {
        filters.value.status =
          status || undefined

        filters.value.page = 1

        await fetchProducts()
      }

      async function setCategoryFilter(
        categoryId: string,
      ): Promise<void> {
        filters.value.categoryId =
          categoryId.trim()

        filters.value.page = 1

        await fetchProducts()
      }

      async function setBrandFilter(
        brandId: string,
      ): Promise<void> {
        filters.value.brandId =
          brandId.trim()

        filters.value.page = 1

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

      async function goToPreviousPage():
        Promise<void> {
        if (
          !hasPreviousPage.value
        ) {
          return
        }

        await setPage(
          pagination.value.page - 1,
        )
      }

      async function goToNextPage():
        Promise<void> {
        if (
          !hasNextPage.value
        ) {
          return
        }

        await setPage(
          pagination.value.page + 1,
        )
      }

      async function setPageSize(
        pageSize: number,
      ): Promise<void> {
        if (
          !Number.isInteger(
            pageSize,
          ) ||
          pageSize < 1
        ) {
          return
        }

        filters.value.pageSize =
          pageSize

        filters.value.page = 1

        await fetchProducts()
      }

      async function applyFilters(
        nextFilters:
          Partial<MallFilters>,
      ): Promise<void> {
        filters.value = {
          ...filters.value,
          ...nextFilters,
          page: 1,
        }

        await fetchProducts()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchProducts()
      }

      function setCurrentProduct(
        product:
          MallProduct | null,
      ): void {
        currentProduct.value =
          product
      }

      function clearCurrentProduct():
        void {
        currentProduct.value =
          null
      }

      function clearError():
        void {
        error.value = null
      }

      function clearMutationMessage():
        void {
        mutationMessage.value =
          null
      }

      function clearMallState():
        void {
        products.value = []

        currentProduct.value =
          null

        statistics.value =
          createEmptyStatistics()

        pagination.value =
          createEmptyPagination()

        filters.value =
          createDefaultFilters()

        isLoading.value = false
        isMutating.value = false
        error.value = null

        mutationMessage.value =
          null
      }

      return {
        products,
        currentProduct,
        statistics,
        pagination,
        filters,
        isLoading,
        isMutating,
        error,
        mutationMessage,

        hasProducts,
        isEmpty,
        currentPage,
        totalPages,
        totalProducts,
        hasPreviousPage,
        hasNextPage,

        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        refreshProducts,

        searchProducts,
        setStatusFilter,
        setCategoryFilter,
        setBrandFilter,
        setPage,
        goToPreviousPage,
        goToNextPage,
        setPageSize,
        applyFilters,
        resetFilters,

        setCurrentProduct,
        clearCurrentProduct,
        clearError,
        clearMutationMessage,
        clearMallState,
      }
    },
  )

export default useMallStore