<script setup lang="ts">

import {
 onMounted,
 ref
} from 'vue'


import {
 getDealerRegionLogs
} from '../../api/dealer-region'


const props =
defineProps({

 region:{
  type:Object,
  required:true
 }

})


const emit =
defineEmits([
 'close'
])


const logs =
ref<any[]>([])


const loading =
ref(false)



async function loadLogs(){


 if(!props.region?.id){
  return
 }


 loading.value=true


 try{

  logs.value =
   await getDealerRegionLogs(
    props.region.id
   )


 }finally{

  loading.value=false

 }

}



function close(){

 emit(
  'close'
 )

}



onMounted(()=>{

 loadLogs()

})


</script>



<template>

<div class="mask">

<div class="dialog">


<h2>
區域異動紀錄
</h2>


<h3>
{{region.name}}
</h3>


<div v-if="loading">
載入中...
</div>


<div
v-for="item in logs"
:key="item.id"
class="log-item"
>


<p>
操作：
{{item.action_type}}
</p>


<p>
時間：
{{item.created_at}}
</p>


<p>
備註：
{{item.remark}}
</p>


</div>



<button
@click="close"
>
關閉
</button>


</div>

</div>


</template>



<style scoped>

.mask{

position:fixed;
inset:0;
background:#0006;

display:flex;
align-items:center;
justify-content:center;

}


.dialog{

background:white;
padding:30px;
width:500px;
border-radius:16px;

}


.log-item{

border-bottom:1px solid #ddd;
padding:10px;

}

</style>