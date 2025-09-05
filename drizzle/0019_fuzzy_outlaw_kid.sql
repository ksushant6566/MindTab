DO $$ BEGIN
 CREATE TYPE "public"."project_status" AS ENUM('active', 'paused', 'completed', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "goal_status" ADD VALUE 'archived';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_project_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256),
	"description" text,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" varchar(255) NOT NULL,
	"last_updated_by" varchar(255) NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_project_goals" ADD CONSTRAINT "mindmap_project_goals_project_id_mindmap_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mindmap_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_project_goals" ADD CONSTRAINT "mindmap_project_goals_goal_id_mindmap_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."mindmap_goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_project" ADD CONSTRAINT "mindmap_project_created_by_mindmap_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_project" ADD CONSTRAINT "mindmap_project_last_updated_by_mindmap_user_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_goals_project_id_idx" ON "mindmap_project_goals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_goals_goal_id_idx" ON "mindmap_project_goals" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_created_by_idx" ON "mindmap_project" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_last_updated_by_idx" ON "mindmap_project" USING btree ("last_updated_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_status_idx" ON "mindmap_project" USING btree ("status");