/**
 * ALADDIN Enterprise V4
 *
 * Merchant Product ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  MerchantProduct,
  MerchantProductDetailResponse,
  MerchantProductFilters,
  MerchantProductListResponse,
  MerchantProductMutationResponse,
  MerchantProductPagination,
  MerchantProductReviewInput,
  MerchantProductStatistics,
  MerchantProductStatusUpdateInput,
  MerchantProductStockUpdateInput,
} from '../types/merchant-product'

const MERCHANT_PRODUCT_TABLE =
  'merchant_products'

const DEFAULT_PAGE_SIZE =
  20

interface MerchantProductRow {
  id?: unknown
  merchant_id?: unknown
  merchant_name?: unknown
  product_id?: unknown
  product_name?: unknown
  product_no?: unknown
  merchant_product_no?: unknown
  sale_price?: unknown
  compare_price?: unknown
  cost_price?: unknown
  currency?: unknown
  stock_quantity?: unknown
  frozen_stock?: unknown
  available_stock?: unknown
  low_stock_threshold?: unknown
  is_listed?: unknown
  status?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  review_remark?: unknown
  listed_at?: unknown
  unlisted_at?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  MerchantProductStatistics {
  return {
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    inactive: 0,
    listed: 0,
    unlisted: 0,
    totalStock: 0,
    availableStock: 0,
    lowStock: 0,
  }
}

function createEmptyPagination():
  MerchantProductPagination {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }
}

function normalizeString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback
}

function normalizeNullableString(
  value: unknown,
): string | null {
  return typeof value === 'string'
    ? value
    : null
}

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    const parsed =
      Number(value)

    return Number.isFinite(parsed)
      ? parsed
      : fallback
  }

  return fallback
}

function normalizeNullableNumber(
  value: unknown,
): number | null {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    const parsed =
      Number(value)

    return Number.isFinite(parsed)
      ? parsed
      : null
  }

  return null
}

function normalizeBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === 'boolean'
    ? value
    : fallback
}

function mapMerchantProduct(
  row:
    MerchantProductRow,
): MerchantProduct {
  return {
    id:
      normalizeString(
        row.id,
      ),

    merchantId:
      normalizeString(
        row.merchant_id,
      ),

    merchantName:
      normalizeNullableString(
        row.merchant_name,
      ),

    productId:
      normalizeString(
        row.product_id,
      ),

    productName:
      normalizeNullableString(
        row.product_name,
      ),

    productNo:
      normalizeNullableString(
        row.product_no,
      ),

    merchantProductNo:
      normalizeString(
        row.merchant_product_no,
      ),

    salePrice:
      normalizeNumber(
        row.sale_price,
      ),

    comparePrice:
      normalizeNullableNumber(
        row.compare_price,
      ),

    costPrice:
      normalizeNullableNumber(
        row.cost_price,
      ),

    currency:
      normalizeString(
        row.currency,
        'TWD',
      ),

    stockQuantity:
      normalizeNumber(
        row.stock_quantity,
      ),

    frozenStock:
      normalizeNumber(
        row.frozen_stock,
      ),

    availableStock:
      normalizeNumber(
        row.available_stock,
      ),

    lowStockThreshold:
      normalizeNumber(
        row.low_stock_threshold,
      ),

    isListed:
      normalizeBoolean(
        row.is_listed,
      ),

    status:
      normalizeString(
        row.status,
        'draft',
      ) as MerchantProduct['status'],

    reviewedBy:
      normalizeNullableString(
        row.reviewed_by,
      ),

    reviewedAt:
      normalizeNullableString(
        row.reviewed_at,
      ),

    reviewRemark:
      normalizeNullableString(
        row.review_remark,
      ),

    listedAt:
      normalizeNullableString(
        row.listed_at,
      ),

    unlistedAt:
      normalizeNullableString(
        row.unlisted_at,
      ),

    createdAt:
      normalizeString(
        row.created_at,
      ),

    updatedAt:
      normalizeString(
        row.updated_at,
      ),
  }
}
// =================================
// 商家商品列表
// =================================

export async function getMerchantProducts(
  filters:
    MerchantProductFilters,
): Promise<MerchantProductListResponse> {
  try {
    const page =
      Number.isInteger(filters.page) &&
      filters.page > 0
        ? filters.page
        : 1

    const pageSize =
      Number.isInteger(
        filters.pageSize,
      ) &&
      filters.pageSize > 0
        ? filters.pageSize
        : DEFAULT_PAGE_SIZE

    const from =
      (page - 1) *
      pageSize

    const to =
      from +
      pageSize -
      1

    let query =
      supabase
        .from(
          MERCHANT_PRODUCT_TABLE,
        )
        .select(
          '*',
          {
            count:
              'exact',
          },
        )

    const keyword =
      filters.keyword?.trim() ||
      ''

    if (keyword) {
      query =
        query.or(
          [
            `merchant_product_no.ilike.%${keyword}%`,
            `merchant_name.ilike.%${keyword}%`,
            `product_name.ilike.%${keyword}%`,
            `product_no.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (
      filters.merchantId
    ) {
      query =
        query.eq(
          'merchant_id',
          filters.merchantId,
        )
    }

    if (
      filters.productId
    ) {
      query =
        query.eq(
          'product_id',
          filters.productId,
        )
    }

    if (
      filters.status
    ) {
      query =
        query.eq(
          'status',
          filters.status,
        )
    }

    if (
      filters.isListed !==
      null &&
      filters.isListed !==
      undefined
    ) {
      query =
        query.eq(
          'is_listed',
          filters.isListed,
        )
    }

    const {
      data,
      error,
      count,
    } =
      await query
        .order(
          'created_at',
          {
            ascending:
              false,
          },
        )
        .range(
          from,
          to,
        )

    if (error) {
      throw error
    }

    const products =
      (data ?? []).map(
        (row) =>
          mapMerchantProduct(
            row as
              MerchantProductRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      products.reduce<
        MerchantProductStatistics
      >(
        (
          result,
          product,
        ) => {
          result.total += 1

          result.totalStock +=
            product.stockQuantity

          result.availableStock +=
            product.availableStock

          if (
            product.isListed
          ) {
            result.listed += 1
          } else {
            result.unlisted += 1
          }

          if (
            product.availableStock <=
            product.lowStockThreshold
          ) {
            result.lowStock += 1
          }

          switch (
            product.status
          ) {
            case 'draft':
              result.draft += 1
              break

            case 'pending':
              result.pending += 1
              break

            case 'approved':
              result.approved += 1
              break

            case 'rejected':
              result.rejected += 1
              break

            case 'active':
              result.active += 1
              break

            case 'inactive':
              result.inactive += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      products,

      statistics,

      pagination: {
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
      },

      message:
        '商家商品資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      products:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '商家商品資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家商品資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 商家商品詳情
// =================================

export async function getMerchantProductById(
  merchantProductId: string,
): Promise<MerchantProductDetailResponse> {
  const normalizedId =
    merchantProductId.trim()

  if (!normalizedId) {
    return {
      success: false,

      message:
        '商家商品 ID 不可空白。',

      error:
        '商家商品 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          MERCHANT_PRODUCT_TABLE,
        )
        .select('*')
        .eq(
          'id',
          normalizedId,
        )
        .single()

    if (error) {
      throw error
    }

    return {
      success: true,

      product:
        mapMerchantProduct(
          data as
            MerchantProductRow,
        ),

      message:
        '商家商品詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success: false,

      message:
        '商家商品詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家商品詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 商家商品審核
// =================================

export async function reviewMerchantProduct(
  input:
    MerchantProductReviewInput,
): Promise<MerchantProductMutationResponse> {
  const normalizedId =
    input.merchantProductId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家商品 ID 不可空白。',

      error:
        '商家商品 ID 不可空白。',
    }
  }

  const now =
    new Date().toISOString()

  const payload:
    Record<string, unknown> = {
      status:
        input.status,

      reviewed_by:
        input.reviewedBy ??
        null,

      reviewed_at:
        now,

      review_remark:
        input.reviewRemark ??
        null,

      updated_at:
        now,
    }

  if (
    input.status ===
    'rejected'
  ) {
    payload.is_listed =
      false

    payload.unlisted_at =
      now
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          MERCHANT_PRODUCT_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      product:
        mapMerchantProduct(
          data as
            MerchantProductRow,
        ),

      message:
        input.status ===
        'approved'
          ? '商家商品審核已通過。'
          : '商家商品審核已拒絕。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家商品審核更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家商品審核更新發生未知錯誤。',
    }
  }
}
// =================================
// 更新商家商品狀態
// =================================

export async function updateMerchantProductStatus(
  input:
    MerchantProductStatusUpdateInput,
): Promise<MerchantProductMutationResponse> {
  const normalizedId =
    input.merchantProductId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家商品 ID 不可空白。',

      error:
        '商家商品 ID 不可空白。',
    }
  }

  const now =
    new Date().toISOString()

  const shouldList =
    input.isListed ??
    input.status === 'active'

  const payload:
    Record<string, unknown> = {
      status:
        input.status,

      is_listed:
        shouldList,

      updated_at:
        now,
    }

  if (shouldList) {
    payload.listed_at =
      now

    payload.unlisted_at =
      null
  } else {
    payload.listed_at =
      null

    payload.unlisted_at =
      now
  }

  if (
    input.remark !==
    undefined
  ) {
    payload.review_remark =
      input.remark
  }

  if (
    input.operatorId !==
    undefined
  ) {
    payload.reviewed_by =
      input.operatorId
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          MERCHANT_PRODUCT_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      product:
        mapMerchantProduct(
          data as
            MerchantProductRow,
        ),

      message:
        getMerchantProductStatusMessage(
          input.status,
          shouldList,
        ),
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家商品狀態更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家商品狀態更新發生未知錯誤。',
    }
  }
}

function getMerchantProductStatusMessage(
  status:
    MerchantProductStatusUpdateInput['status'],

  isListed: boolean,
): string {
  if (
    status === 'active' &&
    isListed
  ) {
    return '商家商品已啟用並上架。'
  }

  if (
    status === 'active'
  ) {
    return '商家商品已啟用。'
  }

  if (
    status === 'inactive' &&
    !isListed
  ) {
    return '商家商品已停用並下架。'
  }

  return '商家商品狀態已更新。'
}
// =================================
// 更新商家商品庫存
// =================================

export async function updateMerchantProductStock(
  input:
    MerchantProductStockUpdateInput,
): Promise<MerchantProductMutationResponse> {
  const normalizedId =
    input.merchantProductId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家商品 ID 不可空白。',

      error:
        '商家商品 ID 不可空白。',
    }
  }

  const stockQuantity =
    Number.isFinite(
      input.stockQuantity,
    )
      ? Math.max(
          Math.trunc(
            input.stockQuantity,
          ),
          0,
        )
      : 0

  const frozenStock =
    input.frozenStock !==
    undefined &&
    Number.isFinite(
      input.frozenStock,
    )
      ? Math.max(
          Math.trunc(
            input.frozenStock,
          ),
          0,
        )
      : 0

  if (
    frozenStock >
    stockQuantity
  ) {
    return {
      success:
        false,

      message:
        '凍結庫存不可大於總庫存。',

      error:
        '凍結庫存不可大於總庫存。',
    }
  }

  const lowStockThreshold =
    input.lowStockThreshold !==
      undefined &&
    Number.isFinite(
      input.lowStockThreshold,
    )
      ? Math.max(
          Math.trunc(
            input.lowStockThreshold,
          ),
          0,
        )
      : 0

  const availableStock =
    stockQuantity -
    frozenStock

  const now =
    new Date().toISOString()

  const payload:
    Record<string, unknown> = {
      stock_quantity:
        stockQuantity,

      frozen_stock:
        frozenStock,

      available_stock:
        availableStock,

      low_stock_threshold:
        lowStockThreshold,

      updated_at:
        now,
    }

  if (
    input.remark !==
    undefined
  ) {
    payload.review_remark =
      input.remark
  }

  if (
    input.operatorId !==
    undefined
  ) {
    payload.reviewed_by =
      input.operatorId
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          MERCHANT_PRODUCT_TABLE,
        )
        .update(
          payload,
        )
        .eq(
          'id',
          normalizedId,
        )
        .select('*')
        .single()

    if (error) {
      throw error
    }

    return {
      success:
        true,

      product:
        mapMerchantProduct(
          data as
            MerchantProductRow,
        ),

      message:
        availableStock <=
        lowStockThreshold
          ? '商家商品庫存已更新，目前已達低庫存警戒。'
          : '商家商品庫存已更新。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家商品庫存更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家商品庫存更新發生未知錯誤。',
    }
  }
}