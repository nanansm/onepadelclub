import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { court } from "@/db/schema";
import { CourtsManager } from "./courts-manager";

export const dynamic = "force-dynamic";

export default async function AdminCourtsPage() {
  const courts = await db
    .select()
    .from(court)
    .orderBy(asc(court.sortOrder), asc(court.name));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kelola Lapangan</h1>
        <Link href="/admin" className="text-sm text-accent">
          Dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Atur nama, tipe, harga per jam, dan status aktif lapangan.
      </p>

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
