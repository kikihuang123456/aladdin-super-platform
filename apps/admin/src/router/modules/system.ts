import type {
  RouteRecordRaw,
} from 'vue-router'


const systemRoutes:
  RouteRecordRaw[] = [

  {
    path:
      '/system/permissions',

    name:
      'RolePermissionMatrix',

    component:
      () =>
        import(
          '../../views/system/RolePermissionMatrixView.vue'
        ),

    meta: {
      title:
        '角色權限管理',

      requiresAuth:
        true,

      roles: [
        'super_admin',
      ],

      permissions: [
        'system.view',
      ],
    },
  },

  {
    path:
      '/403',

    name:
      'Forbidden',

    component:
      () =>
        import(
          '../../views/system/ForbiddenView.vue'
        ),

    meta: {
      title:
        '無權限存取',

      requiresAuth:
        false,
    },
  },

]


export default systemRoutes
