'use client'

import { Component, ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  children: ReactNode
  title?: string
  onReset?: () => void
}

type State = {
  hasError: boolean
  message: string
}

/**
 * MUI-safe fallback — avoids Alert/Button color='inherit' when theme color parser fails.
 */
export default class DashboardWidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    const raw = error.message || 'خطا در نمایش این بخش'
    const message =
      raw.includes('Unsupported') && raw.includes('color')
        ? 'خطا در نمایش داده — لطفاً دوباره تلاش کنید'
        : raw

    return { hasError: true, message }
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DashboardWidget]', this.props.title, error)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 2,
            minHeight: 120
          }}
        >
          <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {this.props.title ? `${this.props.title}: ` : ''}
            {this.state.message}
          </Typography>
          <Button variant='outlined' size='small' onClick={this.handleReset}>
            تلاش مجدد
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
