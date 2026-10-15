CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"admin_label" text NOT NULL,
	"singular" text NOT NULL,
	"color" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- The categories that were the poi_category enum, so existing places keep theirs.
INSERT INTO "categories" ("id", "slug", "label", "admin_label", "singular", "color", "sort_order") VALUES
	('restaurant', 'ristoranti', 'Ristoranti', 'Ristoranti', 'ristorante', '#e5775d', 1),
	('bnb', 'bnb', 'B&B', 'B&B', 'B&B', '#2f6e60', 2),
	('culture', 'cultura', 'Cultura', 'Luoghi culturali', 'luogo culturale', '#d39a2c', 3),
	('events', 'eventi', 'Eventi', 'Eventi', 'evento', '#4a6f99', 4)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
ALTER TABLE "pois" ALTER COLUMN "category" SET DATA TYPE text USING "category"::text;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
DROP TYPE "public"."poi_category";