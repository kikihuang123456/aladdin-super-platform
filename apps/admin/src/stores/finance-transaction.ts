/**
 * ALADDIN Enterprise V4
 *
 * Finance Transaction ERP
 *
 * Pinia Store
 */


import {
  defineStore,
} from 'pinia'


import {
  ref,
  computed,
} from 'vue'


import {
  getFinanceTransactions,
  getFinanceTransactionById,
  getFinanceTransactionStatistics,
} from '../api/finance-transaction'


import type {
  FinanceTransaction,
  FinanceTransactionFilters,
  FinanceTransactionStatistics,
  FinanceTransactionPagination,
} from '../types/finance-transaction'



export const useFinanceTransactionStore =
defineStore(
  'finance-transaction',
  () => {



const transactions =
  ref<FinanceTransaction[]>([])



const currentTransaction =
  ref<FinanceTransaction | null>(
    null
  )



const statistics =
  ref<FinanceTransactionStatistics>({

    total:0,

    income:0,

    expense:0,

    settlement:0,

    withdraw:0,

    totalAmount:0,

  })



const pagination =
  ref<FinanceTransactionPagination>({

    page:1,

    pageSize:20,

    total:0,

    totalPages:0,

  })



const loading =
  ref(false)



const error =
  ref('')



const filters =
  ref<FinanceTransactionFilters>({

    keyword:'',

    page:1,

    pageSize:20,

  })



const hasPreviousPage =
computed(
  () =>
    pagination.value.page > 1
)



const hasNextPage =
computed(
  () =>
    pagination.value.page <
    pagination.value.totalPages
)

async function fetchTransactions(){

  try{


    loading.value =
      true


    error.value =
      ''



    const response =
      await getFinanceTransactions(
        filters.value,
      )



    if(!response.success){

      throw new Error(
        response.error ||
        response.message
      )

    }



    transactions.value =
      response.transactions



    pagination.value =
      response.pagination



    statistics.value =
      response.statistics



  }catch(errorValue){


    error.value =
      errorValue instanceof Error
      ? errorValue.message
      : '載入交易資料失敗'



  }finally{


    loading.value =
      false


  }

}





async function fetchTransactionDetail(
  id:string,
){


  try{


    const response =
      await getFinanceTransactionById(
        id,
      )



    if(!response.success){

      throw new Error(
        response.error ||
        response.message
      )

    }



    currentTransaction.value =
      response.transaction || null



  }catch(errorValue){


    error.value =
      errorValue instanceof Error
      ? errorValue.message
      : '交易詳情載入失敗'


  }

}





async function fetchStatistics(){


  try{


    statistics.value =
      await getFinanceTransactionStatistics()



  }catch{


    statistics.value = {

      total:0,

      income:0,

      expense:0,

      settlement:0,

      withdraw:0,

      totalAmount:0,

    }

  }

}
async function searchTransactions(
  keyword:string,
){


  filters.value.keyword =
    keyword


  filters.value.page =
    1


  await fetchTransactions()

}





async function setFilters(
  payload:
    FinanceTransactionFilters,
){


  filters.value = {

    ...filters.value,

    ...payload,

    page:1,

  }


  await fetchTransactions()

}





async function setPage(
  page:number,
){


  if(page < 1){

    return

  }


  filters.value.page =
    page


  await fetchTransactions()

}





async function resetFilters(){


  filters.value = {

    keyword:'',

    page:1,

    pageSize:20,

  }


  await fetchTransactions()

}





async function setPageSize(
  pageSize:number,
){


  filters.value.pageSize =
    pageSize


  filters.value.page =
    1


  await fetchTransactions()

}





return {

  transactions,

  currentTransaction,

  statistics,

  pagination,

  loading,

  error,

  filters,


  hasPreviousPage,

  hasNextPage,


  fetchTransactions,

  fetchTransactionDetail,

  fetchStatistics,


  searchTransactions,

  setFilters,

  setPage,

  setPageSize,

  resetFilters,

}



})