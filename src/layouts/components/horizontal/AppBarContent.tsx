'use client'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { useLayoutAnnouncements } from 'src/hooks/layout/useLayoutAnnouncements'

interface Props {
  settings: Settings
}

const AppBarContent = (props: Props) => {
  const { settings } = props

  const auth = useAuth()
  const { notifications, loading } = useLayoutAnnouncements()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {auth.user && (
        <>
          <NotificationDropdown settings={settings} notifications={notifications} loading={loading} />
          <UserDropdown settings={settings} />
        </>
      )}
    </Box>
  )
}

export default AppBarContent
