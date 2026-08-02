/**
 * ALADDIN Enterprise V4
 *
 * Finance Refund ERP
 *
 * Type Definitions
 */

export type FinanceRefundApplicantType =
  | 'member'
  | 'merchant'
  | 'admin'

export type FinanceRefundStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type FinanceRefundMethod =
  | 'original_payment'
  | 'wallet'
  | 'bank_transfer'
  | 'wechat'
  | 'alipay'
  | 'linepay'
  | 'other'

export type FinanceRefundReasonType =
  | 'cancel_order'
  | 'product_issue'
  | 'shipping_issue'
  | 'duplicate_payment'
  | 'payment_error'
  | 'service_issue'
  | 'other'

export interface FinanceRefundRequest {
  id: string

  refundNo: string

  orderId: string

  orderNo: string

  applicantType:
    FinanceRefundApplicantType

  applicantId?: string | null

  applicantName?: string | null

  applicantPhone?: string | null

  reasonType:
    FinanceRefundReasonType

  reasonDescription?: string | null

  requestedAmount: number

  approvedAmount: number

  feeAmount: number

  actualRefundAmount: number

  currency: string

  refundMethod:
    FinanceRefundMethod

  refundAccountName?: string | null

  refundAccountNo?: string | null

  status:
    FinanceRefundStatus

  reviewRemark?: string | null

  reviewedBy?: string | null

  reviewedAt?: string | null

  completedAt?: string | null

  createdAt: string

  updatedAt: string
}

export interface FinanceRefundFilters {
  keyword?: string

  applicantType?:
    FinanceRefundApplicantType | ''

  status?:
    FinanceRefundStatus | ''

  refundMethod?:
    FinanceRefundMethod | ''

  startDate?: string | null

  endDate?: string | null

  page: number

  pageSize: number
}

export interface FinanceRefundPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface FinanceRefundStatistics {
  total: number

  pending: number

  approved: number

  rejected: number

  processing: number

  completed: number

  cancelled: number

  requestedAmount: number

  approvedAmount: number

  completedAmount: number
}

export interface FinanceRefundListResponse {
  success: boolean

  requests:
    FinanceRefundRequest[]

  statistics:
    FinanceRefundStatistics

  pagination:
    FinanceRefundPagination

  message: string

  error?: string
}

export interface FinanceRefundDetailResponse {
  success: boolean

  request?:
    FinanceRefundRequest

  message: string

  error?: string
}

export interface FinanceRefundReviewInput {
  refundId: string

  status:
    | 'approved'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'cancelled'

  approvedAmount?: number

  feeAmount?: number

  refundMethod?: FinanceRefundMethod

  refundAccountName?: string | null

  refundAccountNo?: string | null

  reviewRemark?: string | null

  reviewedBy?: string | null
}

export interface FinanceRefundMutationResponse {
  success: boolean

  request?:
    FinanceRefundRequest

  message: string

  error?: string
}
