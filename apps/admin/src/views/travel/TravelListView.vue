<template>
  <AdminLayout>
    <div class="travel-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            TRAVEL MANAGEMENT
          </p>

          <h1>
            文旅管理
          </h1>

          <p class="page-description">
            管理旅遊行程、出團日期、報名人數、飯店、交通與雙市場銷售狀態。
          </p>
        </div>

        <button
          class="primary-button"
          type="button"
        >
          新增行程
        </button>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>行程總數</span>
          <strong>128</strong>
          <small>全部旅遊商品</small>
        </article>

        <article class="summary-card">
          <span>即將出團</span>
          <strong>24</strong>
          <small>未來 30 天內出團</small>
        </article>

        <article class="summary-card">
          <span>累計報名</span>
          <strong>3,486</strong>
          <small>全部有效旅客</small>
        </article>

        <article class="summary-card">
          <span>待確認</span>
          <strong>86</strong>
          <small>等待付款或資料確認</small>
        </article>
      </section>

      <section class="travel-card">
        <div class="table-toolbar">
          <div>
            <h2>
              行程列表
            </h2>

            <p>
              目前為 Sprint 2 靜態展示資料
            </p>
          </div>

          <div class="toolbar-actions">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜尋行程名稱、編號或城市"
            >

            <select
              v-model="marketFilter"
              class="filter-select"
            >
              <option value="">
                全部市場
              </option>

              <option value="台灣市場">
                台灣市場
              </option>

              <option value="中國大陸市場">
                中國大陸市場
              </option>
            </select>

            <select
              v-model="statusFilter"
              class="filter-select"
            >
              <option value="">
                全部狀態
              </option>

              <option value="招生中">
                招生中
              </option>

              <option value="即將成團">
                即將成團
              </option>

              <option value="已滿團">
                已滿團
              </option>

              <option value="已結束">
                已結束
              </option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>行程</th>
                <th>行程編號</th>
                <th>市場</th>
                <th>出團日期</th>
                <th>天數</th>
                <th>飯店等級</th>
                <th>團費</th>
                <th>報名人數</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="travel in filteredTravels"
                :key="travel.id"
              >
                <td>
                  <div class="travel-info">
                    <span class="travel-icon">
                      {{ travel.shortName }}
                    </span>

                    <div>
                      <strong>
                        {{ travel.name }}
                      </strong>

                      <small>
                        {{ travel.route }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {{ travel.code }}
                </td>

                <td>
                  {{ travel.market }}
                </td>

                <td>
                  {{ travel.departureDate }}
                </td>

                <td>
                  {{ travel.days }} 天
                </td>

                <td>
                  {{ travel.hotelLevel }}
                </td>

                <td>
                  {{ formatCurrency(travel.price) }}
                </td>

                <td>
                  <span
                    class="capacity"
                    :class="{
                      'capacity--full':
                        travel.registered >= travel.capacity,
                    }"
                  >
                    {{ travel.registered }}
                    /
                    {{ travel.capacity }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(travel.status)"
                  >
                    {{ travel.status }}
                  </span>
                </td>

                <td>
                  <button
                    class="text-button"
                    type="button"
                  >
                    查看
                  </button>
                </td>
              </tr>

              <tr v-if="filteredTravels.length === 0">
                <td
                  class="empty-state"
                  colspan="10"
                >
                  找不到符合條件的行程資料
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import AdminLayout from '../../layouts/AdminLayout.vue'

type TravelMarket =
  | '台灣市場'
  | '中國大陸市場'

type TravelStatus =
  | '招生中'
  | '即將成團'
  | '已滿團'
  | '已結束'

interface TravelRow {
  id: number
  code: string
  name: string
  shortName: string
  route: string
  market: TravelMarket
  departureDate: string
  days: number
  hotelLevel: string
  price: number
  registered: number
  capacity: number
  status: TravelStatus
}

const keyword = ref('')
const marketFilter = ref<TravelMarket | ''>('')
const statusFilter = ref<TravelStatus | ''>('')

const travels: TravelRow[] = [
  {
    id: 1,
    code: 'TRV-100001',
    name: '杭州西湖・烏鎮五天四夜',
    shortName: '杭',
    route: '杭州・西湖・烏鎮',
    market: '台灣市場',
    departureDate: '2026-08-20',
    days: 5,
    hotelLevel: '五星級',
    price: 19800,
    registered: 42,
    capacity: 50,
    status: '即將成團',
  },
  {
    id: 2,
    code: 'TRV-100002',
    name: '景德鎮陶瓷文化深度遊',
    shortName: '瓷',
    route: '景德鎮・陶瓷博物館',
    market: '台灣市場',
    departureDate: '2026-09-12',
    days: 4,
    hotelLevel: '五星級',
    price: 16800,
    registered: 28,
    capacity: 40,
    status: '招生中',
  },
  {
    id: 3,
    code: 'TRV-100003',
    name: '濟南市場交流考察團',
    shortName: '濟',
    route: '濟南・濟寧・泰安',
    market: '中國大陸市場',
    departureDate: '2026-08-15',
    days: 3,
    hotelLevel: '四星級',
    price: 6800,
    registered: 35,
    capacity: 35,
    status: '已滿團',
  },
  {
    id: 4,
    code: 'TRV-100004',
    name: '千島湖企業招商交流行程',
    shortName: '湖',
    route: '千島湖・杭州',
    market: '中國大陸市場',
    departureDate: '2026-06-18',
    days: 3,
    hotelLevel: '五星級',
    price: 8800,
    registered: 58,
    capacity: 60,
    status: '已結束',
  },
]

const filteredTravels = computed(() => {
  const normalizedKeyword =
    keyword.value.toLowerCase()

  return travels.filter((travel) => {
    const matchesKeyword =
      !normalizedKeyword ||
      travel.name
        .toLowerCase()
        .includes(normalizedKeyword) ||
      travel.code
        .toLowerCase()
        .includes(normalizedKeyword) ||
      travel.route
        .toLowerCase()
        .includes(normalizedKeyword)

    const matchesMarket =
      !marketFilter.value ||
      travel.market === marketFilter.value

    const matchesStatus =
      !statusFilter.value ||
      travel.status === statusFilter.value

    return (
      matchesKeyword &&
      matchesMarket &&
      matchesStatus
    )
  })
})

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

function getStatusClass(
  status: TravelStatus,
): string {
  switch (status) {
    case '招生中':
      return 'status-badge--success'

    case '即將成團':
      return 'status-badge--warning'

    case '已滿團':
      return 'status-badge--primary'

    case '已結束':
      return 'status-badge--neutral'
  }
}
</script>

<style scoped>
.travel-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-header h1 {
  margin: 4px 0 8px;
  color: #0f172a;
  font-size: 34px;
}

.page-eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.page-description {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.primary-button {
  flex-shrink: 0;
  padding: 12px 20px;
  border: 0;
  border-radius: 12px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.summary-card {
  display: flex;
  min-height: 140px;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.05);
}

.summary-card span {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.summary-card strong {
  margin: 14px 0 8px;
  color: #0f172a;
  font-size: 32px;
}

.summary-card small {
  color: #94a3b8;
}

.travel-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.05);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-toolbar h2 {
  margin: 0;
  color: #0f172a;
}

.table-toolbar p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.search-input,
.filter-select {
  min-height: 42px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  outline: none;
}

.search-input {
  width: 280px;
  padding: 0 14px;
}

.filter-select {
  padding: 0 12px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  white-space: nowrap;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

td {
  color: #334155;
  font-size: 14px;
}

tbody tr:hover {
  background: #f8fafc;
}

.travel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.travel-info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.travel-info strong {
  color: #0f172a;
}

.travel-info small {
  color: #94a3b8;
}

.travel-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-weight: 800;
}

.capacity {
  color: #334155;
  font-weight: 700;
}

.capacity--full {
  color: #dc2626;
}

.status-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge--success {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--warning {
  background: #fef3c7;
  color: #b45309;
}

.status-badge--primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge--neutral {
  background: #e2e8f0;
  color: #475569;
}

.text-button {
  padding: 7px 12px;
  border: 0;
  border-radius: 8px;
  background: #eef2ff;
  color: #3157d6;
  cursor: pointer;
  font-weight: 700;
}

.empty-state {
  padding: 42px;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
</style>