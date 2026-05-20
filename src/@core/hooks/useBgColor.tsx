// ** MUI Imports
import { useTheme } from '@mui/material/styles'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { isInvalidMuiColorValue } from 'src/@core/utils/sanitize-sx'

function safeMainColor(main: string, fallback: string): string {
  return isInvalidMuiColorValue(main) ? fallback : main
}

export type UseBgColorType = {
  [key: string]: {
    color: string
    backgroundColor: string
  }
}

const UseBgColor = () => {
  // ** Hooks
  const theme = useTheme()

  const primaryMain = safeMainColor(theme.palette.primary.main, '#666CFF')
  const secondaryMain = safeMainColor(theme.palette.secondary.main, '#6D788D')
  const successMain = safeMainColor(theme.palette.success.main, '#72E128')
  const errorMain = safeMainColor(theme.palette.error.main, '#FF4D49')
  const warningMain = safeMainColor(theme.palette.warning.main, '#FDB528')
  const infoMain = safeMainColor(theme.palette.info.main, '#26C6F9')

  return {
    primaryFilled: {
      color: theme.palette.primary.contrastText,
      backgroundColor: primaryMain
    },
    primaryLight: {
      color: primaryMain,
      backgroundColor: hexToRGBA(primaryMain, 0.12)
    },
    secondaryFilled: {
      color: theme.palette.secondary.contrastText,
      backgroundColor: secondaryMain
    },
    secondaryLight: {
      color: secondaryMain,
      backgroundColor: hexToRGBA(secondaryMain, 0.12)
    },
    successFilled: {
      color: theme.palette.success.contrastText,
      backgroundColor: successMain
    },
    successLight: {
      color: successMain,
      backgroundColor: hexToRGBA(successMain, 0.12)
    },
    errorFilled: {
      color: theme.palette.error.contrastText,
      backgroundColor: errorMain
    },
    errorLight: {
      color: errorMain,
      backgroundColor: hexToRGBA(errorMain, 0.12)
    },
    warningFilled: {
      color: theme.palette.warning.contrastText,
      backgroundColor: warningMain
    },
    warningLight: {
      color: warningMain,
      backgroundColor: hexToRGBA(warningMain, 0.12)
    },
    infoFilled: {
      color: theme.palette.info.contrastText,
      backgroundColor: infoMain
    },
    infoLight: {
      color: infoMain,
      backgroundColor: hexToRGBA(infoMain, 0.12)
    }
  }
}

export default UseBgColor
