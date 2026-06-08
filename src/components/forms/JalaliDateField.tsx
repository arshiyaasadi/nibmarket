'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { styled, useTheme } from '@mui/material/styles'
import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'

const JalaliPickerRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .rmdp-container': {
    width: '100%'
  },
  '& .rmdp-wrapper': {
    direction: 'rtl',
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[6],
    border: `1px solid ${theme.palette.divider}`
  },
  '& .rmdp-calendar': {
    direction: 'rtl'
  },
  '& .rmdp-day.rmdp-selected span:not(.highlight)': {
    backgroundColor: theme.palette.primary.main
  },
  '& .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '& .rmdp-arrow-container:hover': {
    backgroundColor: theme.palette.action.hover,
    boxShadow: 'none'
  },
  '& .rmdp-arrow': {
    borderColor: theme.palette.primary.main
  },
  '& .rmdp-header-values': {
    color: theme.palette.text.primary,
    fontWeight: 600
  },
  '& .rmdp-week-day': {
    color: theme.palette.text.secondary
  },
  '& .rmdp-day span': {
    color: theme.palette.text.primary
  },
  '& .rmdp-day.rmdp-today span': {
    backgroundColor: `${theme.palette.primary.main}22`
  }
}))

function toDateObject(value: string): DateObject | undefined {
  if (!value?.trim()) return undefined

  const date = new DateObject({
    date: value,
    format: 'YYYY/MM/DD',
    calendar: persian,
    locale: persian_fa
  })

  return date.isValid ? date : undefined
}

export type JalaliDateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  minDate?: string
  placeholder?: string
}

const JalaliDateField = ({
  label,
  value,
  onChange,
  minDate,
  placeholder = '۱۴۰۳/۰۱/۰۱'
}: JalaliDateFieldProps) => {
  const theme = useTheme()
  const pickerValue = useMemo(() => toDateObject(value), [value])
  const minDateObject = useMemo(() => (minDate ? toDateObject(minDate) : undefined), [minDate])

  return (
    <JalaliPickerRoot>
      <DatePicker
        value={pickerValue}
        onChange={(date: DateObject | null) => {
          if (date?.isValid) {
            onChange(date.format('YYYY/MM/DD'))
          } else {
            onChange('')
          }
        }}
        calendar={persian}
        locale={persian_fa}
        format='YYYY/MM/DD'
        minDate={minDateObject}
        arrow={false}
        editable={false}
        calendarPosition='bottom-center'
        zIndex={theme.zIndex.modal}
        render={(displayValue, openCalendar) => (
          <TextField
            fullWidth
            label={label}
            value={displayValue}
            placeholder={placeholder}
            onClick={openCalendar}
            onFocus={openCalendar}
            InputProps={{ readOnly: true }}
            inputProps={{ 'aria-label': label }}
          />
        )}
      />
    </JalaliPickerRoot>
  )
}

export default JalaliDateField
