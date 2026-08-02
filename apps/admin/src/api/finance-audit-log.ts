/**
 * ALADDIN Enterprise V4
 *
 * Finance Audit Log ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceAuditLog,
  FinanceAuditLogCreateInput,
  FinanceAuditLogDetailResponse,
  FinanceAuditLogFilters,
  FinanceAuditLogListResponse,
  FinanceAuditLogMutationResponse,
  FinanceAuditLogPagination,
  FinanceAuditLogStatistics,
} from '../types/finance-audit-log'

const AUDIT_LOG_TABLE =
  'finance_audit_logs'

const DEFAULT_PAGE_SIZE =
  20

interface FinanceAuditLogRow {
  id?: unknown
  audit_no?: unknown
  module?: unknown
  action?: unknown
  result?: unknown
  reference_type?: unknown
  reference_id?: unknown
  reference_no?: unknown
  operator_id?: unknown
  operator_name?: unknown
  operator_role?: unknown
  source_ip?: unknown
  user_agent?: unknown
  previous_snapshot?: unknown
  next_snapshot?: unknown
  error_message?: unknown
  remark?: unknown
  created_at?: unknown
}

function createEmptyStatistics():
  FinanceAuditLogStatistics {
  return {
    total:
      0,

    success:
      0,

    failed:
      0,

    transaction:
      0,

    wallet:
      0,

    withdraw:
      0,

    refund:
      0,

    settlement:
      0,

    report:
      0,
  }
}

function createEmptyPagination():
  FinanceAuditLogPagination {
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

function normalizeSnapshot(
  value: unknown,
): Record<string, unknown> | null {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >
  }

  return null
}

function mapFinanceAuditLog(
  row:
    FinanceAuditLogRow,
): FinanceAuditLog {
  return {
    id:
      normalizeString(
        row.id,
      ),

    auditNo:
      normalizeString(
        row.audit_no,
      ),

    module:
      normalizeString(
        row.module,
        'transaction',
      ) as FinanceAuditLog['module'],

    action:
      normalizeString(
        row.action,
        'update',
      ) as FinanceAuditLog['action'],

    result:
      normalizeString(
        row.result,
        'success',
      ) as FinanceAuditLog['result'],

    referenceType:
      normalizeNullableString(
        row.reference_type,
      ),

    referenceId:
      normalizeNullableString(
        row.reference_id,
      ),

    referenceNo:
      normalizeNullableString(
        row.reference_no,
      ),

    operatorId:
      normalizeNullableString(
        row.operator_id,
      ),

    operatorName:
      normalizeNullableString(
        row.operator_name,
      ),

    operatorRole:
      normalizeNullableString(
        row.operator_role,
      ),

    sourceIp:
      normalizeNullableString(
        row.source_ip,
      ),

    userAgent:
      normalizeNullableString(
        row.user_agent,
      ),

    previousSnapshot:
      normalizeSnapshot(
        row.previous_snapshot,
      ),

    nextSnapshot:
      normalizeSnapshot(
        row.next_snapshot,
      ),

    errorMessage:
      normalizeNullableString(
        row.error_message,
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
// 財務稽核紀錄列表
// =================================

export async function getFinanceAuditLogs(
  filters:
    FinanceAuditLogFilters,
): Promise<FinanceAuditLogListResponse> {
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
          AUDIT_LOG_TABLE,
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
            `audit_no.ilike.%${keyword}%`,
            `reference_no.ilike.%${keyword}%`,
            `operator_name.ilike.%${keyword}%`,
            `operator_role.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (filters.module) {
      query =
        query.eq(
          'module',
          filters.module,
        )
    }

    if (filters.action) {
      query =
        query.eq(
          'action',
          filters.action,
        )
    }

    if (filters.result) {
      query =
        query.eq(
          'result',
          filters.result,
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

    const logs =
      (data ?? []).map(
        (row) =>
          mapFinanceAuditLog(
            row as
              FinanceAuditLogRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      logs.reduce<
        FinanceAuditLogStatistics
      >(
        (
          result,
          log,
        ) => {
          result.total += 1

          if (
            log.result ===
            'success'
          ) {
            result.success += 1
          } else {
            result.failed += 1
          }

          switch (log.module) {
            case 'transaction':
              result.transaction += 1
              break

            case 'wallet':
              result.wallet += 1
              break

            case 'withdraw':
              result.withdraw += 1
              break

            case 'refund':
              result.refund += 1
              break

            case 'settlement':
              result.settlement += 1
              break

            case 'report':
              result.report += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      logs,

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
        '財務稽核紀錄載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      logs:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '財務稽核紀錄載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務稽核紀錄載入發生未知錯誤。',
    }
  }
}
// =================================
// 財務稽核紀錄詳情
// =================================

export async function getFinanceAuditLogById(
  auditLogId: string,
): Promise<FinanceAuditLogDetailResponse> {
  const normalizedId =
    auditLogId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '財務稽核紀錄 ID 不可空白。',

      error:
        '財務稽核紀錄 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          AUDIT_LOG_TABLE,
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

      log:
        mapFinanceAuditLog(
          data as
            FinanceAuditLogRow,
        ),

      message:
        '財務稽核紀錄詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '財務稽核紀錄詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務稽核紀錄詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 建立財務稽核紀錄
// =================================

export async function createFinanceAuditLog(
  input:
    FinanceAuditLogCreateInput,
): Promise<FinanceAuditLogMutationResponse> {
  const now =
    new Date().toISOString()

  const auditNo =
    createAuditNumber(
      input.module,
    )

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          AUDIT_LOG_TABLE,
        )
        .insert({
          audit_no:
            auditNo,

          module:
            input.module,

          action:
            input.action,

          result:
            input.result,

          reference_type:
            input.referenceType ??
            null,

          reference_id:
            input.referenceId ??
            null,

          reference_no:
            input.referenceNo ??
            null,

          operator_id:
            input.operatorId ??
            null,

          operator_name:
            input.operatorName ??
            null,

          operator_role:
            input.operatorRole ??
            null,

          source_ip:
            input.sourceIp ??
            null,

          user_agent:
            input.userAgent ??
            null,

          previous_snapshot:
            input.previousSnapshot ??
            null,

          next_snapshot:
            input.nextSnapshot ??
            null,

          error_message:
            input.errorMessage ??
            null,

          remark:
            input.remark ??
            null,

          created_at:
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

      log:
        mapFinanceAuditLog(
          data as
            FinanceAuditLogRow,
        ),

      message:
        '財務稽核紀錄建立成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '財務稽核紀錄建立失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務稽核紀錄建立時發生未知錯誤。',
    }
  }
}

function createAuditNumber(
  module:
    FinanceAuditLogCreateInput['module'],
): string {
  const moduleCodeMap:
    Record<
      FinanceAuditLogCreateInput['module'],
      string
    > = {
      transaction:
        'TX',

      wallet:
        'WA',

      withdraw:
        'WD',

      refund:
        'RF',

      settlement:
        'ST',

      report:
        'RP',
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
    'FA',
    moduleCodeMap[module],
    timestamp,
    randomCode,
  ].join('-')
}