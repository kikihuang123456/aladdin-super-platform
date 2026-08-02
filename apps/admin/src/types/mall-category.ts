export interface MallCategory {
  id: string

  parentId?: string | null

  code: string

  name: string

  description?: string | null

  imageUrl?: string | null

  sort: number

  enabled: boolean

  createdAt: string

  updatedAt: string
}

export interface MallCategoryTreeItem
  extends MallCategory {
  children: MallCategoryTreeItem[]

  depth: number
}

export interface MallCategoryFilters {
  keyword?: string

  parentId?: string | null

  enabled?: boolean

  page?: number

  pageSize?: number

  sortDirection?: 'asc' | 'desc'
}

export interface MallCategoryStatistics {
  total: number

  enabled: number

  disabled: number

  rootCategories: number

  childCategories: number
}

export interface MallCategoryPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

export interface MallCategoryListResponse {
  success: boolean

  categories: MallCategory[]

  statistics: MallCategoryStatistics

  pagination: MallCategoryPagination

  message: string

  error?: string
}

export interface MallCategoryDetailResponse {
  success: boolean

  category?: MallCategory

  message: string

  error?: string
}

export interface CreateMallCategoryInput {
  parentId?: string | null

  code: string

  name: string

  description?: string | null

  imageUrl?: string | null

  sort: number

  enabled: boolean
}

export interface UpdateMallCategoryInput
  extends CreateMallCategoryInput {
  id: string
}

export interface MallCategoryMutationResponse {
  success: boolean

  category?: MallCategory

  message: string

  error?: string
}

export interface DeleteMallCategoryResponse {
  success: boolean

  deletedId?: string

  message: string

  error?: string
}

export interface UpdateMallCategoryStatusInput {
  id: string

  enabled: boolean
}