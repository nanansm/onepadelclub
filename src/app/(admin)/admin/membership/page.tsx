import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { membership, membershipPlan } from "@/db/schema";
import { MembershipAdmin } from "./membership-admin";

export const dynamic = "force-dynamic";

export default async function AdminMembershipPage() {
  const [plans, memberRows] = await Promise.all([
    db
      .select()
      .from(membershipPlan)
      .orderBy(asc(membershipPlan.sortOrder), asc(membershipPlan.price)),
    db
      .select({ m: membership, planName: membershipPlan.name })
      .from(membership)
      .innerJoin(membershipPlan, eq(membership.planId, membershipPlan.id))
      .orderBy(desc(membership.createdAt)),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membership</h1>
        <Link href="/admin" className="text-sm text-accent">Dashboard</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Kelola paket dan aktifkan member.</p>
      <div className="mt-6">
        <MembershipAdmin
          plans={plans.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            durationDays: p.durationDays,
            benefits: p.benefits,
            active: p.active,
          }))}
          members={memberRows.map(({ m, planName }) => ({
            id: m.id,
            code: m.code,
            planName,
            customerName: m.customerName,
            customerWa: m.customerWa,
            status: m.status,
            endDate: m.endDate,
          }))}
        />
      </div>
    </div>
  );
}
