import { index, integer, text, timestamp } from "drizzle-orm/pg-core";
import { onepadel } from "./_base";

export const gender = onepadel.enum("liga_gender", ["PRIA", "WANITA"]);
export const seasonStatus = onepadel.enum("season_status", ["ACTIVE", "CLOSED"]);
export const matchStatus = onepadel.enum("match_status", [
  "SCHEDULED",
  "LIVE",
  "DONE",
  "WO",
]);
export const playerPosition = onepadel.enum("player_position", ["INTI", "CADANGAN"]);

export const season = onepadel.table("season", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  status: seasonStatus("status").notNull().default("ACTIVE"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const category = onepadel.table("category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  gender: gender("gender").notNull(),
  level: text("level").notNull(),
  hariLiga1: text("hari_liga1"),
  hariLiga2: text("hari_liga2"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const league = onepadel.table(
  "league",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => season.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    jenjang: integer("jenjang").notNull().default(1),
  },
  (t) => [index("league_cat_idx").on(t.categoryId, t.jenjang)],
);

export const team = onepadel.table(
  "team",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    leagueId: text("league_id")
      .notNull()
      .references(() => league.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    colorHex: text("color_hex").default("#1a4d33"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("team_league_idx").on(t.leagueId)],
);

export const player = onepadel.table(
  "player",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    position: playerPosition("position").notNull().default("INTI"),
    noHp: text("no_hp"),
  },
  (t) => [index("player_team_idx").on(t.teamId)],
);

export const match = onepadel.table(
  "match",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    leagueId: text("league_id")
      .notNull()
      .references(() => league.id, { onDelete: "cascade" }),
    teamAId: text("team_a_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    teamBId: text("team_b_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    round: integer("round").notNull().default(1),
    date: text("date"),
    startHour: integer("start_hour"),
    court: text("court"),
    status: matchStatus("status").notNull().default("SCHEDULED"),
    scoreA: integer("score_a").notNull().default(0),
    scoreB: integer("score_b").notNull().default(0),
    woTeamId: text("wo_team_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("match_league_idx").on(t.leagueId, t.date)],
);

export const game = onepadel.table(
  "game",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id, { onDelete: "cascade" }),
    urutan: integer("urutan").notNull(),
    winner: text("winner").notNull(), // "A" | "B"
    note: text("note"),
  },
  (t) => [index("game_match_idx").on(t.matchId)],
);

// Klasemen TIDAK disimpan — dihitung on-read di lib/liga.computeStandings().

export const hallOfFame = onepadel.table("hall_of_fame", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  seasonId: text("season_id")
    .notNull()
    .references(() => season.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  teamName: text("team_name").notNull(),
  award: text("award").notNull(),
  photoUrl: text("photo_url"),
  note: text("note"),
});

export type Season = typeof season.$inferSelect;
export type Category = typeof category.$inferSelect;
export type League = typeof league.$inferSelect;
export type Team = typeof team.$inferSelect;
export type Player = typeof player.$inferSelect;
export type Match = typeof match.$inferSelect;
export type HallOfFame = typeof hallOfFame.$inferSelect;
