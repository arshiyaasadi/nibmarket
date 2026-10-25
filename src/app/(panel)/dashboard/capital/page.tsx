import { redirect } from "next/navigation";
import { guidelinesHref } from "@/features/guidelines";

/** Legacy capital/deposit-rules URL → unified guidelines page. */
export default function Page() {
  redirect(guidelinesHref("deposit"));
}
