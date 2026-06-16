import Image from "next/image";
import Link from "next/link";

export function SiteHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo.jpg"
            alt="One Padel Club"
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-semibold text-brand">One Padel Club</span>
        </Link>
        {title ? (
          <>
            <span className="text-border">/</span>
            <span className="text-sm text-muted">{title}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}
