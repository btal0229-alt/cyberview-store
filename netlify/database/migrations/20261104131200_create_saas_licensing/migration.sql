CREATE TABLE "saas_licenses" (
	"id" text PRIMARY KEY,
	"code_hash" text NOT NULL UNIQUE,
	"suffix" text NOT NULL,
	"plan_id" text NOT NULL,
	"expires_at" timestamp,
	"revoked" boolean DEFAULT false NOT NULL,
	"client_name" text DEFAULT '' NOT NULL,
	"claimed_by" text UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_stores" (
	"id" text PRIMARY KEY,
	"owner_id" text NOT NULL UNIQUE,
	"license_id" text NOT NULL UNIQUE,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saas_stores" ADD CONSTRAINT "saas_stores_license_id_saas_licenses_id_fkey" FOREIGN KEY ("license_id") REFERENCES "saas_licenses"("id");