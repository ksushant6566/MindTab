DROP INDEX IF EXISTS "habit_tracker_habit_id_user_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "habit_tracker_habit_id_user_id_date_idx" ON "mindmap_habit_tracker" USING btree ("habit_id","user_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_tracker_habit_id_user_id_idx" ON "mindmap_habit_tracker" USING btree ("habit_id","user_id");