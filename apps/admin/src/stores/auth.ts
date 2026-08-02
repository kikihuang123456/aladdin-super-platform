import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import type {
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js'

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshAccessToken,
} from '../api/auth'

import {
  supabase,
} from '../lib/supabase'

import type {
  AuthError,
  AuthSession,
  AuthUser,
  LoginRequest,
  PermissionCode,
  UserRole,
} from '../types/auth'

function normalizeStoreError(
  error: unknown,
): AuthError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  ) {
    return error as AuthError
  }

  if (error instanceof Error) {
    return {
      code: 'AUTH_STORE_ERROR',
      message: error.message,
    }
  }

  return {
    code: 'AUTH_STORE_ERROR',
    message: '登入驗證程序發生未知錯誤。',
  }
}

function mapSupabaseSession(
  supabaseSession: Session,
  user: AuthUser,
  rememberMe = true,
): AuthSession {
  return {
    user,
    accessToken:
      supabaseSession.access_token,

    refreshToken:
      supabaseSession.refresh_token,

    tokenType: 'Bearer',

    expiresAt:
      supabaseSession.expires_at
        ? supabaseSession.expires_at * 1000
        : Date.now() +
          supabaseSession.expires_in * 1000,

    rememberMe,
  }
}

export const useAuthStore =
  defineStore('auth', () => {
    const session =
      ref<AuthSession | null>(null)

    const isLoading = ref(false)

    const isInitialized = ref(false)

    const error =
      ref<AuthError | null>(null)

    let initializePromise:
      Promise<void> | null = null

    let authListenerRegistered = false

    const user = computed<AuthUser | null>(
      () => session.value?.user ?? null,
    )

    const accessToken = computed(
      () =>
        session.value?.accessToken ?? null,
    )

    const refreshToken = computed(
      () =>
        session.value?.refreshToken ?? null,
    )

    const isAuthenticated = computed(
      () =>
        Boolean(
          session.value?.user?.isActive &&
          session.value?.accessToken,
        ),
    )

    const role = computed<UserRole | null>(
      () => user.value?.role ?? null,
    )

    const permissions = computed<
      PermissionCode[]
    >(
      () =>
        user.value?.permissions ?? [],
    )

    const tokenExpiresAt = computed(
      () =>
        session.value?.expiresAt ?? null,
    )

    const isTokenExpired = computed(() => {
      if (!session.value) {
        return true
      }

      const expiryBuffer = 30_000

      return (
        Date.now() >=
        session.value.expiresAt -
          expiryBuffer
      )
    })

    function setSession(
      nextSession: AuthSession,
    ): void {
      session.value = nextSession
    }

    function clearSession(): void {
      session.value = null
    }

    function clearError(): void {
      error.value = null
    }

    function updateUser(
      nextUser: AuthUser,
    ): void {
      if (!session.value) {
        return
      }

      session.value = {
        ...session.value,
        user: nextUser,
      }
    }

    async function hydrateFromSupabaseSession(
      supabaseSession: Session,
      rememberMe = true,
    ): Promise<AuthUser> {
      const response =
        await getCurrentUser(
          supabaseSession.access_token,
        )

      const nextSession =
        mapSupabaseSession(
          supabaseSession,
          response.user,
          rememberMe,
        )

      setSession(nextSession)

      return response.user
    }

    async function login(
      payload: LoginRequest,
    ): Promise<AuthUser> {
      isLoading.value = true
      error.value = null

      try {
        const response =
          await loginApi(payload)

        const {
          data,
          error: sessionError,
        } =
          await supabase.auth
            .getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!data.session) {
          throw new Error(
            '登入成功，但未取得 Supabase Session。',
          )
        }

        const nextSession: AuthSession = {
          user: response.user,

          accessToken:
            response.tokens.accessToken,

          refreshToken:
            response.tokens.refreshToken,

          tokenType:
            response.tokens.tokenType,

          expiresAt:
            response.tokens.expiresAt,

          rememberMe:
            payload.rememberMe,
        }

        setSession(nextSession)

        return response.user
      } catch (caughtError) {
        const normalizedError =
          normalizeStoreError(
            caughtError,
          )

        error.value =
          normalizedError

        clearSession()

        throw normalizedError
      } finally {
        isLoading.value = false
      }
    }

    async function logout():
      Promise<void> {
      isLoading.value = true
      error.value = null

      try {
        await logoutApi(
          {
            refreshToken:
              session.value
                ?.refreshToken,
          },
          session.value
            ?.accessToken,
        )
      } catch (caughtError) {
        error.value =
          normalizeStoreError(
            caughtError,
          )
      } finally {
        clearSession()
        isLoading.value = false
      }
    }

    async function refreshSession():
      Promise<string | null> {
      if (
        !session.value
          ?.refreshToken
      ) {
        clearSession()
        return null
      }

      try {
        const response =
          await refreshAccessToken({
            refreshToken:
              session.value
                .refreshToken,
          })

        if (!session.value) {
          return null
        }

        session.value = {
          ...session.value,

          accessToken:
            response.tokens
              .accessToken,

          refreshToken:
            response.tokens
              .refreshToken,

          tokenType:
            response.tokens
              .tokenType,

          expiresAt:
            response.tokens
              .expiresAt,
        }

        return response.tokens
          .accessToken
      } catch (caughtError) {
        error.value =
          normalizeStoreError(
            caughtError,
          )

        clearSession()

        return null
      }
    }

    async function getValidAccessToken():
      Promise<string | null> {
      const {
        data,
        error: sessionError,
      } =
        await supabase.auth
          .getSession()

      if (sessionError) {
        error.value =
          normalizeStoreError(
            sessionError,
          )

        clearSession()

        return null
      }

      if (!data.session) {
        clearSession()
        return null
      }

      if (!isTokenExpired.value) {
        return (
          session.value
            ?.accessToken ??
          data.session.access_token
        )
      }

      return refreshSession()
    }

    async function fetchCurrentUser():
      Promise<AuthUser | null> {
      try {
        const {
          data,
          error: sessionError,
        } =
          await supabase.auth
            .getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!data.session) {
          clearSession()
          return null
        }

        const response =
          await getCurrentUser(
            data.session.access_token,
          )

        if (session.value) {
          updateUser(
            response.user,
          )
        } else {
          setSession(
            mapSupabaseSession(
              data.session,
              response.user,
            ),
          )
        }

        return response.user
      } catch (caughtError) {
        error.value =
          normalizeStoreError(
            caughtError,
          )

        clearSession()

        return null
      }
    }

    function registerAuthListener():
      void {
      if (
        authListenerRegistered
      ) {
        return
      }

      authListenerRegistered =
        true

      supabase.auth
        .onAuthStateChange(
          (
            event:
              AuthChangeEvent,
            nextSession,
          ) => {
            void handleAuthStateChange(
              event,
              nextSession,
            )
          },
        )
    }

    async function handleAuthStateChange(
      event: AuthChangeEvent,
      nextSupabaseSession:
        Session | null,
    ): Promise<void> {
      if (
        event === 'SIGNED_OUT'
      ) {
        clearSession()
        return
      }

      if (
        !nextSupabaseSession
      ) {
        return
      }

      if (
        event === 'TOKEN_REFRESHED'
      ) {
        if (!session.value) {
          return
        }

        session.value = {
          ...session.value,

          accessToken:
            nextSupabaseSession
              .access_token,

          refreshToken:
            nextSupabaseSession
              .refresh_token,

          expiresAt:
            nextSupabaseSession
              .expires_at
              ? nextSupabaseSession
                  .expires_at *
                1000
              : Date.now() +
                nextSupabaseSession
                  .expires_in *
                  1000,
        }

        return
      }

      if (
        event === 'SIGNED_IN' ||
        event ===
          'INITIAL_SESSION' ||
        event ===
          'USER_UPDATED'
      ) {
        try {
          await hydrateFromSupabaseSession(
            nextSupabaseSession,
            session.value
              ?.rememberMe ??
              true,
          )
        } catch (caughtError) {
          error.value =
            normalizeStoreError(
              caughtError,
            )
        }
      }
    }

    async function initialize():
      Promise<void> {
      if (
        isInitialized.value
      ) {
        return
      }

      if (
        initializePromise
      ) {
        return initializePromise
      }

      initializePromise =
        (async () => {
          isLoading.value = true
          error.value = null

          try {
            registerAuthListener()

            const {
              data,
              error: sessionError,
            } =
              await supabase.auth
                .getSession()

            if (sessionError) {
              throw sessionError
            }

            if (!data.session) {
              clearSession()
              return
            }

            await hydrateFromSupabaseSession(
              data.session,
            )
          } catch (caughtError) {
            error.value =
              normalizeStoreError(
                caughtError,
              )

            clearSession()
          } finally {
            isInitialized.value =
              true

            isLoading.value =
              false

            initializePromise =
              null
          }
        })()

      return initializePromise
    }

    function hasRole(
      requiredRole: UserRole,
    ): boolean {
      if (!user.value?.isActive) {
        return false
      }

      if (
        user.value.role ===
        'super_admin'
      ) {
        return true
      }

      return (
        user.value.role ===
        requiredRole
      )
    }

    function hasAnyRole(
      requiredRoles: UserRole[],
    ): boolean {
      if (!user.value?.isActive) {
        return false
      }

      if (
        user.value.role ===
        'super_admin'
      ) {
        return true
      }

      return requiredRoles.includes(
        user.value.role,
      )
    }

    function hasPermission(
      requiredPermission:
        PermissionCode,
    ): boolean {
      if (!user.value?.isActive) {
        return false
      }

      if (
        user.value.role ===
        'super_admin'
      ) {
        return true
      }

      return (
        user.value.permissions
          .includes(
            requiredPermission,
          )
      )
    }

    function hasAnyPermission(
      requiredPermissions:
        PermissionCode[],
    ): boolean {
      if (!user.value?.isActive) {
        return false
      }

      if (
        user.value.role ===
        'super_admin'
      ) {
        return true
      }

      return requiredPermissions
        .some(
          (permission) =>
            user.value!
              .permissions
              .includes(
                permission,
              ),
        )
    }

    function hasAllPermissions(
      requiredPermissions:
        PermissionCode[],
    ): boolean {
      if (!user.value?.isActive) {
        return false
      }

      if (
        user.value.role ===
        'super_admin'
      ) {
        return true
      }

      return requiredPermissions
        .every(
          (permission) =>
            user.value!
              .permissions
              .includes(
                permission,
              ),
        )
    }

    return {
      session,
      isLoading,
      isInitialized,
      error,

      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      role,
      permissions,
      tokenExpiresAt,
      isTokenExpired,

      login,
      logout,
      initialize,
      refreshSession,
      fetchCurrentUser,
      getValidAccessToken,

      setSession,
      updateUser,
      clearSession,
      clearError,

      hasRole,
      hasAnyRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }
  })

export default useAuthStore