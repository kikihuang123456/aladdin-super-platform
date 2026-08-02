/**
 * ALADDIN Enterprise V4
 *
 * Finance Withdraw ERP
 *
 * Type Definitions
 */

export type FinanceWithdrawOwnerType =
  | 'member'
  | 'merchant'
  | 'dealer'

export type FinanceWithdrawStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type FinanceWithdrawAccountType =
  | 'bank'
  | 'wechat'
  | 'alipay'
  | 'linepay'
  | 'other'

export interface FinanceWithdrawRequest {
  id: string

  withdrawNo: string

  walletId: string

  ownerType:
    FinanceWithdrawOwnerType

  ownerId: string

  ownerName?: string | null

  ownerPhone?: string | null

  amount: number

  feeAmount: number

  actualAmount: number

  currency: string

  accountType:
    FinanceWithdrawAccountType

  accountName?: string | null

  accountNo?: string | null

  bankName?: string | null

  bankBranch?: string | null

  status:
    FinanceWithdrawStatus

  applyRemark?: string | null

  reviewRemark?: string | null

  reviewedBy?: string | null

  reviewedAt?: string | null

  completedAt?: string | null

  createdAt: string

  updatedAt: string
}

export interface FinanceWithdrawFilters {
  keyword?: string

  ownerType?:
    FinanceWithdrawOwnerType | ''

  status?:
    FinanceWithdrawStatus | ''

  startDate?: string | null

  endDate?: string | null

  page: number

  pageSize: number
}

export interface FinanceWithdrawPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface FinanceWithdrawStatistics {
  total: number

  pending: number

  approved: number

  rejected: number

  processing: number

  completed: number

  cancelled: number

  totalAmount: number

  pendingAmount: number

  completedAmount: number
}

export interface FinanceWithdrawListResponse {
  success: boolean

  requests:
    FinanceWithdrawRequest[]

  statistics:
    FinanceWithdrawStatistics

  pagination:
    FinanceWithdrawPagination

  message: string

  error?: string
}

export interface FinanceWithdrawDetailResponse {
  success: boolean

  request?:
    FinanceWithdrawRequest

  message: string

  error?: string
}

export interface FinanceWithdrawReviewInput {
  withdrawId: string

  status:
    | 'approved'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'cancelled'

  reviewRemark?: string | null

  reviewedBy?: string | null
}

export interface FinanceWithdrawMutationResponse {
  success: boolean

  request?:
    FinanceWithdrawRequest

  message: string

  error?: string
}