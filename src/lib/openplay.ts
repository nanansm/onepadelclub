import { z } from "zod";
import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  court,
  openPlayRegistration,
  openPlaySession,
} from "@/db/schema";
import { todayJakarta } from "./tz";
import { normalizeWa } from "./booking";
import { genCode, isUniqueViolation } from "./code";

const ACTIVE_REG = ["PENDING", "PAID"] as const;

export type SessionWithMeta = {
  session: typeof openPlaySession.$inferSelect;
  courtName: string | null;
  taken: number;
};

// Sesi mendatang + jumlah peserta aktif + nama court.
export async function getUpcomingSessions(): Promise<SessionWithMeta[]> {
  const rows = await db
    .select({
      session: openPlaySession,
      courtName: court.name,
      taken: sql<number>`(
        select count(*) from onepadel.open_play_registration r
        where r.session_id = ${openPlaySession.id}
          and r.status in ('PENDING','PAID')
      )`,
    })
    .from(openPlaySession)
    .leftJoin(court, eq(openPlaySession.courtId, court.id))
    .where(
      and(
        gte(openPlaySession.date, todayJakarta()),
        inArray(openPlaySession.status, ["OPEN", "FULL"]),
      ),
    )
    .orderBy(asc(openPlaySession.date), asc(openPlaySession.startHour));

  return rows.map((r) => ({
    session: r.session,
    courtName: r.courtName,
    taken: Number(r.taken),
  }));
}

export const registerOpenPlaySchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().trim().min(2, "Nama minimal 2 huruf").max(80),
  customerWa: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .transform(normalizeWa)
    .refine((d) => d.length >= 10 && d.length <= 15, "Nomor WhatsApp tidak valid"),
});

export type RegisterResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function registerOpenPlay(
  input: z.infer<typeof registerOpenPlaySchema>,
): Promise<RegisterResult> {
  try {
    const code = await db.transaction(async (tx) => {
      // Serialize per sesi agar kuota tidak kelebihan saat ramai.
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${"openplay:" + input.sessionId}))`,
      );

      const s = (
        await tx
          .select()
          .from(openPlaySession)
          .where(eq(openPlaySession.id, input.sessionId))
          .limit(1)
      )[0];
      if (!s) throw new RegError("Sesi tidak ditemukan.");
      if (s.status === "CANCELLED" || s.status === "DONE") {
        throw new RegError("Sesi sudah ditutup.");
      }

      const [{ taken }] = await tx
        .select({ taken: sql<number>`count(*)` })
        .from(openPlayRegistration)
        .where(
          and(
            eq(openPlayRegistration.sessionId, s.id),
            inArray(openPlayRegistration.status, [...ACTIVE_REG]),
          ),
        );
      if (Number(taken) >= s.maxPlayers) throw new RegError("Kuota sesi sudah penuh.");

      let code = "";
      for (let i = 0; i < 5; i++) {
        code = genCode("OPP");
        try {
          await tx.insert(openPlayRegistration).values({
            code,
            sessionId: s.id,
            customerName: input.customerName,
            customerWa: input.customerWa,
          });
          break;
        } catch (err) {
          if (isUniqueViolation(err) && i < 4) continue;
          throw err;
        }
      }

      // Tandai FULL kalau kuota tercapai setelah pendaftaran ini.
      if (Number(taken) + 1 >= s.maxPlayers) {
        await tx
          .update(openPlaySession)
          .set({ status: "FULL" })
          .where(eq(openPlaySession.id, s.id));
      }
      return code;
    });
    return { ok: true, code };
  } catch (err) {
    if (err instanceof RegError) return { ok: false, error: err.message };
    console.error("[registerOpenPlay]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

class RegError extends Error {}

export async function getRegistrationByCode(code: string) {
  const rows = await db
    .select({
      reg: openPlayRegistration,
      session: openPlaySession,
      courtName: court.name,
    })
    .from(openPlayRegistration)
    .innerJoin(openPlaySession, eq(openPlayRegistration.sessionId, openPlaySession.id))
    .leftJoin(court, eq(openPlaySession.courtId, court.id))
    .where(eq(openPlayRegistration.code, code))
    .limit(1);
  return rows[0] ?? null;
}
