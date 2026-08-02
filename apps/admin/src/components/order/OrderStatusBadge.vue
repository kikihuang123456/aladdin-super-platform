<template>
  <span
    class="status-badge"
    :class="badgeClass"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import {
  computed,
} from 'vue'

import type {
  MallOrderStatus,
  MallPaymentStatus,
  MallShippingStatus,
} from '../../types/mall-order'

type StatusType =
  | 'order'
  | 'payment'
  | 'shipping'

type StatusValue =
  | MallOrderStatus
  | MallPaymentStatus
  | MallShippingStatus

const props =
  withDefaults(
    defineProps<{
      type:
        StatusType

      status:
        StatusValue
    }>(),
    {
      type:
        'order',
    },
  )

const statusText =
  computed(() => {
    if (
      props.type ===
      'payment'
    ) {
      return getPaymentStatusText(
        props.status as
          MallPaymentStatus,
      )
    }

    if (
      props.type ===
      'shipping'
    ) {
      return getShippingStatusText(
        props.status as
          MallShippingStatus,
      )
    }

    return getOrderStatusText(
      props.status as
        MallOrderStatus,
    )
  })

const badgeClass =
  computed(() => {
    return [
      `status-badge--${props.type}`,
      `status-badge--${props.status}`,
    ]
  })

function getOrderStatusText(
  status:
    MallOrderStatus,
): string {
  const statusMap:
    Record<
      MallOrderStatus,
      string
    > = {
      pending_payment:
        '待付款',

      paid:
        '已付款',

      processing:
        '處理中',

      shipped:
        '已出貨',

      completed:
        '已完成',

      cancelled:
        '已取消',

      refunded:
        '已退款',
    }

  return statusMap[status]
}

function getPaymentStatusText(
  status:
    MallPaymentStatus,
): string {
  const statusMap:
    Record<
      MallPaymentStatus,
      string
    > = {
      unpaid:
        '未付款',

      paid:
        '已付款',

      failed:
        '付款失敗',

      refunded:
        '已退款',
    }

  return statusMap[status]
}

function getShippingStatusText(
  status:
    MallShippingStatus,
): string {
  const statusMap:
    Record<
      MallShippingStatus,
      string
    > = {
      pending:
        '待處理',

      packing:
        '備貨中',

      shipped:
        '已出貨',

      delivered:
        '已送達',

      returned:
        '已退回',
    }

  return statusMap[status]
}
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  min-height: 28px;
  padding: 5px 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.status-badge--pending_payment,
.status-badge--unpaid,
.status-badge--pending {
  border-color: #fde68a;
  background: #fef3c7;
  color: #b45309;
}

.status-badge--paid,
.status-badge--completed,
.status-badge--delivered {
  border-color: #bbf7d0;
  background: #dcfce7;
  color: #15803d;
}

.status-badge--processing,
.status-badge--packing {
  border-color: #bfdbfe;
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--shipped {
  border-color: #c7d2fe;
  background: #e0e7ff;
  color: #4338ca;
}

.status-badge--cancelled,
.status-badge--failed,
.status-badge--returned {
  border-color: #fecaca;
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge--refunded {
  border-color: #e9d5ff;
  background: #f3e8ff;
  color: #7e22ce;
}
</style>