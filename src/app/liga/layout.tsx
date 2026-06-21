import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";

// Modul Liga opsional (white-label). Kalau owner matikan di /admin/settings,
// seluruh route /liga/* jadi 404 — tak bisa diakses lewat URL langsung.
export default async function LigaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  if (!settings.ligaEnabled) notFound();
  return children;
}
