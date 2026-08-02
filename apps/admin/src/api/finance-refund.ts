/**
 * ALADDIN Enterprise V4
 *
 * Finance Refund ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceRefundDetailResponse,
  FinanceRefundFilters,
  FinanceRefundListResponse,
  FinanceRefundMutationResponse,
  FinanceRefundPagination,
  FinanceRefundRequest,
  FinanceRefundReviewInput,
  FinanceRefundStatistics,
} from '../types/finance-refund'

const REFUND_TABLE =
  'finance_refund_requests'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceRefundRow {
  id?: unknown
  refund_no?: unknown
  order_id?: unknown
  order_no?: unknown
  applicant_type?: unknown
  applicant_id?: unknown
  applicant_name?: unknown
  applicant_phone?: unknown
  reason_type?: unknown
  reason_description?: unknown
  requested_amount?: unknown
  approved_amount?: unknown
  fee_amount?: unknown
  actual_refund_amount?: unknown
  currency?: unknown
  refund_method?: unknown
  refund_account_name?: unknown
  refund_account_no?: unknown
  status?: unknown
  review_remark?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  completed_at?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  FinanceRefundStatistics {
  return {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    requestedAmount: 0,
    approvedAmount: 0,
    completedAmount: 0,
  }
}

function createEmptyPagination():
  FinanceRefundPagination {
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

function mapRefundRequest(
  row: FinanceRefundRow,
): FinanceRefundRequest {
  return {
    id:
      normalizeString(row.id),

    refundNo:
      normalizeString(
        row.refund_no,
      ),

    orderId:
      normalizeString(
        row.order_id,
      ),

    orderNo:
      normalizeString(
        row.order_no,
      ),

    applicantType:
      normalizeString(
        row.applicant_type,
        'member',
      ) as FinanceRefundRequest['applicantType'],

    applicantId:
      normalizeNullableString(
        row.applicant_id,
      ),

    applicantName:
      normalizeNullableString(
        row.applicant_name,
      ),

    applicantPhone:
      normalizeNullableString(
        row.applicant_phone,
      ),

    reasonType:
      normalizeString(
        row.reason_type,
        'other',
      ) as FinanceRefundRequest['reasonType'],

    reasonDescription:
      normalizeNullableString(
        row.reason_description,
      ),

    requestedAmount:
      normalizeNumber(
        row.requested_amount,
      ),

    approvedAmount:
      normalizeNumber(
        row.approved_amount,
      ),

    feeAmount:
      normalizeNumber(
        row.fee_amount,
      ),

    actualRefundAmount:
      normalizeNumber(
        row.actual_refund_amount,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    refundMethod:
      normalizeString(
        row.refund_method,
        'original_payment',
      ) as FinanceRefundRequest['refundMethod'],

    refundAccountName:
      normalizeNullableString(
        row.refund_account_name,
      ),

    refundAccountNo:
      normalizeNullableString(
        row.refund_account_no,
      ),

    status:
      normalizeString(
        row.status,
        'pending',
      ) as FinanceRefundRequest['status'],

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
// 退款申請列表
// =================================

export async function getFinanceRefundRequests(
  filters:
    FinanceRefundFilters,
): Promise<FinanceRefundListResponse> {
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
          REFUND_TABLE,
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
            `refund_no.ilike.%${keyword}%`,
            `order_no.ilike.%${keyword}%`,
            `applicant_name.ilike.%${keyword}%`,
            `applicant_phone.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (
      filters.applicantType
    ) {
      query =
        query.eq(
          'applicant_type',
          filters.applicantType,
        )
    }

    if (filters.status) {
      query =
        query.eq(
          'status',
          filters.status,
        )
    }

    if (
      filters.refundMethod
    ) {
      query =
        query.eq(
          'refund_method',
          filters.refundMethod,
        )
    }

    if (
      filters.startDate
    ) {
      query =
        query.gte(
          'created_at',
          filters.startDate,
        )
    }

    if (
      filters.endDate
    ) {
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
          mapRefundRequest(
            row as
              FinanceRefundRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      requests.reduce<
        FinanceRefundStatistics
      >(
        (
          result,
          request,
        ) => {
          result.total += 1

          result.requestedAmount +=
            request.requestedAmount

          result.approvedAmount +=
            request.approvedAmount

          switch (
            request.status
          ) {
            case 'pending':
              result.pending += 1
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
                request.actualRefundAmount
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
        '退款申請資料載入成功。',
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
        '退款申請資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '退款申請資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 退款申請詳情
// =================================

export async function getFinanceRefundRequestById(
  refundId: string,
): Promise<FinanceRefundDetailResponse> {
  const normalizedId =
    refundId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '退款申請 ID 不可空白。',

      error:
        '退款申請 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          REFUND_TABLE,
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
        mapRefundRequest(
          data as
            FinanceRefundRow,
        ),

      message:
        '退款申請詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '退款申請詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '退款申請詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 審核／更新退款申請
// =================================

export async function reviewFinanceRefundRequest(
  input:
    FinanceRefundReviewInput,
): Promise<FinanceRefundMutationResponse> {
  const normalizedId =
    input.refundId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '退款申請 ID 不可空白。',

      error:
        '退款申請 ID 不可空白。',
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
    input.approvedAmount !==
    undefined
  ) {
    payload.approved_amount =
      input.approvedAmount
  }

  if (
    input.feeAmount !==
    undefined
  ) {
    payload.fee_amount =
      input.feeAmount
  }

  if (
    input.refundMethod
  ) {
    payload.refund_method =
      input.refundMethod
  }

  if (
    input.refundAccountName !==
    undefined
  ) {
    payload.refund_account_name =
      input.refundAccountName
  }

  if (
    input.refundAccountNo !==
    undefined
  ) {
    payload.refund_account_no =
      input.refundAccountNo
  }

  if (
    input.approvedAmount !==
      undefined ||
    input.feeAmount !==
      undefined
  ) {
    const approvedAmount =
      input.approvedAmount ??
      0

    const feeAmount =
      input.feeAmount ??
      0

    payload.actual_refund_amount =
      Math.max(
        approvedAmount -
          feeAmount,
        0,
      )
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

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          REFUND_TABLE,
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
        mapRefundRequest(
          data as
            FinanceRefundRow,
        ),

      message:
        getRefundMutationMessage(
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
        '退款申請更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '退款申請更新發生未知錯誤。',
    }
  }
}

function getRefundMutationMessage(
  status:
    FinanceRefundReviewInput['status'],
): string {
  const messageMap:
    Record<
      FinanceRefundReviewInput['status'],
      string
    > = {
      approved:
        '退款申請已通過。',

      rejected:
        '退款申請已拒絕。',

      processing:
        '退款申請已進入處理中。',

      completed:
        '退款申請已完成。',

      cancelled:
        '退款申請已取消。',
    }

  return messageMap[status]
}