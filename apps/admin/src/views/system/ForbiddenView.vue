<template>
  <main class="forbidden-page">
    <section class="forbidden-card">
      <div class="status-code">
        403
      </div>

      <p class="eyebrow">
        ACCESS DENIED
      </p>

      <h1>無法存取此頁面</h1>

      <p class="description">
        目前登入帳號沒有執行此操作所需的角色或權限。
        如需使用此功能，請聯繫系統管理員調整帳號權限。
      </p>

      <div
        v-if="reasonMessage"
        class="reason-box"
      >
        <span>拒絕原因</span>
        <strong>{{ reasonMessage }}</strong>
      </div>

      <div class="actions">
        <button
          class="primary-button"
          type="button"
          @click="goDashboard"
        >
          返回總覽儀表板
        </button>

        <button
          class="secondary-button"
          type="button"
          @click="goBack"
        >
          返回上一頁
        </button>
      </div>

      <p class="support">
        ALADDIN Super Platform・企業權限管理中心
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

const route = useRoute()
const router = useRouter()

const reasonMessage = computed(() => {
  switch (route.query.reason) {
    case 'role_denied':
      return '目前帳號角色不符合此頁面要求。'

    case 'permission_denied':
      return '目前帳號缺少此頁面所需權限。'

    case 'role_not_assigned':
      return '目前帳號尚未指派系統角色。'

    default:
      return ''
  }
})

async function goDashboard():
  Promise<void> {
  await router.push('/')
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<style scoped>
.forbidden-page {
  display: grid;
  min-height: 100vh;
  padding: 32px;
  place-items: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(49, 87, 214, 0.14),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #f8fafc,
      #eef2ff
    );
}

.forbidden-card {
  width: min(100%, 620px);
  padding: 52px;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 30px 80px
    rgba(15, 23, 42, 0.12);
  text-align: center;
}

.status-code {
  display: inline-grid;
  min-width: 136px;
  min-height: 80px;
  place-items: center;
  border-radius: 24px;
  background:
    linear-gradient(
      135deg,
      #3157d6,
      #248fd8
    );
  box-shadow:
    0 18px 36px
    rgba(49, 87, 214, 0.24);
  color: #ffffff;
  font-size: 44px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.eyebrow {
  margin: 28px 0 10px;
  color: #3157d6;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: 34px;
}

.description {
  max-width: 500px;
  margin: 18px auto 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.85;
}

.reason-box {
  display: flex;
  margin-top: 26px;
  padding: 16px 18px;
  border: 1px solid #fde68a;
  border-radius: 14px;
  flex-direction: column;
  gap: 5px;
  background: #fffbeb;
  color: #92400e;
}

.reason-box span {
  font-size: 12px;
  font-weight: 700;
}

.reason-box strong {
  font-size: 14px;
}

.actions {
  display: flex;
  margin-top: 30px;
  justify-content: center;
  gap: 12px;
}

.primary-button,
.secondary-button {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
}

.primary-button {
  border: 0;
  background: #3157d6;
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #334155;
}

.support {
  margin: 30px 0 0;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 640px) {
  .forbidden-page {
    padding: 18px;
  }

  .forbidden-card {
    padding: 34px 22px;
    border-radius: 22px;
  }

  h1 {
    font-size: 28px;
  }

  .actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>