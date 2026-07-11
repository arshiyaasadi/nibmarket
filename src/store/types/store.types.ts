import type { UserRole, LoginActivity, WalletSummary } from "@/types/mlm";

export interface AuthSliceState {
  token: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  userId: string | null;
  fullName: string | null;
  mobile: string | null;
  email: string | null;
  inviteCode: string | null;
  balance: number | null;
  wallet: WalletSummary | null;
  recentSessions: LoginActivity[];
}

export interface AuthSliceActions {
  setAuth: (payload: {
    token: string;
    refreshToken: string;
    role: UserRole;
    userId: string;
    fullName: string;
    mobile?: string;
    email?: string;
    inviteCode?: string;
    balance?: number | null;
    wallet?: WalletSummary | null;
    recentSessions?: LoginActivity[];
  }) => void;
  setToken: (token: string, refreshToken: string) => void;
  setWallet: (wallet: WalletSummary | null) => void;
  updateSession: (
    payload: Partial<Omit<AuthSliceState, "recentSessions">> & {
      recentSessions?: LoginActivity[];
    },
  ) => void;
  clearAuth: () => void;
}

export type AuthSlice = AuthSliceState & AuthSliceActions;

export type Theme = "light" | "dark" | "system";

export interface UiSliceState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: Theme;
}

export interface UiSliceActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setTheme: (theme: Theme) => void;
}

export type UiSlice = UiSliceState & UiSliceActions;
