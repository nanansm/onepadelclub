import { text, timestamp } from "drizzle-orm/pg-core";
import { onepadel } from "./_base";

// Jejak audit mutasi admin: siapa, apa, kapan. Tak pernah dihapus.
export const auditLog = onepadel.table("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  detail: text("detail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLog.$inferSelect;
