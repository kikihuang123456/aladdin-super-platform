/**
 * ALADDIN Enterprise V4
 *
 * Finance Reports ERP
 *
 * Type Definitions
 */

export type FinanceReportPeriod =
  | 'daily'
  | 'monthly'
  | 'yearly'

export type FinanceReportStatus =
  | 'draft'
  | 'generated'
  | 'confirmed'
  | 'archived'

export interface FinanceReport {
  id: string

  reportNo: string

  periodType:
    FinanceReportPeriod

  periodStart: string

  periodEnd: string

  currency: string

  orderIncome: number

  serviceFeeIncome: number

  otherIncome: number

  refundAmount: number

  withdrawAmount: number

  settlementAmount: number

  grossIncome: number

  totalExpense: number

  netIncome: number

  orderCount: number

  refundCount: number

  withdrawCount: number

  settlementCount: number

  status:
    FinanceReportStatus

  generatedBy?: string | null

  generatedAt?: string | null

  confirmedBy?: string | null

  confirmedAt?: string | null

  remark?: string | null

  createdAt: string

  updatedAt: string
}

export interface FinanceReportFilters {
  keyword?: string

  periodType?:
    FinanceReportPeriod | ''

  status?:
    FinanceReportStatus | ''

  startDate?: string | null

  endDate?: string | null

  page: number

  pageSize: number
}

export interface FinanceReportPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface FinanceReportStatistics {
  totalReports: number

  draftReports: number

  generatedReports: number

  confirmedReports: number

  archivedReports: number

  grossIncome: number

  totalExpense: number

  netIncome: number
}
export interface FinanceReportListResponse {
  success: boolean

  reports:
    FinanceReport[]

  statistics:
    FinanceReportStatistics

  pagination:
    FinanceReportPagination

  message: string

  error?: string
}

export interface FinanceReportDetailResponse {
  success: boolean

  report?:
    FinanceReport

  message: string

  error?: string
}

export interface FinanceReportGenerateInput {
  periodType:
    FinanceReportPeriod

  periodStart: string

  periodEnd: string

  currency?: string

  generatedBy?: string | null

  remark?: string | null
}

export interface FinanceReportStatusUpdateInput {
  reportId: string

  status:
    | 'generated'
    | 'confirmed'
    | 'archived'

  operatorId?: string | null

  remark?: string | null
}

export interface FinanceReportMutationResponse {
  success: boolean

  report?:
    FinanceReport

  message: string

  error?: string
}
