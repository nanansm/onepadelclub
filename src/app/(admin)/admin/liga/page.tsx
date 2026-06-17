import Link from "next/link";
import {
  ClipboardList,
  ClipboardCheck,
  UsersRound,
  CalendarRange,
  Layers,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";

// Di bawah layout (admin) yang butuh sesi -> wajib dynamic (jangan force-static,
// kalau tidak requireAdmin jalan saat build tanpa user & redirect ke-bake).
export const dynamic = "force-dynamic";

const sections: { label: string; href: string; desc: string; icon: LucideIcon }[] = [
  { label: "Input Skor", href: "/admin/liga/skor", desc: "Isi skor match, klasemen auto-update", icon: ClipboardList },
  { label: "Pendaftaran Tim", href: "/admin/liga/pendaftaran", desc: "Review tim yang daftar online", icon: ClipboardCheck },
  { label: "Kelola Tim & Pemain", href: "/admin/liga/tim", desc: "CRUD tim dan roster pemain", icon: UsersRound },
  { label: "Generator Jadwal", href: "/admin/liga/jadwal", desc: "Buat jadwal round-robin", icon: CalendarRange },
  { label: "Manajemen Season", href: "/admin/liga/season", desc: "Season + promosi/degradasi", icon: Layers },
];

export default function AdminLigaHub() {
  return (
    <div>
      <AdminPageHeader
        title="Liga"
        accent="Kota Intan"
        sub="Kelola kompetisi liga: skor, tim, jadwal, dan season."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map(({ label, href, desc, icon: Icon }) => (
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
