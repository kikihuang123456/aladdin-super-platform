<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar__inner">
        <div class="logo">
          阿拉丁
        </div>

        <nav class="navigation">
          <template
            v-for="item in visibleNavigation"
            :key="item.path"
          >
            <RouterLink
              v-if="!item.disabled"
              :to="item.path"
            >
              {{ item.label }}
            </RouterLink>

            <button
              v-else
              class="navigation__disabled"
              type="button"
              disabled
            >
              <span>
                {{ item.label }}
              </span>

              <small>
                建置中
              </small>
            </button>
          </template>
        </nav>
      </div>
    </aside>

    <main class="content">
      <header class="header">
        <h2>
          阿拉丁企業管理平台
        </h2>

        <UserMenu />
      </header>

      <section class="page">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'

import UserMenu
  from '../components/auth/UserMenu.vue'

import {
  adminNavigation,
  type NavigationItem,
} from '../config/navigation'

import {
  usePermissionStore,
} from '../stores/permission'

const permissionStore =
  usePermissionStore()

const visibleNavigation =
  computed<NavigationItem[]>(() => {
    return adminNavigation.filter(
      (item) => {
        const roleAllowed =
          !item.roles ||
          item.roles.length === 0 ||
          permissionStore.hasAnyRole(
            item.roles,
          )

        const permissionAllowed =
          !item.permission ||
          permissionStore.hasPermission(
            item.permission,
          )

        return (
          roleAllowed &&
          permissionAllowed
        )
      },
    )
  })

onMounted(async () => {
  if (
    !permissionStore.isInitialized
  ) {
    try {
      await permissionStore
        .fetchPermissions()
    } catch (error) {
      console.error(
        '[AdminLayout] 載入側邊選單權限失敗：',
        error,
      )
    }
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: stretch;
  background: #f5f7fb;
}

.sidebar {
  position: relative;
  width: 240px;
  min-width: 240px;
  flex: 0 0 240px;
  align-self: stretch;
  background: #111827;
  color: #ffffff;
}

.sidebar__inner {
  position: sticky;
  top: 0;
  display: flex;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  padding: 32px 20px;
  box-sizing: border-box;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: #111827;
}

.logo {
  margin-bottom: 40px;
  padding: 0 14px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.navigation {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.navigation a,
.navigation__disabled {
  display: flex;
  width: 100%;
  min-height: 44px;
  padding: 12px 14px;
  border: 0;
  border-radius: 10px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #ffffff;
  font: inherit;
  text-align: left;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.navigation a:hover {
  background: #1f2937;
  transform: translateX(2px);
}

.navigation a.router-link-active {
  background: #3157d6;
  color: #ffffff;
  font-weight: 700;
}

.navigation__disabled {
  cursor: not-allowed;
  background: transparent;
  color: #64748b;
}

.navigation__disabled small {
  padding: 3px 7px;
  border-radius: 999px;
  background: #1f2937;
  color: #94a3b8;
  font-size: 10px;
  white-space: nowrap;
}

.content {
  width: 0;
  min-width: 0;
  min-height: 100vh;
  flex: 1;
  background: #f5f7fb;
}

.header {
  display: flex;
  min-height: 98px;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: #ffffff;
}

.header h2 {
  margin: 0;
  color: #111827;
  font-size: 26px;
  font-weight: 800;
}

.page {
  min-width: 0;
  min-height: calc(100vh - 98px);
  padding: 32px;
  box-sizing: border-box;
  background: #f5f7fb;
}

.sidebar__inner::-webkit-scrollbar {
  width: 6px;
}

.sidebar__inner::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar__inner::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #374151;
}

.sidebar__inner::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

@media (max-width: 900px) {
  .layout {
    min-height: 100vh;
    flex-direction: column;
  }

  .sidebar {
    position: relative;
    width: 100%;
    min-width: 0;
    flex: none;
    align-self: auto;
  }

  .sidebar__inner {
    position: relative;
    top: auto;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 20px;
    overflow: visible;
  }

  .logo {
    margin-bottom: 20px;
  }

  .navigation {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .content {
    width: 100%;
    min-height: 0;
  }

  .header {
    min-height: 80px;
    padding: 18px 20px;
  }

  .page {
    min-height: calc(100vh - 80px);
    padding: 20px;
  }
}

@media (max-width: 680px) {
  .header {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .navigation {
    grid-template-columns: 1fr;
  }

  .header h2 {
    font-size: 21px;
  }

  .page {
    padding: 16px;
  }
}
</style>