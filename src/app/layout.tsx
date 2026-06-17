import type { Metadata, Viewport } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onepadelclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "One Padel Club — Main Padel di Garut",
    template: "%s · One Padel Club",
  },
  description:
    "Booking lapangan padel, open play, coaching, dan membership di Garut. Rumah resmi Liga Padel Kota Intan.",
  applicationName: "One Padel Club",
  openGraph: {
    type: "website",
    siteName: "One Padel Club",
    locale: "id_ID",
    url: SITE_URL,
    title: "One Padel Club — Main Padel di Garut",
    description:
      "Lapangan padel indoor aesthetic di Garut. Booking lapangan, open play, coaching, membership, dan Liga Padel Kota Intan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Padel Club — Main Padel di Garut",
    description:
      "Lapangan padel indoor aesthetic di Garut. Booking, open play, coaching, membership, dan liga.",
  },
};

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
