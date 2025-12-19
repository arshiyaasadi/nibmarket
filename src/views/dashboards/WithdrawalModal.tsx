// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Step Components
import {
  Step1WalletAddress,
  Step2FirstOTP,
  Step3AmountSelection,
  Step4FinalOTP,
  Step5Receipt
} from './WithdrawalModalSteps'

// ** Types
interface WithdrawalModalProps {
  open: boolean
  onClose: () => void
  availableBalance: number
}

type Step = 1 | 2 | 3 | 4 | 5

const WithdrawalModal = ({ open, onClose, availableBalance }: WithdrawalModalProps) => {
  // ** States
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [transactionDate, setTransactionDate] = useState<Date>(new Date())

  // ** Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Reset after a short delay to allow closing animation
      const timeoutId = setTimeout(() => {
        // Double-check that modal is still closed before resetting
        // This prevents reset if modal was reopened during the delay
        setCurrentStep(1)
        setWalletAddress('')
        setAmount(0)
        setLoading(false)
        setError('')
      }, 300)

      // Cleanup function to cancel timeout if modal opens before it fires
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [open])

  // ** Handle Step 1: Wallet Address
  const handleWalletAddressNext = () => {
    if (!walletAddress.trim()) {
      setError('لطفاً آدرس کیف پول را وارد کنید')
      return
    }
    setError('')
    setCurrentStep(2)
  }

  // ** Handle Step 2: First OTP
  const handleFirstOTPSubmit = async (otp: string) => {
    if (otp.length !== 4) {
      setError('لطفاً کد تایید ۴ رقمی را کامل وارد کنید')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Mock API call - simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simulate success (in real app, check response)
      const success = true // In real app, check API response

      if (success) {
        setError('')
        setCurrentStep(3)
        toast.success('کد تایید با موفقیت تایید شد')
      } else {
        setError('کد تایید نامعتبر است')
      }
    } catch (err) {
      setError('خطا در تایید کد. لطفاً دوباره تلاش کنید')
      toast.error('خطا در تایید کد تایید')
    } finally {
      setLoading(false)
    }
  }

  // ** Handle Step 3: Amount Selection
  const handleAmountNext = () => {
    if (amount <= 0) {
      setError('مبلغ باید بیشتر از صفر باشد')
      return
    }
    if (amount > availableBalance) {
      setError('مبلغ وارد شده بیشتر از موجودی قابل برداشت است')
      return
    }
    setError('')
    setCurrentStep(4)
  }

  // ** Handle Step 4: Final OTP
  const handleFinalOTPSubmit = async (otp: string) => {
    if (otp.length !== 4) {
      setError('لطفاً کد تایید ۴ رقمی را کامل وارد کنید')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Mock API call - simulate final transaction
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Simulate success (in real app, check response)
      const success = true // In real app, check API response

      if (success) {
        setError('')
        setTransactionDate(new Date())
        setCurrentStep(5)
        toast.success('تراکنش با موفقیت انجام شد')
      } else {
        setError('کد تایید نامعتبر است')
      }
    } catch (err) {
      setError('خطا در انجام تراکنش. لطفاً دوباره تلاش کنید')
      toast.error('خطا در انجام تراکنش')
    } finally {
      setLoading(false)
    }
  }

  // ** Handle modal close
  const handleClose = () => {
    if (currentStep === 5 || !loading) {
      onClose()
    }
  }

  // ** Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1WalletAddress
            walletAddress={walletAddress}
            onWalletAddressChange={setWalletAddress}
            onNext={handleWalletAddressNext}
            loading={loading}
            error={error}
          />
        )
      case 2:
        return <Step2FirstOTP onOTPSubmit={handleFirstOTPSubmit} loading={loading} error={error} />
      case 3:
        return (
          <Step3AmountSelection
            availableBalance={availableBalance}
            amount={amount}
            onAmountChange={setAmount}
            onNext={handleAmountNext}
            loading={loading}
            error={error}
          />
        )
      case 4:
        return <Step4FinalOTP onOTPSubmit={handleFinalOTPSubmit} loading={loading} error={error} />
      case 5:
        return (
          <Step5Receipt
            amount={amount}
            walletAddress={walletAddress}
            transactionDate={transactionDate}
            onClose={handleClose}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='xs'
      fullWidth
      aria-labelledby='withdrawal-modal-title'
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 480
        }
      }}
    >
      <DialogTitle
        id='withdrawal-modal-title'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='mdi:wallet-outline' fontSize={24} />
          <Box component='span' sx={{ fontWeight: 600 }}>
            برداشت توکن
          </Box>
        </Box>
        {currentStep !== 5 && !loading && (
          <IconButton
            aria-label='close'
            onClick={handleClose}
            sx={{ color: 'text.secondary' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ position: 'relative', minHeight: currentStep === 1 ? 350 : 300 }}>
        {loading && currentStep !== 5 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
              borderRadius: 1,
              pointerEvents: 'none'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {renderStepContent()}
      </DialogContent>
      {(currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4) && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          {currentStep === 1 && (
            <Button
              type='submit'
              form='wallet-address-form'
              variant='contained'
              fullWidth
              disabled={!walletAddress.trim() || loading}
              sx={{ m: 0 }}
            >
              {loading ? 'در حال بررسی...' : 'ادامه'}
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              type='submit'
              form='first-otp-form'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{ m: 0 }}
            >
              {loading ? 'در حال بررسی...' : 'ثبت'}
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              type='submit'
              form='amount-selection-form'
              variant='contained'
              fullWidth
              disabled={!(amount > 0 && amount <= availableBalance) || loading}
              sx={{ m: 0 }}
            >
              {loading ? 'در حال بررسی...' : 'ادامه'}
            </Button>
          )}
          {currentStep === 4 && (
            <Button
              type='submit'
              form='final-otp-form'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{ m: 0 }}
            >
              {loading ? 'در حال انجام تراکنش...' : 'تایید نهایی'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default WithdrawalModal

