export type FundCategoryItem = {
  title: string
  description: string
  image: string
}

export type FundCategory = {
  id: number
  category: string
  categoryTitle: string
  items: FundCategoryItem[]
}

export const fundsData: FundCategory[] = [
  {
    id: 1,
    category: 'Fixed Income',
    categoryTitle: 'صندوق‌های درآمد ثابت',
    items: [
      {
        title: 'آتيه نوين',
        description: 'بازده ماهانه ۲.۴۶٪ | بازده سالانه ۳۴.۴۸٪',
        image: '/images/fund/atiyeh.png'
      },
      {
        title: 'ثابت یکم ایرانیان',
        description: 'بازده ماهانه ۲.۱٪ | بازده سالانه ۲۹.۳۳٪',
        image: '/images/fund/yekom.png'
      },
      {
        title: 'فراز اندیش نوین',
        description: 'بازده ماهانه ۲.۴۲٪ | بازده سالانه ۳۴.۴۸٪',
        image: '/images/fund/faraz.png'
      }
    ]
  },
  {
    id: 2,
    category: 'Stock',
    categoryTitle: 'صندوق‌های سهامی',
    items: [
      {
        title: 'ميعاد ايرانيان',
        description: 'بازده ماهانه ۳۰.۰۸٪ | بازده سالانه ۵۹.۰۶٪',
        image: '/images/fund/miaad.png'
      }
    ]
  },
  {
    id: 3,
    category: 'ETF',
    categoryTitle: 'صندوق‌های ETF',
    items: [
      {
        title: 'نهال سرمايه ايرانيان',
        description: 'بازده ماهانه ۲.۵۷٪ | بازده سالانه ۳۶٪',
        image: '/images/fund/nahal.png'
      },
      {
        title: 'ارمغان ایرانیان',
        description: 'بازده ماهانه ۲.۹۳٪ | بازده سالانه ۳۷.۱۶٪',
        image: '/images/fund/armaghan.png'
      },
      {
        title: 'سپهر انديشه نوين',
        description: 'بازده ماهانه ۱۹٪ | بازده سالانه ۵۵.۲٪',
        image: '/images/fund/sepehr.png'
      },
      {
        title: 'طلاي گلديس',
        description: 'بازده ماهانه -۱۴.۵۸٪ | بازده سالانه ۱۴۲.۵۶٪',
        image: '/images/fund/goldis.png'
      },
      {
        title: 'پالایشی یکم',
        description: 'بازده ماهانه ۴۴.۳۹٪ | بازده سالانه ۳۳.۰۸٪',
        image: '/images/fund/palayesh.png'
      }
    ]
  }
]

export type InviteFundOption = {
  id: string
  name: string
  description: string
  image: string
  category: string
}

export const inviteFunds: InviteFundOption[] = fundsData.flatMap(category =>
  category.items.map(item => ({
    id: item.image.replace(/^\/images\/fund\//, '').replace(/\.png$/, ''),
    name: item.title,
    description: item.description,
    image: item.image,
    category: category.categoryTitle
  }))
)
