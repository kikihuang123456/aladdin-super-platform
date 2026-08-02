<template>
  <AdminLayout>
    <div class="ai-page">
      <section class="page-header">
        <div>
          <p class="page-eyebrow">
            AI CENTER
          </p>

          <h1>
            AI 智能中心
          </h1>

          <p class="page-description">
            集中管理 AI 助手、AI 客服、AI 商品文案、AI 翻譯、AI 行銷與知識庫。
          </p>
        </div>

        <button
          v-if="permissionStore.hasPermission('ai.manage')"
          class="primary-button"
          type="button"
        >
          新增 AI Agent
        </button>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>AI Agent</span>
          <strong>{{ agents.length }}</strong>
          <small>已部署服務</small>
        </article>

        <article class="summary-card">
          <span>今日請求</span>
          <strong>{{ totalRequests.toLocaleString() }}</strong>
          <small>API Requests</small>
        </article>

        <article class="summary-card">
          <span>平均回應</span>
          <strong>{{ averageLatency }} ms</strong>
          <small>Response Time</small>
        </article>

        <article class="summary-card">
          <span>成功率</span>
          <strong>{{ successRate }}%</strong>
          <small>Service Health</small>
        </article>
      </section>

      <section class="ai-card">
        <div class="table-toolbar">
          <div>
            <h2>
              AI Services
            </h2>

            <p>
              ALADDIN Enterprise AI Platform
            </p>
          </div>

          <div class="toolbar-actions">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜尋 AI 名稱、模型或功能"
            >

            <select
              v-model="statusFilter"
              class="filter-select"
            >
              <option value="">
                全部狀態
              </option>

              <option value="Online">
                Online
              </option>

              <option value="Offline">
                Offline
              </option>

              <option value="Maintenance">
                Maintenance
              </option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>AI 模組</th>
                <th>模型</th>
                <th>今日 Requests</th>
                <th>平均回應</th>
                <th>Token</th>
                <th>版本</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="agent in filteredAgents"
                :key="agent.id"
              >
                <td>
                  <div class="agent-info">
                    <span class="agent-avatar">
                      {{ agent.shortName }}
                    </span>

                    <div>
                      <strong>
                        {{ agent.name }}
                      </strong>

                      <small>
                        {{ agent.description }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {{ agent.model }}
                </td>

                <td>
                  {{ agent.requests.toLocaleString() }}
                </td>

                <td>
                  {{ agent.latency }} ms
                </td>

                <td>
                  {{ agent.tokens.toLocaleString() }}
                </td>

                <td>
                  {{ agent.version }}
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="statusClass(agent.status)"
                  >
                    {{ agent.status }}
                  </span>
                </td>

                <td>
                  <div class="action-buttons">
                    <button
                      class="text-button"
                      type="button"
                    >
                      查看
                    </button>

                    <button
                      v-if="permissionStore.hasPermission('ai.manage')"
                      class="text-button"
                      type="button"
                    >
                      管理
                    </button>

                    <button
                      v-if="permissionStore.hasPermission('ai.manage')"
                      class="text-button"
                      :class="getActionClass(agent.status)"
                      type="button"
                    >
                      {{ getActionLabel(agent.status) }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredAgents.length === 0">
                <td
                  colspan="8"
                  class="empty-state"
                >
                  找不到符合條件的 AI Agent
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
import { usePermissionStore } from '../../stores/permission'

type AgentStatus =
  | 'Online'
  | 'Offline'
  | 'Maintenance'

interface AIAgent {
  id: number
  name: string
  shortName: string
  description: string
  model: string
  requests: number
  latency: number
  tokens: number
  version: string
  status: AgentStatus
  successRate: number
}

const permissionStore =
  usePermissionStore()

const keyword = ref('')

const statusFilter =
  ref<AgentStatus | ''>('')

const agents: AIAgent[] = [
  {
    id: 1,
    name: 'AI 智能客服',
    shortName: '客',
    description: '會員諮詢、訂單查詢與售後服務',
    model: 'GPT Enterprise',
    requests: 1286,
    latency: 842,
    tokens: 428600,
    version: 'v1.4.2',
    status: 'Online',
    successRate: 99.8,
  },
  {
    id: 2,
    name: 'AI 商品文案',
    shortName: '文',
    description: '商品標題、賣點、詳情頁與 SEO 內容',
    model: 'GPT Enterprise',
    requests: 846,
    latency: 768,
    tokens: 318400,
    version: 'v1.3.0',
    status: 'Online',
    successRate: 99.5,
  },
  {
    id: 3,
    name: 'AI 智能翻譯',
    shortName: '譯',
    description: '繁體中文、簡體中文與英文翻譯',
    model: 'Multilingual AI',
    requests: 526,
    latency: 624,
    tokens: 186200,
    version: 'v1.2.6',
    status: 'Online',
    successRate: 99.2,
  },
  {
    id: 4,
    name: 'AI 行銷助手',
    shortName: '銷',
    description: '活動企劃、社群貼文與廣告素材建議',
    model: 'Marketing AI',
    requests: 368,
    latency: 936,
    tokens: 276800,
    version: 'v1.1.8',
    status: 'Maintenance',
    successRate: 97.8,
  },
  {
    id: 5,
    name: 'AI 商家審核',
    shortName: '審',
    description: '商家資料、商品內容與風險初步檢查',
    model: 'Risk AI',
    requests: 214,
    latency: 1056,
    tokens: 126500,
    version: 'v1.0.9',
    status: 'Offline',
    successRate: 96.4,
  },
]

const filteredAgents = computed(() => {
  const normalizedKeyword =
    keyword.value
      .trim()
      .toLowerCase()

  return agents.filter((agent) => {
    const matchesKeyword =
      !normalizedKeyword ||
      agent.name
        .toLowerCase()
        .includes(normalizedKeyword) ||
      agent.description
        .toLowerCase()
        .includes(normalizedKeyword) ||
      agent.model
        .toLowerCase()
        .includes(normalizedKeyword)

    const matchesStatus =
      !statusFilter.value ||
      agent.status ===
        statusFilter.value

    return (
      matchesKeyword &&
      matchesStatus
    )
  })
})

const totalRequests = computed(() =>
  agents.reduce(
    (total, agent) =>
      total + agent.requests,
    0,
  ),
)

const averageLatency = computed(() => {
  if (agents.length === 0) {
    return 0
  }

  const totalLatency =
    agents.reduce(
      (total, agent) =>
        total + agent.latency,
      0,
    )

  return Math.round(
    totalLatency / agents.length,
  )
})

const successRate = computed(() => {
  if (agents.length === 0) {
    return '0.0'
  }

  const averageRate =
    agents.reduce(
      (total, agent) =>
        total + agent.successRate,
      0,
    ) / agents.length

  return averageRate.toFixed(1)
})

function statusClass(
  status: AgentStatus,
): string {
  switch (status) {
    case 'Online':
      return 'status-badge--success'

    case 'Maintenance':
      return 'status-badge--warning'

    case 'Offline':
      return 'status-badge--danger'
  }
}

function getActionLabel(
  status: AgentStatus,
): string {
  switch (status) {
    case 'Online':
      return '停用'

    case 'Offline':
      return '啟用'

    case 'Maintenance':
      return '結束維護'
  }
}

function getActionClass(
  status: AgentStatus,
): string {
  switch (status) {
    case 'Online':
      return 'text-button--danger'

    case 'Offline':
      return 'text-button--success'

    case 'Maintenance':
      return 'text-button--warning'
  }
}
</script>

<style scoped>
.ai-page {
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.primary-button:hover {
  background: #2547bd;
  transform: translateY(-1px);
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
    0 10px 25px
    rgba(15, 23, 42, 0.05);
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

.ai-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.05);
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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input {
  width: 280px;
  padding: 0 14px;
}

.filter-select {
  padding: 0 12px;
}

.search-input:focus,
.filter-select:focus {
  border-color: #3157d6;
  box-shadow:
    0 0 0 3px
    rgba(49, 87, 214, 0.12);
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

tbody tr {
  transition:
    background-color 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agent-info strong {
  color: #0f172a;
}

.agent-info small {
  color: #94a3b8;
}

.agent-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 16px;
  font-weight: 800;
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

.status-badge--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-button {
  padding: 7px 12px;
  border: 0;
  border-radius: 8px;
  background: #eef2ff;
  color: #3157d6;
  cursor: pointer;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.text-button:hover {
  background: #dfe6ff;
  transform: translateY(-1px);
}

.text-button--success {
  background: #dcfce7;
  color: #15803d;
}

.text-button--success:hover {
  background: #bbf7d0;
}

.text-button--warning {
  background: #fef3c7;
  color: #b45309;
}

.text-button--warning:hover {
  background: #fde68a;
}

.text-button--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.text-button--danger:hover {
  background: #fecaca;
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