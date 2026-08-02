/**
 * ALADDIN Enterprise V4
 *
 * Finance Reports ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceReport,
  FinanceReportDetailResponse,
  FinanceReportFilters,
  FinanceReportGenerateInput,
  FinanceReportListResponse,
  FinanceReportMutationResponse,
  FinanceReportPagination,
  FinanceReportStatistics,
  FinanceReportStatusUpdateInput,
} from '../types/finance-report'

const REPORT_TABLE =
  'finance_reports'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceReportRow {
  id?: unknown
  report_no?: unknown
  period_type?: unknown
  period_start?: unknown
  period_end?: unknown
  currency?: unknown
  order_income?: unknown
  service_fee_income?: unknown
  other_income?: unknown
  refund_amount?: unknown
  withdraw_amount?: unknown
  settlement_amount?: unknown
  gross_income?: unknown
  total_expense?: unknown
  net_income?: unknown
  order_count?: unknown
  refund_count?: unknown
  withdraw_count?: unknown
  settlement_count?: unknown
  status?: unknown
  generated_by?: unknown
  generated_at?: unknown
  confirmed_by?: unknown
  confirmed_at?: unknown
  remark?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  FinanceReportStatistics {
  return {
    totalReports:
      0,

    draftReports:
      0,

    generatedReports:
      0,

    confirmedReports:
      0,

    archivedReports:
      0,

    grossIncome:
      0,

    totalExpense:
      0,

    netIncome:
      0,
  }
}

function createEmptyPagination():
  FinanceReportPagination {
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

function mapFinanceReport(
  row:
    FinanceReportRow,
): FinanceReport {
  return {
    id:
      normalizeString(
        row.id,
      ),

    reportNo:
      normalizeString(
        row.report_no,
      ),

    periodType:
      normalizeString(
        row.period_type,
        'monthly',
      ) as FinanceReport['periodType'],

    periodStart:
      normalizeString(
        row.period_start,
      ),

    periodEnd:
      normalizeString(
        row.period_end,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    orderIncome:
      normalizeNumber(
        row.order_income,
      ),

    serviceFeeIncome:
      normalizeNumber(
        row.service_fee_income,
      ),

    otherIncome:
      normalizeNumber(
        row.other_income,
      ),

    refundAmount:
      normalizeNumber(
        row.refund_amount,
      ),

    withdrawAmount:
      normalizeNumber(
        row.withdraw_amount,
      ),

    settlementAmount:
      normalizeNumber(
        row.settlement_amount,
      ),

    grossIncome:
      normalizeNumber(
        row.gross_income,
      ),

    totalExpense:
      normalizeNumber(
        row.total_expense,
      ),

    netIncome:
      normalizeNumber(
        row.net_income,
      ),

    orderCount:
      normalizeNumber(
        row.order_count,
      ),

    refundCount:
      normalizeNumber(
        row.refund_count,
      ),

    withdrawCount:
      normalizeNumber(
        row.withdraw_count,
      ),

    settlementCount:
      normalizeNumber(
        row.settlement_count,
      ),

    status:
      normalizeString(
        row.status,
        'draft',
      ) as FinanceReport['status'],

    generatedBy:
      normalizeNullableString(
        row.generated_by,
      ),

    generatedAt:
      normalizeNullableString(
        row.generated_at,
      ),

    confirmedBy:
      normalizeNullableString(
        row.confirmed_by,
      ),

    confirmedAt:
      normalizeNullableString(
        row.confirmed_at,
      ),

    remark:
      normalizeNullableString(
        row.remark,
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
// 財務報表列表
// =================================

export async function getFinanceReports(
  filters:
    FinanceReportFilters,
): Promise<FinanceReportListResponse> {
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
          REPORT_TABLE,
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
            `report_no.ilike.%${keyword}%`,
            `generated_by.ilike.%${keyword}%`,
            `confirmed_by.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (
      filters.periodType
    ) {
      query =
        query.eq(
          'period_type',
          filters.periodType,
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
          'period_start',
          {
            ascending:
              false,
          },
        )
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

    const reports =
      (data ?? []).map(
        (row) =>
          mapFinanceReport(
            row as
              FinanceReportRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      reports.reduce<
        FinanceReportStatistics
      >(
        (
          result,
          report,
        ) => {
          result.totalReports += 1

          result.grossIncome +=
            report.grossIncome

          result.totalExpense +=
            report.totalExpense

          result.netIncome +=
            report.netIncome

          switch (
            report.status
          ) {
            case 'draft':
              result.draftReports += 1
              break

            case 'generated':
              result.generatedReports += 1
              break

            case 'confirmed':
              result.confirmedReports += 1
              break

            case 'archived':
              result.archivedReports += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      reports,

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
        '財務報表資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      reports:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '財務報表資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務報表資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 財務報表詳情
// =================================

export async function getFinanceReportById(
  reportId: string,
): Promise<FinanceReportDetailResponse> {
  const normalizedId =
    reportId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '財務報表 ID 不可空白。',

      error:
        '財務報表 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          REPORT_TABLE,
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

      report:
        mapFinanceReport(
          data as FinanceReportRow,
        ),

      message:
        '財務報表詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '財務報表詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務報表詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 產生財務報表
// =================================

export async function generateFinanceReport(
  input:
    FinanceReportGenerateInput,
): Promise<FinanceReportMutationResponse> {
  const periodStart =
    input.periodStart.trim()

  const periodEnd =
    input.periodEnd.trim()

  if (
    !periodStart ||
    !periodEnd
  ) {
    return {
      success:
        false,

      message:
        '報表開始日期與結束日期不可空白。',

      error:
        '報表開始日期與結束日期不可空白。',
    }
  }

  if (
    new Date(periodEnd).getTime() <
    new Date(periodStart).getTime()
  ) {
    return {
      success:
        false,

      message:
        '報表結束日期不可早於開始日期。',

      error:
        '報表日期區間不正確。',
    }
  }

  const currency =
    input.currency?.trim() ||
    'TWD'

  const rangeStart =
    `${periodStart}T00:00:00.000Z`

  const rangeEnd =
    `${periodEnd}T23:59:59.999Z`

  try {
    const [
      ordersResult,
      refundsResult,
      withdrawsResult,
      settlementsResult,
    ] =
      await Promise.all([
        supabase
          .from(
            'mall_orders',
          )
          .select(
            `
            payable_amount,
            payment_status,
            created_at
            `,
          )
          .eq(
            'currency',
            currency,
          )
          .eq(
            'payment_status',
            'paid',
          )
          .gte(
            'created_at',
            rangeStart,
          )
          .lte(
            'created_at',
            rangeEnd,
          ),

        supabase
          .from(
            'finance_refund_requests',
          )
          .select(
            `
            actual_refund_amount,
            status,
            completed_at
            `,
          )
          .eq(
            'currency',
            currency,
          )
          .eq(
            'status',
            'completed',
          )
          .gte(
            'completed_at',
            rangeStart,
          )
          .lte(
            'completed_at',
            rangeEnd,
          ),

        supabase
          .from(
            'finance_withdraw_requests',
          )
          .select(
            `
            actual_amount,
            status,
            completed_at
            `,
          )
          .eq(
            'currency',
            currency,
          )
          .eq(
            'status',
            'completed',
          )
          .gte(
            'completed_at',
            rangeStart,
          )
          .lte(
            'completed_at',
            rangeEnd,
          ),

        supabase
          .from(
            'finance_settlement_requests',
          )
          .select(
            `
            service_fee,
            net_amount,
            status,
            completed_at
            `,
          )
          .eq(
            'currency',
            currency,
          )
          .eq(
            'status',
            'completed',
          )
          .gte(
            'completed_at',
            rangeStart,
          )
          .lte(
            'completed_at',
            rangeEnd,
          ),
      ])

    if (ordersResult.error) {
      throw ordersResult.error
    }

    if (refundsResult.error) {
      throw refundsResult.error
    }

    if (withdrawsResult.error) {
      throw withdrawsResult.error
    }

    if (settlementsResult.error) {
      throw settlementsResult.error
    }

    const orders =
      ordersResult.data ??
      []

    const refunds =
      refundsResult.data ??
      []

    const withdraws =
      withdrawsResult.data ??
      []

    const settlements =
      settlementsResult.data ??
      []

    const orderIncome =
      orders.reduce(
        (
          total,
          item,
        ) =>
          total +
          normalizeNumber(
            item.payable_amount,
          ),
        0,
      )

    const refundAmount =
      refunds.reduce(
        (
          total,
          item,
        ) =>
          total +
          normalizeNumber(
            item.actual_refund_amount,
          ),
        0,
      )

    const withdrawAmount =
      withdraws.reduce(
        (
          total,
          item,
        ) =>
          total +
          normalizeNumber(
            item.actual_amount,
          ),
        0,
      )

    const serviceFeeIncome =
      settlements.reduce(
        (
          total,
          item,
        ) =>
          total +
          normalizeNumber(
            item.service_fee,
          ),
        0,
      )

    const settlementAmount =
      settlements.reduce(
        (
          total,
          item,
        ) =>
          total +
          normalizeNumber(
            item.net_amount,
          ),
        0,
      )

    const otherIncome =
      0

    const grossIncome =
      orderIncome +
      serviceFeeIncome +
      otherIncome

    const totalExpense =
      refundAmount +
      withdrawAmount +
      settlementAmount

    const netIncome =
      grossIncome -
      totalExpense

    const now =
      new Date().toISOString()

    const reportNo =
      createReportNumber(
        input.periodType,
      )

    const {
      data,
      error,
    } =
      await supabase
        .from(
          REPORT_TABLE,
        )
        .insert({
          report_no:
            reportNo,

          period_type:
            input.periodType,

          period_start:
            periodStart,

          period_end:
            periodEnd,

          currency,

          order_income:
            orderIncome,

          service_fee_income:
            serviceFeeIncome,

          other_income:
            otherIncome,

          refund_amount:
            refundAmount,

          withdraw_amount:
            withdrawAmount,

          settlement_amount:
            settlementAmount,

          gross_income:
            grossIncome,

          total_expense:
            totalExpense,

          net_income:
            netIncome,

          order_count:
            orders.length,

          refund_count:
            refunds.length,

          withdraw_count:
            withdraws.length,

          settlement_count:
            settlements.length,

          status:
            'generated',

          generated_by:
            input.generatedBy ??
            null,

          generated_at:
            now,

          remark:
            input.remark ??
            null,

          created_at:
            now,

          updated_at:
            now,
        })
        .select('*')
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      report:
        mapFinanceReport(
          data as
            FinanceReportRow,
        ),

      message:
        '財務報表產生成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '財務報表產生失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務報表產生時發生未知錯誤。',
    }
  }
}

function createReportNumber(
  periodType:
    FinanceReportGenerateInput['periodType'],
): string {
  const periodCodeMap:
    Record<
      FinanceReportGenerateInput['periodType'],
      string
    > = {
      daily:
        'D',

      monthly:
        'M',

      yearly:
        'Y',
    }

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[-:.TZ]/g,
        '',
      )
      .slice(
        0,
        14,
      )

  const randomCode =
    Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()

  return [
    'FR',
    periodCodeMap[periodType],
    timestamp,
    randomCode,
  ].join('-')
}
// =================================
// 更新財務報表狀態
// =================================

export async function updateFinanceReportStatus(
  input:
    FinanceReportStatusUpdateInput,
): Promise<FinanceReportMutationResponse> {
  const normalizedId =
    input.reportId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '財務報表 ID 不可空白。',

      error:
        '財務報表 ID 不可空白。',
    }
  }

  const now =
    new Date().toISOString()

  const payload:
    Record<string, unknown> = {
      status:
        input.status,

      updated_at:
        now,
    }

  if (
    input.remark !==
    undefined
  ) {
    payload.remark =
      input.remark
  }

  if (
    input.status ===
    'generated'
  ) {
    payload.generated_by =
      input.operatorId ??
      null

    payload.generated_at =
      now
  }

  if (
    input.status ===
    'confirmed'
  ) {
    payload.confirmed_by =
      input.operatorId ??
      null

    payload.confirmed_at =
      now
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          REPORT_TABLE,
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

      report:
        mapFinanceReport(
          data as
            FinanceReportRow,
        ),

      message:
        getReportStatusMessage(
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
        '財務報表狀態更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務報表狀態更新時發生未知錯誤。',
    }
  }
}

function getReportStatusMessage(
  status:
    FinanceReportStatusUpdateInput['status'],
): string {
  const messageMap:
    Record<
      FinanceReportStatusUpdateInput['status'],
      string
    > = {
      generated:
        '財務報表已重新產生。',

      confirmed:
        '財務報表已確認。',

      archived:
        '財務報表已封存。',
    }

  return messageMap[status]
}