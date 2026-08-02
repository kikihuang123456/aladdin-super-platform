/**
 * ALADDIN Enterprise
 *
 * Finance ERP
 *
 * Finance Type Definitions
 */


// ==============================
// 財務統計
// ==============================

export interface FinanceStatistics {

  totalIncome:number

  todayIncome:number

  monthIncome:number


  totalOrderAmount:number


  refundAmount:number


  merchantSettlementAmount:number


  withdrawPendingAmount:number


  walletBalance:number

}



// ==============================
// 財務交易類型
// ==============================

export type FinanceTransactionType =

  | 'income'

  | 'refund'

  | 'settlement'

  | 'withdraw'

  | 'deposit'



// ==============================
// 財務交易紀錄
// ==============================

export interface FinanceTransaction {


  id:string


  transactionNo:string


  type:
    FinanceTransactionType



  amount:number



  currency:
    | 'TWD'
    | 'CNY'
    | 'USD'
    | string



  description:string



  status:string



  createdAt:string


}



// ==============================
// Dashboard Response
// ==============================

export interface FinanceDashboardResponse {


  success:boolean


  statistics:
    FinanceStatistics


  transactions:
    FinanceTransaction[]



  message:string



  error?:
    string

}
