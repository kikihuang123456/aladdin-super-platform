import {
  supabase,
} from '../lib/supabase'


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


export interface RolePermissionMatrixRole {
  id: string
  code: string
  name: string
  description: string | undefined
  locked: boolean
}


export interface RolePermissionMatrixPermission {
  id: string
  code: string
  name: string
  module: string
}


export interface RolePermissionMatrixAssignment {
  roleId: string
  permissionId: string
}


export interface RolePermissionMatrix {
  roles: RolePermissionMatrixRole[]
  permissions: RolePermissionMatrixPermission[]
  assignments: RolePermissionMatrixAssignment[]
}


export interface UpdateRolePermissionsResult {
  success: boolean
  message: string
  roleId: string
  roleCode: string
  assignedCount: number
}


interface PermissionRecord {
  id?: unknown
  code?: unknown
  name?: unknown
  module?: unknown
  description?: unknown
}


interface RolePermissionRecord {
  permission?:
    | PermissionRecord
    | PermissionRecord[]
    | null
}


interface RoleRecord {
  id?: unknown
  code?: unknown
  name?: unknown
  role_permissions?:
    | RolePermissionRecord[]
    | null
}


interface UserRoleRecord {
  role?:
    | RoleRecord
    | RoleRecord[]
    | null
}


const ROLE_PRIORITY:
  Record<string, number> = {

  super_admin:
    1,

  system_admin:
    2,

  operation_admin:
    3,

  dealer_admin:
    4,

  merchant_admin:
    5,

  finance_admin:
    6,

  customer_service:
    7,

  member:
    8,

}


function normalizeString(
  value: unknown,
  fallback = '',
): string {

  return typeof value === 'string'
    ? value
    : fallback

}


function normalizeApiError(
  errorValue: unknown,
  fallback: string,
): string {

  if (
    errorValue instanceof Error
  ) {

    return errorValue.message

  }


  if (
    typeof errorValue === 'object' &&
    errorValue !== null
  ) {

    const errorRecord =
      errorValue as Record<
        string,
        unknown
      >


    const parts = [

      typeof errorRecord.message ===
      'string'
        ? errorRecord.message
        : '',

      typeof errorRecord.details ===
      'string'
        ? errorRecord.details
        : '',

      typeof errorRecord.hint ===
      'string'
        ? `提示：${errorRecord.hint}`
        : '',

      typeof errorRecord.code ===
      'string'
        ? `錯誤代碼：${errorRecord.code}`
        : '',

    ].filter(Boolean)


    if (
      parts.length > 0
    ) {

      return parts.join('；')

    }

  }


  return fallback

}


function normalizeRoleRecord(
  value:
    UserRoleRecord['role'],
): RoleRecord | null {

  if (
    Array.isArray(value)
  ) {

    return value[0] ?? null

  }


  if (
    value &&
    typeof value === 'object'
  ) {

    return value

  }


  return null

}


function normalizePermissionRecord(
  value:
    RolePermissionRecord['permission'],
): PermissionRecord | null {

  if (
    Array.isArray(value)
  ) {

    return value[0] ?? null

  }


  if (
    value &&
    typeof value === 'object'
  ) {

    return value

  }


  return null

}


function mapRole(
  record: RoleRecord,
): Role {

  return {

    id:
      normalizeString(
        record.id,
      ),

    code:
      normalizeString(
        record.code,
      ),

    name:
      normalizeString(
        record.name,
      ),

  }

}


function mapPermission(
  record: PermissionRecord,
): Permission | null {

  const id =
    normalizeString(
      record.id,
    )


  const code =
    normalizeString(
      record.code,
    )


  const name =
    normalizeString(
      record.name,
    )


  if (
    !id ||
    !code ||
    !name
  ) {

    return null

  }


  const description =
    normalizeString(
      record.description,
      normalizeString(
        record.module,
      ),
    )


  return {

    id,

    code,

    name,

    description:
      description ||
      undefined,

  }

}


function getRolePriority(
  roleCode: string,
): number {

  return (
    ROLE_PRIORITY[
      roleCode
    ] ??
    999
  )

}


function selectPrimaryRole(
  roles: Role[],
): Role | null {

  if (
    roles.length === 0
  ) {

    return null

  }


  return [
    ...roles,
  ].sort(
    (
      roleA,
      roleB,
    ) =>
      getRolePriority(
        roleA.code,
      )
      -
      getRolePriority(
        roleB.code,
      ),
  )[0] ?? null

}


function mergePermissions(
  records:
    UserRoleRecord[],
): Permission[] {

  const permissionMap =
    new Map<
      string,
      Permission
    >()


  for (
    const userRoleRecord
    of records
  ) {

    const roleRecord =
      normalizeRoleRecord(
        userRoleRecord.role,
      )


    if (
      !roleRecord
    ) {

      continue

    }


    const rolePermissions =
      Array.isArray(
        roleRecord.role_permissions,
      )
        ? roleRecord.role_permissions
        : []


    for (
      const rolePermission
      of rolePermissions
    ) {

      const permissionRecord =
        normalizePermissionRecord(
          rolePermission.permission,
        )


      if (
        !permissionRecord
      ) {

        continue

      }


      const permission =
        mapPermission(
          permissionRecord,
        )


      if (
        !permission
      ) {

        continue

      }


      permissionMap.set(
        permission.code,
        permission,
      )

    }

  }


  return Array.from(
    permissionMap.values(),
  ).sort(
    (
      permissionA,
      permissionB,
    ) =>
      permissionA.code.localeCompare(
        permissionB.code,
      ),
  )

}


