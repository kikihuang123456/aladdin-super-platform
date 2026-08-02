import { supabase } from '../lib/supabase'

export interface Permission {
  id: string
  code: string
  name: string
  description?: string
}

export interface Role {
  id: string
  code: string
  name: string
}

export interface UserPermission {
  role: Role
  permissions: Permission[]
}

class PermissionApi {
      async getCurrentUserPermissions():
    Promise<UserPermission> {
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      throw new Error(
        `取得登入使用者失敗：${authError.message}`,
      )
    }

    const userId = authData.user?.id

    if (!userId) {
      throw new Error(
        '目前沒有已登入的使用者。',
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from('user_roles')
      .select(`
        role:roles (
          id,
          code,
          name,
          role_permissions (
            permission:permissions (
              id,
              code,
              name,
              module
            )
          )
        )
      `)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(
        `取得角色權限失敗：${error.message}`,
      )
    }

    if (!data?.role) {
      throw new Error(
        '目前帳號尚未指派任何系統角色。',
      )
    }

    const roleRecord =
      Array.isArray(data.role)
        ? data.role[0]
        : data.role

    if (!roleRecord) {
      throw new Error(
        '找不到目前帳號的角色資料。',
      )
    }

    const permissionRows =
      roleRecord.role_permissions ?? []

    const permissions = permissionRows
  .map((item) => {
    const permission = Array.isArray(item.permission)
      ? item.permission[0]
      : item.permission

    if (!permission) {
      return undefined
    }

    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.module,
    } as Permission
  })
  .filter(
    (permission): permission is Permission =>
      permission !== undefined,
  )

    return {
      role: {
        id: roleRecord.id,
        code: roleRecord.code,
        name: roleRecord.name,
      },
      permissions,
    }
  }

  async hasPermission(
    permissionCode: string,
  ): Promise<boolean> {
    const userPermission =
      await this.getCurrentUserPermissions()

    if (
      userPermission.role.code ===
      'super_admin'
    ) {
      return true
    }

    return userPermission.permissions.some(
      (permission) =>
        permission.code === permissionCode,
    )
  }

  async hasAnyPermission(
    permissionCodes: string[],
  ): Promise<boolean> {
    if (permissionCodes.length === 0) {
      return true
    }

    const userPermission =
      await this.getCurrentUserPermissions()

    if (
      userPermission.role.code ===
      'super_admin'
    ) {
      return true
    }

    return permissionCodes.some(
      (permissionCode) =>
        userPermission.permissions.some(
          (permission) =>
            permission.code ===
            permissionCode,
        ),
    )
  }

  async hasAllPermissions(
    permissionCodes: string[],
  ): Promise<boolean> {
    if (permissionCodes.length === 0) {
      return true
    }

    const userPermission =
      await this.getCurrentUserPermissions()

    if (
      userPermission.role.code ===
      'super_admin'
    ) {
      return true
    }

    return permissionCodes.every(
      (permissionCode) =>
        userPermission.permissions.some(
          (permission) =>
            permission.code ===
            permissionCode,
        ),
    )
  }
    async getCurrentUserRole():
    Promise<Role> {
    const userPermission =
      await this.getCurrentUserPermissions()

    return userPermission.role
  }

  async hasRole(
    roleCode: string,
  ): Promise<boolean> {
    const role =
      await this.getCurrentUserRole()

    if (role.code === 'super_admin') {
      return true
    }

    return role.code === roleCode
  }

  async hasAnyRole(
    roleCodes: string[],
  ): Promise<boolean> {
    if (roleCodes.length === 0) {
      return true
    }

    const role =
      await this.getCurrentUserRole()

    if (role.code === 'super_admin') {
      return true
    }

    return roleCodes.includes(role.code)
  }
}

export const permissionApi =
  new PermissionApi()

export default permissionApi
