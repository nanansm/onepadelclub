import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  coach,
  coachingBooking,
  court,
  courtBooking,
  membership,
  membershipPlan,
  openPlayRegistration,
  openPlaySession,
} from "@/db/schema";
import { normalizeWa } from "./booking";
import { todayJakarta } from "./tz";

// Lookup ringan berbasis nomor WA — "identitas tanpa login".
// Dipakai /cek (lacak booking) & badge member di booking flow.

export type CustomerActivity = {
  rentals: {
    code: string;
    courtName: string;
    date: string;
    startHour: number;
    duration: number;
    totalPrice: number;
    status: string;
  }[];
  coachings: {
    code: string;
    coachName: string;
    date: string;
    startHour: number;
    duration: number;
    totalPrice: number;
    status: string;
  }[];
  openPlays: {
    code: string;
    title: string;
    date: string;
    startHour: number;
    status: string;
  }[];
  memberships: {
    code: string;
    planName: string;
    endDate: string | null;
    status: string;
  }[];
};

// Semua aktivitas customer (booking lapangan, coaching, open play, membership)
// untuk satu nomor WA. Dipakai halaman publik /cek.
export async function getCustomerActivity(
  rawWa: string,
): Promise<CustomerActivity> {
  const wa = normalizeWa(rawWa);
  if (wa.length < 10) {
    return { rentals: [], coachings: [], openPlays: [], memberships: [] };
  }

  const [rentals, coachings, openPlays, memberships] = await Promise.all([
    db
      .select({
        code: courtBooking.code,
        courtName: court.name,
        date: courtBooking.date,
        startHour: courtBooking.startHour,
        duration: courtBooking.duration,
        totalPrice: courtBooking.totalPrice,
        status: courtBooking.status,
      })
      .from(courtBooking)
      .innerJoin(court, eq(courtBooking.courtId, court.id))
      .where(eq(courtBooking.customerWa, wa))
      .orderBy(desc(courtBooking.date), desc(courtBooking.startHour))
      .limit(50),
    db
      .select({
        code: coachingBooking.code,
        coachName: coach.name,
        date: coachingBooking.date,
        startHour: coachingBooking.startHour,
        duration: coachingBooking.duration,
        totalPrice: coachingBooking.totalPrice,
        status: coachingBooking.status,
      })
      .from(coachingBooking)
      .innerJoin(coach, eq(coachingBooking.coachId, coach.id))
      .where(eq(coachingBooking.customerWa, wa))
      .orderBy(desc(coachingBooking.date))
      .limit(50),
    db
      .select({
        code: openPlayRegistration.code,
        title: openPlaySession.title,
        date: openPlaySession.date,
        startHour: openPlaySession.startHour,
        status: openPlayRegistration.status,
      })
      .from(openPlayRegistration)
      .innerJoin(
        openPlaySession,
        eq(openPlayRegistration.sessionId, openPlaySession.id),
      )
      .where(eq(openPlayRegistration.customerWa, wa))
      .orderBy(desc(openPlaySession.date))
      .limit(50),
    db
      .select({
        code: membership.code,
        planName: membershipPlan.name,
        endDate: membership.endDate,
        status: membership.status,
      })
      .from(membership)
      .innerJoin(membershipPlan, eq(membership.planId, membershipPlan.id))
      .where(eq(membership.customerWa, wa))
      .orderBy(desc(membership.createdAt))
      .limit(50),
  ]);

  return { rentals, coachings, openPlays, memberships };
}

export type ActiveMembership = {
  code: string;
  planName: string;
  endDate: string | null;
  discountPercent: number;
};

// Membership AKTIF (status ACTIVE & belum lewat endDate) untuk satu WA, atau null.
// Dipakai booking flow buat nandain "member aktif" + diskon otomatis.
export async function getActiveMembershipByWa(
  rawWa: string,
): Promise<ActiveMembership | null> {
  const wa = normalizeWa(rawWa);
  if (wa.length < 10) return null;
  const today = todayJakarta();
  const rows = await db
    .select({
      code: membership.code,
      planName: membershipPlan.name,
      endDate: membership.endDate,
      discountPercent: membershipPlan.discountPercent,
    })
    .from(membership)
    .innerJoin(membershipPlan, eq(membership.planId, membershipPlan.id))
    .where(
      and(
        eq(membership.customerWa, wa),
        eq(membership.status, "ACTIVE"),
        gte(membership.endDate, today),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

// Terapkan diskon member ke harga (pembulatan ke ratusan rupiah terdekat ke bawah).
export function applyMemberDiscount(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  const pct = Math.min(100, Math.max(0, discountPercent));
  const discounted = price * (1 - pct / 100);
  return Math.floor(discounted / 100) * 100;
}
