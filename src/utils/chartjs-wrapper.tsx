// ** React Imports
import React from 'react'

// ** Chart.js Imports
import {
  Line as LineOriginal,
  Bar as BarOriginal,
  Bubble as BubbleOriginal,
  Doughnut as DoughnutOriginal,
  Pie as PieOriginal,
  PolarArea as PolarAreaOriginal,
  Radar as RadarOriginal,
  Scatter as ScatterOriginal
} from 'react-chartjs-2'

// ** Type assertions for React 19 compatibility
export const Line = LineOriginal as any as React.ComponentType<any>
export const Bar = BarOriginal as any as React.ComponentType<any>
export const Bubble = BubbleOriginal as any as React.ComponentType<any>
export const Doughnut = DoughnutOriginal as any as React.ComponentType<any>
export const Pie = PieOriginal as any as React.ComponentType<any>
export const PolarArea = PolarAreaOriginal as any as React.ComponentType<any>
export const Radar = RadarOriginal as any as React.ComponentType<any>
export const Scatter = ScatterOriginal as any as React.ComponentType<any>

