DO $$ BEGIN
 CREATE TYPE "public"."goal_category" AS ENUM('health', 'finance', 'career', 'relationships', 'personal_growth');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."goal_impact" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."goal_priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."goal_status" AS ENUM('pending', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."goal_type" AS ENUM('one_time', 'daily', 'weekly', 'monthly', 'yearly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'weekly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."habit_tracker" AS ENUM('daily', 'weekly', 'monthly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."habit_tracker_status" AS ENUM('pending', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256),
	"description" text,
	"status" "goal_status" DEFAULT 'pending' NOT NULL,
	"priority" "goal_priority" DEFAULT 'medium' NOT NULL,
	"impact" "goal_impact" DEFAULT 'medium' NOT NULL,
	"category" "goal_category" DEFAULT 'health' NOT NULL,
	"type" "goal_type" DEFAULT 'one_time' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_habit_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_ids" uuid NOT NULL,
	"status" "habit_tracker_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_habit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256),
	"description" text,
	"frequency" "habit_frequency" DEFAULT 'daily' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindmap_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256),
	"content" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
DROP TABLE "mindmap_post";--> statement-breakpoint
ALTER TABLE "mindmap_user" ADD COLUMN "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "mindmap_user" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_goal" ADD CONSTRAINT "mindmap_goal_user_id_mindmap_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_habit_tracker" ADD CONSTRAINT "mindmap_habit_tracker_habit_ids_mindmap_habit_id_fk" FOREIGN KEY ("habit_ids") REFERENCES "public"."mindmap_habit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_habit_tracker" ADD CONSTRAINT "mindmap_habit_tracker_user_id_mindmap_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_habit" ADD CONSTRAINT "mindmap_habit_user_id_mindmap_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mindmap_journal" ADD CONSTRAINT "mindmap_journal_user_id_mindmap_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mindmap_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "goal_title_user_id_unique_idx" ON "mindmap_goal" USING btree ("user_id","title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_user_id_idx" ON "mindmap_goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_tracker_habit_id_user_id_idx" ON "mindmap_habit_tracker" USING btree ("habit_ids","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "habit_title_user_id_unique_idx" ON "mindmap_habit" USING btree ("user_id","title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_user_id_idx" ON "mindmap_habit" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_title_user_id_unique_idx" ON "mindmap_journal" USING btree ("user_id","title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_user_id_idx" ON "mindmap_journal" USING btree ("user_id");