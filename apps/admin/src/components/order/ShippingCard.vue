<template>
  <section class="shipping-card">
    <header class="shipping-card__header">
      <div>
        <p class="shipping-card__eyebrow">
          SHIPPING INFORMATION
        </p>

        <h2>
          收件與配送資訊
        </h2>

        <p>
          查看收件人、配送地址、物流單號與配送狀態。
        </p>
      </div>

      <span
        class="shipping-status"
        :class="
          `shipping-status--${shippingStatus}`
        "
      >
        {{
          shippingStatusText(
            shippingStatus,
          )
        }}
      </span>
    </header>

    <div class="shipping-card__grid">
      <div class="shipping-field">
        <span>
          收件人
        </span>

        <strong>
          {{
            address?.receiverName ||
            '-'
          }}
        </strong>
      </div>

      <div class="shipping-field">
        <span>
          聯絡電話
        </span>

        <strong>
          {{
            address?.receiverPhone ||
            '-'
          }}
        </strong>
      </div>

      <div class="shipping-field">
        <span>
          國家／地區
        </span>

        <strong>
          {{
            address?.country ||
            '-'
          }}
        </strong>
      </div>

      <div class="shipping-field">
        <span>
          省份／縣市
        </span>

        <strong>
          {{
            formatRegion()
          }}
        </strong>
      </div>

      <div class="shipping-field shipping-field--full">
        <span>
          詳細地址
        </span>

        <strong>
          {{
            address?.address ||
            '-'
          }}
        </strong>
      </div>

      <div class="shipping-field shipping-field--full">
        <span>
          物流單號
        </span>

        <div class="tracking-row">
          <strong class="tracking-number">
            {{
              trackingNo ||
              '尚未建立物流單號'
            }}
          </strong>

          <button
            v-if="trackingNo"
            class="copy-button"
            type="button"
            @click="handleCopyTrackingNo"
          >
            {{
              copied
                ? '已複製'
                : '複製單號'
            }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="copyError"
      class="copy-error"
      role="alert"
    >
      {{ copyError }}
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
} from 'vue'

import type {
  MallShippingAddress,
  MallShippingStatus,
} from '../../types/mall-order'

const props =
  defineProps<{
    address:
      MallShippingAddress | null

    shippingStatus:
      MallShippingStatus

    trackingNo?:
      string | null
  }>()

const copied =
  ref(false)

const copyError =
  ref<string | null>(null)

function formatRegion():
  string {
  const regionParts = [
    props.address?.province,
    props.address?.city,
    props.address?.district,
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(
        value &&
        value.trim(),
      ),
  )

  return regionParts.length > 0
    ? regionParts.join(' / ')
    : '-'
}

function shippingStatusText(
  status: MallShippingStatus,
): string {
  const statusMap:
    Record<MallShippingStatus, string> = {
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

async function handleCopyTrackingNo():
  Promise<void> {
  const normalizedTrackingNo =
    props.trackingNo?.trim()

  if (!normalizedTrackingNo) {
    return
  }

  copyError.value = null
  copied.value = false

  try {
    if (
      !navigator.clipboard ||
      typeof navigator.clipboard
        .writeText !== 'function'
    ) {
      throw new Error(
        '目前瀏覽器不支援剪貼簿功能。',
      )
    }

    await navigator.clipboard
      .writeText(
        normalizedTrackingNo,
      )

    copied.value = true

    window.setTimeout(
      () => {
        copied.value = false
      },
      1800,
    )
  } catch (
    caughtError
  ) {
    copyError.value =
      caughtError instanceof Error
        ? caughtError.message
        : '物流單號複製失敗。'
  }
}
</script>

<style scoped>
.shipping-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.shipping-card__header {
  display: flex;
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.shipping-card__eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.shipping-card__header h2 {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 19px;
}

.shipping-card__header p:last-child {
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.shipping-status {
  display: inline-flex;
  min-height: 30px;
  padding: 5px 11px;
  border-radius: 999px;
  align-items: center;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.shipping-status--pending {
  background: #fef3c7;
  color: #b45309;
}

.shipping-status--packing {
  background: #dbeafe;
  color: #1d4ed8;
}

.shipping-status--shipped {
  background: #e0e7ff;
  color: #4338ca;
}

.shipping-status--delivered {
  background: #dcfce7;
  color: #15803d;
}

.shipping-status--returned {
  background: #fee2e2;
  color: #b91c1c;
}

.shipping-card__grid {
  display: grid;
  padding: 24px;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.shipping-field {
  display: flex;
  min-width: 0;
  padding: 16px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  flex-direction: column;
  gap: 7px;
  background: #f8fafc;
}

.shipping-field--full {
  grid-column: 1 / -1;
}

.shipping-field span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.shipping-field strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.6;
}

.tracking-row {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.tracking-number {
  min-width: 0;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
}

.copy-button {
  min-height: 36px;
  flex-shrink: 0;
  padding: 0 14px;
  border: 1px solid #3157d6;
  border-radius: 9px;
  background: #ffffff;
  color: #3157d6;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}

.copy-button:hover {
  background: #eef2ff;
}

.copy-error {
  margin: 0 24px 24px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
}

@media (max-width: 760px) {
  .shipping-card__header {
    flex-direction: column;
  }

  .shipping-card__grid {
    grid-template-columns: 1fr;
  }

  .shipping-field--full {
    grid-column: auto;
  }

  .tracking-row {
    align-items: stretch;
    flex-direction: column;
  }

  .copy-button {
    width: 100%;
  }
}
</style>