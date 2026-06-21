import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onepadelclub.com";

type Route = {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
  module?: "liga";
};

// Halaman publik statis. Halaman dinamis per-kode (/booking/[code] dll) sengaja
// tidak dimasukkan — privat per customer, tidak untuk di-index.
const ROUTES: Route[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/sewa", priority: 0.9, freq: "daily" },
  { path: "/open-play", priority: 0.8, freq: "daily" },
  { path: "/coaching", priority: 0.8, freq: "weekly" },
  { path: "/membership", priority: 0.8, freq: "weekly" },
  { path: "/liga", priority: 0.7, freq: "daily", module: "liga" },
  { path: "/liga/klasemen", priority: 0.6, freq: "daily", module: "liga" },
  { path: "/liga/jadwal", priority: 0.6, freq: "daily", module: "liga" },
  { path: "/liga/live", priority: 0.5, freq: "hourly", module: "liga" },
  { path: "/liga/regulasi", priority: 0.4, freq: "monthly", module: "liga" },
  { path: "/liga/hall-of-fame", priority: 0.4, freq: "monthly", module: "liga" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const now = new Date();
  return ROUTES.filter((r) => r.module !== "liga" || settings.ligaEnabled).map(
    (r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    }),
  );
}
