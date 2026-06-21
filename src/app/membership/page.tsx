import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { getActivePlans } from "@/lib/membership";
import { PlanList } from "./plan-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Paket member dengan harga khusus dan benefit rutin main tiap bulan.",
};

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const plans = await getActivePlans();

  return (
    <div className="min-h-dvh bg-cream/20">
      <SiteHeader title="Membership" />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <PageHeading
          plain="Paket"
          accent="Membership"
          sub="Harga khusus dan benefit rutin main tiap bulan. Pilih paket yang cocok."
        />
        {plans.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-muted">Belum ada paket membership.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-accent">
              Kembali ke beranda
            </Link>
          </div>
        ) : (
          <PlanList
            plans={plans.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              durationDays: p.durationDays,
              benefits: (p.benefits ?? "")
                .split("\n")
                .map((b) => b.trim())
                .filter(Boolean),
            }))}
          />
        )}
      </main>
    </div>
  );
}
