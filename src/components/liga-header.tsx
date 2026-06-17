import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Klasemen", href: "/liga/klasemen" },
  { label: "Jadwal", href: "/liga/jadwal" },
  { label: "Live", href: "/liga/live" },
  { label: "Hall of Fame", href: "/liga/hall-of-fame" },
  { label: "Regulasi", href: "/liga/regulasi" },
  { label: "Daftar Tim", href: "/liga/daftar" },
];

export function LigaHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex h-14 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/logo.jpg"
              alt="One Padel Club"
              width={30}
              height={30}
              unoptimized
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="font-semibold text-brand">Liga Kota Intan</span>
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
