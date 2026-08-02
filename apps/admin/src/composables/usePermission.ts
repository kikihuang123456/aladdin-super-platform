import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import {
  usePermissionStore,
} from '../stores/permission'

export function usePermission() {
  const permissionStore =
    usePermissionStore()

  const {
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
  } = storeToRefs(permissionStore)

  const hasRoleAssigned = computed(
    () => role.value !== null,
  )

  const permissionCount = computed(
    () => permissions.value.length,
  )

  async function initializePermissions():
    Promise<void> {
    await permissionStore.fetchPermissions()
  }

  async function refreshPermissions():
    Promise<void> {
    await permissionStore.refreshPermissions()
  }

  function clearPermissionState(): void {
    permissionStore.clearPermissionState()
  }

  function clearError(): void {
    permissionStore.clearError()
  }

  function hasRole(
    requiredRole: string,
  ): boolean {
    return permissionStore.hasRole(
      requiredRole,
    )
  }

  function hasAnyRole(
    requiredRoles: string[],
  ): boolean {
    return permissionStore.hasAnyRole(
      requiredRoles,
    )
  }

  function hasPermission(
    requiredPermission: string,
  ): boolean {
    return permissionStore.hasPermission(
      requiredPermission,
    )
  }

  function hasAnyPermission(
    requiredPermissions: string[],
  ): boolean {
    return permissionStore.hasAnyPermission(
      requiredPermissions,
    )
  }

  function hasAllPermissions(
    requiredPermissions: string[],
  ): boolean {
    return permissionStore.hasAllPermissions(
      requiredPermissions,
    )
  }

  function canAccess(
    requiredRoles: string[] = [],
    requiredPermissions: string[] = [],
  ): boolean {
    if (!hasRoleAssigned.value) {
      return false
    }

    const roleAllowed =
      requiredRoles.length === 0 ||
      hasAnyRole(requiredRoles)

    const permissionAllowed =
      requiredPermissions.length === 0 ||
      hasAllPermissions(
        requiredPermissions,
      )

    return (
      roleAllowed &&
      permissionAllowed
    )
  }

  function canAccessAny(
    requiredRoles: string[] = [],
    requiredPermissions: string[] = [],
  ): boolean {
    if (!hasRoleAssigned.value) {
      return false
    }

    const roleAllowed =
      requiredRoles.length === 0 ||
      hasAnyRole(requiredRoles)

    const permissionAllowed =
      requiredPermissions.length === 0 ||
      hasAnyPermission(
        requiredPermissions,
      )

    return (
      roleAllowed &&
      permissionAllowed
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

    hasRoleAssigned,
    permissionCount,

    initializePermissions,
    refreshPermissions,

    clearPermissionState,
    clearError,

    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    canAccess,
    canAccessAny,
  }
}

export default usePermission