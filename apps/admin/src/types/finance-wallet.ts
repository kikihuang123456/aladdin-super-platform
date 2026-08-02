/**
 * ALADDIN Enterprise V4
 *
 * Finance Wallet ERP
 *
 * Type Definitions
 */

// ==============================
// 錢包擁有者類型
// ==============================

export type FinanceWalletOwnerType =
  | 'member'
  | 'merchant'
  | 'dealer'
  | 'platform'

// ==============================
// 錢包狀態
// ==============================

export type FinanceWalletStatus =
  | 'active'
  | 'frozen'
  | 'disabled'

// ==============================
// 錢包交易類型
// ==============================

export type FinanceWalletTransactionType =
  | 'deposit'
  | 'withdraw'
  | 'income'
  | 'expense'
  | 'refund'
  | 'settlement'
  | 'commission'
  | 'adjustment'

// ==============================
// 錢包交易狀態
// ==============================

export type FinanceWalletTransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'

// ==============================
// 錢包資料
// ==============================

export interface FinanceWallet {
  id: string

  walletNo: string

  ownerType:
    FinanceWalletOwnerType

  ownerId: string

  ownerName?: string | null

  ownerPhone?: string | null

  currency: string

  balance: number

  frozenBalance: number

  availableBalance: number

  totalIncome: number

  totalExpense: number

  status:
    FinanceWalletStatus

  createdAt: string

  updatedAt: string
}

// ==============================
// 錢包交易資料
// ==============================

export interface FinanceWalletTransaction {
  id: string

  walletId: string

  transactionNo: string

  type:
    FinanceWalletTransactionType

  status:
    FinanceWalletTransactionStatus

  amount: number

  balanceBefore: number

  balanceAfter: number

  currency: string

  referenceType?: string | null

  referenceId?: string | null

  remark?: string | null

  createdAt: string
}

// ==============================
// 錢包篩選條件
// ==============================

export interface FinanceWalletFilters {
  keyword?: string

  ownerType?:
    FinanceWalletOwnerType | ''

  status?:
    FinanceWalletStatus | ''

  page: number

  pageSize: number
}

// ==============================
// 分頁
// ==============================

export interface FinanceWalletPagination {
  page: number

  pageSize: number

  total: number

  totalPages: number
}

// ==============================
// 錢包統計
// ==============================

export interface FinanceWalletStatistics {
  totalWallets: number

  activeWallets: number

  frozenWallets: number

  disabledWallets: number

  totalBalance: number

  totalFrozenBalance: number

  totalAvailableBalance: number
}

// ==============================
// 錢包列表 Response
// ==============================

export interface FinanceWalletListResponse {
  success: boolean

  wallets:
    FinanceWallet[]

  statistics:
    FinanceWalletStatistics

  pagination:
    FinanceWalletPagination

  message: string

  error?: string
}

// ==============================
// 錢包詳情 Response
// ==============================

export interface FinanceWalletDetailResponse {
  success: boolean

  wallet?:
    FinanceWallet

  transactions:
    FinanceWalletTransaction[]

  message: string

  error?: string
}

// ==============================
// 錢包異動輸入
// ==============================

export interface FinanceWalletAdjustmentInput {
  walletId: string

  type:
    FinanceWalletTransactionType

  amount: number

  remark?: string | null

  referenceType?: string | null

  referenceId?: string | null
}

// ==============================
// 錢包異動 Response
// ==============================

export interface FinanceWalletMutationResponse {
  success: boolean

  wallet?:
    FinanceWallet

  transaction?:
    FinanceWalletTransaction

  message: string

  error?: string
}