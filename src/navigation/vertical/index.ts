// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'داشبورد',
      icon: 'mdi:home-outline',
      path: '/dashboard',
      auth: false
    },
    {
      title: 'شبکه من',
      icon: 'mdi:account-network-outline',
      auth: false,
      children: [
        {
          title: 'زیر مجموعه های من',
          path: '/network/my-subsets',
          auth: false
        },
        {
          title: 'درخت زیر مجموعه',
          path: '/network/subset-tree',
          auth: false
        },
        {
          title: 'دعوت از دوستان',
          path: '/network/invite-friends',
          auth: false
        },
        {
          title: 'معرف من',
          path: '/network/my-referrer',
          auth: false
        }
      ]
    },
    {
      title: 'گذارش',
      icon: 'mdi:chart-box-outline',
      auth: false,
      children: [
        {
          title: 'گزارش درامد ها',
          path: '/reports/income',
          auth: false
        },
        {
          title: 'گزارش زیر مجموعه ها',
          path: '/reports/subsets',
          auth: false
        },
        {
          title: 'گزارش کیف پول',
          path: '/reports/wallet',
          auth: false
        }
      ]
    },
    {
      title: 'لیدر بورد',
      icon: 'mdi:trophy-outline',
      auth: false,
      children: [
        {
          title: 'استخر و بورد',
          path: '/leaderboard/pool-board',
          auth: false
        },
        {
          title: 'ماموریت ها',
          path: '/leaderboard/missions',
          auth: false
        }
      ]
    },
    {
      title: 'مسابقه',
      icon: 'mdi:trophy-variant-outline',
      auth: false,
      children: [
        {
          title: 'شرکت در مسابقه',
          path: '/competition/participate',
          auth: false
        },
        {
          title: 'سوابق و افتخارات من',
          path: '/competition/records',
          auth: false
        },
        {
          title: 'جوایز و هدابا',
          path: '/competition/prizes',
          auth: false
        }
      ]
    }
  ]
}

export default navigation
