/**
 * ALADDIN Enterprise V4
 *
 * Finance Wallet ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceWallet,
  FinanceWalletDetailResponse,
  FinanceWalletFilters,
  FinanceWalletListResponse,
  FinanceWalletPagination,
  FinanceWalletStatistics,
  FinanceWalletTransaction,
} from '../types/finance-wallet'

const WALLETS_TABLE =
  'finance_wallets'

const WALLET_TRANSACTIONS_TABLE =
  'finance_wallet_transactions'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceWalletRow {
  id?: unknown
  wallet_no?: unknown
  owner_type?: unknown
  owner_id?: unknown
  owner_name?: unknown
  owner_phone?: unknown
  currency?: unknown
  balance?: unknown
  frozen_balance?: unknown
  available_balance?: unknown
  total_income?: unknown
  total_expense?: unknown
  status?: unknown
  created_at?: unknown
  updated_at?: unknown
}

interface FinanceWalletTransactionRow {
  id?: unknown
  wallet_id?: unknown
  transaction_no?: unknown
  type?: unknown
  status?: unknown
  amount?: unknown
  balance_before?: unknown
  balance_after?: unknown
  currency?: unknown
  reference_type?: unknown
  reference_id?: unknown
  remark?: unknown
  created_at?: unknown
}

function createEmptyStatistics():
  FinanceWalletStatistics {
  return {
    totalWallets: 0,
    activeWallets: 0,
    frozenWallets: 0,
    disabledWallets: 0,
    totalBalance: 0,
    totalFrozenBalance: 0,
    totalAvailableBalance: 0,
  }
}

function createEmptyPagination():
  FinanceWalletPagination {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }
}

function normalizeString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback
}

function normalizeNullableString(
  value: unknown,
): string | null {
  return typeof value === 'string'
    ? value
    : null
}

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    const parsedValue =
      Number(value)

    return Number.isFinite(parsedValue)
      ? parsedValue
      : fallback
  }

  return fallback
}

function mapWallet(
  row: FinanceWalletRow,
): FinanceWallet {
  return {
    id:
      normalizeString(row.id),

    walletNo:
      normalizeString(
        row.wallet_no,
      ),

    ownerType:
      normalizeString(
        row.owner_type,
        'member',
      ) as FinanceWallet['ownerType'],

    ownerId:
      normalizeString(
        row.owner_id,
      ),

    ownerName:
      normalizeNullableString(
        row.owner_name,
      ),

    ownerPhone:
      normalizeNullableString(
        row.owner_phone,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    balance:
      normalizeNumber(
        row.balance,
      ),

    frozenBalance:
      normalizeNumber(
        row.frozen_balance,
      ),

    availableBalance:
      normalizeNumber(
        row.available_balance,
      ),

    totalIncome:
      normalizeNumber(
        row.total_income,
      ),

    totalExpense:
      normalizeNumber(
        row.total_expense,
      ),

    status:
      normalizeString(
        row.status,
        'active',
      ) as FinanceWallet['status'],

    createdAt:
      normalizeString(
        row.created_at,
      ),

    updatedAt:
      normalizeString(
        row.updated_at,
      ),
  }
}

function mapWalletTransaction(
  row:
    FinanceWalletTransactionRow,
): FinanceWalletTransaction {
  return {
    id:
      normalizeString(row.id),

    walletId:
      normalizeString(
        row.wallet_id,
      ),

    transactionNo:
      normalizeString(
        row.transaction_no,
      ),

    type:
      normalizeString(
        row.type,
        'adjustment',
      ) as FinanceWalletTransaction['type'],

    status:
      normalizeString(
        row.status,
        'pending',
      ) as FinanceWalletTransaction['status'],

    amount:
      normalizeNumber(
        row.amount,
      ),

    balanceBefore:
      normalizeNumber(
        row.balance_before,
      ),

    balanceAfter:
      normalizeNumber(
        row.balance_after,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    referenceType:
      normalizeNullableString(
        row.reference_type,
      ),

    referenceId:
      normalizeNullableString(
        row.reference_id,
      ),

    remark:
      normalizeNullableString(
        row.remark,
      ),

    createdAt:
      normalizeString(
        row.created_at,
      ),
  }
}
// =================================
// 錢包列表
// =================================

export async function getFinanceWallets(
  filters:
    FinanceWalletFilters,
): Promise<FinanceWalletListResponse> {
  try {
    const page =
      Number.isInteger(filters.page) &&
      filters.page > 0
        ? filters.page
        : 1

    const pageSize =
      Number.isInteger(
        filters.pageSize,
      ) &&
      filters.pageSize > 0
        ? filters.pageSize
        : DEFAULT_PAGE_SIZE

    const from =
      (page - 1) *
      pageSize

    const to =
      from +
      pageSize -
      1

    let query =
      supabase
        .from(
          WALLETS_TABLE,
        )
        .select(
          '*',
          {
            count:
              'exact',
          },
        )

    const keyword =
      filters.keyword?.trim() ||
      ''

    if (keyword) {
      query =
        query.or(
          [
            `wallet_no.ilike.%${keyword}%`,
            `owner_name.ilike.%${keyword}%`,
            `owner_phone.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (filters.ownerType) {
      query =
        query.eq(
          'owner_type',
          filters.ownerType,
        )
    }

    if (filters.status) {
      query =
        query.eq(
          'status',
          filters.status,
        )
    }

    const {
      data,
      error,
      count,
    } =
      await query
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )
        .range(
          from,
          to,
        )

    if (error) {
      throw error
    }

    const wallets =
      (data ?? []).map(
        (row) =>
          mapWallet(
            row as FinanceWalletRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      wallets.reduce<FinanceWalletStatistics>(
        (
          result,
          wallet,
        ) => {
          result.totalWallets += 1

          result.totalBalance +=
            wallet.balance

          result.totalFrozenBalance +=
            wallet.frozenBalance

          result.totalAvailableBalance +=
            wallet.availableBalance

          switch (
            wallet.status
          ) {
            case 'active':
              result.activeWallets += 1
              break

            case 'frozen':
              result.frozenWallets += 1
              break

            case 'disabled':
              result.disabledWallets += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      wallets,

      statistics,

      pagination: {
        page,

        pageSize,

        total,

        totalPages:
          total > 0
            ? Math.ceil(
                total /
                pageSize,
              )
            : 0,
      },

      message:
        '錢包資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      wallets:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '錢包資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '錢包資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 錢包詳情
// =================================

export async function getFinanceWalletById(
  walletId: string,
): Promise<FinanceWalletDetailResponse> {
  const normalizedId =
    walletId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      transactions:
        [],

      message:
        '錢包 ID 不可空白。',

      error:
        '錢包 ID 不可空白。',
    }
  }

  try {
    const [
      walletResult,
      transactionResult,
    ] =
      await Promise.all([
        supabase
          .from(
            WALLETS_TABLE,
          )
          .select('*')
          .eq(
            'id',
            normalizedId,
          )
          .single(),

        supabase
          .from(
            WALLET_TRANSACTIONS_TABLE,
          )
          .select('*')
          .eq(
            'wallet_id',
            normalizedId,
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            },
          ),
      ])

    if (
      walletResult.error
    ) {
      throw walletResult.error
    }

    if (
      transactionResult.error
    ) {
      throw transactionResult.error
    }

    const wallet =
      mapWallet(
        walletResult.data as
          FinanceWalletRow,
      )

    const transactions =
      (
        transactionResult.data ??
        []
      ).map(
        (row) =>
          mapWalletTransaction(
            row as
              FinanceWalletTransactionRow,
          ),
      )

    return {
      success:
        true,

      wallet,

      transactions,

      message:
        '錢包詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      transactions:
        [],

      message:
        '錢包詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '錢包詳情載入發生未知錯誤。',
    }
  }
}