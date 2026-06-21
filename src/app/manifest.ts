import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

// Nama/warna ikut settings DB saat request, bukan di-prerender saat build.
export const dynamic = "force-dynamic";

// White-label: nama/warna/deskripsi ikut Settings venue (bukan hardcode).
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.name,
    short_name: s.name.split(" ").slice(0, 2).join(" "),
    description: s.metaDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: s.brandPrimary,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
