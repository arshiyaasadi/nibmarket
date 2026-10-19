/**
 * @level organism
 * @spacing internal: gap-org p-pad-org | external: none
 */
import { LandingMissionCard } from "@/components/molecules/landing/LandingMissionCard";
import { LandingSectionHeader } from "@/components/molecules/landing/LandingSectionHeader";
import { LANDING_MISSION_GROUPS } from "@/features/landing-tanvin/landing-content";

export function LandingMissions() {
  return (
    <section id="missions" className="bg-surface py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          eyebrow="مأموریت‌ها"
          title="۱٬۰۰۰ سکه تنوین برای شروع بازاریابی"
          lead="با انجام هر مرحله، دایره آن پر و سکه‌هایش به کیف پول بازاریاب واریز می‌شود."
        />
        <div className="gap-mol grid grid-cols-1 lg:grid-cols-2">
          {LANDING_MISSION_GROUPS.map((g) => (
            <LandingMissionCard
              key={g.title}
              title={g.title}
              subtitle={g.subtitle}
              totalLabel={g.totalLabel}
              steps={[...g.steps]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
