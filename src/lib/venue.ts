import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { court, venue, type Court, type Venue } from "@/db/schema";

// Satu klub: ambil baris venue pertama. cache() = sekali per request.
export const getVenue = cache(async (): Promise<Venue | null> => {
  const rows = await db.select().from(venue).limit(1);
  return rows[0] ?? null;
});

export const getCourts = cache(async (): Promise<Court[]> => {
  return db
    .select()
    .from(court)
    .where(eq(court.active, true))
    .orderBy(asc(court.sortOrder), asc(court.name));
});

export const getCourtById = cache(async (id: string): Promise<Court | null> => {
  const rows = await db.select().from(court).where(eq(court.id, id)).limit(1);
  return rows[0] ?? null;
});
