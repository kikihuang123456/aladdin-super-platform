/**
 * ALADDIN Super Platform
 * Mall Order ERP
 * API Layer
 */

import {
  supabase,
} from '../lib/supabase'

import type {
  MallOrder,
  MallOrderDetailResponse,
  MallOrderFilters,
  MallOrderItem,
  MallOrderListResponse,
  MallOrderMutationResponse,
  MallOrderPagination,
  MallOrderStatistics,
  MallPaymentMethod,
  MallPaymentStatus,
  MallShippingAddress,
  MallShippingStatus,
  MallOrderStatus,
  UpdateMallOrderStatusInput,
} from '../types/mall-order'

const ORDERS_TABLE =
  'mall_orders'

const ORDER_ITEMS_TABLE =
  'mall_order_items'

const DEFAULT_PAGE_SIZE =
  20

interface MallOrderItemRow {
  id?: unknown
  order_id?: unknown
  product_id?: unknown
  product_code?: unknown
  product_name?: unknown
  cover?: unknown
  quantity?: unknown
  price?: unknown
  subtotal?: unknown
  currency?: unknown
}

interface MallOrderRow {
  id?: unknown
  order_no?: unknown
  member_id?: unknown
  member_name?: unknown
  member_phone?: unknown
  total_amount?: unknown
  discount_amount?: unknown
  shipping_fee?: unknown
  payable_amount?: unknown
  currency?: unknown
  payment_method?: unknown
  payment_status?: unknown
  order_status?: unknown
  shipping_status?: unknown
  shipping_address?: unknown
  tracking_no?: unknown
  remark?: unknown
  created_at?: unknown
  updated_at?: unknown
  items?: unknown
}

function createEmptyStatistics():
  MallOrderStatistics {
  return {
    total: 0,
    pendingPayment: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
  }
}

function createEmptyPagination():
  MallOrderPagination {
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
    value.trim() !== ''
  ) {
    const parsedValue =
      Number(value)

    return Number.isFinite(parsedValue)
      ? parsedValue
      : fallback
  }

  return fallback
}

function normalizeCurrency(
  value: unknown,
): string {
  return normalizeString(
    value,
    'TWD',
  )
}

function normalizeOrderStatus(
  value: unknown,
): MallOrderStatus {
  const normalizedValue =
    normalizeString(value)

  const allowedStatuses:
    MallOrderStatus[] = [
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'completed',
      'cancelled',
      'refunded',
    ]

  return allowedStatuses.includes(
    normalizedValue as MallOrderStatus,
  )
    ? normalizedValue as MallOrderStatus
    : 'pending_payment'
}

function normalizePaymentStatus(
  value: unknown,
): MallPaymentStatus {
  const normalizedValue =
    normalizeString(value)

  const allowedStatuses:
    MallPaymentStatus[] = [
      'unpaid',
      'paid',
      'failed',
      'refunded',
    ]

  return allowedStatuses.includes(
    normalizedValue as MallPaymentStatus,
  )
    ? normalizedValue as MallPaymentStatus
    : 'unpaid'
}

function normalizeShippingStatus(
  value: unknown,
): MallShippingStatus {
  const normalizedValue =
    normalizeString(value)

  const allowedStatuses:
    MallShippingStatus[] = [
      'pending',
      'packing',
      'shipped',
      'delivered',
      'returned',
    ]

  return allowedStatuses.includes(
    normalizedValue as MallShippingStatus,
  )
    ? normalizedValue as MallShippingStatus
    : 'pending'
}

function normalizePaymentMethod(
  value: unknown,
): MallPaymentMethod | null {
  if (
    typeof value !== 'string' ||
    !value
  ) {
    return null
  }

  const allowedMethods:
    MallPaymentMethod[] = [
      'wechat',
      'alipay',
      'linepay',
      'unionpay',
      'bank_transfer',
      'atm',
      'other',
    ]

  return allowedMethods.includes(
    value as MallPaymentMethod,
  )
    ? value as MallPaymentMethod
    : 'other'
}

