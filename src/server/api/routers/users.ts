import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habitTracker, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { getStreak } from "~/lib/utils";

export const usersRouter = createTRPCRouter({
    getByEmail: protectedProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ ctx, input }) => {

            let result = await ctx.db
                .select()
                .from(users)
                .where(eq(users.email, input.email));

            if (result.length === 0) {
                return null;
            }
            const user = result[0]!
            return user;
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, input.id));

            if (result.length === 0) {
                return null;
            }

            const user = result[0]!;
            return user;
        }),
});

