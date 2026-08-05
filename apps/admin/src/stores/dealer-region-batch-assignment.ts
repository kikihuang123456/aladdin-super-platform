/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-10 Dealer Region Batch Assignment Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  batchAssignDealerRegion,
} from '../api/dealer-region-batch-assignment'


import type {
  DealerRegionBatchAssignmentRequest,
  DealerRegionBatchAssignmentResponse,
} from '../types/dealer-region-batch-assignment'



function normalizeError(
  errorValue: unknown,
  fallback: string,
): string {

  if(
    errorValue instanceof Error
  ){

    return errorValue.message

  }


  if(
    typeof errorValue === 'object'
    &&
    errorValue !== null
  ){

    const error =
      errorValue as Record<
        string,
        unknown
      >


    const parts = [

      typeof error.message === 'string'
        ? error.message
        : '',

      typeof error.details === 'string'
        ? error.details
        : '',

      typeof error.hint === 'string'
        ? `提示：${error.hint}`
        : '',

      typeof error.code === 'string'
        ? `錯誤代碼：${error.code}`
        : '',

    ].filter(Boolean)


    if(
      parts.length > 0
    ){

      return parts.join('；')

    }

  }


  return fallback

}



export const useDealerRegionBatchAssignmentStore =
defineStore(
  'dealer-region-batch-assignment',
  () => {


    const result =
      ref<
        DealerRegionBatchAssignmentResponse
        | null
      >(null)


    const loading =
      ref(false)


    const error =
      ref<string | null>(null)



    const successCount =
    computed(
      () =>
        result.value?.successCount
        ??
        0,
    )



    const failureCount =
    computed(
      () =>
        result.value?.failureCount
        ??
        0,
    )



    const requestedCount =
    computed(
      () =>
        result.value?.requestedCount
        ??
        0,
    )



    const hasFailures =
    computed(
      () =>
        failureCount.value > 0,
    )



    const hasSuccesses =
    computed(
      () =>
        successCount.value > 0,
    )



    const successfulItems =
    computed(
      () =>
        result.value?.successfulItems
        ??
        [],
    )



    const failedItems =
    computed(
      () =>
        result.value?.failedItems
        ??
        [],
    )



    async function assignBatch(
      payload:
        DealerRegionBatchAssignmentRequest,
    ){

      if(
        loading.value
      ){

        return null

      }


      loading.value =
        true


      error.value =
        null


      result.value =
        null


      try {


        const response =
          await batchAssignDealerRegion(
            payload,
          )


        result.value =
          response


        if(
          !response.success
        ){

          error.value =
            response.error
            ??
            response.message

        }


        return response


      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '批次指派經銷商區域失敗。',
          )


        return null


      }finally{


        loading.value =
          false

      }

    }



    function clearResult(){

      result.value =
        null


      error.value =
        null

    }



    return {

  result,

  loading,

  error,

  successCount,

  failureCount,

  requestedCount,

  hasFailures,

  hasSuccesses,

  successfulItems,

  failedItems,

  assignBatch,

  clearResult,

}

  },
)


export default useDealerRegionBatchAssignmentStore