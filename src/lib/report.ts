import "server-only";
import { and, between, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  courtBooking,
  coachingBooking,
  openPlayRegistration,
  openPlaySession,
  membership,
  membershipPlan,
  posOrder,
  posOrderItem,
  product,
  cashShift,
} from "@/db/schema";

export type ReportRow = {
  key: string;
  label: string;
  count: number;
  revenue: number;
};

export type Report = {
  rows: ReportRow[];
  total: number;
  posGrossProfit: number; // perkiraan (modal saat ini)
};

const PAID_STATUSES = ["PAID", "COMPLETED"] as const;

// Batas hari WIB (UTC+7) untuk kolom timestamp (POS, shift).
function wibStart(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+07:00`);
}
function wibEnd(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999+07:00`);
}

export async function getRevenueReport(
  from: string,
  to: string,
): Promise<Report> {
  const fromTs = wibStart(from);
  const toTs = wibEnd(to);

  const [sewa, coaching, openPlay, member, pos, posProfit] = await Promise.all([
    // Sewa lapangan (by tanggal main)
    db
      .select({
        count: sql<number>`count(*)`,
        sum: sql<number>`coalesce(sum(${courtBooking.totalPrice}), 0)`,
      })
      .from(courtBooking)
      .where(
        and(
          inArray(courtBooking.status, PAID_STATUSES),
          gte(courtBooking.date, from),
          lte(courtBooking.date, to),
        ),
      ),
    // Coaching
    db
      .select({
        count: sql<number>`count(*)`,
        sum: sql<number>`coalesce(sum(${coachingBooking.totalPrice}), 0)`,
      })
      .from(coachingBooking)
      .where(
        and(
          inArray(coachingBooking.status, PAID_STATUSES),
          gte(coachingBooking.date, from),
          lte(coachingBooking.date, to),
        ),
      ),
    // Open play (registrasi terbayar × harga sesi)
    db
      .select({
        count: sql<number>`count(*)`,
        sum: sql<number>`coalesce(sum(${openPlaySession.pricePerPlayer}), 0)`,
      })
      .from(openPlayRegistration)
      .innerJoin(
        openPlaySession,
        eq(openPlaySession.id, openPlayRegistration.sessionId),
      )
      .where(
        and(
          inArray(openPlayRegistration.status, PAID_STATUSES),
          gte(openPlaySession.date, from),
          lte(openPlaySession.date, to),
        ),
      ),
    // Membership aktif (by tanggal mulai)
    db
      .select({
        count: sql<number>`count(*)`,
        sum: sql<number>`coalesce(sum(${membershipPlan.price}), 0)`,
      })
      .from(membership)
      .innerJoin(membershipPlan, eq(membershipPlan.id, membership.planId))
      .where(
        and(
          eq(membership.status, "ACTIVE"),
          gte(membership.startDate, from),
          lte(membership.startDate, to),
        ),
      ),
    // POS (by tanggal transaksi)
    db
      .select({
        count: sql<number>`count(*)`,
        sum: sql<number>`coalesce(sum(${posOrder.total}), 0)`,
      })
      .from(posOrder)
      .where(
        and(
          eq(posOrder.status, "PAID"),
          between(posOrder.createdAt, fromTs, toTs),
        ),
      ),
    // Laba kotor POS = penjualan item − (qty × modal produk saat ini)
    db
      .select({
        profit: sql<number>`coalesce(sum(${posOrderItem.lineTotal} - ${posOrderItem.qty} * coalesce(${product.cost}, 0)), 0)`,
      })
      .from(posOrderItem)
      .innerJoin(posOrder, eq(posOrder.id, posOrderItem.orderId))
      .leftJoin(product, eq(product.id, posOrderItem.productId))
      .where(
        and(
          eq(posOrder.status, "PAID"),
          between(posOrder.createdAt, fromTs, toTs),
        ),
      ),
  ]);

  const rows: ReportRow[] = [
    {
      key: "sewa",
      label: "Sewa Lapangan",
      count: Number(sewa[0]?.count ?? 0),
      revenue: Number(sewa[0]?.sum ?? 0),
    },
    {
      key: "open_play",
      label: "Open Play",
      count: Number(openPlay[0]?.count ?? 0),
      revenue: Number(openPlay[0]?.sum ?? 0),
    },
    {
      key: "coaching",
      label: "Coaching",
      count: Number(coaching[0]?.count ?? 0),
      revenue: Number(coaching[0]?.sum ?? 0),
    },
    {
      key: "membership",
      label: "Membership",
      count: Number(member[0]?.count ?? 0),
      revenue: Number(member[0]?.sum ?? 0),
    },
    {
      key: "pos",
      label: "POS (F&B / Pro-shop)",
      count: Number(pos[0]?.count ?? 0),
      revenue: Number(pos[0]?.sum ?? 0),
    },
  ];

  const total = rows.reduce((s, r) => s + r.revenue, 0);
  return { rows, total, posGrossProfit: Number(posProfit[0]?.profit ?? 0) };
}

export type ClosedShift = {
  openedAt: string;
  closedAt: string;
  openingCash: number;
  expectedCash: number;
  closingCash: number;
  diff: number;
};

export async function getClosedShifts(
  venueId: string,
  from: string,
  to: string,
): Promise<ClosedShift[]> {
  const rows = await db
    .select()
    .from(cashShift)
    .where(
      and(
        eq(cashShift.venueId, venueId),
        sql`${cashShift.closedAt} is not null`,
        between(cashShift.closedAt, wibStart(from), wibEnd(to)),
      ),
    )
    .orderBy(desc(cashShift.closedAt));
  return rows.map((r) => ({
    openedAt: r.openedAt.toISOString(),
    closedAt: r.closedAt!.toISOString(),
    openingCash: r.openingCash,
    expectedCash: r.expectedCash ?? 0,
    closingCash: r.closingCash ?? 0,
    diff: r.diff ?? 0,
  }));
}
