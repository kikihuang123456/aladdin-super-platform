<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'


import {
  getRegionDealers,
} from '../../api/dealer-region'



const props =
defineProps({

  region:{
    type:Object,
    required:true,
  }

})


const emit =
defineEmits([
  'close',
])



const dealers =
ref<any[]>([])



const loading =
ref(false)



const error =
ref<string | null>(null)



async function loadDealers(){


  if(
    !props.region?.id
  ){

    return

  }


  loading.value =
    true


  error.value =
    null



  try{


    const result =
      await getRegionDealers(
        props.region.id
      )



    console.log(
      '區域經銷商資料:',
      result
    )



    dealers.value =
      result ?? []



  }catch(errorValue:any){


    console.error(
      errorValue
    )


    error.value =
      errorValue.message ??
      '載入失敗'


  }finally{


    loading.value =
      false


  }

}



function handleClose(){

  emit(
    'close'
  )

}



onMounted(()=>{

  loadDealers()

})


</script>



<template>

<div class="dialog-mask">


  <div class="dialog">


    <!-- Header -->

    <div class="dialog-header">


      <h2>

        {{ region.name }}

      </h2>


      <button
      class="close-btn"
      @click="handleClose"
      >

        ×

      </button>


    </div>



    <!-- 區域資訊 -->

    <div class="info-card">


      <div>

        <span>
          區域編號
        </span>

        <strong>
          {{ region.code }}
        </strong>

      </div>



      <div>

        <span>
          市場
        </span>

        <strong>
          {{ region.market }}
        </strong>

      </div>



      <div>

        <span>
          狀態
        </span>

        <strong>
          {{ region.status }}
        </strong>

      </div>



      <div>

        <span>
          經銷商數量
        </span>

        <strong>
          {{ dealers.length }}
        </strong>

      </div>


    </div>




    <h3>

      區域經銷商列表

    </h3>



    <div
    v-if="loading"
    class="loading"
    >

      載入中...

    </div>




    <div
    v-else-if="error"
    class="error"
    >

      {{ error }}

    </div>




    <table
    v-else
    class="dealer-table"
    >


      <thead>

        <tr>

          <th>
            姓名
          </th>


          <th>
            會員編號
          </th>


          <th>
            電話
          </th>


          <th>
            指派時間
          </th>

        </tr>

      </thead>



      <tbody>


        <tr
        v-if="dealers.length===0"
        >

          <td
          colspan="4"
          >

            目前沒有經銷商

          </td>

        </tr>




        <tr
        v-for="dealer in dealers"
        :key="dealer.id"
        >


          <td>

            {{ dealer.members?.name ?? '-' }}

          </td>


          <td>

            {{ dealer.members?.member_code ?? '-' }}

          </td>


          <td>

            {{ dealer.members?.phone ?? '-' }}

          </td>


          <td>

            {{ dealer.assigned_at }}

          </td>


        </tr>



      </tbody>



    </table>



    <div class="footer">


      <button
      @click="handleClose"
      >

        關閉

      </button>


    </div>



  </div>


</div>


</template>




<style scoped>


.dialog-mask{

position:fixed;

inset:0;

background:
rgba(0,0,0,.45);

display:flex;

align-items:center;

justify-content:center;

z-index:999;


}



.dialog{

width:720px;

max-height:85vh;

overflow:auto;

background:white;

border-radius:18px;

padding:28px;


}



.dialog-header{

display:flex;

justify-content:space-between;

align-items:center;

}



.close-btn{

font-size:24px;

border:none;

background:none;

cursor:pointer;

}



.info-card{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:15px;

background:#f6f7f9;

padding:18px;

border-radius:12px;

margin:20px 0;


}



.info-card span{

display:block;

color:#666;

font-size:13px;

}



.info-card strong{

font-size:18px;

}



.dealer-table{

width:100%;

border-collapse:collapse;


}



.dealer-table th,
.dealer-table td{

padding:12px;

border-bottom:1px solid #eee;

text-align:left;

}



.footer{

margin-top:25px;

text-align:right;

}



.footer button{

padding:10px 30px;

border-radius:8px;

cursor:pointer;

}



</style>