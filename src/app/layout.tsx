import type { Metadata, Viewport } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://padel.motekreatif.com";

// Metadata white-label: title/deskripsi/OG ikut Settings venue.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const ogImages = s.ogImageUrl ? [{ url: s.ogImageUrl }] : undefined;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.metaTitle,
      template: `%s · ${s.name}`,
    },
    description: s.metaDescription,
    applicationName: s.name,
    openGraph: {
      type: "website",
      siteName: s.name,
      locale: "id_ID",
      url: SITE_URL,
      title: s.metaTitle,
      description: s.metaDescription,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDescription,
      images: ogImages,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a4d33",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
