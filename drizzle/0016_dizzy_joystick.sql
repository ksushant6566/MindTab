DO $$ BEGIN
 CREATE TYPE "public"."journal_type" AS ENUM('article', 'book', 'video', 'podcast', 'website');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "mindmap_journal" ADD COLUMN "type" "journal_type" DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "mindmap_journal" ADD COLUMN "source" varchar(256) NOT NULL;