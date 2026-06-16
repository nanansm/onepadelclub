import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  category,
  hallOfFame,
  league,
  match,
  player,
  season,
  team,
  type Team,
} from "@/db/schema";

export const POINTS = { WIN: 3, LOSS: 0, WO: -1 };

export type StandingRow = {
  teamId: string;
  team: Team;
  main: number;
  menang: number;
  kalah: number;
  wo: number;
  gameMenang: number;
  gameKalah: number;
  selisih: number;
  poin: number;
};

// Klasemen DIHITUNG saat dibaca dari hasil match (DONE/WO) — bukan cache.
// Liga kecil (8 tim / 28 match) jadi murah; hilangkan kelas bug cache/split-brain.
export async function computeStandings(leagueId: string): Promise<StandingRow[]> {
  const [teams, matches] = await Promise.all([
    db.select().from(team).where(eq(team.leagueId, leagueId)),
    db
      .select()
      .from(match)
      .where(and(eq(match.leagueId, leagueId), inArray(match.status, ["DONE", "WO"]))),
  ]);

  type Acc = {
    main: number; menang: number; kalah: number; wo: number;
    gm: number; gk: number; poin: number;
  };
  const acc = new Map<string, Acc>();
  for (const t of teams)
    acc.set(t.id, { main: 0, menang: 0, kalah: 0, wo: 0, gm: 0, gk: 0, poin: 0 });

  for (const m of matches) {
    const a = acc.get(m.teamAId);
    const b = acc.get(m.teamBId);
    if (!a || !b) continue;
    a.main += 1;
    b.main += 1;

    if (m.status === "WO" && m.woTeamId) {
      // Walkover: tak ada game dimainkan -> tak hitung GM/GK.
      const loser = m.woTeamId === m.teamAId ? a : b;
      const winner = m.woTeamId === m.teamAId ? b : a;
      winner.menang += 1; winner.poin += POINTS.WIN;
      loser.kalah += 1; loser.wo += 1; loser.poin += POINTS.WO;
    } else {
      a.gm += m.scoreA; a.gk += m.scoreB;
      b.gm += m.scoreB; b.gk += m.scoreA;
      if (m.scoreA > m.scoreB) {
        a.menang += 1; a.poin += POINTS.WIN; b.kalah += 1;
      } else if (m.scoreB > m.scoreA) {
        b.menang += 1; b.poin += POINTS.WIN; a.kalah += 1;
      }
    }
  }

  return teams
    .map((t) => {
      const x = acc.get(t.id)!;
      return {
        teamId: t.id,
        team: t,
        main: x.main,
        menang: x.menang,
        kalah: x.kalah,
        wo: x.wo,
        gameMenang: x.gm,
        gameKalah: x.gk,
        selisih: x.gm - x.gk,
        poin: x.poin,
      };
    })
    .sort(sortStandings);
}

// Round-robin circle method: n tim genap -> n-1 ronde, tiap tim vs semua 1x.
export function roundRobin(ids: string[]): [string, string][][] {
  const arr = [...ids];
  const n = arr.length;
  const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) pairs.push([arr[i], arr[n - 1 - i]]);
    rounds.push(pairs);
    arr.splice(1, 0, arr.pop()!);
  }
  return rounds;
}

// Urutan klasemen: poin > selisih game > game menang > WO paling sedikit.
export function sortStandings<
  T extends { poin: number; selisih: number; gameMenang: number; wo: number },
>(a: T, b: T): number {
  return (
    b.poin - a.poin ||
    b.selisih - a.selisih ||
    b.gameMenang - a.gameMenang ||
    a.wo - b.wo
  );
}

// ---- queries ----
export async function getActiveSeason() {
  const rows = await db
    .select()
    .from(season)
    .where(eq(season.status, "ACTIVE"))
    .limit(1);
  return rows[0] ?? (await db.select().from(season).limit(1))[0] ?? null;
}

export async function getCategories() {
  return db.select().from(category).orderBy(asc(category.sortOrder), asc(category.name));
}

// Daftar liga + label "Kategori · Liga N" untuk selector admin.
export async function getLeaguesWithLabels() {
  const active = await getActiveSeason();
  if (!active) return [];
  const rows = await db
    .select({
      id: league.id,
      jenjang: league.jenjang,
      categoryId: category.id,
      catName: category.name,
      sortOrder: category.sortOrder,
    })
    .from(league)
    .innerJoin(category, eq(league.categoryId, category.id))
    .where(eq(league.seasonId, active.id))
    .orderBy(asc(category.sortOrder), asc(league.jenjang));
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.categoryId,
    jenjang: r.jenjang,
    label: `${r.catName} · Liga ${r.jenjang}`,
  }));
}

