import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { membership, membershipPlan } from "@/db/schema";
import { normalizeWa } from "./booking";
import { genCode, isUniqueViolation } from "./code";

export async function getActivePlans() {
  return db
    .select()
    .from(membershipPlan)
    .where(eq(membershipPlan.active, true))
    .orderBy(asc(membershipPlan.sortOrder), asc(membershipPlan.price));
}

export async function getPlanById(id: string) {
  const rows = await db
    .select()
    .from(membershipPlan)
    .where(eq(membershipPlan.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export const joinMembershipSchema = z.object({
  planId: z.string().min(1, "Paket wajib dipilih"),
  customerName: z.string().trim().min(2, "Nama minimal 2 huruf").max(80),
  customerWa: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .transform(normalizeWa)
    .refine((d) => d.length >= 10 && d.length <= 15, "Nomor WhatsApp tidak valid"),
});

export type JoinResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function joinMembership(
  input: z.infer<typeof joinMembershipSchema>,
): Promise<JoinResult> {
  const plan = await getPlanById(input.planId);
  if (!plan || !plan.active) return { ok: false, error: "Paket tidak ditemukan." };

  try {
    let code = "";
    for (let i = 0; i < 5; i++) {
      code = genCode("OPM");
      try {
        await db.insert(membership).values({
          code,
          planId: plan.id,
          customerName: input.customerName,
          customerWa: input.customerWa,
        });
        break;
      } catch (err) {
        if (isUniqueViolation(err) && i < 4) continue;
        throw err;
      }
    }
    return { ok: true, code };
  } catch (err) {
    console.error("[joinMembership]", err);
    return { ok: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

export async function getMembershipByCode(code: string) {
  const rows = await db
    .select({ membership, plan: membershipPlan })
    .from(membership)
    .innerJoin(membershipPlan, eq(membership.planId, membershipPlan.id))
    .where(eq(membership.code, code))
    .limit(1);
  return rows[0] ?? null;
}
