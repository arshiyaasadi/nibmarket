import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

/** Old nested path — messages is now its own admin section. */
export default function AdminUserMessagesRedirectPage() {
  redirect(ROUTES.ADMIN.SYSTEM_MESSAGES);
}
