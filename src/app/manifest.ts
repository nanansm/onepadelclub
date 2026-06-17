import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Padel Club",
    short_name: "One Padel",
    description:
      "Booking lapangan padel, open play, coaching, dan membership di Garut.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a4d33",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
