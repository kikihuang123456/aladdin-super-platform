/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-08 Dealer Region Capacity Rule Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  checkDealerRegionAssignmentCapacity,
  checkDealerRegionCapacity,
} from '../api/dealer-region-capacity-rule'


import type {
  DealerRegionAssignmentCapacityCheckRequest,
  DealerRegionCapacityCheckRequest,
  DealerRegionCapacityRuleResult,
} from '../types/dealer-region-capacity-rule'



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


    if(
      typeof error.message === 'string'
    ){

      return error.message

    }

  }


  return fallback

}



export const useDealerRegionCapacityRuleStore =
defineStore(
  'dealer-region-capacity-rule',
  () => {


    const result =
      ref<
        DealerRegionCapacityRuleResult
        | null
      >(null)


    const loading =
      ref(false)


    const error =
      ref<string | null>(null)



    const allowed =
    computed(
      () =>
        result.value?.allowed ??
        false,
    )



    const status =
    computed(
      () =>
        result.value?.status ??
        null,
    )



    const message =
    computed(
      () =>
        result.value?.message ??
        '',
    )



    async function checkCapacity(
      payload:
        DealerRegionCapacityCheckRequest,
    ){

      loading.value =
        true


      error.value =
        null


      result.value =
        null


      try {


        const response =
          await checkDealerRegionCapacity(
            payload,
          )


        result.value =
          response


        return response


      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '檢查區域容量失敗。',
          )


        return null


      }finally{


        loading.value =
          false

      }

    }



    async function checkAssignmentCapacity(
      payload:
        DealerRegionAssignmentCapacityCheckRequest,
    ){

      loading.value =
        true


      error.value =
        null


      result.value =
        null


      try {


        const response =
          await checkDealerRegionAssignmentCapacity(
            payload,
          )


        result.value =
          response


        return response


      }catch(errorValue){


        error.value =
          normalizeError(
            errorValue,
            '檢查區域指派容量失敗。',
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

      allowed,

      status,

      message,

      checkCapacity,

      checkAssignmentCapacity,

      clearResult,

    }

  },
)


export default useDealerRegionCapacityRuleStore