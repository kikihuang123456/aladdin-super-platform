import {
  supabase,
} from '../lib/supabase'

import type {
  CreateMallCategoryInput,
  MallCategory,
  MallCategoryDetailResponse,
  MallCategoryFilters,
  MallCategoryListResponse,
  MallCategoryMutationResponse,
  MallCategoryPagination,
  MallCategoryStatistics,
  UpdateMallCategoryInput,
} from '../types/mall-category'

interface MallCategoryRecord {
  id: string

  parent_id:
    string | null

  code:
    string | null

  name:
    string | null

  description:
    string | null

  image_url:
    string | null

  sort:
    number | string | null

  enabled:
    boolean | null

  created_at:
    string | null

  updated_at:
    string | null
}

interface CategoryCountResult {
  count: number
}

const MALL_CATEGORIES_TABLE =
  'mall_categories'

const DEFAULT_PAGE =
  1

const DEFAULT_PAGE_SIZE =
  20

const MAX_PAGE_SIZE =
  100

const CATEGORY_SELECT = `
  id,
  parent_id,
  code,
  name,
  description,
  image_url,
  sort,
  enabled,
  created_at,
  updated_at
`

function normalizePage(
  value?: number,
): number {
  if (
    !Number.isInteger(value) ||
    (value ?? 0) < 1
  ) {
    return DEFAULT_PAGE
  }

  return value as number
}

function normalizePageSize(
  value?: number,
): number {
  if (
    !Number.isInteger(value) ||
    (value ?? 0) < 1
  ) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(
    value as number,
    MAX_PAGE_SIZE,
  )
}

function normalizeRequiredText(
  value: string,
  fieldName: string,
): string {
  const normalizedValue =
    value.trim()

  if (!normalizedValue) {
    throw new Error(
      `${fieldName}不可空白。`,
    )
  }

  return normalizedValue
}

function normalizeOptionalText(
  value?: string | null,
): string | null {
  const normalizedValue =
    value?.trim() ?? ''

  return normalizedValue ||
    null
}

function normalizeNonNegativeInteger(
  value: unknown,
  fieldName: string,
): number {
  const normalizedValue =
    Number(value)

  if (
    !Number.isInteger(
      normalizedValue,
    ) ||
    normalizedValue < 0
  ) {
    throw new Error(
      `${fieldName}必須是大於或等於 0 的整數。`,
    )
  }

  return normalizedValue
}

function normalizeInteger(
  value: unknown,
): number {
  const normalizedValue =
    Number(value)

  if (
    !Number.isFinite(
      normalizedValue,
    )
  ) {
    return 0
  }

  return Math.max(
    0,
    Math.trunc(
      normalizedValue,
    ),
  )
}

function normalizeBoolean(
  value: unknown,
): boolean {
  if (
    value === false ||
    value === 'false' ||
    value === 0
  ) {
    return false
  }

  return true
}

function normalizeCategoryRecord(
  record: MallCategoryRecord,
): MallCategory {
  return {
    id:
      record.id,

    parentId:
      record.parent_id ?? null,

    code:
      record.code ?? '',

    name:
      record.name ??
      '未命名分類',

    description:
      record.description ?? null,

    imageUrl:
      record.image_url ?? null,

    sort:
      normalizeInteger(
        record.sort,
      ),

    enabled:
      normalizeBoolean(
        record.enabled,
      ),

    createdAt:
      record.created_at ?? '',

    updatedAt:
      record.updated_at ?? '',
  }
}

function createEmptyStatistics():
  MallCategoryStatistics {
  return {
    total: 0,
    enabled: 0,
    disabled: 0,
    rootCategories: 0,
    childCategories: 0,
  }
}

function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): MallCategoryPagination {
  return {
    page,
    pageSize,
    total,

    totalPages:
      total > 0
        ? Math.ceil(
            total /
              pageSize,
          )
        : 0,
  }
}

