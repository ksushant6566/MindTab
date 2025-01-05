CREATE TABLE IF NOT EXISTS "mindmap_journal_habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" uuid NOT NULL,
	"habit_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mindmap_goal" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal_habits" ADD CONSTRAINT "mindmap_journal_habits_journal_id_mindmap_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."mindmap_journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal_habits" ADD CONSTRAINT "mindmap_journal_habits_habit_id_mindmap_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."mindmap_habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_habit_idx" ON "mindmap_journal_habits" USING btree ("journal_id","habit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_habits_journal_id_idx" ON "mindmap_journal_habits" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_habits_habit_id_idx" ON "mindmap_journal_habits" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_position_idx" ON "mindmap_goal" USING btree ("position");