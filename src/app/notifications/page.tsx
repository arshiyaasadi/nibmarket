'use client'

// ** React Imports
import { Suspense, useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
interface NotificationItem {
  id: number
  title: string
  subtitle: string
  meta: string
  type: 'system' | 'promotion' | 'network'
}

interface LoginActivityItem {
  id: number
  device: string
  location: string
  time: string
  status: 'login' | 'logout'
  ip: string
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'به‌روزرسانی مهم سامانه کاربری',
    subtitle: 'سامانه کاربری با امکانات جدید و بهبود عملکرد به‌روزرسانی شد. لطفاً برای مشاهده جزئیات بیشتر به بخش راهنما مراجعه کنید.',
    meta: '۵ دقیقه پیش',
    type: 'system'
  },
  {
    id: 2,
    title: 'طرح تشویقی توسعه شبکه',
    subtitle: 'با دعوت از دوستان خود، امتیاز و پاداش بیشتری دریافت کنید. جزئیات طرح در این اطلاعیه توضیح داده شده است.',
    meta: '۱ ساعت پیش',
    type: 'network'
  },
  {
    id: 3,
    title: 'اعلان مهم در مورد قوانین مسابقه',
    subtitle: 'قوانین شرکت در مسابقات به‌روزرسانی شده است. لطفاً قبل از شرکت در مسابقه، قوانین جدید را مطالعه کنید.',
    meta: 'دیروز',
    type: 'system'
  },
  {
    id: 4,
    title: 'آغاز کمپین ویژه کاربران فعال',
    subtitle: 'کمپین ویژه‌ای برای کاربران فعال شروع شده است. با انجام فعالیت‌های روزانه، شانس خود را برای دریافت جوایز افزایش دهید.',
    meta: '۲ روز پیش',
    type: 'promotion'
  }
]

const mockLoginActivities: LoginActivityItem[] = [
  {
    id: 1,
    device: 'مرورگر کروم - ویندوز',
    location: 'ایران، تهران',
    time: '۵ دقیقه پیش',
    status: 'login',
    ip: '192.168.1.12'
  },
  {
    id: 2,
    device: 'موبایل اندروید',
    location: 'ایران، مشهد',
    time: '۱ ساعت پیش',
    status: 'logout',
    ip: '10.0.0.5'
  },
  {
    id: 3,
    device: 'مرورگر کروم - مک',
    location: 'ایران، اصفهان',
    time: 'دیروز',
    status: 'login',
    ip: '172.16.0.21'
  },
  {
    id: 4,
    device: 'مرورگر فایرفاکس - لینوکس',
    location: 'ایران، شیراز',
    time: '۲ روز پیش',
    status: 'logout',
    ip: '192.168.0.33'
  }
]

const getTypeLabel = (type: NotificationItem['type']) => {
  switch (type) {
    case 'system':
      return 'سیستمی'
    case 'promotion':
      return 'طرح تشویقی'
    case 'network':
      return 'شبکه'
    default:
      return ''
  }
}

const getTypeColor = (type: NotificationItem['type']) => {
  switch (type) {
    case 'system':
      return 'primary'
    case 'promotion':
      return 'success'
    case 'network':
      return 'warning'
    default:
      return 'default'
  }
}

const NotificationsPageContent = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | NotificationItem['type']>('all')

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return mockNotifications

    return mockNotifications.filter(item => item.type === selectedFilter)
  }, [selectedFilter])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme => theme.palette.primary.light,
              color: theme => theme.palette.primary.main
            }}
          >
            <Icon icon='mdi:bell-outline' fontSize='1.5rem' />
          </Box>
          <Box>
            <Typography variant='h4' sx={{ mb: 0.5 }}>
              اخبار و اطلاعیه ها
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              آخرین اخبار، اطلاعیه‌ها و به‌روزرسانی‌های مربوط به حساب کاربری و فعالیت‌های شما
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* اخبار و اطلاعیه‌ها */}
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Chip
                label='همه'
                variant={selectedFilter === 'all' ? 'filled' : 'outlined'}
                color={selectedFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('all')}
                sx={{ fontWeight: selectedFilter === 'all' ? 600 : 400 }}
              />
              <Chip
                label='سیستمی'
                variant={selectedFilter === 'system' ? 'filled' : 'outlined'}
                color={selectedFilter === 'system' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('system')}
                sx={{ fontWeight: selectedFilter === 'system' ? 600 : 400 }}
              />
              <Chip
                label='شبکه'
                variant={selectedFilter === 'network' ? 'filled' : 'outlined'}
                color={selectedFilter === 'network' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('network')}
                sx={{ fontWeight: selectedFilter === 'network' ? 600 : 400 }}
              />
              <Chip
                label='طرح تشویقی'
                variant={selectedFilter === 'promotion' ? 'filled' : 'outlined'}
                color={selectedFilter === 'promotion' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('promotion')}
                sx={{ fontWeight: selectedFilter === 'promotion' ? 600 : 400 }}
              />
            </Box>

            <Typography variant='body2' sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
              {filteredNotifications.length} اعلان نمایش داده شده از {mockNotifications.length} اعلان
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            {filteredNotifications.map(notification => (
              <Box
                key={notification.id}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                  bgcolor: theme =>
                    theme.palette.mode === 'light'
                      ? theme.palette.background.default
                      : theme.palette.customColors.bodyBg,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: theme => theme.palette.primary.main,
                    bgcolor: theme =>
                      theme.palette.mode === 'light'
                        ? theme.palette.background.paper
                        : theme.palette.background.default
                  }
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme => theme.palette.primary.main,
                    color: 'common.white'
                  }}
                >
                  <Icon icon='mdi:newspaper-variant-outline' fontSize='1.5rem' />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 1.5
                    }}
                  >
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '100%', sm: '60%' }
                      }}
                    >
                      {notification.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <Chip
                        label={getTypeLabel(notification.type)}
                        color={getTypeColor(notification.type) as any}
                        size='small'
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant='caption' sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
                        {notification.meta}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.8
                    }}
                  >
                    {notification.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ورود به سیستم */}
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant='h6'>ورود به سیستم</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {mockLoginActivities.length} رویداد ثبت شده
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            {mockLoginActivities.map(activity => (
              <Box
                key={activity.id}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                  alignItems: 'flex-start',
                  bgcolor: theme =>
                    theme.palette.mode === 'light'
                      ? theme.palette.background.default
                      : theme.palette.customColors.bodyBg,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: theme => theme.palette.primary.main,
                    bgcolor: theme =>
                      theme.palette.mode === 'light'
                        ? theme.palette.background.paper
                        : theme.palette.background.default
                  }
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme =>
                      activity.status === 'login'
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    color: 'common.white'
                  }}
                >
                  <Icon
                    icon={activity.status === 'login' ? 'mdi:login-variant' : 'mdi:logout-variant'}
                    fontSize='1.4rem'
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 1.5
                    }}
                  >
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '100%', sm: '60%' }
                      }}
                    >
                      {activity.device}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <Chip
                        label={activity.status === 'login' ? 'ورود موفق' : 'خروج از حساب'}
                        color={activity.status === 'login' ? 'success' : 'default'}
                        size='small'
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant='caption' sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon icon='mdi:map-marker-outline' fontSize='1rem' />
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {activity.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon icon='mdi:ip-outline' fontSize='1rem' />
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        IP: {activity.ip}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

const NotificationsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationsPageContent />
    </Suspense>
  )
}

export default NotificationsPage


