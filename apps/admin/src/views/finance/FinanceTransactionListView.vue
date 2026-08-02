<script setup lang="ts">

import {
  onMounted,
} from 'vue'


import {
  useRouter,
} from 'vue-router'


import AdminLayout
  from '../../layouts/AdminLayout.vue'


import {
  useFinanceTransactionStore,
} from '../../stores/finance-transaction'


import type {
  FinanceTransaction,
} from '../../types/finance-transaction'



const router =
  useRouter()


const store =
  useFinanceTransactionStore()



onMounted(
  async () => {

    await store.fetchTransactions()

    await store.fetchStatistics()

  },
)





async function handleSearch(
  keyword:string,
):Promise<void>{


  await store.searchTransactions(
    keyword,
  )

}





async function handleRefresh()
:Promise<void>{


  await store.fetchTransactions()


}





async function handleReset()
:Promise<void>{


  await store.resetFilters()


}





async function handlePageChange(
  page:number,
):Promise<void>{


  await store.setPage(
    page,
  )


}





function handleView(
  transaction:
    FinanceTransaction,
):void{


  router.push(
    `/finance/transaction/${transaction.id}`,
  )


}

// =================================
// 金額格式化
// =================================

function formatMoney(
  amount:number,
  currency:string = 'TWD',
):string{


  const value =
    Number.isFinite(amount)
      ? amount
      : 0



  try{


    return new Intl.NumberFormat(
      'zh-TW',
      {
        style:
          'currency',

        currency,

        maximumFractionDigits:
          0,
      },
    ).format(
      value,
    )


  }catch{


    return `${currency} ${value.toLocaleString()}`


  }


}





// =================================
// 日期格式化
// =================================

function formatDate(
  value:string,
):string{


  if(!value){

    return '-'

  }



  const date =
    new Date(value)



  if(
    Number.isNaN(
      date.getTime(),
    )
  ){

    return '-'

  }



  return date.toLocaleString(
    'zh-TW',
    {

      year:
        'numeric',

      month:
        '2-digit',

      day:
        '2-digit',

      hour:
        '2-digit',

      minute:
        '2-digit',

    },
  )


}

</script>
<template>

  <AdminLayout>

    <div class="finance-page">


      <!-- 標題區 -->
      <section class="page-header">

        <div>

          <h1>
            財務交易管理
          </h1>

          <p>
            Finance Transaction ERP
          </p>

        </div>


        <button
          class="refresh-btn"
          @click="handleRefresh"
        >
          重新整理
        </button>

      </section>





      <!-- 財務摘要 -->

      <section class="summary-grid">


        <div class="summary-card">

          <span>
            總交易筆數
          </span>

          <strong>
            {{ store.statistics.total }}
          </strong>

        </div>



        <div class="summary-card">

          <span>
            收入筆數
          </span>

          <strong>
            {{ store.statistics.income }}
          </strong>

        </div>



        <div class="summary-card">

          <span>
            支出筆數
          </span>

          <strong>
            {{ store.statistics.expense }}
          </strong>

        </div>



        <div class="summary-card">

          <span>
            總金額
          </span>

          <strong>
            {{ store.statistics.totalAmount }}
          </strong>

        </div>


      </section>





      <!-- 搜尋 -->

      <section class="filter-card">


        <input
          v-model="store.filters.keyword"
          placeholder="搜尋交易編號 / 會員 / 電話"
          @keyup.enter="
            handleSearch(
              store.filters.keyword || ''
            )
          "
        />


        <button
          @click="handleSearch(
            store.filters.keyword || ''
          )"
        >
          搜尋
        </button>



        <button
          @click="handleReset"
        >
          重置
        </button>


      </section>





      <!-- 交易列表 -->


      <section class="table-card">


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
                狀態
              </th>


              <th>
                金額
              </th>


              <th>
                建立時間
              </th>


              <th>
                操作
              </th>


            </tr>


          </thead>




          <tbody>


            <tr
              v-for="item in store.transactions"
              :key="item.id"
            >


              <td>
                {{ item.transactionNo }}
              </td>


              <td>
                {{ item.type }}
              </td>


              <td>
                {{ item.status }}
              </td>


              <td>
  {{
    formatMoney(
      item.amount,
      item.currency,
    )
  }}
</td>


              <td>
  {{
    formatDate(
      item.createdAt,
    )
  }}
</td>


              <td>


                <button
                  @click="handleView(item)"
                >
                  查看
                </button>


              </td>


            </tr>



          </tbody>


        </table>



      </section>





      <!-- Pagination -->

      <section class="pagination">


        <button
          :disabled="!store.hasPreviousPage"
          @click="
            handlePageChange(
              store.pagination.page - 1
            )
          "
        >
          上一頁
        </button>



        <span>
          第 {{ store.pagination.page }}
          /
          {{ store.pagination.totalPages }}
          頁
        </span>



        <button
          :disabled="!store.hasNextPage"
          @click="
            handlePageChange(
              store.pagination.page + 1
            )
          "
        >
          下一頁
        </button>


      </section>



    </div>


  </AdminLayout>


</template>
