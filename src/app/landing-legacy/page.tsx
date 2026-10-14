import LegacyLandingPage, {
  metadata as legacyMetadata,
} from "@/features/landing/LegacyLandingPage";

export const metadata = legacyMetadata;

/** Previous MLM landing — kept for reference; not deleted. */
export default function LandingLegacyRoute() {
  return <LegacyLandingPage />;
}
