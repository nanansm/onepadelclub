"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import {
  createTeamFromRegistration,
  getTeamRegistration,
  setRegistrationStatus,
} from "@/lib/team-reg";

type Result = { ok: boolean; error?: string };

// Approve pendaftaran. Jika leagueId diisi -> sekaligus buat tim + 2 pemain INTI
// di liga itu. Tanpa leagueId -> hanya tandai APPROVED (admin tambah tim manual).
export async function approveRegistrationAction(
  id: string,
  leagueId?: string,
): Promise<Result> {
  await requireAdmin();
  const reg = await getTeamRegistration(id);
  if (!reg) return { ok: false, error: "Pendaftaran tidak ditemukan" };
  if (reg.status !== "PENDING") {
    return { ok: false, error: "Pendaftaran sudah diproses" };
  }

  if (leagueId) {
    await createTeamFromRegistration(reg, leagueId);
  }
  await setRegistrationStatus(id, "APPROVED");
  await logAudit("approve", "team_registration", id);
  revalidatePath("/admin/liga/pendaftaran");
  if (leagueId) revalidatePath("/admin/liga/tim");
  return { ok: true };
}

export async function rejectRegistrationAction(id: string): Promise<Result> {
  await requireAdmin();
  const reg = await getTeamRegistration(id);
  if (!reg) return { ok: false, error: "Pendaftaran tidak ditemukan" };
  if (reg.status !== "PENDING") {
    return { ok: false, error: "Pendaftaran sudah diproses" };
  }
  await setRegistrationStatus(id, "REJECTED");
  await logAudit("reject", "team_registration", id);
  revalidatePath("/admin/liga/pendaftaran");
  return { ok: true };
}
