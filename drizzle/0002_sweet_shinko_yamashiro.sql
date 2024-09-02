ALTER TABLE "mindmap_habit_tracker" RENAME COLUMN "habit_ids" TO "habit_id";--> statement-breakpoint
ALTER TABLE "mindmap_habit_tracker" DROP CONSTRAINT "mindmap_habit_tracker_habit_ids_mindmap_habit_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "habit_tracker_habit_id_user_id_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_habit_tracker" ADD CONSTRAINT "mindmap_habit_tracker_habit_id_mindmap_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."mindmap_habit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_tracker_habit_id_user_id_idx" ON "mindmap_habit_tracker" USING btree ("habit_id","user_id");