import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

// Dipakai self-ping instrumentation + healthcheck Easypanel.
// Cek koneksi DB beneran, bukan sekadar balas ok.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: "up", ts: Date.now() });
  } catch (err) {
    console.error("[health] DB check gagal", err);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
