CREATE TYPE "onepadel"."pos_order_status" AS ENUM('OPEN', 'PAID', 'VOID');--> statement-breakpoint
CREATE TYPE "onepadel"."pos_payment_method" AS ENUM('CASH', 'QRIS', 'TRANSFER', 'GATEWAY');--> statement-breakpoint
CREATE TYPE "onepadel"."product_category" AS ENUM('FNB', 'RETAIL', 'RENTAL', 'SERVICE');--> statement-breakpoint
CREATE TYPE "onepadel"."stock_movement_type" AS ENUM('SALE', 'RESTOCK', 'ADJUST');--> statement-breakpoint
CREATE TABLE "onepadel"."cash_shift" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"cashier_id" text,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"opening_cash" integer DEFAULT 0 NOT NULL,
	"closed_at" timestamp,
	"closing_cash" integer,
	"expected_cash" integer,
	"diff" integer,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "onepadel"."pos_order" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"code" text NOT NULL,
	"cashier_id" text,
	"booking_id" text,
	"booking_type" text,
	"customer_name" text,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"payment_method" "onepadel"."pos_payment_method" DEFAULT 'CASH' NOT NULL,
	"status" "onepadel"."pos_order_status" DEFAULT 'OPEN' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "pos_order_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "onepadel"."pos_order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"name_snapshot" text NOT NULL,
	"price_snapshot" integer NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"line_total" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."product" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"category" "onepadel"."product_category" DEFAULT 'FNB' NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"barcode" text,
	"price" integer NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"track_stock" boolean DEFAULT true NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onepadel"."stock_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"type" "onepadel"."stock_movement_type" NOT NULL,
	"qty" integer NOT NULL,
	"ref" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onepadel"."cash_shift" ADD CONSTRAINT "cash_shift_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "onepadel"."venue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."cash_shift" ADD CONSTRAINT "cash_shift_cashier_id_user_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "onepadel"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."pos_order" ADD CONSTRAINT "pos_order_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "onepadel"."venue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."pos_order" ADD CONSTRAINT "pos_order_cashier_id_user_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "onepadel"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."pos_order_item" ADD CONSTRAINT "pos_order_item_order_id_pos_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "onepadel"."pos_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."pos_order_item" ADD CONSTRAINT "pos_order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "onepadel"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."product" ADD CONSTRAINT "product_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "onepadel"."venue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onepadel"."stock_movement" ADD CONSTRAINT "stock_movement_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "onepadel"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cash_shift_venue_idx" ON "onepadel"."cash_shift" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "pos_order_venue_idx" ON "onepadel"."pos_order" USING btree ("venue_id","created_at");--> statement-breakpoint
CREATE INDEX "pos_order_booking_idx" ON "onepadel"."pos_order" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "pos_order_item_order_idx" ON "onepadel"."pos_order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "product_venue_idx" ON "onepadel"."product" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "product_barcode_idx" ON "onepadel"."product" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "stock_movement_product_idx" ON "onepadel"."stock_movement" USING btree ("product_id");