/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-12 Dealer Region Unassignment Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  unassignDealerFromRegion,
} from '../api/dealer-region-unassignment'


import type {
  DealerRegionUnassignmentRequest,
  DealerRegionUnassignmentResponse,
} from '../types/dealer-region-unassignment'



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



export const useDealerRegionUnassignmentStore =
defineStore(
  'dealer-region-unassignment',
  () => {


    const result =
      ref<
        DealerRegionUnassignmentResponse
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



    const dealerId =
    computed(
      () =>
        result.value?.dealerId
        ??
        '',
    )



    const previousRegionId =
    computed(
      () =>
        result.value?.previousRegionId
        ??
        null,
    )



    const snapshot =
    computed(
      () =>
        result.value?.snapshot
        ??
        null,
    )



    async function unassign(
      payload:
        DealerRegionUnassignmentRequest,
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
          await unassignDealerFromRegion(
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
            '解除經銷商區域指派失敗。',
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

      dealerId,

      previousRegionId,

      snapshot,

      unassign,

      clearResult,

    }

  },
)


export default useDealerRegionUnassignmentStore