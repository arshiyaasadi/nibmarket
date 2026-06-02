// ** Mission Data - Global missions list
export interface MissionType {
  id: number
  title: string
  completed: boolean
  reward: string
}

export const MISSION_REWARDS = [10, 10, 5, 1, 15, 40, 150, 500] as const

export const missionsData: MissionType[] = [
  {
    id: 1,
    title: 'ثبت نام در سامانه',
    completed: true,
    reward: '10 توکن'
  },
  {
    id: 2,
    title: 'احراز هویت',
    completed: false,
    reward: '10 توکن'
  },
  {
    id: 3,
    title: 'معرفی هر فرد جدید',
    completed: false,
    reward: '5 توکن'
  },
  {
    id: 4,
    title: 'لاگین روزانه',
    completed: false,
    reward: '1 توکن'
  },
  {
    id: 5,
    title: 'رسیدن به ۳ زیر مجموعه مستقیم',
    completed: false,
    reward: '15 توکن'
  },
  {
    id: 6,
    title: 'رسیدن به ۷ زیر مجموعه مستقیم',
    completed: false,
    reward: '40 توکن'
  },
  {
    id: 7,
    title: 'رسیدن به ۲۰ زیرمجموعه مستقیم',
    completed: false,
    reward: '150 توکن'
  },
  {
    id: 8,
    title: 'رسیدن به ۵۰ زیرمجموعه مستقیم',
    completed: false,
    reward: '500 توکن'
  }
]

export const incompleteMissions = missionsData.filter(m => !m.completed)
