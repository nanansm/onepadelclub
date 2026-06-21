"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { visibleNav } from "./nav-items";

export type NavFlags = { ligaEnabled: boolean; posEnabled: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Sidebar nav (desktop) — daftar vertikal di atas background hijau brand. */
export function AdminNavSidebar({ flags }: { flags: NavFlags }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {visibleNav(flags).map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-fg/15 text-brand-fg"
                : "text-brand-fg/70 hover:bg-brand-fg/10 hover:text-brand-fg",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition",
                active ? "text-accent" : "text-brand-fg/60 group-hover:text-brand-fg",
              )}
              strokeWidth={2}
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile nav — burger button yang buka panel dropdown vertikal. */
export function AdminNavMobile({ flags }: { flags: NavFlags }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup menu tiap pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground outline-none transition hover:border-brand/40 hover:bg-brand/5 focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/30 active:scale-95"
      >
        {open ? (
          <X className="size-5 shrink-0" strokeWidth={2} />
        ) : (
          <Menu className="size-5 shrink-0" strokeWidth={2} />
        )}
      </button>

      {open ? (
        <>
          {/* Click-catcher transparan — tutup menu tanpa nge-tint header/konten */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          {/* Panel */}
          <nav className="absolute left-0 top-full z-40 mt-2 max-h-[72vh] w-64 origin-top-left overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150">
            {visibleNav(flags).map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-brand/10 font-semibold text-brand"
                      : "font-medium text-foreground hover:bg-brand/5 hover:text-brand",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      active ? "text-accent" : "text-muted",
                    )}
                    strokeWidth={2}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}
    </div>
  );
}
