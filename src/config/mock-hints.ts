// Shared mock credentials — safe to import in client components (no server-only deps).
export const MOCK_PASSWORD = "Test@1234";
export const MOCK_OTP = "1234";

/** Dev-only admin credentials — used by mock auth and ENABLE_DEV_ADMIN_LOGIN on `/login`. */
export const DEV_ADMIN_LOGIN = {
  username: "admin",
  password: "Admin@1403",
  fullName: "مدیر توسعه",
  email: "dev-admin@nibclub.local",
  mobile: "09173648291",
} as const;
