// ** React Imports
import { forwardRef, Ref } from 'react'

// ** MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, useTheme } from '@mui/material/styles'

// ** Types
import { CustomAvatarProps } from './types'
import { ThemeColor } from 'src/@core/layouts/types'

// ** Hooks Imports
import useBgColor, { UseBgColorType } from 'src/@core/hooks/useBgColor'

// ** Utils
import { safeThemeColor } from 'src/@core/utils/safe-theme-color'
import { sanitizeSxColors } from 'src/@core/utils/sanitize-sx'

const Avatar = forwardRef((props: CustomAvatarProps, ref: Ref<any>) => {
  const { sx, src, skin = 'filled', color: colorProp = 'primary', variant, children, ...rest } = props

  const color: ThemeColor = safeThemeColor(colorProp)
  const safeSx = sanitizeSxColors(sx)

  const theme = useTheme()
  const bgColors: UseBgColorType = useBgColor()

  const getAvatarStyles = (avatarSkin: 'filled' | 'light' | 'light-static' | undefined, skinColor: ThemeColor) => {
    if (avatarSkin === 'light') {
      return { ...bgColors[`${skinColor}Light`] }
    }
    if (avatarSkin === 'light-static') {
      return {
        color: bgColors[`${skinColor}Light`].color,
        backgroundColor: lighten(theme.palette[skinColor].main, 0.88)
      }
    }

    return { ...bgColors[`${skinColor}Filled`] }
  }

  const colors: UseBgColorType = {
    primary: getAvatarStyles(skin, 'primary'),
    secondary: getAvatarStyles(skin, 'secondary'),
    success: getAvatarStyles(skin, 'success'),
    error: getAvatarStyles(skin, 'error'),
    warning: getAvatarStyles(skin, 'warning'),
    info: getAvatarStyles(skin, 'info')
  }

  const skinStyles = !src && skin ? colors[color] : {}
  const avatarSx = sanitizeSxColors(Object.assign({}, skinStyles, safeSx))

  return (
    <MuiAvatar ref={ref} variant={variant} src={src} {...rest} sx={avatarSx}>
      {children}
    </MuiAvatar>
  )
})

export default Avatar
