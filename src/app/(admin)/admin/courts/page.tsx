import { asc } from "drizzle-orm";
import { db } from "@/db";
import { court } from "@/db/schema";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CourtsManager } from "./courts-manager";

export const dynamic = "force-dynamic";

export default async function AdminCourtsPage() {
  const courts = await db
    .select()
    .from(court)
    .orderBy(asc(court.sortOrder), asc(court.name));

  return (
    <div>
      <AdminPageHeader
        title="Kelola"
        accent="Lapangan"
        sub="Atur nama, tipe, harga per jam, dan status aktif lapangan."
      />

      <div className="mt-6">
        <CourtsManager
          courts={courts.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            pricePerHour: c.pricePerHour,
            active: c.active,
          }))}
        />
      </div>
    </div>
  );
}
