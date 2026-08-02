import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../stores/auth'

import type {
  LoginRequest,
  PermissionCode,
  UserRole,
} from '../types/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const {
    session,
    user,
    accessToken,
    refreshToken,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    isInitialized,
    isTokenExpired,
    tokenExpiresAt,
    error,
  } = storeToRefs(authStore)

  const userName = computed(
    () => user.value?.name ?? '',
  )

  const userEmail = computed(
    () => user.value?.email ?? '',
  )

  const userAvatar = computed(
    () => user.value?.avatarUrl ?? null,
  )

  const isSuperAdmin = computed(
    () => role.value === 'super_admin',
  )

  const isAdmin = computed(
    () =>
      role.value === 'super_admin' ||
      role.value === 'admin',
  )

  const isOperation = computed(
    () => role.value === 'operation',
  )

  const isFinance = computed(
    () => role.value === 'finance',
  )

  const isCustomerService = computed(
    () => role.value === 'customer_service',
  )

  const isMerchant = computed(
    () => role.value === 'merchant',
  )

  const isDealer = computed(
    () => role.value === 'dealer',
  )

  const isMember = computed(
    () => role.value === 'member',
  )

  async function login(
    payload: LoginRequest,
  ) {
    return authStore.login(payload)
  }

  async function logout(): Promise<void> {
    await authStore.logout()
  }

  async function initialize():
    Promise<void> {
    await authStore.initialize()
  }

  async function refreshSession():
    Promise<string | null> {
    return authStore.refreshSession()
  }

  async function fetchCurrentUser() {
    return authStore.fetchCurrentUser()
  }

  async function getValidAccessToken():
    Promise<string | null> {
    return authStore.getValidAccessToken()
  }

  function clearError(): void {
    authStore.clearError()
  }

  function clearSession(): void {
    authStore.clearSession()
  }

  function hasRole(
    requiredRole: UserRole,
  ): boolean {
    return authStore.hasRole(requiredRole)
  }

  function hasAnyRole(
    requiredRoles: UserRole[],
  ): boolean {
    return authStore.hasAnyRole(requiredRoles)
  }

  function hasPermission(
    requiredPermission: PermissionCode,
  ): boolean {
    return authStore.hasPermission(
      requiredPermission,
    )
  }

  function hasAnyPermission(
    requiredPermissions: PermissionCode[],
  ): boolean {
    return authStore.hasAnyPermission(
      requiredPermissions,
    )
  }

  function hasAllPermissions(
    requiredPermissions: PermissionCode[],
  ): boolean {
    return authStore.hasAllPermissions(
      requiredPermissions,
    )
  }

  function canAccess(
    requiredRoles: UserRole[] = [],
    requiredPermissions:
      PermissionCode[] = [],
  ): boolean {
    if (!isAuthenticated.value) {
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

    return roleAllowed && permissionAllowed
  }

  return {
    session,
    user,
    accessToken,
    refreshToken,
    role,
    permissions,

    isAuthenticated,
    isLoading,
    isInitialized,
    isTokenExpired,
    tokenExpiresAt,
    error,

    userName,
    userEmail,
    userAvatar,

    isSuperAdmin,
    isAdmin,
    isOperation,
    isFinance,
    isCustomerService,
    isMerchant,
    isDealer,
    isMember,

    login,
    logout,
    initialize,
    refreshSession,
    fetchCurrentUser,
    getValidAccessToken,

    clearError,
    clearSession,

    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
  }
}

export default useAuth