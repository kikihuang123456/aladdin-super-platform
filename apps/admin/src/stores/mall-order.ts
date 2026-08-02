/**
 * ALADDIN Enterprise V4
 *
 * Mall Order ERP
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
  cancelMallOrder,
  completeMallOrder,
  getMallOrderById,
  getMallOrders,
  updateMallOrderStatus,
} from '../api/mall-order'


import type {
  MallOrder,
  MallOrderFilters,
  MallOrderPagination,
  MallOrderStatistics,
  UpdateMallOrderStatusInput,
} from '../types/mall-order'



const DEFAULT_PAGE_SIZE = 20



function createDefaultFilters():
MallOrderFilters {

  return {

    keyword:'',

    orderStatus:'',

    paymentStatus:'',

    shippingStatus:'',

    startDate:null,

    endDate:null,

    page:1,

    pageSize:
      DEFAULT_PAGE_SIZE,

  }

}



function createEmptyPagination():
MallOrderPagination {

  return {

    page:1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total:0,

    totalPages:0,

  }

}



function createEmptyStatistics():
MallOrderStatistics {

  return {

    total:0,

    pendingPayment:0,

    paid:0,

    processing:0,

    shipped:0,

    completed:0,

    cancelled:0,

    totalAmount:0,

  }

}



function normalizeError(
  errorValue:unknown,
  fallback:string,
):string {

  return errorValue instanceof Error
    ? errorValue.message
    : fallback

}





export const useMallOrderStore =
defineStore(
  'mall-order',
  () => {


    const orders =
      ref<MallOrder[]>([])



    const currentOrder =
      ref<MallOrder | null>(
        null,
      )



    const filters =
      ref<MallOrderFilters>(
        createDefaultFilters(),
      )



    const pagination =
      ref<MallOrderPagination>(
        createEmptyPagination(),
      )



    const statistics =
      ref<MallOrderStatistics>(
        createEmptyStatistics(),
      )



    const isLoading =
      ref(false)



    const isMutating =
      ref(false)



    const error =
      ref<string | null>(
        null,
      )



    const mutationMessage =
      ref<string | null>(
        null,
      )



    const hasOrders =
      computed(() =>
        orders.value.length > 0,
      )



    const isEmpty =
      computed(() =>
        !isLoading.value &&
        orders.value.length === 0,
      )



    const hasPreviousPage =
      computed(() =>
        pagination.value.page > 1,
      )



    const hasNextPage =
      computed(() =>
        pagination.value.page <
        pagination.value.totalPages,
      )




    // ==========================
    // 取得訂單列表
    // ==========================

    async function fetchOrders():
    Promise<void> {


      if(isLoading.value){

        return

      }


      isLoading.value = true

      error.value = null


      try {


        const response =
          await getMallOrders(
            filters.value,
          )



        if(!response.success){

          throw new Error(
            response.error ||
            response.message,
          )

        }



        orders.value =
          response.orders



        pagination.value =
          response.pagination



        statistics.value =
          response.statistics



      }catch(errorValue){


        orders.value = []

        error.value =
          normalizeError(
            errorValue,
            '訂單載入失敗。',
          )



      }finally{


        isLoading.value = false

      }


    }




    // ==========================
    // 取得單筆訂單
    // ==========================

    async function fetchOrderById(
      orderId:string,
    ):
    Promise<MallOrder | null>{


      isLoading.value = true

      error.value = null


      try {


        const response =
          await getMallOrderById(
            orderId,
          )



        if(
          !response.success ||
          !response.order
        ){

          throw new Error(
            response.error ||
            response.message,
          )

        }



        currentOrder.value =
          response.order



        return response.order



      }catch(errorValue){


        currentOrder.value = null


        error.value =
          normalizeError(
            errorValue,
            '訂單讀取失敗。',
          )


        return null



      }finally{


        isLoading.value = false

      }

    }





    // ==========================
    // 更新狀態
    // ==========================

    async function updateOrderStatus(
      input:
        UpdateMallOrderStatusInput,
    ):
    Promise<MallOrder | null>{


      if(isMutating.value){

        return null

      }


      isMutating.value = true

      error.value = null



      try {


        const response =
          await updateMallOrderStatus(
            input,
          )



        if(
          !response.success ||
          !response.order
        ){

          throw new Error(
            response.error ||
            response.message,
          )

        }



        currentOrder.value =
          response.order



        replaceOrder(
          response.order,
        )


        mutationMessage.value =
          response.message



        return response.order



      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '訂單更新失敗。',
          )


        return null



      }finally{


        isMutating.value=false

      }


    }





    // ==========================
    // 取消訂單
    // ==========================

    async function cancelOrder(
      orderId:string,
    ):
    Promise<boolean>{


      const response =
        await cancelMallOrder(
          orderId,
        )


      if(
        response.success &&
        response.order
      ){

        replaceOrder(
          response.order,
        )

        return true

      }


      error.value =
        response.error ||
        response.message


      return false

    }





    // ==========================
    // 完成訂單
    // ==========================

    async function completeOrder(
      orderId:string,
    ):
    Promise<boolean>{


      const response =
        await completeMallOrder(
          orderId,
        )



      if(
        response.success &&
        response.order
      ){

        replaceOrder(
          response.order,
        )


        return true

      }



      error.value =
        response.error ||
        response.message


      return false

    }





    function replaceOrder(
      order:MallOrder,
    ){

      const index =
        orders.value.findIndex(
          item =>
            item.id === order.id,
        )


      if(index >= 0){

        orders.value[index] =
          order

      }else{

        orders.value.unshift(
          order,
        )

      }

    }




    async function searchOrders(
      keyword:string,
    ){

      filters.value.keyword =
        keyword.trim()


      filters.value.page = 1


      await fetchOrders()

    }





    async function setOrderStatusFilter(
      status:
        MallOrderFilters['orderStatus'],
    ){

      filters.value.orderStatus =
        status


      filters.value.page = 1


      await fetchOrders()

    }





    async function setPage(
      page:number,
    ){

      filters.value.page =
        page


      await fetchOrders()

    }





    async function resetFilters(){

      filters.value =
        createDefaultFilters()


      await fetchOrders()

    }





    function clearCurrentOrder(){

      currentOrder.value = null

    }



    function clearError(){

      error.value = null

    }



    return {


      orders,

      currentOrder,

      filters,

      pagination,

      statistics,


      isLoading,

      isMutating,

      error,

      mutationMessage,


      hasOrders,

      isEmpty,

      hasPreviousPage,

      hasNextPage,


      fetchOrders,

      fetchOrderById,

      updateOrderStatus,

      cancelOrder,

      completeOrder,


      searchOrders,

      setOrderStatusFilter,

      setPage,

      resetFilters,


      clearCurrentOrder,

      clearError,


    }

  },
)



export default useMallOrderStore