/**
 * ALADDIN Enterprise V4
 *
 * Finance Settlement ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceSettlementDetailResponse,
  FinanceSettlementFilters,
  FinanceSettlementListResponse,
  FinanceSettlementMutationResponse,
  FinanceSettlementPagination,
  FinanceSettlementRequest,
  FinanceSettlementReviewInput,
  FinanceSettlementStatistics,
} from '../types/finance-settlement'

const SETTLEMENT_TABLE =
  'finance_settlement_requests'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceSettlementRow {
  id?: unknown
  settlement_no?: unknown
  target_type?: unknown
  target_id?: unknown
  target_name?: unknown
  period_start?: unknown
  period_end?: unknown
  settlement_cycle?: unknown
  order_count?: unknown
  gross_amount?: unknown
  service_fee?: unknown
  adjustment_amount?: unknown
  net_amount?: unknown
  currency?: unknown
  status?: unknown
  review_remark?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  completed_at?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  FinanceSettlementStatistics {
  return {
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    grossAmount: 0,
    serviceFee: 0,
    netAmount: 0,
  }
}

function createEmptyPagination():
  FinanceSettlementPagination {
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
    const parsed =
      Number(value)

    return Number.isFinite(parsed)
      ? parsed
      : fallback
  }

  return fallback
}

function mapSettlementRequest(
  row: FinanceSettlementRow,
): FinanceSettlementRequest {
  return {
    id:
      normalizeString(row.id),

    settlementNo:
      normalizeString(
        row.settlement_no,
      ),

    targetType:
      normalizeString(
        row.target_type,
        'merchant',
      ) as FinanceSettlementRequest['targetType'],

    targetId:
      normalizeString(
        row.target_id,
      ),

    targetName:
      normalizeString(
        row.target_name,
      ),

    periodStart:
      normalizeString(
        row.period_start,
      ),

    periodEnd:
      normalizeString(
        row.period_end,
      ),

    settlementCycle:
      normalizeString(
        row.settlement_cycle,
        'monthly',
      ) as FinanceSettlementRequest['settlementCycle'],

    orderCount:
      normalizeNumber(
        row.order_count,
      ),

    grossAmount:
      normalizeNumber(
        row.gross_amount,
      ),

    serviceFee:
      normalizeNumber(
        row.service_fee,
      ),

    adjustmentAmount:
      normalizeNumber(
        row.adjustment_amount,
      ),

    netAmount:
      normalizeNumber(
        row.net_amount,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    status:
      normalizeString(
        row.status,
        'pending',
      ) as FinanceSettlementRequest['status'],

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
// 結算申請列表
// =================================

export async function getFinanceSettlementRequests(
  filters:
    FinanceSettlementFilters,
): Promise<FinanceSettlementListResponse> {
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
          SETTLEMENT_TABLE,
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
            `settlement_no.ilike.%${keyword}%`,
            `target_name.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (
      filters.targetType
    ) {
      query =
        query.eq(
          'target_type',
          filters.targetType,
        )
    }

    if (
      filters.status
    ) {
      query =
        query.eq(
          'status',
          filters.status,
        )
    }

    if (
      filters.settlementCycle
    ) {
      query =
        query.eq(
          'settlement_cycle',
          filters.settlementCycle,
        )
    }

    if (
      filters.startDate
    ) {
      query =
        query.gte(
          'period_start',
          filters.startDate,
        )
    }

    if (
      filters.endDate
    ) {
      query =
        query.lte(
          'period_end',
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
          mapSettlementRequest(
            row as
              FinanceSettlementRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      requests.reduce<
        FinanceSettlementStatistics
      >(
        (
          result,
          request,
        ) => {
          result.total += 1

          result.grossAmount +=
            request.grossAmount

          result.serviceFee +=
            request.serviceFee

          result.netAmount +=
            request.netAmount

          switch (
            request.status
          ) {
            case 'pending':
              result.pending += 1
              break

            case 'reviewing':
              result.reviewing += 1
              break

            case 'approved':
              result.approved += 1
              break

            case 'processing':
              result.processing += 1
              break

            case 'completed':
              result.completed += 1
              break

            case 'rejected':
              result.rejected += 1
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
        '結算申請資料載入成功。',
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
        '結算申請資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '結算申請資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 結算申請詳情
// =================================

export async function getFinanceSettlementRequestById(
  settlementId: string,
): Promise<FinanceSettlementDetailResponse> {
  const normalizedId =
    settlementId.trim()

  if (!normalizedId) {
    return {
      success: false,
      message: '結算申請 ID 不可空白。',
      error: '結算申請 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          SETTLEMENT_TABLE,
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
      success: true,

      request:
        mapSettlementRequest(
          data as FinanceSettlementRow,
        ),

      message:
        '結算申請詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success: false,

      message:
        '結算申請詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '結算申請詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 審核／更新結算申請
// =================================

export async function reviewFinanceSettlementRequest(
  input:
    FinanceSettlementReviewInput,
): Promise<FinanceSettlementMutationResponse> {
  const normalizedId =
    input.settlementId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '結算申請 ID 不可空白。',

      error:
        '結算申請 ID 不可空白。',
    }
  }

  const now =
    new Date().toISOString()

  try {
    const {
      data: currentData,
      error: currentError,
    } =
      await supabase
        .from(
          SETTLEMENT_TABLE,
        )
        .select(
          `
          gross_amount,
          service_fee,
          adjustment_amount
          `,
        )
        .eq(
          'id',
          normalizedId,
        )
        .single()

    if (currentError) {
      throw currentError
    }

    const grossAmount =
      normalizeNumber(
        currentData?.gross_amount,
      )

    const serviceFee =
      input.serviceFee !==
      undefined
        ? Math.max(
            input.serviceFee,
            0,
          )
        : normalizeNumber(
            currentData?.service_fee,
          )

    const adjustmentAmount =
      input.adjustmentAmount !==
      undefined
        ? input.adjustmentAmount
        : normalizeNumber(
            currentData
              ?.adjustment_amount,
          )

    const netAmount =
      Math.max(
        grossAmount -
          serviceFee +
          adjustmentAmount,
        0,
      )

    const payload:
      Record<string, unknown> = {
        status:
          input.status,

        service_fee:
          serviceFee,

        adjustment_amount:
          adjustmentAmount,

        net_amount:
          netAmount,

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
    } else {
      payload.completed_at =
        null
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          SETTLEMENT_TABLE,
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
        mapSettlementRequest(
          data as
            FinanceSettlementRow,
        ),

      message:
        getSettlementMutationMessage(
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
        '結算申請更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '結算申請更新發生未知錯誤。',
    }
  }
}

function getSettlementMutationMessage(
  status:
    FinanceSettlementReviewInput['status'],
): string {
  const messageMap:
    Record<
      FinanceSettlementReviewInput['status'],
      string
    > = {
      reviewing:
        '結算申請已進入審核中。',

      approved:
        '結算申請已通過。',

      processing:
        '結算申請已進入付款處理中。',

      completed:
        '結算申請已完成。',

      rejected:
        '結算申請已拒絕。',
    }

  return messageMap[status]
}