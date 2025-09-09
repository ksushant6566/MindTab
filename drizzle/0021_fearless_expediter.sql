ALTER TABLE "mindmap_journal" ADD COLUMN "project_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal" ADD CONSTRAINT "mindmap_journal_project_id_mindmap_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mindmap_project"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_project_id_idx" ON "mindmap_journal" USING btree ("project_id");