class PermissionApi {

  async getCurrentUserPermissions():
    Promise<UserPermission> {

    const {
      data:
        authData,

      error:
        authError,
    } =
      await supabase.auth
        .getUser()


    if (
      authError
    ) {

      throw new Error(
        `取得登入使用者失敗：${authError.message}`,
      )

    }


    const userId =
      authData.user?.id


    if (
      !userId
    ) {

      throw new Error(
        '目前沒有已登入的使用者。',
      )

    }


    const {
      data,
      error,
    } =
      await supabase
        .from(
          'user_roles',
        )
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
        .eq(
          'user_id',
          userId,
        )


    if (
      error
    ) {

      throw new Error(
        normalizeApiError(
          error,
          '取得角色權限失敗。',
        ),
      )

    }


    const userRoleRecords =
      (
        data ?? []
      ) as unknown as
        UserRoleRecord[]


    if (
      userRoleRecords.length === 0
    ) {

      throw new Error(
        '目前帳號尚未指派任何系統角色。',
      )

    }


    const roles =
      userRoleRecords
        .map(
          (
            userRoleRecord,
          ) =>
            normalizeRoleRecord(
              userRoleRecord.role,
            ),
        )
        .filter(
          (
            roleRecord,
          ): roleRecord is RoleRecord =>
            roleRecord !== null,
        )
        .map(
          (
            roleRecord,
          ) =>
            mapRole(
              roleRecord,
            ),
        )
        .filter(
          (
            role,
          ) =>
            Boolean(
              role.id &&
              role.code,
            ),
        )


    const primaryRole =
      selectPrimaryRole(
        roles,
      )


    if (
      !primaryRole
    ) {

      throw new Error(
        '找不到目前帳號的有效角色資料。',
      )

    }


    const permissions =
      mergePermissions(
        userRoleRecords,
      )


    return {

      role:
        primaryRole,

      permissions,

    }

  }


