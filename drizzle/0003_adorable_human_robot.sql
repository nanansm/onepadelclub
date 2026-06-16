CREATE TYPE "onepadel"."membership_status" AS ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "onepadel"."open_play_status" AS ENUM('OPEN', 'FULL', 'CANCELLED', 'DONE');--> statement-breakpoint
CREATE TABLE "onepadel"."coach" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"bio" text,
	"rate_per_hour" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."coaching_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"coach_id" text NOT NULL,
	"court_id" text,
	"customer_name" text NOT NULL,
	"customer_wa" text NOT NULL,
	"date" date NOT NULL,
	"start_hour" integer NOT NULL,
	"duration" integer NOT NULL,
	"total_price" integer NOT NULL,
	"status" "onepadel"."booking_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coaching_booking_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "onepadel"."membership" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"plan_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_wa" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" "onepadel"."membership_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "onepadel"."membership_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"duration_days" integer DEFAULT 30 NOT NULL,
	"benefits" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."open_play_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"session_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_wa" text NOT NULL,
	"status" "onepadel"."booking_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "open_play_registration_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "onepadel"."open_play_session" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"court_id" text,
	"title" text NOT NULL,
	"level" text DEFAULT 'Mixed' NOT NULL,
	"date" date NOT NULL,
	"start_hour" integer NOT NULL,
	"duration" integer NOT NULL,
	"max_players" integer NOT NULL,
	"price_per_player" integer NOT NULL,
	"status" "onepadel"."open_play_status" DEFAULT 'OPEN' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onepadel"."coaching_booking" ADD CONSTRAINT "coaching_booking_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "onepadel"."coach"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."coaching_booking" ADD CONSTRAINT "coaching_booking_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "onepadel"."court"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."membership" ADD CONSTRAINT "membership_plan_id_membership_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "onepadel"."membership_plan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."open_play_registration" ADD CONSTRAINT "open_play_registration_session_id_open_play_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "onepadel"."open_play_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."open_play_session" ADD CONSTRAINT "open_play_session_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "onepadel"."venue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."open_play_session" ADD CONSTRAINT "open_play_session_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "onepadel"."court"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coaching_coach_date_idx" ON "onepadel"."coaching_booking" USING btree ("coach_id","date");--> statement-breakpoint
CREATE INDEX "membership_plan_idx" ON "onepadel"."membership" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "open_play_reg_session_idx" ON "onepadel"."open_play_registration" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "open_play_court_date_idx" ON "onepadel"."open_play_session" USING btree ("court_id","date");