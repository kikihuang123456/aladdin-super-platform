<template>

  <section class="card">


    <div class="header">

      <h2>
        最近交易紀錄
      </h2>


      <span>
        共 {{ transactions.length }} 筆
      </span>


    </div>



    <table>


      <thead>

        <tr>

          <th>
            交易編號
          </th>


          <th>
            類型
          </th>


          <th>
            金額
          </th>


          <th>
            狀態
          </th>


          <th>
            建立時間
          </th>


        </tr>

      </thead>



      <tbody>


        <tr
          v-for="item in transactions"
          :key="item.id"
        >


          <td>

            {{ item.transactionNo }}

          </td>



          <td>

            {{ translateType(
              item.type,
            ) }}

          </td>



          <td>

            {{ formatMoney(
              item.amount,
              item.currency,
            ) }}

          </td>



          <td>

            <span
              class="status"
            >
              {{ item.status }}
            </span>

          </td>



          <td>

            {{ formatDate(
              item.createdAt,
            ) }}

          </td>


        </tr>



        <tr
          v-if="transactions.length === 0"
        >

          <td
            colspan="5"
            class="empty"
          >

            暫無交易資料

          </td>


        </tr>


      </tbody>


    </table>


  </section>

</template>



<script setup lang="ts">


import type {
  FinanceTransaction,
} from '../../types/finance'



defineProps<{

  transactions:
    FinanceTransaction[]

}>()



function translateType(
  type:string,
):string {


  const map:
    Record<string,string> = {

      income:
        '收入',

      refund:
        '退款',

      settlement:
        '結算',

      withdraw:
        '提款',

      deposit:
        '充值',

    }


  return (
    map[type]
    ||
    type
  )

}





function formatMoney(
  amount:number,
  currency:string,
):string {


  return new Intl.NumberFormat(
    'zh-TW',
    {

      style:
        'currency',

      currency:
        currency || 'TWD',

      maximumFractionDigits:
        0,

    },
  ).format(
    amount || 0,
  )

}





function formatDate(
  value:string,
):string {


  if(!value){

    return '-'

  }


  return new Date(
    value,
  ).toLocaleString(
    'zh-TW',
  )

}


</script>



<style scoped>


.card{

background:white;

padding:24px;

border-radius:18px;

border:1px solid #e5e7eb;

}



.header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

}



.header h2{

margin:0;

font-size:22px;

}



.header span{

color:#64748b;

font-size:14px;

}



table{

width:100%;

border-collapse:collapse;

}



th{

background:#f8fafc;

color:#64748b;

font-size:13px;

text-align:left;

padding:14px;

}



td{

padding:14px;

border-bottom:1px solid #eef2f7;

}



.status{

padding:5px 12px;

border-radius:999px;

background:#eff6ff;

color:#3157d6;

font-size:13px;

}



.empty{

text-align:center;

padding:40px;

color:#94a3b8;

}


</style>