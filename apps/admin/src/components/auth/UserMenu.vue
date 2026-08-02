<template>
  <div class="user-menu">
    <button
      type="button"
      class="user-menu__trigger"
      @click="isOpen = !isOpen"
    >
      <div class="user-menu__avatar">
        {{ userInitial }}
      </div>

      <div class="user-menu__content">
        <strong>{{ displayName }}</strong>
        <span>{{ roleName }}</span>
      </div>

      <span class="user-menu__arrow">
        ▾
      </span>
    </button>

    <div
      v-if="isOpen"
      class="user-menu__dropdown"
    >
      <div class="user-menu__profile">
        <strong>{{ displayName }}</strong>
        <span>{{ userEmail }}</span>
      </div>

      <div class="user-menu__divider" />

      <button
        type="button"
        class="user-menu__item"
        @click="handleRefreshPermissions"
      >
        重新載入權限
      </button>

      <button
        type="button"
        class="user-menu__item user-menu__item--danger"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        {{
          isLoggingOut
            ? '登出中...'
            : '登出系統'
        }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  storeToRefs,
} from 'pinia'

import {
  useAuthStore,
} from '../../stores/auth'

import {
  usePermissionStore,
} from '../../stores/permission'

const router = useRouter()

const authStore = useAuthStore()
const permissionStore =
  usePermissionStore()

const {
  user,
} = storeToRefs(authStore)

const {
  roleName,
} = storeToRefs(
  permissionStore,
)

const isOpen = ref(false)
const isLoggingOut = ref(false)

const displayName = computed(
  () =>
    user.value?.name ||
    'ALADDIN 使用者',
)

const userEmail = computed(
  () =>
    user.value?.email || '',
)

const userInitial = computed(
  () =>
    displayName.value
      .trim()
      .charAt(0)
      .toUpperCase() || 'A',
)

async function handleLogout():
  Promise<void> {
  isLoggingOut.value = true

  try {
    await authStore.logout()

    permissionStore
      .clearPermissionState()

    await router.replace('/login')
  } finally {
    isLoggingOut.value = false
    isOpen.value = false
  }
}

async function handleRefreshPermissions():
  Promise<void> {
  try {
    await permissionStore
      .refreshPermissions()
  } finally {
    isOpen.value = false
  }
}

function closeMenu(
  event: MouseEvent,
): void {
  const target =
    event.target as HTMLElement

  if (
    !target.closest('.user-menu')
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener(
    'click',
    closeMenu,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    closeMenu,
  )
})
</script>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: flex;
  min-width: 220px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  cursor: pointer;
}

.user-menu__avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background:
    linear-gradient(
      135deg,
      #3157d6,
      #248fd8
    );
  color: #ffffff;
  font-weight: 900;
}

.user-menu__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
}

.user-menu__content strong {
  max-width: 140px;
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__content span {
  color: #64748b;
  font-size: 11px;
}

.user-menu__arrow {
  color: #94a3b8;
}

.user-menu__dropdown {
  position: absolute;
  z-index: 50;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 20px 50px
    rgba(15, 23, 42, 0.16);
}

.user-menu__profile {
  display: flex;
  padding: 10px;
  flex-direction: column;
  gap: 4px;
}

.user-menu__profile strong {
  color: #0f172a;
  font-size: 13px;
}

.user-menu__profile span {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__divider {
  height: 1px;
  margin: 6px 0;
  background: #e2e8f0;
}

.user-menu__item {
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  text-align: left;
}

.user-menu__item:hover {
  background: #f8fafc;
}

.user-menu__item--danger {
  color: #dc2626;
}

.user-menu__item--danger:hover {
  background: #fef2f2;
}

.user-menu__item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>