// ** React Imports
import { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'

// ** Third Party Imports
import CleaveOriginal from 'cleave.js/react'
import { Controller, useForm } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Styled Component
import CleaveWrapper from 'src/@core/styles/libs/react-cleave'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styles
import 'cleave.js/dist/addons/cleave-phone.us'

// ** Type assertion for React 19 compatibility
const Cleave = CleaveOriginal as any

// ** Styled Components
// @ts-ignore - React 19 compatibility issue with styled(Cleave)
const CleaveInput = styled(Cleave)(({ theme }) => ({
  maxWidth: 50,
  textAlign: 'center',
  height: '50px !important',
  fontSize: '150% !important',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:not(:last-child)': {
    marginRight: theme.spacing(2)
  },
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    margin: 0,
    WebkitAppearance: 'none'
  }
}))

// ** Types
interface Step1WalletAddressProps {
  walletAddress: string
  onWalletAddressChange: (address: string) => void
  onNext: () => void
  loading: boolean
  error?: string
}

interface Step2FirstOTPProps {
  onOTPSubmit: (otp: string) => void
  loading: boolean
  error?: string
}

interface Step3AmountSelectionProps {
  availableBalance: number
  amount: number
  onAmountChange: (amount: number) => void
  onNext: () => void
  loading: boolean
  error?: string
}

interface Step4FinalOTPProps {
  onOTPSubmit: (otp: string) => void
  loading: boolean
  error?: string
}

interface Step5ReceiptProps {
  amount: number
  walletAddress: string
  transactionDate: Date
  onClose: () => void
}

// ** Step 1: Wallet Address Input
export const Step1WalletAddress = ({
  walletAddress,
  onWalletAddressChange,
  onNext,
  loading,
  error
}: Step1WalletAddressProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress.trim()) {
      onNext()
    }
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 2,
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(255, 193, 7, 0.1)' 
            : 'rgba(255, 193, 7, 0.08)',
          border: theme => `1px solid ${theme.palette.warning.main}40`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5
        }}
      >
        <Icon 
          icon='mdi:information-outline' 
          fontSize={22} 
          style={{ 
            color: 'inherit',
            marginTop: 2,
            flexShrink: 0
          }} 
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: 'warning.dark' }}>
            راهنمایی
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.875rem' }}>
            شما آدرس کیف پول خود را ثبت نکرده‌اید. ابتدا باید آدرس کیف پول خود را ثبت کنید، سپس می‌توانید عملیات برداشت را انجام دهید.
            پس از ثبت، کد تاییدی برای شما ارسال می‌شود که با وارد کردن آن، کیف پول شما متصل خواهد شد.
          </Typography>
        </Box>
      </Box>

      <Typography variant='h6' sx={{ mb: 1.5, fontWeight: 600 }}>
        دریافت آدرس کیف پول
      </Typography>
      <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
        لطفاً آدرس کیف پول مقصد را وارد کنید
      </Typography>
      
      <form id='wallet-address-form' onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='آدرس کیف پول'
          value={walletAddress}
          onChange={e => onWalletAddressChange(e.target.value)}
          placeholder='0x...'
          error={!!error}
          disabled={loading}
          sx={{ mb: 1 }}
        />
        {error && (
          <FormHelperText sx={{ color: 'error.main', mb: 2 }}>{error}</FormHelperText>
        )}
      </form>
    </Box>
  )
}

// ** Helper function to convert English digits to Persian
const toPersianDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// ** Helper function to convert Persian digits to English
const toEnglishDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str
    .split('')
    .map(char => {
      const index = persianDigits.indexOf(char)
      return index > -1 ? String(index) : char
    })
    .join('')
}

// ** Step 2: First OTP
export const Step2FirstOTP = ({ onOTPSubmit, loading, error }: Step2FirstOTPProps) => {
  const [otpValue, setOtpValue] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Convert Persian digits to English
    const englishValue = toEnglishDigits(rawValue)
    // Only allow numbers and limit to 4 digits
    const numbersOnly = englishValue.replace(/\D/g, '').slice(0, 4)
    setOtpValue(numbersOnly)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length === 4) {
      onOTPSubmit(otpValue)
    }
  }

  return (
    <Box>
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
        احراز هویت اولیه
      </Typography>
      <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
        کد تایید ۴ رقمی ارسال شده را وارد کنید
      </Typography>
      <form id='first-otp-form' onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type='tel'
          value={otpValue ? toPersianDigits(otpValue) : ''}
          onChange={handleChange}
          error={!!error}
          disabled={loading}
          inputProps={{
            maxLength: 4,
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              fontWeight: 600
            }
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-input': {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              fontWeight: 600,
              py: 2
            }
          }}
        />
        {error && (
          <FormHelperText sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>
            {error}
          </FormHelperText>
        )}
        {!error && otpValue.length > 0 && otpValue.length < 4 && (
          <FormHelperText sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
            لطفاً کد تایید را کامل وارد کنید
          </FormHelperText>
        )}
      </form>
    </Box>
  )
}

