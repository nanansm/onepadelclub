import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { season } from "@/db/schema";
import { getCategories } from "@/lib/liga";
import { SeasonAdmin } from "./season-admin";

export const dynamic = "force-dynamic";

export default async function AdminSeasonPage() {
  const [seasons, cats] = await Promise.all([
    db.select().from(season).orderBy(desc(season.year)),
    getCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manajemen Season</h1>
        <Link href="/admin/liga" className="text-sm text-accent">Liga</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Buka/tutup season, eksekusi promosi-degradasi.</p>
      <div className="mt-6">
        <SeasonAdmin
          seasons={seasons.map((s) => ({ id: s.id, name: s.name, year: s.year, status: s.status }))}
          categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
