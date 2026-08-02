export interface NavigationItem {
  label: string
  path: string
  permission?: string
  roles?: string[]
  disabled?: boolean
}

export const adminNavigation: NavigationItem[] = [
  {
    label: '總覽儀表板',
    path: '/',
    permission: 'dashboard.view',
  },
  {
    label: '會員管理',
    path: '/members',
    permission: 'member.view',
  },
  {
    label: '商家管理',
    path: '/merchants',
    permission: 'merchant.view',
  },
  {
    label: '經銷商管理',
    path: '/dealers',
    permission: 'dealer.view',
  },
  {
    label: '商城管理',
    path: '/mall',
    permission: 'mall.view',
  },
  {
  label:'訂單管理',
  path:'/order',
},
  {
    label: '文旅管理',
    path: '/travel',
    permission: 'travel.view',
  },
  {
    label: 'AI 智能中心',
    path: '/ai-center',
    permission: 'ai.view',
  },
  {
    label: 'ERP 系統管理',
    path: '/system',
    permission: 'system.view',
    disabled: true,
  },
]