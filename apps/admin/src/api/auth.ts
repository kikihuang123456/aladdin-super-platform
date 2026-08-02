import type {
  AuthError,
  AuthUser,
  ChangePasswordRequest,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LoginTokenPayload,
  LogoutRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserRole,
} from '../types/auth'

import { supabase } from '../lib/supabase'

interface RoleQueryRecord {
  role:
    | {
        code: string
      }
    | {
        code: string
      }[]
    | null
}

interface PermissionQueryRecord {
  role:
    | {
        role_permissions:
          | {
              permission:
                | {
                    code: string
                  }
                | {
                    code: string
                  }[]
                | null
            }[]
          | null
      }
    | {
        role_permissions:
          | {
              permission:
                | {
                    code: string
                  }
                | {
                    code: string
                  }[]
                | null
            }[]
          | null
      }[]
    | null
}

function normalizeAuthError(
  error: unknown,
): AuthError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    const source = error as {
      message?: string
      status?: number
      code?: string
    }

    return {
      code:
        source.code ||
        'SUPABASE_AUTH_ERROR',
      message:
        source.message ||
        '驗證服務發生錯誤。',
      status: source.status,
    }
  }

  if (error instanceof Error) {
    return {
      code: 'SUPABASE_AUTH_ERROR',
      message: error.message,
    }
  }

  return {
    code: 'SUPABASE_AUTH_ERROR',
    message: '驗證服務發生未知錯誤。',
  }
}

function normalizeRole(
  value: string | undefined,
): UserRole {
  switch (value) {
    case 'super_admin':
      return 'super_admin'

    case 'system_admin':
      return 'admin'

    case 'operation_admin':
      return 'operation'

    case 'finance_admin':
      return 'finance'

    case 'customer_service':
      return 'customer_service'

    case 'merchant_admin':
      return 'merchant'

    case 'dealer_admin':
      return 'dealer'

    case 'member':
      return 'member'

    default:
      return 'member'
  }
}

async function getUserRole(
  userId: string,
): Promise<UserRole> {
  const {
    data,
    error,
  } = await supabase
    .from('user_roles')
    .select(`
      role:roles (
        code
      )
    `)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  const record =
    data as RoleQueryRecord | null

  const role = Array.isArray(
    record?.role,
  )
    ? record?.role[0]
    : record?.role

  return normalizeRole(role?.code)
}

async function getUserPermissions(
  userId: string,
): Promise<AuthUser['permissions']> {
  const {
    data,
    error,
  } = await supabase
    .from('user_roles')
    .select(`
      role:roles (
        role_permissions (
          permission:permissions (
            code
          )
        )
      )
    `)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  const record =
    data as PermissionQueryRecord | null

  const role = Array.isArray(
    record?.role,
  )
    ? record?.role[0]
    : record?.role

  const rows =
    role?.role_permissions ?? []

  return rows
    .map((row) => {
      const permission =
        Array.isArray(row.permission)
          ? row.permission[0]
          : row.permission

      return permission?.code
    })
    .filter(
      (
        code,
      ): code is AuthUser['permissions'][number] =>
        typeof code === 'string',
    )
}

async function mapSupabaseUser(
  user: {
    id: string
    email?: string
    phone?: string
    created_at: string
    updated_at?: string
    last_sign_in_at?: string
    user_metadata?: Record<
      string,
      unknown
    >
  },
): Promise<AuthUser> {
  const [
    role,
    permissions,
  ] = await Promise.all([
    getUserRole(user.id),
    getUserPermissions(user.id),
  ])

  const metadata =
    user.user_metadata ?? {}

  const displayName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : user.email?.split('@')[0] ||
          'ALADDIN 使用者'

  const avatarUrl =
    typeof metadata.avatar_url ===
    'string'
      ? metadata.avatar_url
      : null

  return {
    id: user.id,
    email: user.email ?? '',
    name: displayName,
    avatarUrl,
    phone: user.phone ?? null,
    role,
    permissions,
    isActive: true,
    createdAt: user.created_at,
    updatedAt:
      user.updated_at ??
      user.created_at,
    lastLoginAt:
      user.last_sign_in_at ?? null,
  }
}

function mapSessionTokens(
  session: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    expires_at?: number
  },
): LoginTokenPayload {
  return {
    accessToken:
      session.access_token,
    refreshToken:
      session.refresh_token,
    tokenType: 'Bearer',
    expiresIn:
      session.expires_in,
    expiresAt:
      session.expires_at
        ? session.expires_at * 1000
        : Date.now() +
          session.expires_in * 1000,
  }
}

export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  try {
    const {
      data,
      error,
    } =
      await supabase.auth
        .signInWithPassword({
          email:
            payload.email
              .trim()
              .toLowerCase(),
          password:
            payload.password,
        })

    if (error) {
      throw error
    }

    if (
      !data.user ||
      !data.session
    ) {
      throw new Error(
        '登入成功，但未取得有效登入階段。',
      )
    }

    const user =
      await mapSupabaseUser(
        data.user,
      )

    return {
      user,
      tokens:
        mapSessionTokens(
          data.session,
        ),
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function logout(
  _payload: LogoutRequest = {},
  _accessToken?: string,
): Promise<void> {
  try {
    const {
      error,
    } =
      await supabase.auth.signOut()

    if (error) {
      throw error
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function refreshAccessToken(
  payload: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  try {
    const {
      data,
      error,
    } =
      await supabase.auth
        .refreshSession({
          refresh_token:
            payload.refreshToken,
        })

    if (error) {
      throw error
    }

    if (!data.session) {
      throw new Error(
        '無法更新登入階段。',
      )
    }

    return {
      tokens:
        mapSessionTokens(
          data.session,
        ),
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function getCurrentUser(
  _accessToken?: string,
): Promise<CurrentUserResponse> {
  try {
    const {
      data,
      error,
    } =
      await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error(
        '目前沒有已登入使用者。',
      )
    }

    return {
      user:
        await mapSupabaseUser(
          data.user,
        ),
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<void> {
  try {
    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          payload.email
            .trim()
            .toLowerCase(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          },
        )

    if (error) {
      throw error
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function confirmPasswordReset(
  payload:
    PasswordResetConfirmRequest,
): Promise<void> {
  try {
    if (
      payload.password !==
      payload.passwordConfirmation
    ) {
      throw new Error(
        '兩次輸入的新密碼不一致。',
      )
    }

    const {
      error,
    } =
      await supabase.auth
        .updateUser({
          password:
            payload.password,
        })

    if (error) {
      throw error
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function changePassword(
  payload: ChangePasswordRequest,
  _accessToken?: string,
): Promise<void> {
  try {
    if (
      payload.newPassword !==
      payload.newPasswordConfirmation
    ) {
      throw new Error(
        '兩次輸入的新密碼不一致。',
      )
    }

    const {
      error,
    } =
      await supabase.auth
        .updateUser({
          password:
            payload.newPassword,
        })

    if (error) {
      throw error
    }
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export const authApi = {
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
}

export default authApi