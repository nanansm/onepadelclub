import { asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { coach, coachingBooking } from "@/db/schema";
import { todayJakarta } from "@/lib/tz";
import { AdminPageHeader } from "@/components/admin/page-header";
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
      <AdminPageHeader
        title="Coaching"
        sub="Kelola pelatih dan booking coaching."
      />
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
