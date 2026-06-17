import { NextResponse } from "next/server";
import { expireStaleBookings } from "@/lib/expire";

export const dynamic = "force-dynamic";

// Opsional. Dipanggil cron eksternal: GET /api/cron/expire-bookings?secret=$CRON_SECRET
// Membatalkan booking PENDING terbengkalai. CATATAN: slot ketersediaan sudah
// bebas otomatis via lazy-expiry (availability.ts) dan status diselaraskan saat
// admin buka /admin/bookings, jadi cron ini tidak wajib.
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await expireStaleBookings();
  return NextResponse.json({
    ok: true,
    expired: {
      rentals: r.rentals,
      coachings: r.coachings,
      openPlayRegs: r.openPlayRegs,
    },
    sessionsReopened: r.sessionsReopened,
  });
}
