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
            :key="item.path ?? item.label"
          >
            <div
              v-if="
                item.children &&
                item.children.length > 0
              "
              class="navigation-group"
            >
              <RouterLink
                v-if="
                  !item.disabled &&
                  item.path
                "
                :to="item.path"
                class="navigation-group__title"
              >
                {{ item.label }}
              </RouterLink>

              <div
                v-else
                class="navigation-group__title"
              >
                {{ item.label }}
              </div>

              <div class="navigation-group__children">
                <template
                  v-for="child in item.children"
                  :key="child.path ?? child.label"
                >
                  <div
                    v-if="
                      child.children &&
                      child.children.length > 0
                    "
                    class="navigation-subgroup"
                  >
                    <div class="navigation-subgroup__title">
                      {{ child.label }}
                    </div>

                    <div class="navigation-subgroup__children">
                      <template
                        v-for="grandchild in child.children"
                        :key="
                          grandchild.path ??
                          grandchild.label
                        "
                      >
                        <RouterLink
                          v-if="
                            !grandchild.disabled &&
                            grandchild.path
                          "
                          :to="grandchild.path"
                          class="
                            navigation-group__link
                            navigation-group__link--nested
                          "
                        >
                          {{ grandchild.label }}
                        </RouterLink>

                        <button
                          v-else
                          class="
                            navigation__disabled
                            navigation-group__link
                            navigation-group__link--nested
                          "
                          type="button"
                          disabled
                        >
                          <span>
                            {{ grandchild.label }}
                          </span>

                          <small>
                            建置中
                          </small>
                        </button>
                      </template>
                    </div>
                  </div>

                  <RouterLink
                    v-else-if="
                      !child.disabled &&
                      child.path
                    "
                    :to="child.path"
                    class="navigation-group__link"
                  >
                    {{ child.label }}
                  </RouterLink>

                  <button
                    v-else
                    class="
                      navigation__disabled
                      navigation-group__link
                    "
                    type="button"
                    disabled
                  >
                    <span>
                      {{ child.label }}
                    </span>

                    <small>
                      建置中
                    </small>
                  </button>
                </template>
              </div>
            </div>

            <RouterLink
              v-else-if="
                !item.disabled &&
                item.path
              "
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

function isNavigationAllowed(
  item: NavigationItem,
): boolean {
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
}

function filterNavigationItem(
  item: NavigationItem,
): NavigationItem | null {
  if (!isNavigationAllowed(item)) {
    return null
  }

  if (
    !item.children ||
    item.children.length === 0
  ) {
    return item
  }

  const children =
    item.children
      .map(filterNavigationItem)
      .filter(
        (
          child,
        ): child is NavigationItem =>
          child !== null,
      )

  if (children.length === 0) {
    return null
  }

  return {
    ...item,
    children,
  }
}

const visibleNavigation =
  computed<NavigationItem[]>(() => {
    return adminNavigation
      .map(filterNavigationItem)
      .filter(
        (
          item,
        ): item is NavigationItem =>
          item !== null,
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

.navigation-group {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 6px;
}

.navigation-group__title {
  display: flex;
  width: 100%;
  min-height: 44px;
  padding: 12px 14px;
  border-radius: 10px;
  box-sizing: border-box;
  align-items: center;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.navigation-group__title:hover {
  background: #1f2937;
}

.navigation-group__title.router-link-active {
  background: #3157d6;
}

.navigation-group__children {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 10px;
}

.navigation-subgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navigation-subgroup__title {
  padding: 8px 14px 6px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.navigation-subgroup__children {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 10px;
}

.navigation-group__link {
  min-height: 40px !important;
  padding: 10px 14px 10px 18px !important;
  font-size: 14px;
}

.navigation-group__link::before {
  content: '•';
  margin-right: 8px;
  color: #64748b;
}

.navigation-group__link--nested {
  padding-left: 18px !important;
  font-size: 13px;
}

.navigation-group__link.router-link-active::before {
  color: #ffffff;
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
  background: #ffffff;
}

.header h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
}

.page {
  padding: 32px;
  box-sizing: border-box;
}

.sidebar__inner::-webkit-scrollbar {
  width: 8px;
}

.sidebar__inner::-webkit-scrollbar-track {
  background: #111827;
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
    display: block;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
  }

  .sidebar__inner {
    position: relative;
    height: auto;
    min-height: 0;
  }

  .content {
    width: 100%;
  }

  .header {
    padding: 20px;
  }

  .page {
    padding: 20px;
  }
}
</style>