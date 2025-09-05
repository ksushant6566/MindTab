import { z } from "zod";
import {
    goalImpactEnum,
    goalPriorityEnum,
    goalStatusEnum,
    goalCategoryEnum,
    goalTypeEnum,
} from "~/server/db/schema";

import { createInsertSchema } from "drizzle-zod";
import { goals } from "~/server/db/schema";

const ZInsertGoal = createInsertSchema(goals);

export const CreateGoalDto = ZInsertGoal.omit({ userId: true });

// z.object({
//   title: z.string().min(1),
//   description: z.string().optional(),
//   priority: z.enum(goalPriorityEnum.enumValues),
//   impact: z.enum(goalImpactEnum.enumValues),
//   category: z.enum(goalCategoryEnum.enumValues),
//   type: z.enum(goalTypeEnum.enumValues),
// });

export const UpdateGoalDto = CreateGoalDto.partial().extend({
    id: z.string().uuid(),
    status: z.enum(goalStatusEnum.enumValues).optional(),
    description: z.string().optional(),
    title: z.string().optional(),
    priority: z.enum(goalPriorityEnum.enumValues).optional(),
    impact: z.enum(goalImpactEnum.enumValues).optional(),
    category: z.enum(goalCategoryEnum.enumValues).optional(),
    type: z.enum(goalTypeEnum.enumValues).optional(),
});

export const UpdateGoalPositionDto = z.object({
    id: z.string().uuid(),
    position: z.number(),
    status: z.enum(goalStatusEnum.enumValues).optional(),
});

export const UpdateGoalPositionsDto = z.object({
    goals: z.array(UpdateGoalPositionDto),
    sequence: z.number(),
});

export const GetGoalsDto = z
    .object({
        userId: z.string().optional(),
        projectId: z.string().uuid().optional(),
        includeArchived: z.boolean().default(false).optional(),
    })
    .optional();
