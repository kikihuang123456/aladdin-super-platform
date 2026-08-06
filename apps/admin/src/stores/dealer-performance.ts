import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  getDealerTeamPerformance,
} from '../api/dealer'

import type {
  DealerTeamPerformance,
} from '../types/dealer'


export const useDealerPerformanceStore =
  defineStore(
    'dealer-performance',
    () => {

      const performance =
        ref<DealerTeamPerformance | null>(
          null,
        )

      const isLoading =
        ref(false)

      const error =
        ref<string | null>(
          null,
        )

      const message =
        ref<string | null>(
          null,
        )


      const dealer =
        computed(
          () =>
            performance.value
              ?.dealer
            ??
            null,
        )


      const parentDealer =
        computed(
          () =>
            performance.value
              ?.parentDealer
            ??
            null,
        )


      const directDealers =
        computed(
          () =>
            performance.value
              ?.directDealers
            ??
            [],
        )


      const statistics =
        computed(
          () =>
            performance.value
              ?.statistics
            ??
            {
              directCount: 0,
              teamCount: 0,
              teamSales: 0,
              totalCommission: 0,
            },
        )


      async function fetchPerformance(
        dealerId: string,
      ): Promise<boolean> {

        if (
          isLoading.value
        ) {

          return false

        }


        const normalizedDealerId =
          dealerId.trim()


        if (
          !normalizedDealerId
        ) {

          error.value =
            'Dealer ID 不可空白。'

          return false

        }


        isLoading.value =
          true

        error.value =
          null

        message.value =
          null


        try {

          const response =
            await getDealerTeamPerformance(
              normalizedDealerId,
            )


          if (
            !response.success
            ||
            !response.data
          ) {

            performance.value =
              null

            error.value =
              response.error
              ??
              response.message

            return false

          }


          performance.value =
            response.data

          message.value =
            response.message

          return true

        } catch (
          errorValue
        ) {

          performance.value =
            null

          error.value =
            errorValue instanceof Error
              ? errorValue.message
              : '載入經銷商團隊業績時發生未知錯誤。'

          return false

        } finally {

          isLoading.value =
            false

        }

      }


      function clearPerformance():
      void {

        performance.value =
          null

        error.value =
          null

        message.value =
          null

      }


      function clearError():
      void {

        error.value =
          null

      }


      return {

        performance,

        isLoading,

        error,

        message,

        dealer,

        parentDealer,

        directDealers,

        statistics,

        fetchPerformance,

        clearPerformance,

        clearError,

      }

    },
  )
