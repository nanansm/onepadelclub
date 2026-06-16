// Seed Liga Padel Kota Intan (demo). Idempotent: skip kalau season sudah ada.
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  category,
  game,
  hallOfFame,
  league,
  match,
  player,
  season,
  team,
} from "./schema";
import { roundRobin } from "../lib/liga";
import { avatarUrl } from "../lib/utils";

const TEAM_NAMES = [
  "Tim Alpha", "Tim Bravo", "Tim Charlie", "Tim Delta",
  "Tim Echo", "Tim Foxtrot", "Tim Golf", "Tim Hotel",
];
const COLORS = [
  "#1a4d33", "#d97721", "#2563eb", "#9333ea",
  "#dc2626", "#0891b2", "#ca8a04", "#475569",
];
// Roster asli PRD untuk Upper Beginner Pria.
const UBP_ROSTER: Record<string, [string, string]> = {
  "Tim Alpha": ["Andi R.", "Budi S."],
  "Tim Bravo": ["Eko P.", "Fajar M."],
  "Tim Charlie": ["Ivan K.", "Joko L."],
  "Tim Delta": ["Mario T.", "Nanda W."],
  "Tim Echo": ["Raka S.", "Surya N."],
  "Tim Foxtrot": ["Vino H.", "Wahyu P."],
  "Tim Golf": ["Zaki M.", "Agus R."],
  "Tim Hotel": ["Dewa K.", "Eka F."],
};

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
function todayYmd(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}
function rnd(max: number) {
  return Math.floor(Math.random() * max);
}

async function main() {
  if ((await db.select().from(season).limit(1)).length > 0) {
    console.log("[seed-liga] season sudah ada, skip.");
    return;
  }
  const today = todayYmd();

  const [s] = await db
    .insert(season)
    .values({ name: "Season I", year: 2025, status: "ACTIVE", startDate: addDays(today, -28) })
    .returning();

  const cats = await db
    .insert(category)
    .values([
      { name: "Upper Beginner Pria", gender: "PRIA", level: "Upper Beginner", hariLiga1: "Rabu", hariLiga2: "Senin", sortOrder: 1 },
      { name: "Upper Beginner Wanita", gender: "WANITA", level: "Upper Beginner", hariLiga1: "Kamis", hariLiga2: "Selasa", sortOrder: 2 },
      { name: "Bronze Pria", gender: "PRIA", level: "Bronze", hariLiga1: "Rabu", hariLiga2: "Senin", sortOrder: 3 },
      { name: "Bronze Wanita", gender: "WANITA", level: "Bronze", hariLiga1: "Kamis", hariLiga2: "Selasa", sortOrder: 4 },
    ])
    .returning();

  for (const cat of cats) {
    // Liga 1 + Liga 2 (Liga 2 dibiarkan kosong untuk demo toggle).
    const [l1] = await db
      .insert(league)
      .values({ seasonId: s.id, categoryId: cat.id, jenjang: 1 })
      .returning();
    await db.insert(league).values({ seasonId: s.id, categoryId: cat.id, jenjang: 2 });

    // 8 tim
    const teamRows = await db
      .insert(team)
      .values(
        TEAM_NAMES.map((name, i) => ({
          leagueId: l1.id,
          name,
          colorHex: COLORS[i],
          sortOrder: i + 1,
        })),
      )
      .returning();

    // pemain inti (2 per tim)
    const playerValues = teamRows.flatMap((t, i) => {
      const roster =
        cat.name === "Upper Beginner Pria"
          ? UBP_ROSTER[t.name]
          : [`Pemain ${t.name.replace("Tim ", "")} 1`, `Pemain ${t.name.replace("Tim ", "")} 2`];
      return roster.map((nm) => ({
        teamId: t.id,
        name: nm,
        position: "INTI" as const,
        photoUrl: avatarUrl(nm, COLORS[i].slice(1)),
      }));
    });
    await db.insert(player).values(playerValues);

    // jadwal round-robin
    const rounds = roundRobin(teamRows.map((t) => t.id));
    for (let r = 0; r < rounds.length; r++) {
      const roundNo = r + 1;
      // ronde 1-3 sudah selesai (lampau), 4 hari ini (1 LIVE), 5-7 mendatang
      const date = addDays(today, (roundNo - 4) * 7);
      let hour = 18;
      for (let p = 0; p < rounds[r].length; p++) {
        const [a, b] = rounds[r][p];
        let status: "SCHEDULED" | "LIVE" | "DONE" = "SCHEDULED";
        let scoreA = 0;
        let scoreB = 0;
        if (roundNo <= 3) status = "DONE";
        else if (roundNo === 4 && p === 0) status = "LIVE";

        const [mt] = await db
          .insert(match)
          .values({
            leagueId: l1.id,
            teamAId: a,
            teamBId: b,
            round: roundNo,
            date,
            startHour: hour,
            court: `Court ${(p % 4) + 1}`,
            status,
            scoreA: 0,
            scoreB: 0,
          })
          .returning();
        hour += 1;

        if (status === "DONE") {
          const aWins = rnd(2) === 0;
          scoreA = aWins ? 2 : rnd(2); // 2-0 atau 2-1
          scoreB = aWins ? rnd(2) : 2;
          if (scoreA === scoreB) scoreA = aWins ? 2 : scoreA; // jaga tak seri
          const games: { matchId: string; urutan: number; winner: string }[] = [];
          let ord = 1;
          for (let g = 0; g < scoreA; g++) games.push({ matchId: mt.id, urutan: ord++, winner: "A" });
          for (let g = 0; g < scoreB; g++) games.push({ matchId: mt.id, urutan: ord++, winner: "B" });
          await db.update(match).set({ scoreA, scoreB }).where(eq(match.id, mt.id));
          if (games.length) await db.insert(game).values(games);
        } else if (status === "LIVE") {
          // satu game sudah selesai (1-0) sebagai contoh live
          await db.update(match).set({ scoreA: 1, scoreB: 0 }).where(eq(match.id, mt.id));
          await db.insert(game).values({ matchId: mt.id, urutan: 1, winner: "A" });
        }
      }
    }
  }

  // Hall of Fame contoh
  await db.insert(hallOfFame).values([
    { seasonId: s.id, categoryId: cats[0].id, teamName: "Tim Alpha", award: "Champion", note: "Juara Upper Beginner Pria Liga 1" },
    { seasonId: s.id, categoryId: cats[0].id, teamName: "Andi R.", award: "MVP", note: "Pemain terbaik season" },
    { seasonId: s.id, categoryId: cats[1].id, teamName: "Tim Bravo", award: "Best Pair", note: "Pasangan terbaik" },
  ]);

  console.log("[seed-liga] selesai: season + 4 kategori + tim + jadwal + klasemen.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed-liga] gagal:", err);
    process.exit(1);
  });
