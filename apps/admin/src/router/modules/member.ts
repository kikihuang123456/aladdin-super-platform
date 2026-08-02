import type { RouteRecordRaw } from 'vue-router'

const memberRoutes: RouteRecordRaw[] = [
  //==========================================================
  // Member List
  //==========================================================

  {
    path: '/members',

    name: 'MemberList',

    component: () =>
      import(
        '../../views/member/MemberListView.vue'
      ),

    meta: {
      title: '會員管理',

      requiresAuth: true,

      permissions: [
        'member.view',
      ],
    },
  },

  //==========================================================
  // Member Create
  //==========================================================

  {
    path: '/members/create',

    name: 'MemberCreate',

    component: () =>
      import(
        '../../views/member/MemberCreateView.vue'
      ),

    meta: {
      title: '新增會員',

      requiresAuth: true,

      permissions: [
        'member.create',
      ],
    },
  },

  //==========================================================
  // Member Detail
  //==========================================================

  {
    path: '/members/:id',

    name: 'MemberDetail',

    component: () =>
      import(
        '../../views/member/MemberDetailView.vue'
      ),

    meta: {
      title: '會員詳情',

      requiresAuth: true,

      permissions: [
        'member.view',
      ],
    },
  },

  //==========================================================
  // Member Edit
  //==========================================================

  {
    path: '/members/:id/edit',

    name: 'MemberEdit',

    component: () =>
      import(
        '../../views/member/MemberEditView.vue'
      ),

    meta: {
      title: '編輯會員',

      requiresAuth: true,

      permissions: [
        'member.update',
      ],
    },
  },
]

export default memberRoutes