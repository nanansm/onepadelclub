import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";

// Modul POS opsional (venue.posEnabled). Off → seluruh /admin/pos/* jadi 404.
export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  if (!settings.posEnabled) notFound();
  return children;
}
