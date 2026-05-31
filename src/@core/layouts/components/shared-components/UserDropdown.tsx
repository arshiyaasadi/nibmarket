'use client'

// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import — (external panel links use window.location)

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Config Imports
import { panelProfileHref, panelUserAccountHref } from 'src/configs/panel-urls'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'
import { useCurrentUser } from 'src/hooks/layout/useCurrentUser'

// ** Lib Imports
import { formatUserDisplayName } from 'src/lib/layout/mappers'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

interface Props {
  settings: Settings
}

const UserDropdown = (props: Props) => {
  const { settings } = props

  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const { logout } = useAuth()
  const { t } = useTranslation()
  const { data: currentUser, hasData } = useCurrentUser()

  const displayName = hasData ? formatUserDisplayName(currentUser) : ''

  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleExternalNavigate = (url: string) => {
    handleDropdownClose()
    window.location.href = url
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.primary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <IconButton
        onClick={handleDropdownOpen}
        aria-label='user menu'
        sx={{
          ml: 1,
          width: 40,
          height: 40,
          border: theme => `1px solid ${theme.palette.divider}`,
          backgroundColor: theme =>
            theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.action.selected,
          color: 'text.primary',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'primary.main'
          }
        }}
      >
        <Icon icon='mdi:account-circle-outline' fontSize='1.625rem' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        sx={{ '& .MuiMenu-paper': { width: 260, mt: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: theme => theme.palette.primary.main,
                color: 'common.white'
              }}
            >
              <Icon icon='mdi:account-outline' fontSize='1.375rem' />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, lineHeight: 1.4 }} noWrap>
                {displayName || '\u00A0'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <MenuItem sx={{ p: 0 }} onClick={() => handleExternalNavigate(panelProfileHref())}>
          <Box sx={styles}>
            <Icon icon='mdi:account-outline' />
            {t('Profile')}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ p: 0 }} onClick={() => handleExternalNavigate(panelUserAccountHref())}>
          <Box sx={styles}>
            <Icon icon='mdi:cog-outline' />
            {t('Settings')}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
        >
          <Icon icon='mdi:logout-variant' />
          {t('Logout')}
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
