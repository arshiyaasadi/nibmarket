// Shared mock credentials — safe to import in client components (no server-only deps).
export const MOCK_PASSWORD = "Test@1234";
export const MOCK_OTP = "1234";

/** Dev-only admin login via /login OTP flow. TODO(backend-admin-auth): remove when backend is ready. */
export { DEV_ADMIN } from "@/config/dev-admin-auth";
