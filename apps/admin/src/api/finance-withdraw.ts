/**
 * ALADDIN Enterprise V4
 *
 * Finance Withdraw ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceWithdrawDetailResponse,
  FinanceWithdrawFilters,
  FinanceWithdrawListResponse,
  FinanceWithdrawMutationResponse,
  FinanceWithdrawPagination,
  FinanceWithdrawRequest,
  FinanceWithdrawReviewInput,
  FinanceWithdrawStatistics,
} from '../types/finance-withdraw'

const WITHDRAW_TABLE =
  'finance_withdraw_requests'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceWithdrawRow {
  id?: unknown
  withdraw_no?: unknown
  wallet_id?: unknown
  owner_type?: unknown
  owner_id?: unknown
  owner_name?: unknown
  owner_phone?: unknown
  amount?: unknown
  fee_amount?: unknown
  actual_amount?: unknown
  currency?: unknown
  account_type?: unknown
  account_name?: unknown
  account_no?: unknown
  bank_name?: unknown
  bank_branch?: unknown
  status?: unknown
  apply_remark?: unknown
  review_remark?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  completed_at?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  FinanceWithdrawStatistics {
  return {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
  }
}

function createEmptyPagination():
  FinanceWithdrawPagination {
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

function mapWithdrawRequest(
  row: FinanceWithdrawRow,
): FinanceWithdrawRequest {
  return {
    id:
      normalizeString(row.id),

    withdrawNo:
      normalizeString(
        row.withdraw_no,
      ),

    walletId:
      normalizeString(
        row.wallet_id,
      ),

    ownerType:
      normalizeString(
        row.owner_type,
        'member',
      ) as FinanceWithdrawRequest['ownerType'],

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

    amount:
      normalizeNumber(
        row.amount,
      ),

    feeAmount:
      normalizeNumber(
        row.fee_amount,
      ),

    actualAmount:
      normalizeNumber(
        row.actual_amount,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    accountType:
      normalizeString(
        row.account_type,
        'bank',
      ) as FinanceWithdrawRequest['accountType'],

    accountName:
      normalizeNullableString(
        row.account_name,
      ),

    accountNo:
      normalizeNullableString(
        row.account_no,
      ),

    bankName:
      normalizeNullableString(
        row.bank_name,
      ),

    bankBranch:
      normalizeNullableString(
        row.bank_branch,
      ),

    status:
      normalizeString(
        row.status,
        'pending',
      ) as FinanceWithdrawRequest['status'],

    applyRemark:
      normalizeNullableString(
        row.apply_remark,
      ),

    reviewRemark:
      normalizeNullableString(
        row.review_remark,
      ),

    reviewedBy:
      normalizeNullableString(
        row.reviewed_by,
      ),

    reviewedAt:
      normalizeNullableString(
        row.reviewed_at,
      ),

    completedAt:
      normalizeNullableString(
        row.completed_at,
      ),

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
// =================================
// 提款申請列表
// =================================

export async function getFinanceWithdrawRequests(
  filters:
    FinanceWithdrawFilters,
): Promise<FinanceWithdrawListResponse> {
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
          WITHDRAW_TABLE,
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
            `withdraw_no.ilike.%${keyword}%`,
            `owner_name.ilike.%${keyword}%`,
            `owner_phone.ilike.%${keyword}%`,
            `account_no.ilike.%${keyword}%`,
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

    if (filters.startDate) {
      query =
        query.gte(
          'created_at',
          filters.startDate,
        )
    }

    if (filters.endDate) {
      query =
        query.lte(
          'created_at',
          filters.endDate,
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

    const requests =
      (data ?? []).map(
        (row) =>
          mapWithdrawRequest(
            row as
              FinanceWithdrawRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      requests.reduce<
        FinanceWithdrawStatistics
      >(
        (
          result,
          request,
        ) => {
          result.total += 1

          result.totalAmount +=
            request.amount

          switch (
            request.status
          ) {
            case 'pending':
              result.pending += 1
              result.pendingAmount +=
                request.amount
              break

            case 'approved':
              result.approved += 1
              break

            case 'rejected':
              result.rejected += 1
              break

            case 'processing':
              result.processing += 1
              break

            case 'completed':
              result.completed += 1
              result.completedAmount +=
                request.actualAmount
              break

            case 'cancelled':
              result.cancelled += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      requests,

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
        '提款申請資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      requests:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '提款申請資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '提款申請資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 提款申請詳情
// =================================

export async function getFinanceWithdrawRequestById(
  withdrawId: string,
): Promise<FinanceWithdrawDetailResponse> {
  const normalizedId =
    withdrawId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '提款申請 ID 不可空白。',

      error:
        '提款申請 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          WITHDRAW_TABLE,
        )
        .select('*')
        .eq(
          'id',
          normalizedId,
        )
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      request:
        mapWithdrawRequest(
          data as
            FinanceWithdrawRow,
        ),

      message:
        '提款申請詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '提款申請詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '提款申請詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 審核／更新提款申請
// =================================

export async function reviewFinanceWithdrawRequest(
  input:
    FinanceWithdrawReviewInput,
): Promise<FinanceWithdrawMutationResponse> {
  const normalizedId =
    input.withdrawId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '提款申請 ID 不可空白。',

      error:
        '提款申請 ID 不可空白。',
    }
  }

  const now =
    new Date().toISOString()

  const payload:
    Record<string, unknown> = {
      status:
        input.status,

      review_remark:
        input.reviewRemark ??
        null,

      reviewed_by:
        input.reviewedBy ??
        null,

      reviewed_at:
        now,

      updated_at:
        now,
    }

  if (
    input.status ===
    'completed'
  ) {
    payload.completed_at =
      now
  }

  if (
    input.status !==
    'completed'
  ) {
    payload.completed_at =
      null
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          WITHDRAW_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      request:
        mapWithdrawRequest(
          data as
            FinanceWithdrawRow,
        ),

      message:
        getMutationMessage(
          input.status,
        ),
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '提款申請更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '提款申請更新發生未知錯誤。',
    }
  }
}

function getMutationMessage(
  status:
    FinanceWithdrawReviewInput['status'],
): string {
  const messageMap:
    Record<
      FinanceWithdrawReviewInput['status'],
      string
    > = {
      approved:
        '提款申請已通過。',

      rejected:
        '提款申請已拒絕。',

      processing:
        '提款申請已進入處理中。',

      completed:
        '提款申請已完成。',

      cancelled:
        '提款申請已取消。',
    }

  return messageMap[status]
}