CREATE TABLE "activation_fulfillments" (
	"id" text PRIMARY KEY,
	"owner_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"order" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_keys" (
	"id" text PRIMARY KEY,
	"inventory_id" text NOT NULL,
	"code" text NOT NULL,
	"order_id" text,
	"assigned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_products" (
	"id" text PRIMARY KEY,
	"owner_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"product_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "activation_order_unique" ON "activation_fulfillments" ("owner_id","tenant_id","order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activation_code_unique" ON "activation_keys" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "activation_product_scope" ON "activation_products" ("owner_id","tenant_id","product_id");--> statement-breakpoint
ALTER TABLE "activation_keys" ADD CONSTRAINT "activation_keys_inventory_id_activation_products_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "activation_products"("id");