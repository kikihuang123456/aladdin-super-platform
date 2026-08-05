/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-11 Dealer Region Reassignment Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  reassignDealerToRegion,
} from '../api/dealer-region-reassignment'


import type {
  DealerRegionReassignmentRequest,
  DealerRegionReassignmentResponse,
} from '../types/dealer-region-reassignment'



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



export const useDealerRegionReassignmentStore =
defineStore(
  'dealer-region-reassignment',
  () => {


    const result =
      ref<
        DealerRegionReassignmentResponse
        | null
      >(null)


    const loading =
      ref(false)


    const error =
      ref<string | null>(null)



    const succeeded =
    computed(
      () =>
        result.value?.success
        ??
        false,
    )



    const previousRegionId =
    computed(
      () =>
        result.value?.previousRegionId
        ??
        null,
    )



    const nextRegionId =
    computed(
      () =>
        result.value?.nextRegionId
        ??
        null,
    )



    async function reassign(
      payload:
        DealerRegionReassignmentRequest,
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
          await reassignDealerToRegion(
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
            '重新指派經銷商區域失敗。',
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

      succeeded,

      previousRegionId,

      nextRegionId,

      reassign,

      clearResult,

    }

  },
)


export default useDealerRegionReassignmentStore