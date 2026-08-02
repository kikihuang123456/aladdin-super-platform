/**
 * ALADDIN Enterprise V4
 *
 * Finance Transaction ERP
 *
 * Type Definitions
 */


export type FinanceTransactionType =
  | 'income'
  | 'expense'
  | 'settlement'
  | 'withdraw'
  | 'deposit'


export type FinanceTransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'



export interface FinanceTransaction {


  id:string


  transactionNo:string


  type:
    FinanceTransactionType


  status:
    FinanceTransactionStatus


  memberId?:
    string


  memberName?:
    string


  phone?:
    string


  amount:number


  currency:string


  remark?:
    string


  createdAt:string


  updatedAt:string

}





export interface FinanceTransactionFilters {


  keyword?:
    string


  type?:
    FinanceTransactionType


  status?:
    FinanceTransactionStatus


  page?:
    number


  pageSize?:
    number

}




export interface FinanceTransactionPagination {


  page:number


  pageSize:number


  total:number


  totalPages:number

}





export interface FinanceTransactionStatistics {


  total:number


  income:number


  expense:number


  settlement:number


  withdraw:number


  totalAmount:number

}





export interface FinanceTransactionListResponse {


  success:boolean


  transactions:
    FinanceTransaction[]


  statistics:
    FinanceTransactionStatistics


  pagination:
    FinanceTransactionPagination


  message:string


  error?:
    string

}





export interface FinanceTransactionDetailResponse {


  success:boolean


  transaction?:
    FinanceTransaction


  message:string


  error?:
    string

}