ALTER TABLE "pois" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "pois" ADD COLUMN "track" jsonb;