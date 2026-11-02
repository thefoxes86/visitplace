ALTER TABLE "itineraries" ADD COLUMN "modes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "itineraries" ADD COLUMN "season" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "itineraries" ADD COLUMN "kid_friendly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "itineraries" ADD COLUMN "pet_friendly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- The single way of travelling becomes the first of the list.
UPDATE "itineraries" SET "modes" = jsonb_build_array("mode") WHERE "modes" = '[]'::jsonb;
