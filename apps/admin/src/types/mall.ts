export type MallProductStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'disabled'

export type MallProductCurrency =
  | 'TWD'
  | 'CNY'
  | 'USD'

export type MallProductMarket =
  | 'taiwan'
  | 'china'
  | 'global'

export type MallSortDirection =
  | 'asc'
  | 'desc'

export type MallProductSortField =
  | 'created_at'
  | 'updated_at'
  | 'product_code'
  | 'name'
  | 'price'
  | 'stock'
  | 'sales'
  | 'sort'

export interface MallCategory {
  id: string
  parentId?: string | null
  code: string
  name: string
  description?: string | null
  sort: number
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MallBrand {
  id: string
  code?: string
  name: string
  description?: string | null
  logo?: string | null
  logoUrl?: string | null
  sort?: number
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MallSku {
  id: string
  productId?: string
  skuCode: string
  spec: string
  price: number
  originalPrice?: number | null
  stock: number
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MallProduct {
  id: string

  productCode: string

  name: string

  subtitle?: string | null

  description?: string | null

  categoryId?: string | null

  categoryName?: string | null

  brandId?: string | null

  brandName?: string | null

  cover?: string | null

  images?: string[]

  price: number

  originalPrice?: number | null

  priceTwd?: number | null

  priceCny?: number | null

  currency: MallProductCurrency

  market: MallProductMarket

  stock: number

  safetyStock: number

  sales: number

  status: MallProductStatus

  sort: number

  publishedAt?: string | null

  createdAt: string

  updatedAt: string

  skus?: MallSku[]
}

export interface MallStatistics {
  total: number

  published: number

  draft: number

  pending: number

  disabled: number

  totalStock: number

  totalSales: number
}

export interface MallPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface MallFilters {
  keyword?: string

  categoryId?: string

  brandId?: string

  status?: MallProductStatus

  market?: MallProductMarket

  page?: number

  pageSize?: number

  sortBy?: MallProductSortField

  sortDirection?: MallSortDirection
}

export interface MallListResponse {
  success: boolean

  products: MallProduct[]

  statistics: MallStatistics

  pagination: MallPagination

  message: string

  error?: string
}

export interface CreateMallProductInput {
  productCode: string

  name: string

  subtitle?: string | null

  description?: string | null

  categoryId?: string | null

  brandId?: string | null

  cover?: string | null

  images?: string[]

  price: number

  originalPrice?: number | null

  priceTwd?: number | null

  priceCny?: number | null

  currency: MallProductCurrency

  market: MallProductMarket

  stock: number

  safetyStock: number

  status: MallProductStatus

  sort?: number
}

export interface UpdateMallProductInput
  extends CreateMallProductInput {
  id: string
}

export interface MallProductDetailResponse {
  success: boolean

  product?: MallProduct

  message: string

  error?: string
}

export interface MallMutationResponse {
  success: boolean

  product?: MallProduct

  message: string

  error?: string
}

export interface DeleteMallProductInput {
  id: string
}

export interface DeleteMallProductResponse {
  success: boolean

  deletedId?: string

  message: string

  error?: string
}

export interface UpdateMallProductStatusInput {
  id: string

  status: MallProductStatus
}