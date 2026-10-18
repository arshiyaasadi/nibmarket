import type {
  InvitedPerson,
  MissionActivity,
  MissionDef,
  NetworkTreeNode,
  UserRole,
} from "@/types/mlm";
import { formatDateTime } from "@/lib/utils";
import { MEHR_MISSIONS, toUserMissionDef } from "@/resources/data/mehr-missions";

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

/** Mock seed mirrors Mehr marketing list; a couple marked completed for UI demos. */
export const MOCK_MISSIONS: MissionDef[] = MEHR_MISSIONS.map((seed, index) => {
  const base = toUserMissionDef(seed);
  if (seed.code === "monthly_referrals_3") {
    return {
      ...base,
      id: "m2",
      completed: true,
      completedAt: formatDateTime("2024-06-07T15:34:11.000Z"),
    };
  }
  if (seed.code === "new_referral") {
    return {
      ...base,
      id: "m3",
      completed: true,
      completedAt: formatDateTime("2024-06-05T10:00:00.000Z"),
    };
  }
  if (seed.code === "daily_login") {
    return { ...base, id: "m1" };
  }
  return { ...base, id: `m-${index + 1}` };
});

export const MOCK_MISSION_ACTIVITY: MissionActivity[] = [
  {
    id: "ma1",
    missionId: "m2",
    title: "معرفی حداقل ۳ فرد در یک ماه",
    date: "2024-06-07T15:34:11.0000000",
    status: "completed",
    reward: 500,
    rrn: "MSN000000413",
  },
  {
    id: "ma2",
    missionId: "m3",
    title: "معرفی فرد جدید",
    date: "2024-06-05T10:00:00.0000000",
    status: "completed",
    reward: 50,
    rrn: "MSN000000412",
  },
  {
    id: "ma3",
    missionId: "m1",
    title: "لاگین روزانه",
    date: "2024-06-04T08:00:00.0000000",
    status: "pending_verification",
    reward: 2,
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
  kycStatus: "none" | "pending" | "verified" | "rejected";
  gender: "male" | "female";
  birthDate: string | null;
  nationalId: string | null;
  nibMarketLinked: boolean;
  createdAt: string;
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
    kycStatus: "verified",
    gender: "male",
    birthDate: "1370-05-12",
    nationalId: "0012345678",
    nibMarketLinked: true,
    createdAt: "2023-01-24T14:33:08.792Z",
  };
}

export const MOCK_ADMIN_DEMOGRAPHICS = {
  totalUsers: 1500,
  ageDistribution: [
    { range: "18-25 سال", count: 250, percent: 16.7 },
    { range: "26-35 سال", count: 295, percent: 19.7 },
    { range: "36-45 سال", count: 276, percent: 18.4 },
    { range: "46-55 سال", count: 313, percent: 20.9 },
    { range: "56+ سال", count: 366, percent: 24.4 },
  ],
  genderDistribution: [
    { gender: "male" as const, label: "مرد", count: 892, percent: 59.5 },
    { gender: "female" as const, label: "زن", count: 608, percent: 40.5 },
  ],
};

export function createSeedMockUsers(passwordHash: string): MockUserRecord[] {
  return [
    {
      id: "00000000-0000-4000-8000-000000000002",
      mobile: "09121111111",
      email: "09121111111@nibclub.local",
      passwordHash,
      status: "active",
      referralCode: "NIB654321",
      role: "client",
      firstName: "سارا",
      lastName: "احمدی",
      balance: 3400,
      kycStatus: "verified",
      gender: "female",
      birthDate: "1368-03-20",
      nationalId: "0023456789",
      nibMarketLinked: true,
      createdAt: "2023-02-10T09:15:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      mobile: "09122222222",
      email: "09122222222@nibclub.local",
      passwordHash,
      status: "suspended",
      referralCode: "NIB789012",
      role: "client",
      firstName: "رضا",
      lastName: "کریمی",
      balance: 120,
      kycStatus: "pending",
      gender: "male",
      birthDate: "1362-11-05",
      nationalId: null,
      nibMarketLinked: true,
      createdAt: "2023-04-18T11:42:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      mobile: "09123333333",
      email: "09123333333@nibclub.local",
      passwordHash,
      status: "pending_verification",
      referralCode: "NIB345678",
      role: "client",
      firstName: "مریم",
      lastName: "حسینی",
      balance: 0,
      kycStatus: "none",
      gender: "female",
      birthDate: "1375-07-01",
      nationalId: null,
      nibMarketLinked: false,
      createdAt: "2024-01-05T08:20:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000005",
      mobile: "09124444444",
      email: "09124444444@nibclub.local",
      passwordHash,
      status: "active",
      referralCode: "NIB901234",
      role: "manager",
      firstName: "علی",
      lastName: "محمدی",
      balance: 8900,
      kycStatus: "verified",
      gender: "male",
      birthDate: "1358-09-14",
      nationalId: "0034567890",
      nibMarketLinked: true,
      createdAt: "2022-11-30T16:00:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000006",
      mobile: "09125555555",
      email: "09125555555@nibclub.local",
      passwordHash,
      status: "closed",
      referralCode: "NIB567890",
      role: "client",
      firstName: "زهرا",
      lastName: "رحیمی",
      balance: 0,
      kycStatus: "rejected",
      gender: "female",
      birthDate: "1365-01-28",
      nationalId: "0045678901",
      nibMarketLinked: true,
      createdAt: "2022-08-12T13:25:00.000Z",
    },
  ];
}
