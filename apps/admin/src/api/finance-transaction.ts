/**
 * ALADDIN Enterprise V4
 *
 * Finance Transaction ERP
 *
 * API Layer
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  FinanceTransaction,
  FinanceTransactionFilters,
  FinanceTransactionListResponse,
  FinanceTransactionDetailResponse,
  FinanceTransactionStatistics,
} from '../types/finance-transaction'



const TRANSACTION_TABLE =
  'finance_transactions'



const DEFAULT_PAGE_SIZE =
  20



function createEmptyStatistics():
FinanceTransactionStatistics {

  return {

    total:0,

    income:0,

    expense:0,

    settlement:0,

    withdraw:0,

    totalAmount:0,

  }

}





export async function getFinanceTransactions(
  filters:
    FinanceTransactionFilters,
)
:
Promise<FinanceTransactionListResponse>{


  try {


    const page =
      filters.page || 1


    const pageSize =
      filters.pageSize ||
      DEFAULT_PAGE_SIZE


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
          TRANSACTION_TABLE,
        )
        .select(
          '*',
          {
            count:'exact',
          },
        )



    if(filters.keyword){

      query =
        query.or(
          `
          transaction_no.ilike.%${filters.keyword}%,
          member_name.ilike.%${filters.keyword}%,
          phone.ilike.%${filters.keyword}%
          `,
        )

    }



    if(filters.type){

      query =
        query.eq(
          'type',
          filters.type,
        )

    }



    if(filters.status){

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
            ascending:false,
          },
        )
        .range(
          from,
          to,
        )



    if(error){

      throw error

    }



    const total =
      count ?? 0



    return {

      success:true,

      transactions:
        (data ?? []) as FinanceTransaction[],


      statistics:
        createEmptyStatistics(),


      pagination:{

        page,

        pageSize,

        total,

        totalPages:
          Math.ceil(
            total /
            pageSize,
          ),

      },


      message:
        '財務交易資料載入成功。',

    }


  }catch(errorValue){


    return {

      success:false,

      transactions:[],

      statistics:
        createEmptyStatistics(),


      pagination:{

        page:1,

        pageSize:DEFAULT_PAGE_SIZE,

        total:0,

        totalPages:0,

      },


      message:
        '財務交易資料載入失敗。',


      error:
        errorValue instanceof Error
        ? errorValue.message
        : '未知錯誤',

    }

  }

}





export async function getFinanceTransactionById(
  id:string,
)
:
Promise<FinanceTransactionDetailResponse>{


  try{


    const {
      data,
      error,
    } =
      await supabase
        .from(
          TRANSACTION_TABLE,
        )
        .select('*')
        .eq(
          'id',
          id,
        )
        .single()



    if(error){

      throw error

    }



    return {

      success:true,

      transaction:
        data as FinanceTransaction,


      message:
        '交易詳情成功',

    }


  }catch(errorValue){


    return {

      success:false,

      message:
        '交易詳情失敗',

      error:
        errorValue instanceof Error
        ? errorValue.message
        : '未知錯誤',

    }

  }

}





export async function getFinanceTransactionStatistics()
:
Promise<FinanceTransactionStatistics>{


  try{


    const {
      data,
      error,
    } =
      await supabase
        .from(
          TRANSACTION_TABLE,
        )
        .select(
          'type,amount',
        )



    if(error){

      throw error

    }



    const result =
      createEmptyStatistics()



    for(
      const item of data ?? []
    ){

      result.total += 1


      result.totalAmount +=
        Number(
          item.amount || 0
        )


      if(item.type === 'income')
        result.income += 1


      if(item.type === 'expense')
        result.expense += 1


      if(item.type === 'settlement')
        result.settlement += 1


      if(item.type === 'withdraw')
        result.withdraw += 1

    }



    return result


  }catch{


    return createEmptyStatistics()

  }

}