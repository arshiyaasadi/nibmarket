// ** Types for Pool Analytics Dashboard

export interface PoolDataPoint {
  date: string // ISO date string
  balance: number // Pool balance in TWIN
  change: number // Percentage change from previous period
  participants: number // Number of participants at this point
}

export interface RegionalParticipant {
  region: string // Province/City name
  count: number // Number of participants
  percentage: number // Percentage of total
}

export interface ParticipantStats {
  total: number // Total participants
  newThisMonth: number // New participants this month
  growth: number // Growth percentage
  regions: RegionalParticipant[] // Regional distribution
  dailyGrowth: number[] // Daily growth data for chart
}

export interface PerformerData {
  id: number
  rank: number
  name: string
  score: number
  subordinates: number
  region?: string
}

export interface ScoreDistribution {
  range: string // e.g., "0-1000", "1000-2000"
  count: number
}

export interface PerformanceMetrics {
  avgScore: number
  topScore: number
  lowestScore: number
  medianScore: number
  distribution: ScoreDistribution[]
  topPerformers: PerformerData[]
}

export interface ComparisonData {
  period: string // e.g., "فروردین", "Q1", "1403"
  poolBalance: number
  participants: number
  change: number // Percentage change from previous period
  avgScore: number
}

export interface DateRangeOption {
  label: string
  value: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface FilterOptions {
  dateRange: {
    type: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    startDate?: Date
    endDate?: Date
  }
  regions: string[] // Selected regions
  networkLevel?: number[] // Network levels (1, 2, 3, etc.)
}

export interface PoolAnalyticsData {
  poolTrend: PoolDataPoint[]
  participantStats: ParticipantStats
  performanceMetrics: PerformanceMetrics
  monthlyComparison: ComparisonData[]
  quarterlyComparison: ComparisonData[]
}

// Export type for the entire analytics response
export interface PoolAnalyticsResponse {
  success: boolean
  data: PoolAnalyticsData
  timestamp: string
}

