<script setup lang="ts">
console.log(
  "我是 DealerRegionAssignDialog.vue"
)

alert('目前使用的是 DealerRegionAssignDialog.vue')

console.log(
  'DealerRegionAssignDialog 載入'
)

import {
  ref,
  watch,
} from 'vue'

import {
  fetchAssignableDealers,
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

  'confirm',

])



const dealers =
ref<any[]>([])



const selectedDealerIds =
ref<string[]>([])



const loading =
ref(false)


async function loadDealers(){

 console.log(
  '開始載入經銷商'
 )


 loading.value = true


 try{

   const result =
     await fetchAssignableDealers()


   console.log(
    'API回傳 result:',
    result
   )


   dealers.value = result
   
console.log(
  '最後寫入 dealers:',
  JSON.stringify(result)
)

   console.log(
    '目前 dealers.value:',
    dealers.value
   )


 }catch(error){

   console.error(
    error
   )

 }finally{

   loading.value=false

 }

}

function toggleDealer(
  id:string
){

  if(
    selectedDealerIds.value.includes(id)
  ){

    selectedDealerIds.value =
      selectedDealerIds.value.filter(
        item =>
          item !== id
      )


  }else{


    selectedDealerIds.value.push(
      id
    )

  }

}




function handleConfirm(){

  if(
    selectedDealerIds.value.length === 0
  ){

    return

  }


  emit(
    'confirm',
    selectedDealerIds.value,
  )

}


function handleClose(){

  emit(
    'close'
  )

}



watch(
  () => props.region,
  () => {

    if(props.region){

      loadDealers()

    }

  },
  {
    immediate:true,
  }
)
}
</script>



<template>

<div class="dialog-mask">


<div class="dialog">


<h2>
指派經銷商
</h2>


<p>

區域：

{{ props.region?.name }}

</p>



<div
v-if="loading"
>

載入會員資料...

</div>



<div
v-else
class="dealer-list"
>
<div style="color:red">
目前筆數：
{{ dealers.length }}
</div>

<div style="color:blue">
第一筆：
{{ dealers[0]?.name }}
</div>

<div style="color:red">

目前經銷商數量：
{{ dealers.length }}

</div>


<pre style="color:red">
{{ JSON.stringify(dealers,null,2) }}
</pre>



<label
v-for="dealer in dealers"
:key="dealer.id"
>


<input

type="checkbox"

:value="dealer.id"

:checked="
selectedDealerIds.includes(
dealer.id
)
"

@change="
toggleDealer(
dealer.id
)
"

/>


{{ dealer.name }}

-

{{ dealer.member_code }}


</label>


</div>



<div class="actions">


<button
@click="handleClose"
>

取消

</button>



<button

@click="handleConfirm"

>

確認指派

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
rgba(0,0,0,.4);

display:flex;

align-items:center;

justify-content:center;

}



.dialog{

background:white;

width:500px;

padding:30px;

border-radius:16px;

}



.dealer-list{

max-height:300px;

overflow:auto;

display:flex;

flex-direction:column;

gap:12px;

}



.actions{

display:flex;

justify-content:flex-end;

gap:15px;

margin-top:25px;

}


button{

padding:10px 20px;

border-radius:8px;

cursor:pointer;

}


</style>