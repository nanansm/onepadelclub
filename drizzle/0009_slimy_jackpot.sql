CREATE TYPE "onepadel"."team_reg_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "onepadel"."team_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"category_id" text,
	"category_label" text,
	"player1_name" text NOT NULL,
	"player2_name" text NOT NULL,
	"captain_wa" text NOT NULL,
	"note" text,
	"status" "onepadel"."team_reg_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "onepadel"."court_booking" ADD COLUMN "source" text DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "hold_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."team_registration" ADD CONSTRAINT "team_registration_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "onepadel"."category"("id") ON DELETE set null ON UPDATE no action;