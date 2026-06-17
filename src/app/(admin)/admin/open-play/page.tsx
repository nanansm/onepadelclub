import { asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { court, openPlayRegistration, openPlaySession } from "@/db/schema";
import { getCourts } from "@/lib/venue";
import { todayJakarta } from "@/lib/tz";
import { AdminPageHeader } from "@/components/admin/page-header";
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
      <AdminPageHeader
        title="Open Play"
        sub="Buat sesi, kelola pendaftaran, konfirmasi pembayaran."
      />
      <div className="mt-6">
        <OpenPlayAdmin sessions={sessions} courts={courts.map((c) => ({ id: c.id, name: c.name }))} today={today} />
      </div>
    </div>
  );
}
