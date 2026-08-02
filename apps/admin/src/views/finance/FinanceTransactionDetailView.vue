<template>
  <AdminLayout>
    <div class="detail-page">
      <section class="page-header">
        <div>
          <p class="eyebrow">
            FINANCE TRANSACTION ERP
          </p>

          <h1>
            交易詳情
          </h1>

          <p class="description">
            查看財務交易編號、會員、金額、狀態與建立時間。
          </p>
        </div>

        <button
          class="back-button"
          type="button"
          @click="handleBack"
        >
          返回交易列表
        </button>
      </section>

      <section
        v-if="store.loading"
        class="state-card"
      >
        正在載入交易資料...
      </section>

      <section
        v-else-if="store.error"
        class="error-card"
        role="alert"
      >
        <strong>
          交易資料載入失敗
        </strong>

        <p>
          {{ store.error }}
        </p>

        <button
          type="button"
          @click="loadTransaction"
        >
          重新載入
        </button>
      </section>

      <template v-else-if="transaction">
        <section class="summary-card">
          <div>
            <span>
              交易編號
            </span>

            <strong>
              {{ transaction.transactionNo }}
            </strong>
          </div>

          <div>
            <span>
              交易類型
            </span>

            <strong>
              {{ transactionTypeText }}
            </strong>
          </div>

          <div>
            <span>
              交易狀態
            </span>

            <strong>
              {{ transactionStatusText }}
            </strong>
          </div>

          <div>
            <span>
              交易金額
            </span>

            <strong class="amount">
              {{
                formatMoney(
                  transaction.amount,
                  transaction.currency,
                )
              }}
            </strong>
          </div>
        </section>

        <section class="detail-card">
          <header>
            <div>
              <p>
                TRANSACTION INFORMATION
              </p>

              <h2>
                基本資料
              </h2>
            </div>
          </header>

          <div class="detail-grid">
            <div>
              <span>
                會員名稱
              </span>

              <strong>
                {{ transaction.memberName || '-' }}
              </strong>
            </div>

            <div>
              <span>
                會員電話
              </span>

              <strong>
                {{ transaction.phone || '-' }}
              </strong>
            </div>

            <div>
              <span>
                會員 ID
              </span>

              <strong>
                {{ transaction.memberId || '-' }}
              </strong>
            </div>

            <div>
              <span>
                幣別
              </span>

              <strong>
                {{ transaction.currency }}
              </strong>
            </div>

            <div>
              <span>
                建立時間
              </span>

              <strong>
                {{
                  formatDate(
                    transaction.createdAt,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                更新時間
              </span>

              <strong>
                {{
                  formatDate(
                    transaction.updatedAt,
                  )
                }}
              </strong>
            </div>

            <div class="full">
              <span>
                備註
              </span>

              <strong>
                {{ transaction.remark || '-' }}
              </strong>
            </div>
          </div>
        </section>
      </template>

      <section
        v-else
        class="state-card"
      >
        查無此交易資料。
      </section>
    </div>
  </AdminLayout>
</template>
<script setup lang="ts">

import {
  computed,
  onMounted,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AdminLayout
  from '../../layouts/AdminLayout.vue'

import {
  useFinanceTransactionStore,
} from '../../stores/finance-transaction'



const route =
  useRoute()

const router =
  useRouter()

const store =
  useFinanceTransactionStore()



const transactionId =
  computed(
    () =>
      String(
        route.params.id ?? '',
      ),
  )



const transaction =
  computed(
    () =>
      store.currentTransaction,
  )



onMounted(
  async () => {

    await loadTransaction()

  },
)





async function loadTransaction()
:Promise<void>{

  if(
    !transactionId.value
  ){

    return

  }

  await store.fetchTransactionDetail(
    transactionId.value,
  )

}





function handleBack()
:void{

  router.push(
    '/finance/transactions',
  )

}





const transactionTypeText =
computed(
  () => {

    switch(
      transaction.value?.type
    ){

      case 'income':

        return '收入'

      case 'expense':

        return '支出'

      case 'settlement':

        return '結算'

      case 'withdraw':

        return '提款'

      case 'deposit':

        return '儲值'

      default:

        return '-'

    }

  },
)





const transactionStatusText =
computed(
  () => {

    switch(
      transaction.value?.status
    ){

      case 'pending':

        return '待處理'

      case 'completed':

        return '已完成'

      case 'failed':

        return '失敗'

      case 'cancelled':

        return '已取消'

      default:

        return '-'

    }

  },
)





function formatMoney(
  amount:number,
  currency:string='TWD',
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

    return `${currency} ${value.toLocaleString(
      'zh-TW',
    )}`

  }

}





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
<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 8px 0;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
}

.description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.back-button {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.back-button:hover {
  border-color: #3157d6;
  color: #3157d6;
}

.state-card,
.error-card {
  padding: 40px 24px;
  border-radius: 18px;
  text-align: center;
}

.state-card {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #64748b;
}

.error-card {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.error-card strong {
  display: block;
  font-size: 17px;
}

.error-card p {
  margin: 8px 0 18px;
}

.error-card button {
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid #dc2626;
  border-radius: 9px;
  background: #ffffff;
  color: #b91c1c;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.summary-card {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card > div {
  display: flex;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
}

.summary-card span {
  color: #64748b;
  font-size: 13px;
}

.summary-card strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 20px;
}

.summary-card .amount {
  color: #3157d6;
  font-size: 26px;
}

.detail-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.detail-card header {
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
}

.detail-card header p {
  margin: 0;
  color: #3157d6;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.detail-card header h2 {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 20px;
}

.detail-grid {
  display: grid;
  padding: 24px;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-grid > div {
  display: flex;
  min-width: 0;
  padding: 16px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}

.detail-grid span {
  color: #64748b;
  font-size: 12px;
}

.detail-grid strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.6;
}

.detail-grid .full {
  grid-column: 1 / -1;
}

@media (max-width: 1100px) {
  .summary-card {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }

  .summary-card,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid .full {
    grid-column: auto;
  }
}
</style>