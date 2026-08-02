import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  Router,
} from 'vue-router'

import { useAuthStore } from '../stores/auth'

import type {
  PermissionCode,
  UserRole,
} from '../types/auth'

interface AuthRouteMeta {
  requiresAuth?: boolean
  guestOnly?: boolean
  roles?: UserRole[]
  permissions?: PermissionCode[]
}

function getRouteMeta(
  route: RouteLocationNormalized,
): AuthRouteMeta {
  return route.meta as AuthRouteMeta
}

function getLoginRedirectPath(
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

function redirectToLogin(
  route: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  next({
    path: '/login',
    query: {
      redirect: getLoginRedirectPath(route),
    },
  })
}

function redirectToForbidden(
  route: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  next({
    path: '/403',
    query: {
      from: route.fullPath,
    },
  })
}

function hasRequiredRole(
  requiredRoles: UserRole[],
): boolean {
  if (requiredRoles.length === 0) {
    return true
  }

  const authStore = useAuthStore()

  return authStore.hasAnyRole(requiredRoles)
}

function hasRequiredPermissions(
  requiredPermissions: PermissionCode[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true
  }

  const authStore = useAuthStore()

  return authStore.hasAllPermissions(
    requiredPermissions,
  )
}

async function ensureAuthInitialized():
  Promise<void> {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
}

async function ensureValidSession():
  Promise<boolean> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return false
  }

  const validAccessToken =
    await authStore.getValidAccessToken()

  return Boolean(validAccessToken)
}

async function authenticationGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> {
  const authStore = useAuthStore()
  const meta = getRouteMeta(to)

  try {
    await ensureAuthInitialized()

    if (meta.guestOnly) {
      if (authStore.isAuthenticated) {
        next({
          path: '/',
          replace: true,
        })

        return
      }

      next()
      return
    }

    if (!meta.requiresAuth) {
      next()
      return
    }

    const hasValidSession =
      await ensureValidSession()

    if (!hasValidSession) {
      authStore.clearSession()
      redirectToLogin(to, next)
      return
    }

    const requiredRoles =
      meta.roles ?? []

    if (
      !hasRequiredRole(requiredRoles)
    ) {
      redirectToForbidden(to, next)
      return
    }

    const requiredPermissions =
      meta.permissions ?? []

    if (
      !hasRequiredPermissions(
        requiredPermissions,
      )
    ) {
      redirectToForbidden(to, next)
      return
    }

    next()
  } catch {
    authStore.clearSession()

    if (meta.requiresAuth) {
      redirectToLogin(to, next)
      return
    }

    next()
  }
}

export function registerRouterGuards(
  router: Router,
): void {
  router.beforeEach(authenticationGuard)

  router.afterEach((to) => {
    const title =
      typeof to.meta.title === 'string'
        ? to.meta.title
        : ''

    document.title = title
      ? `${title} | ALADDIN Admin`
      : 'ALADDIN Admin'
  })

  router.onError((error) => {
    console.error(
      '[Router Error]',
      error,
    )
  })
}

export default registerRouterGuards