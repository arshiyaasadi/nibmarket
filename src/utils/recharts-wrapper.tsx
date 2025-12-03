// ** React Imports
import React from 'react'

// ** Recharts Imports
import {
  AreaChart as AreaChartOriginal,
  Area as AreaOriginal,
  BarChart as BarChartOriginal,
  Bar as BarOriginal,
  LineChart as LineChartOriginal,
  Line as LineOriginal,
  PieChart as PieChartOriginal,
  Pie as PieOriginal,
  RadarChart as RadarChartOriginal,
  Radar as RadarOriginal,
  ScatterChart as ScatterChartOriginal,
  Scatter as ScatterOriginal,
  XAxis as XAxisOriginal,
  YAxis as YAxisOriginal,
  CartesianGrid as CartesianGridOriginal,
  Tooltip as TooltipOriginal,
  ResponsiveContainer as ResponsiveContainerOriginal,
  Cell as CellOriginal,
  Legend as LegendOriginal,
  Label as LabelOriginal,
  PolarGrid as PolarGridOriginal,
  PolarAngleAxis as PolarAngleAxisOriginal,
  PolarRadiusAxis as PolarRadiusAxisOriginal
} from 'recharts'

// ** Type assertions for React 19 compatibility
export const AreaChart = AreaChartOriginal as any as React.ComponentType<any>
export const Area = AreaOriginal as any as React.ComponentType<any>
export const BarChart = BarChartOriginal as any as React.ComponentType<any>
export const Bar = BarOriginal as any as React.ComponentType<any>
export const LineChart = LineChartOriginal as any as React.ComponentType<any>
export const Line = LineOriginal as any as React.ComponentType<any>
export const PieChart = PieChartOriginal as any as React.ComponentType<any>
export const Pie = PieOriginal as any as React.ComponentType<any>
export const RadarChart = RadarChartOriginal as any as React.ComponentType<any>
export const Radar = RadarOriginal as any as React.ComponentType<any>
export const ScatterChart = ScatterChartOriginal as any as React.ComponentType<any>
export const Scatter = ScatterOriginal as any as React.ComponentType<any>
export const XAxis = XAxisOriginal as any as React.ComponentType<any>
export const YAxis = YAxisOriginal as any as React.ComponentType<any>
export const CartesianGrid = CartesianGridOriginal as any as React.ComponentType<any>
export const Tooltip = TooltipOriginal as any as React.ComponentType<any>
export const ResponsiveContainer = ResponsiveContainerOriginal as any as React.ComponentType<any>
export const Cell = CellOriginal as any as React.ComponentType<any>
export const Legend = LegendOriginal as any as React.ComponentType<any>
export const Label = LabelOriginal as any as React.ComponentType<any>
export const PolarGrid = PolarGridOriginal as any as React.ComponentType<any>
export const PolarAngleAxis = PolarAngleAxisOriginal as any as React.ComponentType<any>
export const PolarRadiusAxis = PolarRadiusAxisOriginal as any as React.ComponentType<any>

// Export types that might be needed
export type { TooltipProps } from 'recharts'

