/**
 * ALADDIN Enterprise V4
 *
 * Finance Wallet ERP
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
  getFinanceWalletById,
  getFinanceWallets,
} from '../api/finance-wallet'

import type {
  FinanceWallet,
  FinanceWalletFilters,
  FinanceWalletPagination,
  FinanceWalletStatistics,
  FinanceWalletTransaction,
} from '../types/finance-wallet'

const DEFAULT_PAGE_SIZE =
  20

function createDefaultFilters():
  FinanceWalletFilters {
  return {
    keyword:
      '',

    ownerType:
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
  FinanceWalletPagination {
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
  FinanceWalletStatistics {
  return {
    totalWallets:
      0,

    activeWallets:
      0,

    frozenWallets:
      0,

    disabledWallets:
      0,

    totalBalance:
      0,

    totalFrozenBalance:
      0,

    totalAvailableBalance:
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

export const useFinanceWalletStore =
  defineStore(
    'finance-wallet',
    () => {
      const wallets =
        ref<FinanceWallet[]>([])

      const currentWallet =
        ref<FinanceWallet | null>(
          null,
        )

      const currentTransactions =
        ref<
          FinanceWalletTransaction[]
        >([])

      const filters =
        ref<FinanceWalletFilters>(
          createDefaultFilters(),
        )

      const pagination =
        ref<FinanceWalletPagination>(
          createEmptyPagination(),
        )

      const statistics =
        ref<FinanceWalletStatistics>(
          createEmptyStatistics(),
        )

      const isLoading =
        ref(false)

      const error =
        ref<string | null>(
          null,
        )

      const hasWallets =
        computed(() =>
          wallets.value.length > 0,
        )

      const isEmpty =
        computed(() =>
          !isLoading.value &&
          wallets.value.length === 0,
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
              async function fetchWallets():
        Promise<void> {
        if (isLoading.value) {
          return
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceWallets(
              filters.value,
            )

          if (!response.success) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          wallets.value =
            response.wallets

          statistics.value =
            response.statistics

          pagination.value =
            response.pagination
        } catch (errorValue) {
          wallets.value = []

          statistics.value =
            createEmptyStatistics()

          pagination.value =
            createEmptyPagination()

          error.value =
            normalizeError(
              errorValue,
              '錢包資料載入失敗。',
            )
        } finally {
          isLoading.value = false
        }
      }

      async function fetchWalletById(
        walletId: string,
      ): Promise<FinanceWallet | null> {
        const normalizedId =
          walletId.trim()

        if (!normalizedId) {
          currentWallet.value =
            null

          currentTransactions.value =
            []

          error.value =
            '錢包 ID 不可空白。'

          return null
        }

        isLoading.value = true
        error.value = null

        try {
          const response =
            await getFinanceWalletById(
              normalizedId,
            )

          if (
            !response.success ||
            !response.wallet
          ) {
            throw new Error(
              response.error ||
              response.message,
            )
          }

          currentWallet.value =
            response.wallet

          currentTransactions.value =
            response.transactions

          const index =
            wallets.value.findIndex(
              (wallet) =>
                wallet.id ===
                response.wallet!.id,
            )

          if (index >= 0) {
            wallets.value[index] =
              response.wallet
          }

          return response.wallet
        } catch (errorValue) {
          currentWallet.value =
            null

          currentTransactions.value =
            []

          error.value =
            normalizeError(
              errorValue,
              '錢包詳情載入失敗。',
            )

          return null
        } finally {
          isLoading.value = false
        }
      }
            async function searchWallets(
        keyword: string,
      ): Promise<void> {
        filters.value.keyword =
          keyword.trim()

        filters.value.page =
          1

        await fetchWallets()
      }

      async function setOwnerTypeFilter(
        ownerType:
          FinanceWalletFilters['ownerType'],
      ): Promise<void> {
        filters.value.ownerType =
          ownerType

        filters.value.page =
          1

        await fetchWallets()
      }

      async function setStatusFilter(
        status:
          FinanceWalletFilters['status'],
      ): Promise<void> {
        filters.value.status =
          status

        filters.value.page =
          1

        await fetchWallets()
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

        await fetchWallets()
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

        await fetchWallets()
      }

      async function resetFilters():
        Promise<void> {
        filters.value =
          createDefaultFilters()

        await fetchWallets()
      }

      function clearCurrentWallet():
        void {
        currentWallet.value =
          null

        currentTransactions.value =
          []
      }

      function clearError():
        void {
        error.value =
          null
      }

      return {
        wallets,
        currentWallet,
        currentTransactions,
        filters,
        pagination,
        statistics,
        isLoading,
        error,

        hasWallets,
        isEmpty,
        hasPreviousPage,
        hasNextPage,

        fetchWallets,
        fetchWalletById,
        searchWallets,
        setOwnerTypeFilter,
        setStatusFilter,
        setPage,
        setPageSize,
        resetFilters,

        clearCurrentWallet,
        clearError,
      }
    },
  )

export default useFinanceWalletStore