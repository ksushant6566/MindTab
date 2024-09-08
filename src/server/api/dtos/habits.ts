import { z } from 'zod'
import { habitFrequencyEnum } from '~/server/db/schema'

export const CreateHabitDto = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  frequency: z.enum(habitFrequencyEnum.enumValues),
})

export const UpdateHabitDto = CreateHabitDto.partial().extend({
  id: z.string().uuid(),
})
