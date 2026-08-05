/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
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
  getDealerById,
  getDealers,
  reviewDealer,
  updateDealerLevel,
  updateDealerStatus,
} from '../api/dealer'

import {
  dealerApi,
} from '../api/dealer'

import type {
  Dealer,
  DealerApprovalInput,
  DealerCreateRequest,
  DealerFilters,
  DealerLevelUpdateInput,
  DealerPagination,
  DealerStatistics,
  DealerStatusUpdateInput,
} from '../types/dealer'


const DEFAULT_PAGE_SIZE =
  20



function createDefaultFilters():
  DealerFilters {

  return {

    keyword:
      '',

    market:
      '',

    level:
      '',

    status:
      '',

    regionId:
      null,

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,

  }

}



function createEmptyPagination():
  DealerPagination {

  return {

    page:
      1,

    pageSize:
      DEFAULT_PAGE_SIZE,

    total:
      0,

    totalPages:
      0,

  }

}



function createEmptyStatistics():
  DealerStatistics {

  return {

    total:
      0,

    pending:
      0,

    approved:
      0,

    active:
      0,

    suspended:
      0,

    disabled:
      0,

    normal:
      0,

    star1:
      0,

    star2:
      0,

    star3:
      0,

    star4:
      0,

    star5:
      0,

    star6:
      0,

    star7:
      0,

    totalTeamCount:
      0,

    totalTeamSales:
      0,

    totalCommission:
      0,

  }

}



function normalizeError(
  errorValue: unknown,
  fallback: string,
): string {

  return errorValue instanceof Error
    ? errorValue.message
    : fallback

}



