import {
  supabase,
} from '../lib/supabase'

import type {
  CreateMallProductInput,
  MallFilters,
  MallListResponse,
  MallMutationResponse,
  MallPagination,
  MallProduct,
  MallProductCurrency,
  MallProductDetailResponse,
  MallProductMarket,
  MallProductSortField,
  MallProductStatus,
  MallStatistics,
  MallSortDirection,
  UpdateMallProductInput,
} from '../types/mall'

interface MallProductRecord {
  id: string

  product_code:
    string | null

  name:
    string | null

  subtitle:
    string | null

  description:
    string | null

  category_id:
    string | null

  category_name?:
    string | null

  brand_id:
    string | null

  brand_name?:
    string | null

  cover:
    string | null

  images:
    unknown

  price:
    number | string | null

  original_price:
    number | string | null

  price_twd:
    number | string | null

  price_cny:
    number | string | null

  currency:
    string | null

  market:
    string | null

  stock:
    number | string | null

  safety_stock:
    number | string | null

  sales:
    number | string | null

  status:
    string | null

  sort:
    number | string | null

  published_at:
    string | null

  created_at:
    string | null

  updated_at:
    string | null
}

interface CountResult {
  count: number
}

const MALL_PRODUCTS_TABLE =
  'mall_products'

const DEFAULT_PAGE =
  1

const DEFAULT_PAGE_SIZE =
  20

const MAX_PAGE_SIZE =
  100

