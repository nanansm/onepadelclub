import { LigaHeader } from "@/components/liga-header";
import { PageHeading } from "@/components/page-heading";
import { getCategories } from "@/lib/liga";
import { DaftarForm } from "./daftar-form";

export const dynamic = "force-dynamic";

export default async function DaftarTimPage() {
  const cats = await getCategories();
  const categories = cats.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="min-h-dvh bg-cream/20">
      <LigaHeader />
      <main className="mx-auto max-w-xl px-5 py-6">
        <PageHeading
          plain="Daftar"
          accent="Tim"
          sub="Daftarkan tim kamu untuk ikut Liga Padel."
        />
        <p className="mb-5 rounded-2xl border bg-card p-4 text-sm text-muted">
          Isi data tim di bawah. Setelah admin meninjau, kami akan menghubungi
          kapten via WhatsApp untuk konfirmasi & pengaturan{" "}
          <span className="font-medium text-foreground">deposit Rp100.000</span>.
        </p>
        <DaftarForm categories={categories} />
      </main>
    </div>
  );
}