function normalizeShippingAddress(
  value: unknown,
): MallShippingAddress | null {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return null
  }

  const address =
    value as Record<string, unknown>

  return {
    receiverName:
      normalizeString(
        address.receiverName ??
        address.receiver_name,
      ),

    receiverPhone:
      normalizeString(
        address.receiverPhone ??
        address.receiver_phone,
      ),

    country:
      normalizeNullableString(
        address.country,
      ),

    province:
      normalizeNullableString(
        address.province,
      ),

    city:
      normalizeNullableString(
        address.city,
      ),

    district:
      normalizeNullableString(
        address.district,
      ),

    address:
      normalizeString(
        address.address,
      ),
  }
}

function mapOrderItem(
  row: MallOrderItemRow,
): MallOrderItem {
  return {
    id:
      normalizeString(row.id),

    orderId:
      normalizeString(
        row.order_id,
      ),

    productId:
      normalizeString(
        row.product_id,
      ),

    productCode:
      normalizeString(
        row.product_code,
      ),

    productName:
      normalizeString(
        row.product_name,
      ),

    cover:
      normalizeNullableString(
        row.cover,
      ),

    quantity:
      normalizeNumber(
        row.quantity,
      ),

    price:
      normalizeNumber(
        row.price,
      ),

    subtotal:
      normalizeNumber(
        row.subtotal,
      ),

    currency:
      normalizeCurrency(
        row.currency,
      ),
  }
}

function mapOrder(
  row: MallOrderRow,
): MallOrder {
  const rawItems =
    Array.isArray(row.items)
      ? row.items
      : []

  return {
    id:
      normalizeString(row.id),

    orderNo:
      normalizeString(
        row.order_no,
      ),

    memberId:
      normalizeString(
        row.member_id,
      ),

    memberName:
      normalizeNullableString(
        row.member_name,
      ),

    memberPhone:
      normalizeNullableString(
        row.member_phone,
      ),

    items:
      rawItems.map(
        (item) =>
          mapOrderItem(
            item as MallOrderItemRow,
          ),
      ),

    totalAmount:
      normalizeNumber(
        row.total_amount,
      ),

    discountAmount:
      normalizeNumber(
        row.discount_amount,
      ),

    shippingFee:
      normalizeNumber(
        row.shipping_fee,
      ),

    payableAmount:
      normalizeNumber(
        row.payable_amount,
      ),

    currency:
      normalizeCurrency(
        row.currency,
      ),

    paymentMethod:
      normalizePaymentMethod(
        row.payment_method,
      ),

    paymentStatus:
      normalizePaymentStatus(
        row.payment_status,
      ),

    orderStatus:
      normalizeOrderStatus(
        row.order_status,
      ),

    shippingStatus:
      normalizeShippingStatus(
        row.shipping_status,
      ),

    shippingAddress:
      normalizeShippingAddress(
        row.shipping_address,
      ),

    trackingNo:
      normalizeNullableString(
        row.tracking_no,
      ),

    remark:
      normalizeNullableString(
        row.remark,
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

function calculateStatistics(
  orders: MallOrder[],
  total: number,
): MallOrderStatistics {
  return {
    total,

    pendingPayment:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'pending_payment',
      ).length,

    paid:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'paid',
      ).length,

    processing:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'processing',
      ).length,

    shipped:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'shipped',
      ).length,

    completed:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'completed',
      ).length,

    cancelled:
      orders.filter(
        (order) =>
          order.orderStatus ===
          'cancelled',
      ).length,

    totalAmount:
      orders.reduce(
        (sum, order) =>
          sum +
          order.payableAmount,
        0,
      ),
  }
}

