// ** Mission Data - Global missions list
export interface MissionType {
  id: number
  title: string
  completed: boolean
  reward: string
}

export const missionsData: MissionType[] = [
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

