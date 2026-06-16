CREATE TYPE "onepadel"."booking_status" AS ENUM('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "onepadel"."court_type" AS ENUM('INDOOR', 'OUTDOOR');--> statement-breakpoint
CREATE TABLE "onepadel"."court" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "onepadel"."court_type" DEFAULT 'INDOOR' NOT NULL,
	"price_per_hour" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."court_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"court_id" text NOT NULL,
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
	CONSTRAINT "court_booking_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "onepadel"."venue" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text,
	"whatsapp" text,
	"open_hour" integer DEFAULT 7 NOT NULL,
	"close_hour" integer DEFAULT 23 NOT NULL,
	"bank_name" text,
	"bank_number" text,
	"bank_holder" text,
	"qris_url" text,
	"payment_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "venue_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "onepadel"."court" ADD CONSTRAINT "court_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "onepadel"."venue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."court_booking" ADD CONSTRAINT "court_booking_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "onepadel"."court"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "court_venue_idx" ON "onepadel"."court" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "court_booking_court_date_idx" ON "onepadel"."court_booking" USING btree ("court_id","date");