function normalizeMallCategoryApiError(
  caughtError: unknown,
): Error {
  if (
    caughtError instanceof Error
  ) {
    return caughtError
  }

  if (
    typeof caughtError ===
      'object' &&
    caughtError !== null &&
    'message' in caughtError &&
    typeof caughtError.message ===
      'string'
  ) {
    return new Error(
      caughtError.message,
    )
  }

  return new Error(
    '商品分類 API 發生未知錯誤。',
  )
}

async function countCategories(
  options: {
    enabled?: boolean
    rootOnly?: boolean
    childOnly?: boolean
  } = {},
): Promise<CategoryCountResult> {
  let query =
    supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .select(
        'id',
        {
          count: 'exact',
          head: true,
        },
      )

  if (
    typeof options.enabled ===
      'boolean'
  ) {
    query = query.eq(
      'enabled',
      options.enabled,
    )
  }

  if (options.rootOnly) {
    query = query.is(
      'parent_id',
      null,
    )
  }

  if (options.childOnly) {
    query = query.not(
      'parent_id',
      'is',
      null,
    )
  }

  const {
    count,
    error,
  } = await query

  if (error) {
    throw error
  }

  return {
    count:
      count ?? 0,
  }
}

async function validateParentCategory(
  parentId:
    string | null,
  currentCategoryId?: string,
): Promise<void> {
  if (!parentId) {
    return
  }

  if (
    currentCategoryId &&
    parentId ===
      currentCategoryId
  ) {
    throw new Error(
      '商品分類不可將自己設為父分類。',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      MALL_CATEGORIES_TABLE,
    )
    .select(
      `
        id,
        parent_id,
        enabled
      `,
    )
    .eq(
      'id',
      parentId,
    )
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error(
      '找不到指定的父分類。',
    )
  }

  if (
    currentCategoryId &&
    data.parent_id ===
      currentCategoryId
  ) {
    throw new Error(
      '不可將子分類設為目前分類的父分類。',
    )
  }
}

async function categoryHasChildren(
  categoryId: string,
): Promise<boolean> {
  const {
    count,
    error,
  } = await supabase
    .from(
      MALL_CATEGORIES_TABLE,
    )
    .select(
      'id',
      {
        count: 'exact',
        head: true,
      },
    )
    .eq(
      'parent_id',
      categoryId,
    )

  if (error) {
    throw error
  }

  return (count ?? 0) > 0
}

async function categoryHasProducts(
  categoryId: string,
): Promise<boolean> {
  const {
    count,
    error,
  } = await supabase
    .from(
      'mall_products',
    )
    .select(
      'id',
      {
        count: 'exact',
        head: true,
      },
    )
    .eq(
      'category_id',
      categoryId,
    )

  if (error) {
    throw error
  }

  return (count ?? 0) > 0
}

export async function getMallCategoryStatistics():
  Promise<MallCategoryStatistics> {
  try {
    const [
      totalResult,
      enabledResult,
      disabledResult,
      rootResult,
      childResult,
    ] = await Promise.all([
      countCategories(),

      countCategories({
        enabled: true,
      }),

      countCategories({
        enabled: false,
      }),

      countCategories({
        rootOnly: true,
      }),

      countCategories({
        childOnly: true,
      }),
    ])

    return {
      total:
        totalResult.count,

      enabled:
        enabledResult.count,

      disabled:
        disabledResult.count,

      rootCategories:
        rootResult.count,

      childCategories:
        childResult.count,
    }
  } catch (caughtError) {
    throw normalizeMallCategoryApiError(
      caughtError,
    )
  }
}

