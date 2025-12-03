'use client'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import CrmAward from 'src/views/dashboards/crm/CrmAward'
import CrmRewards from 'src/views/dashboards/crm/CrmRewards'
import CrmTotalProfit from 'src/views/dashboards/crm/CrmTotalProfit'
import CrmProjectTimeline from 'src/views/dashboards/crm/CrmProjectTimeline'

const DashboardPage = () => {
  return (
    <ApexChartWrapper>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} md={8}>
          <CrmRewards />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmAward />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <CrmTotalProfit />
        </Grid>
       
        <Grid item xs={12} md={8}>
          <CrmProjectTimeline />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default DashboardPage

