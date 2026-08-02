/**
 * ALADDIN Enterprise
 *
 * Finance ERP
 *
 * API Layer
 */


import {
  supabase,
} from '../lib/supabase'


import type {
  FinanceDashboardResponse,
  FinanceStatistics,
  FinanceTransaction,
} from '../types/finance'



const ORDERS_TABLE =
  'mall_orders'



function createEmptyStatistics():
FinanceStatistics {

  return {

    totalIncome:0,

    todayIncome:0,

    monthIncome:0,


    totalOrderAmount:0,


    refundAmount:0,


    merchantSettlementAmount:0,


    withdrawPendingAmount:0,


    walletBalance:0,

  }

}




// =================================
// Finance Dashboard
// =================================


export async function getFinanceDashboard():
Promise<FinanceDashboardResponse>{


  try {


    const {
      data:orders,
      error,
    } =
      await supabase
        .from(
          ORDERS_TABLE,
        )
        .select(
          `
          id,
          order_no,
          payable_amount,
          currency,
          order_status,
          created_at
          `,
        )
        .order(
          'created_at',
          {
            ascending:false,
          },
        )
        .limit(20)



    if(error){

      throw error

    }



    const list =
      orders ?? []



    const totalAmount =
      list.reduce(
        (
          total,
          item,
        ) =>
          total +
          Number(
            item.payable_amount || 0,
          ),
        0,
      )



    const transactions:
      FinanceTransaction[] =
      list.map(
        item => ({

          id:
            item.id,

          transactionNo:
            item.order_no,


          type:
            'income',


          amount:
            Number(
              item.payable_amount || 0,
            ),


          currency:
            item.currency ||
            'TWD',


          description:
            '商城訂單收入',


          status:
            item.order_status,


          createdAt:
            item.created_at,


        }),
      )




    return {

      success:true,


      statistics:{

        ...createEmptyStatistics(),


        totalIncome:
          totalAmount,


        totalOrderAmount:
          totalAmount,


      },


      transactions,


      message:
        '財務資料載入成功。',

    }



  }catch(errorValue){


    return {


      success:false,


      statistics:
        createEmptyStatistics(),


      transactions:[],


      message:
        '財務資料載入失敗。',


      error:
        errorValue instanceof Error
          ? errorValue.message
          : '未知錯誤',

    }

  }

}