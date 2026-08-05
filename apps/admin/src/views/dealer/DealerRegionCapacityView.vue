<script setup lang="ts">

import {
  onMounted,
  ref,
} from 'vue'

import {
  useDealerRegionCapacityStore,
} from '../../stores/dealer-region-capacity'

import type {
  DealerRegionCapacity,
} from '../../types/dealer-region-capacity'

import DealerRegionCapacitySummary
from '../../components/dealer/DealerRegionCapacitySummary.vue'

import DealerRegionCapacityStatus
from '../../components/dealer/DealerRegionCapacityStatus.vue'

const capacityStore =
  useDealerRegionCapacityStore()


const editingRegionId =
  ref<string | null>(null)


const editingMaxDealers =
  ref(0)


function startEdit(
  item: DealerRegionCapacity,
){

  editingRegionId.value =
    item.regionId

  editingMaxDealers.value =
    item.maxDealers

}


function cancelEdit(){

  editingRegionId.value =
    null

  editingMaxDealers.value =
    0

}


async function saveCapacity(
  item: DealerRegionCapacity,
){

  if(
    editingMaxDealers.value < 0
  ){

    return

  }

  await capacityStore.updateCapacity({

    regionId:
      item.regionId,

    maxDealers:
      editingMaxDealers.value,

  })

  cancelEdit()

}


onMounted(
  async() => {

    await capacityStore.fetchCapacity()

  },
)

</script>


<template>

<div class="capacity-page">

  <div class="page-header">

    <div>

      <h1>
        經銷商區域容量管理
      </h1>

      <p>
        Dealer ERP M05-07 Region Capacity
      </p>

    </div>

    <button
      class="refresh-button"
      :disabled="capacityStore.loading"
      @click="capacityStore.fetchCapacity()"
    >
      重新整理
    </button>

  </div>


  <div
    v-if="capacityStore.loading"
    class="state-card"
  >
    容量資料載入中...
  </div>


  <div
    v-else-if="capacityStore.error"
    class="state-card error-card"
  >
    {{ capacityStore.error }}
  </div>


  <template v-else>

  <DealerRegionCapacitySummary
    :capacities="
      capacityStore.capacities
    "
  />
</template>
  <div class="capacity-panel">
<DealerRegionCapacitySummary
  v-if="
    !capacityStore.loading
    &&
    !capacityStore.error
  "
  :capacities="
    capacityStore.capacities
  "
/>

    <table>

      <thead>

        <tr>

          <th>
            區域
          </th>

          <th>
            市場
          </th>

          <th>
            目前經銷商
          </th>

          <th>
            最大容量
          </th>

          <th>
            剩餘容量
          </th>

          <th>
            使用率
          </th>

          <th>
區域狀態
</th>

<th>
容量狀態
</th>

          <th>
            操作
          </th>

        </tr>

      </thead>


      <tbody>

        <tr
          v-for="item in capacityStore.capacities"
          :key="item.regionId"
        >

          <td>
            {{ item.regionName }}
          </td>

          <td>
            {{ item.market }}
          </td>

          <td>
            {{ item.currentDealers }}
          </td>

          <td>

            <input
              v-if="
                editingRegionId ===
                item.regionId
              "
              v-model.number="
                editingMaxDealers
              "
              type="number"
              min="0"
              class="capacity-input"
            >

            <span v-else>
              {{ item.maxDealers }}
            </span>

          </td>

          <td>
            {{ item.remainingCapacity }}
          </td>

          <td>

            <div class="usage-cell">

              <div class="progress-track">

                <div
                  class="progress-value"
                  :style="{
                    width:
                      `${Math.min(
                        item.usageRate,
                        100,
                      )}%`,
                  }"
                />

              </div>

              <span>
                {{ item.usageRate }}%
              </span>

            </div>

          </td>

          <td>
  {{ item.status }}
</td>

<td>

  <DealerRegionCapacityStatus
    :max-dealers="
      item.maxDealers
    "
    :current-dealers="
      item.currentDealers
    "
    :usage-rate="
      item.usageRate
    "
  />

</td>

          <td>

            <div class="actions">

              <template
                v-if="
                  editingRegionId ===
                  item.regionId
                "
              >

                <button
                  class="primary-button"
                  :disabled="
                    capacityStore.loading
                  "
                  @click="
                    saveCapacity(item)
                  "
                >
                  儲存
                </button>

                <button
                  @click="cancelEdit"
                >
                  取消
                </button>

              </template>

              <button
                v-else
                @click="startEdit(item)"
              >
                設定容量
              </button>

            </div>

          </td>

        </tr>

      </tbody>

    </table>


    <div
      v-if="
        capacityStore.capacities.length === 0
      "
      class="empty-state"
    >
      目前沒有區域容量資料。
    </div>

  </div>

</div>

</template>


<style scoped>

.capacity-page {

  display:
    flex;

  flex-direction:
    column;

  gap:
    20px;

}


.page-header {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    20px;

  padding:
    24px;

  background:
    white;

  border-radius:
    16px;

}


.page-header h1 {

  margin:
    0 0 8px;

}


.page-header p {

  margin:
    0;

  color:
    #667085;

}


.capacity-panel,
.state-card {

  padding:
    24px;

  background:
    white;

  border-radius:
    16px;

}


.error-card {

  color:
    #b42318;

  background:
    #fff1f0;

}


table {

  width:
    100%;

  border-collapse:
    collapse;

}


th,
td {

  padding:
    14px 12px;

  text-align:
    left;

  border-bottom:
    1px solid #eaecf0;

}


th {

  color:
    #475467;

  font-weight:
    600;

}


.capacity-input {

  width:
    110px;

  padding:
    8px 10px;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

}


.usage-cell {

  display:
    flex;

  align-items:
    center;

  gap:
    10px;

  min-width:
    170px;

}


.progress-track {

  width:
    110px;

  height:
    8px;

  overflow:
    hidden;

  background:
    #eaecf0;

  border-radius:
    999px;

}


.progress-value {

  height:
    100%;

  background:
    #101828;

  border-radius:
    inherit;

}


.actions {

  display:
    flex;

  gap:
    8px;

}


button {

  padding:
    8px 14px;

  border:
    1px solid #d0d5dd;

  border-radius:
    8px;

  background:
    white;

  cursor:
    pointer;

}


button:disabled {

  cursor:
    not-allowed;

  opacity:
    .6;

}


.primary-button,
.refresh-button {

  color:
    white;

  background:
    #101828;

  border-color:
    #101828;

}


.empty-state {

  padding:
    32px;

  text-align:
    center;

  color:
    #667085;

}

</style>