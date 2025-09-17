ALTER TABLE "mindmap_goal" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mindmap_goal" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "mindmap_goal" DROP COLUMN IF EXISTS "type";