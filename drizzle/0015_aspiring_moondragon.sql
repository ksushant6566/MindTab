ALTER TABLE "mindmap_goal" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mindmap_user" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;