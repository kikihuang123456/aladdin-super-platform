/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP Router
 */

import type {
  RouteRecordRaw,
} from 'vue-router'


import AdminLayout
from '../../layouts/AdminLayout.vue'


const dealerRoutes:
RouteRecordRaw[] = [

  {
    path:
      '/dealer',

    component:
      AdminLayout,


    children: [

      {

        path:
          '',

        name:
          'DealerHome',

        component:
          () =>
            import(
              '../../views/dealer/DealerDetailView.vue'
            ),

        meta: {

          title:
            '經銷商管理',

        },

      },


      {

        path:
          'region-assignment',


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

        },

      },


      {

        path:
          'approval',


        name:
          'DealerApproval',


        component:
          () =>
            import(
              '../../views/dealer/DealerApprovalView.vue'
            ),


        meta: {

          title:
            '經銷商審核',

        },

      },


    ],


  },

]


export default dealerRoutes