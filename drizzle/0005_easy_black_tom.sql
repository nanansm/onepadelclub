DROP INDEX "onepadel"."standings_team_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "standings_league_team_uq" ON "onepadel"."standings" USING btree ("league_id","team_id");