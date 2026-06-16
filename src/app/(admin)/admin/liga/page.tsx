import Link from "next/link";

export const dynamic = "force-static";

const sections = [
  { label: "Input Skor", href: "/admin/liga/skor", desc: "Isi skor match, klasemen auto-update" },
  { label: "Kelola Tim & Pemain", href: "/admin/liga/tim", desc: "CRUD tim dan roster pemain" },
  { label: "Generator Jadwal", href: "/admin/liga/jadwal", desc: "Buat jadwal round-robin" },
  { label: "Manajemen Season", href: "/admin/liga/season", desc: "Season + promosi/degradasi" },
];

export default function AdminLigaHub() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Liga Padel Kota Intan</h1>
        <Link href="/admin" className="text-sm text-accent">Dashboard</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Kelola kompetisi liga.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl border bg-card p-5 transition hover:border-brand hover:shadow-sm"
          >
            <div className="font-semibold">{s.label}</div>
            <p className="mt-1 text-sm text-muted">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
