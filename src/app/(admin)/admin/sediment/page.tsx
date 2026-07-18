import type { Metadata } from "next";
import SedimentPageContent from "./SedimentPageContent";

export const metadata: Metadata = { title: "رسوب — مدیریت" };

export default function SedimentPage() {
  return <SedimentPageContent />;
}
