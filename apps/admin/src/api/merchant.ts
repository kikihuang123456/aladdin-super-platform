/**
 * ALADDIN Enterprise V4
 *
 * Merchant ERP
 *
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  Merchant,
  MerchantCreateInput,
  MerchantDetailResponse,
  MerchantFilters,
  MerchantListResponse,
  MerchantMutationResponse,
  MerchantPagination,
  MerchantReviewInput,
  MerchantStatistics,
  MerchantStatusUpdateInput,
} from '../types/merchant'

const MERCHANT_TABLE =
  'merchants'

const DEFAULT_PAGE_SIZE =
  20

interface MerchantRow {
  id?: unknown
  merchant_no?: unknown
  name?: unknown
  legal_name?: unknown
  merchant_type?: unknown
  market?: unknown
  contact_name?: unknown
  contact_phone?: unknown
  contact_email?: unknown
  business_license_no?: unknown
  tax_no?: unknown
  address?: unknown
  logo_url?: unknown
  cover_image_url?: unknown
  website_url?: unknown
  description?: unknown
  status?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  review_remark?: unknown
  activated_at?: unknown
  archived_at?: unknown
  archived_by?: unknown
  deleted_at?: unknown
  created_at?: unknown
  updated_at?: unknown
}

function createEmptyStatistics():
  MerchantStatistics {
  return {
    total:
      0,

    pending:
      0,

    approved:
      0,

    active:
      0,

    suspended:
      0,

    rejected:
      0,

    disabled:
      0,

    taiwan:
      0,

    china:
      0,

    crossBorder:
      0,
  }
}

function createEmptyPagination():
  MerchantPagination {
  return {
    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total:
      0,

    totalPages:
      0,
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

function mapMerchant(
  row:
    MerchantRow,
): Merchant {
  return {
    id:
      normalizeString(
        row.id,
      ),

    merchantNo:
      normalizeString(
        row.merchant_no,
      ),

    name:
      normalizeString(
        row.name,
      ),

    legalName:
      normalizeNullableString(
        row.legal_name,
      ),

    merchantType:
      normalizeString(
        row.merchant_type,
        'individual',
      ) as Merchant['merchantType'],

    market:
      normalizeString(
        row.market,
        'taiwan',
      ) as Merchant['market'],

    contactName:
      normalizeNullableString(
        row.contact_name,
      ),

    contactPhone:
      normalizeNullableString(
        row.contact_phone,
      ),

    contactEmail:
      normalizeNullableString(
        row.contact_email,
      ),

    businessLicenseNo:
      normalizeNullableString(
        row.business_license_no,
      ),

    taxNo:
      normalizeNullableString(
        row.tax_no,
      ),

    address:
      normalizeNullableString(
        row.address,
      ),

    logoUrl:
      normalizeNullableString(
        row.logo_url,
      ),

    coverImageUrl:
      normalizeNullableString(
        row.cover_image_url,
      ),

    websiteUrl:
      normalizeNullableString(
        row.website_url,
      ),

    description:
      normalizeNullableString(
        row.description,
      ),

    status:
      normalizeString(
        row.status,
        'pending',
      ) as Merchant['status'],

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

    activatedAt:
      normalizeNullableString(
        row.activated_at,
      ),

    archivedAt:
      normalizeNullableString(
        row.archived_at,
      ),

    archivedBy:
      normalizeNullableString(
        row.archived_by,
      ),

    deletedAt:
      normalizeNullableString(
        row.deleted_at,
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
// 商家列表
// =================================

// =================================
// 新增商家
// =================================

export async function createMerchant(
  input:
    MerchantCreateInput,
): Promise<MerchantMutationResponse> {
  const normalizedName =
    input.name.trim()

  if (!normalizedName) {
    return {
      success:
        false,

      message:
        '商家名稱不可空白。',

      error:
        '商家名稱不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'create_merchant',
        {
          p_name:
            normalizedName,

          p_legal_name:
            input.legalName?.trim() ||
            null,

          p_merchant_type:
            input.merchantType,

          p_market:
            input.market,

          p_contact_name:
            input.contactName?.trim() ||
            null,

          p_contact_phone:
            input.contactPhone?.trim() ||
            null,

          p_contact_email:
            input.contactEmail?.trim() ||
            null,

          p_business_license_no:
            input.businessLicenseNo?.trim() ||
            null,

          p_tax_no:
            input.taxNo?.trim() ||
            null,

          p_address:
            input.address?.trim() ||
            null,

          p_logo_url:
            input.logoUrl?.trim() ||
            null,

          p_cover_image_url:
            input.coverImageUrl?.trim() ||
            null,

          p_website_url:
            input.websiteUrl?.trim() ||
            null,

          p_description:
            input.description?.trim() ||
            null,
        },
      )

    if (error) {
      throw error
    }

    const row =
      Array.isArray(data)
        ? data[0]
        : data

    if (!row) {
      throw new Error(
        '新增商家成功，但未取得商家資料。',
      )
    }

    return {
      success:
        true,

      merchant:
        mapMerchant(
          row as MerchantRow,
        ),

      message:
        '商家新增成功，已進入待審核狀態。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家新增失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家新增發生未知錯誤。',
    }
  }
}


export async function getMerchants(
  filters:
    MerchantFilters,
): Promise<MerchantListResponse> {
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
          MERCHANT_TABLE,
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
            `merchant_no.ilike.%${keyword}%`,
            `name.ilike.%${keyword}%`,
            `legal_name.ilike.%${keyword}%`,
            `contact_name.ilike.%${keyword}%`,
            `contact_phone.ilike.%${keyword}%`,
            `contact_email.ilike.%${keyword}%`,
            `business_license_no.ilike.%${keyword}%`,
            `tax_no.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (
      filters.merchantType
    ) {
      query =
        query.eq(
          'merchant_type',
          filters.merchantType,
        )
    }

    if (
      filters.market
    ) {
      query =
        query.eq(
          'market',
          filters.market,
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

    const merchants =
      (data ?? []).map(
        (row) =>
          mapMerchant(
            row as
              MerchantRow,
          ),
      )

    const total =
      count ?? 0

    const statistics =
      merchants.reduce<
        MerchantStatistics
      >(
        (
          result,
          merchant,
        ) => {
          result.total += 1

          switch (
            merchant.status
          ) {
            case 'pending':
              result.pending += 1
              break

            case 'approved':
              result.approved += 1
              break

            case 'active':
              result.active += 1
              break

            case 'suspended':
              result.suspended += 1
              break

            case 'rejected':
              result.rejected += 1
              break

            case 'disabled':
              result.disabled += 1
              break
          }

          switch (
            merchant.market
          ) {
            case 'taiwan':
              result.taiwan += 1
              break

            case 'china':
              result.china += 1
              break

            case 'cross_border':
              result.crossBorder += 1
              break
          }

          return result
        },
        createEmptyStatistics(),
      )

    return {
      success:
        true,

      merchants,

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
        '商家資料載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      merchants:
        [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '商家資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家資料載入發生未知錯誤。',
    }
  }
}
// =================================
// 商家詳情
// =================================

export async function getMerchantById(
  merchantId: string,
): Promise<MerchantDetailResponse> {
  const normalizedId =
    merchantId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家 ID 不可空白。',

      error:
        '商家 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          MERCHANT_TABLE,
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
      success:
        true,

      merchant:
        mapMerchant(
          data as MerchantRow,
        ),

      message:
        '商家詳情載入成功。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家詳情載入發生未知錯誤。',
    }
  }
}
// =================================
// 商家審核
// =================================

export async function reviewMerchant(
  input:
    MerchantReviewInput,
): Promise<MerchantMutationResponse> {
  const normalizedId =
    input.merchantId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家 ID 不可空白。',

      error:
        '商家 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'review_merchant',
        {
          p_merchant_id:
            normalizedId,

          p_status:
            input.status,

          p_review_remark:
            input.reviewRemark?.trim() ||
            null,
        },
      )

    if (error) {
      throw error
    }

    const row =
      Array.isArray(data)
        ? data[0]
        : data

    if (!row) {
      throw new Error(
        '商家審核成功，但未取得商家資料。',
      )
    }

    return {
      success:
        true,

      merchant:
        mapMerchant(
          row as MerchantRow,
        ),

      message:
        input.status ===
        'approved'
          ? '商家審核已通過。'
          : '商家審核已拒絕。',
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家審核更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家審核更新發生未知錯誤。',
    }
  }
}
// =================================
// 更新商家狀態
// =================================

export async function updateMerchantStatus(
  input:
    MerchantStatusUpdateInput,
): Promise<MerchantMutationResponse> {
  const normalizedId =
    input.merchantId.trim()

  if (!normalizedId) {
    return {
      success:
        false,

      message:
        '商家 ID 不可空白。',

      error:
        '商家 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'update_merchant_status',
        {
          p_merchant_id:
            normalizedId,

          p_status:
            input.status,

          p_remark:
            input.remark?.trim() ||
            null,
        },
      )

    if (error) {
      throw error
    }

    const row =
      Array.isArray(data)
        ? data[0]
        : data

    if (!row) {
      throw new Error(
        '商家狀態更新成功，但未取得商家資料。',
      )
    }

    return {
      success:
        true,

      merchant:
        mapMerchant(
          row as MerchantRow,
        ),

      message:
        getMerchantStatusMessage(
          input.status,
        ),
    }
  } catch (
    errorValue
  ) {
    return {
      success:
        false,

      message:
        '商家狀態更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '商家狀態更新發生未知錯誤。',
    }
  }
}


function getMerchantStatusMessage(
  status:
    MerchantStatusUpdateInput['status'],
): string {
  const messageMap:
    Record<
      MerchantStatusUpdateInput['status'],
      string
    > = {
      active:
        '商家已啟用。',

      suspended:
        '商家已暫停。',

      disabled:
        '商家已停用。',
    }

  return messageMap[status]
}