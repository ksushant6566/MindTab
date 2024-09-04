import { z } from "zod";
import {
  goalPriorityEnum,
  goalImpactEnum,
  goalCategoryEnum,
  goalTypeEnum,
  goalStatusEnum,
} from "~/server/db/schema";

export const CreateGoalDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(goalPriorityEnum.enumValues),
  impact: z.enum(goalImpactEnum.enumValues),
  category: z.enum(goalCategoryEnum.enumValues),
  type: z.enum(goalTypeEnum.enumValues),
});

export const UpdateGoalDto = CreateGoalDto.partial().extend({
  id: z.string().uuid(),
  status: z.enum(goalStatusEnum.enumValues),
});
