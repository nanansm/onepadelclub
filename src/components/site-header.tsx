import Image from "next/image";
import Link from "next/link";

export function SiteHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/brand/logo.jpg"
            alt="One Padel Club"
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="whitespace-nowrap font-semibold text-brand">
            One Padel Club
          </span>
        </Link>
        {title ? (
          <>
            <span className="shrink-0 text-border">/</span>
            <span className="min-w-0 truncate text-sm text-muted">{title}</span>
          </>
        ) : null}
        <Link
          href="/cek"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Cek Booking
        </Link>
      </div>
    </header>
  );
}
