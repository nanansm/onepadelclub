ALTER TABLE "onepadel"."venue" ADD COLUMN "tiktok" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "hero_badge" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "hero_headline" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "hero_subcopy" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "liga_headline" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "liga_body" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "schemes" jsonb;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "rules" jsonb;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "hero_image_url" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "brand_primary" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "brand_accent" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "brand_cream" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "og_image_url" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "min_duration" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "max_duration" integer DEFAULT 6 NOT NULL;