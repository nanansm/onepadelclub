import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/session";
import { getSettings, brandVars } from "@/lib/settings";
import { LogoutButton } from "@/components/logout-button";
import { AdminNavSidebar, AdminNavMobile } from "@/components/admin/admin-nav";
import type { Metadata } from "next";

// Admin tidak boleh ter-index search engine (defense-in-depth + robots.ts).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const settings = await getSettings();
  const navFlags = {
    ligaEnabled: settings.ligaEnabled,
    posEnabled: settings.posEnabled,
  };

  return (
    <div className="min-h-dvh bg-cream/20 lg:flex" style={brandVars(settings)}>
      {/* Sidebar — desktop only */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-brand px-4 py-5 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-1">
          <Image
            src={settings.logoUrl || "/brand/logo-white-mark.webp"}
            alt={settings.name}
            width={64}
            height={36}
            unoptimized
            className="h-9 w-auto object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-brand-fg">
              {settings.name}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-fg/50">
              Admin Panel
            </span>
          </span>
        </Link>

        <AdminNavSidebar flags={navFlags} />

        <div className="mt-4 border-t border-brand-fg/15 pt-4">
          <p className="truncate px-1 text-xs text-brand-fg/60">
            {session.user.email}
          </p>
          <div className="mt-2">
            <LogoutButton variant="onDark" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar + nav */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <AdminNavMobile flags={navFlags} />
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src={settings.logoUrl || "/brand/logo-mark.webp"}
                alt={settings.name}
                width={50}
                height={28}
                unoptimized
                className="h-7 w-auto shrink-0 object-contain"
              />
              <span className="text-sm font-semibold text-brand">
                Admin
              </span>
            </Link>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
