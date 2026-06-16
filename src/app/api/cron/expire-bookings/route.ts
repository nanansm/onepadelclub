import { NextResponse } from "next/server";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  coachingBooking,
  courtBooking,
  openPlayRegistration,
  openPlaySession,
} from "@/db/schema";

export const dynamic = "force-dynamic";

const PENDING_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam

// Dipanggil cron Easypanel: GET /api/cron/expire-bookings?secret=$CRON_SECRET
// Membatalkan booking PENDING terbengkalai supaya slot tak terkunci selamanya.
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - PENDING_TTL_MS);

  const [rentals, coachings, regs] = await Promise.all([
    db
      .update(courtBooking)
      .set({ status: "CANCELLED" })
      .where(and(eq(courtBooking.status, "PENDING"), lt(courtBooking.createdAt, cutoff)))
      .returning({ id: courtBooking.id }),
    db
      .update(coachingBooking)
      .set({ status: "CANCELLED" })
      .where(and(eq(coachingBooking.status, "PENDING"), lt(coachingBooking.createdAt, cutoff)))
      .returning({ id: coachingBooking.id }),
    db
      .update(openPlayRegistration)
      .set({ status: "CANCELLED" })
      .where(
        and(eq(openPlayRegistration.status, "PENDING"), lt(openPlayRegistration.createdAt, cutoff)),
      )
      .returning({ id: openPlayRegistration.id }),
  ]);

  // Buka kembali sesi FULL yang kini punya slot kosong.
  let reopened = 0;
  const full = await db
    .select()
    .from(openPlaySession)
    .where(eq(openPlaySession.status, "FULL"));
  for (const s of full) {
    const [{ taken }] = await db
      .select({ taken: sql<number>`count(*)` })
      .from(openPlayRegistration)
      .where(
        and(
          eq(openPlayRegistration.sessionId, s.id),
          inArray(openPlayRegistration.status, ["PENDING", "PAID"]),
        ),
      );
    if (Number(taken) < s.maxPlayers) {
      await db.update(openPlaySession).set({ status: "OPEN" }).where(eq(openPlaySession.id, s.id));
      reopened++;
    }
  }

  return NextResponse.json({
    ok: true,
    expired: {
      rentals: rentals.length,
      coachings: coachings.length,
      openPlayRegs: regs.length,
    },
    sessionsReopened: reopened,
  });
}
