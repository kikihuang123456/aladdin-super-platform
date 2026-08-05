<script setup lang="ts">

import type {
  DealerRegionReassignmentResponse,
} from '../../types/dealer-region-reassignment'



defineProps<{

  result:
    DealerRegionReassignmentResponse
    | null

  loading?:
    boolean

  error?:
    string
    | null

}>()

</script>


<template>

<div
  v-if="
    loading
    ||
    error
    ||
    result
  "
  class="reassignment-result"
>


  <div
    v-if="loading"
    class="result-card loading-card"
  >

    <strong>
      正在重新指派經銷商區域
    </strong>

    <p>
      系統正在檢查新區域容量並更新指派資料。
    </p>

  </div>


  <div
    v-else-if="
      error
      &&
      !result
    "
    class="result-card error-card"
  >

    <strong>
      重新指派失敗
    </strong>

    <p>
      {{ error }}
    </p>

  </div>


  <div
    v-else-if="result"
    class="result-card"
    :class="{
      successCard:
        result.success,

      errorCard:
        !result.success,
    }"
  >

    <div class="result-header">

      <div>

        <strong>
          {{
            result.success
              ? '重新指派成功'
              : '重新指派未完成'
          }}
        </strong>

        <p>
          {{ result.message }}
        </p>

      </div>


      <span
        class="status-badge"
        :class="{
          successBadge:
            result.success,

          errorBadge:
            !result.success,
        }"
      >

        {{
          result.success
            ? '成功'
            : '失敗'
        }}

      </span>

    </div>


    <div class="result-grid">

      <div>

        <span>
          經銷商 ID
        </span>

        <strong>
          {{ result.dealerId || '—' }}
        </strong>

      </div>


      <div>

        <span>
          原區域 ID
        </span>

        <strong>
          {{ result.previousRegionId || '—' }}
        </strong>

      </div>


      <div>

        <span>
          新區域 ID
        </span>

        <strong>
          {{ result.nextRegionId || '—' }}
        </strong>

      </div>

    </div>


    <div
      v-if="result.snapshot"
      class="snapshot-panel"
    >

      <h4>
        原始指派快照
      </h4>


      <div class="snapshot-grid">

        <div>

          <span>
            指派紀錄 ID
          </span>

          <strong>
            {{ result.snapshot.assignmentId }}
          </strong>

        </div>


        <div>

          <span>
            原指派人員
          </span>

          <strong>
            {{
              result.snapshot.previousAssignedBy
              || '未記錄'
            }}
          </strong>

        </div>


        <div>

          <span>
            原指派時間
          </span>

          <strong>
            {{
              result.snapshot.previousAssignedAt
              || '未記錄'
            }}
          </strong>

        </div>


        <div>

          <span>
            原備註
          </span>

          <strong>
            {{
              result.snapshot.previousRemark
              || '無'
            }}
          </strong>

        </div>

      </div>

    </div>


    <div
      v-if="result.error"
      class="error-detail"
    >

      <strong>
        錯誤資訊
      </strong>

      <p>
        {{ result.error }}
      </p>

    </div>

  </div>

</div>

</template>


<style scoped>

.reassignment-result {

  display:
    flex;

  flex-direction:
    column;

  gap:
    14px;

}


.result-card {

  padding:
    18px;

  border:
    1px solid #d0d5dd;

  border-radius:
    14px;

  background:
    #f9fafb;

}


.loading-card {

  color:
    #475467;

}


.successCard {

  border-color:
    #abefc6;

  background:
    #ecfdf3;

}


.errorCard,
.error-card {

  color:
    #b42318;

  border-color:
    #fecdca;

  background:
    #fef3f2;

}


.result-card p {

  margin:
    7px 0 0;

  line-height:
    1.6;

}


.result-header {

  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    16px;

}


.result-header strong {

  color:
    #101828;

  font-size:
    17px;

}


.status-badge {

  padding:
    6px 11px;

  border-radius:
    999px;

  font-size:
    12px;

  font-weight:
    700;

}


.successBadge {

  color:
    #067647;

  background:
    #d1fadf;

}


.errorBadge {

  color:
    #b42318;

  background:
    #fee4e2;

}


.result-grid {

  display:
    grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    12px;

  margin-top:
    16px;

}


.result-grid > div,
.snapshot-grid > div {

  display:
    flex;

  min-width:
    0;

  flex-direction:
    column;

  gap:
    5px;

  padding:
    12px;

  background:
    rgba(255, 255, 255, .72);

  border-radius:
    10px;

}


.result-grid span,
.snapshot-grid span {

  color:
    #667085;

  font-size:
    12px;

}


.result-grid strong,
.snapshot-grid strong {

  overflow-wrap:
    anywhere;

  color:
    #101828;

  font-size:
    13px;

}


.snapshot-panel {

  margin-top:
    16px;

  padding:
    14px;

  background:
    rgba(255, 255, 255, .55);

  border:
    1px solid rgba(208, 213, 221, .7);

  border-radius:
    12px;

}


.snapshot-panel h4 {

  margin:
    0 0 12px;

  color:
    #344054;

}


.snapshot-grid {

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    10px;

}


.error-detail {

  margin-top:
    16px;

  padding:
    13px;

  color:
    #b42318;

  background:
    rgba(255, 255, 255, .65);

  border:
    1px solid #fecdca;

  border-radius:
    10px;

}


.error-detail p {

  margin:
    5px 0 0;

}


@media (
  max-width: 700px
) {

  .result-grid,
  .snapshot-grid {

    grid-template-columns:
      1fr;

  }

}

</style>