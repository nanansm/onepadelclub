import Link from "next/link";
import { count, sql } from "drizzle-orm";
import {
  CalendarCheck,
  CalendarDays,
  Wallet,
  ChevronRight,
  LayoutGrid,
  Users,
  GraduationCap,
  BadgeCheck,
  Trophy,
  ShoppingCart,
  BarChart3,
  Settings,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/db";
import { courtBooking } from "@/db/schema";
import { expireStaleBookings } from "@/lib/expire";
import { getSettings } from "@/lib/settings";
import { todayJakarta } from "@/lib/tz";
import { rupiah } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

const manageTiles: {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
  module?: "liga" | "pos";
}[] = [
  {
    label: "Booking Lapangan",
    href: "/admin/bookings",
    desc: "Konfirmasi & kelola booking",
    icon: CalendarCheck,
  },
  {
    label: "Kelola Lapangan",
    href: "/admin/courts",
    desc: "Lapangan, harga, jam operasional",
    icon: LayoutGrid,
  },
  {
    label: "Open Play",
    href: "/admin/open-play",
    desc: "Sesi main bareng & peserta",
    icon: Users,
  },
  {
    label: "Coaching",
    href: "/admin/coaching",
    desc: "Jadwal & paket coaching",
    icon: GraduationCap,
  },
  {
    label: "Membership",
    href: "/admin/membership",
    desc: "Paket & anggota member",
    icon: BadgeCheck,
  },
  {
    label: "POS Kasir",
    href: "/admin/pos",
    desc: "Jual F&B / pro-shop, stok, struk",
    icon: ShoppingCart,
    module: "pos",
  },
  {
    label: "Liga",
    href: "/admin/liga",
    desc: "Skor, tim, jadwal, season",
    icon: Trophy,
    module: "liga",
  },
  {
    label: "Laporan Keuangan",
    href: "/admin/laporan",
    desc: "Pemasukan booking + POS, export",
    icon: BarChart3,
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    desc: "Identitas, kontak, konten, branding",
    icon: Settings,
  },
];

export default async function AdminDashboard() {
  // Rapikan PENDING basi dulu agar angka "perlu konfirmasi" akurat. Tanpa cron.
  await expireStaleBookings();
  const today = todayJakarta();

  const [stats] = await db
    .select({
      pending: count(
        sql`case when ${courtBooking.status} = 'PENDING' and ${courtBooking.date} >= ${today} then 1 end`,
      ),
      todayCount: count(
        sql`case when ${courtBooking.date} = ${today} then 1 end`,
      ),
      todayRevenue: sql<number>`coalesce(sum(case when ${courtBooking.date} = ${today} and ${courtBooking.status} in ('PAID','COMPLETED') then ${courtBooking.totalPrice} else 0 end), 0)`,
    })
    .from(courtBooking);

  const pending = Number(stats?.pending ?? 0);
  const todayCount = Number(stats?.todayCount ?? 0);
  const todayRevenue = Number(stats?.todayRevenue ?? 0);

  // Checklist setup belum lengkap.
  const settings = await getSettings();
  const setupIssues: string[] = [];
  if (!settings.whatsapp || settings.whatsapp === "6281200000000") {
    setupIssues.push("Nomor WhatsApp belum diisi (masih contoh).");
  }
  if (!settings.bankNumber || settings.bankNumber === "1234567890") {
    setupIssues.push("Nomor rekening belum diisi (masih contoh).");
  }
  if (!settings.notifEnabled) {
    setupIssues.push("Notifikasi email belum diaktifkan.");
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        sub={`Ringkasan operasional ${settings.name} hari ini.`}
      />

      {/* Banner setup belum lengkap */}
      {setupIssues.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle className="size-4 shrink-0" strokeWidth={2} />
            Lengkapi pengaturan
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-8 text-sm text-amber-800">
            {setupIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <Link
            href="/admin/settings"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            Buka Pengaturan
            <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      ) : null}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Menunggu konfirmasi"
          value={pending}
          hint={pending > 0 ? "Perlu ditinjau" : "Semua beres"}
          icon={CalendarCheck}
          href="/admin/bookings"
          tone={pending > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Booking hari ini"
          value={todayCount}
          icon={CalendarDays}
          href="/admin/bookings"
        />
        <StatCard
          label="Pendapatan hari ini"
          value={rupiah(todayRevenue)}
          hint="Booking lunas"
          icon={Wallet}
          tone="accent"
        />
      </div>

      {pending > 0 ? (
        <Link
          href="/admin/bookings"
          className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
        >
          <CalendarCheck className="size-4 shrink-0" strokeWidth={2} />
          {pending} booking menunggu konfirmasi pembayaran. Klik untuk tinjau.
          <ChevronRight className="ml-auto size-4 shrink-0" strokeWidth={2} />
        </Link>
      ) : null}

      {/* Manage tiles */}
      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Kelola
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {manageTiles
          .filter((t) =>
            t.module === "liga"
              ? settings.ligaEnabled
              : t.module === "pos"
                ? settings.posEnabled
                : true,
          )
          .map(({ label, href, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3.5 rounded-2xl border bg-card p-5 transition hover:border-brand hover:shadow-sm"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-brand-fg">
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center font-semibold">
                {label}
                <ChevronRight
                  className="ml-1 size-4 -translate-x-1 text-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                  strokeWidth={2}
                />
              </span>
              <span className="mt-0.5 block text-sm text-muted">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
