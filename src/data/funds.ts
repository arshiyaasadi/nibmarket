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
        title: 'صندوق عطیه',
        description: 'درآمد ثابت با بازدهی مطمئن و ریسک پایین',
        image: '/images/fund/atiyeh.png'
      },
      {
        title: 'صندوق سپهر',
        description: 'سرمایه‌گذاری امن با سود پایدار',
        image: '/images/fund/sepehr.png'
      },
      {
        title: 'صندوق نهال',
        description: 'رشد آرام و مطمئن سرمایه شما',
        image: '/images/fund/nahal.png'
      }
    ]
  },
  {
    id: 2,
    category: 'Stock',
    categoryTitle: 'صندوق‌های سهامی',
    items: [
      {
        title: 'صندوق پیشرو',
        description: 'پیشرو در بازار سهام با بازدهی برتر',
        image: '/images/fund/pishro.png'
      },
      {
        title: 'صندوق فراز',
        description: 'فراتر از انتظارات، بالاتر از شاخص',
        image: '/images/fund/faraz.png'
      },
      {
        title: 'صندوق پالایش',
        description: 'سرمایه‌گذاری هوشمند در بازار سرمایه',
        image: '/images/fund/palayesh.png'
      }
    ]
  },
  {
    id: 3,
    category: 'Gold',
    categoryTitle: 'صندوق‌های طلا',
    items: [
      {
        title: 'صندوق گلدیس',
        description: 'امنیت طلا، بازدهی هوشمند',
        image: '/images/fund/goldis.png'
      },
      {
        title: 'صندوق آرمغان',
        description: 'آرمغانی ارزشمند برای آینده شما',
        image: '/images/fund/armaghan.png'
      },
      {
        title: 'صندوق زرین',
        description: 'سرمایه‌گذاری در طلا با بازدهی بالا',
        image: '/images/fund/zarin.png'
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
