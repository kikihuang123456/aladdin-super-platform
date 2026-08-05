import type {
  RouteRecordRaw,
} from 'vue-router'


const dealerRoutes:
RouteRecordRaw[] = [


  // =================================
  // Dealer List
  // =================================

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


  // =================================
  // Dealer Detail
  // =================================

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


  // =================================
  // M05-04 Dealer Region Assignment
  // =================================

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


  // =================================
  // M05-05 Dealer Region Dashboard
  // =================================

  {
    path:
      '/dealer/region-dashboard',

    name:
      'DealerRegionDashboard',

    component:
      () =>
        import(
          '../../views/dealer/DealerRegionDashboardView.vue'
        ),

    meta: {

      title:
        '經銷商區域 Dashboard',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


  // =================================
  // M05-06 Dealer Region Analytics
  // =================================

  {
    path:
      '/dealer/region-analytics',

    name:
      'DealerRegionAnalytics',

    component:
      () =>
        import(
          '../../views/dealer/DealerRegionAnalyticsView.vue'
        ),

    meta: {

      title:
        '經銷商區域分析',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


  // =================================
  // M05-07 Dealer Region Capacity
  // =================================

  {
    path:
      '/dealer/region-capacity',

    name:
      'DealerRegionCapacity',

    component:
      () =>
        import(
          '../../views/dealer/DealerRegionCapacityView.vue'
        ),

    meta: {

      title:
        '經銷商區域容量管理',

      requiresAuth:
        true,

      permissions: [
        'dealer.view',
      ],

    },

  },


]


export default dealerRoutes