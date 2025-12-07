// ** MUI Imports
import Box from '@mui/material/Box'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown, {
  NotificationsType
} from 'src/@core/layouts/components/shared-components/NotificationDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'

interface Props {
  settings: Settings
}

const notifications: NotificationsType[] = [
  {
    meta: 'امروز',
    avatarAlt: 'Flora',
    title: 'تبریک فلورا! 🎉',
    avatarImg: '/images/avatars/4.png',
    subtitle: 'برنده نشان بهترین فروشنده ماه شد'
  },
  {
    meta: 'دیروز',
    avatarColor: 'primary',
    subtitle: '۵ ساعت پیش',
    avatarText: 'رابرت آستین',
    title: 'کاربر جدید ثبت نام کرد.'
  },
  {
    meta: '۱۱ مرداد',
    avatarAlt: 'message',
    title: 'پیام جدید دریافت شد 👋🏻',
    avatarImg: '/images/avatars/5.png',
    subtitle: 'شما ۱۰ پیام خوانده نشده دارید'
  },
  {
    meta: '۲۵ اردیبهشت',
    title: 'پی‌پال',
    avatarAlt: 'paypal',
    subtitle: 'پرداخت دریافت شد',
    avatarImg: '/images/misc/paypal.png'
  },
  {
    meta: '۱۹ اسفند',
    avatarAlt: 'order',
    title: 'سفارش دریافت شد 📦',
    avatarImg: '/images/avatars/3.png',
    subtitle: 'سفارش جدید از جان دریافت شد'
  },
  {
    meta: '۲۷ آذر',
    avatarAlt: 'chart',
    subtitle: '۲۵ ساعت پیش',
    avatarImg: '/images/misc/chart.png',
    title: 'گزارش مالی تولید شد'
  }
]


const AppBarContent = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** Hook
  const auth = useAuth()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {auth.user && (
        <>
          <NotificationDropdown settings={settings} notifications={notifications} />
          <UserDropdown settings={settings} />
        </>
      )}
    </Box>
  )
}

export default AppBarContent
