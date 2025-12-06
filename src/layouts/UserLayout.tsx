// ** React Imports
import { ReactNode } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Icon Import
import Icon from 'src/@core/components/icon'

interface Props {
  children: ReactNode
  contentHeightFixed?: boolean
}

const UserLayout = ({ children, contentHeightFixed }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  // ** Bottom Navbar Buttons Component
  const BottomNavButtons = (props?: any) => {
    // Get navHover and settings from props (passed from Navigation component)
    const navHover = props?.navHover || false
    const settingsFromProps = props?.settings || settings
    const navCollapsed = settingsFromProps?.navCollapsed || false
    
    // Menu is open when: !navCollapsed || navHover
    // Menu is closed when: navCollapsed && !navHover
    const isMenuOpen = !navCollapsed || navHover
    const isMenuClosed = navCollapsed && !navHover
    
    return (
      <Box
        sx={{
          width: '100%',
          p: 2,
          borderTop: theme => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: 'background.default'
        }}
      >
        <Button
          component={Link}
          href='/rules'
          fullWidth
          variant='text'
          startIcon={<Icon icon='mdi:file-document-outline' />}
          sx={{
            justifyContent: isMenuClosed ? 'center' : 'flex-start',
            textTransform: 'none',
            color: 'text.primary',
            transition: 'background-color .2s ease-in-out',

            // Hide text when menu is closed
            '& .MuiButton-startIcon': {
              ...(isMenuClosed && { mr: 0 })
            },

            // Hover styles when menu is open
            '&:hover': {
              ...(isMenuOpen && {
                backgroundColor: 'action.hover'
              }),

              // Hover styles when menu is closed
              ...(isMenuClosed && {
                backgroundColor: 'action.selected'
              })
            }
          }}
        >
          <Box
            sx={{
              opacity: isMenuClosed ? 0 : 1,
              transition: 'opacity .25s ease-in-out',
              ...(isMenuClosed && { width: 0, overflow: 'hidden' })
            }}
          >
            <Typography sx={{ textTransform: 'none' }}>قوانین و مقررات</Typography>
          </Box>
        </Button>
        <Button
          component={Link}
          href='/support'
          fullWidth
          variant='text'
          startIcon={<Icon icon='mdi:help-circle-outline' />}
          sx={{
            justifyContent: isMenuClosed ? 'center' : 'flex-start',
            textTransform: 'none',
            color: 'text.primary',
            transition: 'background-color .2s ease-in-out',

            // Hide text when menu is closed
            '& .MuiButton-startIcon': {
              ...(isMenuClosed && { mr: 0 })
            },

            // Hover styles when menu is open
            '&:hover': {
              ...(isMenuOpen && {
                backgroundColor: 'action.hover'
              }),

              // Hover styles when menu is closed
              ...(isMenuClosed && {
                backgroundColor: 'action.selected'
              })
            }
          }}
        >
          <Box
            sx={{
              opacity: isMenuClosed ? 0 : 1,
              transition: 'opacity .25s ease-in-out',
              ...(isMenuClosed && { width: 0, overflow: 'hidden' })
            }}
          >
            <Typography sx={{ textTransform: 'none' }}>پشتیبانی</Typography>
          </Box>
        </Button>
      </Box>
    )
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems(),
          afterContent: (props?: any) => <BottomNavButtons {...props} />

          // Uncomment the below line when using server-side menu in vertical layout and comment the above line
          // navItems: verticalMenuItems
        },
        appBar: {
          content: () => (
            <VerticalAppBarContent
              settings={settings}
            />
          )
        }
      }}
      
    >
      {children}
      
    </Layout>
  )
}

export default UserLayout
