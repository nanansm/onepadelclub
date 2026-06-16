import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";

export const dynamic = "force-static";

const rules = [
  {
    title: "Penghitungan Poin",
    body: "Menang = +3 poin, Kalah = 0 poin, WO = -1 poin. Klasemen update otomatis setiap skor disubmit admin.",
  },
  {
    title: "Tiebreaker Klasemen",
    body: "Urutan penentu: (1) head-to-head, (2) selisih game, (3) game menang, (4) WO paling sedikit, (5) sudden death playoff 10 menit.",
  },
  {
    title: "WO & Keterlambatan",
    body: "Telat 1-5 menit: lawan +1 game. Telat >5 menit: lawan +2 game. Telat >10 menit: WO. WO ke-2 dalam satu season: diskualifikasi.",
  },
  {
    title: "Promosi & Degradasi",
    body: "Akhir season: rank 7-8 Liga 1 turun ke Liga 2, rank 1-2 Liga 2 naik ke Liga 1. Dieksekusi panitia via finalisasi season.",
  },
  {
    title: "Hall of Fame Lock",
    body: "Tim/pemain yang juara 3x berturut-turut di kategori sama masuk Hall of Fame dan diblokir 1 season dari kategori tersebut.",
  },
  {
    title: "Roster Lock",
    body: "Setelah jadwal season dirilis, perubahan roster hanya oleh admin, maksimal 1 orang per bulan.",
  },
  {
    title: "Lock Edit Skor",
    body: "Skor hanya bisa diubah admin dalam 24 jam setelah match selesai. Lebih dari itu perlu approval super admin.",
  },
  {
    title: "Deposit WO",
    body: "Deposit Rp100.000 per tim, dikembalikan penuh di akhir season jika tim tidak pernah WO sekalipun.",
  },
];

export default function RegulasiPage() {
  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <PageHeading plain="Regulasi" accent="Liga" sub="Aturan main Liga Padel Kota Intan." />
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.title} className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold text-brand">{r.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