// ** Step 3: Amount Selection
export const Step3AmountSelection = ({
  availableBalance,
  amount,
  onAmountChange,
  onNext,
  loading,
  error
}: Step3AmountSelectionProps) => {
  const handleMaxClick = () => {
    onAmountChange(availableBalance)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0 && amount <= availableBalance) {
      onNext()
    }
  }

  const isAmountValid = amount > 0 && amount <= availableBalance

  return (
    <Box>
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
        تعیین مبلغ برداشت
      </Typography>
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'action.hover',
          border: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
          موجودی قابل برداشت:
        </Typography>
        <Typography variant='h6' sx={{ fontWeight: 700, color: 'success.main' }}>
          {availableBalance.toLocaleString('fa-IR')} TWIN
        </Typography>
      </Box>
      <form id='amount-selection-form' onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type='number'
          label='مبلغ برداشت'
          value={amount || ''}
          onChange={e => {
            const value = parseFloat(e.target.value) || 0
            onAmountChange(Math.max(0, value))
          }}
          inputProps={{ min: 0, step: 1 }}
          error={!!error || (amount > 0 && amount > availableBalance) || amount < 0}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Button
                  size='small'
                  onClick={handleMaxClick}
                  disabled={loading}
                  sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  تمام موجودی
                </Button>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
        {error && (
          <FormHelperText sx={{ color: 'error.main', mb: 2 }}>{error}</FormHelperText>
        )}
        {amount > 0 && amount > availableBalance && (
          <FormHelperText sx={{ color: 'error.main', mb: 2 }}>
            مبلغ وارد شده بیشتر از موجودی قابل برداشت است
          </FormHelperText>
        )}
        {amount < 0 && (
          <FormHelperText sx={{ color: 'error.main', mb: 2 }}>
            مبلغ نمی‌تواند منفی باشد
          </FormHelperText>
        )}
      </form>
    </Box>
  )
}

// ** Step 4: Final OTP
export const Step4FinalOTP = ({ onOTPSubmit, loading, error }: Step4FinalOTPProps) => {
  const [otpValue, setOtpValue] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Convert Persian digits to English
    const englishValue = toEnglishDigits(rawValue)
    // Only allow numbers and limit to 4 digits
    const numbersOnly = englishValue.replace(/\D/g, '').slice(0, 4)
    setOtpValue(numbersOnly)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length === 4) {
      onOTPSubmit(otpValue)
    }
  }

  return (
    <Box>
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
        تایید نهایی تراکنش
      </Typography>
      <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
        کد تایید ۴ رقمی مرحله آخر را وارد کنید
      </Typography>
      <form id='final-otp-form' onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type='tel'
          value={otpValue ? toPersianDigits(otpValue) : ''}
          onChange={handleChange}
          error={!!error}
          disabled={loading}
          inputProps={{
            maxLength: 4,
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              fontWeight: 600
            }
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-input': {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
              fontWeight: 600,
              py: 2
            }
          }}
        />
        {error && (
          <FormHelperText sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>
            {error}
          </FormHelperText>
        )}
        {!error && otpValue.length > 0 && otpValue.length < 4 && (
          <FormHelperText sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
            لطفاً کد تایید را کامل وارد کنید
          </FormHelperText>
        )}
      </form>
    </Box>
  )
}

// ** Step 5: Receipt
export const Step5Receipt = ({ amount, walletAddress, transactionDate, onClose }: Step5ReceiptProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'success.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon='mdi:check-circle' fontSize={40} style={{ color: 'white' }} />
        </Box>
      </Box>
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
        تراکنش با موفقیت انجام شد
      </Typography>
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          backgroundColor: 'action.hover',
          border: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            مبلغ برداشت شده:
          </Typography>
          <Typography variant='h6' sx={{ fontWeight: 700, color: 'primary.main' }}>
            {amount.toLocaleString('fa-IR')} TWIN
          </Typography>
        </Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            آدرس کیف پول:
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 500, textAlign: 'left', maxWidth: '60%' }}>
            {walletAddress}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            تاریخ و ساعت:
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {formatDate(transactionDate)}
          </Typography>
        </Box>
      </Box>
      <Button variant='contained' fullWidth onClick={onClose} sx={{ mt: 4 }}>
        بستن
      </Button>
    </Box>
  )
}

