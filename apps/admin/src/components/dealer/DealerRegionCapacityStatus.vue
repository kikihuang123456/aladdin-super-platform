<script setup lang="ts">

import {
  computed,
} from 'vue'


const props =
defineProps<{

  maxDealers:
    number

  currentDealers:
    number

  usageRate:
    number

}>()



const status =
computed(
  () => {

    if(
      props.maxDealers <= 0
    ){

      return {
        label:
          '未設定容量',

        className:
          'unset',
      }

    }


    if(
      props.currentDealers >=
      props.maxDealers
    ){

      return {
        label:
          '已滿',

        className:
          'full',
      }

    }


    if(
      props.usageRate >= 80
    ){

      return {
        label:
          '接近滿載',

        className:
          'warning',
      }

    }


    return {
      label:
        '正常',

      className:
        'normal',
    }

  },
)

</script>


<template>

<span
  class="status-badge"
  :class="
    status.className
  "
>

  {{ status.label }}

</span>

</template>


<style scoped>

.status-badge {

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  min-width:
    82px;

  padding:
    6px 10px;

  border-radius:
    999px;

  font-size:
    13px;

  font-weight:
    600;

}


.normal {

  color:
    #067647;

  background:
    #ecfdf3;

}


.warning {

  color:
    #b54708;

  background:
    #fffaeb;

}


.full {

  color:
    #b42318;

  background:
    #fef3f2;

}


.unset {

  color:
    #475467;

  background:
    #f2f4f7;

}

</style>