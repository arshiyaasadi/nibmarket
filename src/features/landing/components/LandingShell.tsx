import { Footer } from "@/features/landing/components/Footer";
import { Header } from "@/features/landing/components/Header";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-auto pt-16">{children}</main>
      <Footer />
    </>
  );
}
