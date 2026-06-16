CREATE TYPE "onepadel"."liga_gender" AS ENUM('PRIA', 'WANITA');--> statement-breakpoint
CREATE TYPE "onepadel"."match_status" AS ENUM('SCHEDULED', 'LIVE', 'DONE', 'WO');--> statement-breakpoint
CREATE TYPE "onepadel"."player_position" AS ENUM('INTI', 'CADANGAN');--> statement-breakpoint
CREATE TYPE "onepadel"."season_status" AS ENUM('ACTIVE', 'CLOSED');--> statement-breakpoint
CREATE TABLE "onepadel"."category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gender" "onepadel"."liga_gender" NOT NULL,
	"level" text NOT NULL,
	"hari_liga1" text,
	"hari_liga2" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."game" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"urutan" integer NOT NULL,
	"winner" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "onepadel"."hall_of_fame" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"category_id" text,
	"team_name" text NOT NULL,
	"award" text NOT NULL,
	"photo_url" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "onepadel"."league" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"category_id" text NOT NULL,
	"jenjang" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."match" (
	"id" text PRIMARY KEY NOT NULL,
	"league_id" text NOT NULL,
	"team_a_id" text NOT NULL,
	"team_b_id" text NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"date" text,
	"start_hour" integer,
	"court" text,
	"status" "onepadel"."match_status" DEFAULT 'SCHEDULED' NOT NULL,
	"score_a" integer DEFAULT 0 NOT NULL,
	"score_b" integer DEFAULT 0 NOT NULL,
	"wo_team_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."player" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"position" "onepadel"."player_position" DEFAULT 'INTI' NOT NULL,
	"no_hp" text
);
--> statement-breakpoint
CREATE TABLE "onepadel"."season" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"status" "onepadel"."season_status" DEFAULT 'ACTIVE' NOT NULL,
	"start_date" text,
	"end_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."standings" (
	"id" text PRIMARY KEY NOT NULL,
	"league_id" text NOT NULL,
	"team_id" text NOT NULL,
	"main" integer DEFAULT 0 NOT NULL,
	"menang" integer DEFAULT 0 NOT NULL,
	"kalah" integer DEFAULT 0 NOT NULL,
	"wo" integer DEFAULT 0 NOT NULL,
	"game_menang" integer DEFAULT 0 NOT NULL,
	"game_kalah" integer DEFAULT 0 NOT NULL,
	"selisih" integer DEFAULT 0 NOT NULL,
	"poin" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."team" (
	"id" text PRIMARY KEY NOT NULL,
	"league_id" text NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"color_hex" text DEFAULT '#1a4d33',
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onepadel"."game" ADD CONSTRAINT "game_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "onepadel"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."hall_of_fame" ADD CONSTRAINT "hall_of_fame_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "onepadel"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."hall_of_fame" ADD CONSTRAINT "hall_of_fame_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "onepadel"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."league" ADD CONSTRAINT "league_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "onepadel"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."league" ADD CONSTRAINT "league_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "onepadel"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."match" ADD CONSTRAINT "match_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "onepadel"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."match" ADD CONSTRAINT "match_team_a_id_team_id_fk" FOREIGN KEY ("team_a_id") REFERENCES "onepadel"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."match" ADD CONSTRAINT "match_team_b_id_team_id_fk" FOREIGN KEY ("team_b_id") REFERENCES "onepadel"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."player" ADD CONSTRAINT "player_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "onepadel"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."standings" ADD CONSTRAINT "standings_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "onepadel"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."standings" ADD CONSTRAINT "standings_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "onepadel"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."team" ADD CONSTRAINT "team_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "onepadel"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_match_idx" ON "onepadel"."game" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "league_cat_idx" ON "onepadel"."league" USING btree ("category_id","jenjang");--> statement-breakpoint
CREATE INDEX "match_league_idx" ON "onepadel"."match" USING btree ("league_id","date");--> statement-breakpoint
CREATE INDEX "player_team_idx" ON "onepadel"."player" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "standings_team_uq" ON "onepadel"."standings" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_league_idx" ON "onepadel"."team" USING btree ("league_id");