import { desc } from "drizzle-orm";
import { db } from "@/db";
import { season } from "@/db/schema";
import { getCategories } from "@/lib/liga";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SeasonAdmin } from "./season-admin";

export const dynamic = "force-dynamic";

export default async function AdminSeasonPage() {
  const [seasons, cats] = await Promise.all([
    db.select().from(season).orderBy(desc(season.year)),
    getCategories(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Season"
        sub="Buka/tutup season, eksekusi promosi-degradasi."
        back={{ href: "/admin/liga", label: "Liga" }}
      />
      <div className="mt-6">
        <SeasonAdmin
          seasons={seasons.map((s) => ({ id: s.id, name: s.name, year: s.year, status: s.status }))}
          categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
