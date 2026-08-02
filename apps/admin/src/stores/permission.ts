import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  permissionApi,
  type Permission,
  type Role,
  type UserPermission,
} from '../api/permission'

interface PermissionStoreError {
  code: string
  message: string
  cause?: unknown
}

function normalizePermissionError(
  error: unknown,
): PermissionStoreError {
  if (error instanceof Error) {
    return {
      code: 'PERMISSION_STORE_ERROR',
      message: error.message,
      cause: error,
    }
  }

  return {
    code: 'PERMISSION_STORE_ERROR',
    message: '取得角色權限時發生未知錯誤。',
    cause: error,
  }
}

export const usePermissionStore =
  defineStore('permission', () => {
    const role = ref<Role | null>(null)

    const permissions =
      ref<Permission[]>([])

    const isLoading = ref(false)

    const isInitialized = ref(false)

    const error =
      ref<PermissionStoreError | null>(
        null,
      )

    let initializePromise:
      Promise<void> | null = null

    const roleCode = computed(
      () => role.value?.code ?? null,
    )

    const roleName = computed(
      () => role.value?.name ?? '',
    )

    const permissionCodes = computed(
      () =>
        permissions.value.map(
          (permission) =>
            permission.code,
        ),
    )

    const isSuperAdmin = computed(
      () =>
        role.value?.code ===
        'super_admin',
    )

    const hasLoadedPermissions =
      computed(
        () =>
          isInitialized.value &&
          role.value !== null,
      )

    function setUserPermission(
      userPermission: UserPermission,
    ): void {
      role.value = userPermission.role

      permissions.value =
        userPermission.permissions
    }

    function clearPermissionState():
      void {
      role.value = null
      permissions.value = []
      isInitialized.value = false
      error.value = null
      initializePromise = null
    }

    function clearError(): void {
      error.value = null
    }

    async function fetchPermissions(
      force = false,
    ): Promise<void> {
      if (
        isInitialized.value &&
        !force
      ) {
        return
      }

      if (
        initializePromise &&
        !force
      ) {
        return initializePromise
      }

      initializePromise =
        (async () => {
          isLoading.value = true
          error.value = null

          try {
            const userPermission =
              await permissionApi
                .getCurrentUserPermissions()

            setUserPermission(
              userPermission,
            )

            isInitialized.value = true
          } catch (caughtError) {
            const normalizedError =
              normalizePermissionError(
                caughtError,
              )

            error.value =
              normalizedError

            role.value = null
            permissions.value = []
            isInitialized.value = false

            throw normalizedError
          } finally {
            isLoading.value = false
            initializePromise = null
          }
        })()

      return initializePromise
    }

    async function refreshPermissions():
      Promise<void> {
      await fetchPermissions(true)
    }

    function hasRole(
      requiredRole: string,
    ): boolean {
      if (!role.value) {
        return false
      }

      if (
        role.value.code ===
        'super_admin'
      ) {
        return true
      }

      return (
        role.value.code ===
        requiredRole
      )
    }

    function hasAnyRole(
      requiredRoles: string[],
    ): boolean {
      if (
        requiredRoles.length === 0
      ) {
        return true
      }

      if (!role.value) {
        return false
      }

      if (
        role.value.code ===
        'super_admin'
      ) {
        return true
      }

      return requiredRoles.includes(
        role.value.code,
      )
    }

    function hasPermission(
      requiredPermission: string,
    ): boolean {
      if (!role.value) {
        return false
      }

      if (
        role.value.code ===
        'super_admin'
      ) {
        return true
      }

      return permissionCodes.value.includes(
        requiredPermission,
      )
    }

    function hasAnyPermission(
      requiredPermissions: string[],
    ): boolean {
      if (
        requiredPermissions.length === 0
      ) {
        return true
      }

      if (!role.value) {
        return false
      }

      if (
        role.value.code ===
        'super_admin'
      ) {
        return true
      }

      return requiredPermissions.some(
        (permission) =>
          permissionCodes.value.includes(
            permission,
          ),
      )
    }

    function hasAllPermissions(
      requiredPermissions: string[],
    ): boolean {
      if (
        requiredPermissions.length === 0
      ) {
        return true
      }

      if (!role.value) {
        return false
      }

      if (
        role.value.code ===
        'super_admin'
      ) {
        return true
      }

      return requiredPermissions.every(
        (permission) =>
          permissionCodes.value.includes(
            permission,
          ),
      )
    }

    return {
      role,
      permissions,
      isLoading,
      isInitialized,
      error,

      roleCode,
      roleName,
      permissionCodes,
      isSuperAdmin,
      hasLoadedPermissions,

      fetchPermissions,
      refreshPermissions,

      setUserPermission,
      clearPermissionState,
      clearError,

      hasRole,
      hasAnyRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }
  })

export default usePermissionStore