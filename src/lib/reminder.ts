import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { courtBooking, court } from "@/db/schema";
import { getWaConfig, notifyCustomerReminderWa } from "@/lib/wa";
import { todayJakarta, ymdOffset } from "@/lib/tz";
import { rangeLabel } from "@/lib/format";

// Kirim pengingat WA H-1 untuk booking lapangan besok yang sudah LUNAS.
// Lazy: dipanggil saat admin buka dashboard/bookings (tanpa cron).
// Atomic-claim (set reminder_sent dulu) supaya tak dobel walau 2 tab kebuka.
export async function sendDueReminders(): Promise<void> {
  try {
    const cfg = await getWaConfig();
    if (!cfg.enabled) return;

    const besok = ymdOffset(todayJakarta(), 1);
    const claimed = await db
      .update(courtBooking)
      .set({ reminderSent: true })
      .where(
        and(
          eq(courtBooking.date, besok),
          eq(courtBooking.status, "PAID"),
          eq(courtBooking.reminderSent, false),
        ),
      )
      .returning({
        code: courtBooking.code,
        nama: courtBooking.customerName,
        wa: courtBooking.customerWa,
        courtId: courtBooking.courtId,
        date: courtBooking.date,
        startHour: courtBooking.startHour,
        duration: courtBooking.duration,
      });
    if (claimed.length === 0) return;

    const courtIds = [...new Set(claimed.map((c) => c.courtId))];
    const courts = await db
      .select({ id: court.id, name: court.name })
      .from(court)
      .where(inArray(court.id, courtIds));
    const nameById = new Map(courts.map((c) => [c.id, c.name]));

    for (const b of claimed) {
      const detail = `${nameById.get(b.courtId) ?? "Lapangan"} · ${b.date} · ${rangeLabel(b.startHour, b.duration)}`;
      // Sekuensial + await: jumlah booking besok kecil; aman.
      await notifyCustomerReminderWa(
        {
          jenis: "Sewa Lapangan",
          kode: b.code,
          nama: b.nama,
          wa: b.wa,
          detail,
          invoicePath: `/booking/${b.code}`,
        },
        cfg,
      );
    }
  } catch (err) {
    // Jangan pernah ganggu render halaman admin.
    console.error("[reminder]", err);
  }
}
