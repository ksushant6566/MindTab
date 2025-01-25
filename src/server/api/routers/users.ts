import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
    getByEmail: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ ctx, input }) => {

            return await ctx.db
                .select()
                .from(users)
                .where(eq(users.email, input.email));
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, input.id));
        }),
}); 