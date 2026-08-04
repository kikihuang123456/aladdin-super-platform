<script setup lang="ts">

import type {
  DealerRegion,
} from '../../types/dealer-region'

import {
  useDealerRegionStore,
} from '../../stores/dealer-region'

interface Props {

  regions:
    DealerRegion[]

}

const dealerRegionStore =
  useDealerRegionStore()

const props =
  defineProps<Props>()


const emit =
defineEmits([
  'assign',
  'detail',
  'history',
  'reassign',
  'remove',
  'refresh',
])



function handleAssign(
  region:
    DealerRegion,
){

  emit(
    'assign',
    region,
  )

}

function testDetail(
  region:any
){

  console.log(
    '點擊查看:',
    region
  )


  emit(
    'detail',
    region
  )

}
function testHistory(
  region:any
){

  console.log(
    '點擊歷史:',
    region
  )


  emit(
    'history',
    region
  )

}

function handleReassign(
  region:
    DealerRegion,
){

  emit(
    'reassign',
    region,
  )

}



async function handleRemove(
  region:any
){

  console.log(
    '解除區域:',
    region
  )


  const confirmRemove =
    window.confirm(
      `確定解除 ${region.name} 的經銷商指派嗎？`
    )


  if(!confirmRemove){

    return

  }


  /**
   * 目前資料模型：
   *
   * dealer_region_members
   *
   * 透過 dealerId 解除
   *
   */


  if(
    !region.managerDealerId
  ){

    alert(
      '此區域目前沒有經銷商'
    )

    return

  }


  const result =
    await dealerRegionStore.removeRegion({

      dealerId:
        region.managerDealerId,


      regionId:
        region.id,

    })


  if(!result){

    alert(
      dealerRegionStore.error ??
      '解除失敗'
    )

    return

  }


  alert(
    '解除成功'
  )

emit(
  'refresh'
)


}
</script>


<template>


<div
  class="assignment-table"
>


  <div
    class="table-header"
  >

    <h2>
      經銷商區域配置
    </h2>


    <span>
      共 {{ props.regions.length }} 個區域
    </span>


  </div>



  <table>


    <thead>

      <tr>

        <th>
          區域名稱
        </th>


        <th>
          區域編號
        </th>


        <th>
          市場
        </th>


        <th>
          經銷商數量
        </th>


        <th>
          狀態
        </th>


        <th>
          操作
        </th>


      </tr>

    </thead>



    <tbody>


      <tr

        v-for="region in props.regions"

        :key="region.id"

      >


        <td>

          {{ region.name }}

        </td>



        <td>

          {{ region.code }}

        </td>



        <td>

          {{ region.market }}

        </td>



        <td>

          {{ region.dealerCount }}

        </td>



        <td>

          <span
            class="status"
          >

            {{ region.status }}

          </span>


        </td>



        <td>


          <div class="actions">

<button
@click="testDetail(region)"
>
查看
</button>

<button
@click="testHistory(region)"
>
歷史
</button>

<button
@click="handleAssign(region)"
>
指派
</button>


<button
@click="handleReassign(region)"
>
重新指派
</button>


<button
@click="handleRemove(region)"
>
解除
</button>
</div>ƒ


        </td>


      </tr>


    </tbody>


  </table>


</div>


</template>



<style scoped>


.assignment-table{

  background:white;

  border-radius:16px;

  padding:24px;

}



.table-header{

  display:flex;

  justify-content:space-between;

  align-items:center;

  margin-bottom:20px;

}



table{

  width:100%;

  border-collapse:collapse;

}



th,
td{

  padding:14px;

  border-bottom:1px solid #eee;

  text-align:left;

}



button{

  margin-right:8px;

  padding:6px 12px;

  border-radius:8px;

  cursor:pointer;

}



.status{

  padding:4px 10px;

  border-radius:20px;

}



</style>