export async function getMallCategories(
  filters: MallCategoryFilters = {},
): Promise<MallCategoryListResponse> {
  const page =
    normalizePage(
      filters.page,
    )

  const pageSize =
    normalizePageSize(
      filters.pageSize,
    )

  const from =
    (page - 1) *
    pageSize

  const to =
    from +
    pageSize -
    1

  try {
    let query =
      supabase
        .from(
          MALL_CATEGORIES_TABLE,
        )
        .select(
          CATEGORY_SELECT,
          {
            count: 'exact',
          },
        )

    const keyword =
      filters.keyword
        ?.trim()

    if (keyword) {
      const escapedKeyword =
        keyword.replace(
          /[%_,]/g,
          '',
        )

      query = query.or(
        [
          `code.ilike.%${escapedKeyword}%`,
          `name.ilike.%${escapedKeyword}%`,
          `description.ilike.%${escapedKeyword}%`,
        ].join(','),
      )
    }

    if (
      typeof filters.enabled ===
        'boolean'
    ) {
      query = query.eq(
        'enabled',
        filters.enabled,
      )
    }

    if (
      filters.parentId ===
        null
    ) {
      query = query.is(
        'parent_id',
        null,
      )
    } else if (
      typeof filters.parentId ===
        'string' &&
      filters.parentId.trim()
    ) {
      query = query.eq(
        'parent_id',
        filters.parentId.trim(),
      )
    }

    query = query
      .order(
        'sort',
        {
          ascending:
            filters.sortDirection !==
            'desc',
        },
      )
      .order(
        'created_at',
        {
          ascending:
            filters.sortDirection !==
            'desc',
        },
      )
      .range(
        from,
        to,
      )

    const [
      listResult,
      statistics,
    ] = await Promise.all([
      query,
      getMallCategoryStatistics(),
    ])

    if (listResult.error) {
      throw listResult.error
    }

    const records =
      (listResult.data ??
        []) as MallCategoryRecord[]

    const categories =
      records.map(
        normalizeCategoryRecord,
      )

    const total =
      listResult.count ?? 0

    return {
      success: true,
      categories,
      statistics,

      pagination:
        createPaginationMeta(
          page,
          pageSize,
          total,
        ),

      message:
        categories.length > 0
          ? '商品分類資料載入成功。'
          : '目前沒有符合條件的商品分類。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,
      categories: [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createPaginationMeta(
          page,
          pageSize,
          0,
        ),

      message:
        '商品分類資料載入失敗。',

      error:
        normalizedError.message,
    }
  }
}

export async function getAllEnabledMallCategories():
  Promise<MallCategory[]> {
  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .select(
        CATEGORY_SELECT,
      )
      .eq(
        'enabled',
        true,
      )
      .order(
        'sort',
        {
          ascending: true,
        },
      )
      .order(
        'name',
        {
          ascending: true,
        },
      )

    if (error) {
      throw error
    }

    return (
      (data ?? []) as
        MallCategoryRecord[]
    ).map(
      normalizeCategoryRecord,
    )
  } catch (caughtError) {
    throw normalizeMallCategoryApiError(
      caughtError,
    )
  }
}

export async function getMallCategoryById(
  categoryId: string,
): Promise<MallCategoryDetailResponse> {
  const normalizedCategoryId =
    categoryId.trim()

  if (!normalizedCategoryId) {
    return {
      success: false,
      message:
        '商品分類資料載入失敗。',
      error:
        '商品分類 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .select(
        CATEGORY_SELECT,
      )
      .eq(
        'id',
        normalizedCategoryId,
      )
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return {
        success: false,
        message:
          '商品分類資料載入失敗。',
        error:
          '找不到指定的商品分類。',
      }
    }

    return {
      success: true,

      category:
        normalizeCategoryRecord(
          data as MallCategoryRecord,
        ),

      message:
        '商品分類資料載入成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,

      message:
        '商品分類資料載入失敗。',

      error:
        normalizedError.message,
    }
  }
}

export async function createMallCategory(
  input: CreateMallCategoryInput,
): Promise<MallCategoryMutationResponse> {
  try {
    const code =
      normalizeRequiredText(
        input.code,
        '分類代碼',
      )

    const name =
      normalizeRequiredText(
        input.name,
        '分類名稱',
      )

    const parentId =
      normalizeOptionalText(
        input.parentId,
      )

    const sort =
      normalizeNonNegativeInteger(
        input.sort,
        '分類排序',
      )

    await validateParentCategory(
      parentId,
    )

    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .insert({
        parent_id:
          parentId,

        code,

        name,

        description:
          normalizeOptionalText(
            input.description,
          ),

        image_url:
          normalizeOptionalText(
            input.imageUrl,
          ),

        sort,

        enabled:
          input.enabled,
      })
      .select(
        CATEGORY_SELECT,
      )
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,

      category:
        normalizeCategoryRecord(
          data as MallCategoryRecord,
        ),

      message:
        '商品分類新增成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,

      message:
        '商品分類新增失敗。',

      error:
        normalizedError.message,
    }
  }
}

