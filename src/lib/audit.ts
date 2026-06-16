import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { getSession } from "./session";

// Catat mutasi admin. Best-effort: gagal mencatat tak boleh menggagalkan aksi.
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string | null,
  detail?: string | Record<string, unknown> | null,
): Promise<void> {
  try {
    const session = await getSession();
    await db.insert(auditLog).values({
      actorId: session?.user?.id ?? null,
      actorEmail: session?.user?.email ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      detail:
        detail == null
          ? null
          : typeof detail === "string"
            ? detail
            : JSON.stringify(detail),
    });
  } catch (err) {
    console.error("[audit] gagal mencatat", action, entity, err);
  }
}
