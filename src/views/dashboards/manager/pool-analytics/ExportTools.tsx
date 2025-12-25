'use client'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { PoolAnalyticsData } from 'src/types/manager/pool-analytics'

interface ExportToolsProps {
  data: PoolAnalyticsData
}

const ExportTools = ({ data }: ExportToolsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [exporting, setExporting] = useState(false)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // ** Export to CSV
  const exportToCSV = () => {
    setExporting(true)
    
    try {
      // Prepare CSV data
      let csvContent = 'data:text/csv;charset=utf-8,'
      
      // Header
      csvContent += 'نوع داده,دوره,موجودی استخر,تعداد شرکت‌کنندگان,تغییرات,میانگین امتیاز\n'
      
      // Pool trend data
      data.poolTrend.forEach(item => {
        csvContent += `روند استخر,${item.date},${item.balance},${item.participants},${item.change}%,\n`
      })
      
      // Monthly comparison
      data.monthlyComparison.forEach(item => {
        csvContent += `مقایسه ماهانه,${item.period},${item.poolBalance},${item.participants},${item.change}%,${item.avgScore}\n`
      })
      
      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `pool_analytics_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      handleClose()
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  // ** Export to Excel (using JSON as fallback, real implementation would use xlsx library)
  const exportToExcel = () => {
    setExporting(true)
    
    try {
      // For a real implementation, you would use the 'xlsx' library
      // For now, we'll create a simple JSON export as a placeholder
      const jsonData = {
        poolTrend: data.poolTrend,
        participantStats: data.participantStats,
        performanceMetrics: {
          avgScore: data.performanceMetrics.avgScore,
          topScore: data.performanceMetrics.topScore,
          medianScore: data.performanceMetrics.medianScore,
          topPerformers: data.performanceMetrics.topPerformers
        },
        monthlyComparison: data.monthlyComparison,
        quarterlyComparison: data.quarterlyComparison
      }
      
      const jsonString = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pool_analytics_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      handleClose()
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setExporting(false)
    }
  }

  // ** Export to PDF (placeholder - real implementation would use jspdf)
  const exportToPDF = () => {
    setExporting(true)
    
    try {
      // For a real implementation, you would use 'jspdf' and 'jspdf-autotable'
      // For now, we'll create a simple text export
      let textContent = 'گزارش تحلیلی استخر و لیدربورد\n\n'
      textContent += `تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}\n\n`
      
      textContent += '=== آمار کلی ===\n'
      textContent += `کل شرکت‌کنندگان: ${data.participantStats.total}\n`
      textContent += `رشد: ${data.participantStats.growth}%\n`
      textContent += `میانگین امتیاز: ${data.performanceMetrics.avgScore}\n\n`
      
      textContent += '=== روند موجودی استخر ===\n'
      data.poolTrend.slice(-5).forEach(item => {
        textContent += `${item.date}: ${item.balance} TWIN (${item.participants} شرکت‌کننده)\n`
      })
      
      textContent += '\n=== برترین عملکردها ===\n'
      data.performanceMetrics.topPerformers.slice(0, 10).forEach(performer => {
        textContent += `${performer.rank}. ${performer.name}: ${performer.score} امتیاز\n`
      })
      
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pool_analytics_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      handleClose()
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Box>
      <Button
        variant='contained'
        color='primary'
        startIcon={exporting ? <CircularProgress size={16} color='inherit' /> : <Icon icon='mdi:download' />}
        onClick={handleClick}
        disabled={exporting}
      >
        خروجی گزارش
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <MenuItem onClick={exportToExcel}>
          <ListItemIcon>
            <Icon icon='mdi:microsoft-excel' fontSize={20} />
          </ListItemIcon>
          <ListItemText>Excel (.json)</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToPDF}>
          <ListItemIcon>
            <Icon icon='mdi:file-pdf-box' fontSize={20} />
          </ListItemIcon>
          <ListItemText>PDF (.txt)</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToCSV}>
          <ListItemIcon>
            <Icon icon='mdi:file-delimited' fontSize={20} />
          </ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportTools

