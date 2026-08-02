import type {
  RouteRecordRaw,
} from 'vue-router'


const mallCategoryRoutes:
  RouteRecordRaw[] = [

    {
      path:
        '/mall/category',

      name:
        'MallCategoryList',

      component:
        () =>
          import(
            '../../views/mall/MallCategoryListView.vue'
          ),

      meta:{
        title:
          '商品分類管理',

        permission:
          'mall.category.view',
      },
    },


    {
      path:
        '/mall/category/create',

      name:
        'MallCategoryCreate',

      component:
        () =>
          import(
            '../../views/mall/MallCategoryCreateView.vue'
          ),

      meta:{
        title:
          '新增商品分類',

        permission:
          'mall.category.create',
      },
    },


    {
      path:
        '/mall/category/:id/edit',

      name:
        'MallCategoryEdit',

      component:
        () =>
          import(
            '../../views/mall/MallCategoryEditView.vue'
          ),

      meta:{
        title:
          '編輯商品分類',

        permission:
          'mall.category.update',
      },
    },

  ]


export default mallCategoryRoutes