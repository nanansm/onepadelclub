"use server";

import {
  joinMembership,
  joinMembershipSchema,
  type JoinResult,
} from "@/lib/membership";
import { guardGuest } from "@/lib/rate-limit";

export async function joinMembershipAction(raw: unknown): Promise<JoinResult> {
  const guard = await guardGuest("membership");
  if (!guard.ok) return { ok: false, error: guard.error! };
  const parsed = joinMembershipSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return joinMembership(parsed.data);
}
