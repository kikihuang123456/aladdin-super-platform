<template>
  <div class="dealer-performance-page">
    <section class="page-header">
      <div>
        <p class="page-header__eyebrow">
          Dealer ERP
        </p>

        <h1>
          經銷商業績與團隊管理
        </h1>

        <p class="page-header__description">
          查詢經銷商個人業績、團隊人數、直屬成員與上級經銷商資料。
        </p>
      </div>
    </section>

    <section class="search-card">
      <label
        class="search-card__label"
        for="dealer-id"
      >
        經銷商 ID
      </label>

      <div class="search-card__controls">
        <input
          id="dealer-id"
          v-model="dealerId"
          type="text"
          placeholder="請輸入經銷商 UUID"
          :disabled="performanceStore.isLoading"
          @keyup.enter="handleSearch"
        >

        <button
          type="button"
          :disabled="
            performanceStore.isLoading ||
            !dealerId.trim()
          "
          @click="handleSearch"
        >
          {{
            performanceStore.isLoading
              ? '載入中...'
              : '查詢業績'
          }}
        </button>
      </div>
    </section>

    <section
      v-if="performanceStore.error"
      class="message-card message-card--error"
    >
      <strong>
        載入失敗
      </strong>

      <p>
        {{ performanceStore.error }}
      </p>
    </section>

    <section
      v-else-if="performanceStore.isLoading"
      class="message-card"
    >
      正在載入經銷商團隊業績資料...
    </section>

    <template
      v-else-if="performanceStore.performance"
    >
      <section class="dealer-card">
        <div class="dealer-card__header">
          <div>
            <p class="dealer-card__number">
              {{ performanceStore.dealer?.dealerNo }}
            </p>

            <h2>
              {{ performanceStore.dealer?.name }}
            </h2>
          </div>

          <span class="status-badge">
            {{ performanceStore.dealer?.status }}
          </span>
        </div>

        <div class="dealer-card__grid">
          <div>
            <span>市場</span>
            <strong>
              {{ performanceStore.dealer?.market }}
            </strong>
          </div>

          <div>
            <span>等級</span>
            <strong>
              {{ performanceStore.dealer?.level }}
            </strong>
          </div>

          <div>
            <span>手機</span>
            <strong>
              {{ performanceStore.dealer?.phone ?? '未設定' }}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>
              {{ performanceStore.dealer?.email ?? '未設定' }}
            </strong>
          </div>
        </div>
      </section>

      <section class="statistics-grid">
        <article class="stat-card">
          <span>
            直屬人數
          </span>

          <strong>
            {{ performanceStore.statistics.directCount }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            團隊人數
          </span>

          <strong>
            {{ performanceStore.statistics.teamCount }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            團隊業績
          </span>

          <strong>
            {{
              formatCurrency(
                performanceStore.statistics.teamSales,
              )
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>
            累計佣金
          </span>

          <strong>
            {{
              formatCurrency(
                performanceStore.statistics.totalCommission,
              )
            }}
          </strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <div class="panel__header">
            <h2>
              上級經銷商
            </h2>
          </div>

          <div
            v-if="performanceStore.parentDealer"
            class="parent-card"
          >
            <strong>
              {{ performanceStore.parentDealer.name }}
            </strong>

            <span>
              {{ performanceStore.parentDealer.dealerNo }}
            </span>

            <span>
              {{ performanceStore.parentDealer.phone ?? '未設定手機' }}
            </span>

            <span>
              團隊業績：
              {{
                formatCurrency(
                  performanceStore.parentDealer.teamSales,
                )
              }}
            </span>
          </div>

          <p
            v-else
            class="empty-state"
          >
            此經銷商目前沒有上級經銷商。
          </p>
        </article>

        <article class="panel">
          <div class="panel__header">
            <h2>
              直屬團隊
            </h2>

            <span>
              共 {{ performanceStore.directDealers.length }} 人
            </span>
          </div>

          <div
            v-if="performanceStore.directDealers.length === 0"
            class="empty-state"
          >
            目前沒有直屬經銷商。
          </div>

          <div
            v-else
            class="team-table-wrapper"
          >
            <table class="team-table">
              <thead>
                <tr>
                  <th>經銷商</th>
                  <th>聯絡方式</th>
                  <th>等級</th>
                  <th>直屬人數</th>
                  <th>團隊人數</th>
                  <th>團隊業績</th>
                  <th>加入時間</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="member in performanceStore.directDealers"
                  :key="member.id"
                >
                  <td>
                    <strong>
                      {{ member.name }}
                    </strong>

                    <small>
                      {{ member.dealerNo }}
                    </small>
                  </td>

                  <td>
                    <span>
                      {{ member.phone ?? '未設定手機' }}
                    </span>

                    <small>
                      {{ member.email ?? '未設定 Email' }}
                    </small>
                  </td>

                  <td>
                    {{ member.level }}
                  </td>

                  <td>
                    {{ member.directCount }}
                  </td>

                  <td>
                    {{ member.teamCount }}
                  </td>

                  <td>
                    {{ formatCurrency(member.teamSales) }}
                  </td>

                  <td>
                    {{ formatDate(member.joinedAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </template>

    <section
      v-else
      class="message-card"
    >
      請輸入經銷商 ID 後查詢。
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  onBeforeUnmount,
  ref,
} from 'vue'

import {
  useDealerPerformanceStore,
} from '../../stores/dealer-performance'


const performanceStore =
  useDealerPerformanceStore()


const dealerId =
  ref('')


async function handleSearch():
Promise<void> {

  await performanceStore.fetchPerformance(
    dealerId.value,
  )

}


function formatCurrency(
  value: number,
): string {

  return new Intl.NumberFormat(
    'zh-TW',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value)

}


function formatDate(
  value?: string | null,
): string {

  if (
    !value
  ) {

    return '—'

  }


  const date =
    new Date(value)


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return value

  }


  return date.toLocaleString(
    'zh-TW',
  )

}


onBeforeUnmount(() => {
  performanceStore.clearPerformance()
})
</script>

<style scoped>
.dealer-performance-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header,
.search-card,
.dealer-card,
.panel,
.message-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.page-header__eyebrow {
  margin: 0 0 8px;
  color: #3157d6;
  font-weight: 700;
}

.page-header h1,
.dealer-card h2,
.panel h2 {
  margin: 0;
}

.page-header__description {
  margin: 10px 0 0;
  color: #64748b;
}

.search-card__label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
}

.search-card__controls {
  display: flex;
  gap: 12px;
}

.search-card input {
  min-width: 0;
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font: inherit;
}

.search-card button {
  padding: 12px 20px;
  border: 0;
  border-radius: 10px;
  background: #3157d6;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.search-card button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.message-card {
  color: #475569;
  text-align: center;
}

.message-card--error {
  border-color: #fecaca;
  background: #fff7f7;
  color: #b91c1c;
}

.message-card p {
  margin: 8px 0 0;
}

.dealer-card__header,
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dealer-card__number {
  margin: 0 0 6px;
  color: #64748b;
}

.status-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 700;
}

.dealer-card__grid,
.statistics-grid {
  display: grid;
  gap: 16px;
}

.dealer-card__grid {
  margin-top: 22px;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
}

.dealer-card__grid div,
.stat-card {
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
}

.dealer-card__grid span,
.stat-card span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.statistics-grid {
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
}

.stat-card {
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.stat-card strong {
  font-size: 26px;
}

.content-grid {
  display: grid;
  grid-template-columns:
    minmax(260px, 0.8fr)
    minmax(0, 2.2fr);
  gap: 24px;
}

.panel__header span {
  color: #64748b;
}

.parent-card {
  display: flex;
  margin-top: 20px;
  padding: 18px;
  border-radius: 14px;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}

.parent-card span {
  color: #64748b;
}

.empty-state {
  margin: 20px 0 0;
  color: #64748b;
  text-align: center;
}

.team-table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
}

.team-table {
  width: 100%;
  border-collapse: collapse;
}

.team-table th,
.team-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.team-table th {
  color: #475569;
  font-size: 13px;
}

.team-table td strong,
.team-table td span,
.team-table td small {
  display: block;
}

.team-table td small {
  margin-top: 5px;
  color: #64748b;
}

@media (
  max-width: 1100px
) {
  .dealer-card__grid,
  .statistics-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (
  max-width: 680px
) {
  .search-card__controls {
    flex-direction: column;
  }

  .dealer-card__grid,
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
