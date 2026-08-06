import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  getDealerTeamRelationHistory,
} from '../api/dealer'

import type {
  DealerTeamRelationHistoryItem,
} from '../types/dealer'


export const useDealerTeamRelationHistoryStore =
  defineStore(
    'dealer-team-relation-history',
    () => {

      const dealerId =
        ref('')

      const history =
        ref<
          DealerTeamRelationHistoryItem[]
        >([])

      const total =
        ref(0)

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


      const hasHistory =
        computed(() =>
          history.value.length > 0,
        )


      const isEmpty =
        computed(() =>
          !isLoading.value
          &&
          history.value.length === 0,
        )


      async function fetchHistory(
        nextDealerId: string,
        limit = 50,
      ): Promise<boolean> {

        const normalizedDealerId =
          nextDealerId.trim()


        if (
          !normalizedDealerId
        ) {

          dealerId.value =
            ''

          history.value =
            []

          total.value =
            0

          error.value =
            '經銷商 ID 不可空白。'

          message.value =
            null

          return false

        }


        if (
          isLoading.value
        ) {

          return false

        }


        dealerId.value =
          normalizedDealerId

        isLoading.value =
          true

        error.value =
          null

        message.value =
          null


        try {

          const response =
            await getDealerTeamRelationHistory(
              normalizedDealerId,
              limit,
            )


          if (
            !response.success
            ||
            !response.data
          ) {

            history.value =
              []

            total.value =
              0

            error.value =
              response.error
              ??
              response.message

            return false

          }


          dealerId.value =
            response.data.dealerId

          history.value =
            response.data.history

          total.value =
            response.data.total

          message.value =
            response.message

          return true

        } catch (
          errorValue
        ) {

          history.value =
            []

          total.value =
            0

          error.value =
            errorValue instanceof Error
              ? errorValue.message
              : '載入經銷商團隊關係歷史時發生未知錯誤。'

          return false

        } finally {

          isLoading.value =
            false

        }

      }


      function clearHistory():
      void {

        dealerId.value =
          ''

        history.value =
          []

        total.value =
          0

        error.value =
          null

        message.value =
          null

      }


      function clearFeedback():
      void {

        error.value =
          null

        message.value =
          null

      }


      return {

        dealerId,

        history,

        total,

        isLoading,

        error,

        message,

        hasHistory,

        isEmpty,

        fetchHistory,

        clearHistory,

        clearFeedback,

      }

    },
  )


export default useDealerTeamRelationHistoryStore
