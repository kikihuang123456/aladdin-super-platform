export interface NavigationItem {
  label: string
  path?: string
  permission?: string
  roles?: string[]
  disabled?: boolean
  children?: NavigationItem[]
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
    label: '商家商品管理',
    path: '/merchants/products',
    permission: 'merchant.product.view',
  },

  // ========================================
  // 經銷商管理
  // ========================================
  {
    label: '經銷商管理',
    path: '/dealers',
    permission: 'dealer.view',
    children: [
      {
        label: '經銷商列表',
        path: '/dealers',
        permission: 'dealer.view',
      },
      {
        label: '經銷商業績與團隊管理',
        path: '/dealer/performance',
        permission: 'dealer.view',
      },
      {
        label: '區域與指派',
        permission: 'dealer.view',
        children: [
          {
            label: '經銷商區域管理',
            path: '/dealer/region-assignment',
            permission: 'dealer.view',
          },
          {
            label: '經銷商區域容量管理',
            path: '/dealer/region-capacity',
            permission: 'dealer.view',
          },
        ],
      },
    ],
  },

  {
    label: '商城管理',
    path: '/mall',
    permission: 'mall.view',
  },
  {
    label: '訂單管理',
    path: '/order',
  },

  // ========================================
  // 財務中心
  // ========================================
  {
    label: '財務中心',
    path: '/finance',
    permission: 'finance.view',
  },
  {
    label: '財務交易',
    path: '/finance/transactions',
    permission: 'finance.transaction.view',
  },
  {
    label: '錢包管理',
    path: '/finance/wallets',
    permission: 'finance.wallet.view',
  },
  {
    label: '提款管理',
    path: '/finance/withdraws',
    permission: 'finance.withdraw.view',
  },
  {
    label: '結算管理',
    path: '/finance/settlements',
    permission: 'finance.settlement.view',
  },
  {
    label: '財務報表',
    path: '/finance/reports',
    permission: 'finance.report.view',
  },
  {
    label: '財務稽核',
    path: '/finance/audit-logs',
    permission: 'finance.audit.view',
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
