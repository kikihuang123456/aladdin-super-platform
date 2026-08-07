/**
 * ALADDIN Enterprise V4
 *
 * Merchant ERP
 *
 * Type Definitions
 */

export type MerchantType =
  | 'individual'
  | 'company'
  | 'brand'
  | 'platform'

export type MerchantMarket =
  | 'taiwan'
  | 'china'
  | 'cross_border'

export type MerchantStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'suspended'
  | 'disabled'

export interface Merchant {
  id: string

  merchantNo: string

  name: string

  legalName?: string | null

  merchantType:
    MerchantType

  market:
    MerchantMarket

  contactName?: string | null

  contactPhone?: string | null

  contactEmail?: string | null

  businessLicenseNo?: string | null

  taxNo?: string | null

  address?: string | null

  logoUrl?: string | null

  description?: string | null

  status:
    MerchantStatus

  reviewedBy?: string | null

  reviewedAt?: string | null

  reviewRemark?: string | null

  activatedAt?: string | null

  createdAt: string

  updatedAt: string
}

export interface MerchantFilters {
  keyword?: string

  merchantType?:
    MerchantType | ''

  market?:
    MerchantMarket | ''

  status?:
    MerchantStatus | ''

  page: number

  pageSize: number
}

export interface MerchantPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface MerchantStatistics {
  total: number

  pending: number

  approved: number

  active: number

  suspended: number

  rejected: number

  disabled: number

  taiwan: number

  china: number

  crossBorder: number
}
export interface MerchantListResponse {
  success: boolean

  merchants:
    Merchant[]

  statistics:
    MerchantStatistics

  pagination:
    MerchantPagination

  message: string

  error?: string
}

export interface MerchantDetailResponse {
  success: boolean

  merchant?:
    Merchant

  message: string

  error?: string
}

export interface MerchantCreateInput {
  name: string

  legalName?: string | null

  merchantType:
    MerchantType

  market:
    MerchantMarket

  contactName?: string | null

  contactPhone?: string | null

  contactEmail?: string | null

  businessLicenseNo?: string | null

  taxNo?: string | null

  address?: string | null

  logoUrl?: string | null

  description?: string | null
}

export interface MerchantReviewInput {
  merchantId: string

  status:
    | 'approved'
    | 'rejected'

  reviewedBy?: string | null

  reviewRemark?: string | null
}

export interface MerchantStatusUpdateInput {
  merchantId: string

  status:
    | 'active'
    | 'suspended'
    | 'disabled'

  operatorId?: string | null

  remark?: string | null
}

export interface MerchantMutationResponse {
  success: boolean

  merchant?:
    Merchant

  message: string

  error?: string
}
