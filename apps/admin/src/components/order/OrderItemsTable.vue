<template>
  <div class="order-items">
    <div
      v-if="items.length === 0"
      class="empty-state"
    >
      <div class="empty-state__icon">
        商品
      </div>

      <strong>
        尚無商品明細
      </strong>

      <p>
        此訂單目前沒有可顯示的商品資料。
      </p>
    </div>

    <div
      v-else
      class="table-wrapper"
    >
      <table class="items-table">
        <thead>
          <tr>
            <th>
              商品
            </th>

            <th>
              商品編號
            </th>

            <th>
              單價
            </th>

            <th>
              數量
            </th>

            <th>
              小計
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
          >
            <td>
              <div class="product-cell">
                <div class="product-cover">
                  <img
                    v-if="item.cover"
                    :src="item.cover"
                    :alt="item.productName"
                    loading="lazy"
                    @error="handleImageError"
                  >

                  <span v-else>
                    {{
                      getProductInitial(
                        item.productName,
                      )
                    }}
                  </span>
                </div>

                <div class="product-content">
                  <strong>
                    {{
                      item.productName ||
                      '未命名商品'
                    }}
                  </strong>

                  <small>
                    商品 ID：
                    {{
                      item.productId ||
                      '-'
                    }}
                  </small>
                </div>
              </div>
            </td>

            <td>
              <span class="product-code">
                {{
                  item.productCode ||
                  '-'
                }}
              </span>
            </td>

            <td>
              <strong class="money-value">
                {{
                  formatMoney(
                    item.price,
                    item.currency,
                  )
                }}
              </strong>
            </td>

            <td>
              <span class="quantity-value">
                {{ item.quantity }}
              </span>
            </td>

            <td>
              <strong class="subtotal-value">
                {{
                  formatMoney(
                    item.subtotal,
                    item.currency,
                  )
                }}
              </strong>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td colspan="3">
              商品合計
            </td>

            <td>
              {{ totalQuantity }}
            </td>

            <td>
              <strong>
                {{
                  formatMoney(
                    totalSubtotal,
                    summaryCurrency,
                  )
                }}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
} from 'vue'

import type {
  MallOrderItem,
} from '../../types/mall-order'

const props =
  defineProps<{
    items:
      MallOrderItem[]
  }>()

const totalQuantity =
  computed(() =>
    props.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        normalizeNumber(
          item.quantity,
        ),
      0,
    ),
  )

const totalSubtotal =
  computed(() =>
    props.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        normalizeNumber(
          item.subtotal,
        ),
      0,
    ),
  )

const summaryCurrency =
  computed(() =>
    props.items[0]?.currency ||
    'TWD',
  )

function normalizeNumber(
  value: number,
): number {
  return Number.isFinite(value)
    ? value
    : 0
}

function formatMoney(
  amount: number,
  currency: string,
): string {
  const normalizedAmount =
    normalizeNumber(amount)

  const normalizedCurrency =
    currency ||
    'TWD'

  try {
    return new Intl.NumberFormat(
      'zh-TW',
      {
        style:
          'currency',

        currency:
          normalizedCurrency,

        maximumFractionDigits:
          0,
      },
    ).format(
      normalizedAmount,
    )
  } catch {
    return `${normalizedCurrency} ${normalizedAmount.toLocaleString(
      'zh-TW',
    )}`
  }
}

function getProductInitial(
  productName: string,
): string {
  const normalizedName =
    productName.trim()

  return normalizedName
    ? normalizedName
        .slice(0, 1)
        .toUpperCase()
    : '商'
}

function handleImageError(
  event: Event,
): void {
  const imageElement =
    event.target as HTMLImageElement

  imageElement.style.display =
    'none'
}
</script>

<style scoped>
.order-items {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.items-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.items-table tbody tr {
  transition:
    background-color 0.2s ease;
}

.items-table tbody tr:hover {
  background: #f8fafc;
}

.product-cell {
  display: flex;
  min-width: 280px;
  align-items: center;
  gap: 14px;
}

.product-cover {
  display: grid;
  width: 52px;
  height: 52px;
  overflow: hidden;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 18px;
  font-weight: 900;
}

.product-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.product-content strong {
  overflow: hidden;
  max-width: 280px;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-content small {
  overflow: hidden;
  max-width: 280px;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-code {
  color: #475569;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 13px;
}

.money-value {
  color: #334155;
}

.quantity-value {
  display: inline-flex;
  min-width: 36px;
  min-height: 30px;
  padding: 4px 10px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.subtotal-value {
  color: #0f172a;
  font-weight: 900;
}

.items-table tfoot td {
  border-bottom: 0;
  background: #f8fafc;
  color: #475569;
  font-weight: 800;
}

.items-table tfoot td:first-child {
  text-align: right;
}

.items-table tfoot td:last-child {
  color: #0f172a;
}

.empty-state {
  display: flex;
  min-height: 260px;
  padding: 48px 24px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border-radius: 22px;
  background: #eef2ff;
  color: #3157d6;
  font-weight: 900;
}

.empty-state strong {
  margin-top: 18px;
  color: #0f172a;
  font-size: 17px;
}

.empty-state p {
  margin: 8px 0 0;
  color: #94a3b8;
}

@media (max-width: 760px) {
  .items-table th,
  .items-table td {
    padding-right: 14px;
    padding-left: 14px;
  }

  .product-cell {
    min-width: 240px;
  }

  .product-content strong,
  .product-content small {
    max-width: 200px;
  }
}
</style>