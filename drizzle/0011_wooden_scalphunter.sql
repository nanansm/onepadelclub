ALTER TABLE "onepadel"."court_booking" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "notif_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "notify_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_host" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_port" integer;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_secure" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_user" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_password" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_from_name" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "smtp_from_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."coaching_booking" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."membership" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."open_play_registration" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."team_registration" ADD COLUMN "captain_email" text;