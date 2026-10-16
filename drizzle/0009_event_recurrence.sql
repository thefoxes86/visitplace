ALTER TABLE "pois" ADD COLUMN "all_day" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pois" ADD COLUMN "recurrence" text;--> statement-breakpoint
ALTER TABLE "pois" ADD COLUMN "recurrence_until" timestamp;