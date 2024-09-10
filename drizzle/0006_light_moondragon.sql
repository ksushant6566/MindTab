ALTER TABLE "mindmap_habit_tracker" DROP CONSTRAINT "mindmap_habit_tracker_habit_id_mindmap_habit_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_habit_tracker" ADD CONSTRAINT "mindmap_habit_tracker_habit_id_mindmap_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."mindmap_habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
