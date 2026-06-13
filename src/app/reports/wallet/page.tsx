'use client'

import { Suspense, useState } from 'react'

import { shouldUseApiForEndpoint } from 'src/configs/data-source'
import { useReportsWallet } from 'src/hooks/reports/useReportsWallet'
import WalletTransactionsReport from 'src/views/reports/WalletTransactionsReport'

const WalletReportsPageContent = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [missionType, setMissionType] = useState('all')
  const [missionIds, setMissionIds] = useState<number[]>([])

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsWallet(
    startDate,
    endDate,
    missionType,
    missionIds
  )

  return (
    <WalletTransactionsReport
      pageTitle='گزارش کیف پول'
      widgetTitle='گزارش کیف پول'
      mode='wallet'
      rows={data.rows}
      startDate={startDate}
      endDate={endDate}
      missionType={missionType}
      missionIds={missionIds}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onMissionTypeChange={setMissionType}
      onMissionIdsChange={setMissionIds}
      onResetFilters={() => {
        setStartDate('')
        setEndDate('')
        setMissionType('all')
        setMissionIds([])
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
