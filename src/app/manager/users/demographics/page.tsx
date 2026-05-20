'use client'

// ** React Imports
import { Suspense, useState, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// ** Component Imports
import AgeDistribution from 'src/views/dashboards/manager/users/demographics/AgeDistribution'
import GenderDistribution from 'src/views/dashboards/manager/users/demographics/GenderDistribution'
import CapitalDistribution from 'src/views/dashboards/manager/users/demographics/CapitalDistribution'
import EducationDistribution from 'src/views/dashboards/manager/users/demographics/EducationDistribution'
import SubordinatesCapitalDistribution from 'src/views/dashboards/manager/users/demographics/SubordinatesCapitalDistribution'

// ** Types
interface DemographicData {
  age: number
  gender: 'مرد' | 'زن'
  capital: number
  subordinatesCapital: number
  education: 'دیپلم' | 'لیسانس' | 'فوق لیسانس' | 'دکتری' | 'سایر'
}

// ** Mock Data Generator
const generateMockDemographicData = (count: number): DemographicData[] => {
  const genders: ('مرد' | 'زن')[] = ['مرد', 'زن']
  const educations: ('دیپلم' | 'لیسانس' | 'فوق لیسانس' | 'دکتری' | 'سایر')[] = [
    'دیپلم',
    'لیسانس',
    'فوق لیسانس',
    'دکتری',
    'سایر'
  ]

  const data: DemographicData[] = []

  for (let i = 0; i < count; i++) {
    data.push({
      age: Math.floor(Math.random() * 50) + 18, // 18-68 years
      gender: genders[Math.floor(Math.random() * genders.length)],
      capital: Math.floor(Math.random() * 200000) + 1000,
      subordinatesCapital: Math.floor(Math.random() * 1000000) + 5000,
      education: educations[Math.floor(Math.random() * educations.length)]
    })
  }

  return data
}

const DemographicsPageContent = () => {
  // ** Mock data - in real app, this would come from API
  const [demographicData] = useState<DemographicData[]>(() => generateMockDemographicData(1500))
  const totalUsers = demographicData.length

  // ** Process Age Distribution
  const ageDistribution = useMemo(() => {
    const ranges = [
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-45', min: 36, max: 45 },
      { label: '46-55', min: 46, max: 55 },
      { label: '56+', min: 56, max: 100 }
    ]

    return ranges.map(range => {
      const count = demographicData.filter(
        user => user.age >= range.min && user.age <= range.max
      ).length
      return {
        ageRange: `${range.label} سال`,
        count,
        percentage: (count / totalUsers) * 100
      }
    })
  }, [demographicData, totalUsers])

  // ** Process Gender Distribution
  const genderDistribution = useMemo(() => {
    const genders = ['مرد', 'زن'] as const
    return genders.map(gender => {
      const count = demographicData.filter(user => user.gender === gender).length
      return {
        gender,
        count,
        percentage: (count / totalUsers) * 100
      }
    })
  }, [demographicData, totalUsers])

  // ** Process Capital Distribution
  const capitalDistribution = useMemo(() => {
    const ranges = [
      { label: 'کمتر از 10K', min: 0, max: 10000 },
      { label: '10K - 50K', min: 10000, max: 50000 },
      { label: '50K - 100K', min: 50000, max: 100000 },
      { label: '100K - 200K', min: 100000, max: 200000 },
      { label: 'بیش از 200K', min: 200000, max: Infinity }
    ]

    return ranges.map(range => {
      const count = demographicData.filter(
        user => user.capital >= range.min && user.capital < range.max
      ).length
      return {
        range: range.label,
        count,
        percentage: (count / totalUsers) * 100
      }
    })
  }, [demographicData, totalUsers])

  // ** Process Education Distribution
  const educationDistribution = useMemo(() => {
    const educations = ['دیپلم', 'لیسانس', 'فوق لیسانس', 'دکتری', 'سایر'] as const
    return educations.map(education => {
      const count = demographicData.filter(user => user.education === education).length
      return {
        education,
        count,
        percentage: (count / totalUsers) * 100
      }
    })
  }, [demographicData, totalUsers])

  // ** Process Subordinates Capital Distribution
  const subordinatesCapitalDistribution = useMemo(() => {
    const ranges = [
      { label: 'کمتر از 50K', min: 0, max: 50000 },
      { label: '50K - 200K', min: 50000, max: 200000 },
      { label: '200K - 500K', min: 200000, max: 500000 },
      { label: '500K - 1M', min: 500000, max: 1000000 },
      { label: 'بیش از 1M', min: 1000000, max: Infinity }
    ]

    return ranges.map(range => {
      const count = demographicData.filter(
        user => user.subordinatesCapital >= range.min && user.subordinatesCapital < range.max
      ).length
      return {
        range: range.label,
        count,
        percentage: (count / totalUsers) * 100
      }
    })
  }, [demographicData, totalUsers])

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        جمعیت‌شناختی کاربران
      </Typography>

      <Grid container spacing={6}>
        {/* Age Distribution */}
        <Grid item xs={12} lg={6}>
          <AgeDistribution data={ageDistribution} totalUsers={totalUsers} />
        </Grid>

        {/* Gender Distribution */}
        <Grid item xs={12} lg={6}>
          <GenderDistribution data={genderDistribution} totalUsers={totalUsers} />
        </Grid>

        {/* Capital Distribution */}
        <Grid item xs={12} lg={6}>
          <CapitalDistribution data={capitalDistribution} totalUsers={totalUsers} />
        </Grid>

        {/* Education Distribution */}
        <Grid item xs={12} lg={6}>
          <EducationDistribution data={educationDistribution} totalUsers={totalUsers} />
        </Grid>

        {/* Subordinates Capital Distribution */}
        <Grid item xs={12}>
          <SubordinatesCapitalDistribution
            data={subordinatesCapitalDistribution}
            totalUsers={totalUsers}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

const DemographicsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DemographicsPageContent />
    </Suspense>
  )
}

export default DemographicsPage
