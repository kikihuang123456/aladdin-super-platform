import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import {
  permissionApi,
  type RolePermissionMatrixRole,
  type RolePermissionMatrixPermission,
} from '../api/permission'


interface RolePermissionMatrixError {
  code: string
  message: string
  cause?: unknown
}


function normalizeError(
  error: unknown,
): RolePermissionMatrixError {

  if (
    error instanceof Error
  ) {

    return {
      code:
        'ROLE_PERMISSION_MATRIX_ERROR',

      message:
        error.message,

      cause:
        error,
    }

  }


  return {
    code:
      'ROLE_PERMISSION_MATRIX_ERROR',

    message:
      '角色權限管理發生未知錯誤。',

    cause:
      error,
  }

}


export const useRolePermissionMatrixStore =
  defineStore(
    'role-permission-matrix',
    () => {

      const roles =
        ref<
          RolePermissionMatrixRole[]
        >([])


      const permissions =
        ref<
          RolePermissionMatrixPermission[]
        >([])


      const assignmentMap =
        ref<
          Record<
            string,
            string[]
          >
        >({})


      const selectedRoleId =
        ref<string | null>(
          null,
        )


      const draftPermissionIds =
        ref<string[]>([])


      const isLoading =
        ref(false)


      const isSaving =
        ref(false)


      const isInitialized =
        ref(false)


      const error =
        ref<
          RolePermissionMatrixError
          | null
        >(null)


      const successMessage =
        ref('')


      const selectedRole =
        computed(
          () =>
            roles.value.find(
              (
                role,
              ) =>
                role.id ===
                selectedRoleId.value,
            )
            ??
            null,
        )


      const isSelectedRoleLocked =
        computed(
          () =>
            selectedRole.value
              ?.locked
            ?? false,
        )


      const groupedPermissions =
        computed(
          () => {

            const groups =
              new Map<
                string,
                RolePermissionMatrixPermission[]
              >()


            for (
              const permission
              of permissions.value
            ) {

              const moduleName =
                permission.module
                || 'other'


              const current =
                groups.get(
                  moduleName,
                )
                ?? []


              current.push(
                permission,
              )


              groups.set(
                moduleName,
                current,
              )

            }


            return Array.from(
              groups.entries(),
            ).map(
              (
                [
                  module,
                  modulePermissions,
                ],
              ) => ({

                module,

                permissions:
                  [
                    ...modulePermissions,
                  ].sort(
                    (
                      permissionA,
                      permissionB,
                    ) =>
                      permissionA.code
                        .localeCompare(
                          permissionB.code,
                        ),
                  ),

              }),
            )

          },
        )


      const hasChanges =
        computed(
          () => {

            const roleId =
              selectedRoleId.value


            if (
              !roleId
            ) {

              return false

            }


            const original =
              [
                ...(
                  assignmentMap.value[
                    roleId
                  ]
                  ?? []
                ),
              ].sort()


            const draft =
              [
                ...draftPermissionIds.value,
              ].sort()


            if (
              original.length !==
              draft.length
            ) {

              return true

            }


            return original.some(
              (
                permissionId,
                index,
              ) =>
                permissionId !==
                draft[index],
            )

          },
        )


      function clearMessages():
        void {

        error.value =
          null

        successMessage.value =
          ''

      }


      function setSelectedRole(
        roleId: string,
      ): void {

        selectedRoleId.value =
          roleId


        draftPermissionIds.value =
          [
            ...(
              assignmentMap.value[
                roleId
              ]
              ?? []
            ),
          ]


        clearMessages()

      }


      function hasPermission(
        permissionId: string,
      ): boolean {

        return draftPermissionIds.value
          .includes(
            permissionId,
          )

      }


      function getPermissionIdByCode(
        permissionCode: string,
      ): string | null {

        return (
          permissions.value.find(
            (
              permission,
            ) =>
              permission.code ===
              permissionCode,
          )?.id
          ??
          null
        )

      }


      function addPermissionByCode(
        permissionCode: string,
      ): void {

        const permissionId =
          getPermissionIdByCode(
            permissionCode,
          )


        if (
          !permissionId
          ||
          draftPermissionIds.value
            .includes(
              permissionId,
            )
        ) {

          return

        }


        draftPermissionIds.value =
          [
            ...draftPermissionIds.value,
            permissionId,
          ]

      }


      function removePermissionByCode(
        permissionCode: string,
      ): void {

        const permissionId =
          getPermissionIdByCode(
            permissionCode,
          )


        if (
          !permissionId
        ) {

          return

        }


        draftPermissionIds.value =
          draftPermissionIds.value
            .filter(
              (
                currentPermissionId,
              ) =>
                currentPermissionId !==
                permissionId,
            )

      }


      function applyPermissionDependencies(
        permissionCode: string,
        isEnabling: boolean,
      ): void {

        if (
          isEnabling
        ) {

          if (
            permissionCode ===
            'dealer.team.manage'
          ) {

            addPermissionByCode(
              'dealer.team.view',
            )

            addPermissionByCode(
              'dealer.view',
            )

          }


          if (
            permissionCode ===
            'dealer.team.view'
          ) {

            addPermissionByCode(
              'dealer.view',
            )

          }


          return

        }


        if (
          permissionCode ===
          'dealer.view'
        ) {

          removePermissionByCode(
            'dealer.team.view',
          )

          removePermissionByCode(
            'dealer.team.manage',
          )

        }


        if (
          permissionCode ===
          'dealer.team.view'
        ) {

          removePermissionByCode(
            'dealer.team.manage',
          )

        }

      }


      function togglePermission(
        permissionId: string,
      ): void {

        if (
          isSelectedRoleLocked.value
        ) {

          return

        }


        const permission =
          permissions.value.find(
            (
              currentPermission,
            ) =>
              currentPermission.id ===
              permissionId,
          )


        if (
          !permission
        ) {

          return

        }


        clearMessages()


        const isCurrentlySelected =
          hasPermission(
            permissionId,
          )


        if (
          isCurrentlySelected
        ) {

          draftPermissionIds.value =
            draftPermissionIds.value
              .filter(
                (
                  currentPermissionId,
                ) =>
                  currentPermissionId !==
                  permissionId,
              )


          applyPermissionDependencies(
            permission.code,
            false,
          )


          return

        }


        draftPermissionIds.value =
          Array.from(
            new Set([
              ...draftPermissionIds.value,
              permissionId,
            ]),
          )


        applyPermissionDependencies(
          permission.code,
          true,
        )

      }


      function isModuleFullySelected(
        moduleName: string,
      ): boolean {

        const modulePermissions =
          permissions.value.filter(
            (
              permission,
            ) =>
              permission.module ===
              moduleName,
          )


        if (
          modulePermissions.length ===
          0
        ) {

          return false

        }


        return modulePermissions
          .every(
            (
              permission,
            ) =>
              hasPermission(
                permission.id,
              ),
          )

      }


      function toggleModule(
        moduleName: string,
      ): void {

        if (
          isSelectedRoleLocked.value
        ) {

          return

        }


        clearMessages()


        const modulePermissionIds =
          permissions.value
            .filter(
              (
                permission,
              ) =>
                permission.module ===
                moduleName,
            )
            .map(
              (
                permission,
              ) =>
                permission.id,
            )


        if (
          modulePermissionIds.length ===
          0
        ) {

          return

        }


        if (
          isModuleFullySelected(
            moduleName,
          )
        ) {

          draftPermissionIds.value =
            draftPermissionIds.value
              .filter(
                (
                  permissionId,
                ) =>
                  !modulePermissionIds
                    .includes(
                      permissionId,
                    ),
              )

          return

        }


        draftPermissionIds.value =
          Array.from(
            new Set([
              ...draftPermissionIds.value,
              ...modulePermissionIds,
            ]),
          )

      }


      function selectAllPermissions():
        void {

        if (
          isSelectedRoleLocked.value
        ) {

          return

        }


        clearMessages()


        draftPermissionIds.value =
          permissions.value.map(
            (
              permission,
            ) =>
              permission.id,
          )

      }


      function clearAllPermissions():
        void {

        if (
          isSelectedRoleLocked.value
        ) {

          return

        }


        clearMessages()


        draftPermissionIds.value =
          []

      }


      function resetDraft():
        void {

        const roleId =
          selectedRoleId.value


        if (
          !roleId
        ) {

          draftPermissionIds.value =
            []

          return

        }


        draftPermissionIds.value =
          [
            ...(
              assignmentMap.value[
                roleId
              ]
              ?? []
            ),
          ]


        clearMessages()

      }


      async function fetchMatrix():
        Promise<void> {

        isLoading.value =
          true

        clearMessages()


        try {

          const matrix =
            await permissionApi
              .getRolePermissionMatrix()


          roles.value =
            matrix.roles


          permissions.value =
            matrix.permissions


          const nextAssignmentMap:
            Record<
              string,
              string[]
            > =
              {}


          for (
            const role
            of matrix.roles
          ) {

            nextAssignmentMap[
              role.id
            ] =
              []

          }


          for (
            const assignment
            of matrix.assignments
          ) {

            if (
              !nextAssignmentMap[
                assignment.roleId
              ]
            ) {

              nextAssignmentMap[
                assignment.roleId
              ] =
                []

            }


            nextAssignmentMap[
              assignment.roleId
            ].push(
              assignment.permissionId,
            )

          }


          assignmentMap.value =
            nextAssignmentMap


          const currentRoleExists =
            selectedRoleId.value
            &&
            matrix.roles.some(
              (
                role,
              ) =>
                role.id ===
                selectedRoleId.value,
            )


          if (
            currentRoleExists
            &&
            selectedRoleId.value
          ) {

            setSelectedRole(
              selectedRoleId.value,
            )

          } else {

            const firstEditableRole =
              matrix.roles.find(
                (
                  role,
                ) =>
                  !role.locked,
              )


            const defaultRole =
              firstEditableRole
              ??
              matrix.roles[0]
              ??
              null


            if (
              defaultRole
            ) {

              setSelectedRole(
                defaultRole.id,
              )

            } else {

              selectedRoleId.value =
                null

              draftPermissionIds.value =
                []

            }

          }


          isInitialized.value =
            true

        } catch (
          caughtError
        ) {

          error.value =
            normalizeError(
              caughtError,
            )

          throw caughtError

        } finally {

          isLoading.value =
            false

        }

      }


      async function saveSelectedRole():
        Promise<void> {

        const role =
          selectedRole.value


        if (
          !role
        ) {

          error.value = {
            code:
              'ROLE_NOT_SELECTED',

            message:
              '請先選擇要設定的角色。',
          }

          return

        }


        if (
          role.locked
        ) {

          error.value = {
            code:
              'ROLE_LOCKED',

            message:
              '超級管理員為系統保護角色，無法修改權限。',
          }

          return

        }


        isSaving.value =
          true

        clearMessages()


        try {

          const result =
            await permissionApi
              .updateRolePermissions(
                role.id,
                draftPermissionIds.value,
              )


          assignmentMap.value = {
            ...assignmentMap.value,

            [role.id]:
              [
                ...draftPermissionIds.value,
              ],
          }


          successMessage.value =
            result.message

        } catch (
          caughtError
        ) {

          error.value =
            normalizeError(
              caughtError,
            )

          throw caughtError

        } finally {

          isSaving.value =
            false

        }

      }


      return {

        roles,
        permissions,
        assignmentMap,

        selectedRoleId,
        draftPermissionIds,

        isLoading,
        isSaving,
        isInitialized,

        error,
        successMessage,

        selectedRole,
        isSelectedRoleLocked,
        groupedPermissions,
        hasChanges,

        fetchMatrix,
        setSelectedRole,

        hasPermission,
        togglePermission,

        isModuleFullySelected,
        toggleModule,

        selectAllPermissions,
        clearAllPermissions,
        resetDraft,

        saveSelectedRole,
        clearMessages,

      }

    },
  )


export default
useRolePermissionMatrixStore