export const useDealerStore =
  defineStore(
    'dealer',
    () => {


      const dealers =
        ref<
          Dealer[]
        >([])



      const currentDealer =
        ref<
          Dealer | null
        >(null)

const createdDealer =
  ref<
    Dealer | null
  >(null)


const createLoading =
  ref(false)


const createError =
  ref<string | null>(null)

      const filters =
        ref<
          DealerFilters
        >(
          createDefaultFilters(),
        )



      const pagination =
        ref<
          DealerPagination
        >(
          createEmptyPagination(),
        )



      const statistics =
        ref<
          DealerStatistics
        >(
          createEmptyStatistics(),
        )



      const isLoading =
        ref(false)



      const isMutating =
        ref(false)



      const error =
        ref<
          string | null
        >(null)



      const mutationMessage =
        ref<
          string | null
        >(null)



      const hasDealers =
        computed(() =>
          dealers.value.length > 0,
        )



      const isEmpty =
        computed(() =>
          !isLoading.value &&
          dealers.value.length === 0,
        )



      const hasPreviousPage =
        computed(() =>
          pagination.value.page > 1,
        )



      const hasNextPage =
        computed(() =>
          pagination.value.totalPages > 0 &&
          pagination.value.page <
          pagination.value.totalPages,
        )
              async function fetchDealers():
        Promise<void> {

        if (isLoading.value) {
          return
        }


        isLoading.value =
          true


        error.value =
          null



        try {

          const response =
            await getDealers(
              filters.value,
            )



          if (!response.success) {

            throw new Error(
              response.error ||
              response.message,
            )

          }


          dealers.value =
            response.dealers



          statistics.value =
            response.statistics



          pagination.value =
            response.pagination



        } catch (
          errorValue
        ) {


          dealers.value =
            []



          statistics.value =
            createEmptyStatistics()



          pagination.value =
            createEmptyPagination()



          error.value =
            normalizeError(
              errorValue,
              '經銷商資料載入失敗。',
            )


        } finally {

          isLoading.value =
            false

        }

      }

async function fetchPendingDealers(){

  const response =
    await dealerApi
      .getPendingDealers()


  if(
    response.success
  ){

    dealers.value =
      response.dealers

  }


  return response

}

async function createDealerRecord(
  input:
    DealerCreateRequest,
):
  Promise<Dealer | null> {

  if(
    createLoading.value
  ){

    return null

  }


  createLoading.value =
    true


  createError.value =
    null


  createdDealer.value =
    null


  mutationMessage.value =
    null


  try {


    const response =
      await dealerApi.createDealer(
        input,
      )


    if(
      !response.success
      ||
      !response.dealer
    ){

      throw new Error(
        response.error
        ||
        response.message,
      )

    }


    createdDealer.value =
      response.dealer


    currentDealer.value =
      response.dealer


    /*
     * 新資料放在列表最前方。
     */

    const existingIndex =
      dealers.value.findIndex(
        dealer =>
          dealer.id ===
          response.dealer!.id,
      )


    if(
      existingIndex >= 0
    ){

      dealers.value[
        existingIndex
      ] =
        response.dealer

    }else{

      dealers.value.unshift(
        response.dealer,
      )

    }


    mutationMessage.value =
      response.message


    return response.dealer


  }catch(
    errorValue
  ){


    createError.value =
      normalizeError(
        errorValue,
        '經銷商建立失敗。',
      )


    return null


  }finally{


    createLoading.value =
      false

  }

}
      async function fetchDealerById(
        dealerId: string,
      ):
        Promise<Dealer | null> {


        const normalizedId =
          dealerId.trim()



        if (!normalizedId) {

          currentDealer.value =
            null


          error.value =
            'Dealer ID 不可空白。'


          return null

        }



        isLoading.value =
          true


        error.value =
          null



        try {

          const response =
            await getDealerById(
              normalizedId,
            )



          if (
            !response.success ||
            !response.dealer
          ) {

            throw new Error(
              response.error ||
              response.message,
            )

          }



          currentDealer.value =
            response.dealer



          const index =
            dealers.value.findIndex(
              (dealer) =>
                dealer.id ===
                response.dealer!.id,
            )



          if (index >= 0) {

            dealers.value[index] =
              response.dealer

          }



          return response.dealer



        } catch (
          errorValue
        ) {


          currentDealer.value =
            null



          error.value =
            normalizeError(
              errorValue,
              '經銷商詳情載入失敗。',
            )



          return null



        } finally {

          isLoading.value =
            false

        }

      }




      async function approveDealer(
        input:
          DealerApprovalInput,
      ):
        Promise<Dealer | null> {


        if (isMutating.value) {

          return null

        }



        isMutating.value =
          true


        error.value =
          null


        mutationMessage.value =
          null



        try {

          const response =
            await reviewDealer(
              input,
            )



          if (
            !response.success ||
            !response.dealer
          ) {

            throw new Error(
              response.error ||
              response.message,
            )

          }



          currentDealer.value =
            response.dealer



          updateDealerInList(
            response.dealer,
          )



          mutationMessage.value =
            response.message



          return response.dealer



        } catch (
          errorValue
        ) {


          error.value =
            normalizeError(
              errorValue,
              '經銷商審核失敗。',
            )



          return null



        } finally {

          isMutating.value =
            false

        }

      }




      function updateDealerInList(
        dealer:
          Dealer,
      ):
        void {


        const index =
          dealers.value.findIndex(
            (item) =>
              item.id ===
              dealer.id,
          )



        if (index >= 0) {

          dealers.value[index] =
            dealer

        }

      }
            async function updateStatus(
        input:
          DealerStatusUpdateInput,
      ):
        Promise<Dealer | null> {


        if (isMutating.value) {
          return null
        }


        isMutating.value =
          true


        error.value =
          null


        mutationMessage.value =
          null



        try {

          const response =
            await updateDealerStatus(
              input,
            )



          if (
            !response.success ||
            !response.dealer
          ) {

            throw new Error(
              response.error ||
              response.message,
            )

          }



          currentDealer.value =
            response.dealer



          updateDealerInList(
            response.dealer,
          )



          mutationMessage.value =
            response.message



          return response.dealer



        } catch (
          errorValue
        ) {


          error.value =
            normalizeError(
              errorValue,
              '經銷商狀態更新失敗。',
            )


          return null



        } finally {

          isMutating.value =
            false

        }

      }




      async function updateLevel(
        input:
          DealerLevelUpdateInput,
      ):
        Promise<Dealer | null> {


        if (isMutating.value) {
          return null
        }


        isMutating.value =
          true


        error.value =
          null


        mutationMessage.value =
          null



        try {

          const response =
            await updateDealerLevel(
              input,
            )



          if (
            !response.success ||
            !response.dealer
          ) {

            throw new Error(
              response.error ||
              response.message,
            )

          }



          currentDealer.value =
            response.dealer



          updateDealerInList(
            response.dealer,
          )



          mutationMessage.value =
            response.message



          return response.dealer



        } catch (
          errorValue
        ) {


          error.value =
            normalizeError(
              errorValue,
              '經銷商等級更新失敗。',
            )


          return null



        } finally {

          isMutating.value =
            false

        }

      }




      async function searchDealers(
        keyword: string,
      ):
        Promise<void> {


        filters.value.keyword =
          keyword.trim()


        filters.value.page =
          1


        await fetchDealers()

      }




      async function setMarketFilter(
        market:
          DealerFilters['market'],
      ):
        Promise<void> {


        filters.value.market =
          market


        filters.value.page =
          1


        await fetchDealers()

      }




      async function setLevelFilter(
        level:
          DealerFilters['level'],
      ):
        Promise<void> {


        filters.value.level =
          level


        filters.value.page =
          1


        await fetchDealers()

      }




      async function setStatusFilter(
        status:
          DealerFilters['status'],
      ):
        Promise<void> {


        filters.value.status =
          status


        filters.value.page =
          1


        await fetchDealers()

      }




      async function setRegionFilter(
        regionId:
          string | null,
      ):
        Promise<void> {


        filters.value.regionId =
          regionId


        filters.value.page =
          1


        await fetchDealers()

      }




      async function setPage(
        page: number,
      ):
        Promise<void> {


        if (
          !Number.isInteger(page) ||
          page < 1
        ) {
          return
        }



        if (
          pagination.value.totalPages > 0 &&
          page >
          pagination.value.totalPages
        ) {
          return
        }



        filters.value.page =
          page


        await fetchDealers()

      }




      async function setPageSize(
        pageSize: number,
      ):
        Promise<void> {


        if (
          !Number.isInteger(pageSize) ||
          pageSize < 1
        ) {
          return
        }



        filters.value.pageSize =
          pageSize


        filters.value.page =
          1


        await fetchDealers()

      }




      async function resetFilters():
        Promise<void> {


        filters.value =
          createDefaultFilters()


        await fetchDealers()

      }

function clearCreateResult():
  void {

  createdDealer.value =
    null


  createError.value =
    null


  mutationMessage.value =
    null

}


      function clearCurrentDealer():
        void {

        currentDealer.value =
          null

      }




      function clearError():
        void {

        error.value =
          null

      }




      function clearMutationMessage():
        void {

        mutationMessage.value =
          null

      }




      return {

        dealers,

currentDealer,

createdDealer,

filters,

        pagination,

        statistics,


        isLoading,

isMutating,

createLoading,


        error,

createError,

mutationMessage,


        hasDealers,

        isEmpty,

        hasPreviousPage,

        hasNextPage,


        fetchDealers,

fetchPendingDealers,

createDealerRecord,

fetchDealerById,

        approveDealer,

        updateStatus,

        updateLevel,


        searchDealers,

        setMarketFilter,

        setLevelFilter,

        setStatusFilter,

        setRegionFilter,

        setPage,

        setPageSize,

        resetFilters,


        clearCreateResult,

clearCurrentDealer,

clearError,

clearMutationMessage,

      }

    },
  )


export default useDealerStore