const PRODUCT_SELECT = `
  id,
  product_code,
  name,
  subtitle,
  description,
  category_id,
  brand_id,
  cover,
  images,
  price,
  original_price,
  price_twd,
  price_cny,
  currency,
  market,
  stock,
  safety_stock,
  sales,
  status,
  sort,
  published_at,
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

function normalizeNumber(
  value: unknown,
): number {
  const normalizedValue =
    Number(value)

  return Number.isFinite(
    normalizedValue,
  )
    ? normalizedValue
    : 0
}

function normalizeNullableNumber(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const normalizedValue =
    Number(value)

  return Number.isFinite(
    normalizedValue,
  )
    ? normalizedValue
    : null
}

function normalizeNonNegativeNumber(
  value: unknown,
  fieldName: string,
): number {
  const normalizedValue =
    Number(value)

  if (
    !Number.isFinite(
      normalizedValue,
    ) ||
    normalizedValue < 0
  ) {
    throw new Error(
      `${fieldName}必須是大於或等於 0 的數字。`,
    )
  }

  return normalizedValue
}

function normalizeNullableNonNegativeNumber(
  value: unknown,
  fieldName: string,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  return normalizeNonNegativeNumber(
    value,
    fieldName,
  )
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

function normalizeCurrency(
  value: unknown,
): MallProductCurrency {
  switch (value) {
    case 'CNY':
      return 'CNY'

    case 'USD':
      return 'USD'

    case 'TWD':
    default:
      return 'TWD'
  }
}

function normalizeMarket(
  value: unknown,
): MallProductMarket {
  switch (value) {
    case 'taiwan':
      return 'taiwan'

    case 'china':
      return 'china'

    case 'global':
    default:
      return 'global'
  }
}

function normalizeProductStatus(
  value: unknown,
): MallProductStatus {
  switch (value) {
    case 'pending':
      return 'pending'

    case 'published':
      return 'published'

    case 'disabled':
      return 'disabled'

    case 'draft':
    default:
      return 'draft'
  }
}

function normalizeImages(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
              'string',
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  )
}

function normalizeInputImages(
  images?: string[],
): string[] {
  return Array.from(
    new Set(
      (images ?? [])
        .map(
          (imageUrl) =>
            imageUrl.trim(),
        )
        .filter(Boolean),
    ),
  )
}

function normalizeProductRecord(
  record: MallProductRecord,
): MallProduct {
  return {
    id:
      record.id,

    productCode:
      record.product_code ?? '',

    name:
      record.name ??
      '未命名商品',

    subtitle:
      record.subtitle ?? null,

    description:
      record.description ?? null,

    categoryId:
      record.category_id ?? null,

    categoryName:
      record.category_name ?? null,

    brandId:
      record.brand_id ?? null,

    brandName:
      record.brand_name ?? null,

    cover:
      record.cover ?? null,

    images:
      normalizeImages(
        record.images,
      ),

    price:
      normalizeNumber(
        record.price,
      ),

    originalPrice:
      normalizeNullableNumber(
        record.original_price,
      ),

    priceTwd:
      normalizeNullableNumber(
        record.price_twd,
      ),

    priceCny:
      normalizeNullableNumber(
        record.price_cny,
      ),

    currency:
      normalizeCurrency(
        record.currency,
      ),

    market:
      normalizeMarket(
        record.market,
      ),

    stock:
      normalizeInteger(
        record.stock,
      ),

    safetyStock:
      normalizeInteger(
        record.safety_stock,
      ),

    sales:
      normalizeInteger(
        record.sales,
      ),

    status:
      normalizeProductStatus(
        record.status,
      ),

    sort:
      normalizeInteger(
        record.sort,
      ),

    publishedAt:
      record.published_at ?? null,

    createdAt:
      record.created_at ?? '',

    updatedAt:
      record.updated_at ?? '',

    skus: [],
  }
}

function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): MallPagination {
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

function createEmptyStatistics():
  MallStatistics {
  return {
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    disabled: 0,
    totalStock: 0,
    totalSales: 0,
  }
}

function normalizeMallApiError(
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
    '商城 API 發生未知錯誤。',
  )
}

async function countProductsByStatus(
  status?: MallProductStatus,
): Promise<CountResult> {
  let query =
    supabase
      .from(
        MALL_PRODUCTS_TABLE,
      )
      .select(
        'id',
        {
          count: 'exact',
          head: true,
        },
      )

  if (status) {
    query = query.eq(
      'status',
      status,
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

async function getProductTotals():
  Promise<{
    totalStock: number
    totalSales: number
  }> {
  const {
    data,
    error,
  } = await supabase
    .from(
      MALL_PRODUCTS_TABLE,
    )
    .select(
      `
        stock,
        sales
      `,
    )

  if (error) {
    throw error
  }

  const records =
    data ?? []

  return records.reduce(
    (
      totals,
      record,
    ) => ({
      totalStock:
        totals.totalStock +
        normalizeInteger(
          record.stock,
        ),

      totalSales:
        totals.totalSales +
        normalizeInteger(
          record.sales,
        ),
    }),
    {
      totalStock: 0,
      totalSales: 0,
    },
  )
}

export async function getMallStatistics():
  Promise<MallStatistics> {
  try {
    const [
      totalResult,
      publishedResult,
      draftResult,
      pendingResult,
      disabledResult,
      productTotals,
    ] = await Promise.all([
      countProductsByStatus(),

      countProductsByStatus(
        'published',
      ),

      countProductsByStatus(
        'draft',
      ),

      countProductsByStatus(
        'pending',
      ),

      countProductsByStatus(
        'disabled',
      ),

      getProductTotals(),
    ])

    return {
      total:
        totalResult.count,

      published:
        publishedResult.count,

      draft:
        draftResult.count,

      pending:
        pendingResult.count,

      disabled:
        disabledResult.count,

      totalStock:
        productTotals.totalStock,

      totalSales:
        productTotals.totalSales,
    }
  } catch (caughtError) {
    throw normalizeMallApiError(
      caughtError,
    )
  }
}

export async function getMallProducts(
  filters: MallFilters = {},
): Promise<MallListResponse> {
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
          MALL_PRODUCTS_TABLE,
        )
        .select(
          PRODUCT_SELECT,
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
          `product_code.ilike.%${escapedKeyword}%`,
          `name.ilike.%${escapedKeyword}%`,
          `subtitle.ilike.%${escapedKeyword}%`,
        ].join(','),
      )
    }

    if (
      filters.categoryId
        ?.trim()
    ) {
      query = query.eq(
        'category_id',
        filters.categoryId.trim(),
      )
    }

    if (
      filters.brandId
        ?.trim()
    ) {
      query = query.eq(
        'brand_id',
        filters.brandId.trim(),
      )
    }

    if (filters.status) {
      query = query.eq(
        'status',
        filters.status,
      )
    }

    if (filters.market) {
      query = query.eq(
        'market',
        filters.market,
      )
    }

    const sortBy:
      MallProductSortField =
        filters.sortBy ??
        'created_at'

    const sortDirection:
      MallSortDirection =
        filters.sortDirection ??
        'desc'

    query = query.order(
      sortBy,
      {
        ascending:
          sortDirection ===
          'asc',
      },
    )

    query = query.range(
      from,
      to,
    )

    const [
      listResult,
      statistics,
    ] = await Promise.all([
      query,
      getMallStatistics(),
    ])

    if (listResult.error) {
      throw listResult.error
    }

    const records =
      (listResult.data ??
        []) as MallProductRecord[]

    const products =
      records.map(
        normalizeProductRecord,
      )

    const total =
      listResult.count ?? 0

    return {
      success: true,
      products,
      statistics,
      pagination:
        createPaginationMeta(
          page,
          pageSize,
          total,
        ),
      message:
        products.length > 0
          ? '商品資料載入成功。'
          : '目前沒有符合條件的商品資料。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallApiError(
        caughtError,
      )

    return {
      success: false,
      products: [],
      statistics:
        createEmptyStatistics(),
      pagination:
        createPaginationMeta(
          page,
          pageSize,
          0,
        ),
      message:
        '商品資料載入失敗。',
      error:
        normalizedError.message,
    }
  }
}

export async function getMallProductById(
  productId: string,
): Promise<MallProductDetailResponse> {
  const normalizedProductId =
    productId.trim()

  if (!normalizedProductId) {
    return {
      success: false,
      message:
        '商品資料載入失敗。',
      error:
        '商品 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_PRODUCTS_TABLE,
      )
      .select(
        PRODUCT_SELECT,
      )
      .eq(
        'id',
        normalizedProductId,
      )
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return {
        success: false,
        message:
          '商品資料載入失敗。',
        error:
          '找不到指定商品。',
      }
    }

    return {
      success: true,
      product:
        normalizeProductRecord(
          data as MallProductRecord,
        ),
      message:
        '商品資料載入成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallApiError(
        caughtError,
      )

    return {
      success: false,
      message:
        '商品資料載入失敗。',
      error:
        normalizedError.message,
    }
  }
}

export async function createMallProduct(
  input: CreateMallProductInput,
): Promise<MallMutationResponse> {
  try {
    const productCode =
      normalizeRequiredText(
        input.productCode,
        '商品編號',
      )

    const name =
      normalizeRequiredText(
        input.name,
        '商品名稱',
      )

    const price =
      normalizeNonNegativeNumber(
        input.price,
        '商品主售價',
      )

    const originalPrice =
      normalizeNullableNonNegativeNumber(
        input.originalPrice,
        '商品原價',
      )

    const priceTwd =
      normalizeNullableNonNegativeNumber(
        input.priceTwd,
        '台幣售價',
      )

    const priceCny =
      normalizeNullableNonNegativeNumber(
        input.priceCny,
        '人民幣售價',
      )

    const stock =
      normalizeNonNegativeInteger(
        input.stock,
        '商品庫存',
      )

    const safetyStock =
      normalizeNonNegativeInteger(
        input.safetyStock,
        '安全庫存',
      )

    const sort =
      normalizeNonNegativeInteger(
        input.sort ?? 0,
        '商品排序',
      )

    if (
      originalPrice !== null &&
      originalPrice < price
    ) {
      throw new Error(
        '商品原價不可低於商品主售價。',
      )
    }

    const status =
      normalizeProductStatus(
        input.status,
      )

    const publishedAt =
      status === 'published'
        ? new Date()
            .toISOString()
        : null

    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_PRODUCTS_TABLE,
      )
      .insert({
        product_code:
          productCode,

        name,

        subtitle:
          normalizeOptionalText(
            input.subtitle,
          ),

        description:
          normalizeOptionalText(
            input.description,
          ),

        category_id:
          normalizeOptionalText(
            input.categoryId,
          ),

        brand_id:
          normalizeOptionalText(
            input.brandId,
          ),

        cover:
          normalizeOptionalText(
            input.cover,
          ),

        images:
          normalizeInputImages(
            input.images,
          ),

        price,

        original_price:
          originalPrice,

        price_twd:
          priceTwd,

        price_cny:
          priceCny,

        currency:
          normalizeCurrency(
            input.currency,
          ),

        market:
          normalizeMarket(
            input.market,
          ),

        stock,

        safety_stock:
          safetyStock,

        sales: 0,

        status,

        sort,

        published_at:
          publishedAt,
      })
      .select(
        PRODUCT_SELECT,
      )
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      product:
        normalizeProductRecord(
          data as MallProductRecord,
        ),
      message:
        '商品新增成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallApiError(
        caughtError,
      )

    return {
      success: false,
      message:
        '商品新增失敗。',
      error:
        normalizedError.message,
    }
  }
}

export async function updateMallProduct(
  input: UpdateMallProductInput,
): Promise<MallMutationResponse> {
  try {
    const productId =
      normalizeRequiredText(
        input.id,
        '商品 ID',
      )

    const productCode =
      normalizeRequiredText(
        input.productCode,
        '商品編號',
      )

    const name =
      normalizeRequiredText(
        input.name,
        '商品名稱',
      )

    const price =
      normalizeNonNegativeNumber(
        input.price,
        '商品主售價',
      )

    const originalPrice =
      normalizeNullableNonNegativeNumber(
        input.originalPrice,
        '商品原價',
      )

    const priceTwd =
      normalizeNullableNonNegativeNumber(
        input.priceTwd,
        '台幣售價',
      )

    const priceCny =
      normalizeNullableNonNegativeNumber(
        input.priceCny,
        '人民幣售價',
      )

    const stock =
      normalizeNonNegativeInteger(
        input.stock,
        '商品庫存',
      )

    const safetyStock =
      normalizeNonNegativeInteger(
        input.safetyStock,
        '安全庫存',
      )

    const sort =
      normalizeNonNegativeInteger(
        input.sort ?? 0,
        '商品排序',
      )

    if (
      originalPrice !== null &&
      originalPrice < price
    ) {
      throw new Error(
        '商品原價不可低於商品主售價。',
      )
    }

    const status =
      normalizeProductStatus(
        input.status,
      )

    const {
      data: existingProduct,
      error: existingProductError,
    } = await supabase
      .from(
        MALL_PRODUCTS_TABLE,
      )
      .select(
        `
          id,
          published_at
        `,
      )
      .eq(
        'id',
        productId,
      )
      .maybeSingle()

    if (existingProductError) {
      throw existingProductError
    }

    if (!existingProduct) {
      throw new Error(
        '找不到指定商品。',
      )
    }

    const publishedAt =
      status === 'published'
        ? (
            existingProduct
              .published_at ??
            new Date()
              .toISOString()
          )
        : null

    const {
      data,
      error,
    } = await supabase
      .from(
        MALL_PRODUCTS_TABLE,
      )
      .update({
        product_code:
          productCode,

        name,

        subtitle:
          normalizeOptionalText(
            input.subtitle,
          ),

        description:
          normalizeOptionalText(
            input.description,
          ),

        category_id:
          normalizeOptionalText(
            input.categoryId,
          ),

        brand_id:
          normalizeOptionalText(
            input.brandId,
          ),

        cover:
          normalizeOptionalText(
            input.cover,
          ),

        images:
          normalizeInputImages(
            input.images,
          ),

        price,

        original_price:
          originalPrice,

        price_twd:
          priceTwd,

        price_cny:
          priceCny,

        currency:
          normalizeCurrency(
            input.currency,
          ),

        market:
          normalizeMarket(
            input.market,
          ),

        stock,

        safety_stock:
          safetyStock,

        status,

        sort,

        published_at:
          publishedAt,
      })
      .eq(
        'id',
        productId,
      )
      .select(
        PRODUCT_SELECT,
      )
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      product:
        normalizeProductRecord(
          data as MallProductRecord,
        ),
      message:
        '商品更新成功。',
    }
  } catch (caughtError) {
    const normalizedError =
      normalizeMallApiError(
        caughtError,
      )

    return {
      success: false,
      message:
        '商品更新失敗。',
      error:
        normalizedError.message,
    }
  }
}