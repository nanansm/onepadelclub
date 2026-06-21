import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";

// Modul Liga opsional. Kalau dimatikan, route admin liga juga 404 (menu sudah
// disembunyikan; ini cegah akses via URL/bookmark langsung).
export default async function AdminLigaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  if (!settings.ligaEnabled) notFound();
  return children;
}
