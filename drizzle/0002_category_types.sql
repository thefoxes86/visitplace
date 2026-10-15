ALTER TABLE "categories" ADD COLUMN "type" text DEFAULT 'place' NOT NULL;--> statement-breakpoint
ALTER TABLE "pois" ADD COLUMN "details" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
-- Types of the categories created by 0001_categories.
UPDATE "categories" SET "type" = 'restaurant' WHERE "id" = 'restaurant';--> statement-breakpoint
UPDATE "categories" SET "type" = 'bnb' WHERE "id" = 'bnb';--> statement-breakpoint
UPDATE "categories" SET "type" = 'event' WHERE "id" = 'events';
