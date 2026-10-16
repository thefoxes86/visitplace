ALTER TABLE "categories" ADD COLUMN "section" text;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_section_unique" UNIQUE("section");--> statement-breakpoint
-- The sections that were tied to these categories in code keep showing them.
UPDATE "categories" SET "section" = 'vivi' WHERE "id" = 'events';--> statement-breakpoint
UPDATE "categories" SET "section" = 'gusta' WHERE "id" = 'restaurant';--> statement-breakpoint
UPDATE "categories" SET "section" = 'dove-dormire' WHERE "id" = 'bnb';
