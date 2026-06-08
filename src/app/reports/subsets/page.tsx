'use client'

import { Suspense, useState } from 'react'

import { shouldUseApiForEndpoint } from 'src/configs/data-source'
import { useReportsSubsets } from 'src/hooks/reports/useReportsSubsets'
import WalletTransactionsReport from 'src/views/reports/WalletTransactionsReport'

const SubsetsReportsPageContent = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactionType, setTransactionType] = useState('all')

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsSubsets(
    startDate,
    endDate,
    transactionType
  )

  return (
    <WalletTransactionsReport
      pageTitle='گزارش زیر مجموعه ها'
      widgetTitle='گزارش زیرمجموعه‌ها'
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
      filterOnClient={!shouldUseApiForEndpoint('reports-subsets')}
      loading={loading}
      retrying={retrying}
      error={error}
      hasData={hasData}
      usedFallback={usedFallback}
      onRetry={refetch}
    />
  )
}

const SubsetsReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubsetsReportsPageContent />
    </Suspense>
  )
}

export default SubsetsReportsPage
