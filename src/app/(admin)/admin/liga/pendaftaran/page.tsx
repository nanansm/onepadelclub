import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/session";
import { getLeaguesWithLabels } from "@/lib/liga";
import { getTeamRegistrations } from "@/lib/team-reg";
import { PendaftaranAdmin } from "./pendaftaran-admin";

export const dynamic = "force-dynamic";

const dtFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function PendaftaranPage() {
  await requireAdmin();
  const [rows, leagues] = await Promise.all([
    getTeamRegistrations(),
    getLeaguesWithLabels(),
  ]);

  const registrations = rows.map((r) => ({
    id: r.id,
    teamName: r.teamName,
    category: r.categoryName ?? r.categoryLabel ?? null,
    player1Name: r.player1Name,
    player2Name: r.player2Name,
    captainWa: r.captainWa,
    note: r.note,
    status: r.status,
    createdAtLabel: dtFmt.format(r.createdAt),
  }));

  return (
    <div>
      <AdminPageHeader
        title="Pendaftaran Tim"
        sub="Review tim yang mendaftar online. Setujui untuk membuat tim di liga."
        back={{ href: "/admin/liga", label: "Liga" }}
      />
      <PendaftaranAdmin
        registrations={registrations}
        leagues={leagues.map((l) => ({ id: l.id, label: l.label }))}
      />
    </div>
  );
}
