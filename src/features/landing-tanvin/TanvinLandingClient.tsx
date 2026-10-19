/**
 * Tanvin marketing landing — composed from design-system organisms.
 */
"use client";

import { startAuthEntry } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { LandingReveal } from "@/components/molecules/landing/LandingReveal";
import { LandingBadges } from "@/components/organisms/landing/LandingBadges";
import { LandingCalc } from "@/components/organisms/landing/LandingCalc";
import { LandingFooter } from "@/components/organisms/landing/LandingFooter";
import { LandingHero } from "@/components/organisms/landing/LandingHero";
import { LandingJoin } from "@/components/organisms/landing/LandingJoin";
import {
  LandingFaq,
  LandingInvitee,
  LandingPool,
  LandingWho,
} from "@/components/organisms/landing/LandingMoreSections";
import { LandingMissions } from "@/components/organisms/landing/LandingMissions";
import { LandingNav } from "@/components/organisms/landing/LandingNav";
import { LandingStory, LandingStrip } from "@/components/organisms/landing/LandingStory";
import "./tanvin-landing.css";

export function TanvinLandingClient() {
  function onAuthEntry() {
    startAuthEntry(ROUTES.DASHBOARD);
  }

  return (
    <div className="bg-background text-foreground min-h-dvh font-sans" dir="rtl" lang="fa">
      <LandingNav onAuthEntry={onAuthEntry} />
      <LandingHero />
      <div className="flex flex-col">
        <LandingReveal>
          <LandingStrip />
        </LandingReveal>
        <LandingReveal>
          <LandingStory />
        </LandingReveal>
        <LandingReveal>
          <LandingCalc onStartMarketing={onAuthEntry} />
        </LandingReveal>
        <LandingReveal>
          <LandingBadges />
        </LandingReveal>
        <LandingReveal>
          <LandingWho />
        </LandingReveal>
        <LandingReveal>
          <LandingMissions />
        </LandingReveal>
        <LandingReveal>
          <LandingInvitee />
        </LandingReveal>
        <LandingReveal>
          <LandingPool />
        </LandingReveal>
        <LandingReveal>
          <LandingFaq />
        </LandingReveal>
        <LandingReveal>
          <LandingJoin onAuthEntry={onAuthEntry} />
        </LandingReveal>
      </div>
      <LandingFooter />
    </div>
  );
}
