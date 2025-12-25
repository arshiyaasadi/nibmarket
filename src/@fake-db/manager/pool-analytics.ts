// ** Mock Data for Pool Analytics Dashboard

import type {
  PoolDataPoint,
  ParticipantStats,
  PerformanceMetrics,
  ComparisonData,
  PoolAnalyticsData,
  RegionalParticipant,
  PerformerData,
  ScoreDistribution
} from 'src/types/manager/pool-analytics'

// Helper function to generate dates
const getDateOffset = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysOffset)
  return date.toISOString().split('T')[0]
}

// Mock Pool Trend Data (6 months)
export const mockPoolTrend: PoolDataPoint[] = [
  { date: '2024-07-01', balance: 980000, change: 5.2, participants: 856 },
  { date: '2024-07-15', balance: 1020000, change: 4.1, participants: 892 },
  { date: '2024-08-01', balance: 1080000, change: 5.9, participants: 934 },
  { date: '2024-08-15', balance: 1125000, change: 4.2, participants: 978 },
  { date: '2024-09-01', balance: 1190000, change: 5.8, participants: 1045 },
  { date: '2024-09-15', balance: 1245000, change: 4.6, participants: 1098 },
  { date: '2024-10-01', balance: 1310000, change: 5.2, participants: 1156 },
  { date: '2024-10-15', balance: 1365000, change: 4.2, participants: 1189 },
  { date: '2024-11-01', balance: 1420000, change: 4.0, participants: 1223 },
  { date: '2024-11-15', balance: 1465000, change: 3.2, participants: 1245 },
  { date: '2024-12-01', balance: 1500000, change: 2.4, participants: 1267 },
  { date: '2024-12-15', balance: 1535000, change: 2.3, participants: 1289 },
  { date: '2024-12-26', balance: 1560000, change: 1.6, participants: 1312 }
]

// Mock Regional Distribution
export const mockRegionalParticipants: RegionalParticipant[] = [
  { region: 'تهران', count: 417, percentage: 31.8 },
  { region: 'اصفهان', count: 163, percentage: 12.4 },
  { region: 'مشهد', count: 142, percentage: 10.8 },
  { region: 'شیراز', count: 119, percentage: 9.1 },
  { region: 'تبریز', count: 101, percentage: 7.7 },
  { region: 'کرج', count: 89, percentage: 6.8 },
  { region: 'اهواز', count: 72, percentage: 5.5 },
  { region: 'قم', count: 58, percentage: 4.4 },
  { region: 'کرمانشاه', count: 45, percentage: 3.4 },
  { region: 'رشت', count: 38, percentage: 2.9 },
  { region: 'یزد', count: 32, percentage: 2.4 },
  { region: 'سایر', count: 36, percentage: 2.8 }
]

// Daily growth data for the last 30 days
const generateDailyGrowth = (): number[] => {
  const baseGrowth = [2, 3, 1, 4, 5, 3, 2, 6, 4, 3, 5, 7, 4, 3, 2, 8, 5, 4, 3, 6, 4, 3, 7, 5, 4, 3, 2, 5, 4, 3]
  return baseGrowth
}

// Mock Participant Stats
export const mockParticipantStats: ParticipantStats = {
  total: 1312,
  newThisMonth: 145,
  growth: 12.4,
  regions: mockRegionalParticipants,
  dailyGrowth: generateDailyGrowth()
}

