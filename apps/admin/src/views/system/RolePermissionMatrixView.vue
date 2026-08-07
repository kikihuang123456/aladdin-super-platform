<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  storeToRefs,
} from 'pinia'

import {
  useRolePermissionMatrixStore,
} from '../../stores/role-permission-matrix'


const router =
  useRouter()


const store =
  useRolePermissionMatrixStore()


const {
  roles,
  permissions,
  selectedRoleId,
  draftPermissionIds,
  isLoading,
  isSaving,
  error,
  successMessage,
  selectedRole,
  isSelectedRoleLocked,
  groupedPermissions,
  hasChanges,
} =
  storeToRefs(
    store,
  )


const selectedCount =
  computed(
    () =>
      draftPermissionIds.value.length,
  )


const totalCount =
  computed(
    () =>
      permissions.value.length,
  )


const moduleLabels:
  Record<string, string> = {

  dashboard:
    '總覽儀表板',

  member:
    '會員管理',

  merchant:
    '商家管理',

  dealer:
    '經銷商管理',

  mall:
    '商城管理',

  order:
    '訂單管理',

  finance:
    '財務管理',

  travel:
    '文旅管理',

  ai:
    'AI 智能中心',

  system:
    'ERP 系統管理',

  auth:
    '帳號與登入',

  notification:
    '通知中心',

  other:
    '其他權限',

}


function goHome():
  void {

  void router.push(
    '/',
  )

}


function getModuleLabel(
  moduleName: string,
): string {

  return (
    moduleLabels[
      moduleName
    ]
    ??
    moduleName
  )

}


function selectRole(
  roleId: string,
): void {

  store.setSelectedRole(
    roleId,
  )

}


function togglePermission(
  permissionId: string,
): void {

  store.togglePermission(
    permissionId,
  )

}


function toggleModule(
  moduleName: string,
): void {

  store.toggleModule(
    moduleName,
  )

}


async function savePermissions():
  Promise<void> {

  try {

    await store
      .saveSelectedRole()

  } catch {

    // Store 已處理錯誤訊息

  }

}


async function refreshMatrix():
  Promise<void> {

  try {

    await store
      .fetchMatrix()

  } catch {

    // Store 已處理錯誤訊息

  }

}


onMounted(
  () => {

    void refreshMatrix()

  },
)
</script>


<template>
  <div class="permission-page">

    <header class="page-header">

      <div>

        <p class="eyebrow">
          ERP SYSTEM ADMIN
        </p>

        <h1>
          角色權限管理
        </h1>

        <p class="subtitle">
          由超級管理員統一設定各部門與角色可以查看、操作的系統功能。
        </p>

      </div>


      <div class="toolbar-actions">

        <button
          type="button"
          class="secondary-button"
          @click="goHome"
        >
          ← 返回首頁
        </button>


        <button
          type="button"
          class="refresh-button"
          :disabled="isLoading || isSaving"
          @click="refreshMatrix"
        >
          {{ isLoading ? '載入中…' : '重新整理' }}
        </button>

      </div>

    </header>


    <div
      v-if="error"
      class="message error-message"
    >
      {{ error.message }}
    </div>


    <div
      v-if="successMessage"
      class="message success-message"
    >
      {{ successMessage }}
    </div>


    <div
      v-if="isLoading && !roles.length"
      class="loading-card"
    >
      正在載入角色與權限資料…
    </div>


    <template v-else>

      <section class="role-section">

        <div class="section-heading">

          <div>

            <h2>
              角色／部門
            </h2>

            <p>
              選擇要設定權限的角色。
            </p>

          </div>

        </div>


        <div class="role-grid">

          <button
            v-for="role in roles"
            :key="role.id"
            type="button"
            class="role-card"
            :class="{
              active:
                selectedRoleId ===
                role.id,

              locked:
                role.locked,
            }"
            @click="
              selectRole(
                role.id,
              )
            "
          >

            <div class="role-card-top">

              <span class="role-name">
                {{ role.name }}
              </span>

              <span
                v-if="role.locked"
                class="locked-badge"
              >
                系統保護
              </span>

            </div>


            <span class="role-code">
              {{ role.code }}
            </span>


            <span
              v-if="role.description"
              class="role-description"
            >
              {{ role.description }}
            </span>

          </button>

        </div>

      </section>


      <section
        v-if="selectedRole"
        class="permission-section"
      >

        <div class="permission-toolbar">

          <div>

            <p class="eyebrow">
              PERMISSION MATRIX
            </p>

            <h2>
              {{ selectedRole.name }}
            </h2>

            <p>
              已選擇
              <strong>
                {{ selectedCount }}
              </strong>
              /
              {{ totalCount }}
              項權限
            </p>

          </div>


          <div class="toolbar-actions">

            <button
              type="button"
              class="secondary-button"
              :disabled="
                isSelectedRoleLocked
                ||
                isSaving
              "
              @click="
                store.selectAllPermissions()
              "
            >
              全部勾選
            </button>


            <button
              type="button"
              class="secondary-button"
              :disabled="
                isSelectedRoleLocked
                ||
                isSaving
              "
              @click="
                store.clearAllPermissions()
              "
            >
              全部清除
            </button>


            <button
              type="button"
              class="secondary-button"
              :disabled="
                !hasChanges
                ||
                isSaving
              "
              @click="
                store.resetDraft()
              "
            >
              還原
            </button>


            <button
              type="button"
              class="primary-button"
              :disabled="
                isSelectedRoleLocked
                ||
                !hasChanges
                ||
                isSaving
              "
              @click="savePermissions"
            >
              {{
                isSaving
                  ? '儲存中…'
                  : '儲存權限'
              }}
            </button>

          </div>

        </div>


        <div
          v-if="isSelectedRoleLocked"
          class="locked-notice"
        >
          🔒 超級管理員為系統保護角色，永久保留完整系統權限，不允許取消。
        </div>


        <div class="module-list">

          <section
            v-for="group in groupedPermissions"
            :key="group.module"
            class="module-card"
          >

            <div class="module-header">

              <div>

                <h3>
                  {{
                    getModuleLabel(
                      group.module,
                    )
                  }}
                </h3>

                <span class="module-code">
                  {{ group.module }}
                </span>

              </div>


              <label class="module-toggle">

                <input
                  type="checkbox"
                  :checked="
                    store
                      .isModuleFullySelected(
                        group.module,
                      )
                  "
                  :disabled="
                    isSelectedRoleLocked
                  "
                  @change="
                    toggleModule(
                      group.module,
                    )
                  "
                >

                <span>
                  此模組全選
                </span>

              </label>

            </div>


            <div class="permission-grid">

              <label
                v-for="
                  permission
                  in group.permissions
                "
                :key="permission.id"
                class="permission-item"
                :class="{
                  selected:
                    store.hasPermission(
                      permission.id,
                    ),
                }"
              >

                <input
                  type="checkbox"
                  :checked="
                    store.hasPermission(
                      permission.id,
                    )
                  "
                  :disabled="
                    isSelectedRoleLocked
                  "
                  @change="
                    togglePermission(
                      permission.id,
                    )
                  "
                >


                <span class="permission-content">

                  <strong>
                    {{ permission.name }}
                  </strong>

                  <small>
                    {{ permission.code }}
                  </small>

                </span>

              </label>

            </div>

          </section>

        </div>


        <footer class="save-footer">

          <div>

            <strong>
              {{
                hasChanges
                  ? '目前有尚未儲存的權限變更'
                  : '目前權限已同步'
              }}
            </strong>

            <p>
              儲存後，新權限會寫入 Supabase role_permissions。
            </p>

          </div>


          <button
            type="button"
            class="primary-button large"
            :disabled="
              isSelectedRoleLocked
              ||
              !hasChanges
              ||
              isSaving
            "
            @click="savePermissions"
          >
            {{
              isSaving
                ? '正在儲存…'
                : '儲存目前角色權限'
            }}
          </button>

        </footer>

      </section>

    </template>

  </div>