export async function updateMallCategory(
  input: UpdateMallCategoryInput,
): Promise<MallCategoryMutationResponse> {
  try {
    const categoryId =
      normalizeRequiredText(
        input.id,
        '商品分類 ID',
      )

    const code =
      normalizeRequiredText(
        input.code,
        '分類代碼',
      )

    const name =
      normalizeRequiredText(
        input.name,
        '分類名稱',
      )

    const parentId =
      normalizeOptionalText(
        input.parentId,
      )

    const sort =
      normalizeNonNegativeInteger(
        input.sort,
        '分類排序',
      )

    await validateParentCategory(
      parentId,
      categoryId,
    )

    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .update({
        parent_id:
          parentId,

        code,

        name,

        description:
          normalizeOptionalText(
            input.description,
          ),

        image_url:
          normalizeOptionalText(
            input.imageUrl,
          ),

        sort,

        enabled:
          input.enabled,
      })
      .eq(
        'id',
        categoryId,
      )
      .select(
        CATEGORY_SELECT,
      )
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,

      category:
        normalizeCategoryRecord(
          data as MallCategoryRecord,
        ),

      message:
        '商品分類更新成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,

      message:
        '商品分類更新失敗。',

      error:
        normalizedError.message,
    }
  }
}

export async function updateMallCategoryStatus(
  categoryId: string,
  enabled: boolean,
): Promise<MallCategoryMutationResponse> {
  const normalizedCategoryId =
    categoryId.trim()

  if (!normalizedCategoryId) {
    return {
      success: false,

      message:
        '商品分類狀態更新失敗。',

      error:
        '商品分類 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .update({
        enabled,
      })
      .eq(
        'id',
        normalizedCategoryId,
      )
      .select(
        CATEGORY_SELECT,
      )
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,

      category:
        normalizeCategoryRecord(
          data as MallCategoryRecord,
        ),

      message:
        enabled
          ? '商品分類已啟用。'
          : '商品分類已停用。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,

      message:
        '商品分類狀態更新失敗。',

      error:
        normalizedError.message,
    }
  }
}

export async function deleteMallCategory(
  categoryId: string,
): Promise<{
  success: boolean
  deletedId?: string
  message: string
  error?: string
}> {
  const normalizedCategoryId =
    categoryId.trim()

  if (!normalizedCategoryId) {
    return {
      success: false,

      message:
        '商品分類刪除失敗。',

      error:
        '商品分類 ID 不可空白。',
    }
  }

  try {
    const [
      hasChildren,
      hasProducts,
    ] = await Promise.all([
      categoryHasChildren(
        normalizedCategoryId,
      ),

      categoryHasProducts(
        normalizedCategoryId,
      ),
    ])

    if (hasChildren) {
      throw new Error(
        '此分類仍有子分類，請先移動或刪除子分類。',
      )
    }

    if (hasProducts) {
      throw new Error(
        '此分類仍有商品，請先將商品移至其他分類。',
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_CATEGORIES_TABLE,
      )
      .delete()
      .eq(
        'id',
        normalizedCategoryId,
      )
      .select(
        'id',
      )
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error(
        '找不到指定的商品分類，或目前帳號沒有刪除權限。',
      )
    }

    return {
      success: true,

      deletedId:
        String(data.id),

      message:
        '商品分類刪除成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallCategoryApiError(
        caughtError,
      )

    return {
      success: false,

      message:
        '商品分類刪除失敗。',

      error:
        normalizedError.message,
    }
  }
}