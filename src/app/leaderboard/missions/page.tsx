'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'

interface MissionType {
  id: number
  title: string
  completed: boolean
  reward: string
}

const missionsData: MissionType[] = [
  {
    id: 1,
    title: 'ثبت نام در سامانه',
    completed: false,
    reward: 'A توکن'
  },
  {
    id: 2,
    title: 'احراز هویت',
    completed: false,
    reward: 'B توکن'
  },
  {
    id: 3,
    title: 'معرفی هر فرد جدید',
    completed: false,
    reward: 'C توکن'
  },
  {
    id: 4,
    title: 'لاگین روزانه',
    completed: false,
    reward: 'D توکن'
  },
  {
    id: 5,
    title: 'رسیدن به ۳ زیر مجموعه مستقیم',
    completed: false,
    reward: 'E توکن'
  },
  {
    id: 6,
    title: 'رسیدن به ۷ زیر مجموعه مستقیم',
    completed: false,
    reward: 'F توکن'
  },
  {
    id: 7,
    title: 'رسیدن به ۲۰ زیر مجموعه مستقیم و غیر مستقیم',
    completed: false,
    reward: 'G توکن'
  },
  {
    id: 8,
    title: 'رسیدن به ۵۰ زیر مجموعه مستقیم و غیر مستقیم',
    completed: false,
    reward: 'H توکن'
  }
]

const MissionsPageContent = () => {
  const handleMissionClick = (mission: MissionType) => {
    if (!mission.completed) {
      // Handle mission click logic here
      console.log('Mission clicked:', mission)
    }
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        ماموریت ها
      </Typography>
      <Card>
        <CardHeader
          title='جدول فعالیت هایی که فرد می تواند با تکمیل و انجام آن توکن بدست بیاورد'
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        />
        <CardContent>
          <Box>
            {missionsData.map((mission: MissionType) => (
              <ListItem
                key={mission.id}
                disablePadding
                sx={{
                  mb: 4,
                  borderRadius: 1,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
                  }
                }}
              >
                <ListItemButton
                  onClick={() => handleMissionClick(mission)}
                  sx={{
                    borderRadius: 1,
                    py: 1.5,
                    px: 2
                  }}
                >
                  <Checkbox
                    checked={mission.completed}
                    disabled
                    size='small'
                    sx={{
                      mr: 1.5,
                      '&.Mui-checked': {
                        color: 'success.main'
                      },
                      '&.Mui-disabled': {
                        color: mission.completed ? 'success.main' : 'action.disabled'
                      }
                    }}
                  />
                  <ListItemText
                    primary={mission.title}
                    sx={{
                      flex: 1,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        textDecoration: mission.completed ? 'line-through' : 'none',
                        color: mission.completed ? 'text.secondary' : 'text.primary'
                      }
                    }}
                  />
                  <CustomChip
                    size='small'
                    label={mission.reward}
                    color='success'
                    skin='light'
                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

const MissionsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MissionsPageContent />
    </Suspense>
  )
}

export default MissionsPage