</template>


<style scoped>
.permission-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 4px 40px;
}

.page-header,
.permission-toolbar,
.save-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.page-header h1,
.permission-toolbar h2,
.section-heading h2 {
  margin: 4px 0 8px;
  color: #111827;
}

.page-header h1 {
  font-size: 30px;
}

.subtitle,
.section-heading p,
.permission-toolbar p,
.save-footer p {
  margin: 0;
  color: #6b7280;
}

.eyebrow {
  margin: 0;
  color: #4f67d8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.role-section,
.permission-section,
.loading-card {
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #ffffff;
  box-shadow:
    0 8px 30px
    rgba(15, 23, 42, 0.05);
}

.role-section {
  padding: 22px;
}

.section-heading {
  margin-bottom: 18px;
}

.role-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(190px, 1fr)
    );
  gap: 12px;
}

.role-card {
  display: flex;
  min-height: 118px;
  flex-direction: column;
  gap: 7px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.role-card:hover {
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.role-card.active {
  border-color: #4964db;
  box-shadow:
    0 0 0 3px
    rgba(73, 100, 219, 0.11);
}

.role-card.locked {
  background: #f8fafc;
}

.role-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.role-name {
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.role-code,
.module-code,
.permission-content small {
  color: #9ca3af;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
  font-size: 12px;
}

.role-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.locked-badge {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
}

.permission-section {
  overflow: hidden;
}

.permission-toolbar {
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.primary-button,
.secondary-button,
.refresh-button {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 650;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #4964db;
  background: #4964db;
  color: #ffffff;
}

.secondary-button,
.refresh-button {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
}

.primary-button:disabled,
.secondary-button:disabled,
.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.primary-button.large {
  min-height: 46px;
  padding: 0 22px;
}

.locked-notice {
  margin: 20px 24px 0;
  padding: 13px 16px;
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 14px;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.module-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.module-header h3 {
  margin: 0 0 3px;
  color: #1f2937;
  font-size: 16px;
}

.module-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.permission-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(260px, 1fr)
    );
  gap: 10px;
  padding: 15px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  min-height: 66px;
  padding: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
}

.permission-item.selected {
  border-color: #a5b4fc;
  background: #f5f7ff;
}

.permission-item input,
.module-toggle input {
  width: 17px;
  height: 17px;
  margin-top: 2px;
  accent-color: #4964db;
}

.permission-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.permission-content strong {
  color: #1f2937;
  font-size: 14px;
}

.save-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.save-footer strong {
  color: #1f2937;
}

.save-footer p {
  margin-top: 5px;
  font-size: 13px;
}

.message,
.loading-card {
  padding: 15px 18px;
}

.error-message {
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
}

.success-message {
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
}

.loading-card {
  color: #6b7280;
}

@media (
  max-width: 900px
) {
  .page-header,
  .permission-toolbar,
  .save-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>
