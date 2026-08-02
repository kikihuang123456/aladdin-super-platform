/**
 * ALADDIN Enterprise V4
 * Mall Order ERP
 * Order Type Definitions
 */


// ===============================
// 訂單狀態
// ===============================

export type MallOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded'



// ===============================
// 支付狀態
// ===============================

export type MallPaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'refunded'



// ===============================
// 配送狀態
// ===============================

export type MallShippingStatus =
  | 'pending'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'returned'



// ===============================
// 支付方式
// ===============================

export type MallPaymentMethod =
  | 'wechat'
  | 'alipay'
  | 'linepay'
  | 'unionpay'
  | 'bank_transfer'
  | 'atm'
  | 'other'



// ===============================
// 訂單商品
// ===============================

export interface MallOrderItem {

  id:string

  orderId:string


  productId:string

  productCode:string

  productName:string


  cover?:string | null


  quantity:number


  price:number


  subtotal:number


  currency:
    | 'TWD'
    | 'CNY'
    | 'USD'
    | string

}



// ===============================
// 收件資訊
// ===============================

export interface MallShippingAddress {

  receiverName:string

  receiverPhone:string


  country?:string | null

  province?:string | null

  city?:string | null

  district?:string | null


  address:string

}



// ===============================
// 訂單資料
// ===============================

export interface MallOrder {


  id:string


  orderNo:string



  memberId:string

  memberName?:string | null

  memberPhone?:string | null



  items:
    MallOrderItem[]



  totalAmount:number


  discountAmount?:number | null


  shippingFee?:number | null


  payableAmount:number



  currency:
    | 'TWD'
    | 'CNY'
    | 'USD'
    | string



  paymentMethod?:
    MallPaymentMethod |
    null



  paymentStatus:
    MallPaymentStatus



  orderStatus:
    MallOrderStatus



  shippingStatus:
    MallShippingStatus



  shippingAddress?:
    MallShippingAddress |
    null



  trackingNo?:
    string |
    null



  remark?:
    string |
    null



  createdAt:string


  updatedAt:string

}



// ===============================
// 訂單列表 Filter
// ===============================

export interface MallOrderFilters {


  keyword:string


  orderStatus?:
    MallOrderStatus |
    ''


  paymentStatus?:
    MallPaymentStatus |
    ''


  shippingStatus?:
    MallShippingStatus |
    ''


  startDate?:
    string |
    null


  endDate?:
    string |
    null


  page:number


  pageSize:number

}



// ===============================
// Pagination
// ===============================

export interface MallOrderPagination {

  page:number

  pageSize:number

  total:number

  totalPages:number

}



// ===============================
// 統計
// ===============================

export interface MallOrderStatistics {


  total:number


  pendingPayment:number


  paid:number


  processing:number


  shipped:number


  completed:number


  cancelled:number



  totalAmount:number


}



// ===============================
// API Response
// ===============================


export interface MallOrderListResponse {

  success:boolean


  orders:
    MallOrder[]


  statistics:
    MallOrderStatistics


  pagination:
    MallOrderPagination


  message:string


  error?:
    string

}



// ===============================
// 詳情 Response
// ===============================

export interface MallOrderDetailResponse {

  success:boolean


  order?:
    MallOrder


  message:string


  error?:
    string

}



// ===============================
// 更新
// ===============================
// 更新訂單狀態
// ===============================

export interface UpdateMallOrderStatusInput {

  orderId:string

  orderStatus?:
    MallOrderStatus

  paymentStatus?:
    MallPaymentStatus

  shippingStatus?:
    MallShippingStatus

  trackingNo?:
    string | null

  remark?:
    string | null

}
// ===============================
// Mutation Response
// ===============================

export interface MallOrderMutationResponse {

  success:boolean

  order?:
    MallOrder

  message:string

  error?:
    string

}