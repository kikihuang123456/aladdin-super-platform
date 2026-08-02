<template>
  <AdminLayout>
    <section class="placeholder-page">
      <p class="eyebrow">
        MALL MANAGEMENT
      </p>

      <h1>
        商品分類管理
      </h1>

      <p>
        商品分類管理功能將於下一階段完成。
      </p>

      <button
        type="button"
        @click="handleBack"
      >
        返回商品列表
      </button>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import {
  useRouter,
} from 'vue-router'

import AdminLayout from '../../layouts/AdminLayout.vue'

const router =
  useRouter()

function handleBack():
  void {
  router.push('/mall')
}
</script>

<style scoped>
.placeholder-page {
  padding: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.eyebrow {
  margin: 0;
  color: #3157d6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

h1 {
  margin: 8px 0 12px;
  color: #0f172a;
}

p {
  color: #64748b;
}

button {
  min-height: 42px;
  margin-top: 16px;
  padding: 0 18px;
  border: 1px solid #3157d6;
  border-radius: 10px;
  background: #3157d6;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
</style>