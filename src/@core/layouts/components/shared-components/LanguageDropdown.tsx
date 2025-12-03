// ** React Import
import { useEffect } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const LanguageDropdown = ({ settings, saveSettings }: Props) => {
  // ** Hook
  const { i18n } = useTranslation()

  // ** Change html `lang` attribute to Persian
  useEffect(() => {
    i18n.changeLanguage('fa')
    document.documentElement.setAttribute('lang', 'fa')
    saveSettings({ ...settings, direction: 'rtl' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ** Return null - Language dropdown removed as Persian is the only language
  return null
}

export default LanguageDropdown
