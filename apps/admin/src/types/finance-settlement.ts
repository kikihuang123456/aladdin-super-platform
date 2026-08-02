/**
 * ALADDIN Enterprise V4
 *
 * Finance Settlement ERP
 *
 * Type Definitions
 */

export type FinanceSettlementTargetType =
  | 'merchant'
  | 'dealer'

export type FinanceSettlementStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'

export type FinanceSettlementCycle =
  | 'daily'
  | 'weekly'
  | 'monthly'

export interface FinanceSettlementRequest {
  id: string

  settlementNo: string

  targetType:
    FinanceSettlementTargetType

  targetId: string

  targetName: string

  periodStart: string

  periodEnd: string

  settlementCycle:
    FinanceSettlementCycle

  orderCount: number

  grossAmount: number

  serviceFee: number

  adjustmentAmount: number

  netAmount: number

  currency: string

  status:
    FinanceSettlementStatus

  reviewRemark?: string | null

  reviewedBy?: string | null

  reviewedAt?: string | null

  completedAt?: string | null

  createdAt: string

  updatedAt: string
}

export interface FinanceSettlementFilters {
  keyword?: string

  targetType?:
    FinanceSettlementTargetType | ''

  status?:
    FinanceSettlementStatus | ''

  settlementCycle?:
    FinanceSettlementCycle | ''

  startDate?: string | null

  endDate?: string | null

  page: number

  pageSize: number
}

export interface FinanceSettlementPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface FinanceSettlementStatistics {
  total: number

  pending: number

  reviewing: number

  approved: number

  processing: number

  completed: number

  rejected: number

  grossAmount: number

  serviceFee: number

  netAmount: number
}
export interface FinanceSettlementListResponse {
  success: boolean

  requests:
    FinanceSettlementRequest[]

  statistics:
    FinanceSettlementStatistics

  pagination:
    FinanceSettlementPagination

  message: string

  error?: string
}

export interface FinanceSettlementDetailResponse {
  success: boolean

  request?:
    FinanceSettlementRequest

  message: string

  error?: string
}

export interface FinanceSettlementReviewInput {
  settlementId: string

  status:
    | 'reviewing'
    | 'approved'
    | 'processing'
    | 'completed'
    | 'rejected'

  serviceFee?: number

  adjustmentAmount?: number

  reviewRemark?: string | null

  reviewedBy?: string | null
}

export interface FinanceSettlementMutationResponse {
  success: boolean

  request?:
    FinanceSettlementRequest

  message: string

  error?: string
}