// Mock Top Performers
export const mockTopPerformers: PerformerData[] = [
  { id: 1, rank: 1, name: 'علی احمدی', score: 12500, subordinates: 45, region: 'تهران' },
  { id: 2, rank: 2, name: 'محمد رضایی', score: 11200, subordinates: 38, region: 'اصفهان' },
  { id: 3, rank: 3, name: 'فاطمه کریمی', score: 9800, subordinates: 32, region: 'مشهد' },
  { id: 4, rank: 4, name: 'حسن موسوی', score: 8750, subordinates: 28, region: 'شیراز' },
  { id: 5, rank: 5, name: 'زهرا نوری', score: 8200, subordinates: 25, region: 'تهران' },
  { id: 6, rank: 6, name: 'رضا کاظمی', score: 7650, subordinates: 22, region: 'تبریز' },
  { id: 7, rank: 7, name: 'مریم صادقی', score: 7100, subordinates: 20, region: 'کرج' },
  { id: 8, rank: 8, name: 'امیر حسینی', score: 6800, subordinates: 19, region: 'اهواز' },
  { id: 9, rank: 9, name: 'سارا محمدی', score: 6450, subordinates: 18, region: 'تهران' },
  { id: 10, rank: 10, name: 'حسین ملکی', score: 6200, subordinates: 17, region: 'قم' },
  { id: 11, rank: 11, name: 'نرگس رحیمی', score: 5950, subordinates: 16, region: 'کرمانشاه' },
  { id: 12, rank: 12, name: 'مهدی عباسی', score: 5700, subordinates: 15, region: 'رشت' },
  { id: 13, rank: 13, name: 'شیما احمدی', score: 5500, subordinates: 14, region: 'یزد' },
  { id: 14, rank: 14, name: 'علیرضا جعفری', score: 5250, subordinates: 13, region: 'تهران' },
  { id: 15, rank: 15, name: 'لیلا کریمی', score: 5000, subordinates: 12, region: 'اصفهان' },
  { id: 16, rank: 16, name: 'محسن رضوی', score: 4800, subordinates: 11, region: 'مشهد' },
  { id: 17, rank: 17, name: 'پریسا محمودی', score: 4600, subordinates: 10, region: 'شیراز' },
  { id: 18, rank: 18, name: 'سعید نوروزی', score: 4400, subordinates: 10, region: 'تبریز' },
  { id: 19, rank: 19, name: 'مینا علوی', score: 4200, subordinates: 9, region: 'کرج' },
  { id: 20, rank: 20, name: 'کامران باقری', score: 4000, subordinates: 9, region: 'اهواز' }
]

// Mock Score Distribution
export const mockScoreDistribution: ScoreDistribution[] = [
  { range: '0-2000', count: 245 },
  { range: '2000-4000', count: 387 },
  { range: '4000-6000', count: 412 },
  { range: '6000-8000', count: 178 },
  { range: '8000-10000', count: 58 },
  { range: '10000+', count: 32 }
]

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetrics = {
  avgScore: 4567,
  topScore: 12500,
  lowestScore: 120,
  medianScore: 3850,
  distribution: mockScoreDistribution,
  topPerformers: mockTopPerformers
}

// Mock Monthly Comparison Data (Last 6 months)
export const mockMonthlyComparison: ComparisonData[] = [
  {
    period: 'تیر 1403',
    poolBalance: 1020000,
    participants: 892,
    change: 5.2,
    avgScore: 3890
  },
  {
    period: 'مرداد 1403',
    poolBalance: 1125000,
    participants: 978,
    change: 10.3,
    avgScore: 4050
  },
  {
    period: 'شهریور 1403',
    poolBalance: 1245000,
    participants: 1098,
    change: 10.7,
    avgScore: 4180
  },
  {
    period: 'مهر 1403',
    poolBalance: 1365000,
    participants: 1189,
    change: 9.6,
    avgScore: 4320
  },
  {
    period: 'آبان 1403',
    poolBalance: 1465000,
    participants: 1245,
    change: 7.3,
    avgScore: 4450
  },
  {
    period: 'آذر 1403',
    poolBalance: 1560000,
    participants: 1312,
    change: 6.5,
    avgScore: 4567
  }
]

// Mock Quarterly Comparison Data
export const mockQuarterlyComparison: ComparisonData[] = [
  {
    period: 'Q1 1403',
    poolBalance: 820000,
    participants: 745,
    change: 12.4,
    avgScore: 3450
  },
  {
    period: 'Q2 1403',
    poolBalance: 1020000,
    participants: 892,
    change: 24.4,
    avgScore: 3890
  },
  {
    period: 'Q3 1403',
    poolBalance: 1245000,
    participants: 1098,
    change: 22.1,
    avgScore: 4180
  },
  {
    period: 'Q4 1403',
    poolBalance: 1560000,
    participants: 1312,
    change: 25.3,
    avgScore: 4567
  }
]

// Main Mock Data Export
export const mockPoolAnalyticsData: PoolAnalyticsData = {
  poolTrend: mockPoolTrend,
  participantStats: mockParticipantStats,
  performanceMetrics: mockPerformanceMetrics,
  monthlyComparison: mockMonthlyComparison,
  quarterlyComparison: mockQuarterlyComparison
}

// Helper function to get filtered data (for future use with filters)
export const getFilteredPoolAnalytics = (/* filters?: FilterOptions */): PoolAnalyticsData => {
  // In a real application, this would filter the data based on the provided filters
  // For now, we just return the mock data
  return mockPoolAnalyticsData
}