export async function getMallOrders(
  filters: MallOrderFilters,
): Promise<MallOrderListResponse> {
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
        .from(ORDERS_TABLE)
        .select(
          `
          *,
          items:${ORDER_ITEMS_TABLE}(*)
          `,
          {
            count: 'exact',
          },
        )

    const keyword =
      filters.keyword.trim()

    if (keyword) {
      query =
        query.or(
          [
            `order_no.ilike.%${keyword}%`,
            `member_name.ilike.%${keyword}%`,
            `member_phone.ilike.%${keyword}%`,
          ].join(','),
        )
    }

    if (filters.orderStatus) {
      query =
        query.eq(
          'order_status',
          filters.orderStatus,
        )
    }

    if (filters.paymentStatus) {
      query =
        query.eq(
          'payment_status',
          filters.paymentStatus,
        )
    }

    if (filters.shippingStatus) {
      query =
        query.eq(
          'shipping_status',
          filters.shippingStatus,
        )
    }

    if (filters.startDate) {
      query =
        query.gte(
          'created_at',
          filters.startDate,
        )
    }

    if (filters.endDate) {
      query =
        query.lte(
          'created_at',
          filters.endDate,
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
            ascending: false,
          },
        )
        .range(
          from,
          to,
        )

    if (error) {
      throw error
    }

    const orders =
      (data ?? []).map(
        (row) =>
          mapOrder(
            row as MallOrderRow,
          ),
      )

    const total =
      count ?? 0

    return {
      success: true,

      orders,

      statistics:
        calculateStatistics(
          orders,
          total,
        ),

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
        '訂單資料載入成功。',
    }
  } catch (errorValue) {
    return {
      success: false,

      orders: [],

      statistics:
        createEmptyStatistics(),

      pagination:
        createEmptyPagination(),

      message:
        '訂單資料載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '訂單資料載入發生未知錯誤。',
    }
  }
}

export async function getMallOrderById(
  orderId: string,
): Promise<MallOrderDetailResponse> {
  const normalizedId =
    orderId.trim()

  if (!normalizedId) {
    return {
      success: false,
      message:
        '訂單 ID 不可空白。',
      error:
        '訂單 ID 不可空白。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(ORDERS_TABLE)
        .select(
          `
          *,
          items:${ORDER_ITEMS_TABLE}(*)
          `,
        )
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

      order:
        mapOrder(
          data as MallOrderRow,
        ),

      message:
        '訂單詳情載入成功。',
    }
  } catch (errorValue) {
    return {
      success: false,

      message:
        '訂單詳情載入失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '訂單詳情載入發生未知錯誤。',
    }
  }
}

export async function updateMallOrderStatus(
  input: UpdateMallOrderStatusInput,
): Promise<MallOrderMutationResponse> {
  const normalizedId =
    input.orderId.trim()

  if (!normalizedId) {
    return {
      success: false,
      message:
        '訂單 ID 不可空白。',
      error:
        '訂單 ID 不可空白。',
    }
  }

  const payload:
    Record<string, unknown> = {
      updated_at:
        new Date().toISOString(),
  }

  if (input.orderStatus) {
    payload.order_status =
      input.orderStatus
  }

  if (input.paymentStatus) {
    payload.payment_status =
      input.paymentStatus
  }

  if (input.shippingStatus) {
    payload.shipping_status =
      input.shippingStatus
  }

  if (
    input.trackingNo !== undefined
  ) {
    payload.tracking_no =
      input.trackingNo
  }

  if (
    input.remark !== undefined
  ) {
    payload.remark =
      input.remark
  }

  if (
    Object.keys(payload).length ===
    1
  ) {
    return {
      success: false,
      message:
        '沒有可更新的訂單資料。',
      error:
        '請至少提供一個更新欄位。',
    }
  }

  try {
    const {
      data,
      error,
    } =
      await supabase
        .from(ORDERS_TABLE)
        .update(payload)
        .eq(
          'id',
          normalizedId,
        )
        .select(
          `
          *,
          items:${ORDER_ITEMS_TABLE}(*)
          `,
        )
        .single()

    if (error) {
      throw error
    }

    return {
      success: true,

      order:
        mapOrder(
          data as MallOrderRow,
        ),

      message:
        '訂單狀態更新成功。',
    }
  } catch (errorValue) {
    return {
      success: false,

      message:
        '訂單狀態更新失敗。',

      error:
        errorValue instanceof Error
          ? errorValue.message
          : '訂單狀態更新發生未知錯誤。',
    }
  }
}

export async function cancelMallOrder(
  orderId: string,
): Promise<MallOrderMutationResponse> {
  return updateMallOrderStatus({
    orderId,

    orderStatus:
      'cancelled',
  })
}

export async function completeMallOrder(
  orderId: string,
): Promise<MallOrderMutationResponse> {
  return updateMallOrderStatus({
    orderId,

    orderStatus:
      'completed',

    shippingStatus:
      'delivered',
  })
}