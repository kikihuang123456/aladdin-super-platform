/**
 * ALADDIN Enterprise V4
 *
 * Finance Audit Log ERP
 *
 * Type Definitions
 */

export type FinanceAuditModule =
  | 'transaction'
  | 'wallet'
  | 'withdraw'
  | 'refund'
  | 'settlement'
  | 'report'

export type FinanceAuditAction =
  | 'create'
  | 'update'
  | 'approve'
  | 'reject'
  | 'process'
  | 'complete'
  | 'cancel'
  | 'confirm'
  | 'archive'
  | 'generate'
  | 'adjust'

export type FinanceAuditResult =
  | 'success'
  | 'failed'

export interface FinanceAuditLog {
  id: string

  auditNo: string

  module:
    FinanceAuditModule

  action:
    FinanceAuditAction

  result:
    FinanceAuditResult

  referenceType?: string | null

  referenceId?: string | null

  referenceNo?: string | null

  operatorId?: string | null

  operatorName?: string | null

  operatorRole?: string | null

  sourceIp?: string | null

  userAgent?: string | null

  previousSnapshot?:
    Record<string, unknown> | null

  nextSnapshot?:
    Record<string, unknown> | null

  errorMessage?: string | null

  remark?: string | null

  createdAt: string
}

export interface FinanceAuditLogFilters {
  keyword?: string

  module?:
    FinanceAuditModule | ''

  action?:
    FinanceAuditAction | ''

  result?:
    FinanceAuditResult | ''

  startDate?: string | null

  endDate?: string | null

  page: number

  pageSize: number
}

export interface FinanceAuditLogPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface FinanceAuditLogStatistics {
  total: number

  success: number

  failed: number

  transaction: number

  wallet: number

  withdraw: number

  refund: number

  settlement: number

  report: number
}
export interface FinanceAuditLogListResponse {
  success: boolean

  logs:
    FinanceAuditLog[]

  statistics:
    FinanceAuditLogStatistics

  pagination:
    FinanceAuditLogPagination

  message: string

  error?: string
}

export interface FinanceAuditLogDetailResponse {
  success: boolean

  log?:
    FinanceAuditLog

  message: string

  error?: string
}

export interface FinanceAuditLogCreateInput {
  module:
    FinanceAuditModule

  action:
    FinanceAuditAction

  result:
    FinanceAuditResult

  referenceType?: string | null

  referenceId?: string | null

  referenceNo?: string | null

  operatorId?: string | null

  operatorName?: string | null

  operatorRole?: string | null

  sourceIp?: string | null

  userAgent?: string | null

  previousSnapshot?:
    Record<string, unknown> | null

  nextSnapshot?:
    Record<string, unknown> | null

  errorMessage?: string | null

  remark?: string | null
}

export interface FinanceAuditLogMutationResponse {
  success: boolean

  log?:
    FinanceAuditLog

  message: string

  error?: string
}
