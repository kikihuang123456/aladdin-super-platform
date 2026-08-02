<template>
  <article class="kpi-card">
    <div class="kpi-card__header">
      <span class="kpi-card__label">{{ label }}</span>
      <span class="kpi-card__icon" aria-hidden="true">
        {{ icon }}
      </span>
    </div>

    <strong class="kpi-card__value">
      {{ value }}
    </strong>

    <div class="kpi-card__footer">
      <span
        class="kpi-card__trend"
        :class="trendClass"
      >
        {{ trendText }}
      </span>

      <span class="kpi-card__description">
        {{ description }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TrendType = 'up' | 'down' | 'neutral'

interface Props {
  label: string
  value: string | number
  description?: string
  trend?: TrendType
  trendText?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  trend: 'neutral',
  trendText: '持平',
  icon: '◆',
})

const trendClass = computed(() => {
  return `kpi-card__trend--${props.trend}`
})
</script>

<style scoped>
.kpi-card {
  display: flex;
  min-height: 168px;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.kpi-card__label {
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
}

.kpi-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  background: #eef2ff;
  color: #3157d6;
  font-size: 18px;
}

.kpi-card__value {
  margin: 18px 0;
  color: #0f172a;
  font-size: 34px;
  line-height: 1;
}

.kpi-card__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 13px;
}

.kpi-card__trend {
  font-weight: 700;
}

.kpi-card__trend--up {
  color: #16a34a;
}

.kpi-card__trend--down {
  color: #dc2626;
}

.kpi-card__trend--neutral {
  color: #64748b;
}

.kpi-card__description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>