import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { getActiveCoaches } from "@/lib/coaching";
import { getSettings } from "@/lib/settings";
import { todayJakarta } from "@/lib/tz";
import { CoachingFlow } from "./coaching-flow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaching / Klinik",
  description:
    "Latihan padel bareng pelatih berpengalaman. Pilih pelatih, tanggal, dan jam yang cocok.",
};

export const dynamic = "force-dynamic";

export default async function CoachingPage() {
  const [coaches, settings] = await Promise.all([
    getActiveCoaches(),
    getSettings(),
  ]);

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Coaching" />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading
          plain="Coaching /"
          accent="Klinik"
          sub="Latihan bareng pelatih berpengalaman. Pilih pelatih, tanggal, dan jam."
        />
        {coaches.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-muted">Belum ada pelatih tersedia.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-accent">
              Kembali ke beranda
            </Link>
          </div>
        ) : (
          <CoachingFlow
            coaches={coaches.map((c) => ({
              id: c.id,
              name: c.name,
              photoUrl: c.photoUrl,
              bio: c.bio,
              ratePerHour: c.ratePerHour,
            }))}
            today={todayJakarta()}
            minDuration={settings.minDuration}
            maxDuration={settings.maxDuration}
          />
        )}
      </main>
    </div>
  );
}
