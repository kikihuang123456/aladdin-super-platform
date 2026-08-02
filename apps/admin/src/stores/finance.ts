/**
 * ALADDIN Enterprise
 *
 * Finance ERP
 *
 * Pinia Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  getFinanceDashboard,
} from '../api/finance'


import type {
  FinanceStatistics,
  FinanceTransaction,
} from '../types/finance'



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




export const useFinanceStore =
defineStore(
  'finance',
  () => {


    const statistics =
      ref<FinanceStatistics>(
        createEmptyStatistics(),
      )



    const transactions =
      ref<FinanceTransaction[]>([])



    const isLoading =
      ref(false)



    const error =
      ref<string | null>(
        null,
      )



    const hasTransactions =
      computed(
        () =>
          transactions.value.length > 0,
      )





    // =========================
    // 載入財務 Dashboard
    // =========================

    async function fetchDashboard():
    Promise<void>{


      if(isLoading.value){

        return

      }


      isLoading.value = true

      error.value = null



      try {


        const response =
          await getFinanceDashboard()



        if(!response.success){

          throw new Error(
            response.error ||
            response.message,
          )

        }



        statistics.value =
          response.statistics



        transactions.value =
          response.transactions



      }catch(errorValue){


        error.value =
          errorValue instanceof Error
            ? errorValue.message
            : '財務資料載入失敗。'


      }finally{


        isLoading.value =
          false


      }


    }





    function clearError(){

      error.value = null

    }





    return {


      statistics,

      transactions,


      isLoading,

      error,


      hasTransactions,


      fetchDashboard,


      clearError,


    }


  },
)



export default useFinanceStore