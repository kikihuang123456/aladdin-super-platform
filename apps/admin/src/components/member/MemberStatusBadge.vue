<template>
  <span
    class="status-badge"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MemberStatus } from '../../types/member'

const props = defineProps<{
  status: MemberStatus
}>()

const label = computed(() => {
  switch (props.status) {
    case 'active':
      return '正常'

    case 'pending':
      return '待審核'

    case 'disabled':
      return '停用'

    case 'suspended':
      return '暫停'

    case 'deleted':
      return '已刪除'

    default:
      return '未知'
  }
})

const badgeClass = computed(() => {
  switch (props.status) {
    case 'active':
      return 'status-active'

    case 'pending':
      return 'status-pending'

    case 'disabled':
      return 'status-disabled'

    case 'suspended':
      return 'status-suspended'

    case 'deleted':
      return 'status-deleted'

    default:
      return ''
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid transparent;
}

/* 正常 */
.status-active {
  color: #166534;
  background: #dcfce7;
  border-color: #86efac;
}

/* 待審核 */
.status-pending {
  color: #b45309;
  background: #fef3c7;
  border-color: #fcd34d;
}

/* 停用 */
.status-disabled {
  color: #475569;
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* 暫停 */
.status-suspended {
  color: #b91c1c;
  background: #fee2e2;
  border-color: #fca5a5;
}

/* 已刪除 */
.status-deleted {
  color: #ffffff;
  background: #334155;
  border-color: #334155;
}
</style>