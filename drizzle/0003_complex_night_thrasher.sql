ALTER TYPE "goal_category" ADD VALUE 'personal';--> statement-breakpoint
ALTER TYPE "goal_category" ADD VALUE 'work';--> statement-breakpoint
ALTER TYPE "goal_priority" ADD VALUE 'priority_1';--> statement-breakpoint
ALTER TYPE "goal_priority" ADD VALUE 'priority_2';--> statement-breakpoint
ALTER TYPE "goal_priority" ADD VALUE 'priority_3';--> statement-breakpoint
ALTER TYPE "goal_priority" ADD VALUE 'priority_4';--> statement-breakpoint
ALTER TABLE "mindmap_goal" ALTER COLUMN "priority" DROP DEFAULT;