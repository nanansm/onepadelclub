ALTER TABLE "onepadel"."venue" ADD COLUMN "liga_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "pos_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "tax_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "payment_mode" text DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "wa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "evo_base_url" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "evo_instance" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "evo_api_key" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "gateway_provider" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "gateway_server_key" text;--> statement-breakpoint
ALTER TABLE "onepadel"."venue" ADD COLUMN "gateway_client_key" text;