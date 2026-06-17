import type { Metadata } from "next";
import { getCourts } from "@/lib/venue";
import {
  getSettings,
  brandVars,
  instagramUrl,
  tiktokUrl,
  fmtHour,
} from "@/lib/settings";
import {
  LandingNav,
  Hero,
  SchemesSection,
  StepsSection,
  CommunitySection,
  CourtsSection,
  LigaSection,
  LokasiSection,
  LandingFooter,
} from "@/components/landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    openGraph: s.ogImageUrl ? { images: [s.ogImageUrl] } : undefined,
    icons: s.logoUrl ? { icon: s.logoUrl } : undefined,
  };
}

export default async function Home() {
  const [settings, courts] = await Promise.all([getSettings(), getCourts()]);
  const prices = courts.map((c) => c.pricePerHour);
  const priceFrom = prices.length ? Math.min(...prices) : 150000;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: settings.name,
    description: settings.metaDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Garut",
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    openingHours: `Mo-Su ${fmtHour(settings.openHour).replace(".", ":")}-${fmtHour(
      settings.closeHour,
    ).replace(".", ":")}`,
    priceRange: `Rp${priceFrom.toLocaleString("id-ID")}+`,
    sameAs: [instagramUrl(settings), tiktokUrl(settings)].filter(Boolean),
  };

  return (
    <div className="opc" style={brandVars(settings)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav settings={settings} />
      <Hero
        courtCount={courts.length || 4}
        priceFrom={priceFrom}
        settings={settings}
      />
      <SchemesSection settings={settings} />
      <CommunitySection />
      <StepsSection />
      {courts.length > 0 ? <CourtsSection courts={courts} /> : null}
      <LigaSection settings={settings} />
      <LokasiSection settings={settings} />
      <LandingFooter settings={settings} />
    </div>
  );
}
