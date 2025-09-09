import { z } from "zod";

export const CreateJournalDto = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    projectId: z.string().uuid().nullable().optional(),
});

export const UpdateJournalDto = CreateJournalDto.partial().extend({
    id: z.string().uuid(),
});
