ALTER TABLE "pois" ADD COLUMN "show_on_map" boolean DEFAULT true NOT NULL;--> statement-breakpoint
-- Recipes, typical products and events have no place on the tourist map.
UPDATE "pois" SET "show_on_map" = false WHERE "category" IN (SELECT "id" FROM "categories" WHERE "type" IN ('recipe', 'product', 'event'));
