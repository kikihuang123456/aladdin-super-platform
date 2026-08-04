<script setup lang="ts">

import {
  computed,
  ref,
} from 'vue'


import type {
  DealerRegion,
} from '../../types/dealer-region'



interface Props {

  visible: boolean

  region:
    DealerRegion | null

}



const props =
  defineProps<Props>()



const emit =
  defineEmits<{

    close: []

    confirm: [
      dealerIds: string[],
    ]

  }>()



// 暫時模擬經銷商資料
// 下一步會改接 Dealer API

const dealers =
  ref([

    {
      id: 'dealer-001',
      name: '王小明',
      phone: '0912-000-001',
    },


    {
      id: 'dealer-002',
      name: '李小華',
      phone: '0912-000-002',
    },


    {
      id: 'dealer-003',
      name: '張先生',
      phone: '0912-000-003',
    },

  ])



const selectedDealerIds =
  ref<string[]>([])

const submitting =
  ref(false)

const title =
  computed(
    () => {

      if(
        !props.region
      ){

        return '指派經銷商區域'

      }


      return `指派至 ${props.region.name}`

    },
  )



function toggleDealer(
  dealerId:string,
){


  const index =
    selectedDealerIds.value.indexOf(
      dealerId,
    )



  if(index >= 0){

    selectedDealerIds.value.splice(
      index,
      1,
    )

  }else{

    selectedDealerIds.value.push(
      dealerId,
    )

  }

}



function handleClose(){

  submitting.value =
    false


  selectedDealerIds.value =
    []


  emit(
    'close',
  )

}


async function handleConfirm(){

  if(
    selectedDealerIds.value.length === 0
  ){

    return

  }


  submitting.value =
    true


  emit(
    'confirm',
    selectedDealerIds.value,
  )

}


</script>



<template>


<div
  v-if="props.visible"
  class="overlay"
>


  <div
    class="dialog"
  >


    <header>

      <h2>
        {{ title }}
      </h2>

    </header>



    <section
      v-if="props.region"
      class="region-info"
    >

      <div>
        區域：
        {{ props.region.name }}
      </div>


      <div>
        編號：
        {{ props.region.code }}
      </div>


    </section>




    <section>

      <h3>
        選擇經銷商
      </h3>



      <div
        v-for="dealer in dealers"
        :key="dealer.id"
        class="dealer-item"
      >

        <label>

          <input

            type="checkbox"

            :checked="
              selectedDealerIds.includes(
                dealer.id,
              )
            "

            @change="
              toggleDealer(
                dealer.id,
              )
            "

          />


          {{ dealer.name }}

          -

          {{ dealer.phone }}


        </label>


      </div>


    </section>




   <footer>


<button

  :disabled="submitting"

  @click="handleClose"

>

取消

</button>



<button

  :disabled="submitting"

  @click="handleConfirm"

>

  {{
    submitting
      ? '提交中...'
      : '確認指派'
  }}

</button>


</footer>


  </div>


</div>


</template>



<style scoped>


.overlay{

  position:fixed;

  inset:0;

  background:rgba(0,0,0,.35);

  display:flex;

  align-items:center;

  justify-content:center;

}



.dialog{

  width:420px;

  background:white;

  border-radius:16px;

  padding:24px;

}



.region-info{

  background:#f5f6fa;

  padding:12px;

  border-radius:8px;

  margin-bottom:20px;

}



.dealer-item{

  padding:10px 0;

}



footer{

  display:flex;

  justify-content:flex-end;

  gap:12px;

  margin-top:24px;

}


button{

  padding:8px 16px;

  border-radius:8px;

  cursor:pointer;

}


</style>
