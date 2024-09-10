import { z } from "zod";

import { createInsertSchema } from "drizzle-zod";
import { habits } from "~/server/db/schema";

const ZInsertHabit = createInsertSchema(habits);

export const CreateHabitDto = ZInsertHabit.omit({ userId: true });

export const UpdateHabitDto = CreateHabitDto.partial().extend({
    id: z.string().uuid(),
});
