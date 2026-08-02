/**
 * ALADDIN Enterprise V4
 *
 * Finance Dashboard Integration
 *
 * Type Definitions
 */

import type {
  FinanceAuditLog,
} from './finance-audit-log'

import type {
  FinanceTransaction,
} from './finance-transaction'

export interface FinanceDashboardSummary {
  transactionCount: number

  totalIncome: number

  totalExpense: number

  netIncome: number

  walletCount: number

  walletBalance: number

  frozenBalance: number

  availableBalance: number

  pendingWithdrawCount: number

  pendingWithdrawAmount: number

  pendingRefundCount: number

  pendingRefundAmount: number

  pendingSettlementCount: number

  pendingSettlementAmount: number

  reportCount: number

  failedAuditCount: number
}

export interface FinanceDashboardStatusSummary {
  pendingTransactions: number

  completedTransactions: number

  failedTransactions: number

  pendingWithdraws: number

  processingWithdraws: number

  completedWithdraws: number

  pendingRefunds: number

  processingRefunds: number

  completedRefunds: number

  pendingSettlements: number

  processingSettlements: number

  completedSettlements: number
}

export interface FinanceDashboardTrendItem {
  date: string

  income: number

  expense: number

  netIncome: number
}

export interface FinanceDashboardModuleItem {
  key:
    | 'transactions'
    | 'wallets'
    | 'withdraws'
    | 'refunds'
    | 'settlements'
    | 'reports'
    | 'auditLogs'

  label: string

  path: string

  count: number

  amount?: number

  status:
    | 'normal'
    | 'warning'
    | 'danger'
}

export interface FinanceDashboardData {
  summary:
    FinanceDashboardSummary

  statusSummary:
    FinanceDashboardStatusSummary

  trends:
    FinanceDashboardTrendItem[]

  modules:
    FinanceDashboardModuleItem[]

  recentTransactions:
    FinanceTransaction[]

  recentAuditLogs:
    FinanceAuditLog[]

  generatedAt: string
}
export interface FinanceDashboardFilters {
  startDate?: string | null

  endDate?: string | null

  currency?: string
}

export interface FinanceDashboardResponse {
  success: boolean

  data:
    FinanceDashboardData

  message: string

  error?: string
}

export interface FinanceDashboardQueryRange {
  startDate: string

  endDate: string

  rangeStart: string

  rangeEnd: string

  currency: string
}
