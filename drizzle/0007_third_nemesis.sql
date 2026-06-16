CREATE TABLE "onepadel"."audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_email" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"detail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
