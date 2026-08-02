<template>
  <div class="mall-product-table-wrapper">
    <table class="mall-product-table">
      <thead>
        <tr>
          <th>商品</th>
          <th>商品編號</th>
          <th>分類</th>
          <th>售價</th>
          <th>庫存</th>
          <th>銷量</th>
          <th>狀態</th>
          <th>建立日期</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="product in products"
          :key="product.id"
        >
          <td>
            <div class="product-profile">
              <img
                v-if="product.cover"
                class="product-cover"
                :src="product.cover"
                :alt="product.name"
              >

              <div
                v-else
                class="
                  product-cover
                  product-cover--fallback
                "
              >
                商品
              </div>

              <div class="product-profile__content">
                <strong>
                  {{ product.name }}
                </strong>

                <small>
                  {{
                    product.subtitle ||
                    '尚未設定商品副標題'
                  }}
                </small>
              </div>
            </div>
          </td>

          <td>
            <span class="product-code">
              {{
                product.productCode ||
                '尚未建立'
              }}
            </span>
          </td>

          <td>
            {{
              product.categoryName ||
              '未分類'
            }}
          </td>

          <td>
            <div class="price-info">
              <strong>
                {{
                  formatCurrency(
                    product.price,
                  )
                }}
              </strong>

              <small
                v-if="
                  product.originalPrice &&
                  product.originalPrice >
                    product.price
                "
              >
                原價
                {{
                  formatCurrency(
                    product.originalPrice,
                  )
                }}
              </small>
            </div>
          </td>

          <td>
            <span
              class="stock-value"
              :class="{
                'stock-value--warning':
                  product.stock <= 10,
              }"
            >
              {{
                product.stock
                  .toLocaleString()
              }}
            </span>
          </td>

          <td>
            {{
              product.sales
                .toLocaleString()
            }}
          </td>

          <td>
            <MallStatusBadge
              :status="product.status"
            />
          </td>

          <td>
            {{
              formatDate(
                product.createdAt,
              )
            }}
          </td>

          <td>
            <div class="action-buttons">
              <button
                class="text-button"
                type="button"
                @click="
                  emit(
                    'view',
                    product.id,
                  )
                "
              >
                查看
              </button>

              <button
                class="text-button"
                type="button"
                @click="
                  emit(
                    'edit',
                    product.id,
                  )
                "
              >
                編輯
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import MallStatusBadge from './MallStatusBadge.vue'

import type {
  MallProduct,
} from '../../types/mall'

interface Props {
  products: MallProduct[]
}

defineProps<Props>()

const emit =
  defineEmits<{
    view: [productId: string]
    edit: [productId: string]
  }>()

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'zh-TW',
    {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(date)
}
</script>

<style scoped>
.mall-product-table-wrapper {
  overflow-x: auto;
}

.mall-product-table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.mall-product-table th,
.mall-product-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.mall-product-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.mall-product-table td {
  color: #334155;
  font-size: 14px;
}

.mall-product-table tbody tr {
  transition:
    background-color 0.2s ease;
}

.mall-product-table tbody tr:hover {
  background: #f8fafc;
}

.product-profile {
  display: flex;
  min-width: 260px;
  align-items: center;
  gap: 12px;
}

.product-cover {
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  object-fit: cover;
}

.product-cover--fallback {
  display: grid;
  place-items: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.product-profile__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.product-profile__content strong {
  max-width: 220px;
  overflow: hidden;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
}

.product-profile__content small {
  max-width: 220px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
}

.product-code {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 12px;
  font-weight: 700;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-info strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.price-info small {
  color: #94a3b8;
  font-size: 11px;
  text-decoration: line-through;
}

.stock-value {
  color: #334155;
  font-weight: 800;
}

.stock-value--warning {
  color: #b45309;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-button {
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: #eef2ff;
  color: #3157d6;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
}

.text-button:hover {
  background: #dfe6ff;
}
</style>