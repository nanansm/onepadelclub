import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

const links = [
  { label: "Klasemen", href: "/liga/klasemen" },
  { label: "Jadwal", href: "/liga/jadwal" },
  { label: "Live", href: "/liga/live" },
  { label: "Hall of Fame", href: "/liga/hall-of-fame" },
  { label: "Regulasi", href: "/liga/regulasi" },
  { label: "Daftar Tim", href: "/liga/daftar" },
];

export async function LigaHeader() {
  const s = await getSettings();
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex h-14 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={s.logoUrl || "/brand/logo-mark.webp"}
              alt={s.name}
              width={50}
              height={28}
              unoptimized
              className="h-7 w-auto object-contain"
            />
            <span className="font-semibold text-brand">{s.ligaName}</span>
          </Link>
        </div>
        <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-muted transition hover:bg-cream/50 hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
