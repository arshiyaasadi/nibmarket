// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** Third Party Imports
import clsx from 'clsx'

// ** Types
import { CustomChipProps } from './types'

// ** Hooks Imports
import useBgColor, { UseBgColorType } from 'src/@core/hooks/useBgColor'

// ** Utils
import { isThemeColor, safeThemeColor } from 'src/@core/utils/safe-theme-color'
import { sanitizeSxColors } from 'src/@core/utils/sanitize-sx'

const Chip = (props: CustomChipProps) => {
  const { sx, skin, color: colorProp, rounded, label, children, ...rest } = props

  const color = colorProp != null ? safeThemeColor(colorProp) : undefined
  const safeSx = sanitizeSxColors(sx)

  const bgColors = useBgColor()

  const colors: UseBgColorType = {
    primary: { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success: { ...bgColors.successLight },
    error: { ...bgColors.errorLight },
    warning: { ...bgColors.warningLight },
    info: { ...bgColors.infoLight }
  }

  const muiColor = color && isThemeColor(color) ? color : undefined
  const chipSx =
    skin === 'light' && color && colors[color]
      ? sanitizeSxColors(Object.assign({}, colors[color], safeSx))
      : safeSx

  return (
    <MuiChip
      {...rest}
      label={label}
      color={muiColor}
      variant='filled'
      className={clsx({
        'MuiChip-rounded': rounded,
        'MuiChip-light': skin === 'light'
      })}
      sx={chipSx}
    >
      {children}
    </MuiChip>
  )
}

export default Chip
