import type { Metadata } from "next";
import { LandingShell } from "@/features/landing/components/LandingShell";
import { ScrollOrbitBlur } from "@/features/landing/components/ScrollOrbitBlur";
import { MLMHero } from "@/features/landing/components/MLMHero";
import { MLMSystem } from "@/features/landing/components/MLMSystem";
import { BentoGrid } from "@/features/landing/components/BentoGrid";
import { LiveChart } from "@/features/landing/components/LiveChart";
import { StakingPools } from "@/features/landing/components/StakingPools";
import { MLMEngine } from "@/features/landing/components/MLMEngine";
import { Faqs } from "@/features/landing/components/Faqs";
import { NibMarketFunds } from "@/features/landing/components/NibMarketFunds";
import "@/features/landing/landing.css";

export const metadata: Metadata = {
  title: "تامین سرمایه نوین - MLM؛ امتیاز نقره‌ای",
  description:
    "در باشگاه مشتریان تامین سرمایه نوین، امتیازها فقط عدد نیستند؛ سرمایه‌اند. با فعالیت و دعوت از دوستانتان در سامانه MLM، توکن TWIN دریافت کنید؛ امتیازی که ارزش آن دقیقاً برابر با نقره است.",
};

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden bg-gray-900 antialiased text-white">
      <ScrollOrbitBlur />
      <LandingShell>
        <MLMHero />
        <MLMSystem />
        <BentoGrid />
        <LiveChart />
        <MLMEngine />
        <StakingPools />
        <NibMarketFunds />
        <Faqs />
      </LandingShell>
    </div>
  );
}
