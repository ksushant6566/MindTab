import { z } from 'zod'

export const CreateJournalDto = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export const UpdateJournalDto = CreateJournalDto.partial().extend({
  id: z.string().uuid(),
})
