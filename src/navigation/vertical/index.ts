// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'داشبورد',
      icon: 'mdi:home-outline',
      path: '/dashboard',
      action: 'read',
      subject: 'client-pages'
    },
    {
      title: 'شبکه من',
      icon: 'mdi:account-network-outline',
      action: 'read',
      subject: 'client-pages',
      children: [
        {
          title: 'زیر مجموعه های من',
          path: '/network/my-subsets',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'درخت زیر مجموعه',
          path: '/network/subset-tree',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'دعوت از دوستان',
          path: '/network/invite-friends',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'معرف من',
          path: '/network/my-referrer',
          action: 'read',
          subject: 'client-pages'
        }
      ]
    },
    {
      title: 'گزارش',
      icon: 'mdi:chart-box-outline',
      action: 'read',
      subject: 'client-pages',
      children: [
        {
          title: 'گزارش درامد ها',
          path: '/reports/income',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'گزارش زیر مجموعه ها',
          path: '/reports/subsets',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'گزارش کیف پول',
          path: '/reports/wallet',
          action: 'read',
          subject: 'client-pages'
        }
      ]
    },
    {
      title: 'لیدر بورد',
      icon: 'mdi:trophy-outline',
      action: 'read',
      subject: 'client-pages',
      children: [
        {
          title: 'استخر و بورد',
          path: '/leaderboard/pool-board',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'ماموریت ها',
          path: '/leaderboard/missions',
          action: 'read',
          subject: 'client-pages'
        }
      ]
    },
    {
      title: 'مسابقه',
      icon: 'mdi:trophy-variant-outline',
      action: 'read',
      subject: 'client-pages',
      children: [
        {
          title: 'شرکت در مسابقه',
          path: '/competition/participate',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'سوابق و افتخارات من',
          path: '/competition/records',
          action: 'read',
          subject: 'client-pages'
        },
        {
          title: 'جوایز و هدابا',
          path: '/competition/prizes',
          action: 'read',
          subject: 'client-pages'
        }
      ]
    },
    {
      title: 'داشبورد مدیر',
      icon: 'mdi:view-dashboard-outline',
      action: 'read',
      subject: 'manager-dashboard',
      children: [
        {
          title: 'داشبورد کلی',
          path: '/manager/dashboard',
          action: 'read',
          subject: 'manager-dashboard'
        },
        {
          title: 'استخر و بورد',
          path: '/manager/pool-analytics',
          action: 'read',
          subject: 'manager-dashboard'
        }
      ]
    }
  ]
}

export default navigation
