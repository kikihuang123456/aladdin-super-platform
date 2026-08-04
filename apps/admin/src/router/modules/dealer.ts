import type {
  RouteRecordRaw,
} from 'vue-router'


const dealerRoutes:
RouteRecordRaw[] = [


  {
    path:
      '/dealers',

    name:
      'dealer-list',

    component:
      () =>
        import(
          '../../views/dealer/DealerListView.vue'
        ),

    meta: {

      title:
        '經銷商管理',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


  {
    path:
      '/dealers/:id',

    name:
      'dealer-detail',

    component:
      () =>
        import(
          '../../views/dealer/DealerDetailView.vue'
        ),

    meta: {

      title:
        '經銷商詳情',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


  {
    path:
      '/dealer/region-assignment',

    name:
      'DealerRegionAssignment',

    component:
      () =>
        import(
          '../../views/dealer/DealerRegionAssignmentView.vue'
        ),

    meta: {

      title:
        '區域指派管理',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


]


export default dealerRoutes