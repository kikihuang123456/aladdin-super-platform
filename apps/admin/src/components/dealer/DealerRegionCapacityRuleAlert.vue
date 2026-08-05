<script setup lang="ts">

import {
  computed,
} from 'vue'


import type {
  DealerRegionCapacityRuleResult,
} from '../../types/dealer-region-capacity-rule'



const props =
defineProps<{

  result:
    DealerRegionCapacityRuleResult
    | null

  loading?:
    boolean

  error?:
    string
    | null

}>()



const alertClass =
computed(
  () => {

    if(
      props.error
    ){

      return 'error'

    }


    if(
      !props.result
    ){

      return 'neutral'

    }


    switch(
      props.result.status
    ){

      case 'available':

        return 'success'


      case 'near_capacity':

        return 'warning'


      case 'full':

        return 'error'


      case 'not_configured':

        return 'error'


      case 'disabled':

        return 'error'


      default:

        return 'neutral'

    }

  },
)



const title =
computed(
  () => {

    if(
      props.loading
    ){

      return '正在檢查區域容量'
    }


    if(
      props.error
    ){

      return '容量檢查失敗'
    }


    if(
      !props.result
    ){

      return '尚未執行容量檢查'
    }


    switch(
      props.result.status
    ){

      case 'available':

        return '區域容量正常'


      case 'near_capacity':

        return '區域接近滿載'


      case 'full':

        return '區域容量不足'


      case 'not_configured':

        return '尚未設定區域容量'


      case 'disabled':

        return '區域目前未啟用'


      default:

        return '區域容量檢查結果'

    }

  },
)



const displayMessage =
computed(
  () => {

    if(
      props.loading
    ){

      return '系統正在取得區域容量及目前指派人數。'
    }


    if(
      props.error
    ){

      return props.error
    }


    if(
      props.result
    ){

      return props.result.message
    }


    return '選擇區域及經銷商後，系統將在正式指派前檢查容量。'

  },
)

</script>


<template>

<div
  class="capacity-alert"
  :class="
    alertClass
  "
>

  <div class="alert-header">

    <strong>
      {{ title }}
    </strong>

    <span
      v-if="result"
      class="permission-badge"
    >
      {{
        result.allowed
          ? '允許指派'
          : '禁止指派'
      }}
    </span>

  </div>


  <p>
    {{ displayMessage }}
  </p>


  <div
    v-if="result"
    class="capacity-details"
  >

    <div>

      <span>
        目前人數
      </span>

      <strong>
        {{ result.currentDealers }}
      </strong>

    </div>


    <div>

      <span>
        本次指派
      </span>

      <strong>
        {{ result.requestedDealers }}
      </strong>

    </div>


    <div>

      <span>
        指派後人數
      </span>

      <strong>
        {{ result.projectedDealers }}
      </strong>

    </div>


    <div>

      <span>
        最大容量
      </span>

      <strong>
        {{ result.maxDealers }}
      </strong>

    </div>


    <div>

      <span>
        剩餘容量
      </span>

      <strong>
        {{ result.remainingCapacity }}
      </strong>

    </div>

  </div>

</div>

</template>


<style scoped>

.capacity-alert {

  padding:
    18px;

  border:
    1px solid #d0d5dd;

  border-radius:
    14px;

  background:
    #f9fafb;

}


.alert-header {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

}


.alert-header strong {

  font-size:
    16px;

}


.capacity-alert p {

  margin:
    8px 0 0;

  color:
    #475467;

  line-height:
    1.6;

}


.permission-badge {

  padding:
    5px 10px;

  border-radius:
    999px;

  font-size:
    12px;

  font-weight:
    700;

  background:
    rgba(255, 255, 255, .72);

}


.capacity-details {

  display:
    grid;

  grid-template-columns:
    repeat(
      5,
      minmax(0, 1fr)
    );

  gap:
    10px;

  margin-top:
    16px;

}


.capacity-details div {

  display:
    flex;

  flex-direction:
    column;

  gap:
    5px;

  padding:
    12px;

  border-radius:
    10px;

  background:
    rgba(255, 255, 255, .72);

}


.capacity-details span {

  color:
    #667085;

  font-size:
    12px;

}


.capacity-details strong {

  color:
    #101828;

  font-size:
    18px;

}


.success {

  border-color:
    #abefc6;

  background:
    #ecfdf3;

}


.warning {

  border-color:
    #fedf89;

  background:
    #fffaeb;

}


.error {

  border-color:
    #fecdca;

  background:
    #fef3f2;

}


.neutral {

  border-color:
    #d0d5dd;

  background:
    #f9fafb;

}


@media (
  max-width: 900px
) {

  .capacity-details {

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

  }

}

</style>