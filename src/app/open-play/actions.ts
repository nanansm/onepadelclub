"use server";

import {
  registerOpenPlay,
  registerOpenPlaySchema,
  type RegisterResult,
} from "@/lib/openplay";
import { guardGuest } from "@/lib/rate-limit";

export async function registerOpenPlayAction(
  raw: unknown,
): Promise<RegisterResult> {
  const guard = await guardGuest("openplay");
  if (!guard.ok) return { ok: false, error: guard.error! };
  const parsed = registerOpenPlaySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  return registerOpenPlay(parsed.data);
}
