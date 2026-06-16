import { getCourts, getVenue } from "@/lib/venue";
import {
  LandingNav,
  Hero,
  SchemesSection,
  StepsSection,
  CourtsSection,
  LigaSection,
  LokasiSection,
  LandingFooter,
} from "@/components/landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [venue, courts] = await Promise.all([getVenue(), getCourts()]);
  const prices = courts.map((c) => c.pricePerHour);
  const priceFrom = prices.length ? Math.min(...prices) : 150000;

  return (
    <div className="opc">
      <LandingNav />
      <Hero courtCount={courts.length || 4} priceFrom={priceFrom} />
      <SchemesSection />
      <StepsSection />
      {courts.length > 0 ? <CourtsSection courts={courts} /> : null}
      <LigaSection />
      {venue ? <LokasiSection venue={venue} /> : null}
      {venue ? <LandingFooter venue={venue} /> : null}
    </div>
  );
}
