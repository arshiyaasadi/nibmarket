'use client'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { useLayoutAnnouncements } from 'src/hooks/layout/useLayoutAnnouncements'

// ** Icon Import
import Icon from 'src/@core/components/icon'

interface Props {
  settings: Settings
  hidden?: boolean
  navVisible?: boolean
  toggleNavVisibility?: () => void
}

const AppBarContent = (props: Props) => {
  const { settings, hidden, navVisible, toggleNavVisibility } = props

  const auth = useAuth()
  const { notifications, loading } = useLayoutAnnouncements()

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {hidden && toggleNavVisibility && (
        <IconButton
          onClick={toggleNavVisibility}
          aria-label={navVisible ? 'close navigation menu' : 'open navigation menu'}
          sx={{
            mr: 2,
            color: 'text.primary',
            display: 'flex',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Icon icon={navVisible ? 'mdi:close' : 'mdi:menu'} fontSize={24} />
        </IconButton>
      )}

      <Box
        className='actions-right'
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 'auto'
        }}
      >
        {auth.user && (
          <>
            <NotificationDropdown settings={settings} notifications={notifications} loading={loading} />
            <UserDropdown settings={settings} />
          </>
        )}
      </Box>
    </Box>
  )
}

export default AppBarContent
