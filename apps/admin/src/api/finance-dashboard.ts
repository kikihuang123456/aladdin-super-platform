/**
 * ALADDIN Enterprise V4
 *
 * Finance Dashboard Integration
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  FinanceDashboardData,
  FinanceDashboardFilters,
  FinanceDashboardModuleItem,
  FinanceDashboardQueryRange,
  FinanceDashboardResponse,
  FinanceDashboardStatusSummary,
  FinanceDashboardSummary,
} from '../types/finance-dashboard'

import type {
  FinanceAuditLog,
} from '../types/finance-audit-log'

import type {
  FinanceTransaction,
} from '../types/finance-transaction'

function createEmptySummary():
  FinanceDashboardSummary {
  return {
    transactionCount: 0,

    totalIncome: 0,

    totalExpense: 0,

    netIncome: 0,

    walletCount: 0,

    walletBalance: 0,

    frozenBalance: 0,

    availableBalance: 0,

    pendingWithdrawCount: 0,

    pendingWithdrawAmount: 0,

    pendingRefundCount: 0,

    pendingRefundAmount: 0,

    pendingSettlementCount: 0,

    pendingSettlementAmount: 0,

    reportCount: 0,

    failedAuditCount: 0,
  }
}

function createEmptyStatusSummary():
  FinanceDashboardStatusSummary {
  return {
    pendingTransactions: 0,

    completedTransactions: 0,

    failedTransactions: 0,

    pendingWithdraws: 0,

    processingWithdraws: 0,

    completedWithdraws: 0,

    pendingRefunds: 0,

    processingRefunds: 0,

    completedRefunds: 0,

    pendingSettlements: 0,

    processingSettlements: 0,

    completedSettlements: 0,
  }
}

function createEmptyModules():
  FinanceDashboardModuleItem[] {
  return [
    {
      key: 'transactions',
      label: '財務交易',
      path: '/finance/transactions',
      count: 0,
      amount: 0,
      status: 'normal',
    },

    {
      key: 'wallets',
      label: '錢包管理',
      path: '/finance/wallets',
      count: 0,
      amount: 0,
      status: 'normal',
    },

    {
      key: 'withdraws',
      label: '提款管理',
      path: '/finance/withdraws',
      count: 0,
      amount: 0,
      status: 'normal',
    },

    {
      key: 'refunds',
      label: '退款管理',
      path: '/finance/refunds',
      count: 0,
      amount: 0,
      status: 'normal',
    },

    {
      key: 'settlements',
      label: '結算管理',
      path: '/finance/settlements',
      count: 0,
      amount: 0,
      status: 'normal',
    },

    {
      key: 'reports',
      label: '財務報表',
      path: '/finance/reports',
      count: 0,
      status: 'normal',
    },

    {
      key: 'auditLogs',
      label: '財務稽核',
      path: '/finance/audit-logs',
      count: 0,
      status: 'normal',
    },
  ]
}

function createEmptyDashboardData():
  FinanceDashboardData {
  return {
    summary:
      createEmptySummary(),

    statusSummary:
      createEmptyStatusSummary(),

    trends:
      [],

    modules:
      createEmptyModules(),

    recentTransactions:
      [],

    recentAuditLogs:
      [],

    generatedAt:
      new Date().toISOString(),
  }
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

function normalizeString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback
}

function createQueryRange(
  filters:
    FinanceDashboardFilters,
): FinanceDashboardQueryRange {
  const today =
    new Date()

  const defaultEnd =
    today.toISOString().slice(
      0,
      10,
    )

  const defaultStartDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    )

  const defaultStart =
    defaultStartDate
      .toISOString()
      .slice(
        0,
        10,
      )

  const startDate =
    filters.startDate?.trim() ||
    defaultStart

  const endDate =
    filters.endDate?.trim() ||
    defaultEnd

  return {
    startDate,

    endDate,

    rangeStart:
      `${startDate}T00:00:00.000Z`,

    rangeEnd:
      `${endDate}T23:59:59.999Z`,

    currency:
      filters.currency?.trim() ||
      'TWD',
  }
}
interface FinanceTransactionRow {
  id?: unknown
  transaction_no?: unknown
  type?: unknown
  status?: unknown
  member_id?: unknown
  member_name?: unknown
  phone?: unknown
  amount?: unknown
  currency?: unknown
  remark?: unknown
  created_at?: unknown
  updated_at?: unknown
}

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
    return value as
      Record<string, unknown>
  }

  return null
}

function mapRecentTransaction(
  row:
    FinanceTransactionRow,
): FinanceTransaction {
  return {
    id:
      normalizeString(
        row.id,
      ),

    transactionNo:
      normalizeString(
        row.transaction_no,
      ),

    type:
      normalizeString(
        row.type,
        'income',
      ) as FinanceTransaction['type'],

    status:
      normalizeString(
        row.status,
        'pending',
      ) as FinanceTransaction['status'],

    memberId:
  normalizeNullableString(
    row.member_id,
  ) ?? undefined,

memberName:
  normalizeNullableString(
    row.member_name,
  ) ?? undefined,

phone:
  normalizeNullableString(
    row.phone,
  ) ?? undefined,

remark:
  normalizeNullableString(
    row.remark,
  ) ?? undefined,

    amount:
      normalizeNumber(
        row.amount,
      ),

    currency:
  normalizeString(
    row.currency,
    'TWD',
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

function mapRecentAuditLog(
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
// 財務 Dashboard 資料查詢
// =================================

export async function getFinanceDashboard(
  filters:
    FinanceDashboardFilters = {},
): Promise<FinanceDashboardResponse> {
  const range =
    createQueryRange(
      filters,
    )

  try {
    const [
      transactionsResult,
      walletsResult,
      withdrawsResult,
      refundsResult,
      settlementsResult,
      reportsResult,
      auditLogsResult,
      recentTransactionsResult,
      recentAuditLogsResult,
    ] =
      await Promise.all([
        supabase
          .from(
            'finance_transactions',
          )
          .select(
            `
            type,
            status,
            amount,
            currency,
            created_at
            `,
          )
          .eq(
            'currency',
            range.currency,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_wallets',
          )
          .select(
            `
            balance,
            frozen_balance,
            available_balance,
            currency,
            status
            `,
          )
          .eq(
            'currency',
            range.currency,
          ),

        supabase
          .from(
            'finance_withdraw_requests',
          )
          .select(
            `
            status,
            amount,
            actual_amount,
            currency,
            created_at
            `,
          )
          .eq(
            'currency',
            range.currency,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_refund_requests',
          )
          .select(
            `
            status,
            requested_amount,
            actual_refund_amount,
            currency,
            created_at
            `,
          )
          .eq(
            'currency',
            range.currency,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_settlement_requests',
          )
          .select(
            `
            status,
            gross_amount,
            net_amount,
            currency,
            created_at
            `,
          )
          .eq(
            'currency',
            range.currency,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_reports',
          )
          .select(
            `
            id,
            status,
            currency,
            created_at
            `,
          )
          .eq(
            'currency',
            range.currency,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_audit_logs',
          )
          .select(
            `
            id,
            result,
            created_at
            `,
          )
          .gte(
            'created_at',
            range.rangeStart,
          )
          .lte(
            'created_at',
            range.rangeEnd,
          ),

        supabase
          .from(
            'finance_transactions',
          )
          .select('*')
          .eq(
            'currency',
            range.currency,
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            },
          )
          .limit(8),

        supabase
          .from(
            'finance_audit_logs',
          )
          .select('*')
          .order(
            'created_at',
            {
              ascending:
                false,
            },
          )
          .limit(8),
      ])

    const results = [
      transactionsResult,
      walletsResult,
      withdrawsResult,
      refundsResult,
      settlementsResult,
      reportsResult,
      auditLogsResult,
      recentTransactionsResult,
      recentAuditLogsResult,
    ]

    const failedResult =
      results.find(
        (result) =>
          result.error,
      )

    if (failedResult?.error) {
      throw failedResult.error
    }
        const transactions =
      transactionsResult.data ??
      []

    const wallets =
      walletsResult.data ??
      []

    const withdraws =
      withdrawsResult.data ??
      []

    const refunds =
      refundsResult.data ??
      []

    const settlements =
      settlementsResult.data ??
      []

    const reports =
      reportsResult.data ??
      []

    const auditLogs =
      auditLogsResult.data ??
      []

    const summary =
      createEmptySummary()

    const statusSummary =
      createEmptyStatusSummary()

    summary.transactionCount =
      transactions.length

    for (
      const transaction
      of transactions
    ) {
      const amount =
        normalizeNumber(
          transaction.amount,
        )

      switch (
        transaction.type
      ) {
        case 'income':
        case 'deposit':
          summary.totalIncome +=
            amount
          break

        case 'expense':
        case 'withdraw':
          summary.totalExpense +=
            amount
          break
      }

      switch (
        transaction.status
      ) {
        case 'pending':
          statusSummary
            .pendingTransactions += 1
          break

        case 'completed':
          statusSummary
            .completedTransactions += 1
          break

        case 'failed':
          statusSummary
            .failedTransactions += 1
          break
      }
    }

    summary.netIncome =
      summary.totalIncome -
      summary.totalExpense

    summary.walletCount =
      wallets.length

    for (
      const wallet
      of wallets
    ) {
      summary.walletBalance +=
        normalizeNumber(
          wallet.balance,
        )

      summary.frozenBalance +=
        normalizeNumber(
          wallet.frozen_balance,
        )

      summary.availableBalance +=
        normalizeNumber(
          wallet.available_balance,
        )
    }

    for (
      const withdraw
      of withdraws
    ) {
      switch (
        withdraw.status
      ) {
        case 'pending':
          summary
            .pendingWithdrawCount += 1

          summary
            .pendingWithdrawAmount +=
              normalizeNumber(
                withdraw.amount,
              )

          statusSummary
            .pendingWithdraws += 1
          break

        case 'processing':
          statusSummary
            .processingWithdraws += 1
          break

        case 'completed':
          statusSummary
            .completedWithdraws += 1
          break
      }
    }

    for (
      const refund
      of refunds
    ) {
      switch (
        refund.status
      ) {
        case 'pending':
          summary
            .pendingRefundCount += 1

          summary
            .pendingRefundAmount +=
              normalizeNumber(
                refund.requested_amount,
              )

          statusSummary
            .pendingRefunds += 1
          break

        case 'processing':
          statusSummary
            .processingRefunds += 1
          break

        case 'completed':
          statusSummary
            .completedRefunds += 1
          break
      }
    }

    for (
      const settlement
      of settlements
    ) {
      switch (
        settlement.status
      ) {
        case 'pending':
        case 'reviewing':
        case 'approved':
          summary
            .pendingSettlementCount += 1

          summary
            .pendingSettlementAmount +=
              normalizeNumber(
                settlement.net_amount,
              )

          statusSummary
            .pendingSettlements += 1
          break

        case 'processing':
          statusSummary
            .processingSettlements += 1
          break

        case 'completed':
          statusSummary
            .completedSettlements += 1
          break
      }
    }

    summary.reportCount =
      reports.length

    summary.failedAuditCount =
      auditLogs.filter(
        (log) =>
          log.result ===
          'failed',
      ).length

    const trendMap =
      new Map<
        string,
        {
          income: number
          expense: number
        }
      >()

    for (
      const transaction
      of transactions
    ) {
      const createdAt =
        normalizeString(
          transaction.created_at,
        )

      if (!createdAt) {
        continue
      }

      const date =
        createdAt.slice(
          0,
          10,
        )

      const current =
        trendMap.get(
          date,
        ) ?? {
          income: 0,
          expense: 0,
        }

      const amount =
        normalizeNumber(
          transaction.amount,
        )

      switch (
        transaction.type
      ) {
        case 'income':
        case 'deposit':
          current.income +=
            amount
          break

        case 'expense':
        case 'withdraw':
          current.expense +=
            amount
          break
      }

      trendMap.set(
        date,
        current,
      )
    }

    const trends =
      Array.from(
        trendMap.entries(),
      )
        .map(
          ([
            date,
            value,
          ]) => ({
            date,

            income:
              value.income,

            expense:
              value.expense,

            netIncome:
              value.income -
              value.expense,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.date.localeCompare(
              second.date,
            ),
        )

    const modules:
      FinanceDashboardModuleItem[] = [
        {
          key:
            'transactions',

          label:
            '財務交易',

          path:
            '/finance/transactions',

          count:
            summary.transactionCount,

          amount:
            summary.totalIncome,

          status:
            statusSummary
              .failedTransactions > 0
              ? 'danger'
              : statusSummary
                  .pendingTransactions > 0
                ? 'warning'
                : 'normal',
        },

        {
          key:
            'wallets',

          label:
            '錢包管理',

          path:
            '/finance/wallets',

          count:
            summary.walletCount,

          amount:
            summary.walletBalance,

          status:
            summary.frozenBalance > 0
              ? 'warning'
              : 'normal',
        },

        {
          key:
            'withdraws',

          label:
            '提款管理',

          path:
            '/finance/withdraws',

          count:
            summary
              .pendingWithdrawCount,

          amount:
            summary
              .pendingWithdrawAmount,

          status:
            summary
              .pendingWithdrawCount > 0
              ? 'warning'
              : 'normal',
        },

        {
          key:
            'refunds',

          label:
            '退款管理',

          path:
            '/finance/refunds',

          count:
            summary
              .pendingRefundCount,

          amount:
            summary
              .pendingRefundAmount,

          status:
            summary
              .pendingRefundCount > 0
              ? 'warning'
              : 'normal',
        },

        {
          key:
            'settlements',

          label:
            '結算管理',

          path:
            '/finance/settlements',

          count:
            summary
              .pendingSettlementCount,

          amount:
            summary
              .pendingSettlementAmount,

          status:
            summary
              .pendingSettlementCount > 0
              ? 'warning'
              : 'normal',
        },

        {
          key:
            'reports',

          label:
            '財務報表',

          path:
            '/finance/reports',

          count:
            summary.reportCount,

          status:
            'normal',
        },

        {
          key:
            'auditLogs',

          label:
            '財務稽核',

          path:
            '/finance/audit-logs',

          count:
            summary.failedAuditCount,

          status:
            summary.failedAuditCount > 0
              ? 'danger'
              : 'normal',
        },
      ]

    const recentTransactions =
      (
        recentTransactionsResult
          .data ??
        []
      ).map(
        (row) =>
          mapRecentTransaction(
            row as
              FinanceTransactionRow,
          ),
      )

    const recentAuditLogs =
      (
        recentAuditLogsResult
          .data ??
        []
      ).map(
        (row) =>
          mapRecentAuditLog(
            row as
              FinanceAuditLogRow,
          ),
      )

    return {
      success:
        true,

      data: {
        summary,

        statusSummary,

        trends,

        modules,

        recentTransactions,

        recentAuditLogs,

        generatedAt:
          new Date()
            .toISOString(),
      },

      message:
        '財務 Dashboard 資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      data:
        createEmptyDashboardData(),

      message:
        '財務 Dashboard 資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '財務 Dashboard 資料載入時發生未知錯誤。',
    }
  }
}