import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onepadelclub.com";

// Halaman publik statis. Halaman dinamis per-kode (/booking/[code] dll) sengaja
// tidak dimasukkan — privat per customer, tidak untuk di-index.
const ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/sewa", priority: 0.9, freq: "daily" },
  { path: "/open-play", priority: 0.8, freq: "daily" },
  { path: "/coaching", priority: 0.8, freq: "weekly" },
  { path: "/membership", priority: 0.8, freq: "weekly" },
  { path: "/liga", priority: 0.7, freq: "daily" },
  { path: "/liga/klasemen", priority: 0.6, freq: "daily" },
  { path: "/liga/jadwal", priority: 0.6, freq: "daily" },
  { path: "/liga/live", priority: 0.5, freq: "hourly" },
  { path: "/liga/regulasi", priority: 0.4, freq: "monthly" },
  { path: "/liga/hall-of-fame", priority: 0.4, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
