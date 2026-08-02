export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'operation'
  | 'finance'
  | 'customer_service'
  | 'merchant'
  | 'dealer'
  | 'member'

export type PermissionCode =
  | 'dashboard.view'
  | 'member.view'
  | 'member.create'
  | 'member.update'
  | 'member.delete'
  | 'merchant.view'
  | 'merchant.create'
  | 'merchant.update'
  | 'merchant.approve'
  | 'dealer.view'
  | 'dealer.create'
  | 'dealer.update'
  | 'dealer.approve'
  | 'mall.view'
  | 'mall.create'
  | 'mall.update'
  | 'mall.publish'
  | 'travel.view'
  | 'travel.create'
  | 'travel.update'
  | 'travel.publish'
  | 'ai.view'
  | 'ai.manage'
  | 'system.view'
  | 'system.manage'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  phone: string | null
  role: UserRole
  permissions: PermissionCode[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginTokenPayload {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  expiresAt: number
}

export interface LoginResponse {
  user: AuthUser
  tokens: LoginTokenPayload
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  tokens: LoginTokenPayload
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresAt: number
  rememberMe: boolean
}

export interface AuthState {
  session: AuthSession | null
  isLoading: boolean
  isInitialized: boolean
  error: AuthError | null
}

export interface AuthError {
  code: string
  message: string
  status?: number
  details?: Record<string, unknown>
}

export interface LogoutRequest {
  refreshToken?: string
}

export interface CurrentUserResponse {
  user: AuthUser
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
  passwordConfirmation: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

export function isUserRole(
  value: unknown,
): value is UserRole {
  return (
    value === 'super_admin' ||
    value === 'admin' ||
    value === 'operation' ||
    value === 'finance' ||
    value === 'customer_service' ||
    value === 'merchant' ||
    value === 'dealer' ||
    value === 'member'
  )
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: PermissionCode,
): boolean {
  if (!user || !user.isActive) {
    return false
  }

  if (user.role === 'super_admin') {
    return true
  }

  return user.permissions.includes(permission)
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: PermissionCode[],
): boolean {
  if (!user || !user.isActive) {
    return false
  }

  if (user.role === 'super_admin') {
    return true
  }

  return permissions.some((permission) =>
    user.permissions.includes(permission),
  )
}

export function hasAllPermissions(
  user: AuthUser | null | undefined,
  permissions: PermissionCode[],
): boolean {
  if (!user || !user.isActive) {
    return false
  }

  if (user.role === 'super_admin') {
    return true
  }

  return permissions.every((permission) =>
    user.permissions.includes(permission),
  )
}