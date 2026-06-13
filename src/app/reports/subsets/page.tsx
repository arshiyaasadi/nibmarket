'use client'

import { Suspense, useState } from 'react'

import { RETENTION_MISSION_IDS } from 'src/configs/wallet-missions'
import { shouldUseApiForEndpoint } from 'src/configs/data-source'
import { useReportsSubsets } from 'src/hooks/reports/useReportsSubsets'
import WalletTransactionsReport from 'src/views/reports/WalletTransactionsReport'

const SubsetsReportsPageContent = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [missionType, setMissionType] = useState('all')
  const [missionIds, setMissionIds] = useState<number[]>([...RETENTION_MISSION_IDS])

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsSubsets(
    startDate,
    endDate,
    missionType,
    missionIds
  )

  return (
    <WalletTransactionsReport
      pageTitle='گزارش زیر مجموعه ها'
      widgetTitle='گزارش زیرمجموعه‌ها — رسوب'
      mode='retention'
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
        setMissionIds([...RETENTION_MISSION_IDS])
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
