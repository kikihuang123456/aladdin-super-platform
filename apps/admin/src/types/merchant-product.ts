/**
 * ALADDIN Enterprise V4
 *
 * Merchant Product ERP
 *
 * Type Definitions
 */

export type MerchantProductStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive'

export interface MerchantProduct {
  id: string

  merchantId: string

  merchantName?: string | null

  productId: string

  productName?: string | null

  productNo?: string | null

  merchantProductNo: string

  salePrice: number

  comparePrice?: number | null

  costPrice?: number | null

  currency: string

  stockQuantity: number

  frozenStock: number

  availableStock: number

  lowStockThreshold: number

  isListed: boolean

  status:
    MerchantProductStatus

  reviewedBy?: string | null

  reviewedAt?: string | null

  reviewRemark?: string | null

  listedAt?: string | null

  unlistedAt?: string | null

  createdAt: string

  updatedAt: string
}

export interface MerchantProductFilters {
  keyword?: string

  merchantId?: string | null

  productId?: string | null

  status?:
    MerchantProductStatus | ''

  isListed?:
    boolean | null

  page: number

  pageSize: number
}

export interface MerchantProductPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface MerchantProductStatistics {
  total: number

  draft: number

  pending: number

  approved: number

  rejected: number

  active: number

  inactive: number

  listed: number

  unlisted: number

  totalStock: number

  availableStock: number

  lowStock: number
}
export interface MerchantProductListResponse {
  success: boolean

  products:
    MerchantProduct[]

  statistics:
    MerchantProductStatistics

  pagination:
    MerchantProductPagination

  message: string

  error?: string
}

export interface MerchantProductDetailResponse {
  success: boolean

  product?:
    MerchantProduct

  message: string

  error?: string
}

export interface MerchantProductReviewInput {
  merchantProductId: string

  status:
    | 'approved'
    | 'rejected'

  reviewedBy?: string | null

  reviewRemark?: string | null
}

export interface MerchantProductStatusUpdateInput {
  merchantProductId: string

  status:
    | 'active'
    | 'inactive'

  isListed?: boolean

  operatorId?: string | null

  remark?: string | null
}

export interface MerchantProductStockUpdateInput {
  merchantProductId: string

  stockQuantity: number

  frozenStock?: number

  lowStockThreshold?: number

  operatorId?: string | null

  remark?: string | null
}

export interface MerchantProductMutationResponse {
  success: boolean

  product?:
    MerchantProduct

  message: string

  error?: string
}