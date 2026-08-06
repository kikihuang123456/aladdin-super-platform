<script setup lang="ts">

import type {
  Dealer,
} from '../../types/dealer'


const props =
  defineProps<{

    dealers:
      Dealer[]

    submittingDealerId?:
      string | null

  }>()


const emit =
  defineEmits<{

    view: [
      dealer: Dealer
    ]

    approve: [
      dealer: Dealer
    ]

    reject: [
      dealer: Dealer
    ]

  }>()



function formatDate(
  value?: string | null,
){

  if(!value){

    return '-'

  }


  return new Date(
    value,
  )
  .toLocaleString(
    'zh-TW',
  )

}


</script>



<template>

<div
  class="approval-table-card"
>


  <div
   v-if="props.dealers.length === 0"
    class="empty"
  >

    目前沒有待審核經銷商

  </div>



  <table
    v-else
    class="approval-table"
  >


    <thead>

      <tr>

        <th>
          經銷編號
        </th>


        <th>
          姓名
        </th>


        <th>
          電話
        </th>


        <th>
          市場
        </th>


        <th>
          等級
        </th>


        <th>
          申請時間
        </th>


        <th>
          操作
        </th>


      </tr>


    </thead>



    <tbody>


      <tr
        v-for="dealer in props.dealers"
        :key="dealer.id"
      >


        <td>

          {{ dealer.dealerNo }}

        </td>



        <td>

          {{ dealer.name }}

        </td>



        <td>

          {{ dealer.phone ?? '-' }}

        </td>



        <td>

          {{ dealer.market }}

        </td>



        <td>

          {{ dealer.level }}

        </td>



        <td>

          {{ formatDate(
            dealer.createdAt,
          ) }}

        </td>



        <td>


          <div
            class="actions"
          >


            <button
              class="view"
              @click="
                emit(
                  'view',
                  dealer,
                )
              "
            >

              查看

            </button>

<button
  class="view"
  :disabled="
    Boolean(
      props.submittingDealerId,
    )
  "
  @click="
    emit(
      'view',
      dealer,
    )
  "
>
  查看
</button>

            <button
  class="approve"
  :disabled="
    Boolean(
      props.submittingDealerId,
    )
  "
  @click="
    emit(
      'approve',
      dealer,
    )
  "
>
  {{
    props.submittingDealerId ===
      dealer.id
      ? '處理中…'
      : '通過'
  }}
</button>



            <button
  class="reject"
  :disabled="
    Boolean(
      props.submittingDealerId,
    )
  "
  @click="
    emit(
      'reject',
      dealer,
    )
  "
>
  {{
    props.submittingDealerId ===
      dealer.id
      ? '處理中…'
      : '拒絕'
  }}
</button>


          </div>


        </td>


      </tr>


    </tbody>


  </table>


</div>


</template>



<style scoped>


.approval-table-card{

  background:white;

  border-radius:16px;

  padding:24px;

}



.approval-table{

  width:100%;

  border-collapse:collapse;

}



th{

  text-align:left;

  padding:14px;

  background:#f8fafc;

}



td{

  padding:14px;

  border-bottom:1px solid #eee;

}



.actions{

  display:flex;

  gap:8px;

}



button{

  padding:6px 12px;

  border-radius:8px;

  border:none;

  cursor:pointer;

}



.view{

  background:#e6f4ff;

}



.approve{

  background:#52c41a;

  color:white;

}



.reject{

  background:#ff4d4f;

  color:white;

}



.empty{

  padding:60px;

  text-align:center;

  color:#64748b;

}

.actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  pointer-events: none;
}
</style>