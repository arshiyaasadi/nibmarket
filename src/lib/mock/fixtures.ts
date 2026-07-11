import type {
  InvitedPerson,
  MissionActivity,
  MissionDef,
  NetworkTreeNode,
  UserRole,
} from "@/types/mlm";
import { formatDateTime } from "@/lib/utils";

export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001";
export const MOCK_MOBILE = "09123456789";
export const MOCK_REFERRAL_CODE = "NIB123456";

export const MOCK_INVITED: InvitedPerson[] = [
  {
    id: "dde83b0f-6474-f111-aa00-005056944021",
    firstName: "فريده",
    lastName: "زيناليان",
    fullName: "فريده زيناليان",
    mobile: "09012520901",
    status: "active",
    joinDate: "2023-03-13T06:21:44.4832950",
    level: 3,
    subMembersCount: 0,
    inviteType: "regular",
  },
  {
    id: "dce83b0f-6474-f111-aa00-005056944021",
    firstName: "بهرام",
    lastName: "حاجي هاشمي",
    fullName: "بهرام حاجي هاشمي",
    mobile: "09140341302",
    status: "active",
    joinDate: "2023-03-13T06:21:32.3340920",
    level: 2,
    subMembersCount: 0,
    inviteType: "regular",
  },
  {
    id: "11",
    firstName: "امير ",
    lastName: "زارع كاريزي",
    fullName: "امير  زارع كاريزي",
    mobile: "",
    status: "active",
    joinDate: "2023-01-29T14:12:03.8186700",
    level: 1,
    subMembersCount: 0,
    inviteType: "regular",
  },
  {
    id: "dbe83b0f-6474-f111-aa00-005056944021",
    firstName: "سعيد",
    lastName: "نيكنام",
    fullName: "سعيد نيكنام",
    mobile: "09363688302",
    status: "active",
    joinDate: "2023-01-25T07:55:56.1890470",
    level: 3,
    subMembersCount: 0,
    inviteType: "regular",
  },
  {
    id: "1",
    firstName: "محمد",
    lastName: "نباتي",
    fullName: "محمد نباتي",
    mobile: "",
    status: "active",
    joinDate: "2023-01-24T14:33:08.7921830",
    level: 1,
    subMembersCount: 0,
    inviteType: "regular",
  },
];

export const MOCK_MISSIONS: MissionDef[] = [
  {
    id: "m1",
    code: "daily_login",
    title: "لاگین روزانه",
    description: "هر روز وارد پنل شوید",
    reward: 10,
    missionType: "custom",
    status: "active",
    completed: false,
  },
  {
    id: "m2",
    code: "referral_3",
    title: "رسیدن به ۳ زیرمجموعه مستقیم",
    description: "۳ نفر را دعوت کنید",
    reward: 50,
    missionType: "referral_count",
    status: "active",
    completed: true,
    completedAt: formatDateTime("2024-06-07T15:34:11.000Z"),
  },
  {
    id: "m3",
    code: "invite_new",
    title: "معرفی فرد جدید",
    description: "یک فرد جدید معرفی کنید",
    reward: 25,
    missionType: "referral_count",
    status: "active",
    completed: true,
    completedAt: formatDateTime("2024-06-05T10:00:00.000Z"),
  },
];

export const MOCK_MISSION_ACTIVITY: MissionActivity[] = [
  {
    id: "ma1",
    missionId: "m2",
    title: "رسیدن به ۳ زیرمجموعه مستقیم",
    date: "2024-06-07T15:34:11.0000000",
    status: "completed",
    reward: 50,
    rrn: "MSN000000413",
  },
  {
    id: "ma2",
    missionId: "m3",
    title: "معرفی فرد جدید",
    date: "2024-06-05T10:00:00.0000000",
    status: "completed",
    reward: 25,
    rrn: "MSN000000412",
  },
  {
    id: "ma3",
    missionId: "m1",
    title: "لاگین روزانه",
    date: "2024-06-04T08:00:00.0000000",
    status: "pending_verification",
    reward: 10,
  },
];

export function buildMockNetworkTree(): NetworkTreeNode {
  const level1 = MOCK_INVITED.filter((m) => m.level === 1);
  const level2 = MOCK_INVITED.filter((m) => m.level === 2);
  const level3 = MOCK_INVITED.filter((m) => m.level === 3);

  const toNode = (p: InvitedPerson, children: NetworkTreeNode[] = []): NetworkTreeNode => ({
    id: p.id,
    fullName: p.fullName,
    level: p.level ?? 1,
    isSelf: false,
    children,
  });

  const l3Nodes = level3.map((p) => toNode(p));
  const l2Nodes = level2.map((p, i) => toNode(p, l3Nodes[i] ? [l3Nodes[i]] : []));
  const l1Nodes = level1.map((p, i) => toNode(p, l2Nodes[i] ? [l2Nodes[i]] : []));

  return {
    id: MOCK_USER_ID,
    fullName: "شما",
    level: 0,
    isSelf: true,
    children: l1Nodes,
  };
}

export interface MockUserRecord {
  id: string;
  mobile: string;
  email: string;
  passwordHash: string;
  status: "active" | "suspended" | "pending_verification" | "closed";
  referralCode: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  balance: number;
}

export function createDefaultMockUser(passwordHash: string): MockUserRecord {
  return {
    id: MOCK_USER_ID,
    mobile: MOCK_MOBILE,
    email: `${MOCK_MOBILE}@nibclub.local`,
    passwordHash,
    status: "active",
    referralCode: MOCK_REFERRAL_CODE,
    role: "client",
    firstName: "کاربر",
    lastName: "تست",
    balance: 1250,
  };
}
