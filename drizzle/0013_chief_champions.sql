CREATE TABLE IF NOT EXISTS "mindmap_journal_goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mindmap_journal" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal_goal" ADD CONSTRAINT "mindmap_journal_goal_journal_id_mindmap_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."mindmap_journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal_goal" ADD CONSTRAINT "mindmap_journal_goal_goal_id_mindmap_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."mindmap_goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_goal_journal_id_idx" ON "mindmap_journal_goal" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_goal_goal_id_idx" ON "mindmap_journal_goal" USING btree ("goal_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_goal_idx" ON "mindmap_journal_goal" USING btree ("journal_id","goal_id");