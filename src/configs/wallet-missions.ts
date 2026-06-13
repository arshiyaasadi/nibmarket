export type WalletMission = {
  id: number
  code: string
  title: string
}

export const WALLET_MISSIONS: WalletMission[] = [
  { id: 1, code: 'registration', title: 'ثبت‌نام در سامانه' },
  { id: 2, code: 'identity_verification', title: 'احراز هویت' },
  { id: 3, code: 'new_referral', title: 'معرفی فرد جدید' },
  { id: 4, code: 'daily_login', title: 'لاگین روزانه' },
  { id: 5, code: 'direct_subsets_3', title: 'رسیدن به ۳ زیرمجموعه مستقیم' },
  { id: 6, code: 'direct_subsets_7', title: 'رسیدن به ۷ زیرمجموعه مستقیم' },
  { id: 7, code: 'direct_subsets_20', title: 'رسیدن به ۲۰ زیرمجموعه مستقیم' },
  { id: 8, code: 'direct_subsets_50', title: 'رسیدن به ۵۰ زیرمجموعه مستقیم' },
  { id: 9, code: 'retention_share_layer1', title: 'سهم رسوب — معرف مستقیم' },
  { id: 10, code: 'retention_share_layer2', title: 'سهم رسوب — معرف لایه ۲' },
  { id: 11, code: 'retention_share_layer3', title: 'سهم رسوب — معرف لایه ۳' }
]

export const RETENTION_MISSION_IDS = [9, 10, 11] as const

export const RETENTION_MISSIONS = WALLET_MISSIONS.filter(m =>
  (RETENTION_MISSION_IDS as readonly number[]).includes(m.id)
)

const missionById = new Map(WALLET_MISSIONS.map(m => [m.id, m]))
const missionByCode = new Map(WALLET_MISSIONS.map(m => [m.code, m]))

export function getWalletMissionById(id: number): WalletMission | undefined {
  return missionById.get(id)
}

export function getWalletMissionByCode(code: string): WalletMission | undefined {
  return missionByCode.get(code.trim())
}

export function resolveWalletMissionTitle(
  missionId?: number,
  missionCode?: string,
  fallback = 'واریز'
): string {
  if (missionId != null) {
    const byId = getWalletMissionById(missionId)
    if (byId) return byId.title
  }

  if (missionCode?.trim()) {
    const byCode = getWalletMissionByCode(missionCode)
    if (byCode) return byCode.title
  }

  return fallback
}
