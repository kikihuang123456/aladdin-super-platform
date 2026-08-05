/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-09 Dealer Region Candidate Store
 */


import {
  computed,
  ref,
} from 'vue'


import {
  defineStore,
} from 'pinia'


import {
  getDealerRegionCandidates,
} from '../api/dealer-region-candidate'


import type {
  DealerRegionCandidate,
  DealerRegionCandidateFilters,
} from '../types/dealer-region-candidate'



const DEFAULT_PAGE_SIZE =
  20



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



export const useDealerRegionCandidateStore =
defineStore(
  'dealer-region-candidate',
  () => {


    const candidates =
      ref<DealerRegionCandidate[]>([])


    const loading =
      ref(false)


    const error =
      ref<string | null>(null)


    const keyword =
      ref('')


    const statusFilter =
      ref('active')


    const unassignedOnly =
      ref(true)


    const page =
      ref(1)


    const pageSize =
      ref(
        DEFAULT_PAGE_SIZE,
      )


    const total =
      ref(0)


    const totalPages =
      ref(0)



    const hasCandidates =
    computed(
      () =>
        candidates.value.length > 0,
    )



    const hasPreviousPage =
    computed(
      () =>
        page.value > 1,
    )



    const hasNextPage =
    computed(
      () =>
        totalPages.value > 0
        &&
        page.value <
        totalPages.value,
    )



    function buildFilters():
    DealerRegionCandidateFilters {

      return {

        keyword:
          keyword.value.trim()
          ||
          undefined,

        status:
          statusFilter.value
          ||
          undefined,

        unassignedOnly:
          unassignedOnly.value,

        page:
          page.value,

        pageSize:
          pageSize.value,

      }

    }



    async function fetchCandidates(){

      loading.value =
        true


      error.value =
        null


      try {


        const response =
          await getDealerRegionCandidates(
            buildFilters(),
          )


        candidates.value =
          response.items


        total.value =
          response.total


        page.value =
          response.page


        pageSize.value =
          response.pageSize


        totalPages.value =
          response.totalPages


        return response


      }catch(errorValue){


        candidates.value =
          []


        total.value =
          0


        totalPages.value =
          0


        error.value =
          normalizeError(
            errorValue,
            '取得可指派經銷商資料失敗。',
          )


        return null


      }finally{


        loading.value =
          false

      }

    }



    async function searchCandidates(
      searchKeyword?: string,
    ){

      if(
        typeof searchKeyword === 'string'
      ){

        keyword.value =
          searchKeyword

      }


      page.value =
        1


      return fetchCandidates()

    }



    async function setStatusFilter(
      status: string,
    ){

      statusFilter.value =
        status


      page.value =
        1


      return fetchCandidates()

    }



    async function setUnassignedOnly(
      value: boolean,
    ){

      unassignedOnly.value =
        value


      page.value =
        1


      return fetchCandidates()

    }



    async function goToPage(
      nextPage: number,
    ){

      if(
        !Number.isInteger(
          nextPage,
        )
        ||
        nextPage < 1
      ){

        return null

      }


      if(
        totalPages.value > 0
        &&
        nextPage >
        totalPages.value
      ){

        return null

      }


      page.value =
        nextPage


      return fetchCandidates()

    }



    async function previousPage(){

      if(
        !hasPreviousPage.value
      ){

        return null

      }


      return goToPage(
        page.value - 1,
      )

    }



    async function nextPage(){

      if(
        !hasNextPage.value
      ){

        return null

      }


      return goToPage(
        page.value + 1,
      )

    }



    async function setPageSize(
      value: number,
    ){

      if(
        !Number.isInteger(
          value,
        )
        ||
        value <= 0
      ){

        return null

      }


      pageSize.value =
        value


      page.value =
        1


      return fetchCandidates()

    }



    function removeCandidateLocally(
      dealerId: string,
    ){

      const index =
        candidates.value.findIndex(
          candidate =>
            candidate.id ===
            dealerId,
        )


      if(
        index < 0
      ){

        return

      }


      candidates.value.splice(
        index,
        1,
      )


      total.value =
        Math.max(
          total.value - 1,
          0,
        )


      totalPages.value =
        total.value > 0
          ? Math.ceil(
              total.value /
              pageSize.value,
            )
          : 0

    }



    function removeCandidatesLocally(
      dealerIds: string[],
    ){

      const dealerIdSet =
        new Set(
          dealerIds,
        )


      const removedCount =
        candidates.value.filter(
          candidate =>
            dealerIdSet.has(
              candidate.id,
            ),
        ).length


      candidates.value =
        candidates.value.filter(
          candidate =>
            !dealerIdSet.has(
              candidate.id,
            ),
        )


      total.value =
        Math.max(
          total.value -
          removedCount,
          0,
        )


      totalPages.value =
        total.value > 0
          ? Math.ceil(
              total.value /
              pageSize.value,
            )
          : 0

    }



    function clearError(){

      error.value =
        null

    }



    function resetFilters(){

      keyword.value =
        ''


      statusFilter.value =
        'active'


      unassignedOnly.value =
        true


      page.value =
        1


      pageSize.value =
        DEFAULT_PAGE_SIZE

    }



    return {

      candidates,

      loading,

      error,

      keyword,

      statusFilter,

      unassignedOnly,

      page,

      pageSize,

      total,

      totalPages,

      hasCandidates,

      hasPreviousPage,

      hasNextPage,

      fetchCandidates,

      searchCandidates,

      setStatusFilter,

      setUnassignedOnly,

      goToPage,

      previousPage,

      nextPage,

      setPageSize,

      removeCandidateLocally,

      removeCandidatesLocally,

      clearError,

      resetFilters,

    }

  },
)


export default useDealerRegionCandidateStore