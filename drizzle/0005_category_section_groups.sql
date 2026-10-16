ALTER TABLE "categories" DROP CONSTRAINT "categories_section_unique";--> statement-breakpoint
-- Sections now group several top-level categories; "Dove dormire" is gone.
UPDATE "categories" SET "section" = 'vivi' WHERE "section" = 'dove-dormire';--> statement-breakpoint
UPDATE "categories" SET "section" = 'scopri' WHERE "parent_id" IS NULL AND "section" IS NULL;--> statement-breakpoint
UPDATE "categories" SET "section" = NULL WHERE "parent_id" IS NOT NULL;
