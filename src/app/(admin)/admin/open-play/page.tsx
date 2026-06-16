import Link from "next/link";
import { asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { court, openPlayRegistration, openPlaySession } from "@/db/schema";
import { getCourts } from "@/lib/venue";
import { todayJakarta } from "@/lib/tz";
import { OpenPlayAdmin } from "./open-play-admin";

export const dynamic = "force-dynamic";

export default async function AdminOpenPlayPage() {
  const today = todayJakarta();
  const [sessionRows, regRows, courts] = await Promise.all([
    db
      .select({ session: openPlaySession, courtName: court.name })
      .from(openPlaySession)
      .leftJoin(court, eq(openPlaySession.courtId, court.id))
      .where(gte(openPlaySession.date, today))
      .orderBy(asc(openPlaySession.date), asc(openPlaySession.startHour)),
    db.select().from(openPlayRegistration),
    getCourts(),
  ]);

  const regsBySession = new Map<string, typeof regRows>();
  for (const r of regRows) {
    const arr = regsBySession.get(r.sessionId) ?? [];
    arr.push(r);
    regsBySession.set(r.sessionId, arr);
  }

  const sessions = sessionRows.map(({ session, courtName }) => ({
    id: session.id,
    title: session.title,
    level: session.level,
    date: session.date,
    startHour: session.startHour,
    duration: session.duration,
    maxPlayers: session.maxPlayers,
    pricePerPlayer: session.pricePerPlayer,
    status: session.status,
    courtName,
    regs: (regsBySession.get(session.id) ?? []).map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerWa: r.customerWa,
      status: r.status,
    })),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Open Play</h1>
        <Link href="/admin" className="text-sm text-accent">Dashboard</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Buat sesi, kelola pendaftaran, konfirmasi pembayaran.</p>
      <div className="mt-6">
        <OpenPlayAdmin sessions={sessions} courts={courts.map((c) => ({ id: c.id, name: c.name }))} today={today} />
      </div>
    </div>
  );
}