  async getRolePermissionMatrix():
    Promise<RolePermissionMatrix> {

    const {
      data,
      error,
    } =
      await supabase.rpc(
        'get_role_permission_matrix',
      )


    if (
      error
    ) {

      throw new Error(
        normalizeApiError(
          error,
          '取得角色權限矩陣失敗。',
        ),
      )

    }


    if (
      !data
      ||
      typeof data !== 'object'
    ) {

      throw new Error(
        '角色權限矩陣未回傳有效資料。',
      )

    }


    const result =
      data as Record<
        string,
        unknown
      >


    if (
      result.success !== true
    ) {

      throw new Error(
        typeof result.message === 'string'
          ? result.message
          : '取得角色權限矩陣失敗。',
      )

    }


    const roleRows =
      Array.isArray(
        result.roles,
      )
        ? result.roles
        : []


    const permissionRows =
      Array.isArray(
        result.permissions,
      )
        ? result.permissions
        : []


    const assignmentRows =
      Array.isArray(
        result.assignments,
      )
        ? result.assignments
        : []


    const roles:
      RolePermissionMatrixRole[] =
        roleRows
          .map(
            (
              value,
            ) => {

              if (
                !value
                ||
                typeof value !==
                  'object'
              ) {

                return null

              }


              const row =
                value as Record<
                  string,
                  unknown
                >


              const id =
                normalizeString(
                  row.id,
                )

              const code =
                normalizeString(
                  row.code,
                )

              const name =
                normalizeString(
                  row.name,
                )


              if (
                !id
                ||
                !code
                ||
                !name
              ) {

                return null

              }


              return {

                id,

                code,

                name,

                description:
                  normalizeString(
                    row.description,
                  )
                  ||
                  undefined,

                locked:
                  row.locked === true,

              }

            },
          )
          .filter(
            (
              role,
            ): role is RolePermissionMatrixRole =>
              role !== null,
          )


    const permissions:
      RolePermissionMatrixPermission[] =
        permissionRows
          .map(
            (
              value,
            ) => {

              if (
                !value
                ||
                typeof value !==
                  'object'
              ) {

                return null

              }


              const row =
                value as Record<
                  string,
                  unknown
                >


              const id =
                normalizeString(
                  row.id,
                )

              const code =
                normalizeString(
                  row.code,
                )

              const name =
                normalizeString(
                  row.name,
                )


              if (
                !id
                ||
                !code
                ||
                !name
              ) {

                return null

              }


              return {

                id,

                code,

                name,

                module:
                  normalizeString(
                    row.module,
                    'other',
                  ),

              }

            },
          )
          .filter(
            (
              permission,
            ): permission is RolePermissionMatrixPermission =>
              permission !== null,
          )


    const assignments:
      RolePermissionMatrixAssignment[] =
        assignmentRows
          .map(
            (
              value,
            ) => {

              if (
                !value
                ||
                typeof value !==
                  'object'
              ) {

                return null

              }


              const row =
                value as Record<
                  string,
                  unknown
                >


              const roleId =
                normalizeString(
                  row.roleId
                  ??
                  row.role_id,
                )

              const permissionId =
                normalizeString(
                  row.permissionId
                  ??
                  row.permission_id,
                )


              if (
                !roleId
                ||
                !permissionId
              ) {

                return null

              }


              return {

                roleId,

                permissionId,

              }

            },
          )
          .filter(
            (
              assignment,
            ): assignment is RolePermissionMatrixAssignment =>
              assignment !== null,
          )


    return {

      roles,

      permissions,

      assignments,

    }

  }


  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<UpdateRolePermissionsResult> {

    const normalizedRoleId =
      roleId.trim()


    if (
      !normalizedRoleId
    ) {

      throw new Error(
        '角色 ID 不可空白。',
      )

    }


    const normalizedPermissionIds =
      Array.from(
        new Set(
          permissionIds
            .map(
              (
                permissionId,
              ) =>
                permissionId.trim(),
            )
            .filter(Boolean),
        ),
      )


    const {
      data,
      error,
    } =
      await supabase.rpc(
        'update_role_permissions',
        {
          p_role_id:
            normalizedRoleId,

          p_permission_ids:
            normalizedPermissionIds,
        },
      )


    if (
      error
    ) {

      throw new Error(
        normalizeApiError(
          error,
          '更新角色權限失敗。',
        ),
      )

    }


    if (
      !data
      ||
      typeof data !== 'object'
    ) {

      throw new Error(
        '更新角色權限後未取得有效回應。',
      )

    }


    const result =
      data as Record<
        string,
        unknown
      >


    if (
      result.success !== true
    ) {

      throw new Error(
        typeof result.message === 'string'
          ? result.message
          : '更新角色權限失敗。',
      )

    }


    return {

      success:
        true,

      message:
        normalizeString(
          result.message,
          '角色權限更新成功。',
        ),

      roleId:
        normalizeString(
          result.roleId
          ??
          result.role_id,
          normalizedRoleId,
        ),

      roleCode:
        normalizeString(
          result.roleCode
          ??
          result.role_code,
        ),

      assignedCount:
        typeof (
          result.assignedCount
          ??
          result.assigned_count
        ) === 'number'
          ? Number(
              result.assignedCount
              ??
              result.assigned_count,
            )
          : normalizedPermissionIds.length,

    }

  }


  async hasPermission(
    permissionCode: string,
  ): Promise<boolean> {

    const userPermission =
      await this
        .getCurrentUserPermissions()


    if (
      userPermission.role.code ===
      'super_admin'
    ) {

      return true

    }


    return userPermission
      .permissions
      .some(
        (
          permission,
        ) =>
          permission.code ===
          permissionCode,
      )

  }


  async hasAnyPermission(
    permissionCodes: string[],
  ): Promise<boolean> {

    if (
      permissionCodes.length === 0
    ) {

      return true

    }


    const userPermission =
      await this
        .getCurrentUserPermissions()


    if (
      userPermission.role.code ===
      'super_admin'
    ) {

      return true

    }


    return permissionCodes
      .some(
        (
          permissionCode,
        ) =>
          userPermission
            .permissions
            .some(
              (
                permission,
              ) =>
                permission.code ===
                permissionCode,
            ),
      )

  }


  async hasAllPermissions(
    permissionCodes: string[],
  ): Promise<boolean> {

    if (
      permissionCodes.length === 0
    ) {

      return true

    }


    const userPermission =
      await this
        .getCurrentUserPermissions()


    if (
      userPermission.role.code ===
      'super_admin'
    ) {

      return true

    }


    return permissionCodes
      .every(
        (
          permissionCode,
        ) =>
          userPermission
            .permissions
            .some(
              (
                permission,
              ) =>
                permission.code ===
                permissionCode,
            ),
      )

  }


  async getCurrentUserRole():
    Promise<Role> {

    const userPermission =
      await this
        .getCurrentUserPermissions()


    return userPermission.role

  }


  async hasRole(
    roleCode: string,
  ): Promise<boolean> {

    const role =
      await this
        .getCurrentUserRole()


    if (
      role.code ===
      'super_admin'
    ) {

      return true

    }


    return (
      role.code ===
      roleCode
    )

  }


  async hasAnyRole(
    roleCodes: string[],
  ): Promise<boolean> {

    if (
      roleCodes.length === 0
    ) {

      return true

    }


    const role =
      await this
        .getCurrentUserRole()


    if (
      role.code ===
      'super_admin'
    ) {

      return true

    }


    return roleCodes.includes(
      role.code,
    )

  }

}


export const permissionApi =
  new PermissionApi()


export default permissionApi