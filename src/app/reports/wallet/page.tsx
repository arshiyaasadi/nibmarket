'use client'

import { Suspense, useState } from 'react'

import { shouldUseApiForEndpoint } from 'src/configs/data-source'
import { useReportsWallet } from 'src/hooks/reports/useReportsWallet'
import WalletTransactionsReport from 'src/views/reports/WalletTransactionsReport'

const WalletReportsPageContent = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactionType, setTransactionType] = useState('all')

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsWallet(
    startDate,
    endDate,
    transactionType
  )

  return (
    <WalletTransactionsReport
      pageTitle='گزارش کیف پول'
      widgetTitle='گزارش کیف پول'
      rows={data.rows}
      startDate={startDate}
      endDate={endDate}
      transactionType={transactionType}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onTransactionTypeChange={setTransactionType}
      onResetFilters={() => {
        setStartDate('')
        setEndDate('')
        setTransactionType('all')
      }}
      filterOnClient={!shouldUseApiForEndpoint('reports-wallet')}
      loading={loading}
      retrying={retrying}
      error={error}
      hasData={hasData}
      usedFallback={usedFallback}
      onRetry={refetch}
    />
  )
}

const WalletReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletReportsPageContent />
    </Suspense>
  )
}

export default WalletReportsPage
