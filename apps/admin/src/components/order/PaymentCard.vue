<template>
  <section class="payment-card">
    <header class="payment-card__header">
      <div>
        <p class="eyebrow">
          PAYMENT INFORMATION
        </p>

        <h2>
          付款資訊
        </h2>
      </div>

      <span
        class="status"
        :class="`status--${paymentStatus}`"
      >
        {{ paymentStatusText }}
      </span>
    </header>

    <div class="payment-grid">
      <div class="item">
        <span>付款方式</span>

        <strong>
          {{ paymentMethodText }}
        </strong>
      </div>

      <div class="item">
        <span>商品金額</span>

        <strong>
          {{ formatMoney(totalAmount) }}
        </strong>
      </div>

      <div class="item">
        <span>折扣金額</span>

        <strong>
          {{ formatMoney(discountAmount) }}
        </strong>
      </div>

      <div class="item">
        <span>運費</span>

        <strong>
          {{ formatMoney(shippingFee) }}
        </strong>
      </div>

      <div class="item item--total">
        <span>應付金額</span>

        <strong>
          {{ formatMoney(payableAmount) }}
        </strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  MallPaymentMethod,
  MallPaymentStatus,
} from '../../types/mall-order'

const props =
  defineProps<{

    paymentMethod?:
      MallPaymentMethod | null

    paymentStatus:
      MallPaymentStatus

    totalAmount:number

    discountAmount?:
      number | null

    shippingFee?:
      number | null

    payableAmount:number

    currency:string

  }>()

const paymentMethodText =
  computed(() => {

    switch (
      props.paymentMethod
    ) {

      case 'wechat':
        return '微信支付'

      case 'alipay':
        return '支付寶'

      case 'linepay':
        return 'LINE Pay'

      case 'unionpay':
        return '銀聯'

      case 'bank_transfer':
        return '銀行轉帳'

      case 'atm':
        return 'ATM'

      default:
        return '其他'
    }

  })

const paymentStatusText =
  computed(() => {

    switch (
      props.paymentStatus
    ) {

      case 'paid':
        return '已付款'

      case 'failed':
        return '付款失敗'

      case 'refunded':
        return '已退款'

      default:
        return '未付款'
    }

  })

function formatMoney(
  amount:number | null | undefined,
){

  return new Intl.NumberFormat(
    'zh-TW',
    {

      style:'currency',

      currency:
        props.currency ||

        'TWD',

      maximumFractionDigits:0,

    },

  ).format(
    amount ?? 0,
  )

}
</script>

<style scoped>

.payment-card{

border:1px solid #e5e7eb;

border-radius:18px;

background:white;

overflow:hidden;

}

.payment-card__header{

display:flex;

justify-content:space-between;

align-items:center;

padding:22px 24px;

border-bottom:1px solid #eef2f7;

}

.eyebrow{

margin:0;

font-size:12px;

font-weight:800;

color:#3157d6;

}

.payment-card__header h2{

margin-top:6px;

font-size:20px;

}

.status{

padding:6px 14px;

border-radius:999px;

font-size:13px;

font-weight:700;

background:#f1f5f9;

}

.status--paid{

background:#dcfce7;

color:#15803d;

}

.status--failed{

background:#fee2e2;

color:#b91c1c;

}

.status--refunded{

background:#fef3c7;

color:#b45309;

}

.status--unpaid{

background:#e2e8f0;

}

.payment-grid{

display:grid;

grid-template-columns:
repeat(2,1fr);

gap:18px;

padding:24px;

}

.item{

display:flex;

flex-direction:column;

gap:8px;

padding:18px;

border:1px solid #eef2f7;

border-radius:12px;

background:#f8fafc;

}

.item span{

font-size:12px;

color:#64748b;

}

.item strong{

font-size:18px;

}

.item--total{

grid-column:1/-1;

background:#eef2ff;

}

@media(max-width:768px){

.payment-grid{

grid-template-columns:1fr;

}

.item--total{

grid-column:auto;

}

}

</style>