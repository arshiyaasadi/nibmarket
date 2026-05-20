'use client'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import OutlinedInput from '@mui/material/OutlinedInput'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { FilterOptions, DateRangeOption } from 'src/types/manager/pool-analytics'

// ** Date Range Options
const dateRangeOptions: DateRangeOption[] = [
  { label: 'امروز', value: 'day' },
  { label: 'این هفته', value: 'week' },
  { label: 'این ماه', value: 'month' },
  { label: 'این فصل', value: 'quarter' },
  { label: 'امسال', value: 'year' },
  { label: 'بازه سفارشی', value: 'custom' }
]

// ** Region Options (Iranian Provinces)
const regionOptions = [
  'تهران',
  'اصفهان',
  'مشهد',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'کرمانشاه',
  'رشت',
  'یزد',
  'ارومیه',
  'زاهدان',
  'همدان',
  'کرمان',
  'اردبیل',
  'بندرعباس',
  'اراک',
  'زنجان',
  'قزوین'
]

// ** Network Level Options
const networkLevelOptions = [
  { label: 'سطح 1', value: 1 },
  { label: 'سطح 2', value: 2 },
  { label: 'سطح 3', value: 3 },
  { label: 'سطح 4', value: 4 },
  { label: 'سطح 5+', value: 5 }
]

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void
  onResetFilters: () => void
}

const AdvancedFilters = ({ onApplyFilters, onResetFilters }: AdvancedFiltersProps) => {
  const theme = useTheme()

  // ** State
  const [dateRangeType, setDateRangeType] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedNetworkLevels, setSelectedNetworkLevels] = useState<number[]>([])

  // ** Handlers
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRangeType(event.target.value as any)
  }

  const handleRegionChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setSelectedRegions(typeof value === 'string' ? value.split(',') : value)
  }

  const handleNetworkLevelChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    setSelectedNetworkLevels(
      typeof value === 'string' ? value.split(',').map(Number) : value
    )
  }

  const handleApply = () => {
    const filters: FilterOptions = {
      dateRange: {
        type: dateRangeType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      regions: selectedRegions,
      networkLevel: selectedNetworkLevels.length > 0 ? selectedNetworkLevels : undefined
    }
    onApplyFilters(filters)
  }

  const handleReset = () => {
    setDateRangeType('month')
    setStartDate('')
    setEndDate('')
    setSelectedRegions([])
    setSelectedNetworkLevels([])
    onResetFilters()
  }

  return (
    <Card sx={{ mb: 6 }}>
      <CardContent>
        <Grid container spacing={4} alignItems='center'>
          {/* Date Range Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id='date-range-label'>بازه زمانی</InputLabel>
              <Select
                labelId='date-range-label'
                id='date-range-select'
                value={dateRangeType}
                label='بازه زمانی'
                onChange={handleDateRangeChange}
              >
                {dateRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Date Range Fields */}
          {dateRangeType === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type='date'
                  label='از تاریخ'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type='date'
                  label='تا تاریخ'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Region Filter */}
          <Grid item xs={12} sm={6} md={dateRangeType === 'custom' ? 3 : 4}>
            <FormControl fullWidth>
              <InputLabel id='region-label'>منطقه/استان</InputLabel>
              <Select
                labelId='region-label'
                id='region-select'
                multiple
                value={selectedRegions}
                onChange={handleRegionChange}
                input={<OutlinedInput label='منطقه/استان' />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size='small' />
                    ))}
                  </Box>
                )}
              >
                {regionOptions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Network Level Filter */}
          <Grid item xs={12} sm={6} md={dateRangeType === 'custom' ? 2 : 3}>
            <FormControl fullWidth>
              <InputLabel id='network-level-label'>سطح شبکه</InputLabel>
              <Select
                labelId='network-level-label'
                id='network-level-select'
                multiple
                value={selectedNetworkLevels}
                onChange={handleNetworkLevelChange}
                input={<OutlinedInput label='سطح شبکه' />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={`سطح ${value}`} size='small' />
                    ))}
                  </Box>
                )}
              >
                {networkLevelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                startIcon={<Icon icon='mdi:filter' />}
                onClick={handleApply}
                fullWidth
              >
                اعمال
              </Button>
              <Button
                variant='outlined'
                startIcon={<Icon icon='mdi:refresh' />}
                onClick={handleReset}
                fullWidth
              >
                بازنشانی
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AdvancedFilters