export async function getLeague(
  categoryId: string,
  jenjang: number,
  seasonId?: string,
) {
  // Tanpa seasonId, default ke season aktif (hindari ambil liga season lama).
  let sid = seasonId;
  if (!sid) {
    const s = await getActiveSeason();
    if (!s) return null;
    sid = s.id;
  }
  const rows = await db
    .select()
    .from(league)
    .where(
      and(
        eq(league.categoryId, categoryId),
        eq(league.jenjang, jenjang),
        eq(league.seasonId, sid),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

// Alias: klasemen dihitung on-read.
export const getStandingsByLeague = computeStandings;

// Semua kategori + standings Liga 1 & 2 (untuk halaman klasemen).
export async function getKlasemenData() {
  const [cats, active] = await Promise.all([getCategories(), getActiveSeason()]);
  if (!active) return [];
  return Promise.all(
    cats.map(async (c) => {
      const [l1, l2] = await Promise.all([
        getLeague(c.id, 1, active.id),
        getLeague(c.id, 2, active.id),
      ]);
      const [liga1, liga2] = await Promise.all([
        l1 ? getStandingsByLeague(l1.id) : Promise.resolve([]),
        l2 ? getStandingsByLeague(l2.id) : Promise.resolve([]),
      ]);
      return { category: c, liga1, liga2 };
    }),
  );
}

export async function getMatchesByLeague(leagueId: string) {
  return db
    .select()
    .from(match)
    .where(eq(match.leagueId, leagueId))
    .orderBy(asc(match.date), asc(match.startHour));
}

export async function getTeamsByLeague(leagueId: string) {
  return db.select().from(team).where(eq(team.leagueId, leagueId)).orderBy(asc(team.name));
}

export async function getTeamWithPlayers(teamId: string) {
  const t = (await db.select().from(team).where(eq(team.id, teamId)).limit(1))[0];
  if (!t) return null;
  const [players, table] = await Promise.all([
    db
      .select()
      .from(player)
      .where(eq(player.teamId, teamId))
      .orderBy(asc(player.position), asc(player.name)),
    computeStandings(t.leagueId),
  ]);
  const standing = table.find((s) => s.teamId === teamId) ?? null;
  return { team: t, players, standing };
}

export async function getPlayerById(playerId: string) {
  const p = (await db.select().from(player).where(eq(player.id, playerId)).limit(1))[0];
  if (!p) return null;
  const t = (await db.select().from(team).where(eq(team.id, p.teamId)).limit(1))[0];
  return { player: p, team: t ?? null };
}

export async function getHallOfFame() {
  return db.select().from(hallOfFame).orderBy(desc(hallOfFame.id));
}

type MatchRow = {
  id: string;
  date: string | null;
  startHour: number | null;
  court: string | null;
  status: string;
  scoreA: number;
  scoreB: number;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  catName?: string;
};

function selectMatchWithTeams() {
  const ta = alias(team, "ta");
  const tb = alias(team, "tb");
  return { ta, tb };
}

export async function getMatchesWithTeams(leagueId: string): Promise<MatchRow[]> {
  const { ta, tb } = selectMatchWithTeams();
  const rows = await db
    .select({
      id: match.id, date: match.date, startHour: match.startHour, court: match.court,
      status: match.status, scoreA: match.scoreA, scoreB: match.scoreB,
      teamAId: match.teamAId, teamBId: match.teamBId,
      teamAName: ta.name, teamBName: tb.name,
    })
    .from(match)
    .innerJoin(ta, eq(match.teamAId, ta.id))
    .innerJoin(tb, eq(match.teamBId, tb.id))
    .where(eq(match.leagueId, leagueId))
    .orderBy(asc(match.date), asc(match.startHour));
  return rows;
}

// Jadwal per kategori (Liga 1).
export async function getJadwalData() {
  const [cats, active] = await Promise.all([getCategories(), getActiveSeason()]);
  if (!active) return [];
  return Promise.all(
    cats.map(async (c) => {
      const l1 = await getLeague(c.id, 1, active.id);
      return {
        category: c,
        matches: l1 ? await getMatchesWithTeams(l1.id) : [],
      };
    }),
  );
}

export async function getLiveMatchesWithTeams(): Promise<MatchRow[]> {
  const { ta, tb } = selectMatchWithTeams();
  const rows = await db
    .select({
      id: match.id, date: match.date, startHour: match.startHour, court: match.court,
      status: match.status, scoreA: match.scoreA, scoreB: match.scoreB,
      teamAId: match.teamAId, teamBId: match.teamBId,
      teamAName: ta.name, teamBName: tb.name,
      catName: category.name,
    })
    .from(match)
    .innerJoin(ta, eq(match.teamAId, ta.id))
    .innerJoin(tb, eq(match.teamBId, tb.id))
    .innerJoin(league, eq(match.leagueId, league.id))
    .innerJoin(category, eq(league.categoryId, category.id))
    .where(eq(match.status, "LIVE"));
  return rows;
}

// Riwayat 5 match (DONE) terakhir sebuah tim — filter di SQL, bukan load semua.
export async function getTeamRecentMatches(teamId: string, leagueId: string) {
  const { ta, tb } = selectMatchWithTeams();
  return db
    .select({
      id: match.id, date: match.date, startHour: match.startHour, court: match.court,
      status: match.status, scoreA: match.scoreA, scoreB: match.scoreB,
      teamAId: match.teamAId, teamBId: match.teamBId,
      teamAName: ta.name, teamBName: tb.name,
    })
    .from(match)
    .innerJoin(ta, eq(match.teamAId, ta.id))
    .innerJoin(tb, eq(match.teamBId, tb.id))
    .where(
      and(
        eq(match.leagueId, leagueId),
        eq(match.status, "DONE"),
        or(eq(match.teamAId, teamId), eq(match.teamBId, teamId)),
      ),
    )
    .orderBy(desc(match.date), desc(match.startHour))
    .limit(5);
}
