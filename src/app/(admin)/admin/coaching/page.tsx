import Link from "next/link";
import { asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { coach, coachingBooking } from "@/db/schema";
import { todayJakarta } from "@/lib/tz";
import { CoachingAdmin } from "./coaching-admin";

export const dynamic = "force-dynamic";

export default async function AdminCoachingPage() {
  const [coaches, bookingRows] = await Promise.all([
    db.select().from(coach).orderBy(asc(coach.sortOrder), asc(coach.name)),
    db
      .select({ booking: coachingBooking, coachName: coach.name })
      .from(coachingBooking)
      .innerJoin(coach, eq(coachingBooking.coachId, coach.id))
      .where(gte(coachingBooking.date, todayJakarta()))
      .orderBy(asc(coachingBooking.date), asc(coachingBooking.startHour)),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Coaching</h1>
        <Link href="/admin" className="text-sm text-accent">Dashboard</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Kelola pelatih dan booking coaching.</p>
      <div className="mt-6">
        <CoachingAdmin
          coaches={coaches.map((c) => ({
            id: c.id,
            name: c.name,
            ratePerHour: c.ratePerHour,
            bio: c.bio,
            photoUrl: c.photoUrl,
            active: c.active,
          }))}
          bookings={bookingRows.map(({ booking, coachName }) => ({
            id: booking.id,
            code: booking.code,
            coachName,
            date: booking.date,
            startHour: booking.startHour,
            duration: booking.duration,
            totalPrice: booking.totalPrice,
            customerName: booking.customerName,
            customerWa: booking.customerWa,
            status: booking.status,
          }))}
        />
      </div>
    </div>
  );
}
