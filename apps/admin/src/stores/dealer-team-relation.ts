import {
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  assignDealerTeamParent,
  reassignDealerTeamParent,
  unassignDealerTeamParent,
} from '../api/dealer'

import type {
  DealerTeamRelationMutationInput,
  DealerTeamRelationMutationResponse,
} from '../types/dealer'


export const useDealerTeamRelationStore =
  defineStore(
    'dealer-team-relation',
    () => {

      const isSubmitting =
        ref(false)

      const error =
        ref<string | null>(
          null,
        )

      const message =
        ref<string | null>(
          null,
        )

      const lastResponse =
        ref<DealerTeamRelationMutationResponse | null>(
          null,
        )


      function resetFeedback():
      void {

        error.value =
          null

        message.value =
          null

        lastResponse.value =
          null

      }


      async function runMutation(
        action:
          (
            input: DealerTeamRelationMutationInput,
          ) =>
            Promise<DealerTeamRelationMutationResponse>,

        input:
          DealerTeamRelationMutationInput,
      ): Promise<boolean> {

        if (
          isSubmitting.value
        ) {

          return false

        }


        isSubmitting.value =
          true

        resetFeedback()


        try {

          const response =
            await action(
              input,
            )


          lastResponse.value =
            response


          if (
            !response.success
          ) {

            error.value =
              response.error
              ??
              response.message

            return false

          }


          message.value =
            response.message

          return true

        } catch (
          errorValue
        ) {

          error.value =
            errorValue instanceof Error
              ? errorValue.message
              : '經銷商團隊關係操作時發生未知錯誤。'

          return false

        } finally {

          isSubmitting.value =
            false

        }

      }


      async function assignParent(
        input:
          DealerTeamRelationMutationInput,
      ): Promise<boolean> {

        return runMutation(
          assignDealerTeamParent,
          input,
        )

      }


      async function reassignParent(
        input:
          DealerTeamRelationMutationInput,
      ): Promise<boolean> {

        return runMutation(
          reassignDealerTeamParent,
          input,
        )

      }


      async function unassignParent(
        input:
          DealerTeamRelationMutationInput,
      ): Promise<boolean> {

        return runMutation(
          unassignDealerTeamParent,
          input,
        )

      }


      return {

        isSubmitting,

        error,

        message,

        lastResponse,

        resetFeedback,

        assignParent,

        reassignParent,

        unassignParent,

      }

    },
  )
