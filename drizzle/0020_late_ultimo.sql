ALTER TABLE "onepadel"."court_booking" ADD COLUMN "reminder_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "wa_template_reminder" text;