import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-cream/20">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/admin" className="font-semibold text-brand">
            One Padel Club
            <span className="ml-2 text-xs font-normal text-muted">Admin</span>
          </Link>
          <span className="text-sm text-muted">{session.user.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
