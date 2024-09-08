import { z } from 'zod'
import { habitTrackerStatusEnum } from '~/server/db/schema'

export const CreateHabitTrackerDto = z.object({
  habitId: z.string().uuid(),
  status: z.enum(habitTrackerStatusEnum.enumValues),
})

export const UpdateHabitTrackerDto = CreateHabitTrackerDto.partial().extend({
  id: z.string().uuid(),
})
