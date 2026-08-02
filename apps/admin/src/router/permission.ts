import type {
  NavigationGuardWithThis,
  RouteLocationNormalized,
  Router,
} from 'vue-router'

import { supabase } from '../lib/supabase'
import { usePermissionStore } from '../stores/permission'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    roles?: string[]
    permissions?: string[]
  }
}

function getLoginRedirect(
  route: RouteLocationNormalized,
): string {
  if (
    route.path === '/login' ||
    route.path.startsWith('/auth/')
  ) {
    return '/'
  }

  return route.fullPath
}

async function hasAuthenticatedSession():
  Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error(
      '[Router Permission] 取得登入狀態失敗：',
      error.message,
    )

    return false
  }

  return Boolean(data.session?.user)
}

async function clearPermissionState():
  Promise<void> {
  const permissionStore =
    usePermissionStore()

  permissionStore.clearPermissionState()
}

async function loadUserPermissions():
  Promise<boolean> {
  const permissionStore =
    usePermissionStore()

  try {
    await permissionStore.fetchPermissions()

    return (
      permissionStore.isInitialized &&
      permissionStore.role !== null
    )
  } catch (error) {
    console.error(
      '[Router Permission] 載入角色權限失敗：',
      error,
    )

    permissionStore.clearPermissionState()

    return false
  }
}

function validateRouteRoles(
  requiredRoles: string[],
): boolean {
  if (requiredRoles.length === 0) {
    return true
  }

  const permissionStore =
    usePermissionStore()

  return permissionStore.hasAnyRole(
    requiredRoles,
  )
}

function validateRoutePermissions(
  requiredPermissions: string[],
): boolean {
  if (
    requiredPermissions.length === 0
  ) {
    return true
  }

  const permissionStore =
    usePermissionStore()

  return permissionStore.hasAllPermissions(
    requiredPermissions,
  )
}

const permissionGuard:
  NavigationGuardWithThis<undefined> =
  async (to) => {
    const requiresAuth =
      to.matched.some(
        (record) =>
          record.meta.requiresAuth,
      )

    const guestOnly =
      to.matched.some(
        (record) =>
          record.meta.guestOnly,
      )

    const authenticated =
      await hasAuthenticatedSession()

    if (guestOnly && authenticated) {
      return {
        path: '/',
        replace: true,
      }
    }

    if (
      requiresAuth &&
      !authenticated
    ) {
      await clearPermissionState()

      return {
        path: '/login',
        query: {
          redirect:
            getLoginRedirect(to),
        },
        replace: true,
      }
    }

    if (!requiresAuth) {
      return true
    }

    const permissionsLoaded =
      await loadUserPermissions()

    if (!permissionsLoaded) {
      await supabase.auth.signOut()
      await clearPermissionState()

      return {
        path: '/login',
        query: {
          redirect:
            getLoginRedirect(to),
          reason:
            'role_not_assigned',
        },
        replace: true,
      }
    }

    const requiredRoles =
      to.matched.flatMap(
        (record) =>
          record.meta.roles ?? [],
      )

    if (
      !validateRouteRoles(
        requiredRoles,
      )
    ) {
      return {
        path: '/403',
        query: {
          from: to.fullPath,
          reason: 'role_denied',
        },
        replace: true,
      }
    }

    const requiredPermissions =
      to.matched.flatMap(
        (record) =>
          record.meta.permissions ?? [],
      )

    if (
      !validateRoutePermissions(
        requiredPermissions,
      )
    ) {
      return {
        path: '/403',
        query: {
          from: to.fullPath,
          reason:
            'permission_denied',
        },
        replace: true,
      }
    }

    return true
  }

export function registerPermissionGuard(
  router: Router,
): void {
  router.beforeEach(permissionGuard)

  router.afterEach((to) => {
    const title =
      typeof to.meta.title === 'string'
        ? to.meta.title
        : ''

    document.title = title
      ? `${title} | ALADDIN Super Platform`
      : 'ALADDIN Super Platform'
  })
supabase.auth.onAuthStateChange(
  (event) => {
    if (event === 'SIGNED_OUT') {
      const permissionStore =
        usePermissionStore()

      permissionStore.clearPermissionState()
    }
  },
)
  
}

export default registerPermissionGuard