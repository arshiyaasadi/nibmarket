// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: 'mdi:home-outline',
      path: '/dashboard',
      auth: false
    },
    {
      title: 'ماموریت ها',
      icon: 'mdi:clipboard-list-outline',
      path: '/tasks',
      auth: false
    },
    {
      title: 'شبکه من',
      icon: 'mdi:account-network-outline',
      auth: false,
      children: [
        {
          title: 'زیر مجموعه ها',
          path: '/network/subsets',
          auth: false
        }
      ]
    },
    {
      title: 'لیدربورد',
      icon: 'mdi:trophy-outline',
      path: '/leaderboard',
      auth: false
    },
    {
      title: 'گزارشات',
      icon: 'mdi:chart-box-outline',
      path: '/reports',
      auth: false
    },
  ]
}

export default navigation
